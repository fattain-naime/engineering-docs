---
name: ux-flow-specification
argument-hint: "[product or feature name]"
description: Document the complete user experience of a product - information architecture, user journeys, screen-by-screen flows, and every UI state (loading, empty, error, success) - independent of visual styling. Use to define exactly how a user moves through a product before or alongside implementation, so navigation and edge-case behavior are decided upfront rather than improvised.
intent: >-
  Produce a UX flow specification that captures behavior and structure - what screens exist, how a user gets from one to another, and what each screen looks like in every state it can be in - as distinct from the design-system-specification skill, which captures visual styling (colors, typography, tokens). Most UX defects are not visual; they are missing states (what does the screen show with zero results, mid-load, or after an error) and unclear navigation (how does a user get back, or recover from a wrong turn). This document lets an implementer, human or AI agent, build every screen the product needs without guessing what happens in the cases that don't appear in a happy-path mockup.
type: workflow
theme: engineering-docs
best_for:
  - "Mapping the full user journey through a product or a major new feature before implementation"
  - "Defining the information architecture and navigation structure of an application"
  - "Specifying every UI state (loading, empty, error, success, permission-denied) so none are left to improvisation"
  - "Giving an AI coding agent or new engineer enough detail to build every screen without a visual mockup"
scenarios:
  - "Document the user flow for our onboarding process, from signup to first successful action"
  - "Map the information architecture and navigation for our new dashboard product"
  - "Specify every screen and state needed for the checkout flow, including error and empty states"
estimated_time: "1-3 hours"
license: MIT
compatibility: Designed for Gemini (Antigravity), Claude Code, Cursor/Windsurf, Kimi Code, Codex/Copilot
---

## Purpose

Produce a UX flow specification that documents how a user moves through a product: the information architecture, the step-by-step journey for each key task, every screen involved, and every state each screen can be in.

**A flow spec is not a visual design.** It says "after a failed payment, the user sees an inline error on the same screen with the amount preserved and a retry button" - it does not say what color that error is. Visual language belongs in `design-system-specification`; this document belongs to behavior and structure.

## Input

**Works best with:** The name of the product or feature and the primary task(s) a user is trying to accomplish.
**Also valuable:** Existing personas or user research, known edge cases, any regulatory or accessibility requirements affecting flow (e.g., mandatory confirmation steps).

**Example invocation:** `Document the user flow for account signup through first successful login. Users sign up with email, verify via a emailed code, set a password, and land on an empty-state dashboard. Needs to handle: expired verification code, wrong code entry, and a user who already has an account.`

## Key Concepts

### Information Architecture (IA)
The structural map of every screen/page in the product and how they nest or relate - the site map. IA answers "where does this screen live and how does a user get there," independent of any single task flow.

### User Journeys vs. Screen Flows
- **User Journey:** The end-to-end narrative of a user accomplishing a goal, often crossing multiple sessions or channels (e.g., "discovers product → signs up → completes onboarding → invites a teammate").
- **Screen Flow:** The literal sequence of screens and user actions for one specific task (e.g., the exact screens involved in "reset password").
Document journeys for the big picture, screen flows for implementation-level precision.

### The Four States Every Screen Needs
A screen isn't specified until all of these are described:
- **Loading** - what shows while data is being fetched
- **Empty** - what shows when there is legitimately no data yet (first-time use, not an error)
- **Error** - what shows when something failed, and what recovery action is offered
- **Populated / Success** - the normal, expected state

Omitting any of these is the single most common source of "the happy path works but everything else is undefined" bugs.

### Navigation and Recovery
Every screen needs an answer to: how does a user get here, and how do they leave (forward, back, or abandon)? Dead ends - screens with no way out except closing the app - are a UX defect to catch at spec time, not discover in testing.

### Accessibility in Flow (not just visual)
Keyboard/tab order through a screen, focus management after an action (e.g., where does focus land after a modal closes), and whether a flow can be completed without a mouse or without sight are flow-level concerns, not just visual ones.

## Application

### Phase 1: Socratic Clarification & Brainstorming (Mandatory Interview)
Before writing any flow specification, you MUST interrogate the user's initial input, identify gaps, and ask **3-5 targeted clarifying questions** to dig deeper. Do NOT generate the template yet.
Ask questions to resolve:
1. **Primary task(s)**: What is the single most important thing a user is trying to accomplish in this flow?
2. **Entry points**: How does a user arrive at this flow - direct link, navigation, notification, referral?
3. **Known edge cases**: Are there specific failure modes, permission levels, or unusual paths that must be handled (e.g., expired session, no data yet, insufficient permissions)?
4. **Existing structure**: Is there an existing information architecture or navigation pattern this must fit into, or is this greenfield?
*Wait for the user's response to these questions before drafting the final specification.*

### Phase 2: Information Architecture (30 min)
Map every screen/page and how they nest or link. Produce a site map.

### Phase 3: User Journey Mapping (20-30 min)
Narrate the end-to-end journey(s) for the primary task(s), including any cross-session or multi-channel steps.

### Phase 4: Screen-by-Screen Flow (45-90 min)
For each screen in the journey: entry point, primary action(s), all four states (loading/empty/error/success), and every exit/navigation option.

### Phase 5: Edge Cases and Recovery Paths (20-30 min)
Walk through every known failure mode and unusual path. Ensure none result in a dead end.

### Phase 6: Accessibility Pass (15-20 min)
Verify keyboard navigation order, focus management, and that the flow is completable without a mouse.
