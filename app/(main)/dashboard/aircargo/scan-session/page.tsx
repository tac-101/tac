"use client";

import { useState } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Barcode, CheckCircle2, AlertCircle, Play, Pause, RotateCcw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ScanSessionPage() {
    const [isScanning, setIsScanning] = useState(false);
    const [scannedCount, setScannedCount] = useState(12);
    const totalCount = 45;
    const progress = (scannedCount / totalCount) * 100;

    const [logs, setLogs] = useState([
        { time: "08:24:11", barcode: "TAC-992-X1", status: "success", msg: "Verified: Item loaded to EK503" },
        { time: "08:23:45", barcode: "TAC-881-A2", status: "success", msg: "Verified: Item loaded to EK503" },
        { time: "08:22:12", barcode: "TAC-112-Q9", status: "error", msg: "Mismatch: Item belongs to QR782" },
        { time: "08:21:55", barcode: "TAC-456-L0", status: "success", msg: "Verified: Item loaded to EK503" },
    ]);

    return (
        <DashboardPageLayout
            header={{
                title: "Manifest Scan Session",
                description: "Real-time manifest verification and package loading session",
                icon: AtomIcon,
            }}
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Session Controls & Stats */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-background/40 backdrop-blur-md border-white/10 rounded-none">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl">Active Session: EK503 - DXB</CardTitle>
                                <CardDescription>Operator: Tapan Go Ops | Station: HUB-A1</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={isScanning ? "destructive" : "default"}
                                    className="rounded-none h-11 px-6 shadow-[0_0_20px_rgba(var(--primary),0.2)]"
                                    onClick={() => setIsScanning(!isScanning)}
                                >
                                    {isScanning ? (
                                        <><Pause className="mr-2 h-4 w-4" /> Pause Session</>
                                    ) : (
                                        <><Play className="mr-2 h-4 w-4" /> Start Scanning</>
                                    )}
                                </Button>
                                <Button variant="outline" size="icon" className="h-11 w-11 rounded-none border-white/10">
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-muted-foreground">Load Progress</span>
                                    <span className="text-primary">{scannedCount} / {totalCount} Packages</span>
                                </div>
                                <Progress value={progress} className="h-3 bg-white/5" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white/[0.03] p-4 border border-white/5 space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Successful</p>
                                    <p className="text-2xl font-mono text-success">{scannedCount - 1}</p>
                                </div>
                                <div className="bg-white/[0.03] p-4 border border-white/5 space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Exceptions</p>
                                    <p className="text-2xl font-mono text-destructive">1</p>
                                </div>
                                <div className="bg-white/[0.03] p-4 border border-white/5 space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Time Elapsed</p>
                                    <p className="text-2xl font-mono text-blue-400">00:42:15</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Manual Input / Last Scan */}
                    <Card className="bg-primary/5 border-primary/20 rounded-none overflow-hidden relative group">
                        <div className="absolute inset-y-0 left-0 w-1 bg-primary" />
                        <CardContent className="p-6 flex items-center gap-6">
                            <div className="bg-primary/10 p-3 rounded-full">
                                <Barcode className="h-8 w-8 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-primary/70 font-bold uppercase tracking-widest mb-1">Ready to scan</p>
                                <p className="text-lg font-medium text-foreground/90">Point scanner at package barcode or enter manually</p>
                            </div>
                            <Button variant="outline" className="rounded-none border-primary/20 hover:bg-primary/10">Manual Input</Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Real-time Logs */}
                <Card className="bg-background/40 backdrop-blur-md border-white/10 rounded-none flex flex-col h-[calc(100vh-280px)]">
                    <CardHeader className="border-b border-white/5 shrink-0">
                        <CardTitle className="text-lg flex items-center gap-2">
                            Live Scan Feed
                            <div className="size-2 rounded-full bg-success animate-pulse" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden">
                        <ScrollArea className="h-full">
                            <div className="divide-y divide-white/5 p-4 space-y-4">
                                {logs.map((log, i) => (
                                    <div key={i} className="pt-4 first:pt-0 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <span className="font-mono text-[10px] text-muted-foreground">{log.time}</span>
                                            {log.status === "success" ? (
                                                <CheckCircle2 className="h-4 w-4 text-success" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4 text-destructive" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-mono text-sm text-foreground">{log.barcode}</p>
                                            <p className={`text-xs ${log.status === "error" ? "text-destructive" : "text-muted-foreground"}`}>
                                                {log.msg}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </DashboardPageLayout>
    );
}
