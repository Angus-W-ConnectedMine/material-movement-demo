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
    date: string,
    tonnesTruck: number,
}