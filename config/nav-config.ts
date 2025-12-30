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
        url: "/dashboard/tracking",
        icon: "post",
        isActive: false,
        items: [],
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
