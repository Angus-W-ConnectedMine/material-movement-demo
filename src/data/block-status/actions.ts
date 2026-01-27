"use server";

import { parseCSV } from "../parseCSV";
import { DigblockRecord } from "./types";

export async function getDigblockRecords() {
    const filePath = "./files/digblocks.csv"

    const records = await parseCSV(filePath)

    const mappedRecords = records.map((record: any) => ({
        ...record,
        date: new Date(record.date.split('/').reverse().join('-')),
        digiblockID: record.digiblockID.split('_').slice(0, 3).join('_')
    }));

    return mappedRecords as DigblockRecord[];
}