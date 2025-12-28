"use client";

import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";

interface MotionWrapperProps extends HTMLMotionProps<"div"> {
    delay?: number;
    duration?: number;
    className?: string;
}

export const MotionWrapper = ({
    children,
    delay = 0,
    duration = 0.5,
    className,
    ...props
}: MotionWrapperProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration, delay, ease: "easeOut" }}
            className={cn(className)}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export const MotionList = ({
    children,
    delay = 0,
    stagger = 0.1,
    className,
    ...props
}: {
    children: React.ReactNode;
    delay?: number;
    stagger?: number;
    className?: string;
} & HTMLMotionProps<"div">) => {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                visible: {
                    transition: {
                        staggerChildren: stagger,
                        delayChildren: delay,
                    },
                },
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export const MotionItem = ({ className, ...props }: HTMLMotionProps<"div">) => {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.4 }}
            className={className}
            {...props}
        >
            {props.children}
        </motion.div>
    );
};
