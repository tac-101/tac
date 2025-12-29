"use client";

import { motion } from "framer-motion";
import { 
  ArrowRight, 
  BarChart3, 
  Box, 
  Calendar, 
  ChevronRight, 
  Filter, 
  Package, 
  Search,
  Ship,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const MOCK_MANIFESTS = [
  {
    id: "M-770124",
    flight: "QR832",
    origin: "DOH",
    dest: "BLR",
    date: "2024-03-24",
    pieces: 142,
    weight: "2,450 kg",
    status: "Arrived",
    priority: "High",
  },
  {
    id: "M-770125",
    flight: "EK564",
    origin: "DXB",
    dest: "BLR",
    date: "2024-03-24",
    pieces: 89,
    weight: "1,120 kg",
    status: "In-Transit",
    priority: "Medium",
  },
  {
    id: "M-770126",
    flight: "LH754",
    origin: "FRA",
    dest: "BLR",
    date: "2024-03-25",
    pieces: 210,
    weight: "3,840 kg",
    status: "Pending",
    priority: "Critical",
  },
  {
    id: "M-770127",
    flight: "SQ502",
    origin: "SIN",
    dest: "BLR",
    date: "2024-03-25",
    pieces: 64,
    weight: "850 kg",
    status: "Delayed",
    priority: "Low",
  },
];

export default function AircargoPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredManifests = MOCK_MANIFESTS.filter(m => 
    m.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.flight.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Aircargo Manifest
          </h2>
          <p className="text-muted-foreground">
            Manage and track inbound air cargo manifests and shipments.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="glass transition-all hover:scale-105">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule
          </Button>
          <Link href="/dashboard/aircargo/scan-session">
            <Button className="btn-gradient-warm transition-all hover:scale-105">
              <Package className="mr-2 h-4 w-4" />
              New Scan Session
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Manifests", value: "24", icon: Box, trend: "+12%" },
          { title: "Pending Pieces", value: "1,452", icon: Package, trend: "+5%" },
          { title: "Active Flights", value: "8", icon: Ship, trend: "Stable" },
          { title: "Arrival Rate", value: "94%", icon: TrendingUp, trend: "+2%" },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass group cursor-pointer hover:border-primary/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all duration-300 group-hover:scale-110" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <span className={cn(
                    "font-medium",
                    stat.trend.startsWith("+") ? "text-success" : "text-muted-foreground"
                  )}>
                    {stat.trend}
                  </span>
                  from last 24h
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="glass overflow-hidden border-white/5">
        <CardHeader className="border-b border-white/5 bg-white/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Active Manifests
              </CardTitle>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search manifest or flight..." 
                  className="pl-9 bg-white/5 border-white/10 h-9 transition-all focus:ring-primary/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="w-[120px] font-semibold">Manifest ID</TableHead>
                <TableHead className="font-semibold">Flight</TableHead>
                <TableHead className="font-semibold">Route</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="text-right font-semibold">Pieces</TableHead>
                <TableHead className="font-semibold">Weight</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredManifests.map((manifest) => (
                <TableRow 
                  key={manifest.id} 
                  className="group hover:bg-white/5 border-white/5 transition-colors cursor-pointer"
                >
                  <TableCell className="font-mono font-medium text-primary">
                    {manifest.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
                        <Ship className="h-3 w-3 text-primary" />
                      </div>
                      {manifest.flight}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-semibold">{manifest.origin}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="font-semibold">{manifest.dest}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {manifest.date}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {manifest.pieces}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {manifest.weight}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "font-medium",
                        manifest.status === "Arrived" && "bg-success/10 text-success border-success/20",
                        manifest.status === "In-Transit" && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                        manifest.status === "Pending" && "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
                        manifest.status === "Delayed" && "bg-red-500/10 text-red-500 border-red-500/20",
                      )}
                    >
                      {manifest.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass border-white/5 overflow-hidden">
          <CardHeader className="bg-white/5 py-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Recent Arrival Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="h-48 flex items-center justify-center">
            <p className="text-sm text-muted-foreground italic">Metric visualization coming soon...</p>
          </CardContent>
        </Card>
        <Card className="glass border-white/5 overflow-hidden">
          <CardHeader className="bg-white/5 py-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Ship className="h-4 w-4 text-primary" />
              Quick Track
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-center h-48 space-y-4">
            <Input placeholder="Enter AWB or Flight No." className="bg-white/5 border-white/10" />
            <Button className="w-full btn-gradient-warm">Track Shipment</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
