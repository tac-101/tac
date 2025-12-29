# WORKSPACE WORKFLOWS — TAC

Workspace Workflows are **project-specific saved prompts**.  
They override Global Workflows where overlap exists.

Derived strictly from the TAC stack and constraints.

---

## `/tac-stack-lock`

**Purpose:** Enforce TAC architectural discipline.

**Authoritative Stack:**
- Next.js 16
- React 19
- Tailwind CSS v4
- Shadcn UI + Radix
- Framer Motion
- Supabase (SSR + client)
- Zustand
- Zod + React Hook Form
- Sentry + Vercel Analytics

**Cascade Must:**
- Use Shadcn/Radix primitives for UI
- Use Tailwind + CVA for styling
- Use Framer Motion for motion
- Use Zod for all validation
- Never introduce parallel libraries

---

## `/tac-ui-component`

**Purpose:** Build TAC-grade UI components.

**Cascade Must:**
1. Select an existing Shadcn/Radix primitive
2. Wrap and style only
3. Use CVA for variants
4. Ensure keyboard and focus support

**Output:**
- Component code only

---

## `/tac-form-flow`

**Purpose:** Build production-grade forms.

**Mandatory Stack:**
- `react-hook-form`
- `@hookform/resolvers/zod`
- `zod`
- Shadcn form primitives
- Sonner

**Cascade Must:**
1. Define Zod schema first
2. Bind schema to RHF
3. Handle loading, error, and success states
4. Block invalid submissions

---

## `/tac-dashboard-layout`

**Purpose:** Build or refactor dashboards.

**Rules:**
- Favor asymmetry
- Support dense data
- Avoid centered grids

**Allowed Tools:**
- `@tanstack/react-table`
- `react-resizable-panels`
- `recharts`
- `cmdk` / `kbar`

---

## `/tac-animation-pass`

**Purpose:** Apply intentional motion.

**Cascade Must:**
1. Identify the primary interaction
2. Animate only meaningful moments
3. Use Framer Motion variants
4. Respect reduced-motion preferences

---

## `/tac-supabase-integration`

**Purpose:** Implement Supabase safely.

**Cascade Must:**
1. Use `@supabase/ssr`
2. Isolate auth logic
3. Validate inputs with Zod
4. Handle session expiry
5. Never expose secrets

---

## `/tac-production-check`

**Purpose:** TAC-specific release gate.

**Cascade Must Verify:**
- Correct Shadcn usage
- Tailwind class hygiene
- Sentry instrumentation intact
- No unused dependencies
- Accessibility preserved

**Output:**
- Pass / Fail checklist

---

## WORKFLOW GOVERNANCE

- Global Workflows apply everywhere
- Workspace Workflows override Global ones
- Workflows are authoritative and deterministic
- Deviation requires explicit instruction

---

**Result:**  
Global consistency with workspace-specific precision.