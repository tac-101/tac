"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DollarSign, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import DashboardPageLayout from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { DataTableBlock } from "@/components/blocks/data-table/data-table-block";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { supabase } from "@/lib/supabaseClient";

type UIRate = {
	id: string;
	origin: string;
	destination: string;
	ratePerKg: number;
	minWeight: number;
	effectiveDate: string;
};

export default function RatesPage() {
	const [data, setData] = useState<UIRate[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadRates() {
			try {
				const { data, error } = await supabase
					.from("rates")
					.select(
						"id, origin, destination, rate_per_kg, min_weight, effective_date",
					)
					.order("created_at", { ascending: false });

				if (error) throw error;

				const normalized: UIRate[] = (data || []).map((r: any) => ({
					id: r.id,
					origin: r.origin,
					destination: r.destination,
					ratePerKg: r.rate_per_kg,
					minWeight: r.min_weight,
					effectiveDate: r.effective_date,
				}));

				setData(normalized);
			} catch (error) {
				console.warn("Error loading rates:", error);
				setData([]);
			} finally {
				setLoading(false);
			}
		}

		loadRates();
	}, []);

	const columns: ColumnDef<UIRate>[] = useMemo(
		() => [
			{
				accessorKey: "origin",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Origin" />
				),
			},
			{
				accessorKey: "destination",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Destination" />
				),
			},
			{
				accessorKey: "ratePerKg",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Rate / kg" />
				),
				cell: ({ row }) => {
					const rate = parseFloat(row.getValue("ratePerKg"));
					return new Intl.NumberFormat("en-IN", {
						style: "currency",
						currency: "INR",
					}).format(rate);
				},
			},
			{
				accessorKey: "minWeight",
				header: "Min Weight (kg)",
			},
			{
				accessorKey: "effectiveDate",
				header: "Effective From",
				cell: ({ row }) =>
					new Date(row.getValue("effectiveDate")).toLocaleDateString(),
			},
		],
		[],
	);

	if (loading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<DashboardPageLayout
			header={{
				title: "Shipping Rates",
				description: "Manage service pricing and tariffs",
				icon: DollarSign,
			}}
		>
			<div className="flex items-center justify-end mb-4">
				<Button className="rounded-none">Update Rates</Button>
			</div>

			<DataTableBlock columns={columns} data={data} searchKey="origin" />
		</DashboardPageLayout>
	);
}
