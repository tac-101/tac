"use client";

import { format } from "date-fns";
import { AlertTriangle, ArrowDownCircle, ArrowUpCircle, Loader2, Radio, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { DataTableBlock } from "@/components/blocks/data-table/data-table-block";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import type { UIInventoryItem } from "@/features/inventory/types";
import { Settings2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { ColumnDef } from "@tanstack/react-table";

interface InventoryItemExtended extends UIInventoryItem {
	isUpdated?: boolean;
}

export default function InventoryManagement() {
	const [searchTerm, setSearchTerm] = useState("");
	const [locationFilter, setLocationFilter] = useState<string>("all");
	const [inventoryData, setInventoryData] = useState<InventoryItemExtended[]>([]);
	const [loading, setLoading] = useState(true);
	const [userRole, setUserRole] = useState<string | null>(null);
	const [roleLoaded, setRoleLoaded] = useState(false);
	const [isLive, setIsLive] = useState(true);
	const [adjustmentOpen, setAdjustmentOpen] = useState(false);
	const [selectedSku, setSelectedSku] = useState<string | null>(null);
	const [adjustmentType, setAdjustmentType] = useState<"inbound" | "outbound" | "adjustment" | "cycle_count">("inbound");
	const [adjustmentQty, setAdjustmentQty] = useState("");
	const [adjustmentReason, setAdjustmentReason] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const loadInventory = useCallback(async () => {
		setLoading(true);
		try {
			const { data, error } = await supabase
				.from("inventory_items")
				.select(
					"sku, description, location, current_stock, min_stock, last_updated",
				)
				.order("last_updated", { ascending: false });

			if (error) {
				console.warn("Supabase inventory error", error.message);
				throw error;
			}

			const normalized: InventoryItemExtended[] = (data || []).map(
				(row: any) => ({
					sku: row.sku,
					description: row.description ?? "",
					location: row.location ?? "",
					currentStock: row.current_stock ?? 0,
					minStock: row.min_stock ?? 0,
					lastUpdated: row.last_updated ?? "",
					isUpdated: false,
				}),
			);

			setInventoryData(normalized);
		} catch (err) {
			console.error("Failed to load inventory from Supabase", err);
			setInventoryData([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadInventory();
	}, [loadInventory]);

	useEffect(() => {
		if (!isLive) return;

		const channel = supabase
			.channel("realtime-inventory")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "inventory_items",
				},
				(payload) => {
					const updated = payload.new as any;
					if (!updated?.sku) return;

					setInventoryData((prev) => {
						const idx = prev.findIndex((item) => item.sku === updated.sku);
						if (idx === -1) {
							return [
								{
									sku: updated.sku,
									description: updated.description ?? "",
									location: updated.location ?? "",
									currentStock: updated.current_stock ?? 0,
									minStock: updated.min_stock ?? 0,
									lastUpdated: updated.last_updated ?? "",
									isUpdated: true,
								},
								...prev,
							];
						}

						const newData = [...prev];
						newData[idx] = {
							...newData[idx],
							currentStock: updated.current_stock ?? newData[idx].currentStock,
							location: updated.location ?? newData[idx].location,
							lastUpdated: updated.last_updated ?? newData[idx].lastUpdated,
							isUpdated: true,
						};
						return newData;
					});

					setTimeout(() => {
						setInventoryData((prev) =>
							prev.map((item) =>
								item.sku === updated.sku ? { ...item, isUpdated: false } : item
							)
						);
					}, 3000);
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [isLive]);

	useEffect(() => {
		let cancelled = false;

		async function loadUserRole() {
			try {
				const {
					data: { user },
					error,
				} = await supabase.auth.getUser();

				if (error || !user) {
					if (!cancelled) {
						setUserRole(null);
						setRoleLoaded(true);
					}
					return;
				}

				const { data, error: userError } = await supabase
					.from("users")
					.select("role")
					.eq("id", user.id)
					.maybeSingle();

				if (cancelled) return;

				if (userError || !data) {
					setUserRole(null);
				} else {
					setUserRole((data.role as string | null) ?? null);
				}
				setRoleLoaded(true);
			} catch (err) {
				if (cancelled) return;
				console.warn("Failed to load user role for inventory page", err);
				setUserRole(null);
				setRoleLoaded(true);
			}
		}

		void loadUserRole();

		return () => {
			cancelled = true;
		};
	}, []);

	const filteredInventory = useMemo(
		() =>
			inventoryData.filter((item) => {
				const matchesSearch =
					item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
					item.description.toLowerCase().includes(searchTerm.toLowerCase());
				const matchesLocation =
					locationFilter === "all" || item.location === locationFilter;
				return matchesSearch && matchesLocation;
			}),
		[inventoryData, searchTerm, locationFilter],
	);

	const locations = useMemo(
		() => Array.from(new Set(inventoryData.map((i) => i.location))).map(l => ({
			label: l,
			value: l
		})),
		[inventoryData],
	);

	const canEdit = userRole === "manager" || userRole === "admin";

	const getStockStatus = (current: number, min: number) => {
		if (current < min) return "critical";
		if (current < min * 1.5) return "low";
		return "ok";
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "critical":
				return "bg-red-500/20 text-red-400";
			case "low":
				return "bg-yellow-500/20 text-yellow-400";
			case "ok":
				return "bg-green-500/20 text-green-400";
			default:
				return "bg-gray-500/20 text-gray-400";
		}
	};

	const columns: ColumnDef<InventoryItemExtended>[] = useMemo(() => [
		{
			accessorKey: "sku",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="SKU" />
			),
			cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("sku")}</span>,
		},
		{
			accessorKey: "description",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Description" />
			),
		},
		{
			accessorKey: "location",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Location" />
			),
			cell: ({ row }) => <span className="text-xs">{row.getValue("location")}</span>,
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		},
		{
			accessorKey: "currentStock",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Current" />
			),
			cell: ({ row }) => <span className="font-bold">{row.getValue("currentStock")}</span>,
		},
		{
			accessorKey: "minStock",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Min Level" />
			),
		},
		{
			id: "status",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Status" />
			),
			cell: ({ row }) => {
				const item = row.original;
				const status = getStockStatus(item.currentStock, item.minStock);
				return (
					<span className={`px-2 py-1 text-xs font-semibold rounded-sm ${getStatusColor(status)}`}>
						{status.toUpperCase()}
					</span>
				)
			}
		},
		{
			accessorKey: "lastUpdated",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Last Updated" />
			),
			cell: ({ row }) => {
				const val = row.getValue("lastUpdated") as string;
				if (!val) return "Not available";
				const d = new Date(val);
				if (Number.isNaN(d.getTime())) return val;
				return <span className="text-xs text-muted-foreground">{d.toLocaleString("en-IN")}</span>;
			}
		},
		{
			id: "actions",
			header: "Action",
			cell: ({ row }) => {
				if (!canEdit) return null;
				return (
					<Button
						variant="ghost"
						size="icon"
						onClick={() => {
							setSelectedSku(row.original.sku);
							setAdjustmentOpen(true);
						}}
						className="h-8 w-8"
					>
						<Settings2 className="h-4 w-4" />
					</Button>
				)
			}
		}
	], [canEdit]);

	const handleAdjustment = async () => {
		if (!selectedSku || !adjustmentQty) return;

		const qty = parseInt(adjustmentQty, 10);
		const isAbsolute = adjustmentType === "adjustment" || adjustmentType === "cycle_count";
		if (isNaN(qty) || (!isAbsolute && qty <= 0) || (isAbsolute && qty < 0)) {
			toast.error("Please enter a valid quantity");
			return;
		}

		setIsSubmitting(true);
		try {
			const res = await fetch("/api/inventory", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					sku: selectedSku,
					adjustmentType,
					quantity: qty,
					reason: adjustmentReason || undefined,
				}),
			});

			const json = await res.json();

			if (!res.ok) {
				throw new Error(json.error || "Failed to adjust stock");
			}

			const toastMsg = isAbsolute
				? `Stock for ${selectedSku} updated to ${qty}`
				: `Stock ${adjustmentType === "inbound" ? "increased" : "decreased"} by ${qty}`;

			toast.success(toastMsg);
			setAdjustmentOpen(false);
			setSelectedSku(null);
			setAdjustmentQty("");
			setAdjustmentReason("");
		} catch (err: any) {
			toast.error(err.message || "Failed to adjust stock");
		} finally {
			setIsSubmitting(false);
		}
	};

	const criticalCount = inventoryData.filter(
		(i) => getStockStatus(i.currentStock, i.minStock) === "critical"
	).length;

	const lowCount = inventoryData.filter(
		(i) => getStockStatus(i.currentStock, i.minStock) === "low"
	).length;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Inventory & Goods</h2>
					<p className="text-muted-foreground">
						Perpetual inventory with real-time stock tracking.
					</p>
				</div>
			</div>

			<div className="space-y-6">
				{/* Header Controls */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<div
							className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono uppercase tracking-wider border ${isLive
								? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
								: "bg-muted text-muted-foreground border-border"
								}`}
						>
							<Radio className={`h-3 w-3 ${isLive ? "animate-pulse" : ""}`} />
							{isLive ? "Live" : "Paused"}
						</div>
						{criticalCount > 0 && (
							<Badge variant="destructive" className="font-mono gap-1">
								<AlertTriangle className="h-3 w-3" />
								{criticalCount} critical
							</Badge>
						)}
					</div>

					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							className="rounded-none"
							onClick={() => setIsLive(!isLive)}
						>
							{isLive ? "Pause" : "Resume"}
						</Button>
						<Button
							variant="default"
							size="sm"
							className="rounded-none"
							onClick={loadInventory}
							disabled={loading}
						>
							{loading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<RefreshCw className="h-4 w-4 mr-2" />
							)}
							Refresh
						</Button>
					</div>
				</div>



				{roleLoaded && !canEdit && (
					<p className="text-xs text-muted-foreground">
						You have read-only access. Contact an admin to adjust inventory
						counts.
					</p>
				)}

				{/* Inventory Summary */}
				<div className="grid grid-cols-3 gap-2 sm:gap-4">
					<Card className="shadow-sm">
						<CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
							<CardTitle className="text-xs sm:text-sm">Total SKUs</CardTitle>
						</CardHeader>
						<CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
							<p className="text-xl sm:text-3xl font-bold">
								{inventoryData.length}
							</p>
						</CardContent>
					</Card>
					<Card className="shadow-sm">
						<CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
							<CardTitle className="text-xs sm:text-sm">Low Stock</CardTitle>
						</CardHeader>
						<CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
							<p className="text-xl sm:text-3xl font-bold text-yellow-400">
								{
									inventoryData.filter(
										(i) => getStockStatus(i.currentStock, i.minStock) === "low",
									).length
								}
							</p>
						</CardContent>
					</Card>
					<Card className="shadow-sm">
						<CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
							<CardTitle className="text-xs sm:text-sm">Critical</CardTitle>
						</CardHeader>
						<CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
							<p className="text-xl sm:text-3xl font-bold text-red-400">
								{
									inventoryData.filter(
										(i) =>
											getStockStatus(i.currentStock, i.minStock) === "critical",
									).length
								}
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Inventory Table */}
				{/* Inventory Table */}
				<DataTableBlock
					columns={columns}
					data={inventoryData}
					searchKey="description"
					searchPlaceholder="Filter items..."
					facetedFilters={[
						{
							column: "location",
							title: "Location",
							options: locations
						}
					]}
				/>

				{/* Adjustment Dialog */}
				<Dialog open={adjustmentOpen} onOpenChange={setAdjustmentOpen}>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>Stock Adjustment</DialogTitle>
							<DialogDescription>
								Update stock levels for reference: <span className="font-mono font-bold">{selectedSku}</span>
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="type" className="text-right">Type</Label>
								<Select
									value={adjustmentType}
									onValueChange={(v: any) => setAdjustmentType(v)}
								>
									<SelectTrigger id="type" className="col-span-3">
										<SelectValue placeholder="Select type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="inbound">Inbound (+)</SelectItem>
										<SelectItem value="outbound">Outbound (-)</SelectItem>
										<SelectItem value="adjustment">Set Absolute (Override)</SelectItem>
										<SelectItem value="cycle_count">Cycle Count</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="qty" className="text-right">Quantity</Label>
								<Input
									id="qty"
									type="number"
									className="col-span-3"
									value={adjustmentQty}
									onChange={(e) => setAdjustmentQty(e.target.value)}
									placeholder={adjustmentType === "adjustment" || adjustmentType === "cycle_count" ? "New total" : "Change amount"}
								/>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="reason" className="text-right">Reason</Label>
								<Input
									id="reason"
									className="col-span-3"
									value={adjustmentReason}
									onChange={(e) => setAdjustmentReason(e.target.value)}
									placeholder="e.g. Damage, Restock"
								/>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setAdjustmentOpen(false)}>Cancel</Button>
							<Button disabled={isSubmitting} onClick={handleAdjustment}>
								{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
								Apply Adjustment
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
