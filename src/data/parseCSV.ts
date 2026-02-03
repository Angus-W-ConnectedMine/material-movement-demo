import parse from "csv-simple-parser";


export async function parseCSV<T>(filePath: string): Promise<T[]> {
    const file = Bun.file(filePath);

    const records = parse(await file.text(), { header: true, infer: true, delimiter: '\t' });

    return records as T[];
}
