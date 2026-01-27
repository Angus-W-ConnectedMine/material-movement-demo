"use server";

import fs from "node:fs/promises";
import path from "node:path";
import { processExcelFile } from "@/processing/excel-to-csv";

export type UploadSpreadsheetState = {
    ok: boolean;
    message: string;
};

const allowedExtensions = new Set([".xlsx", ".xls"]);

function buildSafeBaseName(fileName: string): string {
    const ext = path.extname(fileName);
    const base = path.basename(fileName, ext);
    const safe = base.replace(/[^A-Za-z0-9-_]+/g, "_").slice(0, 50);
    return safe.length > 0 ? safe : "spreadsheet";
}

function timestampSlug(date = new Date()): string {
    return date.toISOString().replace(/[:.]/g, "-");
}

export async function uploadSpreadsheet(
    _prevState: UploadSpreadsheetState,
    formData: FormData,
): Promise<UploadSpreadsheetState> {
    const file = formData.get("spreadsheet");

    if (!(file instanceof File)) {
        return { ok: false, message: "Please choose an Excel file to upload." };
    }

    if (file.size === 0) {
        return { ok: false, message: "The selected file is empty." };
    }

    const extension = path.extname(file.name).toLowerCase();
    if (!allowedExtensions.has(extension)) {
        return { ok: false, message: "Only .xlsx or .xls files are supported." };
    }

    const uploadsDir = path.join(process.cwd(), "files", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const baseName = buildSafeBaseName(file.name);
    const stamp = timestampSlug();
    const uploadPath = path.join(uploadsDir, `${baseName}-${stamp}${extension}`);
    console.log(uploadPath)

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(uploadPath, buffer);

    const outputDir = path.join(process.cwd(), "files", "processed", `${baseName}-${stamp}`);
    processExcelFile(uploadPath, outputDir);

    return {
        ok: true, message: ""
    };
}
