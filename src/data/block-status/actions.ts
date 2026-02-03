"use server";

import { CPODigblocksRow, DailyProductionRow } from "@/records/types";
import { parseCSV } from "../parseCSV";
import { DigblockRecord, ProdRow } from "./types";

export async function getDigblockRecords(): Promise<DigblockRecord[]> {
    const digblocksFilePath = "./src/records/CPO Digblocks.csv"
    const digblockRows = await parseCSV<CPODigblocksRow>(digblocksFilePath) 

    const dailyProductionFilePath = "./src/records/Daily Production.csv"
    const dailyProdRows = await parseCSV<DailyProductionRow>(dailyProductionFilePath)

    const dailyProdRowsWithDate = dailyProdRows.map((row) => ({
        ...row
    }))
    const mappedRowsByID = Map.groupBy<string, ProdRow>(dailyProdRowsWithDate, row => row.digblock)

    const records = digblockRows.map((row) => ({
        ...row,
        tonnes: row.tonnes.length > 0 ? parseFloat(row.tonnes.replaceAll(',', '')) : 0,
        prodRows: mappedRowsByID.get(row.digiblockID) ?? []
    }));

    return records;
}
