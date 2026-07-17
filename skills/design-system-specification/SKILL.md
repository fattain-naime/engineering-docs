---
name: design-system-specification
argument-hint: "[Product or website name]"
description: Design a production-ready Design System and UI/UX visual style guide. Covers design tokens (colors, typography, spacing, shadows, radius), components (buttons, inputs, cards, tables, modals, navigation), layouts, interaction/hover states, iconography, motion design, responsive behavior, accessibility (WCAG 2.2), and dark/light mode rules. Use when starting a new website/app design or standardizing existing branding.
intent: >-
  Produce a rigorous design system specification that defines the complete visual language of a project before frontend development begins. A well-designed system ensures visual consistency, accelerates layout implementation, and establishes clear CSS variable architectures. This skill applies Atomic Design principles, W3C Design Token specifications, and WCAG 2.2 accessibility rules to create premium, professional web designs. The output provides the exact design tokens and component layouts needed by developers and AI coding agents.
type: workflow
theme: engineering-docs
best_for:
  - "Designing the visual system and style guide for a new web application"
  - "Establishing a consistent design language across multiple sub-brands or pages"
  - "Creating a robust utility system (CSS variables) for developers"
  - "Standardizing typography, spacing rules, and WCAG accessibility targets"
  - "Defining iconography, motion design, and responsive component behavior"
scenarios:
  - "Design the visual identity and design system for our new checkout portal"
  - "Create a style guide for a developer-focused analytics dashboard"
  - "Design the typography and token layout for a clean marketing website"
  - "Build a full component library spec with tables, modals, navigation, and tooltips"
estimated_time: "4-8 hrs"
license: MIT
compatibility: Designed for Gemini (Antigravity), Claude Code, Cursor/Windsurf, Kimi Code, Codex/Copilot
---

## Purpose

Produce a design system specification (`design.md` or `design-system.md`) that details the exact visual language of a web project. This specification serves as the single source of truth for styles, ensuring designers, developers, and AI agents build consistent, professional interfaces.

## Input

**Works best with:** The name or concept of the app/website, along with core branding goals.
**Also valuable:** Existing logo files, target audience, primary brand colors, component needs (e.g. data tables, alerts, checkout forms).

**Example invocation:** `Create a design system for a B2B payment gateway admin portal. Needs to look highly professional, secure, and developer-friendly. Dark mode is first-class. Colors should revolve around navy and tech-blue. Needs style rules for tables, dashboard cards, status badges, and transaction grids.`

## Key Concepts

### 1. Atomic Design
Divide the interface into modular units to ensure reuse and scalability:
- **Atoms**: Raw design tokens (colors, typography, spacing) and base elements (buttons, inputs, icons).
- **Molecules**: Groups of atoms functioning together (a form input group with label and error status).
- **Organisms**: Complex layout components composed of molecules (a data table, navigation header, or sidebar).
- **Templates / Pages**: High-level wireframes demonstrating token combinations in action.

### 2. Spacing Rhythm (8px Grid)
All spacing, padding, margins, and sizing should align to a standard 8px grid (8px, 16px, 24px, 32px, 48px, 64px, etc.). This ensures visual balance, mathematically consistent alignment, and prevents random layout values.

### 3. WCAG 2.2 Accessibility
Every design token must meet Web Content Accessibility Guidelines (WCAG) 2.2:
- **Contrast**: Normal text must maintain at least a **4.5:1** contrast ratio against its background (Level AA). Large text (18pt+/24px+) must have a **3:1** ratio.
- **Focus Indicators**: Standard interactive elements MUST have a visible, high-contrast focus outline to ensure keyboard-only navigation capability.

### 4. Iconography
Define the icon system alongside the design tokens. Key decisions:
- **Icon Set Selection**: Choose a single icon library (e.g., Lucide, Phosphor, Heroicons, Material Symbols). Document the set and version for reproducibility.
- **Sizing Grid**: Icons must follow a fixed sizing grid aligned to the 8px system: **8px** (inline), **16px** (small UI), **24px** (standard), **32px** (emphasized). All sizes are multiples of 8.
- **Stroke Width Consistency**: If using an outlined icon set, lock stroke width (e.g., 1.5px) across all icons. Mixed stroke weights create visual noise.
- **Icon Font vs SVG**: SVG is preferred for production (accessible, styleable with CSS, no FOIT). Icon fonts are acceptable only for rapid prototyping. Document the chosen approach.
- **Color**: Icons used as text must inherit currentColor. Decorative icons may use semantic tokens but must pass contrast checks when interactive.

### 5. Imagery Guidelines
Define rules for photography, illustration, and placeholder assets:
- **Photography Style**: Aspect ratio, treatment (rounded corners, overlays), color grading rules (warm, cool, desaturated), and subject guidelines (people, objects, abstract).
- **Illustration Style**: Line art vs filled, color palette constraints, level of detail. Reference a library (e.g., unDraw, custom illustrations) or specify a custom style.
- **Placeholder Images**: Define placeholder patterns for empty states (e.g., SVG illustrations, blurred images, or abstract shapes). Never leave broken `<img>` tags.

### 6. Motion Design
Animations must be purposeful, performant, and consistent:
- **Micro-interactions**: Button hover lifts, checkbox ticks, toggle slides, icon morphs. Each needs a defined duration and easing curve.
- **Loading Animations**: Skeleton screens (preferred for content), spinners (for indeterminate waits), progress bars (for determinate tasks). Skeleton backgrounds must match the light/dark surface color.
- **Transition Timing Curves**: Define at least three curves: `ease-out` for entrances, `ease-in` for exits, `ease-in-out` for state changes. Provide the cubic-bezier values as CSS custom properties.
- **Reduced Motion**: All animations must respect `prefers-reduced-motion: reduce`. Provide instant or minimal fallbacks.

### 7. Responsive Typography
Type scales must adapt fluidly across viewports:
- **Fluid Type Scales**: Use CSS `clamp()` to define responsive font sizes: `font-size: clamp(1rem, 0.875rem + 0.5vw, 1.25rem)`. This eliminates breakpoint-specific size jumps.
- **Viewport-Based Sizing**: For hero headings, `vw`-based sizing (capped with clamp) creates proportional scaling. Body text should use rem units only.
- **Line Length**: Cap body text at 65-75 characters per line (use `max-width: 65ch` or similar). Long lines reduce readability.

### 8. Component Composition
Structure components using Atomic Design naming conventions:
- **Atom-to-Organism Flow**: Atoms are standalone (Button, Input, Icon). Molecules combine atoms (SearchField = Input + Button + Icon). Organisms compose molecules (Header = Logo + Navigation + SearchField + UserProfile).
- **Compound Component Naming**: Use BEM or a consistent convention: `card`, `card__header`, `card__body`, `card__footer`, `card--interactive`. Document the chosen convention.
- **Prop/Slot Contracts**: Define what slots or props each compound component exposes (e.g., Card accepts `header`, `body`, `footer`, `actions` slots).

### 9. Design Token Architecture
Tokens must be layered for maintainability and theming:
- **Primitive Tokens**: Raw values not tied to meaning (e.g., `--blue-500: #3B82F6`, `--gray-900: #111827`). These are the building blocks.
- **Semantic Tokens**: Map primitives to purpose (e.g., `--color-text-primary: var(--gray-900)`, `--color-bg-interactive: var(--blue-500)`). These change between light/dark mode.
- **Component Tokens**: Component-specific overrides (e.g., `--button-bg: var(--color-bg-interactive)`). These allow per-component theming.
- **Token Inheritance**: Primitives feed semantic tokens, which feed component tokens. Never skip a layer.
- **Theming Architecture**: Document how themes switch (CSS class toggle on `<html>`, data attribute, or media query). Define the token values per theme.

### 10. Loading, Empty, and Error States
Every data-fetching or interactive component needs a state matrix:
- **Loading State**: Skeleton screen, spinner, or progress indicator. Must not shift layout when content loads.
- **Empty State**: Illustration + message + action button. Different from error (not a failure, just no data).
- **Error State**: Icon + error message + retry action. Error messages must be human-readable, not technical codes.
- **Per-Component Requirement**: Each organism (table, card grid, chart) must specify all three states in the specification.

### 11. z-index Management
Define a stacking context strategy to prevent z-index wars:
- **Named Layers**: Assign named layers to a scale: `--z-base: 0`, `--z-dropdown: 100`, `--z-sticky: 200`, `--z-modal-backdrop: 300`, `--z-modal: 400`, `--z-popover: 500`, `--z-tooltip: 600`, `--z-toast: 700`.
- **Stacking Context Isolation**: Use `isolation: isolate` on components that create stacking contexts (modals, dropdowns) to prevent z-index bleed.
- **No Magic Numbers**: Never use raw z-index values (e.g., `z-index: 9999`). Always reference named tokens.

### 12. Font Loading Strategy
Fonts must load without layout shift or flash of invisible text:
- **font-display**: Use `font-display: swap` for body text (shows fallback immediately, swaps when loaded). Use `font-display: optional` for decorative fonts (only shows if already cached).
- **Preloading**: Add `<link rel="preload" as="font" crossorigin>` for the primary heading and body fonts. Preload at most 2-3 font files.
- **Fallback Stacks**: Define system font fallbacks that closely match the custom font metrics (e.g., `"Inter", system-ui, -apple-system, sans-serif`). Use `font-family` matching tools to find metric-compatible fallbacks to minimize layout shift.

### 13. Responsive Component Behavior
Components must adapt their layout and interaction model at each breakpoint:
- **Data Tables**: On mobile, switch to card-based row display or horizontal scroll with a sticky first column. Document which approach is used.
- **Navigation**: Desktop horizontal nav collapses to a hamburger menu or bottom tab bar on mobile. Specify the pattern.
- **Modals**: On mobile, modals should become full-screen sheets (slide up from bottom) rather than centered overlays.
- **Multi-Column Layouts**: Grids collapse from multi-column to single-column. Define the column count per breakpoint.
- **Touch Targets**: Interactive elements must be at least 44x44px on mobile (WCAG 2.2 Target Size requirement).

### Document Length

Target length: **8-15 pages** (excluding appendices).

Shorter is better than longer. If the document exceeds the target, check for:
- Redundant content that can be cut
- Overly verbose explanations
- Content that belongs in a separate reference document
- Material the agent already knows (don't explain what HTTP is)

If the document is significantly shorter than the target, check for:
- Missing sections
- Insufficient detail in critical areas
- Unaddressed edge cases

### Conflict Resolution

When your analysis conflicts with the user's stated preference:

1. **Present both positions** -- show your analysis and their preference side by side
2. **Explain the trade-off** -- what are the consequences of each choice?
3. **Recommend with reasoning** -- state your recommendation and why
4. **Respect the user's decision** -- they own the final call
5. **Document the decision** -- record it as an `[owner-specified]` override with reasoning

---

## Application

### Phase 1: Socratic Clarification & Brainstorming (Mandatory Interview)

**Interview Mechanism:** Use tool calls (e.g., `AskUserQuestion`) to present questions — do NOT ask inline in the conversation. The user selects from options rather than typing responses. One question per tool call, multiple-choice options preferred, with "I don't know, you decide" as an escape hatch.

**Context Loading:** Before asking ANY questions, read ALL prior documents in `.engineering-docs/` to extract already-known information. Look for:
- Team size, budget, timeline (from business-plan)
- Tech stack, hosting (from system-architecture)
- Target users, JTBD (from user-personas)
- Constraints, regulatory requirements (from business-plan)
- Scope, features (from technical-specification)

**If information exists in a prior document, USE IT — do not re-ask.**

**Maximum 2-3 questions per skill.** Only ask about:
- Skill-specific details not covered in prior documents
- Technical decisions that affect this specific document
- Clarifications on ambiguous requirements

Ask questions to resolve:
1. **Brand Tone & Emotion**: Is the brand authoritative/secure (e.g., banking/infrastructure), developer-centric (e.g., terminal-like, dark/monochrome), or creative/vibrant?
2. **Color Palette Details**: Are there specific logo colors or seed hex values to start with?
3. **Target Components**: What specific screens or key UI elements (e.g., checkout forms, charts, tables, modals, navigation) are most important for this system?

*Wait for the user's response to these questions before drafting the final specification.*

### Phase 2: Design Token Definition
Define the foundational visual primitives. This phase has four sub-steps:

1. **Color Palette Derivation from Brand**: Take the provided brand seed colors and derive a complete palette: primary (3 shades), secondary (3 shades), neutral (9 grays from white to near-black), and utility colors (success, warning, error, info). Each color needs light and dark mode values.
2. **Type Scale Harmonization**: Use a modular scale (e.g., 1.25 ratio Major Third, or 1.333 Perfect Fourth) to generate the typography sizes. Ensure the scale produces harmonious jumps between heading levels and body text. Verify line heights are consistent (typically 1.2 for headings, 1.5-1.6 for body).
3. **Spacing Validation Against 8px Grid**: Define the spacing scale and verify every value is a multiple of 8 (or 4 for fine adjustments). Document any intentional deviations.
4. **WCAG Contrast Validation**: For every text-bearing color token, verify the contrast ratio against its background in both light and dark mode. Use a contrast checker tool. Document pass/fail status and adjust values that fail.

Output: Color palette table, typography scale table, spacing scale, radius scale, shadow scale, z-index scale.

### Phase 3: Component Specifications
Detail specific visual layouts, states, and HTML/CSS mockups for all key components. Each component must specify all states (default, hover, active, focus-visible, disabled, error, loading).

**Required components** (minimum):
- Buttons (primary, secondary, ghost, destructive)
- Form Inputs (text, select, checkbox, radio, textarea)
- Cards & Data Containers
- Badges & Status Indicators
- Tables (data table with sortable headers, row hover, mobile responsive behavior)
- Modals & Dialogs (confirmation, form, full content)
- Navigation (top bar, sidebar, breadcrumbs, mobile hamburger)
- Dropdowns & Select Menus (with search, multi-select)
- Tooltips & Popovers (positioning rules, arrow, dismiss behavior)
- Tabs (horizontal, vertical, with URL hash sync)
- Accordion / Collapse
- Alerts & Banners (info, warning, error, success)
- Toast Notifications (position, auto-dismiss timing, stacking)

For each component, define:
- Visual tokens used (colors, spacing, radii, shadows)
- All interactive states with CSS
- Responsive behavior (how it adapts at each breakpoint)
- Loading, empty, and error states (where applicable)
- Dark mode adjustments (if different from token swap)

### Phase 4: Layout & Interaction Rules
Define the structural and behavioral framework:

1. **Grid System**: Column counts, gutter widths, max container widths, and breakpoint definitions. Include both fixed-grid and fluid approaches.
2. **Container Queries**: If the design uses container queries (components adapting based on parent width rather than viewport), define the container query breakpoints and which components use them.
3. **Responsive Behavior**: How the page layout reflows at each breakpoint. Define the priority order for content stacking on mobile. Specify which components hide, collapse, or transform on smaller screens.
4. **Interaction Patterns**: Define standard patterns for common interactions:
   - Form submission flow (inline validation, submit button states, success/error feedback)
   - Navigation transitions (page loads, SPA route changes)
   - Data loading patterns (initial load, pull-to-refresh, infinite scroll vs pagination)
   - Confirmation flows (destructive actions require confirmation modal)
   - Keyboard shortcuts for power-user features (if applicable)
5. **Motion & Transitions**: Apply the motion design tokens (from Key Concepts) to specific component transitions.
6. **Accessibility Checks**: Final WCAG pass -- verify all interactive elements have focus styles, all images have alt text, all form inputs have labels, and all color contrasts pass.

### Phase 5: Revision (After User Review)

If the user requests changes after reviewing the specification:

1. **Read the user's feedback carefully** -- understand what they want changed
2. **Check for conflicts** -- does the requested change affect color contrast ratios, spacing grid alignment, or component state completeness?
3. **Apply changes** -- update the document, cascading changes through design tokens, component specs, and layout rules
4. **Re-run consistency check** -- verify WCAG contrast ratios for both light and dark modes, spacing still aligns to the 8px grid, and all component states are defined
5. **Update metadata** -- set `last_updated` to today's date
6. **Confirm with user** -- show the changes and get approval

## Gotchas

- **Hardcoding color values instead of using design tokens.** If components use raw hex values (`#102963`) instead of semantic tokens (`var(--op-brand-primary)`), dark mode becomes a rewrite instead of a token swap. Every color must map through a token.
- **Skipping contrast ratio verification for dark mode.** A color palette that passes WCAG AA in light mode may fail catastrophically in dark mode. Verify contrast ratios for both themes independently using a contrast checker tool.
- **Defining spacing values that break the 8px grid rhythm.** Random values like `13px`, `27px`, or `41px` create visual inconsistency and make layout math unpredictable. All spacing must align to the 8px grid (or 4px for fine adjustments).
- **Omitting focus indicator styles for keyboard navigation.** Removing or hiding the default browser focus outline without providing a custom high-contrast alternative makes the interface unusable for keyboard-only users. Focus states are non-optional.
- **Specifying component states incompletely.** Defining only the default and hover states while omitting active, focus, disabled, error, and loading states leaves developers to improvise during implementation, breaking consistency.
- **Ignoring font loading performance.** Using `font-display: block` causes invisible text (FOIT). Using no preloading strategy causes layout shift. Always define font-display and preload critical fonts.
- **Leaving z-index unmanaged.** Without a named z-index scale, developers will use arbitrary values (`z-index: 9999`) that create stacking conflicts. Define named layers and enforce them.
- **Forgetting reduced motion preferences.** Animations that ignore `prefers-reduced-motion` cause vestibular discomfort for some users. Every animation needs a reduced-motion fallback.
- **Not defining responsive component behavior.** A data table that looks perfect on desktop but overflows on mobile with no adaptation strategy is a broken component. Every component needs a documented mobile behavior.
- **Skipping empty and error states.** Components without empty/error states force developers to improvise, leading to inconsistent user experience. Define these states for every data-fetching component.

## Handoff

**Reads from:**
- `1-business-plan.md` -- brand identity, target audience, positioning
- `3-user-personas.md` -- user expectations, accessibility needs
- `12-security-threat-model.md` -- security UX requirements (auth flows, error states)

**Feeds into:**
- `14-technical-blueprint.md` -- design tokens and component specs referenced in feature designs
- `15-implementation-plan.md` -- design system setup as early build phase

## Quality Gate

Before marking this document as `final`, verify:
- [ ] Every color token has both light and dark mode values defined, and contrast ratios are verified for text-bearing tokens
- [ ] All spacing, padding, and margin values align to the 8px grid (or documented 4px sub-grid for fine adjustments)
- [ ] Every interactive component specifies all states: default, hover, active, focus-visible, disabled, error, and loading
- [ ] Focus indicator styles are defined for all interactive elements with sufficient contrast against both light and dark backgrounds
- [ ] The typography scale is complete with size, weight, line height, and semantic purpose for each level
- [ ] Icon set is selected, sizing grid is defined (8/16/24/32px), and stroke width is consistent
- [ ] z-index scale is defined with named layers and no raw numeric values
- [ ] Font loading strategy is documented (font-display, preloading, fallback stacks)
- [ ] Every data-fetching component has loading, empty, and error states defined
- [ ] Responsive behavior is documented for tables, navigation, modals, and multi-column layouts
- [ ] Motion design tokens (timing curves, durations) are defined with reduced-motion fallbacks
- [ ] Design token architecture is layered (primitive -> semantic -> component) with documented inheritance

## Next Steps

After this document is complete, proceed to:
- **`technical-blueprint`** -- design specific feature implementations using these design tokens and components
- **`implementation-plan`** -- sequence design system setup as an early build phase
- Or invoke `using-engineering-docs` to continue the pipeline
