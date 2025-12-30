"use client";

import "@/sentry.client.config";
import { useEffect } from "react";

export function SentryInitializer() {
    useEffect(() => {
        // Sentry is initialized by the import above
    }, []);
    return null;
}
