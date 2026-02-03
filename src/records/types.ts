export type CPODigblocksRow = {
    date: string,
    flitch: number,
    digiblockID: string,
    stage: number,
    rl: number,
    materialType: string,
    tonnes: string,
    grade: number,
    ounces: number,
}

export type DailyProductionRow = {
    stage: number,
    date: string,
    truckID: string,
    shift: string,
    digblock: string,
    flitch: number,
    materialType: string,
    sp: string,
    tonnesTruck: number,
    planGrade: number,
    dilutedGrade: number,
    grabSample: number,
    ounces: number,
    comments: string,
}

export type DailyReportRow = {
    cpSTAGE1: string,
}

export type DrillingRow = {
    plan: string,
}

export type EOMSPTrackingRow = {
    month: string,
    aug25: string,
}

export type EOMRow = {
    mineClaimAug25: string,
}

export type GrabSamplesRow = {
    sampleID: string,
    blockID: string,
    shot: number,
    mineralClassification: string,
    comments: string,
    photoTaken: string,
    dispatched: string,
    grade: string,
}

export type HaulageRow = {
    date: string,
    alpha: string,
    bravo: string,
    charlie: string,
    delta: string,
    lg1RH: string,
    lg2: string,
    lg3: string,
    lg4: string,
    lg5: string,
    lg6: string,
    lg7: string,
}

export type InMineSummaryRow = {
    month: string,
    aug25: string,
}

export type WeeklyReportRow = {
    weekOf: string,
    col_12225: string,
    to: string,
    col_12825: string,
}
