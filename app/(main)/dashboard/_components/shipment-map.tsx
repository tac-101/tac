"use client";

import { format } from "date-fns";
import { Loader2, MapPin, Navigation, Package, Plane, Truck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

interface ShipmentLocation {
	id: string;
	shipment_ref: string;
	origin: string;
	destination: string;
	status: string;
	progress: number;
	transport_mode?: string;
	eta?: string;
	last_location?: string;
	customer_name?: string;
}

interface LocationNode {
	name: string;
	type: "origin" | "destination" | "hub" | "current";
	shipmentCount: number;
	lat?: number;
	lng?: number;
}

const indianCities: Record<string, { lat: number; lng: number }> = {
	"DELHI": { lat: 28.6139, lng: 77.2090 },
	"NEW DELHI": { lat: 28.6139, lng: 77.2090 },
	"MUMBAI": { lat: 19.0760, lng: 72.8777 },
	"KOLKATA": { lat: 22.5726, lng: 88.3639 },
	"CHENNAI": { lat: 13.0827, lng: 80.2707 },
	"BANGALORE": { lat: 12.9716, lng: 77.5946 },
	"BENGALURU": { lat: 12.9716, lng: 77.5946 },
	"HYDERABAD": { lat: 17.3850, lng: 78.4867 },
	"AHMEDABAD": { lat: 23.0225, lng: 72.5714 },
	"PUNE": { lat: 18.5204, lng: 73.8567 },
	"JAIPUR": { lat: 26.9124, lng: 75.7873 },
	"LUCKNOW": { lat: 26.8467, lng: 80.9462 },
	"GUWAHATI": { lat: 26.1445, lng: 91.7362 },
	"IMPHAL": { lat: 24.8170, lng: 93.9368 },
	"BHUBANESWAR": { lat: 20.2961, lng: 85.8245 },
	"PATNA": { lat: 25.5941, lng: 85.1376 },
	"CHANDIGARH": { lat: 30.7333, lng: 76.7794 },
	"SURAT": { lat: 21.1702, lng: 72.8311 },
	"KOCHI": { lat: 9.9312, lng: 76.2673 },
	"COIMBATORE": { lat: 11.0168, lng: 76.9558 },
	"NAGPUR": { lat: 21.1458, lng: 79.0882 },
	"INDORE": { lat: 22.7196, lng: 75.8577 },
	"VISAKHAPATNAM": { lat: 17.6868, lng: 83.2185 },
	"THIRUVANANTHAPURAM": { lat: 8.5241, lng: 76.9366 },
};

const statusColors: Record<string, string> = {
	pending: "bg-amber-500/20 text-amber-500 border-amber-500/30",
	in_transit: "bg-blue-500/20 text-blue-500 border-blue-500/30",
	"in-transit": "bg-blue-500/20 text-blue-500 border-blue-500/30",
	delivered: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
	cancelled: "bg-red-500/20 text-red-500 border-red-500/30",
};

export function ShipmentMap() {
	const [shipments, setShipments] = useState<ShipmentLocation[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedShipment, setSelectedShipment] = useState<ShipmentLocation | null>(null);
	const [viewMode, setViewMode] = useState<"map" | "list">("map");

	const loadShipments = useCallback(async () => {
		try {
			const { data, error } = await supabase
				.from("shipments")
				.select(`
					id,
					shipment_ref,
					origin,
					destination,
					status,
					progress,
					transport_mode,
					eta,
					customer:customers(name)
				`)
				.in("status", ["pending", "in_transit", "in-transit", "processing"])
				.order("created_at", { ascending: false })
				.limit(50);

			if (error) throw error;

			const mapped: ShipmentLocation[] = (data || []).map((s: any) => ({
				id: s.id,
				shipment_ref: s.shipment_ref,
				origin: s.origin || "Unknown",
				destination: s.destination || "Unknown",
				status: s.status || "pending",
				progress: s.progress || 0,
				transport_mode: s.transport_mode,
				eta: s.eta,
				customer_name: s.customer?.name,
			}));

			setShipments(mapped);
		} catch (err) {
			console.error("Failed to load shipments for map:", err);
			setShipments([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadShipments();
	}, [loadShipments]);

	// Build location nodes from shipments
	const locationNodes = shipments.reduce<Record<string, LocationNode>>((acc, s) => {
		const originKey = s.origin.toUpperCase().trim();
		const destKey = s.destination.toUpperCase().trim();

		if (!acc[originKey]) {
			const coords = indianCities[originKey];
			acc[originKey] = {
				name: s.origin,
				type: "origin",
				shipmentCount: 0,
				lat: coords?.lat,
				lng: coords?.lng,
			};
		}
		acc[originKey].shipmentCount++;

		if (!acc[destKey]) {
			const coords = indianCities[destKey];
			acc[destKey] = {
				name: s.destination,
				type: "destination",
				shipmentCount: 0,
				lat: coords?.lat,
				lng: coords?.lng,
			};
		}
		acc[destKey].shipmentCount++;

		return acc;
	}, {});

	const nodes = Object.values(locationNodes);
	const activeCount = shipments.filter((s) =>
		["in_transit", "in-transit", "processing"].includes(s.status)
	).length;

	if (loading) {
		return (
			<Card className="col-span-full">
				<CardContent className="flex items-center justify-center h-64">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="col-span-full overflow-hidden">
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<div>
					<CardTitle className="text-lg font-heading">Network Overview</CardTitle>
					<p className="text-sm text-muted-foreground">
						{activeCount} active shipments across {nodes.length} locations
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant={viewMode === "map" ? "default" : "outline"}
						size="sm"
						className="rounded-none"
						onClick={() => setViewMode("map")}
					>
						Map
					</Button>
					<Button
						variant={viewMode === "list" ? "default" : "outline"}
						size="sm"
						className="rounded-none"
						onClick={() => setViewMode("list")}
					>
						List
					</Button>
				</div>
			</CardHeader>

			<CardContent className="p-0">
				{viewMode === "map" ? (
					<div className="relative h-[400px] bg-neutral-950 overflow-hidden">
						{/* Grid Background */}
						<div className="absolute inset-0 bg-[linear-gradient(rgba(50,50,50,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(50,50,50,0.2)_1px,transparent_1px)] bg-[size:30px_30px]" />

						{/* Stylized Map Container */}
						<div className="absolute inset-4 border border-neutral-800 rounded-lg overflow-hidden">
							{/* Route Lines */}
							<svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
								{shipments.slice(0, 20).map((s, idx) => {
									const originCoords = indianCities[s.origin.toUpperCase().trim()];
									const destCoords = indianCities[s.destination.toUpperCase().trim()];

									if (!originCoords || !destCoords) return null;

									// Normalize coords to SVG viewport (simplified projection)
									const minLat = 8, maxLat = 35, minLng = 68, maxLng = 98;
									const x1 = ((originCoords.lng - minLng) / (maxLng - minLng)) * 100;
									const y1 = (1 - (originCoords.lat - minLat) / (maxLat - minLat)) * 100;
									const x2 = ((destCoords.lng - minLng) / (maxLng - minLng)) * 100;
									const y2 = (1 - (destCoords.lat - minLat) / (maxLat - minLat)) * 100;

									const isActive = ["in_transit", "in-transit"].includes(s.status);

									return (
										<g key={s.id}>
											<line
												x1={`${x1}%`}
												y1={`${y1}%`}
												x2={`${x2}%`}
												y2={`${y2}%`}
												stroke={isActive ? "hsl(var(--primary))" : "rgba(100,100,100,0.3)"}
												strokeWidth={isActive ? 2 : 1}
												strokeDasharray={isActive ? "none" : "4,4"}
												className={isActive ? "animate-pulse" : ""}
											/>
											{isActive && (
												<circle
													cx={`${x1 + (x2 - x1) * (s.progress / 100)}%`}
													cy={`${y1 + (y2 - y1) * (s.progress / 100)}%`}
													r="4"
													fill="hsl(var(--primary))"
													className="animate-pulse"
												/>
											)}
										</g>
									);
								})}
							</svg>

							{/* Location Nodes */}
							{nodes.map((node) => {
								if (!node.lat || !node.lng) return null;

								const minLat = 8, maxLat = 35, minLng = 68, maxLng = 98;
								const x = ((node.lng - minLng) / (maxLng - minLng)) * 100;
								const y = (1 - (node.lat - minLat) / (maxLat - minLat)) * 100;

								return (
									<div
										key={node.name}
										className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
										style={{ left: `${x}%`, top: `${y}%` }}
									>
										<div
											className={cn(
												"relative flex items-center justify-center w-6 h-6 rounded-full border-2 cursor-pointer transition-transform hover:scale-125",
												node.shipmentCount > 3
													? "bg-primary/30 border-primary"
													: "bg-neutral-800 border-neutral-600"
											)}
										>
											<MapPin className="w-3 h-3 text-white" />
											{node.shipmentCount > 1 && (
												<span className="absolute -top-2 -right-2 w-4 h-4 bg-primary text-[10px] font-bold text-primary-foreground rounded-full flex items-center justify-center">
													{node.shipmentCount}
												</span>
											)}
										</div>
										<span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-[10px] font-mono text-neutral-400 whitespace-nowrap">
											{node.name}
										</span>
									</div>
								);
							})}
						</div>

						{/* Legend */}
						<div className="absolute bottom-4 left-4 flex items-center gap-4 text-xs text-neutral-500 font-mono">
							<div className="flex items-center gap-1">
								<div className="w-3 h-0.5 bg-primary" />
								<span>Active Route</span>
							</div>
							<div className="flex items-center gap-1">
								<div className="w-3 h-0.5 bg-neutral-600 border-dashed" />
								<span>Pending</span>
							</div>
						</div>
					</div>
				) : (
					<div className="max-h-[400px] overflow-y-auto">
						<table className="w-full text-sm">
							<thead className="bg-muted/50 sticky top-0">
								<tr>
									<th className="text-left py-2 px-4 font-semibold">Reference</th>
									<th className="text-left py-2 px-4 font-semibold">Route</th>
									<th className="text-left py-2 px-4 font-semibold">Status</th>
									<th className="text-left py-2 px-4 font-semibold">Progress</th>
									<th className="text-left py-2 px-4 font-semibold">ETA</th>
								</tr>
							</thead>
							<tbody>
								{shipments.map((s) => (
									<tr
										key={s.id}
										className="border-b border-border hover:bg-muted/30 cursor-pointer"
										onClick={() => setSelectedShipment(s)}
									>
										<td className="py-3 px-4 font-mono text-xs">{s.shipment_ref}</td>
										<td className="py-3 px-4">
											<div className="flex items-center gap-2 text-xs">
												<span>{s.origin}</span>
												{s.transport_mode === "air" ? (
													<Plane className="w-3 h-3 text-muted-foreground" />
												) : (
													<Truck className="w-3 h-3 text-muted-foreground" />
												)}
												<span>{s.destination}</span>
											</div>
										</td>
										<td className="py-3 px-4">
											<Badge
												variant="outline"
												className={cn(
													"text-xs capitalize",
													statusColors[s.status] || statusColors.pending
												)}
											>
												{s.status.replace(/_/g, " ")}
											</Badge>
										</td>
										<td className="py-3 px-4">
											<div className="flex items-center gap-2">
												<div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
													<div
														className="h-full bg-primary transition-all"
														style={{ width: `${s.progress}%` }}
													/>
												</div>
												<span className="text-xs text-muted-foreground font-mono">
													{s.progress}%
												</span>
											</div>
										</td>
										<td className="py-3 px-4 text-xs text-muted-foreground font-mono">
											{s.eta ? format(new Date(s.eta), "dd MMM, HH:mm") : "—"}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
