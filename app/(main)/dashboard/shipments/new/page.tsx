"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabaseClient";

const TRANSPORT_MODES = [
	{ value: "air", label: "Air Cargo" },
	{ value: "road", label: "Road Transport" },
	{ value: "rail", label: "Rail Freight" },
	{ value: "sea", label: "Sea Freight" },
] as const;

const SERVICE_ROUTES = [
	{ origin: "Imphal, MN", destination: "New Delhi, DL", label: "Imphal → New Delhi" },
	{ origin: "New Delhi, DL", destination: "Imphal, MN", label: "New Delhi → Imphal" },
	{ origin: "Imphal, MN", destination: "Guwahati, AS", label: "Imphal → Guwahati" },
	{ origin: "Guwahati, AS", destination: "Imphal, MN", label: "Guwahati → Imphal" },
] as const;

const shipmentSchema = z.object({
	senderName: z.string().min(2, "Sender name is required"),
	senderPhone: z.string().min(10, "Valid phone number required"),
	senderAddress: z.string().optional(),
	receiverName: z.string().min(2, "Receiver name is required"),
	receiverPhone: z.string().min(10, "Valid phone number required"),
	receiverAddress: z.string().optional(),
	origin: z.string().min(1, "Origin is required"),
	destination: z.string().min(1, "Destination is required"),
	transportMode: z.string().min(1, "Transport mode is required"),
	weight: z.number().min(0.1, "Weight must be greater than 0"),
	pieces: z.number().min(1, "At least 1 piece required"),
	description: z.string().optional(),
	customerId: z.string().optional(),
});

type ShipmentFormValues = z.infer<typeof shipmentSchema>;

function generateShipmentRef(): string {
	const prefix = "TAC";
	const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
	const random = Math.random().toString(36).substring(2, 6).toUpperCase();
	return `${prefix}-${date}-${random}`;
}

function calculateETA(origin: string, destination: string, mode: string): string {
	const baseDays: Record<string, number> = {
		air: 1,
		road: 3,
		rail: 2,
		sea: 7,
	};
	const days = baseDays[mode] || 2;
	const eta = new Date();
	eta.setDate(eta.getDate() + days);
	return eta.toISOString().split("T")[0];
}

export default function NewShipmentPage() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
	const [generatedRef, setGeneratedRef] = useState(generateShipmentRef());

	const form = useForm<ShipmentFormValues>({
		resolver: zodResolver(shipmentSchema),
		defaultValues: {
			senderName: "",
			senderPhone: "",
			senderAddress: "",
			receiverName: "",
			receiverPhone: "",
			receiverAddress: "",
			origin: "",
			destination: "",
			transportMode: "air",
			weight: 1,
			pieces: 1,
			description: "",
			customerId: "",
		},
	});

	useEffect(() => {
		async function loadCustomers() {
			try {
				const { data } = await supabase
					.from("customers")
					.select("id, name")
					.order("name");
				setCustomers(data || []);
			} catch (err) {
				console.error("Failed to load customers:", err);
			}
		}
		loadCustomers();
	}, []);

	const onSubmit = async (values: ShipmentFormValues) => {
		setIsSubmitting(true);
		try {
			const route = SERVICE_ROUTES.find(
				(r) => r.origin === values.origin && r.destination === values.destination
			);

			const eta = calculateETA(values.origin, values.destination, values.transportMode);

			const { data, error } = await supabase
				.from("shipments")
				.insert([
					{
						shipment_ref: generatedRef,
						origin: values.origin,
						destination: values.destination,
						weight: values.weight,
						status: "pending",
						progress: 0,
						customer_id: values.customerId || null,
						transport_mode: values.transportMode,
						sender_name: values.senderName,
						sender_phone: values.senderPhone,
						sender_address: values.senderAddress || null,
						receiver_name: values.receiverName,
						receiver_phone: values.receiverPhone,
						receiver_address: values.receiverAddress || null,
						pieces: values.pieces,
						description: values.description || null,
						eta: eta,
					},
				])
				.select("id, shipment_ref, eta")
				.single();

			if (error) throw error;

			toast.success("Shipment Created", {
				description: `Reference: ${data.shipment_ref} | ETA: ${data.eta}`,
			});

			router.push("/dashboard/shipments");
		} catch (err: any) {
			console.error("Shipment creation error:", err);
			toast.error("Failed to create shipment", {
				description: err?.message || "Please try again",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const selectedOrigin = form.watch("origin");
	const selectedDestination = form.watch("destination");
	const selectedMode = form.watch("transportMode");

	const estimatedETA = selectedOrigin && selectedDestination && selectedMode
		? calculateETA(selectedOrigin, selectedDestination, selectedMode)
		: null;

	return (
		<div className="container max-w-4xl py-6 space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" asChild>
					<Link href="/dashboard/shipments">
						<ArrowLeft className="h-5 w-5" />
					</Link>
				</Button>
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Create New Shipment</h1>
					<p className="text-muted-foreground">
						Reference: <span className="font-mono font-semibold">{generatedRef}</span>
					</p>
				</div>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					{/* Sender Information */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Sender Information</CardTitle>
							<CardDescription>Details of the person sending the shipment</CardDescription>
						</CardHeader>
						<CardContent className="grid gap-4 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="senderName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Sender Name *</FormLabel>
										<FormControl>
											<Input placeholder="Enter sender name" data-testid="shipment-sender-name" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="senderPhone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Sender Phone *</FormLabel>
										<FormControl>
											<Input placeholder="Enter phone number" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="senderAddress"
								render={({ field }) => (
									<FormItem className="sm:col-span-2">
										<FormLabel>Sender Address</FormLabel>
										<FormControl>
											<Textarea placeholder="Enter full address" rows={2} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					{/* Receiver Information */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Receiver Information</CardTitle>
							<CardDescription>Details of the person receiving the shipment</CardDescription>
						</CardHeader>
						<CardContent className="grid gap-4 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="receiverName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Receiver Name *</FormLabel>
										<FormControl>
											<Input placeholder="Enter receiver name" data-testid="shipment-receiver-name" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="receiverPhone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Receiver Phone *</FormLabel>
										<FormControl>
											<Input placeholder="Enter phone number" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="receiverAddress"
								render={({ field }) => (
									<FormItem className="sm:col-span-2">
										<FormLabel>Receiver Address</FormLabel>
										<FormControl>
											<Textarea placeholder="Enter full address" rows={2} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					{/* Shipment Details */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Shipment Details</CardTitle>
							<CardDescription>Route and cargo information</CardDescription>
						</CardHeader>
						<CardContent className="grid gap-4 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="origin"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Origin *</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select origin" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{[...new Set(SERVICE_ROUTES.map((r) => r.origin))].map((origin) => (
													<SelectItem key={origin} value={origin}>
														{origin}
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
												{[...new Set(SERVICE_ROUTES.map((r) => r.destination))].map((dest) => (
													<SelectItem key={dest} value={dest}>
														{dest}
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
								name="transportMode"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Transport Mode *</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select mode" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{TRANSPORT_MODES.map((mode) => (
													<SelectItem key={mode.value} value={mode.value}>
														{mode.label}
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
								name="customerId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Customer (Optional)</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select customer" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="">No customer</SelectItem>
												{customers.map((customer) => (
													<SelectItem key={customer.id} value={customer.id}>
														{customer.name}
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
								name="weight"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Weight (kg) *</FormLabel>
										<FormControl>
											<Input type="number" step="0.1" min="0.1" data-testid="shipment-weight" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="pieces"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Number of Pieces *</FormLabel>
										<FormControl>
											<Input type="number" min="1" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem className="sm:col-span-2">
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea placeholder="Describe the cargo contents" rows={2} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					{/* ETA Preview */}
					{estimatedETA && (
						<Card className="bg-muted/50">
							<CardContent className="pt-6">
								<div className="flex items-center gap-3">
									<Package className="h-8 w-8 text-primary" />
									<div>
										<p className="text-sm text-muted-foreground">Estimated Time of Arrival</p>
										<p className="text-xl font-semibold">{estimatedETA}</p>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Submit */}
					<div className="flex justify-end gap-4">
						<Button type="button" variant="outline" asChild>
							<Link href="/dashboard/shipments">Cancel</Link>
						</Button>
						<Button type="submit" disabled={isSubmitting} data-testid="shipment-submit-button">
							{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Create Shipment
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
