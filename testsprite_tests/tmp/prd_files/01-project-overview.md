# Project Overview

## Introduction

**TAC (Tapan Air Cargo)** is a full-stack logistics management platform built to streamline cargo operations for Indian logistics companies. The platform provides end-to-end visibility into shipments, automated invoicing, real-time tracking, and comprehensive analytics.

## Business Context

### Target Users

| Role | Description | Key Actions |
|------|-------------|-------------|
| **Admin** | System administrators | Full access, user management, cross-location operations |
| **Manager** | Branch managers | Rate management, analytics, invoice approval |
| **Operator** | Warehouse/counter staff | Shipment booking, scanning, manifest creation |
| **Viewer** | Read-only access | Dashboard viewing, report access |

### Operational Locations

The system supports multi-location operations with two primary hubs:

1. **Imphal (IMF)** - Manipur hub, primary origin for NE India shipments
2. **New Delhi (DEL)** - NCR hub, national distribution center

### Core Business Processes

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Booking   │───▶│   Pickup    │───▶│  In-Transit │───▶│  Delivery   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      │                  │                  │                  │
      ▼                  ▼                  ▼                  ▼
 ┌─────────┐       ┌─────────┐       ┌─────────┐       ┌─────────┐
 │ Invoice │       │ Barcode │       │ Manifest│       │  POD    │
 │ Created │       │ Scanned │       │ Created │       │ Capture │
 └─────────┘       └─────────┘       └─────────┘       └─────────┘
```

## Key Features

### 1. Shipment Management
- **Booking** - Create shipments with origin/destination, weight, dimensions
- **Status Tracking** - Real-time status updates via barcode scanning
- **Progress Monitoring** - Visual progress indicators (0-100%)
- **ETA Calculation** - Estimated time of arrival based on transport mode

### 2. Invoice & Billing
- **Auto-generation** - Invoices created from shipment data
- **GST Compliance** - Built-in GST calculation (CGST, SGST, IGST)
- **PDF Generation** - Professional invoice PDFs with QR codes
- **Multi-channel Delivery** - WhatsApp, SMS, Email invoice delivery
- **Payment Tracking** - AR/AP management with aging analysis

### 3. Barcode & Tracking
- **GS1 Compliance** - SSCC-18, GTIN-14 standard barcodes
- **QR Code Support** - For public tracking access
- **Scan Events** - Real-time scan logging with location
- **Public Tracking** - Customer-facing tracking page

### 4. Manifest Management
- **Air Cargo Manifests** - AWB-style manifest creation
- **Batch Processing** - Group shipments for manifesting
- **Weight Reconciliation** - Declared vs actual weight tracking

### 5. Inventory Management
- **Perpetual Inventory** - Real-time stock levels
- **Stock Adjustments** - Inbound, outbound, cycle count
- **Low Stock Alerts** - Automated threshold notifications
- **Location Tracking** - SKU location within warehouse

### 6. Customer Management
- **Customer Profiles** - Shipper and consignee database
- **Contact History** - Communication logs
- **Credit Management** - Payment terms and limits

### 7. Analytics & Reporting
- **Dashboard KPIs** - Active shipments, revenue, capacity
- **Financial Reports** - AR aging, payment trends
- **Operational Metrics** - On-time delivery, exceptions

### 8. Communication
- **WhatsApp Business API** - Invoice and tracking updates
- **Twilio SMS** - Fallback notifications
- **In-app Notifications** - Real-time alerts

## System Requirements

### Minimum Requirements

| Component | Requirement |
|-----------|-------------|
| Node.js | v18.17.0 or higher |
| npm | v9.0.0 or higher |
| Browser | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| Screen | 1280x720 minimum resolution |

### Recommended

| Component | Recommendation |
|-----------|----------------|
| Node.js | v20.x LTS |
| RAM | 4GB+ for development |
| Storage | SSD with 2GB+ free space |

## Performance Targets

| Metric | Target |
|--------|--------|
| Page Load (FCP) | < 1.5s |
| Time to Interactive | < 3s |
| API Response (P95) | < 500ms |
| Uptime | 99.9% |

## Security Overview

- **Authentication** - Supabase Auth with email/password
- **Authorization** - Role-based access control (RBAC)
- **Rate Limiting** - Upstash Redis-based rate limiting
- **Data Encryption** - TLS 1.3 in transit, AES-256 at rest
- **Audit Logging** - All sensitive operations logged

## Compliance

- **GST** - Indian Goods and Services Tax compliant invoicing
- **GS1** - International barcode standards
- **Data Protection** - User data handling per IT Act 2000

---

*Next: [Architecture & Tech Stack](./02-architecture.md)*
