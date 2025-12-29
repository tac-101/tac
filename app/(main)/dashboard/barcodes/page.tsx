"use client";

import { useState } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import BracketsIcon from "@/components/icons/brackets";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar, User, Package, History, ArrowRight } from "lucide-react";

export default function BarcodeTrackingPage() {
    const [trackingId, setTrackingId] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any>(null);

    const handleSearch = () => {
        if (!trackingId) return;
        setLoading(true);
        // Mock search delay
        setTimeout(() => {
            setResults({
                id: trackingId,
                status: "In Transit",
                origin: "Bangalore Hub (BLR)",
                destination: "Dubai (DXB)",
                currentLocation: "Mumbai Gateway (BOM)",
                history: [
                    { status: "Arrived at Hub", location: "BOM", time: "2025-12-29 04:12" },
                    { status: "Manifested", location: "BLR", time: "2025-12-28 22:45" },
                    { status: "Picked Up", location: "Warehouse A", time: "2025-12-28 18:30" },
                ]
            });
            setLoading(false);
        }, 1000);
    };

    const handleReset = () => {
        setTrackingId("");
        setResults(null);
    };

    return (
        <DashboardPageLayout
            header={{
                title: "Barcode Tracking",
                description: "Lookup and trace individual barcode lifecycle and chain of custody",
                icon: BracketsIcon,
            }}
        >
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Search Hero Section */}
                <Card className="bg-primary/5 border-primary/20 rounded-none overflow-hidden shadow-[0_0_40px_rgba(var(--primary),0.1)]">
                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-2 text-center">
                            <h3 className="text-2xl font-bold">Fast Tracking</h3>
                            <p className="text-muted-foreground">Enter a package barcode to view its journey</p>
                        </div>

                        <div className="flex gap-2 p-1 bg-background/50 border border-white/5 backdrop-blur-md">
                            <Input
                                placeholder="e.g. TAC-12345678"
                                className="h-12 border-none rounded-none text-lg font-mono focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/30"
                                value={trackingId}
                                onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                            <div className="flex gap-2">
                                {results && (
                                    <Button variant="outline" size="lg" className="h-12 px-6 rounded-none" onClick={handleReset}>
                                        <History className="mr-2 h-4 w-4" /> Reset
                                    </Button>
                                )}
                                <Button size="lg" className="h-12 px-8 rounded-none shadow-lg" onClick={handleSearch} disabled={loading}>
                                    {loading ? "Searching..." : (
                                        <><Search className="mr-2 h-5 w-5" /> Track Package</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Logic */}
                {results && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* summary */}
                        <div className="md:col-span-1 space-y-4">
                            <Card className="bg-background/40 backdrop-blur-md border-white/10 rounded-none">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-muted-foreground uppercase tracking-widest">Tracking Status</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-3 rounded-full bg-primary animate-pulse" />
                                        <span className="text-xl font-bold">{results.status}</span>
                                    </div>
                                    <div className="space-y-3 pt-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Package className="size-4 text-muted-foreground" />
                                            <span className="font-mono">{results.id}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="size-4 text-muted-foreground" />
                                            <span>{results.currentLocation}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* History Timeline */}
                        <div className="md:col-span-2">
                            <Card className="bg-background/40 backdrop-blur-md border-white/10 rounded-none h-full">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <History className="size-5 text-primary" />
                                        Movement History
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-2.5 before:w-px before:bg-white/10">
                                        {results.history.map((item: any, i: number) => (
                                            <div key={i} className="relative pl-8 flex gap-4">
                                                <div className="absolute left-1 top-2 size-3 rounded-full border-2 border-primary bg-background translate-y-[-2px]" />
                                                <div className="flex-1 space-y-1">
                                                    <p className="text-sm font-bold">{item.status}</p>
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1"><MapPin className="size-3" /> {item.location}</span>
                                                        <span className="flex items-center gap-1"><Calendar className="size-3" /> {item.time}</span>
                                                    </div>
                                                </div>
                                                <ArrowRight className="size-4 text-white/5" />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </DashboardPageLayout>
    );
}
