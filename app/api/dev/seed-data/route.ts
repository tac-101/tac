import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST() {
	if (process.env.NODE_ENV === "production") {
		return NextResponse.json(
			{ error: "Seed endpoint disabled in production" },
			{ status: 403 }
		);
	}

	try {
		const results: Record<string, any> = {};

		// Seed test customers
		const testCustomers = [
			{
				name: "ABC Corporation",
				phone: "+919876543210",
				email: "billing@abccorp.com",
				city: "New Delhi",
				address: "123 Corporate Park, Connaught Place",
				gst_number: "07AAACB1234A1Z5",
				customer_type: "corporate",
			},
			{
				name: "XYZ Traders",
				phone: "+919123456789",
				email: "info@xyztraders.com",
				city: "Imphal",
				address: "45 Market Road, Imphal East",
				gst_number: "14AABCT1234A1ZA",
				customer_type: "regular",
			},
			{
				name: "Global Exports Ltd",
				phone: "+919988776655",
				email: "exports@global.com",
				city: "Mumbai",
				address: "Tower A, BKC",
				gst_number: "27AABCG5678A1ZB",
				customer_type: "vip",
			},
		];

		const { data: customers, error: custError } = await supabaseAdmin
			.from("customers")
			.upsert(testCustomers, { onConflict: "phone" })
			.select("id, name");

		if (custError) {
			console.warn("Customer seed warning:", custError);
		}
		results.customers = customers?.length || 0;

		// Seed inventory items
		const testInventory = [
			{
				sku: "PKG-BOX-SMALL",
				description: "Small Packing Box (10x10x10)",
				location: "IMF-WH1",
				current_stock: 500,
				min_stock: 100,
			},
			{
				sku: "PKG-BOX-MEDIUM",
				description: "Medium Packing Box (20x20x20)",
				location: "IMF-WH1",
				current_stock: 300,
				min_stock: 75,
			},
			{
				sku: "PKG-BOX-LARGE",
				description: "Large Packing Box (40x40x40)",
				location: "IMF-WH1",
				current_stock: 150,
				min_stock: 50,
			},
			{
				sku: "PKG-BUBBLE-WRAP",
				description: "Bubble Wrap Roll (50m)",
				location: "IMF-WH1",
				current_stock: 80,
				min_stock: 20,
			},
			{
				sku: "PKG-TAPE-BROWN",
				description: "Brown Packing Tape",
				location: "IMF-WH1",
				current_stock: 200,
				min_stock: 50,
			},
			{
				sku: "PKG-LABEL-A4",
				description: "A4 Shipping Labels (100 sheets)",
				location: "DEL-WH1",
				current_stock: 45,
				min_stock: 30,
			},
		];

		const { data: inventory, error: invError } = await supabaseAdmin
			.from("inventory_items")
			.upsert(testInventory, { onConflict: "sku" })
			.select("sku");

		if (invError) {
			console.warn("Inventory seed warning:", invError);
		}
		results.inventory = inventory?.length || 0;

		// Seed warehouses
		const testWarehouses = [
			{
				name: "Imphal Main Warehouse",
				code: "IMF-WH1",
				location: "Airport Road, Imphal",
				city: "Imphal",
				capacity_used: 65,
				status: "active",
			},
			{
				name: "Delhi Distribution Center",
				code: "DEL-WH1",
				location: "Okhla Industrial Area",
				city: "New Delhi",
				capacity_used: 78,
				status: "active",
			},
		];

		const { data: warehouses, error: whError } = await supabaseAdmin
			.from("warehouses")
			.upsert(testWarehouses, { onConflict: "code" })
			.select("id, name");

		if (whError) {
			console.warn("Warehouse seed warning:", whError);
		}
		results.warehouses = warehouses?.length || 0;

		// Create test shipments if customers exist
		if (customers && customers.length > 0) {
			const testShipments = [
				{
					shipment_ref: "SHP-IMF-2412-0001",
					customer_id: customers[0].id,
					origin: "Imphal",
					destination: "New Delhi",
					weight: 25.5,
					pieces: 3,
					transport_mode: "air",
					status: "in_transit",
					progress: 45,
				},
				{
					shipment_ref: "SHP-IMF-2412-0002",
					customer_id: customers[1]?.id || customers[0].id,
					origin: "Imphal",
					destination: "Mumbai",
					weight: 12.0,
					pieces: 1,
					transport_mode: "air",
					status: "pending",
					progress: 0,
				},
				{
					shipment_ref: "SHP-DEL-2412-0003",
					customer_id: customers[0].id,
					origin: "New Delhi",
					destination: "Imphal",
					weight: 8.5,
					pieces: 2,
					transport_mode: "surface",
					status: "delivered",
					progress: 100,
				},
			];

			const { data: shipments, error: shipError } = await supabaseAdmin
				.from("shipments")
				.upsert(testShipments, { onConflict: "shipment_ref" })
				.select("id, shipment_ref");

			if (shipError) {
				console.warn("Shipment seed warning:", shipError);
			}
			results.shipments = shipments?.length || 0;

			// Create barcodes for shipments
			if (shipments && shipments.length > 0) {
				const testBarcodes = shipments.map((s, i) => ({
					barcode_number: `TG-PKG-${Date.now()}-${String(i + 1).padStart(4, "0")}`,
					shipment_id: s.id,
					status: s.shipment_ref.includes("0003") ? "delivered" : "pending",
				}));

				const { data: barcodes, error: barError } = await supabaseAdmin
					.from("barcodes")
					.insert(testBarcodes)
					.select("id, barcode_number");

				if (barError) {
					console.warn("Barcode seed warning:", barError);
				}
				results.barcodes = barcodes?.length || 0;
			}
		}

		// Seed shipment rates
		const testRates = [
			{
				origin: "Imphal",
				destination: "New Delhi",
				transport_mode: "air",
				rate_per_kg: 120,
				base_fee: 250,
				min_weight: 0.5,
			},
			{
				origin: "Imphal",
				destination: "New Delhi",
				transport_mode: "surface",
				rate_per_kg: 45,
				base_fee: 150,
				min_weight: 1,
			},
			{
				origin: "New Delhi",
				destination: "Imphal",
				transport_mode: "air",
				rate_per_kg: 110,
				base_fee: 200,
				min_weight: 0.5,
			},
			{
				origin: "Imphal",
				destination: "Mumbai",
				transport_mode: "air",
				rate_per_kg: 150,
				base_fee: 300,
				min_weight: 0.5,
			},
		];

		const { data: rates, error: rateError } = await supabaseAdmin
			.from("shipment_rates")
			.upsert(testRates, { onConflict: "origin,destination,transport_mode" })
			.select("id");

		if (rateError) {
			console.warn("Rate seed warning:", rateError);
		}
		results.rates = rates?.length || 0;

		return NextResponse.json({
			success: true,
			message: "Test data seeded successfully",
			results,
		});
	} catch (err: any) {
		console.error("/api/dev/seed-data error", err);
		return NextResponse.json(
			{ error: err?.message ?? "Seed failed" },
			{ status: 500 }
		);
	}
}

export async function GET() {
	return NextResponse.json({
		message: "Use POST to seed test data",
		warning: "This endpoint is disabled in production",
	});
}
