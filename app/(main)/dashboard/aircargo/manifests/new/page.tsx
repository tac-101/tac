"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Plane, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const AIRLINES = [
	{ code: "AI", name: "Air India" },
	{ code: "6E", name: "IndiGo" },
	{ code: "SG", name: "SpiceJet" },
	{ code: "UK", name: "Vistara" },
	{ code: "QR", name: "Qatar Airways" },
	{ code: "EK", name: "Emirates" },
	{ code: "SQ", name: "Singapore Airlines" },
	{ code: "LH", name: "Lufthansa" },
] as const;

const HUBS = [
	{ code: "DEL", name: "New Delhi (DEL)" },
	{ code: "BLR", name: "Bengaluru (BLR)" },
	{ code: "BOM", name: "Mumbai (BOM)" },
	{ code: "MAA", name: "Chennai (MAA)" },
	{ code: "CCU", name: "Kolkata (CCU)" },
	{ code: "GAU", name: "Guwahati (GAU)" },
	{ code: "IMF", name: "Imphal (IMF)" },
	{ code: "DXB", name: "Dubai (DXB)" },
	{ code: "SIN", name: "Singapore (SIN)" },
] as const;

const manifestSchema = z.object({
	originHub: z.string().min(2, "Origin hub is required"),
	destination: z.string().min(2, "Destination is required"),
	airlineCode: z.string().min(1, "Airline is required"),
	flightNumber: z.string().min(1, "Flight number is required"),
	manifestDate: z.string().min(1, "Manifest date is required"),
	pieces: z.number().min(1, "At least 1 piece required"),
	weight: z.number().min(0.1, "Weight must be greater than 0"),
});

type ManifestFormValues = z.infer<typeof manifestSchema>;

function generateManifestRef(): string {
	const prefix = "MAN";
	const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
	const random = Math.random().toString(36).substring(2, 6).toUpperCase();
	return `${prefix}-${date}-${random}`;
}

function getTodayDate(): string {
	return new Date().toISOString().split("T")[0];
}

export default function NewManifestPage() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [generatedRef] = useState(generateManifestRef());
	const [scannedBarcodes, setScannedBarcodes] = useState<string[]>([]);
	const [barcodeInput, setBarcodeInput] = useState("");

	const form = useForm<ManifestFormValues>({
		resolver: zodResolver(manifestSchema),
		defaultValues: {
			originHub: "",
			destination: "",
			airlineCode: "",
			flightNumber: "",
			manifestDate: getTodayDate(),
			pieces: 1,
			weight: 1,
		},
	});

	const addBarcode = () => {
		const trimmed = barcodeInput.trim();
		if (trimmed && !scannedBarcodes.includes(trimmed)) {
			setScannedBarcodes([...scannedBarcodes, trimmed]);
			setBarcodeInput("");
		}
	};

	const removeBarcode = (barcode: string) => {
		setScannedBarcodes(scannedBarcodes.filter((b) => b !== barcode));
	};

	const onSubmit = async (values: ManifestFormValues) => {
		setIsSubmitting(true);
		try {
			const response = await fetch("/api/manifests", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					manifestRef: generatedRef,
					originHub: values.originHub,
					destination: values.destination,
					airlineCode: values.airlineCode,
					flightNumber: values.flightNumber,
					manifestDate: values.manifestDate,
					scannedBarcodeIds: scannedBarcodes,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to create manifest");
			}

			toast.success("Manifest Created", {
				description: `Manifest ${generatedRef} created successfully`,
			});

			router.push("/dashboard/aircargo");
		} catch (err: any) {
			console.error("Manifest creation error:", err);
			toast.error("Failed to create manifest", {
				description: err?.message || "Please try again",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const selectedAirline = AIRLINES.find((a) => a.code === form.watch("airlineCode"));

	return (
		<div className="container max-w-4xl space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" asChild>
					<Link href="/dashboard/aircargo">
						<ArrowLeft className="h-5 w-5" />
					</Link>
				</Button>
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Create New Manifest</h1>
					<p className="text-muted-foreground">
						Manifest #: <span className="font-mono font-semibold">{generatedRef}</span>
					</p>
				</div>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					{/* Flight Details */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg flex items-center gap-2">
								<Plane className="h-5 w-5" />
								Flight Details
							</CardTitle>
							<CardDescription>Enter flight and route information</CardDescription>
						</CardHeader>
						<CardContent className="grid gap-4 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="originHub"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Origin Hub *</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select origin" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{HUBS.map((hub) => (
													<SelectItem key={hub.code} value={hub.code}>
														{hub.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="destination"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Destination *</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select destination" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{HUBS.map((hub) => (
													<SelectItem key={hub.code} value={hub.code}>
														{hub.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="airlineCode"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Airline *</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select airline" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{AIRLINES.map((airline) => (
													<SelectItem key={airline.code} value={airline.code}>
														{airline.code} - {airline.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="flightNumber"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Flight Number *</FormLabel>
										<FormControl>
											<div className="flex">
												{selectedAirline && (
													<span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground">
														{selectedAirline.code}
													</span>
												)}
												<Input
													placeholder="e.g. 832"
													className={selectedAirline ? "rounded-l-none" : ""}
													{...field}
												/>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="manifestDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Manifest Date *</FormLabel>
										<FormControl>
											<Input type="date" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					{/* Cargo Details */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Cargo Summary</CardTitle>
							<CardDescription>Total pieces and weight for this manifest</CardDescription>
						</CardHeader>
						<CardContent className="grid gap-4 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="pieces"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Total Pieces *</FormLabel>
										<FormControl>
											<Input type="number" min="1" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="weight"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Total Weight (kg) *</FormLabel>
										<FormControl>
											<Input type="number" step="0.1" min="0.1" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					{/* Barcode Scanning */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Scanned Barcodes</CardTitle>
							<CardDescription>Add barcodes to include in this manifest (optional)</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex gap-2">
								<Input
									placeholder="Enter or scan barcode"
									value={barcodeInput}
									onChange={(e) => setBarcodeInput(e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addBarcode())}
								/>
								<Button type="button" onClick={addBarcode} variant="secondary">
									<Plus className="h-4 w-4 mr-2" />
									Add
								</Button>
							</div>

							{scannedBarcodes.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{scannedBarcodes.map((barcode) => (
										<Badge key={barcode} variant="secondary" className="px-3 py-1">
											<span className="font-mono">{barcode}</span>
											<button
												type="button"
												onClick={() => removeBarcode(barcode)}
												className="ml-2 hover:text-destructive"
											>
												<X className="h-3 w-3" />
											</button>
										</Badge>
									))}
								</div>
							)}

							{scannedBarcodes.length === 0 && (
								<p className="text-sm text-muted-foreground">
									No barcodes added yet. You can add barcodes to link packages to this manifest.
								</p>
							)}
						</CardContent>
					</Card>

					{/* Submit */}
					<div className="flex justify-end gap-4">
						<Button type="button" variant="outline" asChild>
							<Link href="/dashboard/aircargo">Cancel</Link>
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							<Plane className="mr-2 h-4 w-4" />
							Create Manifest
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
