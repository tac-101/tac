import type React from "react";
import AtomIcon from "@/components/icons/atom";
import BoxIcon from "@/components/icons/box";
import BracketsIcon from "@/components/icons/brackets";
import EmailIcon from "@/components/icons/email";
import GearIcon from "@/components/icons/gear";
import MonkeyIcon from "@/components/icons/monkey";
import ProcessorIcon from "@/components/icons/proccesor";
import TruckIcon from "@/components/icons/truck";
import WarehouseIcon from "@/components/icons/warehouse";

export type NavBadgeColor = "default" | "success" | "warning" | "destructive";
export type NavBadgeKey = "warehouses" | "shipments" | "invoices" | "alerts";

export interface NavItem {
	title: string;
	url: string;
	icon: React.ElementType;
	locked?: boolean;
	badge?: string | number;
	badgeColor?: NavBadgeColor;
	requiresAdmin?: boolean;
	badgeKey?: NavBadgeKey;
}

export interface NavGroup {
	id: "core" | "management" | "system";
	title: string;
	items: NavItem[];
}

export const navMain: NavGroup[] = [
	{
		id: "core",
		title: "Core Operations",
		items: [
			{
				title: "Dashboard",
				url: "/dashboard",
				icon: BracketsIcon,
				badge: "Live",
				badgeColor: "success",
			},
			{
				title: "Warehouse",
				url: "/dashboard/warehouse",
				icon: WarehouseIcon,
				badgeKey: "warehouses",
			},
			{
				title: "Shipments",
				url: "/dashboard/shipments",
				icon: TruckIcon,
				badgeKey: "shipments",
			},
			{
				title: "Inventory",
				url: "/dashboard/inventory",
				icon: BoxIcon,
			},
		],
	},
	{
		id: "management",
		title: "Management & Billing",
		items: [
			{
				title: "Customers",
				url: "/dashboard/customers",
				icon: EmailIcon,
			},
			{
				title: "Invoices",
				url: "/dashboard/invoices",
				icon: GearIcon,
				badgeKey: "invoices",
			},
			{
				title: "Rates",
				url: "/dashboard/rates",
				icon: ProcessorIcon,
				badgeKey: "alerts",
			},
			{
				title: "Aircargo Manifesto",
				url: "/dashboard/aircargo",
				icon: AtomIcon,
			},
			{
				title: "Manifest Scan Session",
				url: "/dashboard/aircargo/scan-session",
				icon: AtomIcon,
			},
			{
				title: "Barcode Tracking",
				url: "/dashboard/barcodes",
				icon: BracketsIcon,
			},
		],
	},
	{
		id: "system",
		title: "System",
		items: [
			{
				title: "Tapan Associate",
				url: "/dashboard/tapan-associate",
				icon: MonkeyIcon,
			},
			{
				title: "Global Search",
				url: "/dashboard/search",
				icon: ProcessorIcon,
			},
			{
				title: "Reports & Analytics",
				url: "/dashboard/reports",
				icon: ProcessorIcon,
				requiresAdmin: true,
			},
			{
				title: "Network Analytics",
				url: "/dashboard/analytics",
				icon: AtomIcon,
				requiresAdmin: true,
			},
			{
				title: "Exceptions & Alerts",
				url: "/dashboard/alerts",
				icon: BracketsIcon,
				badgeKey: "alerts",
				requiresAdmin: true,
			},
			{
				title: "Notifications",
				url: "/dashboard/notifications",
				icon: EmailIcon,
			},
			{
				title: "Support Tickets",
				url: "/dashboard/support",
				icon: EmailIcon,
			},
			{
				title: "Ops Activity",
				url: "/dashboard/ops-activity",
				icon: ProcessorIcon,
			},
			{
				title: "Settings",
				url: "/dashboard/settings",
				icon: GearIcon,
				requiresAdmin: true,
			},
			{
				title: "Admin",
				url: "/dashboard/admin",
				icon: GearIcon,
				requiresAdmin: true,
			},
		],
	},
];
