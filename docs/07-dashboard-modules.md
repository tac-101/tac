# Dashboard Modules

## Overview

The TAC dashboard is organized into specialized modules, each handling a specific aspect of cargo operations. All modules are accessible from the sidebar navigation and follow consistent UI patterns.

## Module Architecture

```
/dashboard
├── /                      # Main dashboard (KPIs, overview)
├── /shipments            # Shipment management
├── /tracking             # Real-time tracking
├── /invoices             # Invoice management
│   ├── /create           # Create invoice
│   ├── /[id]             # Invoice details
│   └── /logs             # Activity logs
├── /inventory            # Inventory management
├── /customers            # Customer management
├── /warehouse            # Warehouse operations
├── /manifests            # Manifest management
├── /rates                # Rate management
├── /finance              # Financial reports
├── /analytics            # Business analytics
├── /exceptions           # Exception handling
├── /fleet                # Fleet management
├── /reports              # Report generation
├── /support              # Support tickets
├── /settings             # User settings
└── /admin                # Admin panel
```

---

## Main Dashboard

**Route:** `/dashboard`  
**File:** `app/(main)/dashboard/page.tsx`

### Features
- **OpsCommandGrid** - Key performance indicators with sparkline charts
- **ShipmentMap** - Network visualization of active shipments
- **ShipmentDiagnostics** - Health check of shipment operations
- **RecentShipments** - Latest shipment activity
- **ShipmentsDataTable** - Full shipment listing with filtering
- **AR Summary** - Accounts receivable overview

### KPIs Displayed
| Metric | Description |
|--------|-------------|
| Exceptions | Critical issues requiring attention |
| Total Shipments | All shipments in system |
| Active Shipments | In-transit shipments |
| Warehouse Capacity | Average utilization % |
| Pending Invoices | Unpaid invoice count |
| Active Customers | Customer base size |

### Data Flow
```typescript
// Server Component - fetches data at build/request time
export default async function Page() {
  const [stats, arStats, shipments] = await Promise.all([
    getDashboardStats(),
    getARStats(),
    getShipments(50),
  ]);

  return (
    <DashboardPageLayout>
      <OpsCommandGrid stats={stats} />
      <ShipmentMap />
      <ShipmentsDataTable data={shipments} />
    </DashboardPageLayout>
  );
}
```

---

## Shipments Module

**Route:** `/dashboard/shipments`  
**Files:** `app/(main)/dashboard/shipments/`, `features/shipments/`

### Features
- Create new shipments
- View shipment details
- Update shipment status
- Track progress
- Generate barcodes
- Link to invoices

### Shipment Lifecycle

```
┌─────────┐   ┌──────────┐   ┌───────────┐   ┌─────────┐
│ Pending │──▶│ Picked Up│──▶│ In Transit│──▶│ At Hub  │
└─────────┘   └──────────┘   └───────────┘   └─────────┘
                                                  │
              ┌──────────┐   ┌───────────┐        │
              │Delivered │◀──│Out for Del│◀───────┘
              └──────────┘   └───────────┘
```

### Key Components
- `ShipmentForm` - Create/edit shipment
- `ShipmentCard` - Shipment summary card
- `ShipmentTimeline` - Status history
- `ShipmentActions` - Quick actions menu

---

## Tracking Module

**Route:** `/dashboard/tracking`  
**File:** `app/(main)/dashboard/tracking/page.tsx`

### Features
- **Real-time Updates** - Supabase Realtime subscriptions
- **Live/Pause Toggle** - Control real-time feed
- **Sound Notifications** - Audio alerts for new events
- **Visual Highlighting** - Pulse animation on new scans
- **Event Timeline** - Chronological scan history

### Real-time Implementation
```typescript
useEffect(() => {
  if (!isLive) return;

  const channel = supabase
    .channel("realtime-tracking")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "scan_events",
      },
      (payload) => {
        // Add new event to list
        setEvents((prev) => [normalizeEvent(payload.new), ...prev]);
        
        // Play sound if enabled
        if (soundEnabled) {
          playNotificationSound();
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [isLive, soundEnabled]);
```

### UI States
| State | Indicator |
|-------|-----------|
| Live | Green pulse, "LIVE" badge |
| Paused | Gray, "PAUSED" badge |
| New Event | Yellow pulse (3s) |

---

## Invoices Module

**Route:** `/dashboard/invoices`  
**Files:** `app/(main)/dashboard/invoices/`, `features/invoices/`

### Features
- Invoice listing with filters
- Create new invoices
- Generate PDF
- Send via WhatsApp/SMS
- Payment recording
- Activity logs

### Invoice Workflow

```
┌────────────┐   ┌────────────┐   ┌────────────┐
│   Create   │──▶│  Generate  │──▶│   Send     │
│   Invoice  │   │    PDF     │   │  WhatsApp  │
└────────────┘   └────────────┘   └────────────┘
                                        │
              ┌────────────┐             │
              │   Record   │◀────────────┘
              │  Payment   │
              └────────────┘
```

### Invoice Status Flow
- `draft` → `pending` → `paid`
- `pending` → `overdue` (after due date)
- `pending` → `partially_paid` → `paid`

### Key Pages
| Route | Purpose |
|-------|---------|
| `/invoices` | Invoice listing |
| `/invoices/create` | New invoice form |
| `/invoices/[id]` | Invoice details |
| `/invoices/logs` | Activity history |

---

## Inventory Module

**Route:** `/dashboard/inventory`  
**File:** `app/(main)/dashboard/inventory/page.tsx`

### Features
- **Real-time Stock Levels** - Live inventory updates
- **Stock Adjustments** - Inbound/outbound transactions
- **Low Stock Alerts** - Threshold notifications
- **Location Tracking** - SKU by warehouse location
- **Audit Trail** - All adjustments logged

### Stock Status Indicators
| Status | Condition | Color |
|--------|-----------|-------|
| OK | stock > min × 1.5 | Green |
| Low | min < stock ≤ min × 1.5 | Yellow |
| Critical | stock < min | Red |

### Adjustment Types
| Type | Effect |
|------|--------|
| `inbound` | +quantity |
| `outbound` | -quantity |
| `adjustment` | Set to quantity |
| `cycle_count` | Set to quantity (audit) |

### Real-time Updates
```typescript
// Subscribe to inventory changes
const channel = supabase
  .channel("realtime-inventory")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "inventory_items" },
    (payload) => {
      // Update local state with new stock levels
      updateInventoryItem(payload.new);
    }
  )
  .subscribe();
```

---

## Customers Module

**Route:** `/dashboard/customers`  
**File:** `app/(main)/dashboard/customers/page.tsx`

### Features
- Customer listing
- Search and filter
- Create/edit customers
- View shipment history
- Invoice history
- Contact management

### Customer Data
| Field | Description |
|-------|-------------|
| Name | Company/individual name |
| Phone | Primary contact |
| Email | Email address |
| Address | Street address |
| City | City |
| GST Number | Tax registration |
| Credit Limit | Payment terms |

---

## Warehouse Module

**Route:** `/dashboard/warehouse`  
**File:** `app/(main)/dashboard/warehouse/page.tsx`

### Features
- Warehouse overview
- Capacity monitoring
- Items in storage
- Items in transit
- Zone management

### Capacity Visualization
```tsx
<div className="h-2 w-full bg-muted rounded-full overflow-hidden">
  <div
    className={cn(
      "h-full transition-all",
      capacity > 90 ? "bg-destructive" :
      capacity > 75 ? "bg-warning" : "bg-success"
    )}
    style={{ width: `${capacity}%` }}
  />
</div>
```

---

## Rates Module

**Route:** `/dashboard/rates`  
**Files:** `app/(main)/dashboard/rates/`, `features/rates/`

### Features
- Rate matrix management
- Origin-destination pricing
- Transport mode rates
- Seasonal adjustments
- Bulk import/export

### Rate Structure
| Field | Description |
|-------|-------------|
| Origin | Source city/zone |
| Destination | Target city/zone |
| Transport Mode | air, surface, express |
| Rate per Kg | Price per kilogram |
| Base Fee | Minimum charge |
| Min Weight | Minimum chargeable weight |

---

## Finance Module

**Route:** `/dashboard/finance`  
**File:** `app/(main)/dashboard/finance/page.tsx`

### Features
- AR/AP summary
- Aging analysis
- Payment tracking
- Revenue reports
- Outstanding balances

### AR Aging Buckets
| Bucket | Days |
|--------|------|
| Current | 0-30 |
| 30+ | 31-60 |
| 60+ | 61-90 |
| 90+ | 91+ |

---

## Analytics Module

**Route:** `/dashboard/analytics`  
**File:** `app/(main)/dashboard/analytics/page.tsx`

### Features
- Business KPIs
- Trend analysis
- Performance metrics
- Export reports

### Key Metrics
- Daily/weekly/monthly shipment volume
- Revenue trends
- On-time delivery rate
- Customer acquisition
- Exception rate

---

## Exceptions Module

**Route:** `/dashboard/exceptions`  
**File:** `app/(main)/dashboard/exceptions/page.tsx`

### Features
- Exception tracking
- Priority management
- Resolution workflow
- Escalation rules

### Exception Types
| Type | Description |
|------|-------------|
| Delivery Delay | Shipment behind schedule |
| Damage | Package damage reported |
| Lost | Package not located |
| Address Issue | Invalid delivery address |
| Payment | Payment-related issues |

---

## Support Module

**Route:** `/dashboard/support`  
**Files:** `app/(main)/dashboard/support/`, `features/support/`

### Features
- Ticket management
- Customer queries
- FAQ management
- Response templates

### Ticket Workflow
```
Open → In Progress → Resolved → Closed
         ↓
      Escalated
```

---

## Admin Module

**Route:** `/dashboard/admin`  
**File:** `app/(main)/dashboard/admin/page.tsx`

### Features
- User management
- Role assignment
- System configuration
- Audit logs
- Feature toggles

### Admin-Only Actions
- Create/delete users
- Change user roles
- Access all locations
- View audit logs
- System settings

---

## Navigation Structure

### Sidebar Categories

```typescript
const navigation = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: Home },
      { name: "Analytics", href: "/dashboard/analytics", icon: BarChart },
    ],
  },
  {
    title: "Operations",
    items: [
      { name: "Shipments", href: "/dashboard/shipments", icon: Package },
      { name: "Tracking", href: "/dashboard/tracking", icon: MapPin },
      { name: "Inventory", href: "/dashboard/inventory", icon: Box },
      { name: "Manifests", href: "/dashboard/manifests", icon: FileText },
    ],
  },
  {
    title: "Finance",
    items: [
      { name: "Invoices", href: "/dashboard/invoices", icon: Receipt },
      { name: "Rates", href: "/dashboard/rates", icon: DollarSign },
      { name: "Finance", href: "/dashboard/finance", icon: TrendingUp },
    ],
  },
  {
    title: "Management",
    items: [
      { name: "Customers", href: "/dashboard/customers", icon: Users },
      { name: "Warehouse", href: "/dashboard/warehouse", icon: Warehouse },
      { name: "Exceptions", href: "/dashboard/exceptions", icon: AlertTriangle },
    ],
  },
];
```

---

*Next: [Integrations](./08-integrations.md)*
