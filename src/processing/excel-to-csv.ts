import fs from "node:fs";
import path from "node:path";
import * as xlsx from "xlsx";

function isEmptyCell(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === "string") return value.trim().length === 0;
    return false;
}

function sanitizeSheetName(name: string): string {
    const trimmed = name.trim();
    if (trimmed.length === 0) return "sheet";
    return trimmed.replace(/[\\/:*?"<>|]/g, "_");
}

function normalizeHeaderValue(value: unknown): string {
    const raw = String(value ?? "").trim();
    if (raw.length === 0) return "";

    const parts = raw
        .replace(/[^A-Za-z0-9]+/g, " ")
        .trim()
        .split(/\s+/);

    if (parts.length === 0) return "";

    const [first, ...rest] = parts;
    const firstPart = first.toLowerCase();
    const restParts = rest.map((part) => {
        if (/^[A-Z0-9]{2,}$/.test(part)) {
            return part.toUpperCase();
        }
        const lower = part.toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
    });

    return [firstPart, ...restParts].join("");
}

function serializeTsvRow(values: unknown[]): string {
    return values
        .map((value) => {
            const text = value === null || value === undefined ? "" : String(value);
            const escaped = text.replace(/"/g, "\"\"");
            if (/[\"\t\r\n]/.test(escaped)) {
                return `"${escaped}"`;
            }
            return escaped;
        })
        .join("\t");
}

export async function processExcelFile(inputPath: string, outputDir: string) {
    const workbookFile = Bun.file(inputPath)
    const workbookData = await workbookFile.arrayBuffer()
    const workbook = xlsx.read(workbookData);
    fs.mkdirSync(outputDir, { recursive: true });

    for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) continue;

        const rows = xlsx.utils.sheet_to_json(worksheet, {
            header: 1,
            raw: false,
            defval: "",
        }) as unknown[][];

        const headerRowIndex = rows.findIndex((row) => row.some((cell) => !isEmptyCell(cell)));
        if (headerRowIndex === -1) continue;

        const headerRow = rows[headerRowIndex] ?? [];
        const firstColIndex = headerRow.findIndex((cell) => !isEmptyCell(cell));
        if (firstColIndex === -1) continue;

        const headerValues: unknown[] = [];
        for (let col = firstColIndex; col < headerRow.length; col += 1) {
            const cell = headerRow[col];
            if (isEmptyCell(cell)) break;
            headerValues.push(cell);
        }

        if (headerValues.length === 0) continue;

        const normalizedHeaders = headerValues.map(normalizeHeaderValue);
        const dataRows: unknown[][] = [];

        for (let rowIndex = headerRowIndex + 1; rowIndex < rows.length; rowIndex += 1) {
            const row = rows[rowIndex] ?? [];
            const values: unknown[] = [];
            let hasData = false;

            for (let offset = 0; offset < headerValues.length; offset += 1) {
                const value = row[firstColIndex + offset] ?? "";
                if (!isEmptyCell(value)) {
                    hasData = true;
                }
                values.push(value);
            }

            if (hasData) {
                dataRows.push(values);
            }
        }

        const lines = [serializeTsvRow(normalizedHeaders)];
        for (const row of dataRows) {
            lines.push(serializeTsvRow(row));
        }

        const safeName = sanitizeSheetName(sheetName);
        const outputPath = path.join(outputDir, `${safeName}.csv`);
        const outputFile = Bun.file(outputPath)
        await outputFile.write(lines.join("\n"))
    }
}

/**
 * Converts the headers to camelCase with no spaces
 */
export function normaliseHeaders(csvPath: string) {
    const content = fs.readFileSync(csvPath, "utf8");
    if (content.trim().length === 0) return;

    const lines = content.split(/\r?\n/);
    if (lines.length === 0) return;

    const headers = lines[0].split("\t");
    const normalized = headers.map(normalizeHeaderValue);
    lines[0] = normalized.join("\t");

    fs.writeFileSync(csvPath, lines.join("\n"), "utf8");
}
