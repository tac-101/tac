"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import DashboardPageLayout from "@/components/dashboard/layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DataTableBlock } from "@/components/blocks/data-table/data-table-block";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

type UICustomer = {
	id: string;
	name: string;
	email: string | null;
	phone: string | null;
	createdAt: string;
};

export default function CustomersPage() {
	const [data, setData] = useState<UICustomer[]>([]);
	const [loading, setLoading] = useState(true);
	const { toast } = useToast();

	useEffect(() => {
		async function loadCustomers() {
			try {
				const { data, error } = await supabase
					.from("customers")
					.select("id, name, email, phone, created_at")
					.order("created_at", { ascending: false });

				if (error) throw error;

				const normalized: UICustomer[] = (data || []).map((c: any) => ({
					id: c.id,
					name: c.name,
					email: c.email,
					phone: c.phone,
					createdAt: c.created_at,
				}));

				setData(normalized);
			} catch (error) {
				console.error("Error loading customers:", error);
				toast({
					title: "Error loading customers",
					description: "Please try again later.",
					variant: "destructive",
				});
			} finally {
				setLoading(false);
			}
		}

		loadCustomers();
	}, [toast]);

	const columns: ColumnDef<UICustomer>[] = useMemo(
		() => [
			{
				accessorKey: "name",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Customer" />
				),
				cell: ({ row }) => {
					const name = row.getValue("name") as string;
					return (
						<div className="flex items-center gap-3">
							<Avatar className="h-8 w-8 rounded-full">
								<AvatarFallback>
									{name.slice(0, 2).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<span className="font-medium">{name}</span>
						</div>
					);
				},
			},
			{
				accessorKey: "email",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Email" />
				),
			},
			{
				accessorKey: "phone",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Phone" />
				),
			},
			{
				accessorKey: "createdAt",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Joined" />
				),
				cell: ({ row }) => {
					const date = new Date(row.getValue("createdAt"));
					return date.toLocaleDateString();
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
				title: "Customers",
				description: "Manage your client base",
				icon: Users,
			}}
		>
			<div className="flex items-center justify-end mb-4">
				<Button className="rounded-none">Add Customer</Button>
			</div>

			<DataTableBlock
				columns={columns}
				data={data}
				searchKey="name"
				searchPlaceholder="Filter customers..."
			/>
		</DashboardPageLayout>
	);
}
