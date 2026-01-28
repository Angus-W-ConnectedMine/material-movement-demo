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
        await Bun.write(olderCsv, "name\tage\nAlice\t30\n");

        const latestCsv = path.join(latestDir, "Sheet1.csv");
        await Bun.write(latestCsv, "name\tage\tcode\nAlice\t30\tA1\nBob\t40\tB2\n");

        const existingTypes = path.join(existingDir, "types.ts");
        await Bun.write(existingTypes, "export type ExistingRow = { id: string }\n");

        const wroteCount = await generateTypes(tempRoot);
        expect(wroteCount).toBe(2);

        const olderTypes = await Bun.file(path.join(olderDir, "types.ts")).text();
        expect(olderTypes).toContain("export type Sheet1Row = {");
        expect(olderTypes).toContain("name: string");
        expect(olderTypes).toContain("age: number");

        const latestTypes = await Bun.file(path.join(latestDir, "types.ts")).text();
        expect(latestTypes).toContain("export type Sheet1Row = {");
        expect(latestTypes).toContain("name: string");
        expect(latestTypes).toContain("age: number");
        expect(latestTypes).toContain("code: string");

        const existingContent = await Bun.file(existingTypes).text();
        expect(existingContent).toBe("export type ExistingRow = { id: string }\n");
    });
});
