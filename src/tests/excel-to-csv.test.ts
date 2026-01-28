import { describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import * as xlsx from "xlsx";
import { normaliseHeaders, processExcelFile } from "../processing/excel-to-csv";

function createTempDir(): string {
    return fs.mkdtempSync(path.join(os.tmpdir(), "excel-to-csv-"));
}

describe("processExcelFile", () => {
    test("creates one CSV per sheet with detected headers and data rows", async () => {
        const tempDir = createTempDir();
        const inputPath = path.join(tempDir, "input.xlsx");
        const outputDir = path.join(tempDir, "out");

        const wb = xlsx.utils.book_new();
        const ws1 = xlsx.utils.aoa_to_sheet([
            ["", "", ""],
            ["", "", ""],
            ["", "", "Header One", "Header Two", "", "Ignored"],
            ["", "", "A1", "B1", "X1"],
            ["", "", "A2", "B2", "X2"],
            ["", "", "", ""],
        ]);
        const ws2 = xlsx.utils.aoa_to_sheet([
            ["", "RL", "Material Type", ""],
            ["", "4850", "LG", ""],
        ]);

        xlsx.utils.book_append_sheet(wb, ws1, "First Sheet");
        xlsx.utils.book_append_sheet(wb, ws2, "Sheet Name");
        xlsx.writeFile(wb, inputPath);

        await processExcelFile(inputPath, outputDir);

        const sheet1Path = path.join(outputDir, "First Sheet.csv");
        const sheet2Path = path.join(outputDir, "Sheet Name.csv");

        expect(fs.existsSync(sheet1Path)).toBe(true);
        expect(fs.existsSync(sheet2Path)).toBe(true);

        const sheet1Lines = fs.readFileSync(sheet1Path, "utf8").trim().split(/\r?\n/);
        expect(sheet1Lines[0]).toBe("headerOne\theaderTwo");
        expect(sheet1Lines[1]).toBe("A1\tB1");
        expect(sheet1Lines[2]).toBe("A2\tB2");

        const sheet2Lines = fs.readFileSync(sheet2Path, "utf8").trim().split(/\r?\n/);
        expect(sheet2Lines[0]).toBe("rl\tmaterialType");
        expect(sheet2Lines[1]).toBe("4850\tLG");
    });
});

describe("normaliseHeaders", () => {
    test("rewrites headers to camelCase with no spaces", () => {
        const tempDir = createTempDir();
        const csvPath = path.join(tempDir, "data.csv");
        fs.writeFileSync(csvPath, "My Header\tSecond Header\tRL\nvalue1\tvalue2\t4850\n", "utf8");

        normaliseHeaders(csvPath);

        const lines = fs.readFileSync(csvPath, "utf8").trim().split(/\r?\n/);
        expect(lines[0]).toBe("myHeader\tsecondHeader\trl");
        expect(lines[1]).toBe("value1\tvalue2\t4850");
    });
});
