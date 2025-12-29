import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  debug: process.env.NODE_ENV === "development",
  tracesSampleRate: 1.0,
  environment: process.env.SENTRY_ENV || process.env.NODE_ENV,
  integrations: [
    Sentry.captureConsoleIntegration({ levels: ["warn", "error"] }),
  ],
  beforeSend(event) {
    if (process.env.NODE_ENV === "development") {
      const message = event.message || "";
      // Filter noisy dev-only messages
      if (
        message.includes("Fast Refresh") ||
        message.includes("Compiling") ||
        message.includes("HMR") ||
        message.includes("Ready in") ||
        message.includes("filesystem cache")
      ) {
        return null;
      }
    }
    return event;
  },
});
