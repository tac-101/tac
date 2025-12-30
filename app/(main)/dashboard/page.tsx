import React from "react";
import { LayoutDashboard } from "lucide-react";
import DashboardPageLayout from "@/components/dashboard/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function DashboardPage() {
	return (
		<DashboardPageLayout
			header={{
				title: "Dashboard",
				description: "Operational overview and key performance indicators",
				icon: LayoutDashboard,
			}}
		>
			<Alert variant="default" className="border-yellow-500/50 bg-yellow-500/5">
				<AlertCircle className="h-4 w-4 text-yellow-600" />
				<AlertDescription className="text-sm">
					<strong>Under Construction:</strong> Main dashboard page requires implementation with OpsCommandGrid, ShipmentMap, and ShipmentsDataTable per /docs/07-dashboard-modules.md (Phase 7).
				</AlertDescription>
			</Alert>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Active Shipments
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">--</div>
						<p className="text-xs text-muted-foreground mt-1">Pending implementation</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Warehouse Capacity
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">--</div>
						<p className="text-xs text-muted-foreground mt-1">Pending implementation</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Fleet Status
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">--</div>
						<p className="text-xs text-muted-foreground mt-1">Pending implementation</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Pending Invoices
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">--</div>
						<p className="text-xs text-muted-foreground mt-1">Pending implementation</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Recent Activity</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Real-time operational data will be displayed here.
					</p>
				</CardContent>
			</Card>
		</DashboardPageLayout>
	);
}

