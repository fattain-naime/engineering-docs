---
name: technical-blueprint
argument-hint: "[feature or component name]"
description: Write a Technical Design Document (TDD) / Software Design Document (SDD) that details how a specific feature or component will be built. Covers problem statement, proposed design, data model, API contracts, alternatives considered, security threat analysis, test plan, and rollback plan. Use when an engineer or team needs to align on the implementation approach before writing code.
intent: >-
  Produce a Google/Stripe-quality technical design document that forces precise thinking about implementation before a line of code is written. The most valuable outcome of this document is not the design itself, but the conversations it provokes - uncovering assumptions, surfacing edge cases, and aligning the team on trade-offs before they become expensive bugs. A technical blueprint answers: what exactly are we building, how exactly does it work, what did we consider and reject, what can go wrong, and how do we know it works?
type: workflow
theme: engineering-docs
best_for:
  - "Designing a new feature or component that involves non-trivial technical decisions"
  - "Getting team alignment before implementation begins on complex work"
  - "Documenting trade-offs for future engineers who will maintain or extend the system"
  - "Satisfying a pre-implementation review process"
scenarios:
  - "Write a technical design document for implementing a token-based webhook signing system"
  - "Design how we will add two-factor authentication (TOTP) to our admin portal"
  - "Create a TDD for migrating our synchronous payment processing to an async queue-based system"
estimated_time: "2-4 hours"
license: MIT
compatibility: Designed for Gemini (Antigravity), Claude Code, Cursor/Windsurf, Kimi Code, Codex/Copilot
---

## Purpose

Produce a Technical Design Document (TDD) that captures the engineering design of a specific feature or component with enough detail that any qualified engineer on the team can implement it correctly. This document is a **thinking tool first, an artifact second** - the process of writing it surfaces gaps before they become production bugs.

Unlike an architecture document (what the system is), a blueprint specifies **how a specific piece will be built**.

## Input

**Works best with:** The name of the feature, component, or change to be designed.
**Also valuable:** The technical specification or requirements document, existing codebase context, known constraints (performance targets, security requirements, API contracts that must be maintained).

**Example invocation:** `Write a technical design document for adding TOTP-based two-factor authentication to the admin login flow. We use PHP 8.3, PDO/MySQL, and Twig templates. The TOTP secret must be stored encrypted. Recovery codes must be supported.`

## Key Concepts

### Design Doc Philosophy (Google/Stripe Standard)
A design doc is:
- **Short as possible, long as necessary.** If it takes more than 45 minutes to read, it is too long.
- **Trade-off focused.** The Alternatives Considered section is mandatory. It proves you evaluated options.
- **A conversation starter.** Share early and revise often. A design doc is not a contract.
- **Living.** Update it as the implementation evolves. Stale design docs are worse than no design docs.

### The Mandatory Sections
These three sections separate a senior engineer's design doc from a junior one:
1. **Alternatives Considered** - What else was evaluated and why it was rejected
2. **Security Considerations / Threat Model** - What can be attacked or abused
3. **Rollback Plan** - What happens if this change needs to be reverted

### Anti-Patterns
- Jumping to implementation details without stating the problem.
- Designing in isolation and presenting as a fait accompli.
- Skipping alternatives considered ("we just knew this was right").
- No measurable success criteria.
- No rollback plan ("it's fine, we'll figure it out").

## Application

### Phase 1: Socratic Clarification & Brainstorming (Mandatory Interview)
Before writing any technical blueprint, you MUST interrogate the user's initial input, identify gaps, and ask **3-5 targeted clarifying questions** to dig deeper. Do NOT generate the template yet.
Ask questions to resolve:
1. **User pathways**: What is the primary user journey or trigger for this feature?
2. **Database/Storage context**: Does this require new database tables, fields, indexes, or changes to existing schema?
3. **Core API structure**: Will this introduce new endpoints or modify existing request/response formats?
4. **Third-party systems**: Does this rely on any external APIs, webhooks, or messaging brokers?
*Wait for the user's response to these questions before drafting the final blueprint.*

### Phase 2: Problem and Context (20 min)
State the problem, motivation, and goals precisely. Define explicit non-goals.

### Phase 3: Proposed Design (60-90 min)
Describe the solution at the right level of detail: high-level approach, key algorithms or patterns, data model changes, API contract changes.

### Phase 4: Alternatives Considered (20 min)
Document at least two alternatives and why they were rejected with specific reasoning.

### Phase 5: Security and Risk (20 min)
Apply basic STRIDE thinking to the proposed design. What new attack surface does this introduce?

### Phase 6: Test Plan and Rollback (20 min)
Define how correctness is verified and what the rollback procedure is if this fails in production.
