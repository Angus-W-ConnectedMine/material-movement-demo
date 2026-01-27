"use client";

import BlockChart from "./BlockChart"
import { getDigblockRecords } from "@/data/block-status/actions"
import { DigblockRecord, DigblockSet } from "@/data/block-status/types"
import { useEffect, useState } from "react"

export default function BlockStatusPage() {
    const [records, setRecords] = useState<DigblockRecord[]>([])
    const [blocks, setBlocks] = useState<DigblockSet[]>([])

    function splitToBlocks(records: DigblockRecord[]): DigblockSet[] {
        const recordsByID = new Map<string, DigblockRecord[]>()

        for (var record of records) {
            if (recordsByID.has(record.digiblockID)) {
                const recordsInSet = recordsByID.get(record.digiblockID)
                recordsInSet?.push(record)
            } else {
                recordsByID.set(record.digiblockID, [record])
            }
        }

        return Array.from(recordsByID.entries()).map((e) => { return { id: e[0], records: e[1] } })
    }

    useEffect(() => {
        void (async () => {
            const res = await getDigblockRecords()
            setRecords(res)
            setBlocks(splitToBlocks(res))
        })()
    }, [])

    return (
        <div style={{ padding: 24, display: "grid", gap: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Block status page</div>

            {blocks.map((block) => (
                <BlockChart key={block.id} block={block} />
            ))}
        </div>
    )

}
