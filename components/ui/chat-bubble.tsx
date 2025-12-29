import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const chatBubbleVariants = cva(
    "flex gap-3 max-w-[85%] w-full mb-4",
    {
        variants: {
            variant: {
                received: "self-start",
                sent: "self-end flex-row-reverse",
            },
        },
        defaultVariants: {
            variant: "received",
        },
    },
);

const ChatBubble = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof chatBubbleVariants>
>(({ className, variant, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(chatBubbleVariants({ variant }), className)}
        {...props}
    >
        {children}
    </div>
));
ChatBubble.displayName = "ChatBubble";

const ChatBubbleAvatar = React.forwardRef<
    React.ElementRef<typeof Avatar>,
    React.ComponentPropsWithoutRef<typeof Avatar> & { fallback?: string }
>(({ className, fallback, ...props }, ref) => (
    <Avatar ref={ref} className={cn("h-8 w-8", className)} {...props}>
        <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
));
ChatBubbleAvatar.displayName = "ChatBubbleAvatar";

const chatBubbleMessageVariants = cva(
    "p-3 rounded-lg text-sm",
    {
        variants: {
            variant: {
                received: "bg-muted text-foreground rounded-tl-none",
                sent: "bg-primary text-primary-foreground rounded-tr-none",
            },
            isLoading: {
                true: "flex items-center gap-1",
                false: "",
            },
        },
        defaultVariants: {
            variant: "received",
            isLoading: false,
        },
    },
);

const ChatBubbleMessage = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof chatBubbleMessageVariants> & { isLoading?: boolean }
>(({ className, variant, isLoading, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(chatBubbleMessageVariants({ variant, isLoading }), className)}
        {...props}
    >
        {isLoading ? (
            <>
                <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" />
            </>
        ) : (
            children
        )}
    </div>
));
ChatBubbleMessage.displayName = "ChatBubbleMessage";

const ChatBubbleActionWrapper = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("absolute -top-2 right-0 flex gap-1", className)}
        {...props}
    >
        {children}
    </div>
));
ChatBubbleActionWrapper.displayName = "ChatBubbleActionWrapper";

const ChatBubbleAction = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { icon?: React.ReactNode }
>(({ className, icon, ...props }, ref) => (
    <button
        ref={ref}
        type="button"
        className={cn(
            "h-6 w-6 rounded-full bg-background border shadow-sm flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors",
            className,
        )}
        {...props}
    >
        {icon}
    </button>
));
ChatBubbleAction.displayName = "ChatBubbleAction";

export {
    ChatBubble,
    ChatBubbleAvatar,
    ChatBubbleMessage,
    ChatBubbleActionWrapper,
    ChatBubbleAction,
};
