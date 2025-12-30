"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FileText, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import DashboardPageLayout from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { DataTableBlock } from "@/components/blocks/data-table/data-table-block";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { supabase } from "@/lib/supabaseClient";

type UIReport = {
	id: string;
	name: string;
	type: string;
	generatedAt: string;
	url: string;
};

export default function ReportsPage() {
	const [data, setData] = useState<UIReport[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadReports() {
			try {
				const { data, error } = await supabase
					.from("reports")
					.select("id, name, type, created_at, url")
					.order("created_at", { ascending: false });

				if (error) throw error;

				const normalized: UIReport[] = (data || []).map((r: any) => ({
					id: r.id,
					name: r.name,
					type: r.type,
					generatedAt: r.created_at,
					url: r.url,
				}));

				setData(normalized);
			} catch (error) {
				console.warn("Error loading reports:", error);
				setData([]);
			} finally {
				setLoading(false);
			}
		}

		loadReports();
	}, []);

	const columns: ColumnDef<UIReport>[] = useMemo(
		() => [
			{
				accessorKey: "name",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Report Name" />
				),
				cell: ({ row }) => (
					<span className="font-medium">{row.getValue("name")}</span>
				),
			},
			{
				accessorKey: "type",
				header: "Type",
				cell: ({ row }) => (
					<span className="uppercase text-xs font-bold text-muted-foreground">
						{row.getValue("type")}
					</span>
				),
			},
			{
				accessorKey: "generatedAt",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Generated" />
				),
				cell: ({ row }) =>
					new Date(row.getValue("generatedAt")).toLocaleDateString(),
			},
			{
				id: "actions",
				cell: ({ row }) => (
					<Button variant="ghost" size="sm" asChild>
						<a
							href={row.original.url}
							target="_blank"
							rel="noopener noreferrer"
						>
							Download
						</a>
					</Button>
				),
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
				title: "Reports",
				description: "Access generated operational reports",
				icon: FileText,
			}}
		>
			<div className="flex items-center justify-end mb-4">
				<Button className="rounded-none">Generate New Report</Button>
			</div>

			<DataTableBlock columns={columns} data={data} searchKey="name" />
		</DashboardPageLayout>
	);
}
