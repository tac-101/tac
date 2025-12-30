import React from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumbs } from "@/components/breadcrumbs"
import SearchInput from "@/components/search-input"
import { NavUser } from "@/components/nav-user"
import { ModeToggle } from "@/components/theme-toggle"
import { useUser } from "@/hooks/use-mock-auth"

export default function Header() {
    const { user } = useUser()
    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumbs />
            </div>

            <div className="flex items-center gap-2 px-4">
                <div className="hidden md:flex">
                    <SearchInput />
                </div>
                <NavUser user={{
                    name: user.fullName || "User",
                    email: user.emailAddresses[0].emailAddress,
                    avatar: user.imageUrl || ""
                }} />
                <ModeToggle />
            </div>
        </header>
    )
}
