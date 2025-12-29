# Integrations

## Overview

TAC integrates with multiple external services to provide comprehensive logistics functionality. This document covers the setup, configuration, and usage of each integration.

---

## Supabase

### Purpose
Primary backend-as-a-service providing database, authentication, realtime subscriptions, and file storage.

### Components Used
| Component | Usage |
|-----------|-------|
| PostgreSQL | Primary database |
| Auth | User authentication |
| Realtime | Live data subscriptions |
| Storage | Invoice PDFs, POD images |
| Edge Functions | Serverless functions |

### Configuration

```bash
# Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Server-side only
```

### Client Setup

```typescript
// Browser Client (lib/supabaseClient.ts)
import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server Client (lib/supabaseServer.ts)
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}

// Admin Client (lib/supabaseAdmin.ts)
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

### Realtime Subscriptions

```typescript
// Subscribe to table changes
const channel = supabase
  .channel('custom-channel')
  .on(
    'postgres_changes',
    {
      event: '*',  // INSERT, UPDATE, DELETE, or *
      schema: 'public',
      table: 'scan_events',
      filter: 'location=eq.DEL',  // Optional filter
    },
    (payload) => {
      console.log('Change received:', payload);
    }
  )
  .subscribe();

// Cleanup
supabase.removeChannel(channel);
```

### Storage Operations

```typescript
// Upload file
const { data, error } = await supabase.storage
  .from('invoices')
  .upload(`${invoiceRef}.pdf`, pdfBuffer, {
    contentType: 'application/pdf',
    upsert: true,
  });

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('invoices')
  .getPublicUrl(`${invoiceRef}.pdf`);

// Get signed URL (temporary access)
const { data: { signedUrl } } = await supabase.storage
  .from('invoices')
  .createSignedUrl(`${invoiceRef}.pdf`, 3600); // 1 hour
```

---

## WhatsApp Business API

### Purpose
Send invoice notifications, tracking updates, and customer communications via WhatsApp.

### Configuration

```bash
# Environment Variables
WHATSAPP_ACCESS_TOKEN=EAAx...         # Meta API token
WHATSAPP_PHONE_NUMBER_ID=1234567890   # Business phone number ID
WHATSAPP_TEMPLATE_NAME=invoice        # Approved template name
WHATSAPP_TEMPLATE_LANGUAGE=en_US      # Template language
WHATSAPP_DEFAULT_COUNTRY_CODE=91      # India
WHATSAPP_TEMPLATE_INCLUDE_DOCUMENT=true
```

### Template Message

WhatsApp Business API requires pre-approved templates for business-initiated messages.

```typescript
// lib/whatsapp-invoice.ts
export async function sendInvoiceNotification(invoiceId: string) {
  const response = await fetch('/api/send-whatsapp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invoiceId }),
  });
  
  return response.json();
}
```

### API Implementation

```typescript
// app/api/send-whatsapp/route.ts
export async function POST(req: Request) {
  const { invoiceId } = await req.json();
  
  // Load invoice and customer data
  const { data: invoice } = await supabaseAdmin
    .from('invoices')
    .select('*, customers(*)')
    .eq('id', invoiceId)
    .single();
  
  // Normalize phone number to E.164 format
  let to = normalizePhone(invoice.customers.phone);
  
  // Build message body
  const messageBody = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: process.env.WHATSAPP_TEMPLATE_NAME,
      language: { code: process.env.WHATSAPP_TEMPLATE_LANGUAGE },
      components: [
        {
          type: 'header',
          parameters: [
            {
              type: 'document',
              document: {
                link: pdfUrl,
                filename: `Invoice-${invoice.invoice_ref}.pdf`,
              },
            },
          ],
        },
        {
          type: 'body',
          parameters: [
            { type: 'text', text: customerName },
            { type: 'text', text: invoice.invoice_ref },
          ],
        },
      ],
    },
  };
  
  // Send via Meta Graph API
  const response = await fetch(
    `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(messageBody),
    }
  );
  
  return NextResponse.json({ success: true });
}
```

### Tracking Updates

```typescript
// Send shipment tracking update
export async function sendTrackingUpdate(params: {
  phone: string;
  shipmentRef: string;
  status: string;
  location?: string;
  eta?: string;
}) {
  const messageBody = {
    messaging_product: 'whatsapp',
    to: params.phone,
    type: 'template',
    template: {
      name: 'shipment_update',
      language: { code: 'en_US' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: params.shipmentRef },
            { type: 'text', text: params.status },
            { type: 'text', text: params.location || 'In Transit' },
            { type: 'text', text: params.eta || 'Pending' },
          ],
        },
      ],
    },
  };
  
  // Send message...
}
```

---

## Twilio SMS

### Purpose
Fallback SMS notifications when WhatsApp is unavailable.

### Configuration

```bash
# Environment Variables
TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=xxxx
TWILIO_FROM_NUMBER=+1234567890
TWILIO_MESSAGING_SERVICE_SID=MGxxxx  # Optional
TWILIO_WHATSAPP_FROM=+14155238886    # WhatsApp sandbox
```

### Client Setup

```typescript
// lib/twilioClient.ts
import twilio from 'twilio';

export function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken) {
    return null;
  }
  
  return twilio(accountSid, authToken);
}
```

### Send SMS

```typescript
export async function sendInvoiceSms(params: {
  to: string;
  body: string;
}) {
  const client = getTwilioClient();
  if (!client) {
    throw new Error('Twilio is not configured');
  }
  
  const message = await client.messages.create({
    to: params.to,
    body: params.body,
    messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
    // Or: from: process.env.TWILIO_FROM_NUMBER,
  });
  
  return {
    sid: message.sid,
    status: message.status,
    to: message.to,
  };
}
```

### Phone Number Normalization

```typescript
// lib/twilioClient.ts
export function normalizePhoneToE164(rawPhone: string): string | null {
  const trimmed = (rawPhone || '').trim();
  if (!trimmed) return null;
  
  // Already E.164 format
  if (trimmed.startsWith('+')) {
    const digits = trimmed.replace(/[^\d]/g, '');
    return digits.length >= 8 ? `+${digits}` : null;
  }
  
  const digits = trimmed.replace(/\D/g, '');
  
  // 10-digit Indian number
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  
  // 12-digit with country code
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  
  // Generic international
  if (digits.length >= 8 && digits.length <= 15) {
    return `+${digits}`;
  }
  
  return null;
}
```

---

## Upstash Redis

### Purpose
Rate limiting for API endpoints using Redis-based sliding window algorithm.

### Configuration

```bash
# Environment Variables
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxx...
```

### Rate Limiter Setup

```typescript
// lib/rateLimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Different rate limits for different endpoints
export const publicRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1m'),  // 10 req/min
  analytics: true,
  prefix: 'ratelimit:public',
});

export const authRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '1m'),  // 60 req/min
  analytics: true,
  prefix: 'ratelimit:auth',
});

export const adminRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(120, '1m'), // 120 req/min
  analytics: true,
  prefix: 'ratelimit:admin',
});
```

### Usage in API Routes

```typescript
// app/api/public/track/route.ts
import { publicRateLimiter } from '@/lib/rateLimit';

export async function POST(req: Request) {
  // Get client identifier
  const ip = req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             'anonymous';
  
  // Check rate limit
  const { success, remaining, reset } = await publicRateLimiter.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    );
  }
  
  // Process request...
}
```

---

## Sentry

### Purpose
Error monitoring, performance tracing, and crash reporting.

### Configuration

```bash
# Environment Variables
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=javascript-nextjs
SENTRY_AUTH_TOKEN=sntrys_xxx
```

### Client Configuration

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### Server Configuration

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

### Usage

```typescript
import * as Sentry from '@sentry/nextjs';

// Capture exception
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error);
  throw error;
}

// Custom span for tracing
return Sentry.startSpan(
  {
    op: 'db.query',
    name: 'getDashboardStats',
  },
  async (span) => {
    const result = await supabase.from('shipments').select('*');
    span.setAttribute('db.rows', result.data?.length || 0);
    return result;
  }
);

// Set user context
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
});
```

---

## Vercel Analytics

### Purpose
Usage analytics and performance monitoring.

### Configuration

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Custom Events

```typescript
import { track } from '@vercel/analytics';

// Track custom event
track('invoice_created', {
  amount: invoice.amount,
  transport_mode: invoice.transport_mode,
});

// Track conversion
track('shipment_delivered', {
  shipment_id: shipment.id,
  delivery_time_hours: deliveryTime,
});
```

---

## GS1 Barcode Standards

### Purpose
Generate globally compliant barcodes for logistics operations.

### Supported Formats
| Format | Length | Use Case |
|--------|--------|----------|
| SSCC-18 | 18 digits | Serial Shipping Container Code |
| GTIN-14 | 14 digits | Global Trade Item Number |
| GS1-128 | Variable | Combined element string |
| TAC | Variable | Internal TAC format |

### Implementation

```typescript
// lib/gs1-barcode.ts

// Generate SSCC-18
export function generateSSCC(config?: {
  extensionDigit?: number;
  companyPrefix: string;
  serialReference?: string;
}): BarcodeResult {
  const extensionDigit = config?.extensionDigit ?? 0;
  const companyPrefix = config?.companyPrefix || '0000000';
  const serialLength = 17 - 1 - companyPrefix.length;
  const serialReference = config?.serialReference || generateSerialReference(serialLength);
  
  const base = `${extensionDigit}${companyPrefix}${serialReference}`;
  const checkDigit = calculateCheckDigit(base.substring(0, 17));
  
  return {
    type: 'SSCC',
    value: `${base}${checkDigit}`,
    humanReadable: `(00) ${base}${checkDigit}`,
    checkDigit,
    gs1ElementString: `00${base}${checkDigit}`,
  };
}

// Calculate GS1 check digit (Modulo 10)
function calculateCheckDigit(digits: string): number {
  const chars = digits.split('').map(Number);
  let sum = 0;
  
  for (let i = 0; i < chars.length; i++) {
    const weight = i % 2 === 0 ? 3 : 1;
    sum += chars[chars.length - 1 - i] * weight;
  }
  
  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

// Validate barcode
export function validateGS1Barcode(barcode: string): {
  valid: boolean;
  type: string | null;
  error: string | null;
} {
  const clean = barcode.replace(/[^0-9]/g, '');
  
  if (clean.length === 18) {
    const base = clean.substring(0, 17);
    const checkDigit = parseInt(clean[17], 10);
    const calculated = calculateCheckDigit(base);
    
    return checkDigit === calculated
      ? { valid: true, type: 'SSCC-18', error: null }
      : { valid: false, type: 'SSCC-18', error: `Invalid check digit` };
  }
  
  // ... other formats
}
```

### API Usage

```bash
# Generate SSCC barcodes
POST /api/barcodes/gs1
{
  "type": "SSCC",
  "companyPrefix": "0012345",
  "quantity": 5
}

# Validate barcode
GET /api/barcodes/gs1?validate=001234500000000018
```

---

## PDF Generation

### Purpose
Generate professional invoice PDFs with GST compliance.

### Implementation

```typescript
// lib/invoicePdf.ts
import puppeteer from 'puppeteer';

export async function generateInvoicePdf(invoiceId: string) {
  // Fetch invoice data
  const { data: invoice } = await supabaseAdmin
    .from('invoices')
    .select('*, customers(*), shipments(*)')
    .eq('id', invoiceId)
    .single();
  
  // Generate HTML template
  const html = generateInvoiceHTML(invoice);
  
  // Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  });
  
  const page = await browser.newPage();
  await page.setContent(html);
  
  // Generate PDF
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
  });
  
  await browser.close();
  
  // Upload to Supabase Storage
  const { data } = await supabaseAdmin.storage
    .from('invoices')
    .upload(`${invoice.invoice_ref}.pdf`, pdf, {
      contentType: 'application/pdf',
      upsert: true,
    });
  
  return {
    pdfUrl: supabaseAdmin.storage.from('invoices').getPublicUrl(data.path).data.publicUrl,
  };
}
```

---

*Next: [Configuration & Environment](./09-configuration.md)*
