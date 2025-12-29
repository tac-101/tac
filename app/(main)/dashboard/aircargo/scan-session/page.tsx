"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, 
  CheckCircle2, 
  History, 
  Pause, 
  Play, 
  Scan, 
  Terminal,
  AlertCircle,
  PackageCheck,
  ChevronRight,
  RefreshCw,
  Plus
} from "lucide-react";
import React, { useState, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ScanLog {
  id: string;
  time: string;
  code: string;
  pieces: number;
  status: "success" | "error" | "duplicate";
  msg: string;
}

export default function ScanSessionPage() {
  const [isScanning, setIsScanning] = useState(true);
  const [progress, setProgress] = useState(65);
  const [logs, setLogs] = useState<ScanLog[]>([
    { id: "1", time: "14:23:45", code: "TAC-AWB-99281", pieces: 2, status: "success", msg: "Validated & Logged" },
    { id: "2", time: "14:23:12", code: "TAC-AWB-99282", pieces: 1, status: "duplicate", msg: "Already processed" },
    { id: "3", time: "14:22:58", code: "ERR-99283", pieces: 0, status: "error", msg: "Invalid format" },
    { id: "4", time: "14:22:15", code: "TAC-AWB-99275", pieces: 4, status: "success", msg: "Validated & Logged" },
    { id: "5", time: "14:21:50", code: "TAC-AWB-99274", pieces: 1, status: "success", msg: "Validated & Logged" },
  ]);

  useEffect(() => {
    if (isScanning && progress < 100) {
      const timer = setTimeout(() => setProgress(p => p + 0.1), 3000);
      return () => clearTimeout(timer);
    }
  }, [isScanning, progress]);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              Manifest Scan Session
            </h2>
            <Badge variant="outline" className="animate-pulse bg-success/10 text-success border-success/20">
              Live
            </Badge>
          </div>
          <p className="text-muted-foreground flex items-center gap-2">
            Session: <span className="font-mono text-primary font-semibold">SS-2024-MAR-0024</span>
            <span className="text-xs opacity-50">•</span>
            Flight: <span className="font-semibold text-foreground">QR832</span>
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant={isScanning ? "outline" : "default"} 
            className={cn(
              "glass px-6",
              !isScanning && "btn-gradient-warm border-none"
            )}
            onClick={() => setIsScanning(!isScanning)}
          >
            {isScanning ? (
              <><Pause className="mr-2 h-4 w-4" /> Pause Session</>
            ) : (
              <><Play className="mr-2 h-4 w-4" /> Resume Session</>
            )}
          </Button>
          <Button variant="outline" className="glass">
            <PackageCheck className="mr-2 h-4 w-4" />
            Complete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass md:col-span-2 border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-white/5">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Scan className="h-5 w-5 text-primary" />
              Live Scanner Interface
            </CardTitle>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-muted-foreground">SCANNER STATUS:</span>
              <span className={cn(isScanning ? "text-success" : "text-yellow-500")}>
                {isScanning ? "INITIALIZED" : "STANDBY"}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-12 flex flex-col items-center justify-center space-y-8 relative overflow-hidden min-h-[400px]">
            {/* Scanner Visualizer */}
            <div className="relative group">
              <div className={cn(
                "w-64 h-64 border-2 border-white/10 rounded-3xl flex items-center justify-center relative transition-all duration-500",
                isScanning ? "border-primary/50 shadow-[0_0_50px_-12px_rgba(var(--primary-rgb),0.5)]" : "opacity-50"
              )}>
                <AnimatePresence>
                  {isScanning && (
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent h-1 w-full"
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </AnimatePresence>
                <Scan className={cn(
                  "h-24 w-24 transition-all duration-500",
                  isScanning ? "text-primary scale-110" : "text-muted-foreground"
                )} />
              </div>
              
              {/* Corner brackets */}
              <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-xl" />
              <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-xl" />
              <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-xl" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-xl" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">Waiting for input...</h3>
              <p className="text-sm text-muted-foreground w-64 mx-auto">
                Scan barcode or enter manual AWB into the terminal below.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button size="lg" className="btn-gradient-warm px-8 rounded-xl shadow-lg hover:scale-105 transition-all">
                <Plus className="mr-2 h-5 w-5" />
                Manual Input
              </Button>
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Connection
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass border-white/5 overflow-hidden">
            <CardHeader className="bg-white/5 py-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Current Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overall Manifest Completion</span>
                <span className="font-mono font-bold">{Math.floor(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-white/5" indicatorClassName="bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Processed</p>
                  <p className="text-xl font-bold">92 / 142</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Pieces (Total)</p>
                  <p className="text-xl font-bold">1,842</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/5 flex-1 flex flex-col h-[calc(100%-200px)]">
            <CardHeader className="bg-white/5 py-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Terminal className="h-4 w-4 text-primary" />
                Live Log Feed
              </CardTitle>
              <History className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" />
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <ScrollArea className="h-[280px] p-4">
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div key={log.id} className="text-xs font-mono group cursor-default">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-muted-foreground opacity-50">{log.time}</span>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] h-4 px-1.5 font-mono",
                            log.status === "success" && "border-success/30 text-success bg-success/5",
                            log.status === "duplicate" && "border-yellow-500/30 text-yellow-500 bg-yellow-500/5",
                            log.status === "error" && "border-destructive/30 text-destructive bg-destructive/5",
                          )}
                        >
                          {log.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center group-hover:bg-white/5 p-1 rounded">
                        <span className="text-foreground font-semibold">{log.code}</span>
                        <span className="text-muted-foreground">{log.msg}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-4 border-t border-white/5 bg-white/5">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-success" /> System Synchronized
                  </span>
                  <span>v2.1.0-A</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
