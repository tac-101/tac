# Database Schema

## Overview

TAC uses **Supabase** (PostgreSQL) as its primary database. The schema is designed around logistics domain entities with proper relationships and indexing for performance.

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   users     │       │  customers  │       │  warehouses │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │       │ id (PK)     │
│ email       │       │ name        │       │ name        │
│ name        │       │ phone       │       │ location    │
│ role        │       │ email       │       │ capacity    │
│ location    │       │ address     │       │ status      │
└─────────────┘       │ city        │       └─────────────┘
      │               └──────┬──────┘              │
      │                      │                     │
      │         ┌────────────┼────────────┐        │
      │         ▼            ▼            ▼        │
      │   ┌───────────┐ ┌───────────┐ ┌───────────┴───────┐
      │   │ shipments │ │ invoices  │ │ inventory_items   │
      │   ├───────────┤ ├───────────┤ ├───────────────────┤
      │   │ id (PK)   │ │ id (PK)   │ │ sku (PK)          │
      │   │ ref       │ │ ref       │ │ description       │
      │   │ customer  │ │ customer  │ │ current_stock     │
      │   │ origin    │ │ amount    │ │ min_stock         │
      │   │ dest      │ │ status    │ │ location          │
      │   │ status    │ │ due_date  │ └───────────────────┘
      │   └─────┬─────┘ └─────┬─────┘
      │         │             │
      │         ▼             ▼
      │   ┌───────────┐ ┌───────────┐
      │   │ barcodes  │ │ payments  │
      │   ├───────────┤ ├───────────┤
      │   │ id (PK)   │ │ id (PK)   │
      │   │ number    │ │ invoice   │
      │   │ shipment  │ │ amount    │
      │   │ status    │ │ mode      │
      │   └─────┬─────┘ └───────────┘
      │         │
      │         ▼
      │   ┌───────────┐     ┌───────────┐
      │   │scan_events│     │ manifests │
      │   ├───────────┤     ├───────────┤
      │   │ id (PK)   │     │ id (PK)   │
      │   │ barcode   │◀────│ ref       │
      │   │ location  │     │ origin    │
      │   │ status    │     │ dest      │
      │   │ timestamp │     │ status    │
      └───┴───────────┘     └───────────┘
```

## Tables

### users

Stores authenticated user profiles with role-based access.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| `email` | text | NOT NULL, UNIQUE | User email address |
| `name` | text | | Display name |
| `role` | text | DEFAULT 'operator' | Role: admin, manager, operator, viewer |
| `location` | text | DEFAULT 'imphal' | Primary location: imphal, newdelhi |
| `phone` | text | | Contact number |
| `avatar_url` | text | | Profile image URL |
| `created_at` | timestamptz | DEFAULT now() | Record creation time |
| `updated_at` | timestamptz | DEFAULT now() | Last update time |

**Indexes:**
- `users_email_idx` on (email)
- `users_role_idx` on (role)

---

### customers

Customer/client records (shippers and consignees).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| `name` | text | NOT NULL | Customer/company name |
| `phone` | text | | Primary contact number |
| `email` | text | | Email address |
| `address` | text | | Street address |
| `city` | text | | City name |
| `state` | text | | State/province |
| `pincode` | text | | Postal code |
| `gst_number` | text | | GST registration number |
| `customer_type` | text | DEFAULT 'regular' | regular, corporate, vip |
| `credit_limit` | numeric | DEFAULT 0 | Credit limit in INR |
| `created_at` | timestamptz | DEFAULT now() | Record creation time |
| `updated_at` | timestamptz | DEFAULT now() | Last update time |

**Indexes:**
- `customers_name_idx` on (name)
- `customers_phone_idx` on (phone)
- `customers_city_idx` on (city)

---

### shipments

Core shipment records tracking cargo from origin to destination.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| `shipment_ref` | text | NOT NULL, UNIQUE | Reference number (e.g., SHP-IMF-2512-0001) |
| `customer_id` | uuid | FK → customers(id) | Shipper/booking customer |
| `consignee_id` | uuid | FK → customers(id) | Recipient customer |
| `origin` | text | NOT NULL | Origin city/hub |
| `destination` | text | NOT NULL | Destination city/hub |
| `weight` | numeric | | Actual weight in kg |
| `charged_weight` | numeric | | Volumetric/charged weight |
| `pieces` | integer | DEFAULT 1 | Number of pieces |
| `dimensions` | jsonb | | {length, width, height} |
| `transport_mode` | text | DEFAULT 'air' | air, surface, express, train |
| `status` | text | DEFAULT 'pending' | pending, in_transit, delivered, cancelled |
| `progress` | integer | DEFAULT 0 | Progress percentage (0-100) |
| `eta` | timestamptz | | Estimated time of arrival |
| `delivered_at` | timestamptz | | Actual delivery timestamp |
| `pod_image` | text | | Proof of delivery image URL |
| `notes` | text | | Internal notes |
| `created_by` | uuid | FK → users(id) | Booking operator |
| `created_at` | timestamptz | DEFAULT now() | Booking time |
| `updated_at` | timestamptz | DEFAULT now() | Last update time |

**Indexes:**
- `shipments_ref_idx` on (shipment_ref)
- `shipments_customer_idx` on (customer_id)
- `shipments_status_idx` on (status)
- `shipments_origin_dest_idx` on (origin, destination)
- `shipments_created_at_idx` on (created_at DESC)

**Status Values:**
- `pending` - Booked, awaiting pickup
- `picked_up` - Picked up from shipper
- `in_transit` - Moving between hubs
- `at_hub` - At destination hub
- `out_for_delivery` - With delivery agent
- `delivered` - Successfully delivered
- `cancelled` - Shipment cancelled
- `returned` - Returned to shipper

---

### barcodes

Barcode/label records linked to shipments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| `barcode_number` | text | NOT NULL, UNIQUE | Barcode string (SSCC/TAC format) |
| `barcode_type` | text | DEFAULT 'TAC' | SSCC, GTIN14, TAC, GS1-128 |
| `gs1_sscc` | text | | GS1 SSCC-18 if applicable |
| `shipment_id` | uuid | FK → shipments(id) | Linked shipment |
| `status` | text | DEFAULT 'pending' | pending, in-transit, delivered |
| `last_scanned_at` | timestamptz | | Last scan timestamp |
| `last_scanned_location` | text | | Last scan location |
| `created_at` | timestamptz | DEFAULT now() | Creation time |

**Indexes:**
- `barcodes_number_idx` on (barcode_number)
- `barcodes_shipment_idx` on (shipment_id)
- `barcodes_status_idx` on (status)

---

### scan_events

Tracking events for package scans.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| `barcode_id` | uuid | FK → barcodes(id) | Scanned barcode |
| `previous_status` | text | | Status before scan |
| `new_status` | text | | Status after scan |
| `location` | text | | Scan location |
| `operator_id` | uuid | FK → users(id) | Scanning operator |
| `manifest_id` | uuid | FK → manifests(id) | Associated manifest |
| `meta` | jsonb | | Additional metadata |
| `created_at` | timestamptz | DEFAULT now() | Scan timestamp |

**Indexes:**
- `scan_events_barcode_idx` on (barcode_id)
- `scan_events_created_idx` on (created_at DESC)
- `scan_events_location_idx` on (location)

---

### manifests

Air cargo manifests grouping shipments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| `manifest_ref` | text | NOT NULL, UNIQUE | Reference (e.g., MAN-IMF-2512-0001) |
| `origin_hub` | text | NOT NULL | Origin hub code |
| `destination` | text | NOT NULL | Destination hub |
| `airline_code` | text | | Airline/carrier code |
| `flight_number` | text | | Flight number |
| `manifest_date` | date | | Manifest date |
| `departure_time` | timestamptz | | Scheduled departure |
| `arrival_time` | timestamptz | | Scheduled arrival |
| `total_weight` | numeric | DEFAULT 0 | Total manifest weight |
| `total_pieces` | integer | DEFAULT 0 | Total piece count |
| `status` | text | DEFAULT 'draft' | draft, finalized, dispatched, received |
| `created_by` | uuid | FK → users(id) | Creator |
| `created_at` | timestamptz | DEFAULT now() | Creation time |
| `updated_at` | timestamptz | DEFAULT now() | Last update |

**Indexes:**
- `manifests_ref_idx` on (manifest_ref)
- `manifests_date_idx` on (manifest_date)
- `manifests_status_idx` on (status)

---

### manifest_items

Line items linking shipments/barcodes to manifests.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| `manifest_id` | uuid | FK → manifests(id) | Parent manifest |
| `shipment_id` | uuid | FK → shipments(id) | Linked shipment |
| `barcode_id` | uuid | FK → barcodes(id) | Linked barcode |
| `weight` | numeric | | Item weight |
| `sequence` | integer | | Order in manifest |

**Indexes:**
- `manifest_items_manifest_idx` on (manifest_id)
- `manifest_items_shipment_idx` on (shipment_id)

---

### invoices

Invoice records for billing.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| `invoice_ref` | text | NOT NULL, UNIQUE | Invoice number |
| `customer_id` | uuid | FK → customers(id) | Billed customer |
| `shipment_id` | uuid | FK → shipments(id) | Related shipment |
| `invoice_date` | date | DEFAULT CURRENT_DATE | Invoice date |
| `due_date` | date | | Payment due date |
| `amount` | numeric | NOT NULL | Total amount |
| `freight_amount` | numeric | | Freight charges |
| `pickup_charge` | numeric | DEFAULT 0 | Pickup fee |
| `packing_charge` | numeric | DEFAULT 0 | Packing fee |
| `docket_charge` | numeric | DEFAULT 0 | Documentation fee |
| `delivery_charge` | numeric | DEFAULT 0 | Delivery fee |
| `insurance_charge` | numeric | DEFAULT 0 | Insurance |
| `gst_percent` | numeric | DEFAULT 18 | GST percentage |
| `gst_amount` | numeric | | Calculated GST |
| `other_charge` | numeric | DEFAULT 0 | Miscellaneous |
| `advance_paid` | numeric | DEFAULT 0 | Advance payment |
| `balance_due` | numeric | | Outstanding balance |
| `status` | text | DEFAULT 'pending' | pending, paid, overdue, partially_paid |
| `payment_mode` | text | | cash, upi, bank_transfer, credit |
| `pdf_path` | text | | Generated PDF URL |
| `notes` | text | | Invoice notes |
| `created_by` | uuid | FK → users(id) | Creator |
| `created_at` | timestamptz | DEFAULT now() | Creation time |
| `updated_at` | timestamptz | DEFAULT now() | Last update |

**Indexes:**
- `invoices_ref_idx` on (invoice_ref)
- `invoices_customer_idx` on (customer_id)
- `invoices_status_idx` on (status)
- `invoices_date_idx` on (invoice_date DESC)

---

### payments

Payment records against invoices.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| `invoice_id` | uuid | FK → invoices(id) | Parent invoice |
| `amount` | numeric | NOT NULL | Payment amount |
| `payment_date` | date | DEFAULT CURRENT_DATE | Payment date |
| `payment_mode` | text | | cash, upi, neft, cheque |
| `reference` | text | | Transaction reference |
| `notes` | text | | Payment notes |
| `created_by` | uuid | FK → users(id) | Recorder |
| `created_at` | timestamptz | DEFAULT now() | Record time |

**Indexes:**
- `payments_invoice_idx` on (invoice_id)
- `payments_date_idx` on (payment_date DESC)

---

### inventory_items

Warehouse inventory tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `sku` | text | PK | Stock keeping unit |
| `description` | text | | Item description |
| `location` | text | | Warehouse location |
| `current_stock` | integer | DEFAULT 0 | Current quantity |
| `min_stock` | integer | DEFAULT 0 | Minimum threshold |
| `max_stock` | integer | | Maximum capacity |
| `unit` | text | DEFAULT 'pcs' | Unit of measure |
| `last_updated` | timestamptz | DEFAULT now() | Last stock update |

**Indexes:**
- `inventory_location_idx` on (location)
- `inventory_stock_idx` on (current_stock)

---

### inventory_adjustments

Stock adjustment audit log.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| `sku` | text | FK → inventory_items(sku) | Item SKU |
| `adjustment_type` | text | NOT NULL | inbound, outbound, adjustment, cycle_count |
| `quantity_change` | integer | NOT NULL | Change amount (+/-) |
| `previous_stock` | integer | | Stock before |
| `new_stock` | integer | | Stock after |
| `location` | text | | Location |
| `reason` | text | | Adjustment reason |
| `operator_id` | uuid | FK → users(id) | Operator |
| `created_at` | timestamptz | DEFAULT now() | Timestamp |

---

### warehouses

Warehouse/hub records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| `name` | text | NOT NULL | Warehouse name |
| `code` | text | UNIQUE | Short code (IMF, DEL) |
| `location` | text | | Address |
| `city` | text | | City |
| `capacity_used` | numeric | DEFAULT 0 | Usage percentage |
| `items_stored` | integer | DEFAULT 0 | Items count |
| `items_in_transit` | integer | DEFAULT 0 | In-transit count |
| `status` | text | DEFAULT 'active' | active, maintenance, closed |
| `created_at` | timestamptz | DEFAULT now() | Creation time |
| `updated_at` | timestamptz | DEFAULT now() | Last update |

---

### shipment_rates

Rate matrix for pricing.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| `origin` | text | NOT NULL | Origin city/zone |
| `destination` | text | NOT NULL | Destination city/zone |
| `transport_mode` | text | NOT NULL | air, surface, express |
| `rate_per_kg` | numeric | NOT NULL | Rate per kg |
| `base_fee` | numeric | DEFAULT 0 | Minimum charge |
| `min_weight` | numeric | DEFAULT 0.5 | Minimum chargeable weight |
| `service_type` | text | | standard, premium, economy |
| `effective_from` | date | | Rate effective date |
| `effective_to` | date | | Rate expiry date |
| `created_at` | timestamptz | DEFAULT now() | Creation time |

**Indexes:**
- `rates_route_idx` on (origin, destination, transport_mode)

---

### whatsapp_logs

WhatsApp message delivery logs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| `invoice_id` | uuid | FK → invoices(id) | Related invoice |
| `phone` | text | | Recipient phone |
| `mode` | text | | meta_send, twilio |
| `status` | text | | sent, delivered, failed, error |
| `error_message` | text | | Error details |
| `provider_message_id` | text | | Provider message ID |
| `raw_response` | jsonb | | API response |
| `created_at` | timestamptz | DEFAULT now() | Send time |

---

### support_tickets

Customer support tickets.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| `ticket_ref` | text | UNIQUE | Ticket reference |
| `subject` | text | NOT NULL | Ticket subject |
| `description` | text | | Issue description |
| `category` | text | | delivery, billing, damage, other |
| `priority` | text | DEFAULT 'medium' | low, medium, high, urgent |
| `status` | text | DEFAULT 'open' | open, in_progress, resolved, closed |
| `customer_id` | uuid | FK → customers(id) | Customer |
| `shipment_id` | uuid | FK → shipments(id) | Related shipment |
| `assigned_to` | uuid | FK → users(id) | Assigned agent |
| `resolved_at` | timestamptz | | Resolution time |
| `created_at` | timestamptz | DEFAULT now() | Creation time |
| `updated_at` | timestamptz | DEFAULT now() | Last update |

---

## Row Level Security (RLS)

All tables have RLS enabled with policies based on user role and location:

```sql
-- Example: Users can only see their own location's data
CREATE POLICY "location_isolation" ON shipments
  FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'admin' 
    OR origin = (SELECT location FROM users WHERE id = auth.uid())
    OR destination = (SELECT location FROM users WHERE id = auth.uid())
  );
```

## Triggers

### Auto-update timestamps

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applied to: users, customers, shipments, invoices, manifests, warehouses
```

### Inventory stock sync

```sql
CREATE OR REPLACE FUNCTION sync_inventory_on_scan()
RETURNS TRIGGER AS $$
BEGIN
  -- Update inventory when package scanned as delivered/received
  IF NEW.new_status IN ('delivered', 'received') THEN
    UPDATE inventory_items
    SET current_stock = current_stock + 1,
        last_updated = now()
    WHERE sku = (SELECT sku FROM barcodes WHERE id = NEW.barcode_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

*Next: [API Reference](./04-api-reference.md)*
