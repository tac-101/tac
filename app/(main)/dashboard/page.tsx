"use client";

import React from "react";
import {
	CalendarX2,
	Truck,
	TriangleAlert,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { StatisticsCard } from "@/app/(main)/dashboard/_components/widgets/statistics-card-01";
import { ProductInsightsCard } from "@/app/(main)/dashboard/_components/widgets/widget-product-insights";
import { TotalEarningCard } from "@/app/(main)/dashboard/_components/widgets/widget-total-earning";
import { SalesMetricsCard } from "@/app/(main)/dashboard/_components/widgets/chart-sales-metrics";
import TransactionDatatable, { type Item } from "@/app/(main)/dashboard/_components/widgets/datatable-transaction";
import PageContainer from "@/components/layout/page-container";

// Statistics card data
const StatisticsCardData = [
	{
		icon: <Truck className="size-4" />,
		value: "42",
		title: "Shipped Orders",
		changePercentage: "+18.2%",
	},
	{
		icon: <TriangleAlert className="size-4" />,
		value: "8",
		title: "Damaged Returns",
		changePercentage: "-8.7%",
	},
	{
		icon: <CalendarX2 className="size-4" />,
		value: "27",
		title: "Missed Delivery Slots",
		changePercentage: "+4.3%",
	},
];

// Earning data for Total Earning card
const earningData = [
	{
		icon: "",
		platform: "Zipcar",
		technologies: "Vuejs & HTML",
		earnings: "-$23,569.26",
		progressPercentage: 75,
		colorClass: "bg-emerald-500/10 text-emerald-500",
	},
	{
		icon: "",
		platform: "Bitbank",
		technologies: "Figma & React",
		earnings: "-$12,650.31",
		progressPercentage: 25,
		colorClass: "bg-blue-500/10 text-blue-500",
	},
];

const transactionData: Item[] = [
	{
		id: "1",
		avatar: "https://github.com/shadcn.png",
		avatarFallback: "HR",
		name: "Hallie Richards",
		email: "hallie.richards@example.com",
		amount: 129.99,
		status: "paid",
		paidBy: "mastercard"
	},
	{
		id: "2",
		avatar: "https://github.com/shadcn.png",
		avatarFallback: "MJ",
		name: "Michael Jones",
		email: "michael.jones@example.com",
		amount: 59.50,
		status: "pending",
		paidBy: "visa"
	},
	{
		id: "3",
		avatar: "https://github.com/shadcn.png",
		avatarFallback: "SK",
		name: "Sarah King",
		email: "sarah.king@example.com",
		amount: 245.00,
		status: "processing",
		paidBy: "visa"
	},
	{
		id: "4",
		avatar: "https://github.com/shadcn.png",
		avatarFallback: "DL",
		name: "David Lee",
		email: "david.lee@example.com",
		amount: 89.99,
		status: "failed",
		paidBy: "mastercard"
	},
	{
		id: "5",
		avatar: "https://github.com/shadcn.png",
		avatarFallback: "AM",
		name: "Andrea Morgan",
		email: "andrea.morgan@example.com",
		amount: 154.20,
		status: "paid",
		paidBy: "visa"
	}
]

export default function DashboardHome() {
	return (
		<PageContainer
			pageTitle="Dashboard"
			pageDescription="Core operations overview for shipments, customers, billing, and capacity."
		>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{/* Statistics Cards - Full Width on Mobile, Grid on Large */}
				<div className="col-span-full grid gap-6 sm:grid-cols-3">
					{StatisticsCardData.map((card, index) => (
						<StatisticsCard
							key={index}
							icon={card.icon}
							title={card.title}
							value={card.value}
							changePercentage={card.changePercentage}
						/>
					))}
				</div>

				{/* Middle Row: Product Insights & Total Earnings */}
				<div className="col-span-full grid gap-6 lg:grid-cols-2">
					<ProductInsightsCard className="h-full" />

					<TotalEarningCard
						title="Total Earning"
						earning={24650}
						trend="up"
						percentage={10}
						comparisonText="Compare to last year ($84,325)"
						earningData={earningData}
						className="h-full"
					/>
				</div>

				{/* Sales Metrics Card (Spans full width) */}
				<SalesMetricsCard className="col-span-full" />

				{/* Transaction Table */}
				<Card className="col-span-full w-full py-0">
					<TransactionDatatable data={transactionData} />
				</Card>
			</div>
		</PageContainer>
	);
}
