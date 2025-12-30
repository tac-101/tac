"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group"

// Mock Data for Shipments (Visitors in original)
const chartData = [
    { date: "2024-04-01", standard: 222, express: 150 },
    { date: "2024-04-02", standard: 97, express: 180 },
    { date: "2024-04-03", standard: 167, express: 120 },
    { date: "2024-04-04", standard: 242, express: 260 },
    { date: "2024-04-05", standard: 373, express: 290 },
    { date: "2024-04-06", standard: 301, express: 340 },
    { date: "2024-04-07", standard: 245, express: 180 },
    { date: "2024-04-08", standard: 409, express: 320 },
    { date: "2024-04-09", standard: 59, express: 110 },
    { date: "2024-04-10", standard: 261, express: 190 },
    { date: "2024-04-11", standard: 327, express: 350 },
    { date: "2024-04-12", standard: 292, express: 210 },
    { date: "2024-04-13", standard: 342, express: 380 },
    { date: "2024-04-14", standard: 137, express: 220 },
    { date: "2024-04-15", standard: 120, express: 170 },
    { date: "2024-04-16", standard: 138, express: 190 },
    { date: "2024-04-17", standard: 446, express: 360 },
    { date: "2024-04-18", standard: 364, express: 410 },
    { date: "2024-04-19", standard: 243, express: 180 },
    { date: "2024-04-20", standard: 89, express: 150 },
    { date: "2024-04-21", standard: 137, express: 200 },
    { date: "2024-04-22", standard: 224, express: 170 },
    { date: "2024-04-23", standard: 138, express: 230 },
    { date: "2024-04-24", standard: 387, express: 290 },
    { date: "2024-04-25", standard: 215, express: 250 },
    { date: "2024-04-26", standard: 75, express: 130 },
    { date: "2024-04-27", standard: 383, express: 420 },
    { date: "2024-04-28", standard: 122, express: 180 },
    { date: "2024-04-29", standard: 315, express: 240 },
    { date: "2024-04-30", standard: 454, express: 380 },
]

const chartConfig = {
    visitors: {
        label: "Shipments",
    },
    standard: {
        label: "Standard",
        color: "var(--primary)",
    },
    express: {
        label: "Express",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig

export function ChartAreaInteractive() {
    const [timeRange, setTimeRange] = React.useState("90d")

    const filteredData = chartData.filter((item) => {
        const date = new Date(item.date)
        const referenceDate = new Date()
        let daysToSubtract = 90
        if (timeRange === "30d") {
            daysToSubtract = 30
        } else if (timeRange === "7d") {
            daysToSubtract = 7
        }
        const startDate = new Date(referenceDate)
        startDate.setDate(startDate.getDate() - daysToSubtract)
        return date >= startDate
    })

    return (
        <Card className="@container/card">
            <CardHeader>
                <CardTitle>Shipment Volume</CardTitle>
                <CardDescription>
                    <span className="hidden @[540px]/card:block">
                        Total shipments for the last 3 months
                    </span>
                    <span className="@[540px]/card:hidden">Last 3 months</span>
                </CardDescription>
                <CardAction>
                    <ToggleGroup
                        type="single"
                        value={timeRange}
                        onValueChange={setTimeRange}
                        variant="outline"
                        className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
                    >
                        <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
                        <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
                        <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
                    </ToggleGroup>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger
                            className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                            size="sm"
                            aria-label="Select a value"
                        >
                            <SelectValue placeholder="Last 3 months" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="90d" className="rounded-lg">
                                Last 3 months
                            </SelectItem>
                            <SelectItem value="30d" className="rounded-lg">
                                Last 30 days
                            </SelectItem>
                            <SelectItem value="7d" className="rounded-lg">
                                Last 7 days
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </CardAction>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <AreaChart data={filteredData}>
                        <defs>
                            <linearGradient id="fillStandard" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--primary)"
                                    stopOpacity={1.0}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--primary)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                            <linearGradient id="fillExpress" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--chart-2)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--chart-2)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => {
                                        return new Date(value).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })
                                    }}
                                    indicator="dot"
                                />
                            }
                        />
                        <Area
                            dataKey="express"
                            type="natural"
                            fill="url(#fillExpress)"
                            stroke="var(--chart-2)"
                            stackId="a"
                        />
                        <Area
                            dataKey="standard"
                            type="natural"
                            fill="url(#fillStandard)"
                            stroke="var(--primary)"
                            stackId="a"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
