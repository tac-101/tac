/**
 * WhatsApp Invoice Delivery Service
 * Handles invoice and tracking notification delivery via WhatsApp Business API
 */

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export interface InvoiceNotificationResult {
	success: boolean;
	messageId?: string;
	error?: string;
	phone?: string;
}

export interface TrackingNotificationResult {
	success: boolean;
	messageId?: string;
	error?: string;
}

/**
 * Send invoice notification via WhatsApp
 */
export async function sendInvoiceNotification(
	invoiceId: string
): Promise<InvoiceNotificationResult> {
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/send-whatsapp`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ invoiceId }),
			}
		);

		const json = await response.json();

		if (!response.ok) {
			return {
				success: false,
				error: json.error || "Failed to send WhatsApp notification",
			};
		}

		return {
			success: true,
			messageId: json.messageId,
			phone: json.to,
		};
	} catch (err: any) {
		return {
			success: false,
			error: err.message || "Network error",
		};
	}
}

/**
 * Send bulk invoice notifications
 */
export async function sendBulkInvoiceNotifications(
	invoiceIds: string[]
): Promise<{
	sent: number;
	failed: number;
	results: InvoiceNotificationResult[];
}> {
	const results: InvoiceNotificationResult[] = [];
	let sent = 0;
	let failed = 0;

	for (const invoiceId of invoiceIds) {
		const result = await sendInvoiceNotification(invoiceId);
		results.push(result);

		if (result.success) {
			sent++;
		} else {
			failed++;
		}

		// Rate limiting: wait 1 second between messages
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}

	return { sent, failed, results };
}

/**
 * Send shipment tracking update via WhatsApp
 */
export async function sendTrackingUpdate(params: {
	phone: string;
	shipmentRef: string;
	status: string;
	location?: string;
	eta?: string;
}): Promise<TrackingNotificationResult> {
	const token = process.env.WHATSAPP_ACCESS_TOKEN;
	const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
	const templateName = process.env.WHATSAPP_TRACKING_TEMPLATE || "shipment_update";
	const templateLanguage = process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en_US";

	if (!token || !phoneNumberId) {
		return {
			success: false,
			error: "WhatsApp not configured",
		};
	}

	// Normalize phone number
	let to = params.phone.replace(/\s+/g, "");
	if (!to.startsWith("+")) {
		const digitsOnly = to.replace(/\D+/g, "");
		if (digitsOnly.length === 10) {
			const countryCode = process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || "91";
			to = `+${countryCode}${digitsOnly}`;
		} else {
			to = `+${digitsOnly}`;
		}
	}

	const statusText = params.status.replace(/_/g, " ").toUpperCase();

	const messageBody = {
		messaging_product: "whatsapp",
		to,
		type: "template",
		template: {
			name: templateName,
			language: { code: templateLanguage },
			components: [
				{
					type: "body",
					parameters: [
						{ type: "text", text: params.shipmentRef },
						{ type: "text", text: statusText },
						{ type: "text", text: params.location || "In Transit" },
						{ type: "text", text: params.eta || "Pending" },
					],
				},
			],
		},
	};

	try {
		const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(messageBody),
		});

		const json = await response.json();

		if (!response.ok) {
			return {
				success: false,
				error: json.error?.message || "WhatsApp API error",
			};
		}

		const messageId = json.messages?.[0]?.id;

		// Log the notification
		try {
			await supabaseAdmin.from("whatsapp_logs").insert({
				phone: to,
				mode: "tracking_update",
				status: "sent",
				provider_message_id: messageId,
				raw_response: json,
			});
		} catch {
			// Ignore logging errors
		}

		return {
			success: true,
			messageId,
		};
	} catch (err: any) {
		return {
			success: false,
			error: err.message || "Network error",
		};
	}
}

/**
 * Get pending invoices that need WhatsApp delivery
 */
export async function getPendingInvoicesForWhatsApp(): Promise<
	Array<{
		id: string;
		invoice_ref: string;
		customer_name: string;
		customer_phone: string;
		amount: number;
	}>
> {
	const { data, error } = await supabaseAdmin
		.from("invoices")
		.select(
			`
			id,
			invoice_ref,
			amount,
			customer:customers(name, phone)
		`
		)
		.in("status", ["pending", "unpaid"])
		.order("created_at", { ascending: false })
		.limit(50);

	if (error || !data) {
		return [];
	}

	return data
		.filter((inv: any) => inv.customer?.phone)
		.map((inv: any) => ({
			id: inv.id,
			invoice_ref: inv.invoice_ref,
			customer_name: inv.customer?.name || "Customer",
			customer_phone: inv.customer?.phone,
			amount: inv.amount || 0,
		}));
}
