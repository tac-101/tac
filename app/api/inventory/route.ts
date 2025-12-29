import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabaseServer";

const adjustmentSchema = z.object({
	sku: z.string().min(1),
	adjustmentType: z.enum(["inbound", "outbound", "adjustment", "cycle_count"]),
	quantity: z.number().int(),
	location: z.string().optional(),
	reason: z.string().optional(),
	operatorId: z.string().optional(),
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
		const location = searchParams.get("location");
		const lowStockOnly = searchParams.get("lowStock") === "true";

		let query = supabaseAdmin
			.from("inventory_items")
			.select("*")
			.order("last_updated", { ascending: false });

		if (location && location !== "all") {
			query = query.eq("location", location);
		}

		const { data, error } = await query;

		if (error) throw error;

		let items = data || [];

		if (lowStockOnly) {
			items = items.filter(
				(item: any) => item.current_stock < item.min_stock * 1.5
			);
		}

		return NextResponse.json({ items });
	} catch (err: any) {
		if (err.message === "Unauthorized") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		console.error("/api/inventory GET error", err);
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
		const parsed = adjustmentSchema.safeParse(json);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid request", details: parsed.error.flatten() },
				{ status: 400 }
			);
		}

		const { sku, adjustmentType, quantity, location, reason, operatorId } =
			parsed.data;

		const { data: item, error: fetchError } = await supabaseAdmin
			.from("inventory_items")
			.select("*")
			.eq("sku", sku)
			.maybeSingle();

		if (fetchError) throw fetchError;

		if (!item) {
			return NextResponse.json(
				{ error: "SKU not found in inventory" },
				{ status: 404 }
			);
		}

		let newStock = item.current_stock;
		let qChange = 0;

		switch (adjustmentType) {
			case "inbound":
				qChange = Math.abs(quantity);
				newStock += qChange;
				break;
			case "outbound":
				qChange = -Math.abs(quantity);
				newStock += qChange;
				break;
			case "adjustment":
			case "cycle_count":
				newStock = quantity;
				qChange = newStock - item.current_stock;
				break;
		}

		if (newStock < 0) {
			return NextResponse.json(
				{ error: "Insufficient stock for outbound adjustment" },
				{ status: 400 }
			);
		}

		const now = new Date().toISOString();

		const { data: updatedItem, error: updateError } = await supabaseAdmin
			.from("inventory_items")
			.update({
				current_stock: newStock,
				last_updated: now,
				location: location || item.location,
			})
			.eq("sku", sku)
			.select("*")
			.single();

		if (updateError) throw updateError;

		const { error: logError } = await supabaseAdmin
			.from("inventory_adjustments")
			.insert([
				{
					sku,
					adjustment_type: adjustmentType,
					quantity_change: qChange,
					previous_stock: item.current_stock,
					new_stock: newStock,
					location: location || item.location,
					reason: reason || null,
					operator_id: operatorId || null,
					created_at: now,
				},
			]);

		if (logError) {
			console.warn("Failed to log inventory adjustment:", logError);
		}

		return NextResponse.json({
			item: updatedItem,
			adjustment: {
				type: adjustmentType,
				previousStock: item.current_stock,
				newStock,
				change: qChange,
			},
		});
	} catch (err: any) {
		if (err.message === "Unauthorized") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		console.error("/api/inventory POST error", err);
		return NextResponse.json(
			{ error: err?.message ?? "Unknown error" },
			{ status: 500 }
		);
	}
}
