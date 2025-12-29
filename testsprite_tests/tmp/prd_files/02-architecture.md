# Architecture & Tech Stack

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Browser   │  │  Mobile Web │  │   Scanner   │  │  WhatsApp   │        │
│  │   (React)   │  │   (PWA)     │  │   Device    │  │   Client    │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
└─────────┼────────────────┼────────────────┼────────────────┼────────────────┘
          │                │                │                │
          ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      Next.js 16 App Router                           │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐            │   │
│  │  │  Server       │  │   API Routes  │  │   Static      │            │   │
│  │  │  Components   │  │   /api/*      │  │   Assets      │            │   │
│  │  └───────────────┘  └───────────────┘  └───────────────┘            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────┐  ┌─────────────┐  │  ┌─────────────┐  ┌─────────────┐    │
│  │   Sentry    │  │   Vercel    │  │  │   Upstash   │  │   Twilio    │    │
│  │  Monitoring │  │  Analytics  │  │  │ Rate Limit  │  │    SMS      │    │
│  └─────────────┘  └─────────────┘  │  └─────────────┘  └─────────────┘    │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Supabase Platform                            │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐            │   │
│  │  │  PostgreSQL   │  │   Auth        │  │   Realtime    │            │   │
│  │  │   Database    │  │   Service     │  │   Pub/Sub     │            │   │
│  │  └───────────────┘  └───────────────┘  └───────────────┘            │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐            │   │
│  │  │   Storage     │  │   Edge        │  │   Row Level   │            │   │
│  │  │   (Files)     │  │   Functions   │  │   Security    │            │   │
│  │  └───────────────┘  └───────────────┘  └───────────────┘            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Technology Stack Details

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.1 | Full-stack React framework with App Router |
| **React** | 19.2.3 | UI component library |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **Shadcn UI** | Latest | Accessible component primitives |
| **Radix UI** | 1.4.3 | Headless UI components |
| **Framer Motion** | 12.x | Animation library |
| **Lucide React** | 0.562 | Icon library |
| **Tabler Icons** | 3.36 | Additional icons |

### State Management

| Technology | Purpose |
|------------|---------|
| **Zustand** | Global state management |
| **React Hook Form** | Form state management |
| **TanStack Table** | Table state and virtualization |

### Data & Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Supabase** | 2.89 | Backend-as-a-Service |
| **PostgreSQL** | 15.x | Primary database (via Supabase) |
| **Supabase Auth** | - | Authentication |
| **Supabase Realtime** | - | WebSocket subscriptions |
| **Supabase Storage** | - | File storage (PDFs, images) |

### Validation & Forms

| Technology | Purpose |
|------------|---------|
| **Zod** | Runtime schema validation |
| **@hookform/resolvers** | Zod integration with React Hook Form |

### External Services

| Service | Purpose |
|---------|---------|
| **Twilio** | SMS notifications |
| **WhatsApp Business API** | WhatsApp messaging |
| **Sentry** | Error monitoring and tracing |
| **Vercel Analytics** | Usage analytics |
| **Upstash Redis** | Rate limiting |

### UI Components

| Component | Source |
|-----------|--------|
| **Charts** | Recharts |
| **Data Tables** | TanStack Table + DND Kit |
| **Calendar** | FullCalendar + React Day Picker |
| **Command Palette** | cmdk + kbar |
| **Toasts** | Sonner |
| **Modals/Dialogs** | Vaul (drawer) + Radix Dialog |

## Directory Structure

```
tac/
├── app/                           # Next.js App Router
│   ├── (auth)/                    # Auth route group
│   │   ├── _components/           # Auth-specific components
│   │   ├── login/                 # Login page
│   │   └── signup/                # Signup page
│   │
│   ├── (external)/                # Public pages
│   │   ├── _components/           # Public page components
│   │   │   └── landing/           # Landing page sections
│   │   ├── page.tsx               # Landing page
│   │   └── track/                 # Public tracking
│   │
│   ├── (main)/                    # Protected dashboard
│   │   └── dashboard/             # Dashboard pages
│   │       ├── _components/       # Dashboard components
│   │       ├── admin/             # Admin settings
│   │       ├── analytics/         # Analytics pages
│   │       ├── customers/         # Customer management
│   │       ├── exceptions/        # Exception handling
│   │       ├── finance/           # Financial reports
│   │       ├── fleet/             # Fleet management
│   │       ├── inventory/         # Inventory management
│   │       ├── invoices/          # Invoice management
│   │       ├── ops/               # Operations
│   │       ├── rates/             # Rate management
│   │       ├── reports/           # Reports
│   │       ├── settings/          # User settings
│   │       ├── shipments/         # Shipment management
│   │       ├── support/           # Support tickets
│   │       ├── tracking/          # Internal tracking
│   │       └── warehouse/         # Warehouse management
│   │
│   ├── api/                       # API Routes
│   │   ├── auth/                  # Auth endpoints
│   │   ├── barcodes/              # Barcode generation
│   │   ├── customers/             # Customer CRUD
│   │   ├── finance/               # Financial APIs
│   │   ├── inventory/             # Inventory APIs
│   │   ├── invoices/              # Invoice APIs
│   │   ├── manifests/             # Manifest APIs
│   │   ├── payments/              # Payment APIs
│   │   ├── public/                # Public APIs
│   │   ├── scans/                 # Scan events
│   │   ├── shipments/             # Shipment APIs
│   │   └── ...                    # Other endpoints
│   │
│   ├── globals.css                # Global styles
│   └── layout.tsx                 # Root layout
│
├── components/                    # Shared components
│   ├── auth/                      # Auth components
│   ├── icons/                     # Custom icons
│   ├── layout/                    # Layout components
│   ├── support/                   # Support widgets
│   └── ui/                        # Shadcn UI components
│
├── features/                      # Feature modules
│   ├── alerts/                    # Alert system
│   ├── customers/                 # Customer features
│   ├── inventory/                 # Inventory features
│   ├── invoices/                  # Invoice features
│   ├── notifications/             # Notification system
│   ├── rates/                     # Rate management
│   ├── shipments/                 # Shipment features
│   ├── support/                   # Support features
│   └── warehouse/                 # Warehouse features
│
├── hooks/                         # Custom React hooks
│   ├── use-mobile.tsx             # Mobile detection
│   └── ...                        # Other hooks
│
├── lib/                           # Utility libraries
│   ├── supabaseAdmin.ts           # Supabase admin client
│   ├── supabaseClient.ts          # Supabase browser client
│   ├── supabaseServer.ts          # Supabase server client
│   ├── auth.ts                    # Auth utilities
│   ├── rateLimit.ts               # Rate limiting
│   ├── twilioClient.ts            # Twilio integration
│   ├── gs1-barcode.ts             # GS1 barcode generation
│   ├── invoicePdf.ts              # PDF generation
│   ├── tracking.ts                # Tracking utilities
│   ├── validations.ts             # Zod schemas
│   └── ...                        # Other utilities
│
├── types/                         # TypeScript types
│   ├── auth.ts                    # Auth types
│   ├── database.ts                # Database types
│   ├── logistics.ts               # Logistics domain types
│   └── ...                        # Other types
│
├── public/                        # Static assets
│   ├── animations/                # Lottie animations
│   └── ...                        # Images, fonts
│
└── docs/                          # Documentation
```

## Data Flow

### Server Component Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Request    │────▶│   Server     │────▶│   Supabase   │
│   (Browser)  │     │   Component  │     │   Query      │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   HTML       │
                     │   Response   │
                     └──────────────┘
```

### API Route Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Client     │────▶│   API Route  │────▶│   Validate   │
│   Request    │     │   Handler    │     │   (Zod)      │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                            ┌────────────────────┘
                            ▼
                     ┌──────────────┐     ┌──────────────┐
                     │   Supabase   │────▶│   JSON       │
                     │   Operation  │     │   Response   │
                     └──────────────┘     └──────────────┘
```

### Realtime Subscription Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Client     │────▶│   Subscribe  │────▶│   Supabase   │
│   Component  │     │   Channel    │     │   Realtime   │
└──────────────┘     └──────────────┘     └──────────────┘
       ▲                                         │
       │              ┌──────────────┐           │
       └──────────────│   WebSocket  │◀──────────┘
                      │   Message    │
                      └──────────────┘
```

## Security Architecture

### Authentication Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Login      │────▶│   Supabase   │────▶│   JWT Token  │
│   Request    │     │   Auth       │     │   Generated  │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                            ┌────────────────────┘
                            ▼
                     ┌──────────────┐     ┌──────────────┐
                     │   Cookie     │────▶│   Protected  │
                     │   Set        │     │   Access     │
                     └──────────────┘     └──────────────┘
```

### Authorization Layers

1. **Route Protection** - Middleware checks auth state
2. **API Rate Limiting** - Upstash Redis-based limits
3. **Role-Based Access** - RBAC in application logic
4. **Row-Level Security** - Supabase RLS policies

## Performance Optimizations

1. **Server Components** - Default to RSC for reduced JS bundle
2. **Streaming** - Suspense boundaries for progressive loading
3. **Image Optimization** - Next.js Image component
4. **Code Splitting** - Dynamic imports for large components
5. **Caching** - Next.js caching + Supabase query caching
6. **CDN** - Vercel Edge Network for static assets

---

*Next: [Database Schema](./03-database-schema.md)*
