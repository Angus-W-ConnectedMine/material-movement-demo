"use server";

import { parseCSV } from "../parseCSV";
import { DigblockRecord } from "./types";

type RawDigblockRecord = Omit<DigblockRecord, "date"> & { date: string };

export async function getDigblockRecords() {
    const filePath = "./files/digblocks.csv"

    const records = await parseCSV(filePath) as RawDigblockRecord[]

    const mappedRecords = records.map((record) => ({
        ...record,
        date: new Date(record.date.split('/').reverse().join('-')),
    }));

    return mappedRecords as DigblockRecord[];
}
