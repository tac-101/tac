import { NextResponse } from "next/server";

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ invoiceId: string }> },
) {
	const { invoiceId } = await params;
	const { searchParams } = new URL(req.url);
	const mode = searchParams.get("mode");

	const url = `https://wa.me/1234567890?text=Invoice%20${invoiceId}%20Mode%20${mode}`;
	return NextResponse.json({ success: true, url });
}
