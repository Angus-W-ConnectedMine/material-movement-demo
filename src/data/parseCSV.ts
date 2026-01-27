import parse from "csv-simple-parser";


export async function parseCSV(filePath: string): Promise<unknown[]> {
    const file = Bun.file(filePath);

    const records = parse(await file.text(), { header: true, infer: true, delimiter: '\t' });

    return records as unknown[];
}
