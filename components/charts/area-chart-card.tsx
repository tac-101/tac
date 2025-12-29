"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface AreaChartCardProps {
  title: string
  description?: string
  data: Array<Record<string, any>>
  config: ChartConfig
  dataKey: string
  xAxisKey: string
  trend?: {
    value: string
    label: string
    isPositive?: boolean
  }
  className?: string
  height?: number
}

export function AreaChartCard({
  title,
  description,
  data,
  config,
  dataKey,
  xAxisKey,
  trend,
  className,
  height = 300,
}: AreaChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} style={{ height }}>
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={xAxisKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area
              dataKey={dataKey}
              type="natural"
              fill={`var(--color-${dataKey})`}
              fillOpacity={0.4}
              stroke={`var(--color-${dataKey})`}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      {trend && (
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 font-medium leading-none">
                {trend.isPositive !== false ? (
                  <>
                    Trending up by {trend.value} <TrendingUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Trending down by {trend.value} <TrendingUp className="h-4 w-4 rotate-180" />
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 leading-none text-muted-foreground">
                {trend.label}
              </div>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
