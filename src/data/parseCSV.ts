import parse from "csv-simple-parser";


export async function parseCSV(filePath: string): Promise<any[]> {
    const file = Bun.file(filePath);

    const records = parse(await file.text(), { header: true });

    return records;
}