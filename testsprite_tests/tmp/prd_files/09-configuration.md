# Configuration & Environment

## Overview

TAC uses environment variables for configuration, following the 12-factor app methodology. This document details all configuration options and their purposes.

## Environment Files

```
tac/
├── .env.local          # Local development (gitignored)
├── .env.example        # Template with all variables
├── .env.production     # Production values (CI/CD only)
└── .env.test           # Test environment
```

## Required Environment Variables

### Supabase Configuration

```bash
# Public keys (safe for client-side)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server-side only (NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Public anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Admin key for server operations |

### WhatsApp Business API

```bash
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_TEMPLATE_NAME=invoice
WHATSAPP_TEMPLATE_LANGUAGE=en_US
WHATSAPP_DEFAULT_COUNTRY_CODE=91
WHATSAPP_TEMPLATE_INCLUDE_DOCUMENT=true
WHATSAPP_TRACKING_TEMPLATE=shipment_update
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `WHATSAPP_ACCESS_TOKEN` | ✅ | - | Meta Graph API access token |
| `WHATSAPP_PHONE_NUMBER_ID` | ✅ | - | Business phone number ID |
| `WHATSAPP_TEMPLATE_NAME` | ❌ | `invoice` | Invoice template name |
| `WHATSAPP_TEMPLATE_LANGUAGE` | ❌ | `en_US` | Template language code |
| `WHATSAPP_DEFAULT_COUNTRY_CODE` | ❌ | `91` | Default country code (India) |
| `WHATSAPP_TEMPLATE_INCLUDE_DOCUMENT` | ❌ | `false` | Include PDF attachment |

### Twilio SMS

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_FROM_NUMBER=+14155551234
TWILIO_MESSAGING_SERVICE_SID=MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_FROM=+14155238886
```

| Variable | Required | Description |
|----------|----------|-------------|
| `TWILIO_ACCOUNT_SID` | ❌ | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | ❌ | Twilio Auth Token |
| `TWILIO_FROM_NUMBER` | ❌ | SMS sender number |
| `TWILIO_MESSAGING_SERVICE_SID` | ❌ | Messaging service (alternative to FROM) |
| `TWILIO_WHATSAPP_FROM` | ❌ | WhatsApp sender (sandbox) |

### Upstash Redis (Rate Limiting)

```bash
UPSTASH_REDIS_REST_URL=https://xxx-xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

| Variable | Required | Description |
|----------|----------|-------------|
| `UPSTASH_REDIS_REST_URL` | ❌ | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | ❌ | Upstash Redis auth token |

### Sentry Error Monitoring

```bash
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-organization
SENTRY_PROJECT=javascript-nextjs
SENTRY_AUTH_TOKEN=sntrys_xxxxxxxxxxxxxxxxxxxxxxxxxx
SENTRY_REGION_URL=https://sentry.io
```

| Variable | Required | Description |
|----------|----------|-------------|
| `SENTRY_DSN` | ❌ | Sentry Data Source Name |
| `SENTRY_ORG` | ❌ | Sentry organization slug |
| `SENTRY_PROJECT` | ❌ | Sentry project name |
| `SENTRY_AUTH_TOKEN` | ❌ | Sentry auth token for source maps |

### Application Settings

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=TAC
NODE_ENV=production
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_SITE_URL` | ❌ | `http://localhost:3000` | Public site URL |
| `NEXT_PUBLIC_APP_NAME` | ❌ | `TAC` | Application name |
| `NODE_ENV` | ❌ | `development` | Environment mode |

### AI/Chat Integration

```bash
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | ❌ | OpenRouter API key for AI features |
| `PERPLEXITY_API_KEY` | ❌ | Perplexity API key |

---

## Complete .env.example

```bash
# ===========================================
# TAC - Tapan Air Cargo Configuration
# ===========================================

# ----- Supabase -----
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ----- WhatsApp Business API -----
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_TEMPLATE_NAME=invoice
WHATSAPP_TEMPLATE_LANGUAGE=en_US
WHATSAPP_DEFAULT_COUNTRY_CODE=91
WHATSAPP_TEMPLATE_INCLUDE_DOCUMENT=false
WHATSAPP_TRACKING_TEMPLATE=shipment_update

# ----- Twilio (SMS Fallback) -----
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
TWILIO_MESSAGING_SERVICE_SID=
TWILIO_WHATSAPP_FROM=

# ----- Upstash Redis (Rate Limiting) -----
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# ----- Sentry (Error Monitoring) -----
SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=javascript-nextjs
SENTRY_AUTH_TOKEN=
SENTRY_REGION_URL=https://sentry.io

# ----- Application -----
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=TAC
NODE_ENV=development

# ----- AI Features -----
OPENROUTER_API_KEY=
PERPLEXITY_API_KEY=

# ----- Slack Alerts (Optional) -----
SLACK_WEBHOOK_URL=
```

---

## Next.js Configuration

### next.config.ts

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable experimental features
  experimental: {
    // Server Actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Tailwind Configuration

```css
/* globals.css - Tailwind v4 */
@import "tailwindcss";

@theme {
  --font-sans: "Inter", system-ui, sans-serif;
  --font-heading: "Cal Sans", "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;
  
  --color-background: hsl(222.2 84% 4.9%);
  --color-foreground: hsl(210 40% 98%);
  --color-primary: hsl(210 40% 98%);
  --color-primary-foreground: hsl(222.2 47.4% 11.2%);
  /* ... other theme variables */
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### Shadcn UI Configuration

```json
// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

---

## Feature Flags

### Feature Status Configuration

```typescript
// lib/featureStatus.ts
export const FEATURES = {
  WHATSAPP_INTEGRATION: {
    enabled: !!process.env.WHATSAPP_ACCESS_TOKEN,
    name: 'WhatsApp Integration',
  },
  SMS_FALLBACK: {
    enabled: !!process.env.TWILIO_ACCOUNT_SID,
    name: 'SMS Fallback',
  },
  RATE_LIMITING: {
    enabled: !!process.env.UPSTASH_REDIS_REST_URL,
    name: 'Rate Limiting',
  },
  ERROR_TRACKING: {
    enabled: !!process.env.SENTRY_DSN,
    name: 'Error Tracking',
  },
  AI_CHAT: {
    enabled: !!process.env.OPENROUTER_API_KEY,
    name: 'AI Chat Assistant',
  },
};

export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature]?.enabled ?? false;
}
```

### Usage

```typescript
import { isFeatureEnabled } from '@/lib/featureStatus';

// Conditional rendering
{isFeatureEnabled('WHATSAPP_INTEGRATION') && (
  <Button onClick={sendWhatsApp}>Send via WhatsApp</Button>
)}

// API route check
if (!isFeatureEnabled('RATE_LIMITING')) {
  // Skip rate limiting
}
```

---

## Company Configuration

### Company Settings

```typescript
// lib/companyConfig.ts
export const COMPANY_CONFIG = {
  name: 'Tapan Air Cargo',
  shortName: 'TAC',
  tagline: 'Swift. Secure. Seamless.',
  
  // Contact
  phone: '+91 XXX XXX XXXX',
  email: 'info@tapanaircargo.com',
  website: 'https://tapanaircargo.com',
  
  // Address
  address: {
    line1: 'Warehouse Complex',
    line2: 'Airport Road',
    city: 'Imphal',
    state: 'Manipur',
    pincode: '795001',
    country: 'India',
  },
  
  // GST
  gstNumber: 'XXAAATXXXX1ZX',
  panNumber: 'AAACTXXXX',
  
  // Invoice settings
  invoice: {
    prefix: 'INV',
    termsAndConditions: `
      1. Goods once booked cannot be cancelled.
      2. Claims must be made within 7 days.
      3. Company is not liable for delays due to weather.
    `,
    bankDetails: {
      bankName: 'State Bank of India',
      accountNumber: 'XXXXXXXXXXXX',
      ifscCode: 'SBIN0XXXXXX',
      branch: 'Imphal Main Branch',
    },
  },
};
```

---

## Logging Configuration

### Structured Logging

```typescript
// Usage with Sentry
import * as Sentry from '@sentry/nextjs';

// Info level
console.info('Shipment created', { shipmentId, customerId });

// Warning level
console.warn('Rate limit approaching', { remaining: 5 });

// Error level (captured by Sentry)
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { module: 'invoices' },
    extra: { invoiceId },
  });
  console.error('Invoice generation failed', error);
}
```

---

*Next: [Deployment Guide](./10-deployment.md)*
