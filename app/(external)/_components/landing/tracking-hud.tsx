"use client";

import { format } from "date-fns";
import { AlertCircle, Box, CheckCircle2, ExternalLink, MapPin, Package, Plane, Truck } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";

interface TrackShipment {
	id: string;
	shipment_ref: string;
	origin?: string | null;
	destination?: string | null;
	weight?: number | null;
	status?: string | null;
	progress?: number | null;
	created_at: string;
	eta?: string | null;
	ata?: string | null;
	etd?: string | null;
	atd?: string | null;
	carrier_name?: string | null;
	awb_number?: string | null;
	transport_mode?: string | null;
}

interface TrackScan {
	id: string;
	barcode_id: string;
	barcode_number?: string | null;
	scanned_at: string;
	location?: string | null;
	scan_type?: string | null;
}

interface TrackResponse {
	shipment: TrackShipment | null;
	shipments: TrackShipment[];
	barcodes: Array<{
		id: string;
		barcode_number: string;
		status?: string | null;
		last_scanned_at?: string | null;
		last_scanned_location?: string | null;
	}>;
	scans: TrackScan[];
	invoice: {
		id: string;
		invoice_ref: string;
		amount?: number | null;
		status?: string | null;
	} | null;
	lookup: {
		type: "shipment_ref" | "barcode" | "invoice_ref";
		value: string;
	};
}

type HUDStatus = "idle" | "loading" | "found" | "not_found" | "error";

const formatTime = (dateStr: string | null | undefined): string => {
	if (!dateStr) return "--:--";
	try {
		return format(new Date(dateStr), "HHmm") + " HRS";
	} catch {
		return "--:--";
	}
};

const formatDate = (dateStr: string | null | undefined): string => {
	if (!dateStr) return "";
	try {
		const date = new Date(dateStr);
		const today = new Date();
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		if (date.toDateString() === today.toDateString()) return "TODAY";
		if (date.toDateString() === tomorrow.toDateString()) return "TOMORROW";
		return format(date, "dd MMM").toUpperCase();
	} catch {
		return "";
	}
};

const getStatusDisplay = (status: string | null | undefined): { label: string; isLive: boolean } => {
	const s = (status || "").toLowerCase().replace(/_/g, "-");
	if (s === "delivered") return { label: "DELIVERED", isLive: false };
	if (s === "in-transit" || s === "in_transit") return { label: "IN TRANSIT", isLive: true };
	if (s === "pending") return { label: "PENDING", isLive: false };
	if (s === "processing") return { label: "PROCESSING", isLive: true };
	if (s === "out-for-delivery") return { label: "OUT FOR DELIVERY", isLive: true };
	return { label: (status || "UNKNOWN").toUpperCase(), isLive: false };
};

export function TrackingHUD() {
	const [trackingId, setTrackingId] = useState("");
	const [status, setStatus] = useState<HUDStatus>("idle");
	const [result, setResult] = useState<TrackResponse | null>(null);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	const handleTrack = useCallback(async () => {
		const trimmed = trackingId.trim();
		if (!trimmed) return;

		setStatus("loading");
		setResult(null);
		setErrorMsg(null);

		try {
			const res = await fetch("/api/public/track", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ query: trimmed }),
			});

			const json = await res.json();

			if (!res.ok) {
				if (res.status === 404) {
					setStatus("not_found");
					setErrorMsg("No shipment found for this reference.");
				} else {
					setStatus("error");
					setErrorMsg(json?.error || "Failed to retrieve tracking data.");
				}
				return;
			}

			setResult(json as TrackResponse);
			setStatus("found");
		} catch (err: unknown) {
			setStatus("error");
			setErrorMsg(err instanceof Error ? err.message : "Network error. Please try again.");
		}
	}, [trackingId]);

	const shipment = result?.shipment;
	const scans = result?.scans || [];
	const statusInfo = getStatusDisplay(shipment?.status);

	const timelineSteps = buildTimeline(shipment, scans);

	return (
		<section
			id="track"
			className="py-32 relative bg-black text-white overflow-hidden border-y border-white/10"
		>
			<div className="absolute inset-0 bg-[linear-gradient(rgba(50,50,50,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(50,50,50,0.3)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

			<div className="max-w-4xl mx-auto px-6 relative z-10 text-center space-y-8">
				<h2 className="text-4xl md:text-5xl font-black font-heading tracking-tight uppercase">
					Live <span className="text-primary">Telemetry</span>
				</h2>
				<p className="text-neutral-400 text-lg max-w-xl mx-auto font-mono">
					Enter your AWB, Invoice, or Consignment Number to access real-time status.
				</p>

				<div className="max-w-md mx-auto relative">
					<div className="relative flex p-1 bg-black border border-white/30 focus-within:border-primary transition-colors">
						<label htmlFor="tracking-input" className="sr-only">
							Tracking Number
						</label>
						<input
							id="tracking-input"
							name="trackingId"
							value={trackingId}
							onChange={(e) => {
								setTrackingId(e.target.value);
								if (status !== "idle") setStatus("idle");
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									handleTrack();
								}
							}}
							placeholder="ENTER AWB / INVOICE..."
							aria-label="Tracking Number"
							className="flex-1 bg-transparent border-none focus:outline-none px-6 text-lg font-mono text-white placeholder:text-neutral-600 font-bold tracking-widest uppercase"
						/>
						<Button
							onClick={handleTrack}
							disabled={status === "loading" || !trackingId.trim()}
							size="lg"
							className="rounded-none px-8 font-bold text-base bg-primary text-black hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{status === "loading" ? "SCANNING..." : "TRACK"}
						</Button>
					</div>
				</div>

				<div aria-live="polite" className="min-h-[20px]">
					{status === "not_found" && (
						<div className="mt-8 flex flex-col items-center gap-4 animate-in fade-in">
							<div className="w-16 h-16 rounded-none border border-neutral-700 bg-neutral-900 flex items-center justify-center">
								<Package className="w-8 h-8 text-neutral-500" />
							</div>
							<p className="text-neutral-400 font-mono text-sm">{errorMsg}</p>
							<Link href={`/track?ref=${encodeURIComponent(trackingId)}`}>
								<Button variant="outline" size="sm" className="rounded-none border-neutral-700 text-neutral-300 hover:bg-neutral-800">
									Try Advanced Search
									<ExternalLink className="ml-2 h-3 w-3" />
								</Button>
							</Link>
						</div>
					)}

					{status === "error" && (
						<div className="mt-8 flex flex-col items-center gap-4 animate-in fade-in">
							<div className="w-16 h-16 rounded-none border border-red-900/50 bg-red-950/30 flex items-center justify-center">
								<AlertCircle className="w-8 h-8 text-red-500" />
							</div>
							<p className="text-red-400 font-mono text-sm">{errorMsg}</p>
						</div>
					)}

					{status === "found" && shipment && (
						<div className="mt-12 bg-black border border-primary/50 text-left animate-in fade-in slide-in-from-bottom-6 relative">
							<div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-primary" />
							<div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-primary" />
							<div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-primary" />
							<div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-primary" />

							<div className="p-8">
								<Link
									href={`/track?ref=${encodeURIComponent(shipment.shipment_ref)}`}
									className="absolute top-2 right-2 text-[10px] text-primary font-mono uppercase tracking-widest border border-primary/30 px-2 py-1 hover:bg-primary/10 transition-colors flex items-center gap-1"
								>
									Full Details
									<ExternalLink className="h-3 w-3" />
								</Link>

								<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-white/10">
									<div>
										<div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1 font-mono">
											{result?.lookup.type === "invoice_ref" ? "Invoice" : "Consignment"} {shipment.shipment_ref}
										</div>
										<div className="text-2xl font-black text-primary flex items-center gap-2 uppercase">
											{statusInfo.isLive && (
												<span className="relative flex h-3 w-3">
													<span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-primary opacity-75"></span>
													<span className="relative inline-flex rounded-none h-3 w-3 bg-primary"></span>
												</span>
											)}
											{statusInfo.label}
										</div>
									</div>
									<div className="text-right">
										<div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1 font-mono">
											{shipment.ata ? "DELIVERED" : "ETA"}
										</div>
										<div className="text-2xl font-black font-mono">
											{shipment.ata || shipment.eta ? (
												<>
													{formatTime(shipment.ata || shipment.eta)}{" "}
													<span className="text-neutral-600">|</span>{" "}
													{formatDate(shipment.ata || shipment.eta)}
												</>
											) : (
												<span className="text-neutral-600">PENDING</span>
											)}
										</div>
									</div>
								</div>

								{(shipment.origin || shipment.destination) && (
									<div className="py-4 flex items-center justify-center gap-4 text-sm font-mono">
										<span className="text-white font-bold">{shipment.origin || "—"}</span>
										<div className="flex items-center gap-2 text-neutral-600">
											<div className="w-8 h-px bg-neutral-700" />
											{shipment.transport_mode === "air" ? (
												<Plane className="h-4 w-4 text-primary" />
											) : (
												<Truck className="h-4 w-4 text-primary" />
											)}
											<div className="w-8 h-px bg-neutral-700" />
										</div>
										<span className="text-white font-bold">{shipment.destination || "—"}</span>
									</div>
								)}

								{timelineSteps.length > 0 && (
									<div className="pt-6 grid gap-6 relative">
										<div className="absolute left-[19px] top-8 bottom-4 w-0.5 bg-neutral-800" />

										{timelineSteps.map((step, idx) => (
											<div key={step.id} className={`relative flex gap-6 ${step.isPending ? "opacity-50" : ""}`}>
												<div
													className={`relative z-10 w-10 h-10 flex items-center justify-center shrink-0 ${
														step.isCurrent
															? "bg-primary/20 border border-primary"
															: step.isCompleted
																? "bg-neutral-800 border border-neutral-600"
																: "bg-neutral-900 border border-neutral-800"
													}`}
												>
													{step.isCurrent ? (
														<step.icon className="w-5 h-5 text-primary" />
													) : step.isCompleted ? (
														<CheckCircle2 className="w-5 h-5 text-neutral-400" />
													) : (
														<step.icon className="w-5 h-5 text-neutral-600" />
													)}
												</div>
												<div className="pt-1 flex-1">
													<div className={`font-bold text-lg mb-1 uppercase ${step.isCurrent ? "text-primary" : ""}`}>
														{step.label}
													</div>
													<div className="text-sm font-mono text-neutral-500">
														{step.location}
														{step.time && ` • ${step.time}`}
														{step.isCurrent && " • LIVE"}
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					)}

					{status === "found" && !shipment && result?.invoice && (
						<div className="mt-12 bg-black border border-primary/50 text-left animate-in fade-in slide-in-from-bottom-6 relative p-8">
							<div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-primary" />
							<div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-primary" />
							<div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-primary" />
							<div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-primary" />

							<div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 font-mono">
								Invoice Found
							</div>
							<div className="text-2xl font-black text-primary mb-4">{result.invoice.invoice_ref}</div>
							<p className="text-neutral-400 text-sm font-mono">
								No shipments linked yet. Tracking will be available once packages are dispatched.
							</p>
							<Link href={`/track?ref=${encodeURIComponent(result.invoice.invoice_ref)}`} className="inline-block mt-4">
								<Button variant="outline" size="sm" className="rounded-none border-primary/50 text-primary hover:bg-primary/10">
									View Invoice Details
									<ExternalLink className="ml-2 h-3 w-3" />
								</Button>
							</Link>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}

interface TimelineStep {
	id: string;
	label: string;
	location: string;
	time: string;
	icon: React.ElementType;
	isCompleted: boolean;
	isCurrent: boolean;
	isPending: boolean;
}

function buildTimeline(shipment: TrackShipment | null | undefined, scans: TrackScan[]): TimelineStep[] {
	if (!shipment) return [];

	const steps: TimelineStep[] = [];
	const status = (shipment.status || "").toLowerCase().replace(/_/g, "-");

	steps.push({
		id: "pickup",
		label: "Shipment Created",
		location: shipment.origin || "Origin",
		time: shipment.created_at ? formatTime(shipment.created_at) : "",
		icon: Box,
		isCompleted: true,
		isCurrent: status === "pending",
		isPending: false,
	});

	if (shipment.atd || status === "in-transit" || status === "delivered" || status === "out-for-delivery") {
		steps.push({
			id: "departed",
			label: "Dispatched",
			location: shipment.origin || "Hub",
			time: shipment.atd ? formatTime(shipment.atd) : shipment.etd ? formatTime(shipment.etd) : "",
			icon: Truck,
			isCompleted: true,
			isCurrent: status === "in-transit",
			isPending: false,
		});
	}

	if (scans.length > 0) {
		const latestScan = scans[scans.length - 1];
		steps.push({
			id: "scan-latest",
			label: latestScan.scan_type || "Scanned",
			location: latestScan.location || "In Transit",
			time: formatTime(latestScan.scanned_at),
			icon: Package,
			isCompleted: status === "delivered",
			isCurrent: status === "in-transit" && !shipment.atd,
			isPending: false,
		});
	}

	const isDelivered = status === "delivered";
	steps.push({
		id: "delivery",
		label: isDelivered ? "Delivered" : "Out for Delivery",
		location: shipment.destination || "Destination",
		time: shipment.ata ? formatTime(shipment.ata) : "",
		icon: MapPin,
		isCompleted: isDelivered,
		isCurrent: status === "out-for-delivery",
		isPending: !isDelivered && status !== "out-for-delivery",
	});

	return steps;
}
