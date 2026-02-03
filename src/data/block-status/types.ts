export type DigblockRecord = {
    flitch: number,
    digiblockID: string,
    stage: number,
    rl: number,
    materialType: string,
    tonnes: number,
    grade: number,
    prodRows: ProdRow[],
}

export type ProdRow = {
    digblock: string,
    date: Date,
    tonnesTruck: number,
}

export type DigblockSet = {
    id: string,
    records: DigblockRecord[],
}
