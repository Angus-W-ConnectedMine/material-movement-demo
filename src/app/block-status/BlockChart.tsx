"use client";

import { DigblockSet } from "@/data/block-status/types";
import {
    Area,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

type BlockChartProps = {
    block: DigblockSet;
};

type ChartPoint = {
    date: Date;
    label: string;
    tonnes: number;
};

function formatTonnes(value: number) {
    return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
    }).format(value);
}

function formatGrade(value: number) {
    return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 1,
        minimumFractionDigits: 1,
    }).format(value);
}

function formatOunces(value: number) {
    return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
    }).format(value);
}

export default function BlockChart({ block }: BlockChartProps) {
    const sortedRecords = [...block.records].sort(
        (a, b) => a.date.getTime() - b.date.getTime(),
    );

    const data: ChartPoint[] = sortedRecords.map((record) => {
        return {
            date: record.date,
            label: record.date.toString(),
            tonnes: record.tonnes,
        };
    });

    const lastRecord = sortedRecords[sortedRecords.length - 1];

    const designedTonnes = lastRecord?.tonnes ?? 0;
    const designedGrade = lastRecord?.grade ?? 0;
    const designedOunces = designedTonnes * designedGrade / 31.1035;
    const stageLabel = lastRecord?.stage ?? "Unknown";

    return (
        <div
            style={{
                background: "#ffffff",
                borderRadius: 16,
                padding: 20,
                border: "1px solid #e5e7eb",
                boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
                display: "flex",
                gap: 16,
                alignItems: "stretch",
            }}
        >
            <div style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 12,
                        gap: 12,
                    }}
                >
                    <div
                        style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#111827",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                        title={block.id}
                    >
                        {block.id}
                    </div>
                    <div
                        style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#111827",
                            background: "#e5e7eb",
                            padding: "6px 10px",
                            borderRadius: 999,
                            whiteSpace: "nowrap",
                        }}
                    >
                        {stageLabel}
                    </div>
                </div>

                <div style={{ width: "100%", height: 220 }}>
                    <ResponsiveContainer>
                        <LineChart
                            data={data}
                            margin={{ top: 6, right: 8, left: 8, bottom: 4 }}
                        >
                            <CartesianGrid strokeDasharray="3 6" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="label"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12, fill: "#6b7280" }}
                                padding={{ left: 8, right: 8 }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12, fill: "#6b7280" }}
                                width={54}
                                label={{
                                    value: "Tonnes (t)",
                                    angle: -90,
                                    position: "insideLeft",
                                    dx: -6,
                                    style: {
                                        textAnchor: "middle",
                                        fill: "#6b7280",
                                        fontSize: 12,
                                    },
                                }}
                            />

                            <Area
                                type="monotone"
                                dataKey="tonnes"
                                stroke="none"
                                fill="#a855f7"
                                fillOpacity={0.12}
                                isAnimationActive={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="tonnes"
                                stroke="#a855f7"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 4, strokeWidth: 0 }}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div
                style={{
                    width: 220,
                    flexShrink: 0,
                    background: "#f9fafb",
                    border: "1px solid #f3f4f6",
                    borderRadius: 12,
                    padding: 16,
                    display: "grid",
                    gap: 12,
                    alignContent: "start",
                }}
            >
                <MetricRow label="Remaining Tonnes" value={`${formatTonnes(designedTonnes)} t`} />
                <MetricRow label="Designed Tonnes" value={`${formatTonnes(designedTonnes)} t`} />
                <MetricRow label="Designed Grade" value={`${formatGrade(designedGrade)} g/t`} />
                <MetricRow label="Designed Ounces" value={`${formatOunces(designedOunces)} oz`} />
            </div>
        </div>
    );
}

function MetricRow({ label, value }: { label: string; value: string }) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 12,
            }}
        >
            <div style={{ fontSize: 12, color: "#6b7280" }}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{value}</div>
        </div>
    );
}
