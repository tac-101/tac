import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

export async function POST(req: Request) {
	try {
		const json = await req.json();
		const parsed = loginSchema.safeParse(json);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid credentials format", details: parsed.error.flatten() },
				{ status: 400 }
			);
		}

		const { email, password } = parsed.data;

		const supabase = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
		);

		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			console.error("Login error:", error.message);
			return NextResponse.json(
				{ error: error.message || "Invalid credentials" },
				{ status: 401 }
			);
		}

		if (!data.user || !data.session) {
			return NextResponse.json(
				{ error: "Login failed - no session created" },
				{ status: 401 }
			);
		}

		// Fetch user profile
		const { data: profile } = await supabase
			.from("users")
			.select("id, email, name, role, location")
			.eq("id", data.user.id)
			.single();

		return NextResponse.json({
			success: true,
			user: {
				id: data.user.id,
				email: data.user.email,
				name: profile?.name || data.user.email,
				role: profile?.role || "operator",
				location: profile?.location || "imphal",
			},
			session: {
				access_token: data.session.access_token,
				refresh_token: data.session.refresh_token,
				expires_at: data.session.expires_at,
			},
		});
	} catch (err: any) {
		console.error("/api/auth/login error", err);
		return NextResponse.json(
			{ error: err?.message ?? "Login failed" },
			{ status: 500 }
		);
	}
}
