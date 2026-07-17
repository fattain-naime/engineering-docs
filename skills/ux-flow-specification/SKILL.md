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
estimated_time: "2-6 hours"
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

### Responsive / Multi-Device Flows
When a product is used across devices (desktop, tablet, mobile), specify how the flow adapts:
- **Breakpoint behavior:** What elements collapse, hide, or reflow at each breakpoint?
- **Touch vs. pointer:** What interactions change? (e.g., hover states become tap-and-hold, swipe replaces click-and-drag)
- **Context-aware defaults:** Does the mobile experience prioritize different actions? (e.g., "quick approve" button prominent on mobile, full detail view on desktop)
- **Cross-device continuity:** Can a user start a flow on one device and continue on another? What state is preserved?

### State Management (Client-Side and Offline)
Specify how the application manages state across the flow:
- **Form state:** What happens to partially-filled forms on navigation away, browser refresh, or network loss?
- **Undo / redo:** Which actions support undo? How far back can the user go?
- **Offline behavior:** What can the user do without connectivity? What is queued for sync? What fails immediately?
- **Client-side caching:** What data is cached locally for instant display? When does it become stale?

### Animation and Transition Specification
Animations are not decoration — they communicate state changes and guide attention. Specify:
- **Purposeful transitions:** What state change does this animation communicate? (e.g., slide-left = forward navigation, fade = content update)
- **Duration and easing:** Keep under 300ms for UI transitions; use ease-out for entrances, ease-in for exits
- **Reduced motion:** Respect `prefers-reduced-motion` — provide instant alternatives for all animations
- **Loading indicators:** Skeleton screens for content, spinners for actions, progress bars for known-duration operations

### Error Taxonomy
Classify every error a user can encounter and specify the recovery path for each:

| Error Type | Example | User Message Pattern | Recovery Action |
|:---|:---|:---|:---|
| **Network** | Connection lost, timeout | "Unable to connect. Check your connection and try again." | Retry button, auto-retry with backoff |
| **Validation** | Invalid email format | Inline field error with specific guidance | Correct the field, resubmit |
| **Permission** | Insufficient access | "You don't have permission to do this. Contact your admin." | Link to request access or contact support |
| **Server** | 500 error, service unavailable | "Something went wrong on our end. We're looking into it." | Retry, status page link, support contact |
| **Not found** | Resource deleted or never existed | "This [item] couldn't be found." | Navigate back, search, or create new |
| **Conflict** | Concurrent edit, version mismatch | "This was modified by someone else. Review the changes." | Show diff, let user choose which version |

### Confirmation Patterns
Define when and how the system asks users to confirm actions:
- **Destructive actions:** Always require explicit confirmation for irreversible operations (delete, revoke, publish). Use a confirmation modal with the action name and consequence stated.
- **Undo over confirmation:** For reversible actions, prefer undo (toast with "Undo" button for 5-10 seconds) over blocking confirmation dialogs.
- **Double confirmation:** For catastrophic actions (delete organization, revoke all access), require typing the resource name or entering a code.
- **Confirmation placement:** Inline for minor actions, modal for significant actions, full-page for account-level changes.

### Notification Patterns
Define how the system communicates with users across contexts:

| Pattern | Use Case | Duration | Dismissable | Position |
|:---|:---|:---|:---|:---|
| **Toast** | Action confirmed, minor feedback | 5 seconds auto-dismiss | Yes | Bottom-center or bottom-right |
| **Banner** | System-wide status, ongoing issues | Until resolved | Yes (if non-critical) | Top of page, full width |
| **In-app notification** | Unread items, pending approvals | Until read | Yes (mark as read) | Bell icon / notification center |
| **Push notification** | Time-sensitive alerts when user is away | N/A (OS-managed) | Yes (swipe/tap) | OS notification tray |
| **Inline message** | Context-specific info within a form or flow | Persistent until addressed | No (must act) | Adjacent to the relevant element |

### Conflict Resolution

When your analysis conflicts with the user's stated preference:

1. **Present both positions** — show your analysis and their preference side by side
2. **Explain the trade-off** — what are the consequences of each choice?
3. **Recommend with reasoning** — state your recommendation and why
4. **Respect the user's decision** — they own the final call
5. **Document the decision** — record it as an `[owner-specified]` override with reasoning

### Document Length

Target length: **5-10 pages** (excluding appendices).

Shorter is better than longer. If the document exceeds the target, check for:
- Redundant content that can be cut
- Overly verbose explanations
- Content that belongs in a separate reference document
- Material the agent already knows (don't explain what HTTP is)

If the document is significantly shorter than the target, check for:
- Missing sections
- Insufficient detail in critical areas
- Unaddressed edge cases

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
1. **Primary task(s)**: What is the single most important thing a user is trying to accomplish in this flow?
2. **Known edge cases**: Are there specific failure modes, permission levels, or unusual paths that must be handled (e.g., expired session, no data yet, insufficient permissions)?

*Wait for the user's response to these questions before drafting the final specification.*

### Phase 2: Information Architecture (60 min)
Map every screen/page and how they nest or link. Produce a site map.

### Phase 3: User Journey Mapping (40-60 min)
Narrate the end-to-end journey(s) for the primary task(s), including any cross-session or multi-channel steps.

### Phase 4: Screen-by-Screen Flow (2-3 hrs)
For each screen in the journey: entry point, primary action(s), all four states (loading/empty/error/success), and every exit/navigation option.

### Phase 5: Edge Cases and Recovery Paths (40-60 min)
Walk through every known failure mode and unusual path. Ensure none result in a dead end.

### Phase 6: Accessibility Pass (30-40 min)
Verify keyboard navigation order, focus management, and that the flow is completable without a mouse.

### Phase 7: Revision (After User Review)

If the user requests changes after reviewing the document:

1. **Read the user's feedback carefully** — understand what they want changed
2. **Check for conflicts** — does the requested change conflict with prior documents?
3. **Apply changes** — update the document
4. **Re-run consistency check** — verify the change doesn't break cross-document consistency
5. **Update metadata** — set `last_updated` to today's date
6. **Confirm with user** — show the changes and get approval

## Gotchas

- **Specifying only the happy path.** The happy path is the easy part. The most common UX defect is missing states - what does the screen show when loading, when empty, when an error occurs, or when the user lacks permission? Every screen must specify all four states (loading, empty, error, success) or it is incomplete.
- **Creating dead-end screens.** A screen with no way to go back, forward, or recover is a UX defect. Every screen must have explicit exit points for every state - including error states. If a user can land on it, they must be able to leave it.
- **Confusing visual design with flow specification.** This document specifies behavior and structure, not colors, typography, or spacing. Stating "the error message is red" belongs in the design-system-specification. This document says "an inline error message appears with the field value preserved and a retry action available."
- **Forgetting accessibility as a flow concern.** Keyboard tab order, focus management after actions (where does focus land after a modal closes?), and whether the flow is completable without a mouse are structural flow decisions, not visual polish. They must be specified per-screen, not deferred.
- **Not cross-referencing personas.** A flow spec that does not connect to the personas and their jobs-to-be-done risks optimizing for the wrong user. Reference which persona(s) each flow serves and what job it fulfills, so reviewers can validate that the flow actually serves the defined user needs.

## Handoff

**Reads from:**
- `3-user-personas.md` — persona goals, journey context, friction tolerance
- `1-business-plan.md` — scope, feature priorities, user types
- `technical-specification` — functional requirements defining screen behavior

**Feeds into:**
- `design-system-specification` — component needs, interaction patterns, state requirements
- `system-architecture-document` — frontend component structure, API interaction points
- Implementation — screen-by-screen build specification

## Quality Gate

Before marking this document as `final`, verify:
- [ ] Every screen in the flow specifies all four states: loading, empty, error, and populated/success
- [ ] No screen is a dead end - every screen has explicit exit points including for error states
- [ ] The information architecture (site map) is complete and every screen in the flow appears in it
- [ ] Edge cases and recovery paths are documented in a table with no scenario resulting in an unrecoverable state
- [ ] Each screen includes accessibility notes covering keyboard navigation order and focus management

## Next Steps

After this document is complete, proceed to:
- **`design-system-specification`** — visual styling, tokens, and component library for these screens
- **`system-architecture-document`** — frontend architecture informed by flow and component needs
- Or invoke `using-engineering-docs` to continue the pipeline
