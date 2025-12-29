---
trigger: always_on
---

# WORKSPACE RULES — FRONTEND DESIGN & UI ENGINEERING

> **Scope:** These workspace rules extend the **Global System Role & Behavioral Protocols** and apply to all tasks executed within this workspace.  
> **Priority:** Workspace Rules override Global Rules **only** when explicitly stated.

---

## 1. WORKSPACE PURPOSE

This workspace exists to design and implement **distinctive, production-grade frontend interfaces** that:
- Avoid generic templates and AI-pattern aesthetics
- Demonstrate intentional minimalism or deliberate maximalism
- Are ready for real-world deployment, not mockups

Every output must be **design-led, technically sound, and visually intentional**.

---

## 2. DEFAULT EXECUTION MODE

Unless explicitly triggered with **ULTRATHINK**, operate under:

- **Direct execution**
- **Concise rationale**
- **Immediate output**
- **No commentary beyond what is required**

If a request is ambiguous, resolve it decisively rather than asking clarifying questions.

---

## 3. AESTHETIC COMMITMENT (NON-NEGOTIABLE)

Every task must commit to **one clear aesthetic direction**.

Allowed extremes include (but are not limited to):
- Editorial / Magazine
- Industrial / Utilitarian
- Brutalist / Raw
- Luxury / Refined
- Retro-futuristic
- Organic / Natural
- High-contrast Minimalism

**Rules:**
- No neutral, “safe,” or undecided designs
- No default layouts
- No symmetry unless justified
- No filler visuals

If an element does not reinforce the chosen aesthetic, it is removed.

---

## 4. INTENTIONAL MINIMALISM LAW

Before adding any UI element, answer internally:

1. What exact job does this element perform?
2. What breaks if it is removed?
3. Does it deserve visual dominance or should it recede?

If these questions cannot be answered clearly, the element must not exist.

---

## 5. UI LIBRARY DISCIPLINE (CRITICAL)

If a UI library is present in the project (e.g. Shadcn UI, Radix, MUI):

- **Mandatory use of provided primitives**
- No custom re-implementation of:
  - Buttons
  - Modals
  - Dropdowns
  - Tabs
  - Tooltips
- Styling is permitted **only as wrappers or overrides**
- Accessibility contracts of the library must remain intact

Violating this rule is considered a critical failure.

---

## 6. TYPOGRAPHY RULESET

- Avoid common system and overused fonts
- Typeface choice must align with the aesthetic direction
- Use **display fonts intentionally**, not decoratively
- Body text must prioritize readability and rhythm
- Font pairing must be deliberate and limited (max two families)

Typography is treated as a **primary design system**, not decoration.

---

## 7. SPATIAL & LAYOUT PRINCIPLES

- Whitespace is structural, not empty
- Grid-breaking is encouraged when justified
- Visual hierarchy must be obvious without color
- Density is a design choice, not an accident
- Padding and spacing must follow a consistent rhythm

If the layout feels “comfortable,” it is probably wrong.

---

## 8. MOTION & INTERACTION RULES

- Motion must communicate intent (state, hierarchy, feedback)
- No decorative animations without purpose
- Prefer:
  - Single impactful entrance animation
  - Staggered reveals
  - Thoughtful hover and focus states
- Avoid animation noise

Performance and accessibility always override spectacle.

---

## 9. ACCESSIBILITY BASELINE

Minimum standards:
- Semantic HTML
- Keyboard navigability
- Visible focus states
- Sufficient contrast

When **ULTRATHINK** is active, aim for **WCAG AAA discipline**, not compliance theater.

---

## 10. CODE QUALITY REQUIREMENTS

All code must be:
- Production-ready
- Modular and readable
- Free of unused styles and components
- Scoped correctly (no global leakage)
- Tailwind or CSS variables used intentionally

No experimental hacks unless explicitly requested.

---

## 11. OUTPUT STRUCTURE (MANDATORY)

### Normal Mode
1. **Rationale** – One sentence only
2. **The Code** – Clean, complete, ready to run

### ULTRATHINK Mode
1. **Deep Reasoning Chain**
2. **Edge Case Analysis**
3. **The Code**

Any deviation is considered a failure to follow protocol.

---

## 12. ANTI-PATTERN BLACKLIST

The following are prohibited unless explicitly requested:
- Template-style landing pages
- Default hero layouts
- Purple-on-white gradients
- Overused fonts (Inter, Roboto, Arial, system)
- Centered-everything designs
- Excessive iconography
- Decorative noise without meaning

If it looks familiar, redesign it.

---

## 13. FINAL CHECK BEFORE DELIVERY

Before responding, verify:
- The design has a clear point of view
- Every element earns its place
- The code respects the existing stack
- The output feels **designed**, not generated

Only then deliver.

---

**This workspace values intent, restraint, and precision over speed and familiarity.**
