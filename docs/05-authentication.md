# Authentication & Security

## Overview

TAC implements a comprehensive security model using Supabase Auth with role-based access control (RBAC). The system supports multi-location operations with location-based data isolation.

## Authentication Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Login      │────▶│   Supabase   │────▶│   Validate   │
│   Form       │     │   Auth       │     │   Credentials│
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                            ┌────────────────────┘
                            ▼
                     ┌──────────────┐     ┌──────────────┐
                     │   Generate   │────▶│   Set HTTP   │
                     │   JWT Token  │     │   Cookie     │
                     └──────────────┘     └──────────────┘
                                                 │
                            ┌────────────────────┘
                            ▼
                     ┌──────────────┐     ┌──────────────┐
                     │   Load User  │────▶│   Redirect   │
                     │   Profile    │     │   Dashboard  │
                     └──────────────┘     └──────────────┘
```

## User Roles

### Role Hierarchy

| Role | Level | Description |
|------|-------|-------------|
| **admin** | 4 | Full system access, user management |
| **manager** | 3 | Branch management, rate control, analytics |
| **operator** | 2 | Day-to-day operations, shipment handling |
| **viewer** | 1 | Read-only dashboard access |

### Role Permissions Matrix

| Permission | Admin | Manager | Operator | Viewer |
|------------|-------|---------|----------|--------|
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| Create Shipments | ✅ | ✅ | ✅ | ❌ |
| Create Invoices | ✅ | ✅ | ✅ | ❌ |
| Delete Invoices | ✅ | ❌ | ❌ | ❌ |
| Manage Rates | ✅ | ✅ | ❌ | ❌ |
| View Analytics | ✅ | ✅ | ❌ | ✅ |
| Manage Users | ✅ | ❌ | ❌ | ❌ |
| Access All Locations | ✅ | ✅ | ❌ | ❌ |
| View Sensitive Data | ✅ | ❌ | ❌ | ❌ |
| Cross-location Shipments | ✅ | ❌ | ❌ | ❌ |

### Permission Check Implementation

```typescript
// types/auth.ts
export const ROLE_PERMISSIONS: Record<UserRole, {
  canDeleteInvoices: boolean;
  canManageRates: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canViewSensitiveData: boolean;
  canAccessAllLocations: boolean;
  canCreateCrossLocationShipments: boolean;
}> = {
  admin: {
    canDeleteInvoices: true,
    canManageRates: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canViewSensitiveData: true,
    canAccessAllLocations: true,
    canCreateCrossLocationShipments: true,
  },
  manager: {
    canDeleteInvoices: false,
    canManageRates: true,
    canManageUsers: false,
    canViewAnalytics: true,
    canViewSensitiveData: false,
    canAccessAllLocations: true,
    canCreateCrossLocationShipments: false,
  },
  operator: {
    canDeleteInvoices: false,
    canManageRates: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canViewSensitiveData: false,
    canAccessAllLocations: false,
    canCreateCrossLocationShipments: false,
  },
  viewer: {
    canDeleteInvoices: false,
    canManageRates: false,
    canManageUsers: false,
    canViewAnalytics: true,
    canViewSensitiveData: false,
    canAccessAllLocations: false,
    canCreateCrossLocationShipments: false,
  },
};

// Usage
import { hasPermission } from '@/types/auth';

if (hasPermission(user.role, 'canManageRates')) {
  // Show rate management UI
}
```

## Location-Based Access

### Locations

| Location | Code | Description |
|----------|------|-------------|
| Imphal | IMF | Manipur hub, NE India operations |
| New Delhi | DEL | NCR hub, national distribution |

### Location Isolation

Users are assigned a primary location. Data access is filtered based on:

1. **Admins** - Access all locations
2. **Managers** - Access all locations (cross-location view)
3. **Operators** - Access only their assigned location
4. **Viewers** - Access only their assigned location

```typescript
// lib/access-control.ts
export function canAccessLocation(
  userRole: UserRole,
  userLocation: Location,
  targetLocation: Location
): boolean {
  if (userRole === 'admin' || userRole === 'manager') {
    return true;
  }
  return userLocation === targetLocation;
}
```

## Authentication Implementation

### Supabase Client Setup

```typescript
// lib/supabaseClient.ts (Browser)
import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// lib/supabaseServer.ts (Server Components)
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

// lib/supabaseAdmin.ts (Server-side with service role)
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

### Login Implementation

```typescript
// app/(auth)/_components/login-page.tsx
async function handleLogin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      // Check for account lockout
      await checkAccountLockout(email);
    }
    throw error;
  }

  // Load user profile
  const { data: profile } = await supabase
    .from('users')
    .select('role, location, name')
    .eq('id', data.user.id)
    .single();

  // Redirect to dashboard
  router.push('/dashboard');
}
```

### Session Management

```typescript
// lib/auth.ts
export async function getSession() {
  const supabase = await createSupabaseServerClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    return null;
  }
  
  return session;
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  
  const supabase = await createSupabaseServerClient();
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();
    
  return user;
}
```

## Account Security

### Account Lockout

Prevents brute force attacks by locking accounts after failed attempts.

```typescript
// lib/account-lockout.ts
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

export async function checkAccountLockout(email: string): Promise<{
  locked: boolean;
  remainingAttempts: number;
  unlockTime?: Date;
}> {
  const { data } = await supabaseAdmin
    .from('login_attempts')
    .select('*')
    .eq('email', email)
    .gte('attempted_at', new Date(Date.now() - LOCKOUT_DURATION_MINUTES * 60 * 1000).toISOString());

  const failedAttempts = data?.length || 0;

  if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
    return {
      locked: true,
      remainingAttempts: 0,
      unlockTime: new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000),
    };
  }

  return {
    locked: false,
    remainingAttempts: MAX_FAILED_ATTEMPTS - failedAttempts,
  };
}
```

### Rate Limiting

API endpoints are protected with rate limiting:

```typescript
// lib/rateLimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1m'), // 10 requests per minute
  analytics: true,
});

// Usage in API route
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const { success, remaining } = await rateLimiter.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: { 'X-RateLimit-Remaining': remaining.toString() } }
    );
  }

  // Process request...
}
```

## Route Protection

### Middleware Protection

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  // Protected routes
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Auth routes (redirect if logged in)
  if (req.nextUrl.pathname.startsWith('/login')) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
};
```

### API Route Protection

```typescript
// Example protected API route
export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Check role permissions
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!hasPermission(profile?.role, 'canViewAnalytics')) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  // Process request...
}
```

## Row Level Security (RLS)

Supabase RLS policies enforce data isolation at the database level:

```sql
-- Users can only read their own profile
CREATE POLICY "users_read_own" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Location-based shipment access
CREATE POLICY "shipments_location_access" ON shipments
  FOR ALL
  USING (
    -- Admins and managers can access all
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
    OR
    -- Others can only access their location's shipments
    origin = (SELECT location FROM users WHERE id = auth.uid())
    OR
    destination = (SELECT location FROM users WHERE id = auth.uid())
  );

-- Invoice access based on creation
CREATE POLICY "invoices_creator_access" ON invoices
  FOR ALL
  USING (
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );
```

## Security Best Practices

### Environment Variables

```bash
# Never expose these in client-side code
SUPABASE_SERVICE_ROLE_KEY=xxx  # Server-only
WHATSAPP_ACCESS_TOKEN=xxx      # Server-only
TWILIO_AUTH_TOKEN=xxx          # Server-only

# Safe for client-side
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### Input Validation

All API inputs are validated using Zod:

```typescript
import { z } from 'zod';

const shipmentSchema = z.object({
  customer_id: z.string().uuid(),
  origin: z.string().min(1).max(100),
  destination: z.string().min(1).max(100),
  weight: z.number().positive().max(10000),
  pieces: z.number().int().positive().max(1000),
});

// In API route
const parsed = shipmentSchema.safeParse(await req.json());
if (!parsed.success) {
  return NextResponse.json(
    { error: 'Validation failed', details: parsed.error.flatten() },
    { status: 400 }
  );
}
```

### Audit Logging

Sensitive operations are logged:

```typescript
// lib/audit-log.ts
export async function logAuditEvent(params: {
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details?: Record<string, any>;
}) {
  await supabaseAdmin.from('audit_logs').insert({
    user_id: params.userId,
    action: params.action,
    resource: params.resource,
    resource_id: params.resourceId,
    details: params.details,
    ip_address: getClientIP(),
    timestamp: new Date().toISOString(),
  });
}

// Usage
await logAuditEvent({
  userId: user.id,
  action: 'DELETE',
  resource: 'invoice',
  resourceId: invoiceId,
  details: { reason: 'Customer request' },
});
```

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- Enforced by Supabase Auth policies

---

*Next: [Frontend Components](./06-frontend-components.md)*
