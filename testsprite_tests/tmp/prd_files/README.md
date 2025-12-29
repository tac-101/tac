# TAC - Tapan Air Cargo Documentation

> **Comprehensive Technical Documentation for the TAC Logistics Platform**

## Table of Contents

1. [Project Overview](./01-project-overview.md)
2. [Architecture & Tech Stack](./02-architecture.md)
3. [Database Schema](./03-database-schema.md)
4. [API Reference](./04-api-reference.md)
5. [Authentication & Security](./05-authentication.md)
6. [Frontend Components](./06-frontend-components.md)
7. [Dashboard Modules](./07-dashboard-modules.md)
8. [Integrations](./08-integrations.md)
9. [Configuration & Environment](./09-configuration.md)
10. [Deployment Guide](./10-deployment.md)

---

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev

# Build for production
npm run build
```

## Project Summary

**TAC (Tapan Air Cargo)** is a comprehensive logistics management platform designed for cargo companies operating in India. The system handles:

- **Shipment Management** - End-to-end tracking from pickup to delivery
- **Invoice Generation** - Automated billing with GST compliance
- **Barcode/QR Tracking** - GS1-compliant SSCC-18 and GTIN-14 barcodes
- **Manifest Management** - Air cargo manifest creation and tracking
- **Inventory Control** - Real-time warehouse stock management
- **Customer Management** - CRM for shippers and consignees
- **Financial Analytics** - AR/AP tracking and reporting
- **Multi-location Support** - Imphal (IMF) and New Delhi (DEL) hubs

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.1 (App Router) |
| UI | React 19, Tailwind CSS v4, Shadcn UI |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth with RBAC |
| Realtime | Supabase Realtime subscriptions |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Monitoring | Sentry |
| Messaging | Twilio (SMS), WhatsApp Business API |
| Analytics | Vercel Analytics |

## Directory Structure

```
tac/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (external)/        # Public-facing pages
│   ├── (main)/            # Protected dashboard
│   └── api/               # API routes
├── components/            # Shared UI components
├── features/              # Feature-specific modules
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and services
├── types/                 # TypeScript definitions
└── docs/                  # Documentation (this folder)
```

## License

Proprietary - Tapan Air Cargo Private Limited

---

*Documentation Version: 1.0.0*  
*Last Updated: December 2024*
