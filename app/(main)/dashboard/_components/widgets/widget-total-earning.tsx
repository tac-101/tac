"use client"

import { ChevronDown, ChevronUp, MoreVertical } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../../../../../components/ui/avatar"
import { Button } from "../../../../../components/ui/button"
import { Card, CardContent, CardHeader } from "../../../../../components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../../../../components/ui/dropdown-menu"
import { Progress } from "../../../../../components/ui/progress"
import { cn } from "../../../../../lib/utils"

const listItems = ["Share", "Update", "Refresh"]

type Props = {
    title: string
    earning: number
    trend: "up" | "down"
    percentage: number
    comparisonText: string
    earningData: {
        icon: string // simpler than img URL
        platform: string
        technologies: string
        earnings: string
        progressPercentage: number
        colorClass: string
    }[]
    className?: string
}

export function TotalEarningCard({
    earningData,
    title,
    earning,
    trend,
    percentage,
    comparisonText,
    className,
}: Props) {
    return (
        <Card className={cn("h-full", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <span className="text-lg font-semibold">{title}</span>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                            {listItems.map((item, index) => (
                                <DropdownMenuItem key={index}>{item}</DropdownMenuItem>
                            ))}
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold tracking-tight">
                            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(earning)}
                        </span>
                        <span className={cn(
                            "flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-full",
                            trend === "up" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                        )}>
                            {trend === "up" ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                            {percentage}%
                        </span>
                    </div>
                    <span className="text-muted-foreground text-sm">{comparisonText}</span>
                </div>

                <div className="flex flex-1 flex-col gap-4">
                    {earningData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="size-10 rounded-lg">
                                    <AvatarFallback className={cn("rounded-lg font-bold text-xs", item.colorClass)}>
                                        {item.platform.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-medium leading-none">{item.platform}</span>
                                    <span className="text-xs text-muted-foreground">{item.technologies}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 min-w-[80px]">
                                <p className="text-sm font-medium">{item.earnings}</p>
                                <Progress value={item.progressPercentage} className="h-1.5 w-20" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
