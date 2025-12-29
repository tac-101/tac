import * as Sentry from "@sentry/nextjs";
import DashboardPageLayout from "@/components/dashboard/layout";
import { OpsCommandGrid } from "@/components/dashboard/ops-command-grid";
import { RecentShipments } from "@/components/dashboard/recent-shipments";
import { ShipmentDiagnostics } from "@/components/dashboard/shipment-diagnostics";
import { ShipmentMap } from "./_components/shipment-map";
import { ShipmentsDataTable } from "@/components/dashboard/shipments-data-table";
import BracketsIcon from "@/components/icons/brackets";

type TypedShipment = {
	id: number;
	shipment_ref: string;
	customer_name: string;
	origin: string;
	destination: string;
	status: "pending" | "in_transit" | "delivered" | "cancelled";
	weight: number;
	created_at: string;
};

// Fetch dashboard stats from Supabase (safe if env missing)
async function getDashboardStats() {
	const logger = (Sentry as any).logger ?? console;

	return Sentry.startSpan(
		{
			op: "db.query",
			name: "dashboard:getDashboardStats",
		},
		async (span) => {
			try {
				const { supabaseAdmin } = await import("@/lib/supabaseAdmin");

				const [shipmentsRes, customersRes, invoicesRes, warehouseRes] =
					await Promise.all([
						supabaseAdmin
							.from("shipments")
							.select("id, status", { count: "exact" }),
						supabaseAdmin.from("customers").select("id", { count: "exact" }),
						supabaseAdmin
							.from("invoices")
							.select("id, amount, status", { count: "exact" }),
						supabaseAdmin
							.from("warehouses")
							.select("id, capacity_used", { count: "exact" }),
					]);

				span.setAttribute("dashboard.shipments.count", shipmentsRes.count ?? 0);
				span.setAttribute("dashboard.customers.count", customersRes.count ?? 0);
				span.setAttribute("dashboard.invoices.count", invoicesRes.count ?? 0);
				span.setAttribute(
					"dashboard.warehouses.count",
					warehouseRes.count ?? 0,
				);

				const activeShipments =
					shipmentsRes.data?.filter((s) =>
						["pending", "in_transit", "processing"].includes(s.status),
					).length ?? 0;

				const pendingInvoices =
					invoicesRes.data?.filter(
						(i) =>
							i.status === "pending" ||
							i.status === "overdue" ||
							i.status === "unpaid",
					).length ?? 0;

				const avgCapacity = warehouseRes.data?.length
					? warehouseRes.data.reduce(
						(sum, w) => sum + (Number(w.capacity_used) || 0),
						0,
					) / warehouseRes.data.length
					: 0;

				return {
					totalShipments: shipmentsRes.count ?? activeShipments,
					activeShipments,
					activeCustomers: customersRes.count ?? 0,
					pendingInvoices: pendingInvoices,
					warehouseCapacity: Math.round(avgCapacity),
					shipmentsTrend: 12.5,
					customersTrend: 8.2,
					invoicesTrend: -5.3,
					capacityTrend: -2.3,
					exceptionsThisWeek: 12,
					exceptionsTrend: 5.4,
				};
			} catch (error) {
				Sentry.captureException(error);

				logger.error(
					logger.fmt`Error fetching dashboard stats: ${error instanceof Error ? error.message : "unknown error"
						}`,
				);

				return {
					totalShipments: 0,
					activeShipments: 0,
					activeCustomers: 0,
					pendingInvoices: 0,
					warehouseCapacity: 0,
					shipmentsTrend: 0,
					customersTrend: 0,
					invoicesTrend: 0,
					capacityTrend: 0,
					exceptionsThisWeek: 0,
					exceptionsTrend: 0,
				};
			}
		},
	);
}

async function getShipments(limit = 50): Promise<TypedShipment[]> {
	const logger = (Sentry as any).logger ?? console;

	return Sentry.startSpan(
		{
			op: "db.query",
			name: "dashboard:getShipments",
		},
		async (span) => {
			try {
				const { supabaseAdmin } = await import("@/lib/supabaseAdmin");

				const { data, error } = await supabaseAdmin
					.from("shipments")
					.select(`
						id,
						shipment_ref,
						origin,
						destination,
						status,
						weight,
						created_at,
						customer:customers(name)
					`)
					.order("created_at", { ascending: false })
					.limit(limit);

				if (error) throw error;

				span.setAttribute("dashboard.shipments.fetched", data?.length ?? 0);

				return (data || []).map((row: any, index: number) => ({
					id: index + 1,
					shipment_ref: row.shipment_ref || `SHP-${index}`,
					customer_name: row.customer?.name || "Unknown Customer",
					origin: row.origin || "—",
					destination: row.destination || "—",
					status: normalizeStatus(row.status),
					weight: row.weight || 0,
					created_at: row.created_at,
				}));
			} catch (error) {
				Sentry.captureException(error);
				logger.error(
					logger.fmt`Error fetching shipments: ${error instanceof Error ? error.message : "unknown error"}`,
				);
				return [];
			}
		},
	);
}

function normalizeStatus(status: string | null): TypedShipment["status"] {
	const s = (status || "").toLowerCase().replace(/-/g, "_");
	if (s === "pending") return "pending";
	if (s === "in_transit" || s === "in-transit") return "in_transit";
	if (s === "delivered") return "delivered";
	if (s === "cancelled" || s === "canceled") return "cancelled";
	return "pending";
}


import { MotionItem, MotionList } from "@/components/ui/motion-wrapper";
import { ArSummaryCards } from "@/features/invoices/ar-summary-cards";
import { getARStats } from "@/lib/finance";

export default async function Page({
	searchParams,
}: {
	searchParams?: Promise<{
		q?: string;
		status?: "pending" | "in_transit" | "delivered" | "cancelled";
	}>;
}) {
	const params = await searchParams;
	const [stats, arStats, shipments] = await Promise.all([
		getDashboardStats(),
		getARStats().catch(() => null),
		getShipments(50),
	]);

	return (
		<DashboardPageLayout
			header={{
				title: "Dashboard",
				description:
					"Core operations overview for shipments, customers, billing, and capacity.",
				icon: BracketsIcon,
			}}
		>
			<div className="flex flex-1 flex-col">
				<div className="@container/main flex flex-1 flex-col gap-2">
					<MotionList className="flex flex-col gap-4 py-4 md:gap-6 md:py-6" stagger={0.15}>
						<MotionItem>
							<OpsCommandGrid stats={stats} />
						</MotionItem>

						{arStats && (
							<MotionItem className="px-4 lg:px-6 space-y-4">
								<h2 className="text-lg font-semibold tracking-tight">
									Financial Performance
								</h2>
								<ArSummaryCards arSummary={arStats} />
							</MotionItem>
						)}

						<MotionItem className="px-4 lg:px-6">
							<ShipmentMap />
						</MotionItem>

						<MotionItem className="grid gap-4 px-4 lg:px-6 md:grid-cols-2">
							<ShipmentDiagnostics />
							<RecentShipments
								shipments={shipments.map((s) => ({
									shipment_ref: s.shipment_ref,
									customer_name: s.customer_name,
									status: s.status,
								}))}
							/>
						</MotionItem>
						<MotionItem>
							<ShipmentsDataTable
								data={shipments}
								initialFilter={params?.q}
								initialStatus={params?.status}
							/>
						</MotionItem>
					</MotionList>
				</div>
			</div>
		</DashboardPageLayout>
	);
}
