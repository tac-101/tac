"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Loader2, Radio, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import ProcessorIcon from "@/components/icons/proccesor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { supabase } from "@/lib/supabaseClient";

type UITrackingEvent = {
	id: string;
	shipmentRef: string;
	status: string;
	location: string;
	timestamp: string;
	isNew?: boolean;
};

const statusColors: Record<string, string> = {
	received: "bg-blue-500/10 text-blue-500 border-blue-500/30",
	in_transit: "bg-amber-500/10 text-amber-500 border-amber-500/30",
	delivered: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
	scanned: "bg-primary/10 text-primary border-primary/30",
	picked_up: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
	out_for_delivery: "bg-violet-500/10 text-violet-500 border-violet-500/30",
};

export default function TrackingPage() {
	const [data, setData] = useState<UITrackingEvent[]>([]);
	const [loading, setLoading] = useState(true);
	const [isLive, setIsLive] = useState(true);
	const [soundEnabled, setSoundEnabled] = useState(false);
	const [newEventCount, setNewEventCount] = useState(0);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	const loadTrackingEvents = useCallback(async () => {
		try {
			const { data: scanData, error } = await supabase
				.from("scan_events")
				.select(`
					id,
					created_at,
					location,
					new_status,
					barcode_id,
					barcodes ( barcode_number )
				`)
				.order("created_at", { ascending: false })
				.limit(100);

			if (error) throw error;

			const normalized: UITrackingEvent[] = (scanData || []).map((scan: any) => ({
				id: scan.id,
				shipmentRef: scan.barcodes?.barcode_number ?? "Unknown",
				status: scan.new_status ?? "scanned",
				location: scan.location ?? "Unknown",
				timestamp: scan.created_at,
				isNew: false,
			}));

			setData(normalized);
			setNewEventCount(0);
		} catch (error) {
			console.warn("Error loading tracking events:", error);
			setData([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadTrackingEvents();
	}, [loadTrackingEvents]);

	useEffect(() => {
		if (!isLive) return;

		const channel = supabase
			.channel("realtime-scans")
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "scan_events",
				},
				async (payload) => {
					const newScan = payload.new as any;

					let barcodeNumber = "Unknown";
					if (newScan.barcode_id) {
						const { data: barcodeData } = await supabase
							.from("barcodes")
							.select("barcode_number")
							.eq("id", newScan.barcode_id)
							.maybeSingle();
						barcodeNumber = barcodeData?.barcode_number ?? "Unknown";
					}

					const newEvent: UITrackingEvent = {
						id: newScan.id,
						shipmentRef: barcodeNumber,
						status: newScan.new_status ?? "scanned",
						location: newScan.location ?? "Unknown",
						timestamp: newScan.created_at,
						isNew: true,
					};

					setData((prev) => [newEvent, ...prev.slice(0, 99)]);
					setNewEventCount((c) => c + 1);

					if (soundEnabled && audioRef.current) {
						audioRef.current.play().catch(() => { });
					}

					setTimeout(() => {
						setData((prev) =>
							prev.map((e) => (e.id === newEvent.id ? { ...e, isNew: false } : e))
						);
					}, 3000);
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [isLive, soundEnabled]);

	const columns: ColumnDef<UITrackingEvent>[] = useMemo(
		() => [
			{
				accessorKey: "shipmentRef",
				header: "Barcode / Ref",
				cell: ({ row }) => (
					<div className="flex items-center gap-2">
						{row.original.isNew && (
							<span className="relative flex h-2 w-2">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
								<span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
							</span>
						)}
						<span className="font-mono text-sm">{row.getValue("shipmentRef")}</span>
					</div>
				),
			},
			{
				accessorKey: "status",
				header: "Event",
				cell: ({ row }) => {
					const status = row.getValue("status") as string;
					const colorClass = statusColors[status.toLowerCase().replace(/-/g, "_")] || statusColors.scanned;
					return (
						<Badge variant="outline" className={`capitalize text-xs ${colorClass}`}>
							{status.replace(/_/g, " ")}
						</Badge>
					);
				},
			},
			{
				accessorKey: "location",
				header: "Location",
				cell: ({ row }) => (
					<span className="text-sm text-muted-foreground">{row.getValue("location")}</span>
				),
			},
			{
				accessorKey: "timestamp",
				header: "Time",
				cell: ({ row }) => {
					const timestamp = row.getValue("timestamp") as string;
					try {
						return (
							<span className="font-mono text-xs text-muted-foreground">
								{format(new Date(timestamp), "dd MMM, HH:mm:ss")}
							</span>
						);
					} catch {
						return <span className="text-xs text-muted-foreground">—</span>;
					}
				},
			},
		],
		[],
	);

	if (loading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<audio ref={audioRef} src="/sounds/scan-beep.mp3" preload="auto" />
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Live Tracking</h2>
					<p className="text-muted-foreground">
						Real-time scan events stream.
					</p>
				</div>
			</div>

			<div className="space-y-6">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<div
							className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono uppercase tracking-wider border ${isLive
								? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
								: "bg-muted text-muted-foreground border-border"
								}`}
						>
							<Radio className={`h-3 w-3 ${isLive ? "animate-pulse" : ""}`} />
							{isLive ? "Live" : "Paused"}
						</div>
						{newEventCount > 0 && (
							<Badge variant="secondary" className="font-mono">
								+{newEventCount} new
							</Badge>
						)}
					</div>

					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							className="rounded-none"
							onClick={() => setSoundEnabled(!soundEnabled)}
						>
							{soundEnabled ? (
								<Volume2 className="h-4 w-4" />
							) : (
								<VolumeX className="h-4 w-4" />
							)}
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="rounded-none"
							onClick={() => setIsLive(!isLive)}
						>
							{isLive ? "Pause" : "Resume"}
						</Button>
						<Button
							variant="default"
							size="sm"
							className="rounded-none"
							onClick={() => {
								setLoading(true);
								loadTrackingEvents();
							}}
						>
							<RefreshCw className="h-4 w-4 mr-2" />
							Refresh
						</Button>
					</div>
				</div>

				<DataTable columns={columns} data={data} searchKey="shipmentRef" />
			</div>
		</div>
	);
}
