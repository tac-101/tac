import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

interface GenerateBarcodeBody {
	barcodeNumber?: string;
	shipmentId?: string;
	type?: string;
}

export async function POST(req: Request) {
	try {
		const body = (await req.json()) as GenerateBarcodeBody;
		const barcodeNumber = body.barcodeNumber;

		if (!barcodeNumber) {
			return NextResponse.json(
				{ error: "barcodeNumber is required" },
				{ status: 400 },
			);
		}

		const trimmedShipmentId =
			typeof body.shipmentId === "string" ? body.shipmentId.trim() : "";

		const uuidRegex =
			/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

		const shipmentUuid =
			trimmedShipmentId && uuidRegex.test(trimmedShipmentId)
				? trimmedShipmentId
				: null;

		const { data, error } = await supabaseAdmin
			.from("barcodes")
			.insert([
				{
					barcode_number: barcodeNumber,
					shipment_id: shipmentUuid,
					status: "pending",
				},
			])
			.select("id, barcode_number, shipment_id, status")
			.single();

		if (error) {
			throw error;
		}

		return NextResponse.json({ barcode: data });
	} catch (err: any) {
		console.error("/api/barcode/generate error", err);
		return NextResponse.json(
			{ error: err?.message ?? "Unknown error" },
			{ status: 500 },
		);
	}
}

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const type = searchParams.get("type");
	const number = searchParams.get("number");

	if (!type) {
		return NextResponse.json(
			{ error: "Missing type parameter. Supported types: TAC, code128, ean13, qr, gs1" },
			{ status: 400 },
		);
	}

	const supportedTypes = ["TAC", "code128", "ean13", "qr", "gs1", "sscc18", "gtin14"];
	const normalizedType = type.toLowerCase();

	if (normalizedType === "tac" || type === "TAC") {
		const barcodeNumber = `TAC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
		return NextResponse.json({ barcode: { barcode_number: barcodeNumber, type: "TAC" } });
	}

	if (normalizedType === "code128") {
		const barcodeNumber = number || `C128-${Date.now().toString(36).toUpperCase()}`;
		return NextResponse.json({ barcode: { barcode_number: barcodeNumber, type: "code128", format: "CODE128" } });
	}

	if (normalizedType === "ean13") {
		const barcodeNumber = number || generateEAN13();
		return NextResponse.json({ barcode: { barcode_number: barcodeNumber, type: "ean13", format: "EAN13" } });
	}

	if (normalizedType === "qr") {
		const barcodeNumber = number || `QR-${Date.now()}`;
		return NextResponse.json({ barcode: { barcode_number: barcodeNumber, type: "qr", format: "QR_CODE" } });
	}

	if (normalizedType === "gs1" || normalizedType === "sscc18" || normalizedType === "gtin14") {
		const barcodeNumber = number || generateGS1Barcode(normalizedType);
		return NextResponse.json({ barcode: { barcode_number: barcodeNumber, type: normalizedType, format: "GS1" } });
	}

	return NextResponse.json(
		{ error: `Unsupported type: ${type}. Supported types: ${supportedTypes.join(", ")}` },
		{ status: 400 },
	);
}

function generateEAN13(): string {
	let code = "890"; // India country code
	for (let i = 0; i < 9; i++) {
		code += Math.floor(Math.random() * 10);
	}
	// Calculate check digit
	let sum = 0;
	for (let i = 0; i < 12; i++) {
		sum += parseInt(code[i]) * (i % 2 === 0 ? 1 : 3);
	}
	const checkDigit = (10 - (sum % 10)) % 10;
	return code + checkDigit;
}

function generateGS1Barcode(type: string): string {
	const timestamp = Date.now().toString().slice(-10);
	if (type === "sscc18") {
		return `00${timestamp}${Math.random().toString().slice(2, 10)}`;
	}
	if (type === "gtin14") {
		return `0${timestamp}${Math.random().toString().slice(2, 5)}`;
	}
	return `(01)${timestamp}${Math.random().toString().slice(2, 6)}`;
}
