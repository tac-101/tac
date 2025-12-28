"use client";

import * as Sentry from "@sentry/nextjs";

export default function Page() {
  const handleClick = () => {
    Sentry.startSpan({ op: "ui.click", name: "Sentry Example: Trigger Error" }, (span) => {
      span.setAttribute("example", "true");
      try {
        (globalThis as any).myUndefinedFunction();
      } catch (err) {
        Sentry.captureException(err);
      }
    });
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Sentry example</h1>
      <p>Click the button below to send a test error to Sentry.</p>
      <button type="button" onClick={handleClick} className="px-4 py-2 rounded border">
        Trigger Sentry Test Error
      </button>
    </div>
  );
}
