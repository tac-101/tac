"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableBlock } from "@/components/blocks/data-table/data-table-block";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

type InvoiceRecord = {
	id: string;
	invoice_ref: string;
	customer_id: string;
	amount: number;
	status: string;
	due_date: string;
};

// Simplified UI type
type UIInvoice = {
	id: string;
	ref: string;
	customer: string;
	amount: number;
	status: string;
	dueDate: string;
};

export default function InvoicesPage() {
	const router = useRouter();
	const [data, setData] = useState<UIInvoice[]>([]);
	const [loading, setLoading] = useState(true);
	const { toast } = useToast();

	useEffect(() => {
		async function loadInvoices() {
			try {
				const { data, error } = await supabase
					.from("invoices")
					.select("id, invoice_ref, amount, status, due_date, customer_id")
					.order("created_at", { ascending: false });

				if (error) throw error;

				// In a real app we'd join customers. For now, placeholder or separate fetch
				const normalized: UIInvoice[] = (data || []).map((inv: any) => ({
					id: inv.id,
					ref: inv.invoice_ref,
					amount: inv.amount,
					status: inv.status,
					dueDate: inv.due_date,
					customer: "Loading...", // Placeholder
				}));

				setData(normalized);
			} catch (error) {
				console.error("Error loading invoices:", error);
				toast({
					title: "Error loading invoices",
					description: "Please try again later.",
					variant: "destructive",
				});
			} finally {
				setLoading(false);
			}
		}

		loadInvoices();
	}, [toast]);

	const columns: ColumnDef<UIInvoice>[] = useMemo(
		() => [
			{
				accessorKey: "ref",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Invoice #" />
				),
				cell: ({ row }) => (
					<span className="font-mono">{row.getValue("ref")}</span>
				),
			},
			{
				accessorKey: "amount",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Amount" />
				),
				cell: ({ row }) => {
					const amount = parseFloat(row.getValue("amount"));
					return new Intl.NumberFormat("en-IN", {
						style: "currency",
						currency: "INR",
					}).format(amount);
				},
			},
			{
				accessorKey: "dueDate",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Due Date" />
				),
				cell: ({ row }) => {
					const date = new Date(row.getValue("dueDate"));
					return date.toLocaleDateString();
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
					let variant: "default" | "secondary" | "destructive" | "outline" =
						"outline";
					if (status === "paid") variant = "default";
					if (status === "overdue") variant = "destructive";

					return (
						<Badge variant={variant} className="capitalize rounded-sm">
							{status}
						</Badge>
					);
				},
			},
			{
				id: "actions",
				cell: ({ row: _row }) => (
					<Button variant="ghost" size="sm">
						<ExternalLink className="h-4 w-4 mr-2" />
						View
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
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Invoices</h2>
					<p className="text-muted-foreground">Manage billing and payments.</p>
				</div>
				<Button asChild>
					<Link href="/dashboard/invoices/new">
						<Plus className="mr-2 h-4 w-4" />
						New Invoice
					</Link>
				</Button>
			</div>

			<DataTableBlock
				columns={columns}
				data={data}
				searchKey="ref"
				searchPlaceholder="Filter by reference..."
				facetedFilters={[
					{
						column: "status",
						title: "Status",
						options: [
							{ label: "Paid", value: "paid" },
							{ label: "Overdue", value: "overdue" },
							{ label: "Pending", value: "pending" },
						],
					},
				]}
			/>
		</div>
	);
}
