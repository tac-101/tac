import * as Sentry from "@sentry/nextjs";

const integrations = [
  Sentry.captureConsoleIntegration({ levels: ["warn", "error"] }),
];

if (typeof Sentry.replayIntegration === "function") {
  integrations.push(Sentry.replayIntegration());
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || process.env.SENTRY_RELEASE || "tac@1.0.0",
  debug: process.env.NODE_ENV === "development",
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations,
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
