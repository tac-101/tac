"use client";

import { motion } from "framer-motion";
import { 
  Bot, 
  Command, 
  CornerDownRight, 
  HelpCircle, 
  Settings,
  Sparkles,
  Zap
} from "lucide-react";
import React from "react";

import { TapanAssociateSidebarWidget } from "../_components/tapan-associate-widget";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TapanAssociatePage() {
  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 p-8 space-y-8 overflow-y-auto no-scrollbar">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              AI Tapan Associate
            </h2>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1.5 px-3 py-1">
               <Sparkles className="h-3.5 w-3.5" />
               v4.2-Turbo
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Your high-performance logistics companion. Powered by real-time fleet data and advanced logistics intelligence.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Smart Manifest Analysis",
              desc: "Upload or point to a manifest for instant error detection and piece-count verification.",
              icon: Command,
              delay: 0.1
            },
            {
              title: "Predictive Routing",
              desc: "Ask about potential delays based on current weather or airport traffic patterns.",
              icon: Zap,
              delay: 0.2
            },
            {
              title: "System Integration",
              desc: "Directly trigger warehouse alerts or flight status updates through natural language.",
              icon: Settings,
              delay: 0.3
            }
          ].map((item) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: item.delay }}
            >
              <Card className="glass group hover:border-primary/50 transition-all cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Try asking this
                    <CornerDownRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="glass border-white/5 bg-gradient-to-br from-white/5 to-transparent overflow-hidden border-none shadow-[0_0_50px_-12px_rgba(var(--primary-rgb),0.1)]">
          <CardHeader className="border-b border-white/5 bg-white/5 py-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" />
              Conversation context & shortcuts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid gap-4 grid-cols-2 md:grid-cols-4">
            {[
              "Check flight QR832 status",
              "Summary of today's BLR manifest",
              "Identify delayed shipments",
              "Generate invoice for AW-281",
              "Scan Pieces on Manifest M-24",
              "Update inventory for Dock 4",
              "Show overdue customs forms",
              "List active scanning sessions"
            ].map(cmd => (
              <button 
                key={cmd}
                className="text-left text-xs bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/5 text-muted-foreground hover:text-foreground transition-all truncate"
              >
                {cmd}
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Tapan Widget as the direct interaction layer */}
      <div className="w-[450px] border-l border-white/5 bg-white/5 relative z-20 shadow-2xl">
        <div className="absolute inset-0 bg-sidebar/20 backdrop-blur-3xl -z-10" />
        <TapanAssociateSidebarWidget />
        
        {/* Floating AI Identifier */}
        <div className="absolute top-4 right-4 z-50 pointer-events-none">
           <div className="bg-background/80 backdrop-blur shadow-xl border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-2">
              <div className="relative">
                 <Bot className="h-3.5 w-3.5 text-primary" />
                 <div className="absolute -top-1 -right-1 w-2 h-2 bg-success rounded-full ring-2 ring-background animate-pulse" />
              </div>
              <span className="text-[10px] font-bold tracking-tight text-white/70 uppercase">Assistant Active</span>
           </div>
        </div>
      </div>
    </div>
  );
}
