"use client";

import { getDigblockRecords } from "@/data/block-status/actions"
import { DigblockRecord } from "@/data/block-status/types"
import { useEffect, useState } from "react"

export default function BlockStatusPage() {
    const [records, setRecords] = useState<DigblockRecord[]>([])

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