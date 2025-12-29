"use client";

import { useEffect, useState } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import AtomIcon from "@/components/icons/atom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Ship, Plane, Box, Search, Plus, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AircargoPage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const mockManifests = [
        { id: "MNF-001", flight: "EK503", destination: "DXB", status: "In Transit", items: 45, weight: "1,240 kg" },
        { id: "MNF-002", flight: "QR782", destination: "DOH", status: "Departed", items: 32, weight: "890 kg" },
        { id: "MNF-003", flight: "TK124", destination: "IST", status: "Pending", items: 110, weight: "3,100 kg" },
        { id: "MNF-004", flight: "SV831", destination: "RUH", status: "Arrived", items: 15, weight: "420 kg" },
    ];

    return (
        <DashboardPageLayout
            header={{
                title: "Aircargo Manifesto",
                description: "Manage and track air freight flight manifests and cargo loads",
                icon: AtomIcon,
            }}
        >
            <div className="flex flex-col gap-6">
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-background/40 backdrop-blur-md border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Active Flights</CardTitle>
                            <Plane className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">12</div>
                            <p className="text-xs text-muted-foreground">+2 from last hour</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-background/40 backdrop-blur-md border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Pending Manifests</CardTitle>
                            <Box className="h-4 w-4 text-warning" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">8</div>
                            <p className="text-xs text-muted-foreground">Requires attention</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-background/40 backdrop-blur-md border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Tonnage</CardTitle>
                            <Ship className="h-4 w-4 text-success" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">42.5t</div>
                            <p className="text-xs text-muted-foreground">Across all routes</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-background/40 backdrop-blur-md border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
                            <AtomIcon className="h-4 w-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">98.2%</div>
                            <p className="text-xs text-muted-foreground">Load optimization</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Table Controls */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-background/20 p-4 rounded-none border border-white/5 backdrop-blur-sm">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search flight or manifest ID..."
                            className="pl-10 h-9 bg-background/40 border-white/10 rounded-none focus-visible:ring-1 focus-visible:ring-primary/50"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <Button variant="outline" size="sm" className="rounded-none border-white/10 hover:bg-white/5">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                        </Button>
                        <Button size="sm" className="rounded-none">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Manifest
                        </Button>
                    </div>
                </div>

                {/* Main Content Table */}
                <Card className="rounded-none border-white/10 bg-background/40 backdrop-blur-md overflow-hidden">
                    <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                        <CardTitle className="text-lg">Recent Manifests</CardTitle>
                        <CardDescription>Live tracking of air freight movements</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-white/[0.03]">
                                <TableRow className="hover:bg-transparent border-white/5">
                                    <TableHead className="font-semibold text-xs uppercase tracking-wider">Manifest ID</TableHead>
                                    <TableHead className="font-semibold text-xs uppercase tracking-wider">Flight No</TableHead>
                                    <TableHead className="font-semibold text-xs uppercase tracking-wider">Destination</TableHead>
                                    <TableHead className="font-semibold text-xs uppercase tracking-wider">Status</TableHead>
                                    <TableHead className="font-semibold text-xs uppercase tracking-wider">Items</TableHead>
                                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-right">Weight</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i} className="border-white/5">
                                            {Array.from({ length: 6 }).map((_, j) => (
                                                <TableCell key={j}>
                                                    <div className="h-4 bg-white/5 animate-pulse rounded-full w-full" />
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    mockManifests.map((m) => (
                                        <TableRow key={m.id} className="border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer group">
                                            <TableCell className="font-mono text-xs text-primary group-hover:underline underline-offset-4">{m.id}</TableCell>
                                            <TableCell className="font-medium">{m.flight}</TableCell>
                                            <TableCell>{m.destination}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "rounded-none text-[10px] font-bold uppercase",
                                                        m.status === "In Transit" && "border-blue-500/50 text-blue-400 bg-blue-500/5",
                                                        m.status === "Departed" && "border-success/50 text-success bg-success/5",
                                                        m.status === "Pending" && "border-warning/50 text-warning bg-warning/5",
                                                        m.status === "Arrived" && "border-white/20 text-muted-foreground bg-white/5"
                                                    )}
                                                >
                                                    {m.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{m.items} pkgs</TableCell>
                                            <TableCell className="text-right font-mono text-xs">{m.weight}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardPageLayout>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}
