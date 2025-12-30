import { NavItem } from "@/types"

export const navItems: NavItem[] = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: "dashboard",
        isActive: false,
        shortcut: ["d", "d"],
        items: [],
    },
    {
        title: "Shipments",
        url: "/dashboard/shipments",
        icon: "product",
        isActive: false,
        items: [],
    },
    {
        title: "Air Cargo",
        url: "/dashboard/aircargo",
        icon: "kanban",
        isActive: false,
        items: [
            {
                title: "Scan Session",
                url: "/dashboard/aircargo/scan-session",
                icon: "media",
                shortcut: ["s", "s"],
            }
        ],
    },
    {
        title: "Warehouse",
        url: "/dashboard/warehouse",
        icon: "workspace",
        isActive: false,
        items: [],
    },
    {
        title: "Customers",
        url: "/dashboard/customers",
        icon: "teams",
        isActive: false,
        items: [],
    },
    {
        title: "Invoices",
        url: "/dashboard/invoices",
        icon: "billing",
        isActive: false,
        items: [],
    },
    {
        title: "Tracking",
        url: "#",
        icon: "post",
        isActive: true,
        items: [
            {
                title: "Barcodes",
                url: "/dashboard/barcodes",
                icon: "product",
            }
        ],
    },
    {
        title: "Account",
        url: "#",
        icon: "account",
        isActive: true,
        items: [
            {
                title: "Settings",
                url: "/dashboard/settings",
                icon: "settings",
                shortcut: ["s", "s"],
            },
            {
                title: "Profile",
                url: "/dashboard/profile",
                icon: "profile",
                shortcut: ["p", "p"],
            },
            {
                title: "Admin",
                url: "/dashboard/admin",
                icon: "user2",
                access: { requireOrg: true },
            },
        ],
    },
]
