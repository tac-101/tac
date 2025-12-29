"use client";

import { useState } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import ProcessorIcon from "@/components/icons/proccesor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Command, Filter, Ship, Truck, FileText, User, ChevronRight } from "lucide-react";

export default function GlobalSearchPage() {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);

    const searchCategories = [
        { name: "Shipments", icon: Truck, count: 1240, color: "text-blue-400" },
        { name: "Manifests", icon: Ship, count: 42, color: "text-primary" },
        { name: "Invoices", icon: FileText, count: 850, color: "text-success" },
        { name: "Customers", icon: User, count: 128, color: "text-warning" },
    ];

    return (
        <DashboardPageLayout
            header={{
                title: "Global Search",
                description: "Unified command-line search for all logistics assets and operations",
                icon: ProcessorIcon,
            }}
        >
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Search Interface */}
                <div className="space-y-4">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-none blur-xl opacity-25 group-focus-within:opacity-100 transition duration-1000" />
                        <div className="relative flex items-center bg-background/60 backdrop-blur-xl border border-white/10 p-2 shadow-2xl">
                            <Search className="ml-4 size-6 text-muted-foreground" />
                            <Input
                                placeholder="Search anything... (Shipment ID, AWB, Customer Name)"
                                className="flex-1 h-16 border-none text-xl bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/30 font-light"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <div className="flex items-center gap-2 mr-4">
                                <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-muted-foreground">
                                    <Command className="size-3" />
                                    <span>K</span>
                                </div>
                                <Button size="icon" className="size-12 rounded-none">
                                    <ChevronRight className="size-6" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center">
                        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">Recent: TAC-2024-001</Button>
                        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">Recent: EK503 Manifest</Button>
                        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">Recent: Tapan Logistics</Button>
                    </div>
                </div>

                {/* Quick Categories */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {searchCategories.map((cat) => (
                        <Card key={cat.name} className="bg-background/40 backdrop-blur-md border-white/10 hover:border-primary/50 transition-all cursor-pointer group rounded-none">
                            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                                <div className={`p-3 rounded-none bg-white/5 group-hover:bg-primary/10 transition-colors ${cat.color}`}>
                                    <cat.icon className="size-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">{cat.name}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{cat.count} indexed</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Search Tips */}
                <div className="bg-white/[0.02] border border-white/5 p-6 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary/80">Search Tips</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex gap-3">
                            <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                            <p className="text-xs text-muted-foreground">Use <span className="text-foreground font-mono">type:shipment</span> to filter results only to shipments.</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                            <p className="text-xs text-muted-foreground">Search by <span className="text-foreground font-mono">origin:BLR</span> to find assets from specific hubs.</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                            <p className="text-xs text-muted-foreground">Paste an AWB number directly to jump to the tracking details.</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                            <p className="text-xs text-muted-foreground">Enter a customer name to view their full ledger and pending invoices.</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardPageLayout>
    );
}
