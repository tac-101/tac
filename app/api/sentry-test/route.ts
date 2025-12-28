import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  return Sentry.startSpan(
    { op: "api.request", name: "GET /api/sentry-test" },
    async (span) => {
      try {
        throw new Error("Sentry MCP test error");
      } catch (err) {
        Sentry.captureException(err);
      } finally {
        span.setAttribute("trigger", "manual");
        await Sentry.flush(2000);
      }
      return NextResponse.json({ ok: true, sent: true });
    },
  );
}
