---
name: design-system-specification
argument-hint: "[Product or website name]"
description: Design a production-ready Design System and UI/UX visual style guide. Covers design tokens (colors, typography, spacing, shadows, radius), components (buttons, inputs, cards, tables), layouts, interaction/hover states, accessibility (WCAG 2.2), and dark/light mode rules. Use when starting a new website/app design or standardizing existing branding.
intent: >-
  Produce a rigorous design system specification that defines the complete visual language of a project before frontend development begins. A well-designed system ensures visual consistency, accelerates layout implementation, and establishes clear CSS variable architectures. This skill applies Atomic Design principles, W3C Design Token specifications, and WCAG 2.2 accessibility rules to create premium, professional web designs. The output provides the exact design tokens and component layouts needed by developers and AI coding agents.
type: workflow
theme: engineering-docs
best_for:
  - "Designing the visual system and style guide for a new web application"
  - "Establishing a consistent design language across multiple sub-brands or pages"
  - "Creating a robust utility system (CSS variables) for developers"
  - "Standardizing typography, spacing rules, and WCAG accessibility targets"
scenarios:
  - "Design the visual identity and design system for our new checkout portal"
  - "Create a style guide for a developer-focused analytics dashboard"
  - "Design the typography and token layout for a clean marketing website"
estimated_time: "2-4 hours"
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
- **Atoms**: Raw design tokens (colors, typography, spacing) and base elements (buttons, inputs).
- **Molecules**: Groups of atoms functioning together (a form input group with label and error status).
- **Organisms**: Complex layout components composed of molecules (a data table, navigation header, or sidebar).
- **Templates / Pages**: High-level wireframes demonstrating token combinations in action.

### 2. Spacing Rhythm (8px Grid)
All spacing, padding, margins, and sizing should align to a standard 8px grid (8px, 16px, 24px, 32px, 48px, 64px, etc.). This ensures visual balance, mathematically consistent alignment, and prevents random layout values.

### 3. WCAG 2.2 Accessibility
Every design token must meet Web Content Accessibility Guidelines (WCAG) 2.2:
- **Contrast**: Normal text must maintain at least a **4.5:1** contrast ratio against its background (Level AA). Large text (18pt+/24px+) must have a **3:1** ratio.
- **Focus Indicators**: Standard interactive elements MUST have a visible, high-contrast focus outline to ensure keyboard-only navigation capability.

---

## Application

### Phase 1: Socratic Clarification & Brainstorming (Mandatory Interview)
Before writing any specification, you MUST interrogate the user's initial prompt and ask **3-5 clarifying questions** to dig deeper. Do NOT generate the template yet.
Ask questions to resolve:
1. **Brand Tone & Emotion**: Is the brand authoritative/secure (e.g., banking/infrastructure), developer-centric (e.g., terminal-like, dark/monochrome), or creative/vibrant?
2. **Color Palette Details**: Are there specific logo colors or seed hex values to start with?
3. **Interactive Density**: Do they prefer a compact data-dense look (common for admin dashboards) or a spacious, roomy aesthetic?
4. **Target Components**: What specific screens or key UI elements (e.g., checkout forms, charts, tables) are most important for this system?
*Wait for the user's response to these questions before drafting the final specification.*

### Phase 2: Design Token Definition
Outline color palettes (primary, secondary, neutral, utility), typography scale (sizes, weights, line heights), spacing increments, border radii, and shadows.

### Phase 3: Component Specifications
Detail specific visual layouts, states (default, hover, active, focus, disabled, error), and HTML/CSS mockups for key atoms and molecules.

### Phase 4: Layout & Interaction Rules
Define responsive breakpoints, page shell layouts, motion/transition curves, and accessibility checks.
