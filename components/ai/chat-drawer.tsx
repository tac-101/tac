"use client";

import { Bot, Send, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
	id: string;
	role: "user" | "assistant";
	content: string;
}

export default function ChatDrawer() {
	const [messages, setMessages] = useState<Message[]>([
		{
			id: "1",
			role: "assistant",
			content: "Hello! I'm your TAC logistics assistant. How can I help you today?",
		},
	]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isLoading) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			role: "user",
			content: input.trim(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInput("");
		setIsLoading(true);

		// Simulate AI response
		setTimeout(() => {
			const assistantMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: "assistant",
				content: "I'm processing your request. This feature is coming soon!",
			};
			setMessages((prev) => [...prev, assistantMessage]);
			setIsLoading(false);
		}, 1000);
	};

	return (
		<DialogContent className="sm:max-w-md h-[80vh] flex flex-col p-0">
			<DialogHeader className="p-4 border-b">
				<DialogTitle className="flex items-center gap-2">
					<Bot className="size-5" />
					TAC Assistant
				</DialogTitle>
			</DialogHeader>

			<ScrollArea className="flex-1 p-4">
				<div className="space-y-4">
					{messages.map((message) => (
						<div
							key={message.id}
							className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
						>
							<div
								className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
									message.role === "user"
										? "bg-primary text-primary-foreground"
										: "bg-muted"
								}`}
							>
								{message.content}
							</div>
						</div>
					))}
					{isLoading && (
						<div className="flex justify-start">
							<div className="bg-muted rounded-lg px-3 py-2 text-sm">
								<span className="animate-pulse">Thinking...</span>
							</div>
						</div>
					)}
				</div>
			</ScrollArea>

			<form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
				<Input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Ask me anything..."
					disabled={isLoading}
					className="flex-1"
				/>
				<Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
					<Send className="size-4" />
				</Button>
			</form>
		</DialogContent>
	);
}
