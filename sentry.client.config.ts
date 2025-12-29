import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
  debug: process.env.NODE_ENV === "development",
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  integrations: [
    Sentry.captureConsoleIntegration({ levels: ["warn", "error"] }),
  ],
  beforeSend(event) {
    const message = event.message || "";
    // Filter noisy client messages
    if (
      message.includes("HMR") ||
      message.includes("Fast Refresh") ||
      message.includes("Slow execution detected")
    ) {
      return null;
    }
    return event;
  },
});
