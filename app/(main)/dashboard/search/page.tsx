"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Box,
  Command,
  FileText,
  Globe,
  History,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  User,
  Zap
} from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SEARCH_CATEGORIES = [
  { id: "all", label: "Everything", icon: Globe },
  { id: "shipments", label: "Shipments", icon: Box },
  { id: "invoices", label: "Invoices", icon: FileText },
  { id: "users", label: "Operators", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
];

const SUGGESTIONS = [
  "Manifest BLR-7701",
  "Shipment TAC-AWB-92",
  "Operator Profile: Admin",
  "Warehouse Capacity BLR-01",
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <div className="space-y-6 px-0 mx-auto max-w-5xl">
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 mb-6"
        >
          <Command className="h-8 w-8 text-primary" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold tracking-tight"
        >
          Universal Command Search
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground text-lg max-w-xl mx-auto"
        >
          Instant access to shipments, manifests, invoices, and system actions across your entire logistics network.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-8"
      >
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-primary/30 rounded-[28px] blur-2xl opacity-0 group-focus-within:opacity-30 transition-opacity duration-500" />
          <div className="relative flex items-center bg-card/60 border border-white/10 p-2 rounded-3xl shadow-2xl backdrop-blur-3xl ring-1 ring-white/10">
            <Search className="ml-4 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anything or type a command (⌘ + K)..."
              className="px-4 h-16 bg-transparent border-none focus-visible:ring-0 text-xl font-medium placeholder:text-muted-foreground/50 w-full"
            />
            <div className="flex items-center gap-2 pr-4">
              <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <span className="text-[12px]">⌘</span> K
              </div>
              <Button size="lg" className="h-12 px-8 btn-gradient-warm rounded-2xl shadow-xl hover:scale-105 transition-all">
                Search
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {SEARCH_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border",
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                  : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:text-foreground"
              )}
            >
              <cat.icon className="h-4 w-4" />
              {cat.label}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 pt-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <History className="h-4 w-4" /> Recent Searches
          </h4>
          <div className="space-y-2">
            {SUGGESTIONS.map((item) => (
              <div
                key={item}
                className="group flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-white/10 transition-all cursor-pointer"
              >
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">{item}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="glass border-white/5 h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap className="h-32 w-32 text-primary rotate-12" />
            </div>
            <CardContent className="p-8 space-y-8 relative z-10">
              <div>
                <h4 className="text-xl font-bold mb-2">Smart Actions</h4>
                <p className="text-muted-foreground text-sm">Suggested commands based on your recent activity.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { title: "Generate Report", desc: "Today's Arrival Analytics", icon: TrendingUp },
                  { title: "System Health", desc: "Check API & DB connection", icon: ShieldCheck },
                  { title: "New Shipment", desc: "Quick entry form", icon: Zap },
                  { title: "Contact Support", desc: "Live chat with ops team", icon: User },
                ].map((action) => (
                  <div
                    key={action.title}
                    className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-primary/5 transition-all group cursor-pointer"
                  >
                    <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <action.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="font-bold text-sm mb-1">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.desc}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
