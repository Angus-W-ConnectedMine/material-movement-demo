import { describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { generateTypes } from "../processing/generate-types";

function createTempDir(): string {
    return fs.mkdtempSync(path.join(os.tmpdir(), "generate-types-"));
}

describe("generateTypes", () => {
    test("writes types.ts for all processed folders that do not have one", async () => {
        const tempRoot = createTempDir();
        const olderDir = path.join(tempRoot, "older");
        const latestDir = path.join(tempRoot, "latest");
        const existingDir = path.join(tempRoot, "existing");

        fs.mkdirSync(olderDir, { recursive: true });
        fs.mkdirSync(latestDir, { recursive: true });
        fs.mkdirSync(existingDir, { recursive: true });

        const olderCsv = path.join(olderDir, "Sheet1.csv");
        fs.writeFileSync(olderCsv, "name\tage\nAlice\t30\n", "utf8");

        const latestCsv = path.join(latestDir, "Sheet1.csv");
        fs.writeFileSync(
            latestCsv,
            "name\tage\tcode\nAlice\t30\tA1\nBob\t40\tB2\n",
            "utf8",
        );

        const existingTypes = path.join(existingDir, "types.ts");
        fs.writeFileSync(existingTypes, "export type ExistingRow = { id: string }\n", "utf8");

        const wroteCount = await generateTypes(tempRoot);
        expect(wroteCount).toBe(2);

        const olderTypes = fs.readFileSync(path.join(olderDir, "types.ts"), "utf8");
        expect(olderTypes).toContain("export type Sheet1Row = {");
        expect(olderTypes).toContain("name: string");
        expect(olderTypes).toContain("age: number");

        const latestTypes = fs.readFileSync(path.join(latestDir, "types.ts"), "utf8");
        expect(latestTypes).toContain("export type Sheet1Row = {");
        expect(latestTypes).toContain("name: string");
        expect(latestTypes).toContain("age: number");
        expect(latestTypes).toContain("code: string");

        const existingContent = fs.readFileSync(existingTypes, "utf8");
        expect(existingContent).toBe("export type ExistingRow = { id: string }\n");
    });
});
