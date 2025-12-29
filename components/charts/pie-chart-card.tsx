"use client"

import { TrendingUp } from "lucide-react"
import { Cell, Pie, PieChart } from "recharts"

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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

interface PieChartCardProps {
  title: string
  description?: string
  data: Array<Record<string, any>>
  config: ChartConfig
  dataKey: string
  nameKey: string
  trend?: {
    value: string
    label: string
    isPositive?: boolean
  }
  className?: string
  height?: number
  showLegend?: boolean
  innerRadius?: number
  outerRadius?: number
}

export function PieChartCard({
  title,
  description,
  data,
  config,
  dataKey,
  nameKey,
  trend,
  className,
  height = 300,
  showLegend = true,
  innerRadius = 0,
  outerRadius = 80,
}: PieChartCardProps) {
  // Generate colors for pie slices
  const colors = Object.keys(config).map(key => config[key].color || `var(--color-${key})`)
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} style={{ height }}>
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              strokeWidth={5}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length] || `hsl(${index * 45}, 70%, 50%)`} 
                />
              ))}
            </Pie>
            {showLegend && <ChartLegend content={<ChartLegendContent nameKey={nameKey} />} />}
          </PieChart>
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
