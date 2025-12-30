import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST() {
	if (process.env.NODE_ENV === "production") {
		return NextResponse.json(
			{ error: "Not available in production" },
			{ status: 403 },
		);
	}

	const email = process.env.TEST_ADMIN_EMAIL || "testadmin@tapan-cargo.test";
	const password = process.env.TEST_ADMIN_PASSWORD || "TestAdmin2024!";

	try {
		// Check if user already exists
		const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
		const existingUser = existingUsers?.users?.find((u) => u.email === email);

		if (existingUser) {
			// Update password and confirm email
			const { data: updated, error: updateError } =
				await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
					password,
					email_confirm: true,
				});

			if (updateError) throw updateError;

			return NextResponse.json({
				success: true,
				message: "Test user updated",
				userId: updated.user.id,
			});
		}

		// Create new test user
		const { data, error } = await supabaseAdmin.auth.admin.createUser({
			email,
			password,
			email_confirm: true,
			user_metadata: {
				name: "Test Admin",
				role: "admin",
			},
		});

		if (error) throw error;

		// Also insert into users table for profile
		await supabaseAdmin.from("users").upsert(
			{
				id: data.user.id,
				email,
				name: "Test Admin",
				role: "admin",
				location: "imphal",
			},
			{ onConflict: "id" },
		);

		return NextResponse.json({
			success: true,
			message: "Test user created",
			userId: data.user.id,
		});
	} catch (err: any) {
		console.error("/api/dev/seed-test-user error", err);
		return NextResponse.json(
			{ error: err?.message ?? "Failed to seed test user" },
			{ status: 500 },
		);
	}
}
