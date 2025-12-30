"use client";

import { useEffect, useState } from "react";

import ProcessorIcon from "@/components/icons/proccesor";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface ActivityData {
	scans: any[];
	manifests: any[];
	invoiceLogs: any[];
}

export default function OpsActivityPage() {
	const [data, setData] = useState<ActivityData | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			try {
				const res = await fetch("/api/ops/activity");
				const json = await res.json();
				setData(json as ActivityData);
			} catch (error) {
				console.error("Failed to load ops activity", error);
				setData(null);
			} finally {
				setLoading(false);
			}
		};

		load();
	}, []);

	const scans = data?.scans ?? [];
	const manifests = data?.manifests ?? [];
	const invoiceLogs = data?.invoiceLogs ?? [];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Ops Activity</h2>
					<p className="text-muted-foreground">
						Recent scans, manifests, and invoice generation activity
					</p>
				</div>
			</div>
			<div className="flex flex-col gap-6">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
					<Card>
						<CardHeader>
							<CardTitle>Recent Scans</CardTitle>
							<CardDescription>Last 20 package scans</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="max-h-64 overflow-y-auto text-xs">
								{scans.length ? (
									<ul className="divide-y">
										{scans.map((s: any) => (
											<li
												key={s.id}
												className="py-2 flex items-center justify-between"
											>
												<div>
													<div className="font-mono text-xs">
														{s.barcode_id}
													</div>
													<div className="text-xs text-muted-foreground">
														{s.location ?? "Unknown"}
													</div>
												</div>
												<div className="text-right">
													<Badge className="text-xs px-2 py-0.5">
														{s.scan_type?.toString().toUpperCase() ?? "SCAN"}
													</Badge>
													<div className="text-xs text-muted-foreground">
														{s.scanned_at
															? new Date(s.scanned_at).toLocaleString()
															: ""}
													</div>
												</div>
											</li>
										))}
									</ul>
								) : (
									<p className="text-xs text-muted-foreground">
										{loading ? "Loading..." : "No scans found."}
									</p>
								)}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Recent Manifests</CardTitle>
							<CardDescription>Last 10 manifests</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="max-h-64 overflow-y-auto text-xs">
								{manifests.length ? (
									<ul className="divide-y">
										{manifests.map((m: any) => (
											<li
												key={m.id}
												className="py-2 flex items-center justify-between"
											>
												<div>
													<div className="font-mono text-xs">
														{m.manifest_ref ?? m.id}
													</div>
													<div className="text-xs text-muted-foreground">
														{m.origin_hub}
														{"  a0 a0 a0"}
														b7
														{"  a0 a0 a0"}
														{m.destination}
													</div>
												</div>
												<div className="text-right">
													<Badge className="text-xs px-2 py-0.5">
														{m.status?.toString().toUpperCase() ?? "UNKNOWN"}
													</Badge>
													<div className="text-xs text-muted-foreground">
														{m.created_at
															? new Date(m.created_at).toLocaleString()
															: ""}
													</div>
												</div>
											</li>
										))}
									</ul>
								) : (
									<p className="text-xs text-muted-foreground">
										{loading ? "Loading..." : "No manifests found."}
									</p>
								)}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Invoice Generation</CardTitle>
							<CardDescription>Last 10 generation attempts</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="max-h-64 overflow-y-auto text-xs">
								{invoiceLogs.length ? (
									<ul className="divide-y">
										{invoiceLogs.map((log: any) => (
											<li
												key={log.id}
												className="py-2 flex items-center justify-between"
											>
												<div>
													<div className="font-mono text-xs">
														{log.invoice_id}
													</div>
													<div className="text-xs text-muted-foreground truncate max-w-[140px]">
														{log.message ?? ""}
													</div>
												</div>
												<div className="text-right">
													<Badge className="text-xs px-2 py-0.5">
														{log.status?.toString().toUpperCase() ?? "UNKNOWN"}
													</Badge>
													<div className="text-xs text-muted-foreground">
														{log.started_at
															? new Date(log.started_at).toLocaleTimeString()
															: ""}
													</div>
												</div>
											</li>
										))}
									</ul>
								) : (
									<p className="text-xs text-muted-foreground">
										{loading ? "Loading..." : "No invoice logs found."}
									</p>
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
