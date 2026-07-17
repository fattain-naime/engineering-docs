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
estimated_time: "4-8 hrs"
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

### Observability

Every new feature must be observable in production. Document in the blueprint:
- **Logging:** What structured log events does this feature emit? Include correlation IDs, operation type, duration, and outcome. Define log levels (ERROR for failures, WARN for degraded state, INFO for business events).
- **Metrics:** What metrics does this feature expose? (e.g., request count, error rate, latency histogram, queue depth, custom business metrics like "payments_processed_total").
- **Tracing:** How does this feature participate in distributed tracing? What spans are created? What context is propagated?
- **Alerting:** What conditions should trigger alerts? Define thresholds, severity levels (P1-P4), and escalation paths.

### Feature Flag Strategy

When a feature is rolled out incrementally or may need to be disabled quickly:
- **Flag name:** Descriptive, namespaced (e.g., `feature_totp_2fa`, `feature_webhook_v2`).
- **Flag type:** Boolean toggle, percentage rollout, user allowlist, or environment-based.
- **Default state:** Off (safe default) or On (for must-have features).
- **Rollout phases:** Internal testing -> staging -> canary (5%) -> full rollout.
- **Cleanup plan:** When and how the flag is removed after full rollout. Flags that live indefinitely become tech debt.

### Data Migration Strategy

When the feature requires schema changes or data migration:
- **Migration type:** Additive only (new tables/columns) vs destructive (column renames, type changes).
- **Backward compatibility:** Can the old code run against the new schema? Can the new code run against the old schema?
- **Data backfill:** Is existing data migrated? How? (Background job, on-read migration, one-time script.)
- **Rollback:** Can the migration be reversed? What data is lost if rolled back?

### Backward Compatibility Testing

When the feature changes existing behavior or contracts:
- **API compatibility:** Do existing API consumers break? Run contract tests against the old OpenAPI spec.
- **Data compatibility:** Can old data be read by new code? Can new data be read by old code during rollback?
- **Configuration compatibility:** Do old config files still work? Are new config values optional with sensible defaults?

### Documentation Requirements

Every feature blueprint must specify what documentation is needed:
- **API documentation:** OpenAPI spec updates, changelog entry.
- **Runbook:** Operations guide for on-call engineers (how to monitor, troubleshoot, and recover from failures).
- **User documentation:** End-user guides, admin guides, migration guides.
- **ADR:** If the design made a significant architectural decision, create an Architecture Decision Record.

### Monitoring and Alerting Setup

Before the feature ships, the following must be in place:
- **Dashboards:** What operational dashboard panels are needed? What do they display?
- **Alerts:** What thresholds trigger alerts? What is the severity? Who is paged?
- **SLOs:** Does this feature affect existing SLOs? Are new SLIs defined?
- **Runbook link:** Every alert must link to a runbook with diagnosis and remediation steps.

### Error Path Handling

Sequence diagrams must show error paths, not just the happy path. For every critical flow:
- Document what happens when each external call fails (timeout, 5xx, network error).
- Document retry behavior (count, backoff, circuit breaker).
- Document fallback behavior when a dependency is unavailable (cached response, degraded mode, queue for later).
- Document what the user sees for each error scenario.

### Performance Estimation

Before implementation, estimate the performance impact:
- **Added latency:** How many milliseconds does this feature add to existing request paths?
- **Added queries:** How many additional database queries per request?
- **Memory impact:** Does this feature add memory pressure (large caches, in-memory state)?
- **CPU impact:** Does this feature add CPU-intensive operations (crypto, serialization, image processing)?
- **Load test plan:** What load test validates the performance estimate?

### Dependency and Blocker Tracking

Document what this feature depends on and what blocks it:
- **Upstream dependencies:** What must be completed before this feature can start? (Other features, infrastructure, third-party integrations.)
- **Downstream dependents:** What features or teams depend on this being completed?
- **External blockers:** Vendor approvals, security reviews, compliance audits.
- **Decision dependencies:** What decisions must be made before implementation can proceed?

### Anti-Patterns
- Jumping to implementation details without stating the problem.
- Designing in isolation and presenting as a fait accompli.
- Skipping alternatives considered ("we just knew this was right").
- No measurable success criteria.
- No rollback plan ("it's fine, we'll figure it out").
- Sequence diagrams that only show the happy path.
- No observability plan ("we'll add logging later").

### Document Length

Target length: **5-10 pages per feature** (excluding appendices).

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

1. **Present both positions** — show your analysis and their preference side by side
2. **Explain the trade-off** — what are the consequences of each choice?
3. **Recommend with reasoning** — state your recommendation and why
4. **Respect the user's decision** — they own the final call
5. **Document the decision** — record it as an `[owner-specified]` override with reasoning

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
1. **Error handling expectations**: What are the critical error recovery paths for this feature (e.g., what happens when external calls fail)?
2. **Observability requirements**: What specific logging, metrics, or alerting is needed for this feature?

*Wait for the user's response to these questions before drafting the final blueprint.*

### Phase 2: Problem and Context (40-60 min)
State the problem, motivation, and goals precisely. Define explicit non-goals.

### Phase 3: Proposed Design (2-3 hrs)
Describe the solution at the right level of detail: high-level approach, key algorithms or patterns, data model changes, API contract changes.

### Phase 4: Alternatives Considered (40-60 min)
Document at least two alternatives and why they were rejected with specific reasoning.

### Phase 5: Security and Risk (40-60 min)
Apply basic STRIDE thinking to the proposed design. What new attack surface does this introduce?

### Phase 6: Test Plan and Rollback (40-60 min)
Define how correctness is verified and what the rollback procedure is if this fails in production.

### Phase 7: Revision (After User Review)

If the user requests changes after reviewing the blueprint:

1. **Read the user's feedback carefully** — understand what they want changed
2. **Check for conflicts** — does the requested change contradict the database schema, API contracts, or security requirements from upstream documents?
3. **Apply changes** — update the document, cascading changes through the design, alternatives, security analysis, and test plan
4. **Re-run consistency check** — verify the design still references valid data model entities, API endpoints, and security controls
5. **Update metadata** — set `last_updated` to today's date
6. **Confirm with user** — show the changes and get approval

## Gotchas

- **Jumping to implementation details without a clear problem statement.** Agents that skip the "why" and go straight to code design produce documents that look thorough but solve the wrong problem. The problem statement with evidence (error rates, support tickets, business impact) must come first.
- **Writing "Alternatives Considered" as an afterthought.** The alternatives section is not a formality -- it is what separates a senior design doc from a junior one. Agents that list alternatives with vague rejections like "too complex" without specific, evidence-based reasoning undermine the document's credibility.
- **Omitting the rollback plan.** Every design that touches production needs a rollback plan with specific trigger conditions and exact steps. "We'll figure it out if it breaks" is not a plan. Agents that skip this section leave on-call engineers unprepared.
- **Designing in isolation without surfacing assumptions.** A technical blueprint is a conversation starter, not a contract. Agents that present a design as a fait accompli without listing open questions and assumptions miss the feedback that prevents costly implementation mistakes.
- **Ignoring security considerations for non-security features.** Every new feature introduces new attack surface. Agents that skip the security section for "non-security" features (like a reporting dashboard or notification system) miss IDOR, data exposure, and authorization bypass risks.

## Handoff

**Reads from:**
- `4-technical-specification.md` — functional and non-functional requirements
- `7-system-architecture.md` — architectural patterns, technology decisions
- `8-database-design-document.md` — data model, table definitions
- `9-api-design-document.md` — API contracts, endpoint specifications
- `11-admin-access-control-specification.md` — permission requirements
- `12-security-threat-model.md` — threat mitigations to incorporate

**Feeds into:**
- `15-implementation-plan.md` — feature designs sequenced into build phases
- ADRs — decisions captured during design that warrant permanent records

## Quality Gate

Before marking this document as `final`, verify:
- [ ] The problem statement includes concrete evidence (metrics, tickets, benchmarks) justifying why this needs to be built now
- [ ] At least two alternatives are documented with specific, evidence-based rejection reasoning
- [ ] A rollback plan exists with explicit trigger conditions and numbered steps an on-call engineer can follow
- [ ] Security considerations address new attack surface introduced by this design (STRIDE analysis)
- [ ] The test plan covers unit, integration, and at least one end-to-end scenario with pass criteria

## Next Steps

After this document is complete, proceed to:
- **`implementation-plan`** — sequence this feature into the overall build phases
- **`architecture-decision-record`** — if the design made a significant architectural choice worth recording permanently
- Or invoke `using-engineering-docs` to continue the pipeline
