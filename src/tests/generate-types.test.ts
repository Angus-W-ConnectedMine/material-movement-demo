import { describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { generateTypes } from "../processing/generate-types";

function createTempDir(): string {
    return fs.mkdtempSync(path.join(os.tmpdir(), "generate-types-"));
}

describe("generateTypes", () => {
    test("writes types.ts for the latest processed folder", async () => {
        const tempRoot = createTempDir();
        const olderDir = path.join(tempRoot, "older");
        const latestDir = path.join(tempRoot, "latest");

        fs.mkdirSync(olderDir, { recursive: true });
        fs.mkdirSync(latestDir, { recursive: true });

        const olderCsv = path.join(olderDir, "Sheet1.csv");
        fs.writeFileSync(olderCsv, "name\tage\nAlice\t30\n", "utf8");

        const latestCsv = path.join(latestDir, "Sheet1.csv");
        fs.writeFileSync(
            latestCsv,
            "name\tage\tcode\nAlice\t30\tA1\nBob\t40\tB2\n",
            "utf8",
        );

        const outputPath = await generateTypes(tempRoot);
        expect(outputPath).toBe(path.join(latestDir, "types.ts"));

        const typesContent = fs.readFileSync(outputPath, "utf8");
        expect(typesContent).toContain("export type Sheet1Row = {");
        expect(typesContent).toContain("name: string");
        expect(typesContent).toContain("age: number");
        expect(typesContent).toContain("code: string");
    });
});
