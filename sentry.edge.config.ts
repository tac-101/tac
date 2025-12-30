import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  release: process.env.SENTRY_RELEASE || "tac@1.0.0",
  debug: process.env.NODE_ENV === "development",
  tracesSampleRate: 1.0,
  environment: process.env.SENTRY_ENV || process.env.NODE_ENV,
  integrations: [Sentry.captureConsoleIntegration({ levels: ["log", "warn", "error"] })],
});
