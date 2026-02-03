"use server";

import { CPODigblocksRow, DailyProductionRow } from "@/records/types";
import { parseCSV } from "../parseCSV";
import { DigblockRecord, ProdRow } from "./types";

export async function getDigblockRecords(): Promise<DigblockRecord[]> {
    const digblocksFilePath = "@/src/records/CPO Digblocks.csv"
    const digblockRows = await parseCSV<CPODigblocksRow>(digblocksFilePath) 

    const dailyProductionFilePath = "@/src/records/Daily Production.csv"
    const dailyProdRows = await parseCSV(dailyProductionFilePath) as DailyProductionRow[]
    const dailyProdRowsWithDate = dailyProdRows.map((row) => ({
        ...row,
        date: new Date(row.date.split('/').reverse().join('-'))
    }))
    const mappedRowsByID = Map.groupBy<string, ProdRow>(dailyProdRowsWithDate, row => row.digblock)

    const records = digblockRows.map((row) => ({
        ...row,
        tonnes: parseFloat(row.tonnes.replaceAll(',', '')),
        prodRows: mappedRowsByID.get(row.digiblockID) ?? []
    }));

    return records;
}
