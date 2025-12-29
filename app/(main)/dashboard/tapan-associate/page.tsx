"use client";

import DashboardPageLayout from "@/components/dashboard/layout";
import MonkeyIcon from "@/components/icons/monkey";
import { TapanAssociateSidebarWidget } from "@/app/(main)/dashboard/_components/tapan-associate-widget";

export default function TapanAssociatePage() {
    return (
        <DashboardPageLayout
            header={{
                title: "Tapan Associate",
                description: "Advanced AI assistance for logistics operations and dashboard management",
                icon: MonkeyIcon,
            }}
        >
            <div className="max-w-5xl mx-auto h-[calc(100vh-220px)] flex flex-col pt-4">
                <div className="flex-1 flex flex-col bg-background/40 backdrop-blur-md border border-white/10 rounded-none overflow-hidden shadow-2xl">
                    <TapanAssociateSidebarWidget />
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-none">
                        <p className="text-xs font-bold text-primary uppercase mb-1">Context Aware</p>
                        <p className="text-xs text-muted-foreground">Automatically analyzes the current module you're working on.</p>
                    </div>
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-none">
                        <p className="text-xs font-bold text-primary uppercase mb-1">Multi-Modal</p>
                        <p className="text-xs text-muted-foreground">Upload manifests, invoices or screenshots for instant processing.</p>
                    </div>
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-none">
                        <p className="text-xs font-bold text-primary uppercase mb-1">Ops Integrated</p>
                        <p className="text-xs text-muted-foreground">Directly linked to shipments, manifests, and warehouse tracking.</p>
                    </div>
                </div>
            </div>
        </DashboardPageLayout>
    );
}
