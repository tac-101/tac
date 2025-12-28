import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginPage } from "@/app/(auth)/_components/login-page";
import { createClient } from "@/lib/supabaseServer";

export const metadata: Metadata = {
	title: "TAC Logistics | Command Terminal",
	description: "Secure terminal access for TAC Logistics personnel.",
};

export default async function LoginPageRoute() {
	const supabase = await createClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (session) {
		redirect("/dashboard");
	}

	return <LoginPage />;
}
