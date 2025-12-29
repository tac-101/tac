import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabaseServer";

const manifestBodySchema = z.object({
	manifestRef: z.string().optional(),
	originHub: z.string().min(2, "Origin hub must be at least 2 characters"),
	destination: z.string().min(2, "Destination must be at least 2 characters"),
	airlineCode: z.string().min(1, "Airline code is required"),
	scannedBarcodeIds: z.array(z.string().min(1)).optional(),
	flightNumber: z.string().optional(),
	manifestDate: z.string().optional(),
	createdBy: z.string().optional(),
});

async function checkAuth() {
	const supabase = await createClient();
	const { data: { user }, error } = await supabase.auth.getUser();
	if (error || !user) {
		throw new Error("Unauthorized");
	}
	return user;
}

export async function GET(req: Request) {
	try {
		await checkAuth();
		const { searchParams } = new URL(req.url);
		const status = searchParams.get("status");
		const date = searchParams.get("date");
		const limit = parseInt(searchParams.get("limit") || "50", 10);

		let query = supabaseAdmin
			.from("manifests")
			.select("*")
			.order("created_at", { ascending: false })
			.limit(limit);

		if (status) {
			query = query.eq("status", status);
		}

		if (date) {
			query = query.eq("manifest_date", date);
		}

		const { data, error } = await query;

		if (error) throw error;

		return NextResponse.json({ manifests: data || [], count: data?.length || 0 });
	} catch (err: any) {
		if (err.message === "Unauthorized") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		console.error("/api/manifests GET error", err);
		return NextResponse.json(
			{ error: err?.message ?? "Unknown error" },
			{ status: 500 }
		);
	}
}

export async function POST(req: Request) {
	try {
		await checkAuth();
		const json = await req.json();
		const parsed = manifestBodySchema.safeParse(json);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid request body", details: parsed.error.flatten() },
				{ status: 400 },
			);
		}

		const {
			manifestRef,
			originHub,
			destination,
			airlineCode,
			scannedBarcodeIds = [],
			createdBy,
		} = parsed.data;

		let barcodes: { id: string; shipment_id: string | null }[] = [];

		if (scannedBarcodeIds.length > 0) {
			const { data: barcodeRows, error: barcodeError } = await supabaseAdmin
				.from("barcodes")
				.select("id, shipment_id")
				.in("id", scannedBarcodeIds);

			if (barcodeError) {
				throw barcodeError;
			}

			barcodes = (barcodeRows ?? []) as {
				id: string;
				shipment_id: string | null;
			}[];

			if (!barcodes.length && scannedBarcodeIds.length > 0) {
				return NextResponse.json(
					{ error: "No barcodes found for provided IDs" },
					{ status: 404 },
				);
			}
		}

		const shipmentIds = Array.from(
			new Set(
				barcodes.map((b) => b.shipment_id).filter((id): id is string => !!id),
			),
		);

		const shipmentsMap = new Map<
			string,
			{ id: string; weight: number | null }
		>();

		if (shipmentIds.length) {
			const { data: shipments, error: shipmentsError } = await supabaseAdmin
				.from("shipments")
				.select("id, weight")
				.in("id", shipmentIds);

			if (shipmentsError) {
				throw shipmentsError;
			}

			(shipments ?? []).forEach((s: any) => {
				shipmentsMap.set(s.id, { id: s.id, weight: s.weight });
			});
		}

		let totalWeight = 0;

		barcodes.forEach((b) => {
			if (b.shipment_id) {
				const shipment = shipmentsMap.get(b.shipment_id);
				if (shipment?.weight) {
					totalWeight += Number(shipment.weight);
				}
			}
		});

		const totalPieces = barcodes.length;

		// Use a more stable reference if not provided
		const ref = manifestRef || `MAN-${originHub.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

		const { data: manifest, error: manifestError } = await supabaseAdmin
			.from("manifests")
			.insert([
				{
					manifest_ref: ref,
					origin_hub: originHub,
					destination,
					airline_code: airlineCode,
					manifest_date: new Date().toISOString(),
					total_weight: totalWeight,
					total_pieces: totalPieces,
					status: "scheduled",
					created_by: createdBy ?? null,
				},
			])
			.select("*")
			.single();

		if (manifestError) {
			throw manifestError;
		}

		const manifestId = manifest.id as string;

		const manifestItems = barcodes.map((b) => ({
			manifest_id: manifestId,
			barcode_id: b.id,
		}));

		const { error: itemsError } = await supabaseAdmin
			.from("manifest_items")
			.insert(manifestItems);

		if (itemsError) {
			throw itemsError;
		}

		// Update barcode statuses to MANIFESTED
		const { error: updateError } = await supabaseAdmin
			.from("barcodes")
			.update({ status: "MANIFESTED" })
			.in(
				"id",
				barcodes.map((b) => b.id),
			);

		if (updateError) {
			console.warn(
				"Failed to update barcode statuses to MANIFESTED",
				updateError,
			);
		}

		return NextResponse.json({ success: true, manifest });
	} catch (err: any) {
		if (err.message === "Unauthorized") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		console.error("/api/manifests error", err);
		return NextResponse.json(
			{ error: err?.message ?? "Unknown error" },
			{ status: 500 },
		);
	}
}
