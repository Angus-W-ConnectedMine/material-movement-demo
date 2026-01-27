"use client";

import { DigblockSet } from "@/data/block-status/types";
import {
    Area,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
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

function formatDate(value: Date) {
    return `${value.getDay()}/${value.getMonth()}`
}

export default function BlockChart({ block }: BlockChartProps) {
    console.log(block.records.length)

    const sortedRecords = [...block.records].sort(
        (a, b) => a.date.getTime() - b.date.getTime(),
    );

    const data: ChartPoint[] = sortedRecords.map((record) => {
        return {
            date: record.date,
            label: formatDate(record.date),
            tonnes: record.tonnes,
        };
    });

    const lastRecord = sortedRecords[sortedRecords.length - 1];

    const designedTonnes = lastRecord?.tonnes ?? 0;
    const designedGrade = lastRecord?.grade ?? 0;
    const designedOunces = designedTonnes * designedGrade / 31.1035;
    const stageLabel = lastRecord?.stage ?? "Unknown";

    return (
        <div className="flex items-stretch gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
            <div className="min-w-0 flex-1">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <div
                        className="truncate whitespace-nowrap text-[13px] font-semibold text-gray-900"
                        title={block.id}
                    >
                        {block.id}
                    </div>
                    <div className="whitespace-nowrap rounded-full bg-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-900">
                        {stageLabel}
                    </div>
                </div>

                <div className="h-[220px] w-full">
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

            <div className="grid w-[220px] shrink-0 content-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
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
        <div className="flex items-baseline justify-between gap-3">
            <div className="text-xs text-gray-500">{label}</div>
            <div className="text-base font-bold text-gray-900">{value}</div>
        </div>
    );
}
