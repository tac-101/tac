"use client";

import { Settings } from "lucide-react";

import DashboardPageLayout from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
	return (
		<DashboardPageLayout
			header={{
				title: "Settings",
				description: "Manage your account and system preferences",
				icon: Settings,
			}}
		>
			<div className="grid gap-6">
				<Card className="rounded-none">
					<CardHeader>
						<CardTitle>Notifications</CardTitle>
						<CardDescription>
							Configure how you receive alerts and updates.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between space-x-2">
							<Label htmlFor="email-notifs" className="flex flex-col space-y-1">
								<span>Email Notifications</span>
								<span className="font-normal text-xs text-muted-foreground">
									Receive daily digests and critical alerts via email.
								</span>
							</Label>
							<Switch id="email-notifs" defaultChecked />
						</div>
						<div className="flex items-center justify-between space-x-2">
							<Label
								htmlFor="whatsapp-notifs"
								className="flex flex-col space-y-1"
							>
								<span>WhatsApp Updates</span>
								<span className="font-normal text-xs text-muted-foreground">
									Get real-time shipment updates on WhatsApp.
								</span>
							</Label>
							<Switch id="whatsapp-notifs" />
						</div>
					</CardContent>
				</Card>

				<Card className="rounded-none">
					<CardHeader>
						<CardTitle>Appearance</CardTitle>
						<CardDescription>
							Customize the look and feel of the dashboard.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between space-x-2">
							<Label htmlFor="compact-mode" className="flex flex-col space-y-1">
								<span>Compact Mode</span>
								<span className="font-normal text-xs text-muted-foreground">
									Reduce spacing in tables and lists.
								</span>
							</Label>
							<Switch id="compact-mode" />
						</div>
					</CardContent>
				</Card>

				<div className="flex justify-end">
					<Button className="rounded-none">Save Changes</Button>
				</div>
			</div>
		</DashboardPageLayout>
	);
}
