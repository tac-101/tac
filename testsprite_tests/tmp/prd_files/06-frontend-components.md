# Frontend Components

## Overview

TAC uses a component architecture built on **React 19**, **Shadcn UI**, and **Radix UI** primitives. All components follow the workspace design rules: industrial aesthetic, intentional minimalism, and strict typography.

## Component Library Structure

```
components/
├── ui/                    # Shadcn UI primitives
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── table.tsx
│   └── ...
├── icons/                 # Custom icon components
├── layout/                # Layout components
│   ├── header.tsx
│   ├── sidebar.tsx
│   └── footer.tsx
├── auth/                  # Auth-specific components
└── support/               # Support widgets
```

## UI Primitives (Shadcn UI)

### Button

```tsx
import { Button } from "@/components/ui/button";

// Variants
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Shipment Details</CardTitle>
    <CardDescription>View and manage shipment information</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    <Button>Save Changes</Button>
  </CardFooter>
</Card>
```

### Dialog

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
      <DialogDescription>
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Form Components

```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

// Input with label
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="user@example.com" />
</div>

// Select dropdown
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="pending">Pending</SelectItem>
    <SelectItem value="in_transit">In Transit</SelectItem>
    <SelectItem value="delivered">Delivered</SelectItem>
  </SelectContent>
</Select>
```

### Data Table

```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Reference</TableHead>
      <TableHead>Customer</TableHead>
      <TableHead>Status</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((row) => (
      <TableRow key={row.id}>
        <TableCell className="font-mono">{row.ref}</TableCell>
        <TableCell>{row.customer}</TableCell>
        <TableCell>
          <Badge variant={row.status}>{row.status}</Badge>
        </TableCell>
        <TableCell className="text-right">₹{row.amount}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Badge

```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="default">Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="destructive">Overdue</Badge>
<Badge variant="outline">Draft</Badge>
```

### Toast Notifications

```tsx
import { toast } from "sonner";

// Success
toast.success("Shipment created successfully");

// Error
toast.error("Failed to save changes");

// Loading
toast.loading("Processing...");

// With action
toast("Shipment created", {
  action: {
    label: "View",
    onClick: () => router.push(`/dashboard/shipments/${id}`),
  },
});
```

## Custom Components

### Motion Wrapper

Provides consistent animation patterns:

```tsx
import { MotionList, MotionItem } from "@/components/ui/motion-wrapper";

<MotionList stagger={0.1}>
  <MotionItem>First item</MotionItem>
  <MotionItem>Second item</MotionItem>
  <MotionItem>Third item</MotionItem>
</MotionList>
```

### Spotlight Card

Interactive card with spotlight hover effect:

```tsx
// From dashboard/_components/ops-command-grid.tsx
const SpotlightCard = ({ children, className, spotlightColor }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={cn("relative overflow-hidden rounded-xl border", className)}
    >
      <div
        className="pointer-events-none absolute -inset-px"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
};
```

### Dashboard Page Layout

Standard wrapper for dashboard pages:

```tsx
import DashboardPageLayout from "@/components/dashboard/layout";
import { Package } from "lucide-react";

export default function ShipmentsPage() {
  return (
    <DashboardPageLayout
      header={{
        title: "Shipments",
        description: "Manage and track all shipments",
        icon: Package,
      }}
    >
      {/* Page content */}
    </DashboardPageLayout>
  );
}
```

### Shipment Map

Network visualization component:

```tsx
import { ShipmentMap } from "@/app/(main)/dashboard/_components/shipment-map";

// Features:
// - SVG-based route visualization
// - Location nodes with shipment counts
// - Map/List view toggle
// - Real-time status indicators
// - Indian city coordinates

<ShipmentMap />
```

### OpsCommandGrid

KPI dashboard grid with sparkline charts:

```tsx
import { OpsCommandGrid } from "@/components/dashboard/ops-command-grid";

<OpsCommandGrid
  stats={{
    totalShipments: 1247,
    activeShipments: 342,
    activeCustomers: 156,
    pendingInvoices: 23,
    warehouseCapacity: 79,
    exceptionsThisWeek: 12,
    shipmentsTrend: 12.5,
    customersTrend: 8.2,
    invoicesTrend: -5.3,
    capacityTrend: -2.3,
    exceptionsTrend: 5.4,
  }}
/>
```

### Shipments Data Table

Advanced table with sorting, filtering, and drag-drop:

```tsx
import { ShipmentsDataTable } from "@/components/dashboard/shipments-data-table";

<ShipmentsDataTable
  data={shipments}
  initialFilter={searchParams?.q}
  initialStatus={searchParams?.status}
/>

// Features:
// - TanStack Table integration
// - Column visibility toggle
// - Status filtering
// - Search functionality
// - Drag-drop column reordering (DND Kit)
// - Row selection
// - Pagination
```

### Tracking HUD

Landing page tracking widget:

```tsx
import { TrackingHUD } from "@/app/(external)/_components/landing/tracking-hud";

// Features:
// - Real API integration (/api/public/track)
// - Dynamic timeline display
// - Status indicators
// - Loading/error states
// - Link to full tracking page

<TrackingHUD />
```

## Form Patterns

### React Hook Form + Zod

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const shipmentSchema = z.object({
  customer_id: z.string().uuid("Select a customer"),
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  weight: z.number().positive("Weight must be positive"),
  transport_mode: z.enum(["air", "surface", "express"]),
});

type ShipmentForm = z.infer<typeof shipmentSchema>;

export function CreateShipmentForm() {
  const form = useForm<ShipmentForm>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: {
      transport_mode: "air",
    },
  });

  const onSubmit = async (data: ShipmentForm) => {
    // Handle submission
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="origin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Origin</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* More fields... */}
        <Button type="submit">Create Shipment</Button>
      </form>
    </Form>
  );
}
```

## Icon Usage

### Lucide Icons (Primary)

```tsx
import { Package, Truck, FileText, Users, Warehouse, AlertTriangle } from "lucide-react";

<Package className="h-5 w-5" />
<Truck className="h-5 w-5 text-primary" />
```

### Tabler Icons (Secondary)

```tsx
import { IconActivity, IconAlertTriangle } from "@tabler/icons-react";

<IconActivity className="w-5 h-5" />
```

### Custom Icons

```tsx
import BoxIcon from "@/components/icons/box";
import BracketsIcon from "@/components/icons/brackets";

<BoxIcon className="h-6 w-6" />
```

## Animation Patterns

### Framer Motion

```tsx
import { motion, AnimatePresence } from "framer-motion";

// Fade in
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>

// Staggered list
<motion.ul>
  {items.map((item, i) => (
    <motion.li
      key={item.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.1 }}
    >
      {item.name}
    </motion.li>
  ))}
</motion.ul>

// Exit animation
<AnimatePresence>
  {isVisible && (
    <motion.div
      exit={{ opacity: 0, scale: 0.95 }}
    >
      Content
    </motion.div>
  )}
</AnimatePresence>
```

### CSS Animations

```css
/* Pulse indicator */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Ping effect */
.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

/* Live indicator */
<span className="relative flex h-2 w-2">
  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
</span>
```

## Responsive Design

### Breakpoints

```tsx
// Tailwind breakpoints
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
2xl: 1536px // Extra large

// Usage
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Responsive grid */}
</div>

<div className="hidden md:block">
  {/* Desktop only */}
</div>

<div className="block md:hidden">
  {/* Mobile only */}
</div>
```

### Mobile Hook

```tsx
import { useMobile } from "@/hooks/use-mobile";

function MyComponent() {
  const isMobile = useMobile();

  return isMobile ? <MobileView /> : <DesktopView />;
}
```

## Theme System

### Theme Provider

```tsx
// components/theme-provider.tsx
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
```

### Theme Toggle

```tsx
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
```

### CSS Variables

```css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
  /* ... */
}
```

---

*Next: [Dashboard Modules](./07-dashboard-modules.md)*
