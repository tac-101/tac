"use client";

import { motion } from "framer-motion";
import {
  Barcode,
  ChevronRight,
  Clock,
  ExternalLink,
  LocateFixed,
  MapPin,
  Package,
  Search,
  Truck
} from "lucide-react";
import React, { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const MOCK_HISTORY = [
  { id: "1", date: "2024-03-24 14:30", location: "Warehouse BLR-01", event: "Manifest Scanned", user: "Tapan Go Ops" },
  { id: "2", date: "2024-03-24 10:15", location: "Bangalore Intl Airport", event: "Arrived at destination", user: "System" },
  { id: "3", date: "2024-03-23 22:45", location: "Doha (DOH)", event: "Departed for BLR", user: "Airline Feed" },
  { id: "4", date: "2024-03-23 18:00", location: "Doha Hub", event: "Consolidated into XL-92", user: "Hub Admin" },
];

export default function BarcodesPage() {
  const [trackingId, setTrackingId] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (trackingId) setHasSearched(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Barcode Tracking
          </h2>
          <p className="text-muted-foreground">
            Search and trace package movements across the network.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="glass">
            <Clock className="mr-2 h-4 w-4" />
            History
          </Button>
          <Button className="btn-gradient-warm">
            <LocateFixed className="mr-2 h-4 w-4" />
            Active Scanners
          </Button>
        </div>
      </div>

      <Card className="glass overflow-hidden border-none shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        <CardContent className="pt-12 pb-16 flex flex-col items-center justify-center space-y-8 relative z-10">
          <div className="text-center space-y-3">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <Barcode className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">Global Movement Search</h3>
            <p className="text-muted-foreground w-80 mx-auto">
              Enter a Tracking ID, AWB, or Order number to retrieve real-time location and status.
            </p>
          </div>

          <div className="flex w-full max-w-xl items-center space-x-2 bg-white/5 p-2 rounded-2xl border border-white/5 ring-1 ring-white/5 shadow-2xl backdrop-blur-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Ex: TAC-AWB-987219..."
                className="pl-10 h-12 bg-transparent border-none focus-visible:ring-0 text-lg font-medium"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button
              size="lg"
              className="h-12 px-8 btn-gradient-warm rounded-xl shadow-xl hover:scale-105 transition-all"
              onClick={handleSearch}
            >
              Search Parcel
            </Button>
          </div>

          <div className="flex gap-6 text-xs text-muted-foreground font-medium uppercase tracking-widest pt-4">
            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rounded-full" /> 3.2M Scanned this week</span>
            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rounded-full" /> 99.9% Tracking uptime</span>
          </div>
        </CardContent>
      </Card>

      {hasSearched && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          <Card className="glass border-white/5 md:col-span-1 h-full">
            <CardHeader className="bg-white/5 px-6 py-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Package Summary
              </CardTitle>
              <Badge className="bg-success text-white">Active</Badge>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                  <span className="text-muted-foreground">Carrier</span>
                  <span className="font-semibold flex items-center gap-2">
                    <Truck className="h-4 w-4" /> Tapan Go Fleet
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                  <span className="text-muted-foreground">Dimensions</span>
                  <span className="font-semibold uppercase">45x30x20 CM</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                  <span className="text-muted-foreground">Weight</span>
                  <span className="font-semibold uppercase">12.5 KG</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                  <span className="text-muted-foreground">Destination</span>
                  <span className="font-semibold uppercase">Bangalore, IN</span>
                </div>
              </div>
              <Button variant="outline" className="w-full glass group">
                Full Shipment Details
                <ExternalLink className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          <Card className="glass border-white/5 md:col-span-2">
            <CardHeader className="bg-white/5 px-6 py-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Movement History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[300px]">
                <div className="p-6 space-y-8">
                  {MOCK_HISTORY.map((item, i) => (
                    <div key={item.id} className="relative flex gap-4">
                      {i !== MOCK_HISTORY.length - 1 && (
                        <div className="absolute left-2.5 top-6 bottom-[-24px] w-px bg-white/10" />
                      )}
                      <div className={cn(
                        "mt-1.5 h-5 w-5 rounded-full border-2 flex items-center justify-center z-10",
                        i === 0 ? "border-primary bg-primary/20 animate-pulse" : "border-white/20 bg-white/5"
                      )}>
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          i === 0 ? "bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),1)]" : "bg-muted-foreground"
                        )} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <p className="font-semibold text-foreground uppercase tracking-wider">{item.event}</p>
                          <span className="text-muted-foreground">{item.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          <span>{item.location}</span>
                          <span className="text-xs opacity-50">•</span>
                          <span className="text-[11px] uppercase">{item.user}</span>
                        </div>
                        {i === 0 && (
                          <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="bg-primary/5 border border-primary/10 rounded-lg p-2 mt-2 flex items-center justify-between group cursor-pointer hover:bg-primary/10 transition-colors"
                          >
                            <span className="text-xs font-semibold text-primary">SCAN DATA VERIFIED</span>
                            <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-4 bg-white/5 border-t border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
                {['Photo Proof', 'GPS Coordinates', 'Signature', 'Invoice'].map(tag => (
                  <Badge key={tag} variant="secondary" className="glass bg-white/5 hover:bg-white/10 whitespace-nowrap cursor-pointer">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
