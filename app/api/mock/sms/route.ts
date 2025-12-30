import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		
		console.log("[MOCK] SMS message request:", {
			to: body.to,
			message: body.message?.substring(0, 50) + "...",
			timestamp: new Date().toISOString(),
		});

		return NextResponse.json({
			success: true,
			messageId: `mock_sms_${Date.now()}`,
			status: "delivered",
			mock: true,
		});
	} catch (err: any) {
		return NextResponse.json(
			{ error: err?.message || "Mock SMS error" },
			{ status: 500 }
		);
	}
}

export async function GET() {
	return NextResponse.json({
		service: "sms-mock",
		status: "operational",
		mock: true,
	});
}
