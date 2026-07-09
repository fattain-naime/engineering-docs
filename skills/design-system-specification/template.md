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

## 2. Global Design Tokens (Atoms)

### 2.1 Color Palette
> Use HSL or hex values. Every brand color should have a defined semantic mapping for both light and dark modes.

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

### 2.2 Typography Scale
> Standardized typographic scale using Google Fonts or system defaults. Preconnect font resources.

- **Primary Heading Font**: [e.g., Plus Jakarta Sans, sans-serif]
- **Body & Label Font**: [e.g., Inter, sans-serif]
- **Code & Data Font**: [e.g., JetBrains Mono, monospace]

| Category | Size (px/rem) | Weight | Line Height | CSS Class / Token |
| :--- | :--- | :--- | :--- | :--- |
| Display H1 | `40px (2.5rem)` | 800 | 1.2 | `text-display-h1` |
| Page Title H2 | `32px (2.0rem)` | 700 | 1.25 | `text-title-h2` |
| Section Title H3 | `24px (1.5rem)` | 600 | 1.3 | `text-section-h3` |
| Body Lead | `18px (1.125rem)`| 400 | 1.5 | `text-body-lead` |
| Body Text | `16px (1.0rem)` | 400 | 1.6 | `text-body` |
| Small Label | `14px (0.875rem)`| 500 / 600 | 1.4 | `text-label-sm` |
| Code Block | `14px (0.875rem)`| 400 | 1.5 | `text-code` |

### 2.3 Spacing System (8px Grid)
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

### 2.4 Border Radius & Shadows
```css
/* Radii */
--radius-sm: 6px;   /* Tag, status badge, small button */
--radius-md: 12px;  /* Standard buttons, input fields, cards */
--radius-lg: 20px;  /* Large dialog boxes, dropdown containers */
--radius-pill: 9999px; /* Pill shapes */

/* Shadows */
--shadow-sm: 0 1px 3px rgba(16, 41, 99, 0.06);
--shadow-md: 0 4px 12px rgba(16, 41, 99, 0.08);
--shadow-lg: 0 16px 40px rgba(16, 41, 99, 0.12);
```

---

## 3. UI Component Library (Molecules)

### 3.1 Buttons
> Standard button patterns with interactive states (default, hover, active, focus, disabled).

```html
<!-- Primary Button -->
<button class="op-btn op-btn-primary">
  [Label]
</button>

<!-- Secondary Button -->
<button class="op-btn op-btn-secondary">
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

### 3.2 Form Input Fields
> Standard text input, dropdowns, validation errors.

```html
<div class="op-form-group">
  <label for="merchant-email" class="op-label">[Label Name]</label>
  <input type="email" id="merchant-email" class="op-input" placeholder="e.g. user@domain.com">
  <span class="op-form-error">[Validation Error Message]</span>
</div>
```

### 3.3 Cards & Data Containers
> Container blocks for landing pages and administrative panels.

- **Default Card**: Padding `24px` (`--space-6`), radius `12px` (`--radius-md`), border `1px solid var(--op-border)`, soft shadow (`--shadow-md`).
- **Interactive Card**: Same as default card, but on hover adds transform `translateY(-2px)` and shadow increases (`--shadow-lg`).

### 3.4 Badges & Status Indicators
> Lightweight visual tags to indicate operational states.

- **Active / Success Badge**: Green background (`rgba(22, 163, 74, 0.1)`), green text, radius `--radius-pill`.
- **Pending / Warning Badge**: Yellow background (`rgba(240, 165, 0, 0.1)`), gold/yellow text, radius `--radius-pill`.
- **Suspended / Error Badge**: Red background (`rgba(220, 38, 38, 0.1)`), red text, radius `--radius-pill`.

---

## 4. Layout, Responsive, & Accessibility Rules

### 4.1 Page Layout Grid
- **Desktop (1200px+)**: 12-column grid, max-width `1200px` (or `1440px` for data-heavy views), container centered with auto-margins.
- **Tablet (768px - 1024px)**: 8-column grid, horizontal margin `32px` (`--space-8`).
- **Mobile (under 768px)**: 4-column grid, horizontal margin `16px` (`--space-4`).
- **Responsive Breakpoints**:
  - Mobile: `min-width: 0px`
  - Tablet: `min-width: 768px`
  - Desktop: `min-width: 1024px`
  - Wide Screen: `min-width: 1440px`

### 4.2 Interaction & Transitions
All smooth animations and interactive transitions should use defined timing curves:

```css
--transition-speed-fast: 150ms;
--transition-speed-normal: 250ms;
--transition-timing-curve: cubic-bezier(0.4, 0, 0.2, 1);
```

### 4.3 WCAG Accessibility Checklist
- [ ] **Contrast**: Text contrast ratio is verified using tools (minimum 4.5:1 for body).
- [ ] **Keyboard Nav**: Focus indicators are styled and visible on all focusable elements.
- [ ] **Semantic Markup**: Form inputs are explicitly paired with `<label>` tags.
- [ ] **Interactive Elements**: All custom clickable divs/spans have `role="button"` and `tabindex="0"`.
- [ ] **Images**: All static assets have descriptive `alt="..."` properties.
