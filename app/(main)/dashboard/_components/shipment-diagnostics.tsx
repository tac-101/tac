"use client";

import * as React from "react";
import { useId, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const description = "Shipment Traffic Diagnostics";

// Generate shipment data
const generateShipmentData = () => {
	const data = [];
	const startDate = new Date("2024-10-01");
	const endDate = new Date("2024-12-31");

	for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
		const dateStr = d.toISOString().split("T")[0];
		const dayOfWeek = d.getDay();
		const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
		const baseShipments = isWeekend ? 15 : 45;
		const baseDelivered = isWeekend ? 12 : 38;

		data.push({
			date: dateStr,
			shipments: baseShipments + Math.floor(Math.random() * 25),
			delivered: baseDelivered + Math.floor(Math.random() * 18),
			exceptions: Math.random() > 0.8 ? Math.floor(Math.random() * 5) : 0,
		});
	}
	return data;
};

const chartData = generateShipmentData();

const chartConfig = {
	shipments: {
		label: "Total Flow",
		color: "var(--chart-1)",
	},
	delivered: {
		label: "Successful Handovers",
		color: "var(--chart-2)",
	},
	exceptions: {
		label: "Active Exceptions",
		color: "var(--destructive)",
	},
} satisfies ChartConfig;

export function ShipmentDiagnostics() {
	const id = useId();
	const [timeRange, setTimeRange] = useState("90d");

	const filteredData = useMemo(() => {
		const referenceDate = new Date("2024-12-31");
		let daysToSubtract = 90;
		if (timeRange === "30d") daysToSubtract = 30;
		if (timeRange === "7d") daysToSubtract = 7;

		const startDate = new Date(referenceDate);
		startDate.setDate(startDate.getDate() - daysToSubtract);

		return chartData.filter((item) => new Date(item.date) >= startDate);
	}, [timeRange]);

	return (
		<Card className="col-span-1 md:col-span-1 lg:col-span-1 shadow-sm hover:shadow-md transition-shadow duration-200">
			<CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
				<div className="grid flex-1 gap-1 text-center sm:text-left">
					<CardTitle className="text-lg font-heading font-semibold tracking-tight">
						Diagnostics
					</CardTitle>
					<CardDescription className="text-muted-foreground">
						Real-time traffic analysis & network health
					</CardDescription>
				</div>
				<ToggleGroup type="single" value={timeRange} onValueChange={(val) => val && setTimeRange(val)} className="bg-muted p-1 rounded-lg">
					<ToggleGroupItem value="7d" className="rounded-md px-3 h-7 text-xs data-[state=on]:bg-background data-[state=on]:text-foreground shadow-none data-[state=on]:shadow-sm transition-all">7d</ToggleGroupItem>
					<ToggleGroupItem value="30d" className="rounded-md px-3 h-7 text-xs data-[state=on]:bg-background data-[state=on]:text-foreground shadow-none data-[state=on]:shadow-sm transition-all">30d</ToggleGroupItem>
					<ToggleGroupItem value="90d" className="rounded-md px-3 h-7 text-xs data-[state=on]:bg-background data-[state=on]:text-foreground shadow-none data-[state=on]:shadow-sm transition-all">90d</ToggleGroupItem>
				</ToggleGroup>
			</CardHeader>
			<CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
				<ChartContainer
					config={chartConfig}
					className="aspect-auto h-[280px] w-full"
				>
					<AreaChart data={filteredData}>
						<defs>
							<linearGradient
								id={`fillShipments-${id}`}
								x1="0"
								y1="0"
								x2="0"
								y2="1"
							>
								<stop
									offset="5%"
									stopColor="var(--color-shipments)"
									stopOpacity={0.8}
								/>
								<stop
									offset="95%"
									stopColor="var(--color-shipments)"
									stopOpacity={0.1}
								/>
							</linearGradient>
							<linearGradient
								id={`fillDelivered-${id}`}
								x1="0"
								y1="0"
								x2="0"
								y2="1"
							>
								<stop
									offset="5%"
									stopColor="var(--color-delivered)"
									stopOpacity={0.8}
								/>
								<stop
									offset="95%"
									stopColor="var(--color-delivered)"
									stopOpacity={0.1}
								/>
							</linearGradient>
							<linearGradient
								id={`fillExceptions-${id}`}
								x1="0"
								y1="0"
								x2="0"
								y2="1"
							>
								<stop
									offset="5%"
									stopColor="var(--color-exceptions)"
									stopOpacity={0.8}
								/>
								<stop
									offset="95%"
									stopColor="var(--color-exceptions)"
									stopOpacity={0.1}
								/>
							</linearGradient>
						</defs>
						<CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.5} />
						<XAxis
							dataKey="date"
							tickLine={false}
							axisLine={false}
							tickMargin={10}
							minTickGap={32}
							tickFormatter={(value) => {
								const date = new Date(value);
								return date.toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
								});
							}}
							stroke="var(--muted-foreground)"
							fontSize={11}
							fontFamily="var(--font-mono)"
						/>
						<YAxis
							tickLine={false}
							axisLine={false}
							tickMargin={10}
							stroke="var(--muted-foreground)"
							fontSize={11}
							fontFamily="var(--font-mono)"
						/>
						<ChartTooltip
							cursor={{
								stroke: "var(--primary)",
								strokeWidth: 1,
								strokeDasharray: "4 4",
							}}
							content={
								<ChartTooltipContent
									labelFormatter={(value) => {
										return new Date(value).toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
										});
									}}
									indicator="dot"
									className="w-[180px]"
								/>
							}
						/>
						<Area
							dataKey="shipments"
							type="monotone"
							fill={`url(#fillShipments-${id})`}
							fillOpacity={0.4}
							stroke="var(--color-shipments)"
							strokeWidth={2}
							stackId="a"
							animationDuration={1500}
						/>
						<Area
							dataKey="exceptions"
							type="monotone"
							fill={`url(#fillExceptions-${id})`}
							fillOpacity={0.4}
							stroke="var(--color-exceptions)"
							strokeWidth={2}
							stackId="a"
							animationDuration={1500}
						/>
						<Area
							dataKey="delivered"
							type="monotone"
							fill={`url(#fillDelivered-${id})`}
							fillOpacity={0.4}
							stroke="var(--color-delivered)"
							strokeWidth={2}
							stackId="a"
							animationDuration={1500}
						/>
						<ChartLegend content={<ChartLegendContent />} className="mt-4" />
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
