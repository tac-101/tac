import { NextResponse } from "next/server";

export async function GET(
	_req: Request,
	{ params }: { params: Promise<{ invoiceId: string }> },
) {
	const { invoiceId } = await params;
	const url = `https://wa.me/1234567890?text=Invoice%20${invoiceId}`;
	return NextResponse.json({ success: true, url });
}
