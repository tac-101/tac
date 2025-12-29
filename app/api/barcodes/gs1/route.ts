import { NextResponse } from "next/server";
import { z } from "zod";
import {
	generateGS1128,
	generateGTIN14,
	generateSSCC,
	generateTACBarcode,
	validateGS1Barcode,
} from "@/lib/gs1-barcode";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const generateSchema = z.object({
	type: z.enum(["SSCC", "GTIN14", "TAC", "GS1-128"]),
	shipmentId: z.string().uuid().optional(),
	companyPrefix: z.string().optional(),
	quantity: z.number().int().min(1).max(100).default(1),
	tacType: z.enum(["SHP", "PKG", "MAN", "INV"]).optional(),
	gs1Data: z
		.object({
			batchLot: z.string().optional(),
			expiryDate: z.string().optional(),
			serialNumber: z.string().optional(),
			weight: z.number().optional(),
		})
		.optional(),
});

const validateSchema = z.object({
	barcode: z.string().min(1),
});

export async function POST(req: Request) {
	try {
		const json = await req.json();
		const parsed = generateSchema.safeParse(json);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid request", details: parsed.error.flatten() },
				{ status: 400 }
			);
		}

		const { type, shipmentId, companyPrefix, quantity, tacType, gs1Data } =
			parsed.data;

		const barcodes: Array<{
			barcode: string;
			type: string;
			gs1ElementString?: string;
			humanReadable?: string;
		}> = [];

		for (let i = 0; i < quantity; i++) {
			let barcodeData: {
				barcode: string;
				type: string;
				gs1ElementString?: string;
				humanReadable?: string;
			};

			switch (type) {
				case "SSCC": {
					const result = generateSSCC({ companyPrefix });
					barcodeData = {
						barcode: result.value,
						type: "SSCC",
						gs1ElementString: result.gs1ElementString,
						humanReadable: result.humanReadable,
					};
					break;
				}
				case "GTIN14": {
					const result = generateGTIN14({ companyPrefix });
					barcodeData = {
						barcode: result.value,
						type: "GTIN14",
						gs1ElementString: result.gs1ElementString,
						humanReadable: result.humanReadable,
					};
					break;
				}
				case "TAC": {
					const barcode = generateTACBarcode(tacType || "PKG");
					barcodeData = {
						barcode,
						type: "TAC",
						humanReadable: barcode,
					};
					break;
				}
				case "GS1-128": {
					const sscc = generateSSCC({ companyPrefix });
					const gs1String = generateGS1128({
						sscc: sscc.value,
						batchLot: gs1Data?.batchLot,
						expiryDate: gs1Data?.expiryDate
							? new Date(gs1Data.expiryDate)
							: undefined,
						serialNumber: gs1Data?.serialNumber,
						weight: gs1Data?.weight,
					});
					barcodeData = {
						barcode: sscc.value,
						type: "GS1-128",
						gs1ElementString: gs1String,
						humanReadable: gs1String,
					};
					break;
				}
				default:
					return NextResponse.json(
						{ error: "Unsupported barcode type" },
						{ status: 400 }
					);
			}

			barcodes.push(barcodeData);
		}

		// Optionally save to database
		if (shipmentId || barcodes.length > 0) {
			const insertData = barcodes.map((b) => ({
				barcode_number: b.barcode,
				barcode_type: b.type,
				gs1_sscc: b.type === "SSCC" || b.type === "GS1-128" ? b.barcode : null,
				shipment_id: shipmentId || null,
				status: "pending",
			}));

			const { data: inserted, error } = await supabaseAdmin
				.from("barcodes")
				.insert(insertData)
				.select("id, barcode_number, barcode_type, shipment_id, status");

			if (error) {
				console.warn("Failed to save barcodes to database:", error);
			}

			return NextResponse.json({
				barcodes: barcodes.map((b, i) => ({
					...b,
					id: inserted?.[i]?.id,
					saved: !error,
				})),
				count: barcodes.length,
			});
		}

		return NextResponse.json({
			barcodes,
			count: barcodes.length,
		});
	} catch (err: any) {
		console.error("/api/barcodes/gs1 POST error", err);
		return NextResponse.json(
			{ error: err?.message ?? "Unknown error" },
			{ status: 500 }
		);
	}
}

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const barcode = searchParams.get("validate");

		if (barcode) {
			const result = validateGS1Barcode(barcode);
			return NextResponse.json(result);
		}

		// Return generation options
		return NextResponse.json({
			supportedTypes: ["SSCC", "GTIN14", "TAC", "GS1-128"],
			gs1ApplicationIdentifiers: {
				"00": "SSCC (Serial Shipping Container Code)",
				"01": "GTIN (Global Trade Item Number)",
				"10": "Batch/Lot Number",
				"17": "Expiry Date (YYMMDD)",
				"21": "Serial Number",
				"310n": "Net Weight in kg",
			},
			tacFormats: {
				SHP: "Shipment",
				PKG: "Package",
				MAN: "Manifest",
				INV: "Invoice",
			},
		});
	} catch (err: any) {
		console.error("/api/barcodes/gs1 GET error", err);
		return NextResponse.json(
			{ error: err?.message ?? "Unknown error" },
			{ status: 500 }
		);
	}
}
