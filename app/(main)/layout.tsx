"use client"

import type React from "react"
import AppSidebar from "@/components/layout/app-sidebar"
import Header from "@/components/layout/header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import KBar from "@/components/kbar"

export default function MainLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<KBar>
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<Header />
					{children}
				</SidebarInset>
			</SidebarProvider>
		</KBar>
	)
}
