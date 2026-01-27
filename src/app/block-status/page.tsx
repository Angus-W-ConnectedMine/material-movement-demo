"use client";

import { getDigblockRecords } from "@/data/block-status/actions"
import { DigblockRecord } from "@/data/block-status/types"
import { useEffect, useState } from "react"

type DigblockSet = {
    id: string,
    records: DigblockRecord[],
}

export default function BlockStatusPage() {
    const [records, setRecords] = useState<DigblockRecord[]>([])

    function splitToBlocks(records: DigblockRecord[]): DigblockSet[] {
        const grouped = records.reduce((acc, record) => {
            const existing = acc.find(group => group.id === record.digiblockID)
            if (existing) {
                existing.records.push(record)
            } else {
                acc.push({ id: record.digiblockID, records: [record] })
            }
            return acc
        }, [] as DigblockSet[])

        return grouped.map(group => ({
            ...group,
            records: group.records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        }))
    }

    async function startLoad() {
        const res = await getDigblockRecords()
        setRecords(res)
    }

    useEffect(() => {
        startLoad()
    }, [])

    return (
        <div>
            <div>Block status page</div>

            <div>{JSON.stringify(records, null, 2)}</div>
        </div>
    )

}