import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  debug: true,
  tracesSampleRate: 1.0,
  environment: process.env.SENTRY_ENV || process.env.NODE_ENV,
  integrations: [Sentry.captureConsoleIntegration({ levels: ["log", "warn", "error"] })],
});
