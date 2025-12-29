"use client";

import { Command } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommandMenuTriggerProps {
	onClick?: () => void;
	className?: string;
}

export function CommandMenuTrigger({ onClick, className }: CommandMenuTriggerProps) {
	return (
		<Button
			variant="outline"
			size="sm"
			onClick={onClick}
			className={className}
		>
			<Command className="size-4 mr-2" />
			<span className="hidden sm:inline">Search...</span>
			<kbd className="ml-2 pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
				<span className="text-xs">⌘</span>K
			</kbd>
		</Button>
	);
}

export default CommandMenuTrigger;
