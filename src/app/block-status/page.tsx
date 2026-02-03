"use client";

import BlockChart from "./BlockChart"
import { getDigblockRecords } from "@/data/block-status/actions"
import { DigblockRecord } from "@/data/block-status/types"
import { useEffect, useState } from "react"

export default function BlockStatusPage() {
    const [blocks, setBlocks] = useState<DigblockRecord[]>([])

    useEffect(() => {
        void (async () => {
            const res = await getDigblockRecords()
            setBlocks(res)
        })()
    }, [])

    return (
        <div style={{ padding: 24, display: "grid", gap: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Block status page</div>

            {blocks.filter(b => b.prodRows.length > 0).map((block) => (
                <BlockChart key={block.digiblockID} block={block} />
            ))}
        </div>
    )

}
