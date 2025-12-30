"use client"

import type { ReactNode } from "react"
import { Card, CardContent, CardHeader } from "../../../../../components/ui/card"
import { cn } from "../../../../../lib/utils"

type StatisticsCardProps = {
    icon: ReactNode
    value: string
    title: string
    changePercentage: string
    className?: string
}

export function StatisticsCard({ icon, value, title, changePercentage, className }: StatisticsCardProps) {
    return (
        <Card className={cn("gap-4", className)}>
            <CardHeader className="flex items-center flex-row gap-4 space-y-0">
                <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md">
                    {icon}
                </div>
                <span className="text-2xl font-bold">{value}</span>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <span className="font-semibold text-muted-foreground">{title}</span>
                <p className="space-x-2">
                    <span className={cn("text-sm font-medium", changePercentage.startsWith("+") ? "text-emerald-500" : "text-rose-500")}>
                        {changePercentage}
                    </span>
                    <span className="text-muted-foreground text-sm">than last week</span>
                </p>
            </CardContent>
        </Card>
    )
}
