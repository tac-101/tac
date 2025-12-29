import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabaseServer";

const createCustomerSchema = z.object({
	name: z.string().min(1).max(200),
	phone: z.string().optional(),
	email: z.string().email().optional(),
	address: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	pincode: z.string().optional(),
	gst_number: z.string().optional(),
	customer_type: z.enum(["regular", "corporate", "vip"]).default("regular"),
});

const updateCustomerSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1).max(200).optional(),
	phone: z.string().optional(),
	email: z.string().email().optional(),
	address: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	pincode: z.string().optional(),
	gst_number: z.string().optional(),
	customer_type: z.enum(["regular", "corporate", "vip"]).optional(),
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
		const search = searchParams.get("search");
		const city = searchParams.get("city");
		const limit = parseInt(searchParams.get("limit") || "50", 10);

		let query = supabaseAdmin
			.from("customers")
			.select("*")
			.order("created_at", { ascending: false })
			.limit(limit);

		if (search) {
			query = query.or(
				`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`
			);
		}

		if (city) {
			query = query.eq("city", city);
		}

		const { data, error } = await query;

		if (error) throw error;

		return NextResponse.json({ customers: data || [], count: data?.length || 0 });
	} catch (err: any) {
		if (err.message === "Unauthorized") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		console.error("/api/customers GET error", err);
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
		const parsed = createCustomerSchema.safeParse(json);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid request", details: parsed.error.flatten() },
				{ status: 400 }
			);
		}

		const { data: customer, error } = await supabaseAdmin
			.from("customers")
			.insert([parsed.data])
			.select("*")
			.single();

		if (error) throw error;

		return NextResponse.json({
			customer,
			message: "Customer created successfully",
		});
	} catch (err: any) {
		if (err.message === "Unauthorized") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		console.error("/api/customers POST error", err);
		return NextResponse.json(
			{ error: err?.message ?? "Unknown error" },
			{ status: 500 }
		);
	}
}

export async function PATCH(req: Request) {
	try {
		await checkAuth();
		const json = await req.json();
		const parsed = updateCustomerSchema.safeParse(json);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid request", details: parsed.error.flatten() },
				{ status: 400 }
			);
		}

		const { id, ...updateData } = parsed.data;

		// Check existence first to return 404 correctly
		const { data: existing, error: checkError } = await supabaseAdmin
			.from("customers")
			.select("id")
			.eq("id", id)
			.single();

		if (checkError || !existing) {
			return NextResponse.json(
				{ error: "Customer not found" },
				{ status: 404 }
			);
		}

		const { data: customer, error } = await supabaseAdmin
			.from("customers")
			.update(updateData)
			.eq("id", id)
			.select("*")
			.single();

		if (error) throw error;

		return NextResponse.json({
			customer,
			message: "Customer updated successfully",
		});
	} catch (err: any) {
		if (err.message === "Unauthorized") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		console.error("/api/customers PATCH error", err);
		return NextResponse.json(
			{ error: err?.message ?? "Unknown error" },
			{ status: 500 }
		);
	}
}
