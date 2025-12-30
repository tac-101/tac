"use client"

import { useMemo } from "react"
import { useOrganization, useUser } from "@/hooks/use-mock-auth"
import type { NavItem } from "@/types"

export function useFilteredNavItems(items: NavItem[]) {
    const { organization } = useOrganization()
    const { user } = useUser()
    // Mock membership permissions for now
    const membership = {
        permissions: ["org:teams:view", "org:manage:billing"],
        role: "admin",
    }

    // Memoize context and permissions
    const accessContext = useMemo(() => {
        const permissions = membership?.permissions || []
        const role = membership?.role

        return {
            organization: organization ?? undefined,
            user: user ?? undefined,
            permissions: permissions as string[],
            role: role ?? undefined,
            hasOrg: !!organization,
        }
    }, [organization?.id, user?.id])

    // Filter items synchronously (all client-side)
    const filteredItems = useMemo(() => {
        return items
            .filter((item) => {
                // No access restrictions
                if (!item.access) {
                    return true
                }

                // Check requireOrg
                if (item.access.requireOrg && !accessContext.hasOrg) {
                    return false
                }

                // Check permission
                if (item.access.permission) {
                    if (!accessContext.hasOrg) {
                        return false
                    }
                    if (!accessContext.permissions.includes(item.access.permission)) {
                        return false
                    }
                }

                // Check role
                if (item.access.role) {
                    if (!accessContext.hasOrg) {
                        return false
                    }
                    if (accessContext.role !== item.access.role) {
                        return false
                    }
                }

                return true
            })
            .map((item) => {
                // Recursively filter child items
                if (item.items && item.items.length > 0) {
                    const filteredChildren = item.items.filter((childItem) => {
                        // No access restrictions
                        if (!childItem.access) {
                            return true
                        }

                        // Check requireOrg
                        if (childItem.access.requireOrg && !accessContext.hasOrg) {
                            return false
                        }

                        // Check permission
                        if (childItem.access.permission) {
                            if (!accessContext.hasOrg) {
                                return false
                            }
                            if (
                                !accessContext.permissions.includes(childItem.access.permission)
                            ) {
                                return false
                            }
                        }

                        // Check role
                        if (childItem.access.role) {
                            if (!accessContext.hasOrg) {
                                return false
                            }
                            if (accessContext.role !== childItem.access.role) {
                                return false
                            }
                        }

                        return true
                    })

                    return {
                        ...item,
                        items: filteredChildren,
                    }
                }

                return item
            })
    }, [items, accessContext])

    return filteredItems
}
