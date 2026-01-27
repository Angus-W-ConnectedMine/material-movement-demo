"use server";

import { parseCSV } from "../parseCSV";
import { DigblockRecord } from "./types";

export async function getDigblockRecords() {
    const filePath = "./files/digblocks.csv"

    const records = await parseCSV(filePath)

    return records as DigblockRecord[];
}