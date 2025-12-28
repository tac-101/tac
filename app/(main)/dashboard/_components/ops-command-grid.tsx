"use client";

import { IconActivity, IconAlertTriangle } from "@tabler/icons-react";
import { AlertCircle, FileText, Package, TrendingUp, Users, Warehouse } from "lucide-react";
import Link from "next/link";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import React, { useRef, useState } from "react";

import { MotionItem, MotionList } from "@/components/ui/motion-wrapper";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

// Spotlight Card Component
const SpotlightCard = ({ children, className = "", spotlightColor = "rgba(255, 255, 255, 0.1)" }: { children: React.ReactNode; className?: string, spotlightColor?: string }) => {
	const divRef = useRef<HTMLDivElement>(null);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [opacity, setOpacity] = useState(0);

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!divRef.current) return;
		const rect = divRef.current.getBoundingClientRect();
		setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
	};

	const handleMouseEnter = () => setOpacity(1);
	const handleMouseLeave = () => setOpacity(0);

	return (
		<div
			ref={divRef}
			onMouseMove={handleMouseMove}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			className={cn(
				"relative h-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow transition-all duration-300 hover:shadow-lg",
				className
			)}
		>
			<div
				className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
				style={{
					opacity,
					background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
				}}
			/>
			<div className="relative h-full bg-noise">
				{children}
			</div>
		</div>
	);
};

interface OpsCommandGridProps {
	stats?: {
		totalShipments: number;
		activeCustomers: number;
		pendingInvoices: number;
		warehouseCapacity: number;
		exceptionsThisWeek: number;
		shipmentsTrend: number;
		customersTrend: number;
		invoicesTrend: number;
		capacityTrend: number;
		exceptionsTrend: number;
	};
}

// Mock data generator for sparklines
const generateSparkline = (points: number, trend: "up" | "down" | "neutral") => {
	const data = [];
	let current = 50;
	for (let i = 0; i < points; i++) {
		const change = Math.random() * 20 - 10 + (trend === "up" ? 2 : trend === "down" ? -2 : 0);
		current = Math.max(10, Math.min(90, current + change));
		data.push({ i, value: current });
	}
	return data;
};

export function OpsCommandGrid({ stats }: OpsCommandGridProps) {
	const data = stats || {
		totalShipments: 0,
		activeCustomers: 0,
		pendingInvoices: 0,
		warehouseCapacity: 0,
		exceptionsThisWeek: 0,
		shipmentsTrend: 0,
		customersTrend: 0,
		invoicesTrend: 0,
		capacityTrend: 0,
		exceptionsTrend: 0,
	};

	// Determine chart colors based on trend
	const getTrendColor = (trend: number, invert = false) => {
		if (invert) return trend > 0 ? "var(--chart-warning)" : "var(--chart-success)";
		return trend >= 0 ? "var(--chart-success)" : "var(--chart-warning)";
	};

	return (
		<MotionList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4" stagger={0.1}>
			{/* Exceptions - High Priority */}
			<MotionItem>
				<Link href="/dashboard/exceptions" className="block group h-full">
					<SpotlightCard className="border-l-4 border-l-destructive bg-card/60 backdrop-blur-md" spotlightColor="rgba(239, 68, 68, 0.15)">
						<CardHeader className="pb-2 relative z-10">
							<div className="flex justify-between items-start">
								<p className="text-xs font-bold text-muted-foreground tracking-wider uppercase">
									Exceptions
								</p>
								<IconAlertTriangle className="w-5 h-5 text-destructive animate-pulse" />
							</div>
							<CardTitle className="text-4xl font-heading font-bold text-destructive tracking-tight mt-2">
								{data.exceptionsThisWeek}
							</CardTitle>
						</CardHeader>
						<CardContent className="relative z-10">
							<div className="flex items-center gap-2 text-sm">
								<Badge
									variant="outline"
									className="bg-destructive/10 border-destructive/20 text-destructive font-mono"
								>
									{data.exceptionsTrend > 0 ? "+" : ""}
									{data.exceptionsTrend}%
								</Badge>
								<span className="text-muted-foreground text-xs">critical issues</span>
							</div>
							<div className="h-10 mt-4 -mx-2 opacity-50 group-hover:opacity-100 transition-opacity">
								<ChartContainer config={{ value: { theme: { light: "var(--destructive)", dark: "var(--destructive)" } } }} className="h-full w-full">
									<AreaChart data={generateSparkline(20, data.exceptionsTrend > 0 ? "up" : "down")}>
										<defs>
											<linearGradient id="fillDestructive" x1="0" y1="0" x2="0" y2="1">
												<stop offset="5%" stopColor="var(--destructive)" stopOpacity={0.3} />
												<stop offset="95%" stopColor="var(--destructive)" stopOpacity={0} />
											</linearGradient>
										</defs>
										<Area
											type="monotone"
											dataKey="value"
											stroke="var(--destructive)"
											fill="url(#fillDestructive)"
											strokeWidth={2}
										/>
									</AreaChart>
								</ChartContainer>
							</div>
						</CardContent>
					</SpotlightCard>
				</Link>
			</MotionItem>

			{/* Active Shipments */}
			<MotionItem>
				<SpotlightCard className="border-l-4 border-l-primary bg-card/60 backdrop-blur-md group" spotlightColor="rgba(var(--primary), 0.15)">
					<CardHeader className="pb-2 relative z-10">
						<div className="flex justify-between items-start">
							<p className="text-xs font-bold text-muted-foreground tracking-wider uppercase">
								Shipments
							</p>
							<Package className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
						</div>
						<CardTitle className="text-4xl font-heading font-bold tracking-tight mt-2">
							{data.totalShipments.toLocaleString()}
						</CardTitle>
					</CardHeader>
					<CardContent className="relative z-10">
						<div className="flex items-center gap-2 text-sm">
							<Badge
								variant="outline"
								className={cn(
									"font-mono",
									data.shipmentsTrend >= 0
										? "bg-success/10 text-success border-success/20"
										: "bg-destructive/10 text-destructive border-destructive/20"
								)}
							>
								<TrendingUp className="w-3 h-3 mr-1" />
								{data.shipmentsTrend}%
							</Badge>
							<span className="text-muted-foreground text-xs">active</span>
						</div>
						<div className="h-10 mt-4 -mx-2 opacity-50 group-hover:opacity-100 transition-opacity">
							<ChartContainer config={{ value: { theme: { light: "var(--primary)", dark: "var(--primary)" } } }} className="h-full w-full">
								<AreaChart data={generateSparkline(20, "up")}>
									<defs>
										<linearGradient id="fillPrimary" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
											<stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
										</linearGradient>
									</defs>
									<Area
										type="monotone"
										dataKey="value"
										stroke="var(--primary)"
										fill="url(#fillPrimary)"
										strokeWidth={2}
									/>
								</AreaChart>
							</ChartContainer>
						</div>
					</CardContent>
				</SpotlightCard>
			</MotionItem>

			{/* Warehouse Load */}
			<MotionItem>
				<SpotlightCard className={cn(
					"border-l-4 bg-card/60 backdrop-blur-md group",
					data.warehouseCapacity > 85 ? "border-l-chart-warning" : "border-l-chart-4"
				)} spotlightColor="rgba(var(--chart-4), 0.15)">
					<CardHeader className="pb-2 relative z-10">
						<div className="flex justify-between items-start">
							<p className="text-xs font-bold text-muted-foreground tracking-wider uppercase">
								Warehouse
							</p>
							<Warehouse className={cn(
								"w-5 h-5 transition-transform duration-300 group-hover:scale-110",
								data.warehouseCapacity > 85 ? "text-chart-warning" : "text-chart-4"
							)} />
						</div>
						<CardTitle className="text-4xl font-heading font-bold tracking-tight mt-2 flex items-baseline gap-1">
							{data.warehouseCapacity}<span className="text-xl font-normal text-muted-foreground">%</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="relative z-10">
						<div className="flex flex-col gap-2">
							<div className="flex items-center gap-2 text-sm mb-1">
								<span className="text-muted-foreground text-xs">Utilization</span>
							</div>
							<div className="h-2 w-full bg-muted rounded-full overflow-hidden">
								<div
									className={cn("h-full transition-all duration-500 ease-out",
										data.warehouseCapacity > 90 ? "bg-destructive" :
											data.warehouseCapacity > 75 ? "bg-chart-warning" : "bg-chart-4"
									)}
									style={{ width: `${data.warehouseCapacity}%` }}
								/>
							</div>
						</div>
					</CardContent>
				</SpotlightCard>
			</MotionItem>

			{/* Pending Invoices */}
			<MotionItem>
				<SpotlightCard className="border-l-4 border-l-chart-2 bg-card/60 backdrop-blur-md group" spotlightColor="rgba(var(--chart-2), 0.15)">
					<CardHeader className="pb-2 relative z-10">
						<div className="flex justify-between items-start">
							<p className="text-xs font-bold text-muted-foreground tracking-wider uppercase">
								Invoices
							</p>
							<FileText className="w-5 h-5 text-chart-2 group-hover:scale-110 transition-transform duration-300" />
						</div>
						<CardTitle className="text-4xl font-heading font-bold tracking-tight mt-2">
							{data.pendingInvoices}
						</CardTitle>
					</CardHeader>
					<CardContent className="relative z-10">
						<div className="flex items-center gap-2 text-sm">
							<Badge
								variant="outline"
								className="bg-chart-2/10 text-chart-2 border-chart-2/20 font-mono"
							>
								Action
							</Badge>
							<span className="text-muted-foreground text-xs">pending payment</span>
						</div>
						<div className="h-10 mt-4 -mx-2 opacity-50 group-hover:opacity-100 transition-opacity">
							<ChartContainer config={{ value: { theme: { light: "var(--chart-2)", dark: "var(--chart-2)" } } }} className="h-full w-full">
								<AreaChart data={generateSparkline(20, "neutral")}>
									<defs>
										<linearGradient id="fillChart2" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
											<stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
										</linearGradient>
									</defs>
									<Area
										type="monotone"
										dataKey="value"
										stroke="var(--chart-2)"
										fill="url(#fillChart2)"
										strokeWidth={2}
									/>
								</AreaChart>
							</ChartContainer>
						</div>
					</CardContent>
				</SpotlightCard>
			</MotionItem>

			{/* Active Customers */}
			<MotionItem>
				<SpotlightCard className="border-l-4 border-l-chart-5 bg-card/60 backdrop-blur-md group" spotlightColor="rgba(var(--chart-5), 0.15)">
					<CardHeader className="pb-2 relative z-10">
						<div className="flex justify-between items-start">
							<p className="text-xs font-bold text-muted-foreground tracking-wider uppercase">
								Customers
							</p>
							<Users className="w-5 h-5 text-chart-5 group-hover:scale-110 transition-transform duration-300" />
						</div>
						<CardTitle className="text-4xl font-heading font-bold tracking-tight mt-2">
							{data.activeCustomers}
						</CardTitle>
					</CardHeader>
					<CardContent className="relative z-10">
						<div className="flex items-center gap-2 text-sm">
							<Badge
								variant="outline"
								className="bg-chart-5/10 text-chart-5 border-chart-5/20 font-mono"
							>
								+{data.customersTrend}%
							</Badge>
							<span className="text-muted-foreground text-xs">active base</span>
						</div>
						<div className="h-10 mt-4 -mx-2 opacity-50 group-hover:opacity-100 transition-opacity">
							<ChartContainer config={{ value: { theme: { light: "var(--chart-5)", dark: "var(--chart-5)" } } }} className="h-full w-full">
								<AreaChart data={generateSparkline(20, "up")}>
									<defs>
										<linearGradient id="fillChart5" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="var(--chart-5)" stopOpacity={0.3} />
											<stop offset="95%" stopColor="var(--chart-5)" stopOpacity={0} />
										</linearGradient>
									</defs>
									<Area
										type="monotone"
										dataKey="value"
										stroke="var(--chart-5)"
										fill="url(#fillChart5)"
										strokeWidth={2}
									/>
								</AreaChart>
							</ChartContainer>
						</div>
					</CardContent>
				</SpotlightCard>
			</MotionItem>
		</MotionList>
	);
}
