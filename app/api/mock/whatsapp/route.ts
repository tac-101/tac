import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		
		console.log("[MOCK] WhatsApp message request:", {
			to: body.to,
			template: body.template,
			timestamp: new Date().toISOString(),
		});

		return NextResponse.json({
			success: true,
			messageId: `mock_msg_${Date.now()}`,
			status: "sent",
			mock: true,
		});
	} catch (err: any) {
		return NextResponse.json(
			{ error: err?.message || "Mock WhatsApp error" },
			{ status: 500 }
		);
	}
}

export async function GET() {
	return NextResponse.json({
		service: "whatsapp-mock",
		status: "operational",
		mock: true,
	});
}
