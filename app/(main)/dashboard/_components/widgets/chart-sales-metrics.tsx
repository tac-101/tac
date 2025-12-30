"use client"

import {
    BadgePercent,
    TrendingUp,
    DollarSign,
    ShoppingBag,
    Activity,
    Percent
} from "lucide-react"

import { Bar, BarChart, Label, Pie, PieChart } from "recharts"

import { Avatar, AvatarFallback } from "../../../../../components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../../../../components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../../../../../components/ui/chart"

const salesPlanPercentage = 54
const totalBars = 24
const filledBars = Math.round((salesPlanPercentage * totalBars) / 100)

// Sales chart data
const salesChartData = Array.from({ length: totalBars }, (_, index) => {
    const date = new Date(2025, 5, 15)
    // Just dummy dates
    return {
        date: date.toISOString(),
        sales: index < filledBars ? 315 : 0
    }
})

const salesChartConfig = {
    sales: {
        label: "Sales",
        color: "hsl(var(--primary))",
    }
} satisfies ChartConfig

const MetricsData = [
    {
        icons: <TrendingUp className="size-4" />,
        title: "Sales trend",
        value: "$11,548",
    },
    {
        icons: <BadgePercent className="size-4" />,
        title: "Discount offers",
        value: "$1,326",
    },
    {
        icons: <DollarSign className="size-4" />,
        title: "Net profit",
        value: "$17,356",
    },
    {
        icons: <ShoppingBag className="size-4" />,
        title: "Total orders",
        value: "248",
    },
]

const revenueChartData = [
    { month: "january", sales: 340, fill: "hsl(var(--primary))" },
    { month: "february", sales: 200, fill: "hsl(var(--primary) / 0.6)" },
    { month: "march", sales: 200, fill: "hsl(var(--primary) / 0.2)" },
]

const revenueChartConfig = {
    sales: {
        label: "Sales",
    },
    january: {
        label: "January",
        color: "hsl(var(--primary))",
    },
    february: {
        label: "February",
        color: "hsl(var(--primary) / 0.6)",
    },
    march: {
        label: "March",
        color: "hsl(var(--primary) / 0.2)",
    },
} satisfies ChartConfig

export function SalesMetricsCard({ className }: { className?: string }) {
    return (
        <Card className={className}>
            <CardContent className="p-6 space-y-4">
                {/* Top Section: Metrics + Pie Chart */}
                <div className="grid gap-6 lg:grid-cols-5">
                    {/* Left: Metrics */}
                    <div className="flex flex-col gap-6 lg:col-span-3">
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold">Sales metrics</span>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-xl border">
                            <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                                TC
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-semibold">Tac&apos;s Company</span>
                                <span className="text-muted-foreground text-sm">admin@tapango.logistics</span>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            {MetricsData.map((metric, index) => (
                                <div key={index} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                                    <Avatar className="size-8 rounded-md">
                                        <AvatarFallback className="bg-primary/10 text-primary shrink-0 rounded-md">
                                            {metric.icons}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground text-xs font-medium">{metric.title}</span>
                                        <span className="text-base font-bold">{metric.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Revenue Goal Pie */}
                    <Card className="flex flex-col shadow-sm bg-muted/20 border-none lg:col-span-2">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium">Revenue goal</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 pb-0">
                            <ChartContainer config={revenueChartConfig} className="mx-auto aspect-square max-h-[160px]">
                                <PieChart>
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                    <Pie
                                        data={revenueChartData}
                                        dataKey="sales"
                                        nameKey="month"
                                        innerRadius={45}
                                        outerRadius={65}
                                        strokeWidth={5}
                                    >
                                        <Label
                                            content={({ viewBox }) => {
                                                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                    return (
                                                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                            <tspan
                                                                x={viewBox.cx}
                                                                y={(viewBox.cy || 0) - 4}
                                                                className="fill-foreground text-2xl font-bold"
                                                            >
                                                                256.2
                                                            </tspan>
                                                            <tspan
                                                                x={viewBox.cx}
                                                                y={(viewBox.cy || 0) + 16}
                                                                className="fill-muted-foreground text-xs"
                                                            >
                                                                Profit
                                                            </tspan>
                                                        </text>
                                                    )
                                                }
                                            }}
                                        />
                                    </Pie>
                                </PieChart>
                            </ChartContainer>
                        </CardContent>
                        <CardFooter className="justify-between pt-2">
                            <span className="text-sm font-medium text-muted-foreground">Plan completed</span>
                            <span className="text-xl font-bold">56%</span>
                        </CardFooter>
                    </Card>
                </div>

                {/* Bottom Section: Sales Plan Bar */}
                <Card className="shadow-none border-dashed bg-muted/10">
                    <CardContent className="grid gap-6 p-6 lg:grid-cols-5 items-center">
                        {/* Percentage Big Display */}
                        <div className="flex flex-col items-start justify-center gap-2">
                            <span className="text-base font-medium">Sales plan</span>
                            <span className="text-5xl font-bold tracking-tighter text-primary">
                                {salesPlanPercentage}%
                            </span>
                            <span className="text-muted-foreground text-xs text-balance">
                                Percentage profit from total sales
                            </span>
                        </div>

                        {/* Cohort Analysis & Bar Chart */}
                        <div className="flex flex-col gap-4 md:col-span-4">
                            <div className="flex flex-col gap-1">
                                <span className="font-medium">Cohort analysis indicators</span>
                                <p className="text-xs text-muted-foreground">
                                    Analyzes behavior of users who joined within the same timeframe.
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Activity className="size-4 text-primary" />
                                    <span>Open Statistics</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Percent className="size-4 text-primary" />
                                    <span>Percentage Change</span>
                                </div>
                            </div>

                            <ChartContainer config={salesChartConfig} className="h-[60px] w-full mt-2">
                                <BarChart
                                    accessibilityLayer
                                    data={salesChartData}
                                    margin={{ left: 0, right: 0 }}
                                >
                                    <Bar
                                        dataKey="sales"
                                        fill="var(--color-sales)"
                                        radius={4}
                                        fillOpacity={0.8}
                                    />
                                </BarChart>
                            </ChartContainer>
                        </div>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    )
}
