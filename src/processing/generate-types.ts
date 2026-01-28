import fs from "node:fs/promises";
import path from "node:path";

type ColumnInfo = {
    name: string;
    type: "string" | "number";
};

const processedRoot = path.join(process.cwd(), "files", "processed");
const sampleSize = 10;

function toPascalCase(input: string): string {
    const parts = input.split(/[^A-Za-z0-9]+/).filter(Boolean);
    if (parts.length === 0) return "Sheet";
    const joined = parts
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");
    if (/^[0-9]/.test(joined)) return `Sheet${joined}`;
    return joined;
}

function sanitizeHeader(raw: string, index: number, seen: Map<string, number>): string {
    let cleaned = raw.trim();
    if (cleaned.length === 0) {
        cleaned = `column${index + 1}`;
    }

    cleaned = cleaned.replace(/[^A-Za-z0-9_]/g, "_");
    if (/^[0-9]/.test(cleaned)) {
        cleaned = `col_${cleaned}`;
    }

    if (cleaned.length === 0) {
        cleaned = `column${index + 1}`;
    }

    const count = seen.get(cleaned) ?? 0;
    seen.set(cleaned, count + 1);
    if (count > 0) {
        return `${cleaned}${count + 1}`;
    }

    return cleaned;
}

function looksNumeric(value: string): boolean {
    if (value.trim().length === 0) return false;
    return /^-?\d+(\.\d+)?$/.test(value.trim());
}

function inferColumnTypes(rows: string[][], headers: string[]): ColumnInfo[] {
    const columns: ColumnInfo[] = headers.map((header) => ({ name: header, type: "string" }));

    for (let col = 0; col < headers.length; col += 1) {
        let hasValue = false;
        let allNumeric = true;

        for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
            const value = rows[rowIndex]?.[col] ?? "";
            if (value.trim().length === 0) continue;
            hasValue = true;
            if (!looksNumeric(value)) {
                allNumeric = false;
                break;
            }
        }

        if (hasValue && allNumeric) {
            columns[col].type = "number";
        }
    }

    return columns;
}

async function findLatestProcessedDir(root: string): Promise<string> {
    const entries = await fs.readdir(root, { withFileTypes: true });
    const dirs = entries.filter((entry) => entry.isDirectory());

    if (dirs.length === 0) {
        throw new Error("No processed folders found.");
    }

    const stats = await Promise.all(
        dirs.map(async (dir) => {
            const fullPath = path.join(root, dir.name);
            const stat = await fs.stat(fullPath);
            return { path: fullPath, mtimeMs: stat.mtimeMs };
        }),
    );

    stats.sort((a, b) => b.mtimeMs - a.mtimeMs);
    return stats[0].path;
}

function parseTabRows(content: string): { headers: string[]; rows: string[][] } {
    const lines = content.split(/\r?\n/);
    const firstLineIndex = lines.findIndex((line) => line.trim().length > 0);
    if (firstLineIndex === -1) {
        return { headers: [], rows: [] };
    }

    const headerLine = lines[firstLineIndex];
    const rawHeaders = headerLine.split("\t");
    const seen = new Map<string, number>();
    const headers = rawHeaders.map((header, index) => sanitizeHeader(header, index, seen));

    const rows: string[][] = [];
    for (let i = firstLineIndex + 1; i < lines.length; i += 1) {
        const line = lines[i];
        if (line.trim().length === 0) continue;
        rows.push(line.split("\t"));
        if (rows.length >= sampleSize) break;
    }

    return { headers, rows };
}

export async function generateTypes(root = processedRoot) {
    console.info(`[generate-types] Using processed root: ${root}`);
    const latestDir = await findLatestProcessedDir(root);
    console.info(`[generate-types] Latest processed folder: ${latestDir}`);
    const entries = await fs.readdir(latestDir, { withFileTypes: true });
    const csvFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".csv"));

    if (csvFiles.length === 0) {
        throw new Error(`No CSV files found in ${latestDir}`);
    }

    console.info(`[generate-types] Found ${csvFiles.length} CSV file(s).`);
    const typeBlocks: string[] = [];

    for (const file of csvFiles) {
        const filePath = path.join(latestDir, file.name);
        console.info(`[generate-types] Reading ${file.name}`);
        const content = await Bun.file(filePath).text();
        const { headers, rows } = parseTabRows(content);

        if (headers.length === 0) continue;

        const columns = inferColumnTypes(rows, headers);
        const typeName = `${toPascalCase(path.basename(file.name, ".csv"))}Row`;

        const lines: string[] = [];
        lines.push(`export type ${typeName} = {`);
        for (const column of columns) {
            lines.push(`    ${column.name}: ${column.type},`);
        }
        lines.push("}");

        typeBlocks.push(lines.join("\n"));
    }

    if (typeBlocks.length === 0) {
        throw new Error("No types generated from CSV files.");
    }

    const outputPath = path.join(latestDir, "types.ts");
    await Bun.write(outputPath, `${typeBlocks.join("\n\n")}\n`);
    console.info(`[generate-types] Wrote ${outputPath}`);

    return outputPath;
}

if (import.meta.main) {
    generateTypes().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
}
