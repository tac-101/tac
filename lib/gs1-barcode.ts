/**
 * GS1/SSCC Barcode Generation Service
 * Generates globally compliant barcodes for logistics operations
 * 
 * Standards supported:
 * - SSCC-18 (Serial Shipping Container Code)
 * - GTIN-14 (Global Trade Item Number)
 * - GS1-128 Application Identifiers
 */

export interface SSCCConfig {
	extensionDigit?: number; // 0-9, default 0
	companyPrefix: string; // 7-10 digits GS1 company prefix
	serialReference?: string; // Auto-generated if not provided
}

export interface GTINConfig {
	indicatorDigit?: number; // 0-9 for packaging level
	companyPrefix: string;
	itemReference: string;
}

export interface BarcodeResult {
	type: "SSCC" | "GTIN14" | "GS1-128";
	value: string;
	humanReadable: string;
	checkDigit: number;
	gs1ElementString: string;
}

const DEFAULT_COMPANY_PREFIX = "0000000"; // Placeholder - should be configured per deployment

/**
 * Calculate GS1 Modulo 10 check digit
 */
function calculateCheckDigit(digits: string): number {
	const chars = digits.split("").map(Number);
	let sum = 0;

	for (let i = 0; i < chars.length; i++) {
		const weight = i % 2 === 0 ? 3 : 1;
		sum += chars[chars.length - 1 - i] * weight;
	}

	const remainder = sum % 10;
	return remainder === 0 ? 0 : 10 - remainder;
}

/**
 * Generate a unique serial reference based on timestamp and random
 */
function generateSerialReference(length: number): string {
	const timestamp = Date.now().toString(36).toUpperCase();
	const random = Math.random().toString(36).substring(2, 8).toUpperCase();
	const combined = (timestamp + random).replace(/[^0-9]/g, "");
	return combined.padStart(length, "0").substring(0, length);
}

/**
 * Generate SSCC-18 (Serial Shipping Container Code)
 * Format: (00) Extension + Company Prefix + Serial Reference + Check Digit
 * Total: 18 digits
 */
export function generateSSCC(config?: Partial<SSCCConfig>): BarcodeResult {
	const extensionDigit = config?.extensionDigit ?? 0;
	const companyPrefix = config?.companyPrefix || DEFAULT_COMPANY_PREFIX;
	
	// Calculate serial reference length (17 - 1 extension - company prefix length)
	const serialLength = 17 - 1 - companyPrefix.length;
	const serialReference = config?.serialReference || generateSerialReference(serialLength);
	
	// Build the 17-digit base (without check digit)
	const base = `${extensionDigit}${companyPrefix}${serialReference.padStart(serialLength, "0")}`;
	
	// Ensure exactly 17 digits
	const trimmedBase = base.substring(0, 17);
	const checkDigit = calculateCheckDigit(trimmedBase);
	
	const fullSSCC = `${trimmedBase}${checkDigit}`;
	
	return {
		type: "SSCC",
		value: fullSSCC,
		humanReadable: `(00) ${fullSSCC}`,
		checkDigit,
		gs1ElementString: `00${fullSSCC}`,
	};
}

/**
 * Generate GTIN-14 (Global Trade Item Number for logistics)
 * Format: Indicator + Company Prefix + Item Reference + Check Digit
 * Total: 14 digits
 */
export function generateGTIN14(config?: Partial<GTINConfig>): BarcodeResult {
	const indicatorDigit = config?.indicatorDigit ?? 1; // 1 = standard trade item
	const companyPrefix = config?.companyPrefix || DEFAULT_COMPANY_PREFIX;
	const itemReference = config?.itemReference || generateSerialReference(5);
	
	// Build 13-digit base (indicator + company prefix + item reference)
	const base = `${indicatorDigit}${companyPrefix}${itemReference}`;
	const trimmedBase = base.substring(0, 13).padEnd(13, "0");
	
	const checkDigit = calculateCheckDigit(trimmedBase);
	const fullGTIN = `${trimmedBase}${checkDigit}`;
	
	return {
		type: "GTIN14",
		value: fullGTIN,
		humanReadable: `(01) ${fullGTIN}`,
		checkDigit,
		gs1ElementString: `01${fullGTIN}`,
	};
}

/**
 * Generate a TAC-specific barcode with prefix
 * Format: TG-{TYPE}-{YYYYMMDD}-{SERIAL}
 */
export function generateTACBarcode(
	type: "SHP" | "PKG" | "MAN" | "INV" = "PKG"
): string {
	const date = new Date();
	const dateStr = [
		date.getFullYear(),
		String(date.getMonth() + 1).padStart(2, "0"),
		String(date.getDate()).padStart(2, "0"),
	].join("");
	
	const serial = generateSerialReference(6);
	
	return `TG-${type}-${dateStr}-${serial}`;
}

/**
 * Generate GS1-128 element string with multiple AIs
 */
export function generateGS1128(data: {
	sscc?: string;
	gtin?: string;
	batchLot?: string;
	expiryDate?: Date;
	serialNumber?: string;
	weight?: number; // in kg, 3 decimal places
}): string {
	const elements: string[] = [];
	
	// AI (00) - SSCC
	if (data.sscc) {
		elements.push(`(00)${data.sscc}`);
	}
	
	// AI (01) - GTIN
	if (data.gtin) {
		elements.push(`(01)${data.gtin}`);
	}
	
	// AI (10) - Batch/Lot Number
	if (data.batchLot) {
		elements.push(`(10)${data.batchLot.substring(0, 20)}`);
	}
	
	// AI (17) - Expiry Date (YYMMDD)
	if (data.expiryDate) {
		const yy = String(data.expiryDate.getFullYear()).slice(-2);
		const mm = String(data.expiryDate.getMonth() + 1).padStart(2, "0");
		const dd = String(data.expiryDate.getDate()).padStart(2, "0");
		elements.push(`(17)${yy}${mm}${dd}`);
	}
	
	// AI (21) - Serial Number
	if (data.serialNumber) {
		elements.push(`(21)${data.serialNumber.substring(0, 20)}`);
	}
	
	// AI (310n) - Net Weight in kg (n = decimal places)
	if (data.weight !== undefined) {
		const weightInt = Math.round(data.weight * 1000); // 3 decimal places
		elements.push(`(3103)${String(weightInt).padStart(6, "0")}`);
	}
	
	return elements.join("");
}

/**
 * Validate a barcode against GS1 standards
 */
export function validateGS1Barcode(barcode: string): {
	valid: boolean;
	type: string | null;
	error: string | null;
} {
	// Remove any formatting
	const clean = barcode.replace(/[^0-9]/g, "");
	
	// Check SSCC-18
	if (clean.length === 18) {
		const base = clean.substring(0, 17);
		const checkDigit = parseInt(clean[17], 10);
		const calculated = calculateCheckDigit(base);
		
		if (checkDigit === calculated) {
			return { valid: true, type: "SSCC-18", error: null };
		}
		return {
			valid: false,
			type: "SSCC-18",
			error: `Invalid check digit. Expected ${calculated}, got ${checkDigit}`,
		};
	}
	
	// Check GTIN-14
	if (clean.length === 14) {
		const base = clean.substring(0, 13);
		const checkDigit = parseInt(clean[13], 10);
		const calculated = calculateCheckDigit(base);
		
		if (checkDigit === calculated) {
			return { valid: true, type: "GTIN-14", error: null };
		}
		return {
			valid: false,
			type: "GTIN-14",
			error: `Invalid check digit. Expected ${calculated}, got ${checkDigit}`,
		};
	}
	
	// Check GTIN-13 (EAN-13)
	if (clean.length === 13) {
		const base = clean.substring(0, 12);
		const checkDigit = parseInt(clean[12], 10);
		const calculated = calculateCheckDigit(base);
		
		if (checkDigit === calculated) {
			return { valid: true, type: "GTIN-13", error: null };
		}
		return {
			valid: false,
			type: "GTIN-13",
			error: `Invalid check digit. Expected ${calculated}, got ${checkDigit}`,
		};
	}
	
	return {
		valid: false,
		type: null,
		error: `Unknown barcode format. Length: ${clean.length}`,
	};
}
