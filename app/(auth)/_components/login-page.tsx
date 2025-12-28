"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import {
	ChevronLeft,
	Clock,
	Eye,
	EyeOff,
	Loader2,
	Lock,
	LogIn,
	Mail,
	MessageSquare,
	Shield,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { signInAction } from "@/lib/actions/auth-actions";
import { cn } from "@/lib/utils";

const signInSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
	rememberMe: z.boolean().default(false),
});

type SignInValues = z.infer<typeof signInSchema>;

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.1, delayChildren: 0.2 },
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 10 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.4, ease: "easeOut" },
	},
};

export function LoginPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [animationData, setAnimationData] = useState<any>(null);

	// Load Lottie animation from public assets
	useEffect(() => {
		let cancelled = false;
		fetch("/assets/login.json")
			.then((r) => r.json())
			.then((data) => {
				if (!cancelled) setAnimationData(data);
			})
			.catch(() => {
				// ignore background animation errors
			});
		return () => {
			cancelled = true;
		};
	}, []);

	const form = useForm<SignInValues>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			email: "admin@tapango.logistics",
			password: "Test@1498",
			rememberMe: true,
		},
	});

	const onSubmit = async (data: SignInValues) => {
		setIsLoading(true);
		try {
			const result = await signInAction({
				email: data.email,
				password: data.password,
			});

			if (result.success) {
				toast.success("Signed in successfully");
				router.refresh();
				router.push("/dashboard");
			} else {
				toast.error(result.error || "Failed to sign in");
			}
		} catch (_error) {
			toast.error("An unexpected error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	const isFormValid =
		form.watch("email")?.trim().length > 2 &&
		form.watch("password")?.length >= 1;

	return (
		<div className="relative min-h-screen w-full overflow-hidden bg-background font-sans text-foreground selection:bg-accent-warm/20 selection:text-accent-warm-foreground">
			{/* Ambient Background Mesh */}
			<div className="absolute inset-0 z-0">
				<div className="absolute -left-[10%] -top-[10%] h-[50vh] w-[50vh] rounded-full bg-primary/5 blur-[120px]" />
				<div className="absolute -right-[10%] top-[20%] h-[40vh] w-[40vh] rounded-full bg-accent-warm/5 blur-[100px]" />
				<div className="absolute bottom-[10%] left-[20%] h-[30vh] w-[30vh] rounded-full bg-blue-500/5 blur-[80px]" />

				{/* Subtle Grid Pattern */}
				<div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
			</div>

			{/* Back Button */}
			<motion.div
				className="absolute left-6 top-6 z-20"
				initial={{ opacity: 0, x: -20 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.5 }}
			>
				<Link href="/">
					<Button
						variant="ghost"
						size="sm"
						className="group gap-1 text-muted-foreground hover:bg-background/50 hover:text-foreground"
					>
						<ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
						Back to Website
					</Button>
				</Link>
			</motion.div>

			{/* Theme Toggle */}
			<motion.div
				className="absolute right-6 top-6 z-20"
				initial={{ opacity: 0, x: 20 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.5 }}
			>
				<ThemeToggle />
			</motion.div>

			{/* Main Content */}
			<main className="relative z-10 flex min-h-screen items-center justify-center p-4 md:p-8">
				<motion.div
					className="w-full max-w-4xl"
					initial="hidden"
					animate="visible"
					variants={containerVariants}
				>
					<Card className="overflow-hidden border-border/40 bg-card/40 shadow-2xl backdrop-blur-3xl ring-1 ring-white/5">
						<div className="flex flex-col md:flex-row">

							{/* Left: Animation Panel (Visual Anchor) */}
							<motion.div
								className="relative flex min-h-[250px] w-full flex-col bg-muted/30 p-6 md:w-5/12 md:min-h-[500px] md:p-10 lg:w-1/2"
								variants={itemVariants}
							>
								{/* Content overlay */}
								<div className="relative z-10 flex h-full flex-col justify-between">
									<div className="space-y-2">
										<div className="flex items-center gap-2.5">
											<div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20">
												<MessageSquare className="h-5 w-5" />
											</div>
											<span className="font-semibold tracking-tight text-foreground/90">
												TAC Logistics
											</span>
										</div>
									</div>

									<div className="my-auto flex flex-1 items-center justify-center py-8">
										{animationData ? (
											<div className="relative h-48 w-full max-w-[280px] md:h-64">
												<Lottie
													animationData={animationData}
													loop
													autoplay
													className="h-full w-full"
													rendererSettings={{
														preserveAspectRatio: "xMidYMid meet",
													}}
												/>
												{/* Glow behind animation */}
												<div className="absolute inset-0 -z-10 bg-gradient-to-tr from-accent-warm/20 to-transparent blur-3xl opacity-50" />
											</div>
										) : (
											<div className="flex h-48 w-48 items-center justify-center rounded-full bg-accent/5">
												<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
											</div>
										)}
									</div>

									<div className="space-y-4">
										<div className="space-y-2">
											<h3 className="text-lg font-medium leading-none text-foreground/90">
												Command Center
											</h3>
											<p className="text-sm text-muted-foreground/80">
												Real-time logistics monitoring and fleet management terminal.
											</p>
										</div>
										<div className="flex items-center gap-4 text-[10px] text-muted-foreground/60">
											<div className="flex items-center gap-1.5">
												<Shield className="h-3 w-3" />
												<span>Encrypted</span>
											</div>
											<div className="h-3 w-px bg-border/50" />
											<div className="flex items-center gap-1.5">
												<Clock className="h-3 w-3" />
												<span>24/7 Access</span>
											</div>
										</div>
									</div>
								</div>

								{/* Background decoration */}
								<div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/5 to-background/20" />
							</motion.div>

							{/* Right: Form Panel */}
							<div className="flex w-full flex-col justify-center bg-card/60 p-6 md:w-7/12 md:p-12 lg:w-1/2">
								<motion.div variants={itemVariants} className="mb-2">
									<h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
										Welcome back
									</h1>
									<p className="mt-2 text-sm text-muted-foreground">
										Please enter your credentials to access your account.
									</p>
								</motion.div>

								<motion.div variants={itemVariants} className="mt-8">
									<Form {...form}>
										<form
											onSubmit={form.handleSubmit(onSubmit)}
											className="space-y-5"
										>
											<FormField
												control={form.control}
												name="email"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
															Email Address
														</FormLabel>
														<FormControl>
															<div className="group relative">
																<Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-hover:text-foreground group-focus-within:text-primary" />
																<Input
																	placeholder="name@company.com"
																	className="h-11 border-border/40 bg-secondary/20 pl-10 transition-all hover:bg-secondary/40 focus:border-primary/50 focus:bg-background focus:ring-4 focus:ring-primary/10"
																	autoComplete="email"
																	disabled={isLoading}
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
												name="password"
												render={({ field }) => (
													<FormItem>
														<div className="flex items-center justify-between">
															<FormLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
																Password
															</FormLabel>
															<Link
																href="/forgot-password"
																className="text-xs font-medium text-primary hover:text-primary/80 hover:underline"
															>
																Forgot password?
															</Link>
														</div>
														<FormControl>
															<div className="group relative">
																<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-hover:text-foreground group-focus-within:text-primary" />
																<Input
																	type={showPassword ? "text" : "password"}
																	placeholder="••••••••"
																	className="h-11 border-border/40 bg-secondary/20 pl-10 pr-10 transition-all hover:bg-secondary/40 focus:border-primary/50 focus:bg-background focus:ring-4 focus:ring-primary/10"
																	autoComplete="current-password"
																	disabled={isLoading}
																	{...field}
																/>
																<Button
																	type="button"
																	variant="ghost"
																	size="icon"
																	className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 hover:bg-transparent"
																	onClick={() => setShowPassword(!showPassword)}
																>
																	{showPassword ? (
																		<EyeOff className="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground" />
																	) : (
																		<Eye className="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground" />
																	)}
																</Button>
															</div>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<div className="flex items-center space-x-2">
												<FormField
													control={form.control}
													name="rememberMe"
													render={({ field }) => (
														<FormItem className="flex flex-row items-center space-x-2 space-y-0">
															<FormControl>
																<Checkbox
																	checked={field.value}
																	onCheckedChange={field.onChange}
																	className="border-border/50 bg-secondary/20 data-[state=checked]:bg-accent-warm data-[state=checked]:border-accent-warm"
																/>
															</FormControl>
															<FormLabel className="text-sm font-normal text-muted-foreground hover:cursor-pointer hover:text-foreground transition-colors">
																Remember me for 30 days
															</FormLabel>
														</FormItem>
													)}
												/>
											</div>

											<div className="pt-2">
												<Button
													type="submit"
													disabled={isLoading || !isFormValid}
													className="btn-gradient-warm w-full rounded-xl py-6 text-sm font-semibold shadow-lg shadow-accent-warm/20 transition-all hover:scale-[1.01] hover:shadow-accent-warm/30 active:scale-[0.99]"
												>
													{isLoading ? (
														<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													) : (
														<LogIn className="mr-2 h-4 w-4" />
													)}
													Sign In
												</Button>
											</div>
										</form>
									</Form>

									<div className="relative my-8">
										<div className="absolute inset-0 flex items-center">
											<Separator className="w-full bg-border/40" />
										</div>
										<div className="relative flex justify-center text-xs uppercase">
											<span className="bg-card px-2 text-muted-foreground/60">
												Or continue with
											</span>
										</div>
									</div>

									<p className="text-center text-sm text-muted-foreground">
										Don&apos;t have an account?{" "}
										<Link
											href="/register"
											className="font-medium text-foreground underline decoration-border/50 underline-offset-4 hover:decoration-primary hover:text-primary transition-all"
										>
											Request Access
										</Link>
									</p>
								</motion.div>
							</div>
						</div>
					</Card>

					{/* Footer Copyright */}
					<motion.div
						variants={itemVariants}
						className="mt-8 text-center text-xs text-muted-foreground/40"
					>
						&copy; {new Date().getFullYear()} TAC Logistics. All rights reserved. V2.0
					</motion.div>
				</motion.div>
			</main>
		</div>
	);
}
