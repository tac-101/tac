"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, Warehouse } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import DashboardPageLayout from "@/components/dashboard/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableBlock } from "@/components/blocks/data-table/data-table-block";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

type UIWarehouse = {
	id: string;
	name: string;
	location: string;
	capacityUsed: number;
	totalCapacity: number;
	status: string;
};

export default function WarehousePage() {
	const [data, setData] = useState<UIWarehouse[]>([]);
	const [loading, setLoading] = useState(true);
	const { toast } = useToast();

	useEffect(() => {
		async function loadWarehouses() {
			try {
				const { data, error } = await supabase
					.from("warehouses")
					.select("id, name, location, capacity_used, total_capacity, status")
					.order("name", { ascending: true });

				if (error) throw error;

				const normalized: UIWarehouse[] = (data || []).map((w: any) => ({
					id: w.id,
					name: w.name,
					location: w.location,
					capacityUsed: w.capacity_used,
					totalCapacity: w.total_capacity,
					status: w.status,
				}));

				setData(normalized);
			} catch (error) {
				console.error("Error loading warehouses:", error instanceof Error ? error.message : error);
				toast({
					title: "Error loading warehouses",
					description: "Please try again later.",
					variant: "destructive",
				});
			} finally {
				setLoading(false);
			}
		}

		loadWarehouses();
	}, [toast]);

	const columns: ColumnDef<UIWarehouse>[] = useMemo(
		() => [
			{
				accessorKey: "name",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Warehouse" />
				),
				cell: ({ row }) => (
					<span className="font-medium">{row.getValue("name")}</span>
				),
			},
			{
				accessorKey: "location",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Location" />
				),
				cell: ({ row }) => (
					<span className="uppercase">{row.getValue("location")}</span>
				),
			},
			{
				accessorKey: "utilization",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Utilization" />
				),
				cell: ({ row }) => {
					const used = row.original.capacityUsed;
					const total = row.original.totalCapacity;
					const percentage = total > 0 ? (used / total) * 100 : 0;

					return (
						<div className="w-[120px] space-y-1">
							<div className="flex justify-between text-xs text-muted-foreground">
								<span>
									{used}/{total} units
								</span>
								<span>{Math.round(percentage)}%</span>
							</div>
							<Progress value={percentage} className="h-2" />
						</div>
					);
				},
			},
			{
				accessorKey: "status",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Status" />
				),
				filterFn: (row, id, value) => {
					return value.includes(row.getValue(id));
				},
				cell: ({ row }) => {
					const status = row.getValue("status") as string;
					return (
						<Badge
							variant={status === "active" ? "default" : "secondary"}
							className="capitalize rounded-sm"
						>
							{status}
						</Badge>
					);
				},
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
				title: "Warehouse",
				description: "Inventory and capacity management",
				icon: Warehouse,
			}}
		>
			<div className="flex items-center justify-end mb-4">
				<Button className="rounded-none">Add Warehouse</Button>
			</div>

			<DataTableBlock
				columns={columns}
				data={data}
				searchKey="name"
				searchPlaceholder="Filter warehouses..."
				facetedFilters={[
					{
						column: "status",
						title: "Status",
						options: [
							{ label: "Active", value: "active" },
							{ label: "Inactive", value: "inactive" },
							{ label: "Maintenance", value: "maintenance" },
						],
					},
				]}
			/>
		</DashboardPageLayout>
	);
}
