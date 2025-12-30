"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Calculator, FileText, Loader2 } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabaseClient";

const GST_RATES = [
	{ value: "0", label: "0% (Exempt)" },
	{ value: "5", label: "5% GST" },
	{ value: "12", label: "12% GST" },
	{ value: "18", label: "18% GST" },
	{ value: "28", label: "28% GST" },
] as const;

const invoiceSchema = z.object({
	customerId: z.string().min(1, "Customer is required"),
	shipmentId: z.string().optional(),
	freightAmount: z.number().min(0, "Freight amount must be positive"),
	handlingCharges: z.number().min(0),
	otherCharges: z.number().min(0),
	gstPercent: z.number().min(0).max(28),
	discount: z.number().min(0),
	dueDate: z.string().min(1, "Due date is required"),
	notes: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

function generateInvoiceRef(): string {
	const prefix = "INV";
	const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
	const random = Math.random().toString(36).substring(2, 6).toUpperCase();
	return `${prefix}-${date}-${random}`;
}

function getDefaultDueDate(): string {
	const date = new Date();
	date.setDate(date.getDate() + 30);
	return date.toISOString().split("T")[0];
}

export default function NewInvoicePage() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [customers, setCustomers] = useState<{ id: string; name: string; gst_number?: string }[]>([]);
	const [shipments, setShipments] = useState<{ id: string; shipment_ref: string }[]>([]);
	const [generatedRef, setGeneratedRef] = useState(generateInvoiceRef());

	const form = useForm<InvoiceFormValues>({
		resolver: zodResolver(invoiceSchema),
		defaultValues: {
			customerId: "",
			shipmentId: "",
			freightAmount: 0,
			handlingCharges: 0,
			otherCharges: 0,
			gstPercent: 18,
			discount: 0,
			dueDate: getDefaultDueDate(),
			notes: "",
		},
	});

	useEffect(() => {
		async function loadData() {
			try {
				const [customersRes, shipmentsRes] = await Promise.all([
					supabase.from("customers").select("id, name, gst_number").order("name"),
					supabase.from("shipments").select("id, shipment_ref").order("created_at", { ascending: false }).limit(50),
				]);
				
				setCustomers(customersRes.data || []);
				setShipments(shipmentsRes.data || []);
			} catch (err) {
				console.error("Failed to load data:", err);
			}
		}
		loadData();
	}, []);

	const watchedValues = form.watch();
	
	const subtotal = (watchedValues.freightAmount || 0) + 
		(watchedValues.handlingCharges || 0) + 
		(watchedValues.otherCharges || 0);
	
	const discountAmount = watchedValues.discount || 0;
	const taxableAmount = Math.max(0, subtotal - discountAmount);
	const gstAmount = (taxableAmount * (watchedValues.gstPercent || 0)) / 100;
	const totalAmount = taxableAmount + gstAmount;

	const onSubmit = async (values: InvoiceFormValues) => {
		setIsSubmitting(true);
		try {
			const { data, error } = await supabase
				.from("invoices")
				.insert([
					{
						invoice_ref: generatedRef,
						customer_id: values.customerId,
						shipment_id: values.shipmentId || null,
						freight_amount: values.freightAmount,
						handling_charges: values.handlingCharges,
						other_charges: values.otherCharges,
						subtotal: subtotal,
						discount: values.discount,
						taxable_amount: taxableAmount,
						gst_percent: values.gstPercent,
						gst_amount: gstAmount,
						amount: totalAmount,
						status: "pending",
						due_date: values.dueDate,
						notes: values.notes || null,
					},
				])
				.select("id, invoice_ref, amount")
				.single();

			if (error) throw error;

			toast.success("Invoice Created", {
				description: `Invoice ${data.invoice_ref} for ₹${data.amount.toLocaleString("en-IN")} created successfully`,
			});

			router.push("/dashboard/invoices");
		} catch (err: any) {
			console.error("Invoice creation error:", err);
			toast.error("Failed to create invoice", {
				description: err?.message || "Please try again",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const selectedCustomer = customers.find((c) => c.id === watchedValues.customerId);

	return (
		<div className="container max-w-4xl py-6 space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" asChild>
					<Link href="/dashboard/invoices">
						<ArrowLeft className="h-5 w-5" />
					</Link>
				</Button>
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Create New Invoice</h1>
					<p className="text-muted-foreground">
						Invoice #: <span className="font-mono font-semibold">{generatedRef}</span>
					</p>
				</div>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					{/* Customer & Shipment */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Customer & Shipment Details</CardTitle>
							<CardDescription>Link this invoice to a customer and optionally a shipment</CardDescription>
						</CardHeader>
						<CardContent className="grid gap-4 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="customerId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Customer *</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select customer" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
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
								name="shipmentId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Shipment Reference</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select shipment (optional)" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="">No shipment</SelectItem>
												{shipments.map((shipment) => (
													<SelectItem key={shipment.id} value={shipment.id}>
														{shipment.shipment_ref}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							{selectedCustomer?.gst_number && (
								<div className="sm:col-span-2 p-3 bg-muted/50 rounded-lg">
									<p className="text-sm text-muted-foreground">
										Customer GST: <span className="font-mono font-medium">{selectedCustomer.gst_number}</span>
									</p>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Charges */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Charges & Amounts</CardTitle>
							<CardDescription>Enter freight and additional charges</CardDescription>
						</CardHeader>
						<CardContent className="grid gap-4 sm:grid-cols-3">
							<FormField
								control={form.control}
								name="freightAmount"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Freight Amount (₹) *</FormLabel>
										<FormControl>
											<Input type="number" step="0.01" min="0" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="handlingCharges"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Handling Charges (₹)</FormLabel>
										<FormControl>
											<Input type="number" step="0.01" min="0" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="otherCharges"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Other Charges (₹)</FormLabel>
										<FormControl>
											<Input type="number" step="0.01" min="0" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="discount"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Discount (₹)</FormLabel>
										<FormControl>
											<Input type="number" step="0.01" min="0" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="gstPercent"
								render={({ field }) => (
									<FormItem>
										<FormLabel>GST Rate *</FormLabel>
										<Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select GST rate" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{GST_RATES.map((rate) => (
													<SelectItem key={rate.value} value={rate.value}>
														{rate.label}
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
								name="dueDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Due Date *</FormLabel>
										<FormControl>
											<Input type="date" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					{/* Summary */}
					<Card className="bg-muted/30">
						<CardHeader>
							<CardTitle className="text-lg flex items-center gap-2">
								<Calculator className="h-5 w-5" />
								Invoice Summary
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Subtotal</span>
									<span>₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
								</div>
								{discountAmount > 0 && (
									<div className="flex justify-between text-green-600">
										<span>Discount</span>
										<span>-₹{discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
									</div>
								)}
								<div className="flex justify-between">
									<span className="text-muted-foreground">Taxable Amount</span>
									<span>₹{taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">GST ({watchedValues.gstPercent}%)</span>
									<span>₹{gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
								</div>
								<Separator className="my-2" />
								<div className="flex justify-between text-lg font-bold">
									<span>Total Amount</span>
									<span>₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Notes */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Additional Notes</CardTitle>
						</CardHeader>
						<CardContent>
							<FormField
								control={form.control}
								name="notes"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Textarea 
												placeholder="Any additional notes or payment instructions..." 
												rows={3} 
												{...field} 
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					{/* Submit */}
					<div className="flex justify-end gap-4">
						<Button type="button" variant="outline" asChild>
							<Link href="/dashboard/invoices">Cancel</Link>
						</Button>
						<Button type="submit" disabled={isSubmitting} data-testid="invoice-submit-button">
							{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							<FileText className="mr-2 h-4 w-4" />
							Create Invoice
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
