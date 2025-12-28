"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
	isAccountLocked,
	registerFailedLogin,
	resetLockout,
} from "@/lib/account-lockout";
import { logAuthEvent } from "@/lib/audit-log";
import { requireRateLimit } from "@/lib/rateLimit";
import { createClient } from "@/lib/supabaseServer";

const signInSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1, "Password is required"),
});

export async function signInAction(data: z.infer<typeof signInSchema>) {
	const { email, password } = data;
	const emailDomain = email.split("@")[1] ?? "unknown";
	const logger = {
		info: (...args: any[]) => console.info(...args),
		warn: (...args: any[]) => console.warn(...args),
		error: (...args: any[]) => console.error(...args),
	};

	// 1. Rate Limiting
	const headerStore = await headers();
	const ip = headerStore.get("x-forwarded-for") || "unknown";
	const userAgent = headerStore.get("user-agent") || "unknown";
	try {
		await requireRateLimit("auth", ip);
	} catch (error) {
		console.warn("Rate limit reached for auth (ip)", {
			ip,
			error: error instanceof Error ? error.message : String(error),
		});

		logger.warn(`Rate limit reached for auth from IP: ${ip}`);

		await logAuthEvent("login_failure", null, {
			ip,
			userAgent,
			reason: "rate_limit_ip",
		});

		return {
			success: false,
			error: "Too many login attempts. Please try again in a minute.",
		};
	}

	// Per-account rate limiting (email-based)
	const emailHash = createHash("sha256")
		.update(email.toLowerCase())
		.digest("hex")
		.slice(0, 16);

	try {
		await requireRateLimit("auth", `account:${emailHash}`);
	} catch (error) {
		console.warn("Rate limit reached for auth (account)", {
			emailHash,
			error: error instanceof Error ? error.message : String(error),
		});

		logger.warn("Rate limit reached for auth account", {
			emailHash,
		});

		await logAuthEvent("login_failure", null, {
			ip,
			userAgent,
			reason: "rate_limit_account",
			emailHash,
		});

		return {
			success: false,
			error:
				"Too many login attempts for this account. Please try again in a minute.",
		};
	}

	const locked = await isAccountLocked(emailHash);
	if (locked) {
		await logAuthEvent("login_failure", null, {
			ip,
			userAgent,
			reason: "account_locked",
			emailHash,
		});

		return {
			success: false,
			error: "Too many failed login attempts. Please try again later.",
		};
	}

	// 2. Validation
	const validated = signInSchema.safeParse({ email, password });
	if (!validated.success) {
		logger.warn("Sign-in validation failed", {
			reason: "invalid_credentials",
		});

		await logAuthEvent("login_failure", null, {
			reason: "validation",
			emailDomain,
		});

		// Don't register failed login for validation errors - these are client-side
		// input issues, not actual authentication attempts that should trigger lockout

		return { success: false, error: "Invalid email or password." };
	}

	try {
		// 3. Supabase Auth
		const supabase = await createClient();
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			console.error(error);

			logger.error(
				`Supabase sign-in failed for domain ${emailDomain}: ${error.message}`,
			);

			await logAuthEvent("login_failure", null, {
				reason: "supabase_error",
				emailDomain,
				message: error.message,
			});

			await registerFailedLogin(emailHash);

			return { success: false, error: error.message };
		}

		if (!data?.session) {
			logger.error(
				`Supabase sign-in returned no session for domain ${emailDomain}`,
			);

			await logAuthEvent("login_failure", null, {
				reason: "no_session",
				emailDomain,
			});

			await registerFailedLogin(emailHash);

			return {
				success: false,
				error: "Failed to create session. Please try again.",
			};
		}

		const user = data.user;

		if (!user?.email_confirmed_at) {
			logger.warn("Unverified email attempted login", { emailDomain });

			await logAuthEvent("login_failure", user?.id ?? null, {
				reason: "unverified_email",
				emailDomain,
			});

			return {
				success: false,
				error: "Please verify your email address before signing in.",
			};
		}

		logger.info("User signed in", { emailDomain, userId: user.id });

		await logAuthEvent("login_success", user.id, {
			ip,
			userAgent,
			emailDomain,
		});

		await resetLockout(emailHash);

		return { success: true };
	} catch (error) {
		console.error(error);

		logger.error(
			`Unexpected sign-in error: ${
				error instanceof Error ? error.message : "unknown error"
			}`,
		);

		return {
			success: false,
			error: "An unexpected error occurred while signing in.",
		};
	}
}

export async function signOutAction() {
	const supabase = await createClient();
	const headerStore = await headers();
	const ip = headerStore.get("x-forwarded-for") || "unknown";
	const userAgent = headerStore.get("user-agent") || "unknown";
	const { data } = await supabase.auth.getUser();
	const userId = data?.user?.id ?? null;
	await supabase.auth.signOut();
	await logAuthEvent("logout", userId, {
		ip,
		userAgent,
	});
	redirect("/login");
}
