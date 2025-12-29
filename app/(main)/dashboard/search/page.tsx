"use client";

<<<<<<< HEAD
import { useState, useMemo } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import ProcessorIcon from "@/components/icons/proccesor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Command, Filter, Ship, Truck, FileText, User, ChevronRight, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

export default function GlobalSearchPage() {
    const [query, setQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
=======
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
>>>>>>> origin/main

const SUGGESTIONS = [
  "Manifest BLR-7701",
  "Shipment TAC-AWB-92",
  "Operator Profile: Admin",
  "Warehouse Capacity BLR-01",
];

<<<<<<< HEAD
    const mockResults = [
        { id: "TAC-2024-001", type: "Shipment", title: "Electronics from Shenzhen", status: "In Transit", date: "2024-05-20" },
        { id: "TAC-2024-002", type: "Shipment", title: "Textiles to Hamburg", status: "Pending", date: "2024-05-21" },
        { id: "INV-9901", type: "Invoice", title: "Bose Corp - Monthly Fee", status: "Paid", date: "2024-05-18" },
        { id: "CUST-442", type: "Customer", title: "Global Logistics Inc", status: "Corporate", date: "Active" },
        { id: "MAN-EK503", type: "Manifest", title: "EK503 - Dubai Cargo", status: "Ready", date: "2024-05-22" },
    ];

    const handleSearch = () => {
        if (!query) return;
        setIsSearching(true);
        setTimeout(() => {
            setIsSearching(false);
            toast.info(`Search refreshed for: ${query}`);
        }, 800);
    };

    const filteredResults = useMemo(() => {
        if (!query && !selectedCategory) return [];
        return mockResults.filter(item => {
            const matchesQuery = !query ||
                item.id.toLowerCase().includes(query.toLowerCase()) ||
                item.title.toLowerCase().includes(query.toLowerCase());
            const matchesCategory = !selectedCategory || item.type === selectedCategory.slice(0, -1); // Simple mapping
            return matchesQuery && matchesCategory;
        });
    }, [query, selectedCategory]);

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
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                            <div className="flex items-center gap-2 mr-4">
                                {isSearching ? (
                                    <Loader2 className="size-6 text-primary animate-spin mr-2" />
                                ) : (
                                    <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-muted-foreground">
                                        <Command className="size-3" />
                                        <span>K</span>
                                    </div>
                                )}
                                <Button size="icon" className="size-12 rounded-none" onClick={handleSearch}>
                                    <ChevronRight className="size-6" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => { setQuery("TAC-2024-001"); handleSearch(); }}
                        >
                            Recent: TAC-2024-001
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => { setQuery("EK503"); handleSearch(); }}
                        >
                            Recent: EK503 Manifest
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => { setQuery("Tapan Logistics"); handleSearch(); }}
                        >
                            Recent: Tapan Logistics
                        </Button>
                        {(query || selectedCategory) && (
                            <Button variant="link" size="sm" className="text-xs text-primary" onClick={() => { setQuery(""); setSelectedCategory(null); }}>
                                Clear Search
                            </Button>
                        )}
                    </div>
                </div>

                {/* Results Section */}
                {(query || selectedCategory) && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                {isSearching ? "Searching..." : `Results for "${query || selectedCategory}"`}
                            </h3>
                            <span className="text-[10px] text-muted-foreground">{filteredResults.length} found</span>
                        </div>
                        <ScrollArea className="h-64 rounded-none border border-white/5 bg-background/20 backdrop-blur-sm">
                            <div className="divide-y divide-white/5">
                                {filteredResults.length > 0 ? filteredResults.map((res) => (
                                    <div key={res.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 bg-white/5 flex items-center justify-center font-mono text-[10px] text-primary">
                                                {res.type.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm group-hover:text-primary transition-colors">{res.id}</p>
                                                <p className="text-xs text-muted-foreground">{res.title}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-mono">{res.status}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase">{res.date}</p>
                                        </div>
                                    </div>
                                )) : !isSearching && (
                                    <div className="p-12 text-center text-muted-foreground italic text-sm">
                                        No results found matching your criteria.
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                )}

                {/* Quick Categories */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {searchCategories.map((cat) => (
                        <Card
                            key={cat.name}
                            className={`bg-background/40 backdrop-blur-md border-white/10 hover:border-primary/50 transition-all cursor-pointer group rounded-none ${selectedCategory === cat.name ? 'border-primary/50 ring-1 ring-primary/50' : ''}`}
                            onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                        >
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
=======
export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <div className="flex-1 p-8 space-y-12 max-w-5xl mx-auto pt-20">
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
>>>>>>> origin/main
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
