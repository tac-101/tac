# API Reference

## Overview

TAC exposes RESTful API endpoints via Next.js API Routes. All endpoints are located under `/api/` and follow standard HTTP conventions.

## Base URL

```
Development: http://localhost:3000/api
Production:  https://your-domain.com/api
```

## Authentication

Most endpoints require authentication via Supabase Auth. Include the session cookie or Bearer token:

```http
Authorization: Bearer <access_token>
```

## Rate Limiting

API endpoints are rate-limited using Upstash Redis:

| Endpoint Type | Limit |
|---------------|-------|
| Public | 10 requests/minute |
| Authenticated | 60 requests/minute |
| Admin | 120 requests/minute |

---

## Authentication Endpoints

### GET /api/auth/session

Get current user session.

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "operator"
  },
  "session": { ... }
}
```

### GET /api/auth/getCurrentUser

Get authenticated user profile.

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "operator",
  "location": "imphal"
}
```

### GET /api/auth/protected

Test protected endpoint access.

**Response:**
```json
{
  "message": "Authenticated",
  "user": { ... }
}
```

---

## Shipment Endpoints

### GET /api/shipments/[id]/eta

Get shipment ETA and tracking details.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `id` | uuid | Shipment ID |

**Response:**
```json
{
  "shipment": {
    "id": "uuid",
    "shipment_ref": "SHP-IMF-2512-0001",
    "origin": "Imphal",
    "destination": "New Delhi",
    "status": "in_transit",
    "progress": 65,
    "eta": "2024-12-30T14:00:00Z",
    "transport_mode": "air"
  }
}
```

### GET /api/shipments/protected

Get shipments for authenticated user's location.

**Query Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `status` | string | Filter by status |
| `limit` | number | Max results (default: 50) |

**Response:**
```json
{
  "shipments": [
    {
      "id": "uuid",
      "shipment_ref": "SHP-IMF-2512-0001",
      "customer_name": "ABC Corp",
      "origin": "Imphal",
      "destination": "New Delhi",
      "status": "in_transit",
      "weight": 25.5,
      "created_at": "2024-12-28T10:00:00Z"
    }
  ]
}
```

---

## Invoice Endpoints

### GET /api/invoices

List invoices with filtering.

**Query Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `status` | string | pending, paid, overdue |
| `customer_id` | uuid | Filter by customer |
| `from` | date | Start date |
| `to` | date | End date |
| `limit` | number | Max results |

**Response:**
```json
{
  "invoices": [
    {
      "id": "uuid",
      "invoice_ref": "INV-IMF-2512-0001",
      "customer_name": "ABC Corp",
      "amount": 5000,
      "status": "pending",
      "due_date": "2024-12-31"
    }
  ],
  "total": 150
}
```

### POST /api/invoices/create

Create a new invoice.

**Request Body:**
```json
{
  "customer_id": "uuid",
  "shipment_id": "uuid",
  "freight_amount": 3000,
  "pickup_charge": 200,
  "packing_charge": 100,
  "gst_percent": 18,
  "payment_mode": "credit",
  "due_date": "2024-12-31",
  "notes": "Fragile cargo"
}
```

**Response:**
```json
{
  "invoice": {
    "id": "uuid",
    "invoice_ref": "INV-IMF-2512-0042",
    "amount": 3894,
    "status": "pending"
  }
}
```

### POST /api/invoices/generate

Generate invoice PDF.

**Request Body:**
```json
{
  "invoiceId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "pdfUrl": "https://storage.supabase.co/invoices/INV-2512-0042.pdf"
}
```

### GET /api/invoices/download

Download invoice PDF.

**Query Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `id` | uuid | Invoice ID |

**Response:** PDF file stream

### POST /api/invoices/[invoiceId]/send-whatsapp

Send invoice via WhatsApp.

**Response:**
```json
{
  "success": true,
  "messageId": "wamid.xxx",
  "to": "+919876543210"
}
```

### GET /api/invoices/logs

Get invoice activity logs.

**Response:**
```json
{
  "logs": [
    {
      "id": "uuid",
      "invoice_ref": "INV-2512-0042",
      "action": "whatsapp_sent",
      "status": "delivered",
      "timestamp": "2024-12-28T15:30:00Z"
    }
  ]
}
```

---

## Barcode Endpoints

### POST /api/barcodes/generate

Generate a standard barcode.

**Request Body:**
```json
{
  "barcodeNumber": "TG-PKG-20241228-ABC123",
  "shipmentId": "uuid"
}
```

**Response:**
```json
{
  "barcode": {
    "id": "uuid",
    "barcode_number": "TG-PKG-20241228-ABC123",
    "shipment_id": "uuid",
    "status": "pending"
  }
}
```

### POST /api/barcodes/gs1

Generate GS1-compliant barcodes (SSCC, GTIN).

**Request Body:**
```json
{
  "type": "SSCC",
  "companyPrefix": "0012345",
  "quantity": 5,
  "shipmentId": "uuid"
}
```

**Response:**
```json
{
  "barcodes": [
    {
      "barcode": "001234500000000018",
      "type": "SSCC",
      "humanReadable": "(00) 001234500000000018",
      "gs1ElementString": "00001234500000000018",
      "checkDigit": 8
    }
  ],
  "count": 5
}
```

### GET /api/barcodes/gs1?validate=<barcode>

Validate a GS1 barcode.

**Response:**
```json
{
  "valid": true,
  "type": "SSCC-18",
  "error": null
}
```

---

## Scan Endpoints

### POST /api/scans

Record a package scan event.

**Request Body:**
```json
{
  "barcode": "TG-PKG-20241228-ABC123",
  "scanType": "in_transit",
  "location": "DEL Hub",
  "operatorId": "uuid"
}
```

**Response:**
```json
{
  "scan": {
    "id": "uuid",
    "barcode_id": "uuid",
    "previous_status": "pending",
    "new_status": "in_transit",
    "location": "DEL Hub",
    "created_at": "2024-12-28T16:00:00Z"
  },
  "barcode": {
    "id": "uuid",
    "barcode_number": "TG-PKG-20241228-ABC123",
    "status": "in_transit"
  }
}
```

---

## Inventory Endpoints

### GET /api/inventory

List inventory items.

**Query Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `location` | string | Filter by warehouse |
| `lowStock` | boolean | Show low stock only |

**Response:**
```json
{
  "items": [
    {
      "sku": "PKG-BOX-MEDIUM",
      "description": "Medium Packing Box",
      "location": "IMF-WH1",
      "current_stock": 150,
      "min_stock": 50,
      "last_updated": "2024-12-28T10:00:00Z"
    }
  ]
}
```

### POST /api/inventory

Adjust inventory stock.

**Request Body:**
```json
{
  "sku": "PKG-BOX-MEDIUM",
  "adjustmentType": "inbound",
  "quantity": 100,
  "location": "IMF-WH1",
  "reason": "Stock replenishment"
}
```

**Response:**
```json
{
  "item": {
    "sku": "PKG-BOX-MEDIUM",
    "current_stock": 250
  },
  "adjustment": {
    "type": "inbound",
    "previousStock": 150,
    "newStock": 250,
    "change": 100
  }
}
```

---

## Manifest Endpoints

### GET /api/manifests

List manifests.

**Query Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `status` | string | draft, finalized, dispatched |
| `date` | date | Manifest date |

**Response:**
```json
{
  "manifests": [
    {
      "id": "uuid",
      "manifest_ref": "MAN-IMF-2512-0001",
      "origin_hub": "IMF",
      "destination": "DEL",
      "total_pieces": 45,
      "total_weight": 250.5,
      "status": "finalized"
    }
  ]
}
```

### POST /api/manifests

Create or update manifest.

**Request Body:**
```json
{
  "origin_hub": "IMF",
  "destination": "DEL",
  "airline_code": "6E",
  "flight_number": "6E2341",
  "manifest_date": "2024-12-28",
  "items": [
    { "shipment_id": "uuid", "weight": 25.5 }
  ]
}
```

---

## Customer Endpoints

### POST /api/customers/update

Update customer details.

**Request Body:**
```json
{
  "id": "uuid",
  "name": "ABC Corporation",
  "phone": "+919876543210",
  "email": "billing@abc.com",
  "address": "123 Main Street",
  "city": "New Delhi",
  "gst_number": "07AAACB1234A1Z5"
}
```

---

## Finance Endpoints

### GET /api/finance/ar

Get Accounts Receivable summary.

**Response:**
```json
{
  "summary": {
    "totalOutstanding": 1250000,
    "current": 500000,
    "overdue30": 350000,
    "overdue60": 250000,
    "overdue90": 150000
  },
  "aging": [
    {
      "customer": "ABC Corp",
      "total": 75000,
      "current": 50000,
      "overdue": 25000
    }
  ]
}
```

### POST /api/payments

Record a payment.

**Request Body:**
```json
{
  "invoice_id": "uuid",
  "amount": 5000,
  "payment_mode": "upi",
  "reference": "UPI123456789"
}
```

---

## Public Endpoints

### POST /api/public/track

Public shipment tracking (no auth required).

**Request Body:**
```json
{
  "query": "SHP-IMF-2512-0001"
}
```

**Response:**
```json
{
  "found": true,
  "shipment": {
    "shipment_ref": "SHP-IMF-2512-0001",
    "origin": "Imphal",
    "destination": "New Delhi",
    "status": "in_transit",
    "progress": 65,
    "eta": "2024-12-30T14:00:00Z"
  },
  "timeline": [
    {
      "status": "booked",
      "location": "Imphal",
      "timestamp": "2024-12-28T10:00:00Z"
    },
    {
      "status": "picked_up",
      "location": "Imphal Hub",
      "timestamp": "2024-12-28T12:00:00Z"
    }
  ]
}
```

### GET /api/public/track?q=<query>

Alternative GET method for tracking.

### POST /api/public/support

Submit support request (public).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "subject": "Delivery Inquiry",
  "message": "When will my package arrive?",
  "shipment_ref": "SHP-IMF-2512-0001"
}
```

---

## WhatsApp Endpoints

### POST /api/send-whatsapp

Send WhatsApp message for invoice.

**Request Body:**
```json
{
  "invoiceId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "WhatsApp message sent",
  "messageId": "wamid.xxx",
  "to": "+919876543210"
}
```

### POST /api/trigger-whatsapp-job

Trigger bulk WhatsApp sending job.

---

## Search Endpoint

### GET /api/search

Global search across entities.

**Query Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `q` | string | Search query |
| `type` | string | shipment, invoice, customer |

**Response:**
```json
{
  "results": [
    {
      "type": "shipment",
      "id": "uuid",
      "title": "SHP-IMF-2512-0001",
      "subtitle": "Imphal → New Delhi",
      "status": "in_transit"
    }
  ]
}
```

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

---

*Next: [Authentication & Security](./05-authentication.md)*
