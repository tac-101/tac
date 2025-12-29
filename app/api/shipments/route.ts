import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabaseServer";

const createShipmentSchema = z.object({
	customer_id: z.string().uuid(),
	origin: z.string().min(1).max(100),
	destination: z.string().min(1).max(100),
	weight: z.number().positive().optional(),
	status: z.enum(["pending", "in_transit", "delivered", "cancelled"]).default("pending"),
});

const updateShipmentSchema = z.object({
	id: z.string().uuid(),
	status: z
		.enum([
			"pending",
			"picked_up",
			"in_transit",
			"at_hub",
			"out_for_delivery",
			"delivered",
			"cancelled",
		])
		.optional(),
	progress: z.number().int().min(0).max(100).optional(),
	eta: z.string().datetime().optional(),
	notes: z.string().optional(),
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
		const customerId = searchParams.get("customer_id");
		const limit = parseInt(searchParams.get("limit") || "50", 10);

		let query = supabaseAdmin
			.from("shipments")
			.select(
				`
				id,
				shipment_ref,
				origin,
				destination,
				weight,
				status,
				progress,
				created_at,
				customer:customers!customer_id(id, name, phone)
			`
			)
			.order("created_at", { ascending: false })
			.limit(limit);

		if (status) {
			query = query.eq("status", status);
		}

		if (customerId) {
			query = query.eq("customer_id", customerId);
		}

		const { data, error } = await query;

		if (error) throw error;

		const shipments = (data || []).map((s: any) => ({
			id: s.id,
			shipment_ref: s.shipment_ref,
			origin: s.origin,
			destination: s.destination,
			weight: s.weight,
			status: s.status,
			progress: s.progress || 0,
			created_at: s.created_at,
			customer_name: s.customer?.name || "Unknown",
			customer_phone: s.customer?.phone,
		}));

		return NextResponse.json({ shipments, count: shipments.length });
	} catch (err: any) {
		if (err.message === "Unauthorized") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		const errorMessage = err?.message || (typeof err === "object" ? JSON.stringify(err) : String(err));
		console.error("/api/shipments GET error:", errorMessage);
		return NextResponse.json(
			{ error: errorMessage || "Unknown error" },
			{ status: 500 }
		);
	}
}

export async function POST(req: Request) {
	try {
		await checkAuth();
		const json = await req.json();
		const parsed = createShipmentSchema.safeParse(json);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid request", details: parsed.error.flatten() },
				{ status: 400 }
			);
		}

		const { customer_id, origin, destination, weight, status } = parsed.data;

		// Ref generation is now handled by DB trigger trg_generate_shipment_ref
		const { data: shipment, error } = await supabaseAdmin
			.from("shipments")
			.insert([
				{
					customer_id,
					origin,
					destination,
					weight: weight || null,
					status: status || "pending",
					progress: 0,
				},
			])
			.select("*")
			.single();

		if (error) throw error;

		return NextResponse.json({
			shipment,
			message: "Shipment created successfully",
		});
	} catch (err: any) {
		if (err.message === "Unauthorized") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		const errorMessage = err?.message || (typeof err === "object" ? JSON.stringify(err) : String(err));
		console.error("/api/shipments POST error:", errorMessage);
		return NextResponse.json(
			{ error: errorMessage || "Unknown error" },
			{ status: 500 }
		);
	}
}

export async function PATCH(req: Request) {
	try {
		await checkAuth();
		const json = await req.json();
		const parsed = updateShipmentSchema.safeParse(json);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid request", details: parsed.error.flatten() },
				{ status: 400 }
			);
		}

		const { id, status, progress, eta, notes } = parsed.data;

		// Check existence first
		const { data: existing, error: checkError } = await supabaseAdmin
			.from("shipments")
			.select("id")
			.eq("id", id)
			.single();

		if (checkError || !existing) {
			return NextResponse.json(
				{ error: "Shipment not found" },
				{ status: 404 }
			);
		}

		const updatePayload: Record<string, any> = {};
		if (status) updatePayload.status = status;
		if (progress !== undefined) updatePayload.progress = progress;
		if (eta) updatePayload.eta = eta;
		if (notes !== undefined) updatePayload.notes = notes;

		if (status === "delivered") {
			updatePayload.progress = 100;
			updatePayload.delivered_at = new Date().toISOString();
		}

		const { data: shipment, error } = await supabaseAdmin
			.from("shipments")
			.update(updatePayload)
			.eq("id", id)
			.select("*")
			.single();

		if (error) throw error;

		return NextResponse.json({
			shipment,
			message: "Shipment updated successfully",
		});
	} catch (err: any) {
		if (err.message === "Unauthorized") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		const errorMessage = err?.message || (typeof err === "object" ? JSON.stringify(err) : String(err));
		console.error("/api/shipments PATCH error:", errorMessage);
		return NextResponse.json(
			{ error: errorMessage || "Unknown error" },
			{ status: 500 }
		);
	}
}
