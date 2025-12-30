import { type Icon } from "@/components/icons"

export interface NavItem {
    title: string
    url: string
    disabled?: boolean
    external?: boolean
    shortcut?: [string, string]
    icon?: keyof typeof Icon
    label?: string
    description?: string
    isActive?: boolean
    items?: NavItem[]
    access?: {
        requireOrg?: boolean
        permission?: string
        plan?: string
        feature?: string
        role?: string
    }
}

export interface NavItemWithChildren extends NavItem {
    items: NavItemWithChildren[]
}

export interface NavItemWithOptionalChildren extends NavItem {
    items?: NavItemWithChildren[]
}

export interface FooterItem {
    title: string
    items: {
        title: string
        href: string
        external?: boolean
    }[]
}

export type MainNavItem = NavItemWithOptionalChildren

export type SidebarNavItem = NavItemWithChildren
