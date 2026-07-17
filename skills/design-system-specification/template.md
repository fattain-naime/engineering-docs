---
title: Design System Specification
skill: design-system-specification
status: draft
owner_reviewed: false
last_updated: 2026-07-17
depends_on: []
supersedes: ""
---

# Design System Specification

**Product Name:** [Product / Brand / Website Name]
**Document ID:** DESIGN-[IDENTIFIER]-[VERSION]
**Status:** `Draft` | `In Review` | `Approved`
**Version:** v1.0.0
**Date:** YYYY-MM-DD
**Author(s):** [Name, UI/UX Designer / Frontend Engineer]
**Reviewers:** [Name, Role]

---

## 1. Design System Overview

### 1.1 Brand Identity & Personality
[Describe the brand personality in 3-4 keywords. Example: Secure, professional, modern, developer-centric. Write 2-3 sentences explaining the visual goal of the design.]

### 1.2 Design Principles
- **Atomic Hierarchy**: Styles flow from raw tokens (atoms) to compound interactive elements (molecules) and full sections (organisms).
- **8px Grid Rhythm**: Margins, paddings, and element bounds align strictly to multiples of 8px to ensure mathematical balance.
- **Dark Mode First-Class**: All color tokens are designed with semantic dark/light pairs. No raw hardcoded values.
- **Accessibility by Default**: Every contrast ratio targets WCAG 2.2 Level AA compliance, and keyboard focus states are non-optional.

---

## 2. Design Token Architecture

### 2.1 Token Layer Model
> Document the three-layer token hierarchy. Every color, spacing, and typography value must flow through this structure.

| Layer | Purpose | Examples |
|:---|:---|:---|
| **Primitive** | Raw values, no semantic meaning | `--blue-500: #3B82F6`, `--gray-900: #111827` |
| **Semantic** | Mapped to purpose, changes per theme | `--color-text-primary: var(--gray-900)` |
| **Component** | Component-specific overrides | `--button-bg: var(--color-bg-interactive)` |

### 2.2 Theming Architecture
[Document how themes switch: CSS class toggle on `<html>`, data attribute, or media query. Define which tokens change between themes.]

---

## 3. Color Palette

### 3.1 Brand Colors
> Use HSL or hex values. Every brand color should have a defined semantic mapping for both light and dark modes. Contrast ratios verified for text-bearing tokens.

| Token | Light Mode Value | Dark Mode Value | Contrast Level | Semantic Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `--op-brand-primary` | [e.g., #102963] | [e.g., #F0F4FF] | Pass (AA) | Primary headings, logo brand |
| `--op-brand-accent` | [e.g., #0F97ED] | [e.g., #38BDF8] | Pass (AA) | CTAs, active links, focus rings |
| `--op-surface-bg` | [e.g., #F4F7FB] | [e.g., #0D1626] | N/A | General page background |
| `--op-surface-card` | [e.g., #FFFFFF] | [e.g., #141F38] | N/A | Cards, containers, modals |
| `--op-border` | [e.g., #DDE4EE] | [e.g., #1E2E4A] | N/A | Dividers, element boundaries |
| `--op-text-body` | [e.g., #334155] | [e.g., #A8B8D8] | Pass (AA) | Paragraphs, standard text |
| `--op-text-muted` | [e.g., #6B7EA0] | [e.g., #6B7EA0] | Pass (AA) | Subtext, labels, captions |
| `--op-status-success` | [e.g., #16A34A] | [e.g., #22C55E] | Pass (AA) | Success states, active badges |
| `--op-status-error` | [e.g., #DC2626] | [e.g., #EF4444] | Pass (AA) | Destructive action, form errors |

### 3.2 Neutral Scale
> Define 9-11 shades of gray from white to near-black. These feed semantic tokens for text, backgrounds, and borders.

| Token | Value | Usage |
|:---|:---|:---|
| `--gray-50` | [value] | Lightest background |
| `--gray-100` | [value] | Subtle background |
| `--gray-200` | [value] | Borders, dividers |
| `--gray-300` | [value] | Disabled text |
| `--gray-500` | [value] | Muted text |
| `--gray-700` | [value] | Secondary text |
| `--gray-900` | [value] | Primary text |

### 3.3 Utility Colors
| Token | Light Mode | Dark Mode | Purpose |
|:---|:---|:---|:---|
| `--status-info` | [value] | [value] | Informational alerts |
| `--status-warning` | [value] | [value] | Warning states |
| `--status-success` | [value] | [value] | Success states |
| `--status-error` | [value] | [value] | Error states |

---

## 4. Typography

### 4.1 Font Family
> Document font choices and their roles. Define the font loading strategy.

- **Primary Heading Font**: [e.g., Plus Jakarta Sans, sans-serif]
- **Body & Label Font**: [e.g., Inter, sans-serif]
- **Code & Data Font**: [e.g., JetBrains Mono, monospace]

### 4.2 Font Loading Strategy
| Property | Value |
|:---|:---|
| `font-display` | `swap` for body, `optional` for decorative |
| Preloaded fonts | [List the 2-3 most critical font files] |
| Fallback stack | `"Inter", system-ui, -apple-system, "Segoe UI", sans-serif` |
| Preload method | `<link rel="preload" as="font" type="font/woff2" crossorigin>` |

### 4.3 Typography Scale
> Standardized typographic scale using a modular scale ratio (e.g., 1.25 Major Third). Include fluid responsive sizing with clamp().

| Category | Size (px/rem) | Fluid (clamp) | Weight | Line Height | CSS Class / Token |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Display H1 | `40px (2.5rem)` | `clamp(2rem, 1.5rem + 1.5vw, 2.5rem)` | 800 | 1.2 | `text-display-h1` |
| Page Title H2 | `32px (2.0rem)` | `clamp(1.5rem, 1.25rem + 0.75vw, 2rem)` | 700 | 1.25 | `text-title-h2` |
| Section Title H3 | `24px (1.5rem)` | `clamp(1.25rem, 1rem + 0.5vw, 1.5rem)` | 600 | 1.3 | `text-section-h3` |
| Body Lead | `18px (1.125rem)`| -- | 400 | 1.5 | `text-body-lead` |
| Body Text | `16px (1.0rem)` | -- | 400 | 1.6 | `text-body` |
| Small Label | `14px (0.875rem)`| -- | 500 / 600 | 1.4 | `text-label-sm` |
| Code Block | `14px (0.875rem)`| -- | 400 | 1.5 | `text-code` |

### 4.4 Responsive Typography Notes
- **Line Length**: Cap body text at 65-75 characters per line (`max-width: 65ch`).
- **Fluid Scaling**: Headings use `clamp()` for smooth viewport-based scaling. Body text uses rem units only.
- **Modular Scale Ratio**: [e.g., 1.25 (Major Third)] -- all sizes derived from base size multiplied by this ratio.

---

## 5. Spacing System

### 5.1 Spacing Scale (8px Grid)
```css
--space-1: 4px;   /* Minor adjustment / tight alignment */
--space-2: 8px;   /* Tiny spacing / component inner padding */
--space-3: 12px;  /* Compact spacing */
--space-4: 16px;  /* Standard grid increment / small card padding */
--space-6: 24px;  /* Medium card padding / paragraph margins */
--space-8: 32px;  /* Section spacing */
--space-12: 48px; /* Large container margins */
--space-16: 64px; /* Hero element margins */
```

### 5.2 Component Spacing
> Define standard spacing for common component internals. All values align to the 8px grid.

| Context | Token | Value |
|:---|:---|:---|
| Button padding (horizontal) | `--space-4` | 16px |
| Button padding (vertical) | `--space-2` | 8px |
| Card padding | `--space-6` | 24px |
| Card padding (compact) | `--space-4` | 16px |
| Icon-to-label gap | `--space-2` | 8px |
| Section spacing | `--space-8` | 32px |
| Modal padding | `--space-6` | 24px |
| Table cell padding | `--space-3` / `--space-4` | 12px / 16px |
| Form input padding | `--space-3` | 12px |
| Badge padding (horizontal) | `--space-2` | 8px |
| Badge padding (vertical) | `--space-1` | 4px |

---

## 6. Border Radius & Shadows

### 6.1 Border Radius
```css
/* Radii */
--radius-sm: 6px;   /* Tag, status badge, small button */
--radius-md: 12px;  /* Standard buttons, input fields, cards */
--radius-lg: 20px;  /* Large dialog boxes, dropdown containers */
--radius-pill: 9999px; /* Pill shapes */
```

### 6.2 Shadows (Light Mode)
```css
--shadow-sm: 0 1px 3px rgba(16, 41, 99, 0.06);
--shadow-md: 0 4px 12px rgba(16, 41, 99, 0.08);
--shadow-lg: 0 16px 40px rgba(16, 41, 99, 0.12);
```

### 6.3 Shadows (Dark Mode)
> Dark mode shadows need higher opacity or spread to be visible against dark backgrounds. Alternatively, use a subtle border instead of shadow.

```css
--shadow-sm-dark: 0 1px 3px rgba(0, 0, 0, 0.3);
--shadow-md-dark: 0 4px 12px rgba(0, 0, 0, 0.4);
--shadow-lg-dark: 0 16px 40px rgba(0, 0, 0, 0.5);
```

---

## 7. z-index System
> Define named z-index layers. Never use raw numeric values. Use `isolation: isolate` on components that create stacking contexts.

| Token | Value | Usage |
|:---|:---|:---|
| `--z-base` | 0 | Default stacking |
| `--z-dropdown` | 100 | Dropdown menus, select menus |
| `--z-sticky` | 200 | Sticky headers, fixed nav |
| `--z-modal-backdrop` | 300 | Modal overlay/dimming layer |
| `--z-modal` | 400 | Modal content |
| `--z-popover` | 500 | Popovers, floating panels |
| `--z-tooltip` | 600 | Tooltips |
| `--z-toast` | 700 | Toast notifications |

---

## 8. Iconography

### 8.1 Icon Set
| Property | Value |
|:---|:---|
| Icon Library | [e.g., Lucide v0.x, Phosphor, Heroicons] |
| Style | [Outlined / Filled / Duotone] |
| Stroke Width | [e.g., 1.5px] |
| Format | [SVG preferred / Icon font] |

### 8.2 Icon Sizing Grid
| Size Token | Pixels | Usage |
|:---|:---|:---|
| `--icon-xs` | 8px | Inline text icons |
| `--icon-sm` | 16px | Small UI elements, badges |
| `--icon-md` | 24px | Standard buttons, navigation, forms |
| `--icon-lg` | 32px | Emphasized icons, empty states |

### 8.3 Icon Color
- **Interactive icons**: Inherit `currentColor` from parent text.
- **Decorative icons**: Use semantic color tokens. Must pass contrast checks when interactive.
- **Disabled icons**: Use `--gray-300` (light) / `--gray-600` (dark).

---

## 9. Imagery Guidelines

### 9.1 Photography Style
| Property | Value |
|:---|:---|
| Aspect Ratio | [e.g., 16:9, 4:3, 1:1] |
| Treatment | [e.g., rounded corners, subtle overlay, no filter] |
| Color Grading | [e.g., warm, cool, desaturated, brand-tinted] |
| Subject | [e.g., people in professional settings, product shots, abstract] |

### 9.2 Illustration Style
| Property | Value |
|:---|:---|
| Style | [Line art / Filled / Flat / Isometric] |
| Color Palette | [Match brand palette / limited accent colors] |
| Reference | [e.g., unDraw, custom, Storyset] |

### 9.3 Placeholder & Empty State Images
[Define placeholder patterns for empty states: SVG illustrations, blurred images, abstract shapes, or solid color with icon. Never leave broken `<img>` tags.]

---

## 10. Motion Design

### 10.1 Timing Curves
```css
--ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);    /* Entrances */
--ease-in: cubic-bezier(0.4, 0.0, 1, 1);        /* Exits */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);    /* State changes */
```

### 10.2 Duration Scale
```css
--duration-fast: 100ms;     /* Micro-interactions (checkbox, toggle) */
--duration-normal: 200ms;   /* Hover states, small transitions */
--duration-slow: 300ms;     /* Page transitions, modal open/close */
--duration-slower: 500ms;   /* Complex animations, skeleton shimmer */
```

### 10.3 Micro-Interactions
| Element | Trigger | Duration | Easing | Description |
|:---|:---|:---|:---|:---|
| Button | Hover | 150ms | ease-out | `translateY(-1px)` + shadow increase |
| Button | Active | 100ms | ease-in | `scale(0.98)` |
| Checkbox | Checked | 200ms | ease-out | Check mark draws in |
| Toggle | Toggle | 200ms | ease-in-out | Slides left/right |
| Card | Hover | 200ms | ease-out | `translateY(-2px)` + shadow |

### 10.4 Loading Animations
| Pattern | Usage | Token |
|:---|:---|:---|
| Skeleton Screen | Content loading (preferred) | Background: `--op-surface-bg`, shimmer: `--op-surface-card` |
| Spinner | Indeterminate waits | Color: `--op-brand-accent`, size: 24px |
| Progress Bar | Determinate tasks | Background: `--op-border`, fill: `--op-brand-accent` |

### 10.5 Reduced Motion
All animations must respect `prefers-reduced-motion: reduce`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 11. UI Component Library

### 11.1 Buttons
> Standard button patterns with all interactive states.

```html
<!-- Primary Button -->
<button class="op-btn op-btn-primary">
  [Label]
</button>

<!-- Secondary Button -->
<button class="op-btn op-btn-secondary">
  [Label]
</button>

<!-- Ghost Button -->
<button class="op-btn op-btn-ghost">
  [Label]
</button>

<!-- Destructive Button -->
<button class="op-btn op-btn-destructive">
  [Label]
</button>
```

```css
/* Focus Indicator (Non-negotiable) */
.op-btn:focus-visible {
  outline: 2px solid var(--op-brand-accent);
  outline-offset: 2px;
}
```

**Component Spacing:** Horizontal padding `16px` (`--space-4`), vertical padding `8px` (`--space-2`), icon-to-label gap `8px` (`--space-2`).

### 11.2 Form Input Fields
> Standard text input, dropdowns, validation errors.

```html
<div class="op-form-group">
  <label for="merchant-email" class="op-label">[Label Name]</label>
  <input type="email" id="merchant-email" class="op-input" placeholder="e.g. user@domain.com">
  <span class="op-form-error">[Validation Error Message]</span>
</div>
```

### 11.3 Cards & Data Containers
> Container blocks for landing pages and administrative panels.

- **Default Card**: Padding `24px` (`--space-6`), radius `12px` (`--radius-md`), border `1px solid var(--op-border)`, soft shadow (`--shadow-md`).
- **Interactive Card**: Same as default card, but on hover adds transform `translateY(-2px)` and shadow increases (`--shadow-lg`).
- **Compact Card**: Padding `16px` (`--space-4`) for data-dense layouts.

### 11.4 Badges & Status Indicators
> Lightweight visual tags to indicate operational states.

- **Active / Success Badge**: Green background (`rgba(22, 163, 74, 0.1)`), green text, radius `--radius-pill`.
- **Pending / Warning Badge**: Yellow background (`rgba(240, 165, 0, 0.1)`), gold/yellow text, radius `--radius-pill`.
- **Suspended / Error Badge**: Red background (`rgba(220, 38, 38, 0.1)`), red text, radius `--radius-pill`.

### 11.5 Tables
> Data tables for lists, grids, and dashboards.

| Property | Value |
|:---|:---|
| Header background | `--op-surface-bg` |
| Row hover | `--op-surface-bg` with 50% opacity |
| Cell padding | `12px 16px` (`--space-3` / `--space-4`) |
| Border | `1px solid var(--op-border)` (bottom of each row) |
| Sortable header | Cursor pointer, indicator icon, hover highlight |
| Sticky first column | Yes (for horizontal scroll on mobile) |

**Mobile Behavior:** [Choose: horizontal scroll with sticky first column / card-based row display / collapsible rows]

### 11.6 Modals & Dialogs
| Property | Value |
|:---|:---|
| Backdrop | `rgba(0, 0, 0, 0.5)` with `--z-modal-backdrop` |
| Content | `--z-modal`, radius `--radius-lg`, padding `--space-6` |
| Max width | [e.g., 560px for confirmation, 720px for forms] |
| Mobile | Full-screen sheet (slide up from bottom) |
| Close | X button top-right, Escape key, backdrop click |
| Focus trap | Yes -- focus cycles within modal when open |

### 11.7 Navigation
| Pattern | Desktop | Mobile |
|:---|:---|:---|
| Top bar | Horizontal links, logo left, actions right | Hamburger menu or bottom tab bar |
| Sidebar | Fixed left, 240-280px width | Collapsed to icons, overlay on open |
| Breadcrumbs | Inline with separators | Truncated with "..." or scrollable |

### 11.8 Dropdowns & Select Menus
| Property | Value |
|:---|:---|
| Max height | [e.g., 320px with scroll] |
| z-index | `--z-dropdown` (100) |
| Search | Optional search input at top |
| Multi-select | Checkbox list pattern |
| Keyboard | Arrow keys navigate, Enter selects, Escape closes |

### 11.9 Tooltips & Popovers
| Property | Value |
|:---|:---|
| z-index | `--z-tooltip` (600) |
| Background | `--gray-900` (light) / `--gray-100` (dark) |
| Padding | `8px 12px` |
| Arrow | Yes, 8px |
| Dismiss | Auto-dismiss on blur/escape, hover to keep open |
| Positioning | Prefer top, fall back to bottom/left/right based on viewport |

### 11.10 Tabs
| Property | Value |
|:---|:---|
| Layout | Horizontal (default) or vertical |
| Active indicator | Bottom border (horizontal) or left border (vertical) |
| URL sync | Optional hash-based tab persistence |
| Keyboard | Left/Right arrows for horizontal, Up/Down for vertical |

### 11.11 Accordion / Collapse
| Property | Value |
|:---|:---|
| Animation | Height transition with `ease-in-out`, 200ms |
| Icon | Chevron that rotates 180deg on expand |
| Border | Bottom border between items |
| Multi-open | [Allow multiple panels open / single only] |

### 11.12 Alerts & Banners
| Variant | Background | Border | Icon |
|:---|:---|:---|:---|
| Info | `--status-info` at 10% opacity | Left border 4px | Info circle |
| Warning | `--status-warning` at 10% opacity | Left border 4px | Warning triangle |
| Error | `--status-error` at 10% opacity | Left border 4px | Error circle |
| Success | `--status-success` at 10% opacity | Left border 4px | Check circle |

**Dismiss:** Optional X button. Auto-dismiss not recommended for alerts (use toasts instead).

### 11.13 Toast Notifications
| Property | Value |
|:---|:---|
| Position | Bottom-right (default) or top-center |
| z-index | `--z-toast` (700) |
| Auto-dismiss | 5 seconds (success/info), manual dismiss for errors |
| Stacking | Newest on top, max 3 visible, older toasts slide out |
| Animation | Slide in from right, fade out on dismiss |

### 11.14 Component State Matrix
> Every interactive component must define all states below. Fill in for each component.

| Component | Default | Hover | Active | Focus Visible | Disabled | Error | Loading |
|:---|:---|:---|:---|:---|:---|:---|:---|
| Primary Button | [styles] | [styles] | [styles] | [styles] | [styles] | N/A | [spinner or disabled] |
| Secondary Button | [styles] | [styles] | [styles] | [styles] | [styles] | N/A | [spinner or disabled] |
| Text Input | [styles] | N/A | N/A | [styles] | [styles] | [red border + message] | N/A |
| Select Input | [styles] | [styles] | [styles] | [styles] | [styles] | [red border + message] | N/A |
| Card (Interactive) | [styles] | [styles] | [styles] | [styles] | N/A | N/A | [skeleton] |
| Checkbox | [styles] | [styles] | [styles] | [styles] | [styles] | N/A | N/A |
| Toggle | [styles] | [styles] | [styles] | [styles] | [styles] | N/A | N/A |
| Link | [styles] | [styles] | [styles] | [styles] | [styles] | N/A | N/A |

---

## 12. Layout, Responsive, & Accessibility Rules

### 12.1 Page Layout Grid
- **Desktop (1200px+)**: 12-column grid, max-width `1200px` (or `1440px` for data-heavy views), container centered with auto-margins.
- **Tablet (768px - 1024px)**: 8-column grid, horizontal margin `32px` (`--space-8`).
- **Mobile (under 768px)**: 4-column grid, horizontal margin `16px` (`--space-4`).

### 12.2 Responsive Breakpoints
| Breakpoint | Min Width | Columns | Container Max |
|:---|:---|:---|:---|
| Mobile | `0px` | 4 | 100% |
| Tablet | `768px` | 8 | 100% |
| Desktop | `1024px` | 12 | 1200px |
| Wide Screen | `1440px` | 12 | 1440px |

### 12.3 Responsive Component Behavior
> How key components adapt at each breakpoint.

| Component | Mobile | Tablet | Desktop |
|:---|:---|:---|:---|
| Data Table | [Card-based rows / horizontal scroll + sticky col] | [Horizontal scroll] | [Full table] |
| Navigation | [Hamburger / bottom tab bar] | [Hamburger / condensed] | [Full horizontal] |
| Modal | [Full-screen sheet, slide up] | [Centered, 90vw max] | [Centered, fixed max-width] |
| Sidebar | [Hidden, overlay on trigger] | [Collapsed to icons] | [Full expanded] |
| Multi-col Grid | [1 column] | [2 columns] | [3-4 columns] |
| Dropdown | [Full-width sheet] | [Standard dropdown] | [Standard dropdown] |

### 12.4 Container Queries (if applicable)
[If components adapt based on parent width rather than viewport, define container query breakpoints here. Example: `@container (min-width: 400px)` for card content layout shifts.]

### 12.5 WCAG Accessibility Checklist
- [ ] **Contrast**: Text contrast ratio is verified using tools (minimum 4.5:1 for body).
- [ ] **Keyboard Nav**: Focus indicators are styled and visible on all focusable elements.
- [ ] **Semantic Markup**: Form inputs are explicitly paired with `<label>` tags.
- [ ] **Interactive Elements**: All custom clickable divs/spans have `role="button"` and `tabindex="0"`.
- [ ] **Images**: All static assets have descriptive `alt="..."` properties.
- [ ] **Target Size**: All interactive elements are at least 44x44px on mobile (WCAG 2.2).
- [ ] **Reduced Motion**: All animations respect `prefers-reduced-motion: reduce`.

---

## 13. Component State Reference (Loading, Empty, Error)

> Per-component state definitions for data-fetching components.

| Component | Loading State | Empty State | Error State |
|:---|:---|:---|:---|
| Data Table | Skeleton rows (5-8 rows) | Illustration + "No data" + action button | Error icon + message + retry button |
| Card Grid | Skeleton cards | Illustration + "Nothing here yet" | Error icon + message + retry |
| Chart/Graph | Skeleton placeholder | "No data for this period" | Error icon + message + retry |
| Profile Section | Skeleton avatar + lines | Default avatar + "Complete your profile" | Error icon + message |

---

## 14. Alternatives Considered

| Alternative | Pros | Cons | Why Not Chosen |
|:---|:---|:---|:---|
| [e.g., Tailwind CSS utility-first approach] | [Rapid prototyping, no custom CSS files, widely adopted] | [HTML bloat, harder to enforce design consistency without strict config, less semantic markup] | [Design system requires semantic token-based theming with dark mode; utility classes make token enforcement harder to audit] |
| [e.g., Material Design as the base system] | [Well-documented, extensive component library, accessibility built-in] | [Generic look, heavy opinion on interaction patterns, harder to brand distinctly] | [Product requires a distinct brand identity; Material Design's visual language conflicts with the brand personality goals] |
