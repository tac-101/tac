"use client"

import { Bar, BarChart } from "recharts"
import { Card, CardContent, CardHeader } from "../../../../../components/ui/card"
import { type ChartConfig, ChartContainer } from "../../../../../components/ui/chart"
import { Separator } from "../../../../../components/ui/separator"
import { cn } from "../../../../../lib/utils"

const productReachChartData = [
    { month: "January", reached: 168 },
    { month: "February", reached: 305 },
    { month: "March", reached: 213 },
    { month: "April", reached: 330 },
    { month: "May", reached: 305 },
]

const productReachChartConfig = {
    reached: {
        label: "Reached",
        color: "hsl(var(--primary))",
    },
} satisfies ChartConfig

const orderPlacedChartData = [
    { month: "January", orders: 168 },
    { month: "February", orders: 305 },
    { month: "March", orders: 213 },
    { month: "April", orders: 330 },
    { month: "May", orders: 305 },
]

const orderPlacedChartConfig = {
    orders: {
        label: "Orders",
        color: "hsl(var(--primary) / 0.5)",
    },
} satisfies ChartConfig

export function ProductInsightsCard({ className }: { className?: string }) {
    return (
        <Card className={cn("gap-4 h-full", className)}>
            <CardHeader className="flex flex-row justify-between items-start space-y-0 relative overflow-hidden">
                <div className="flex flex-col gap-1 z-10">
                    <span className="text-lg font-semibold">Product insight</span>
                    <span className="text-muted-foreground text-xs font-mono">
                        UPDATED: {new Date().toLocaleDateString()}
                    </span>
                </div>
                {/* Abstract shape or icon could go here instead of external image for now */}
                <div className="size-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg absolute right-4 top-4" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Separator />

                {/* Product Reached */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">Product reached</span>
                        <span className="text-2xl font-bold tracking-tight">21,153</span>
                    </div>
                    <ChartContainer config={productReachChartConfig} className="h-12 w-24">
                        <BarChart accessibilityLayer data={productReachChartData} barSize={8}>
                            <Bar dataKey="reached" fill="var(--color-reached)" radius={2} />
                        </BarChart>
                    </ChartContainer>
                </div>

                {/* Order Placed */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">Order placed</span>
                        <span className="text-2xl font-bold tracking-tight">2,123</span>
                    </div>
                    <ChartContainer config={orderPlacedChartConfig} className="h-12 w-24">
                        <BarChart accessibilityLayer data={orderPlacedChartData} barSize={8}>
                            <Bar dataKey="orders" fill="var(--color-orders)" radius={2} />
                        </BarChart>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    )
}
