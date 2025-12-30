"use client";

import { useCallback, useEffect, useState } from "react";

import AtomIcon from "@/components/icons/atom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Barcode, CheckCircle2, AlertCircle, Play, Pause, RotateCcw, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ScanLog {
  time: string;
  barcode: string;
  status: "success" | "error";
  msg: string;
}

export default function ScanSessionPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCount, setScannedCount] = useState(12);
  const [manualInputOpen, setManualInputOpen] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const totalCount = 45;
  const progress = (scannedCount / totalCount) * 100;

  const [logs, setLogs] = useState<ScanLog[]>([
    { time: "08:24:11", barcode: "TAC-992-X1", status: "success", msg: "Verified: Item loaded to EK503" },
    { time: "08:23:45", barcode: "TAC-881-A2", status: "success", msg: "Verified: Item loaded to EK503" },
    { time: "08:22:12", barcode: "TAC-112-Q9", status: "error", msg: "Mismatch: Item belongs to QR782" },
    { time: "08:21:55", barcode: "TAC-456-L0", status: "success", msg: "Verified: Item loaded to EK503" },
    { time: "08:20:10", barcode: "TAC-101-M3", status: "success", msg: "Verified: Item loaded to EK503" },
  ]);

  const addLog = useCallback((barcode: string, status: "success" | "error", msg: string) => {
    const newLog: ScanLog = {
      time: new Date().toLocaleTimeString("en-GB"),
      barcode,
      status,
      msg,
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
    if (status === "success") {
      setScannedCount(prev => Math.min(prev + 1, totalCount));
    }
  }, [totalCount]);

  // Simulate scanning when active
  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(() => {
      if (scannedCount >= totalCount) {
        setIsScanning(false);
        toast.success("Manifest completely scanned!");
        return;
      }

      // 80% success rate for simulation
      const isError = Math.random() < 0.2;
      const mockBarcode = `TAC-${Math.floor(Math.random() * 900) + 100}-${Math.random().toString(36).substring(7).toUpperCase()}`;

      if (isError) {
        addLog(mockBarcode, "error", "Mismatch: Package routing error");
      } else {
        addLog(mockBarcode, "success", "Verified: Item loaded to EK503");
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isScanning, scannedCount, totalCount, addLog]);

  const handleManualSubmit = () => {
    if (!manualBarcode) return;
    addLog(manualBarcode, "success", "Manual Entry: Verified & Loaded");
    setManualBarcode("");
    setManualInputOpen(false);
    toast.success(`Barcode ${manualBarcode} recorded`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manifest Scan Session</h2>
          <p className="text-muted-foreground">
            Real-time manifest verification and package loading session.
          </p>
        </div>
      </div>
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
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 rounded-none border-white/10"
                  onClick={() => {
                    setScannedCount(0);
                    setLogs([]);
                    setIsScanning(false);
                  }}
                >
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
                  <p className="text-2xl font-mono text-success">{logs.filter(l => l.status === "success").length}</p>
                </div>
                <div className="bg-white/[0.03] p-4 border border-white/5 space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Exceptions</p>
                  <p className="text-2xl font-mono text-destructive">{logs.filter(l => l.status === "error").length}</p>
                </div>
                <div className="bg-white/[0.03] p-4 border border-white/5 space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Status</p>
                  <p className={`text-2xl font-mono ${isScanning ? "text-primary animate-pulse" : "text-muted-foreground"}`}>
                    {isScanning ? "ACTIVE" : "PAUSED"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manual Input / Last Scan */}
          <Card className="bg-primary/5 border-primary/20 rounded-none overflow-hidden relative group">
            <div className="absolute inset-y-0 left-0 w-1 bg-primary" />
            <CardContent className="p-6 flex items-center gap-6">
              <div className="bg-primary/10 p-3 rounded-full">
                {isScanning ? <Loader2 className="h-8 w-8 text-primary animate-spin" /> : <Barcode className="h-8 w-8 text-primary" />}
              </div>
              <div className="flex-1">
                <p className="text-xs text-primary/70 font-bold uppercase tracking-widest mb-1">
                  {isScanning ? "Scanner active" : "Scanner standby"}
                </p>
                <p className="text-lg font-medium text-foreground/90">
                  {isScanning ? "Keep manifest within barcode reader range" : "Point scanner at package barcode or enter manually"}
                </p>
              </div>
              <Button
                variant="outline"
                className="rounded-none border-primary/20 hover:bg-primary/10"
                onClick={() => setManualInputOpen(true)}
              >
                Manual Input
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Real-time Logs */}
        <Card className="bg-background/40 backdrop-blur-md border-white/10 rounded-none flex flex-col h-[calc(100vh-280px)]">
          <CardHeader className="border-b border-white/5 shrink-0">
            <CardTitle className="text-lg flex items-center gap-2">
              Live Scan Feed
              {isScanning && <div className="size-2 rounded-full bg-success animate-pulse" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="divide-y divide-white/5 p-4 space-y-4">
                {logs.length > 0 ? logs.map((log, i) => (
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
                )) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground italic text-sm">
                    No scans recorded in this session.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Dialog open={manualInputOpen} onOpenChange={setManualInputOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manual Barcode Entry</DialogTitle>
            <DialogDescription>
              Enter the package barcode identifier manually to record it in this session.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode / AWB</Label>
              <Input
                id="barcode"
                placeholder="e.g. TAC-101-ABCD"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManualInputOpen(false)}>Cancel</Button>
            <Button onClick={handleManualSubmit} disabled={!manualBarcode}>Record Scan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
