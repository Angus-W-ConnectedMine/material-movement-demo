"use client";

import BlockChart from "./BlockChart"
import { getDigblockRecords } from "@/data/block-status/actions"
import { DigblockRecord, DigblockSet } from "@/data/block-status/types"
import { useEffect, useState } from "react"

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

    useEffect(() => {
        void (async () => {
            const res = await getDigblockRecords()
            setRecords(res)
        })()
    }, [])

    const blocks = splitToBlocks(records)

    return (
        <div style={{ padding: 24, display: "grid", gap: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Block status page</div>

            {blocks.slice(0, 3).map((block) => (
                <BlockChart key={block.id} block={block} />
            ))}
        </div>
    )

}
