# Sentry Setup & Observability Guide

## 1. Project Setup & Installation

**Status**: Installed & Configured

The project uses `@sentry/nextjs` for full-stack monitoring.

### Core Packages
- `@sentry/nextjs`: Handles error monitoring, performance tracing, and session replays for Next.js.
- `@sentry/cli`: Global CLI tool for managing releases and source maps.

### Configuration Files
- `sentry.client.config.ts`: Client-side error & replay settings.
- `sentry.server.config.ts`: Server-side error monitoring.
- `sentry.edge.config.ts`: Edge runtime monitoring.
- `next.config.ts`: Wrapped with `withSentryConfig` for automatic source map uploading.
- `.sentryclirc`: Default organization (`tapan-go`) and project (`javascript-nextjs`) settings.

---

## 2. Environment Configuration

Ensure these variables are present in `.env.local` or your deployment environment:

```bash
SENTRY_DSN=https://0d032169a0e63d5aa69a58fe4caa75eb@o4509901194330112.ingest.de.sentry.io/4510610295947344
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=tapan-cargo@1.0.0
```

---

## 3. Error Capturing Best Practices

### Manual Error Capture

Use `Sentry.captureException` for handled errors that should still be reported.

```typescript
import * as Sentry from "@sentry/nextjs";

try {
  riskyOperation();
} catch (error) {
  Sentry.captureException(error);
}
```

### Custom Context (Highly Recommended)

Enrich errors with business logic tags to make filtering easier.

```typescript
Sentry.captureException(error, {
  tags: {
    module: "invoice",
    cargo_type: "air",
  },
  extra: {
    invoiceId: "INV-20394",
    barcode: "TAC-AWB-99213",
  },
});
```

### Advanced Tagging Strategy (Logistics-Grade)

Initialize global tags for specific modules or pages:

```typescript
// Example: In a specific page or component
Sentry.setTag("cargo_mode", "air");
Sentry.setTag("module", "manifesto");
Sentry.setTag("scanner", "barcode");
```

**Benefits**:
- **Invoice-only views**: Filter by `module:invoice`.
- **Manifesto analysis**: Track specific pipeline failures.
- **Scanner reliability**: Monitor barcode scanning issues.

---

## 4. CLI Usage & Issue Management

Prerequisite: Authenticate the CLI once.
```bash
sentry-cli login
```

### Common Commands

**List Issues (Unresolved Errors)**
```bash
npx sentry-cli issues list --org tapan-go --project javascript-nextjs --query "is:unresolved error"
```

**Export Issues to JSON**
Useful for audits and CI pipelines.
```bash
npx sentry-cli issues list --project tac-dashboard --json > sentry-issues.json
```

**Get Issue Details**
```bash
npx sentry-cli issues info ISSUE_ID
```

---

## 5. Deployment & Releases

We strongly recommend release tracking to identify regressions.

**Manual Release (CLI)**
```bash
# 1. Create a new release
sentry-cli releases new tapan-cargo@1.0.0

# 2. Associate commits (optional but recommended)
sentry-cli releases set-commits tapan-cargo@1.0.0 --auto

# 3. Finalize the release
sentry-cli releases finalize tapan-cargo@1.0.0
```

**CI/CD (GitHub Actions Example)**
```yaml
- name: Upload Sentry Source Maps
  run: |
    sentry-cli releases new $RELEASE
    sentry-cli releases files $RELEASE upload-sourcemaps .next
    sentry-cli releases finalize $RELEASE
```

---

## 6. Common Mistakes to Avoid

| Mistake | Impact |
| :--- | :--- |
| **No Source Maps** | Stack traces will be minified and unreadable. |
| **No Release Version** | Impossible to track which deployment introduced a bug. |
| **Over-sampling Traces** | High quota usage/costs. We use `tracesSampleRate: 1.0` (adjust if traffic spikes). |
| **No Tags** | "An error occurred" tells you nothing about *where* in the business logic it happened. |

---

## 7. Recommended Features enabled

- **Session Replay**: UI debugging (configured in `sentry.client.config.ts`).
- **Performance Monitoring**: Latency tracking.
- **Release Health**: Deployment confidence.
