---
name: technical-specification
argument-hint: "[system or feature name]"
description: Write a technical specification (SRS/TSD) that captures stakeholder needs, system requirements, functional behavior, non-functional constraints, and acceptance criteria. Use when starting any significant engineering initiative.
intent: >-
  Produce a complete, ISO/IEC/IEEE 29148-aligned Software Requirements Specification (SRS) or Technical Specification Document (TSD) that transforms raw stakeholder needs into unambiguous, verifiable engineering requirements. This prevents the most expensive class of software defect: building the wrong thing correctly. Every requirement produced is specific, measurable, achievable, relevant, and traceable (SMART). Functional requirements describe system behavior; non-functional requirements (performance, security, scalability, reliability) define quality constraints. The document serves as the contract between business stakeholders and the engineering team.
type: workflow
theme: engineering-docs
best_for:
  - "Starting a new product, service, or major subsystem from scratch"
  - "Formalizing requirements before architecture or design begins"
  - "Creating a baseline for test plan and acceptance criteria"
  - "Regulatory or compliance contexts requiring traceability"
scenarios:
  - "Write a technical specification for a payment processing microservice that handles refunds"
  - "I need an SRS for our new multi-tenant user authentication system"
  - "Define the requirements for a real-time inventory sync between our warehouse and ERP"
estimated_time: "6-12 hours"
license: MIT
compatibility: Designed for Gemini (Antigravity), Claude Code, Cursor/Windsurf, Kimi Code, Codex/Copilot
---

## Purpose

Produce a complete Software Requirements Specification (SRS) / Technical Specification Document (TSD) that transforms stakeholder intent into unambiguous, verifiable engineering requirements. This is the foundational document from which architecture, design, test plans, and acceptance criteria are derived.

Requirements written poorly - ambiguous, unmeasurable, or untestable - are the root cause of the majority of software project failures. This skill eliminates that risk.

## Input

**Works best with:** The name of the system, service, or feature being specified.
**Also valuable:** Stakeholder interviews, user stories, existing system behavior, business rules, regulatory constraints, SLAs, performance benchmarks, security policies.

Anything supplied in the invocation is treated as known context. Do not re-ask for information already provided.

**Example invocation:** `Write a technical specification for a webhook delivery system that retries failed deliveries with exponential backoff, supports HMAC-SHA256 signing, and must handle 10,000 events per minute.`

## Key Concepts

### Requirement Quality (SMART + EARS)
Every requirement must be:
- **Specific** - no ambiguous terms ("fast", "user-friendly", "scalable" without a number)
- **Measurable** - has a quantifiable acceptance criterion
- **Achievable** - technically feasible within stated constraints
- **Relevant** - directly serves a stakeholder need
- **Traceable** - has a unique identifier and can be linked to test cases

Use the **EARS syntax** for writing requirements:
- **Ubiquitous:** The `<system>` shall `<action>`.
- **Event-driven:** When `<event>`, the `<system>` shall `<action>`.
- **Conditional:** Where `<condition>`, the `<system>` shall `<action>`.
- **State-driven:** While `<state>`, the `<system>` shall `<action>`.

### Functional vs Non-Functional Requirements
- **Functional (FR):** What the system does - behavior, data processing, business rules.
- **Non-Functional (NFR):** How the system performs - performance, security, availability, scalability, compliance.

NFRs are equally important as FRs. An NFR without a measurable target is useless.

### Standard: ISO/IEC/IEEE 29148:2018
This skill aligns with ISO/IEC/IEEE 29148, which supersedes IEEE 830-1998. Key principles:
- Requirements are defined at both stakeholder and system level
- Requirements are iterative and refined throughout the lifecycle
- Every requirement is uniquely identified (e.g., `FR-001`, `NFR-003`)
- Traceability matrix links requirements to design, test, and implementation artifacts

### EARS Syntax Examples (All Four Patterns)

**Ubiquitous (always applies):**
> The webhook delivery system shall retry failed deliveries up to 3 times.

**Event-driven (triggered by occurrence):**
> When a payment succeeds, the system shall send a webhook notification to the merchant's registered endpoint within 30 seconds.

**Conditional (applies under a specific condition):**
> Where the merchant's account is in sandbox mode, the system shall not charge real payment instruments.
> Where the request includes an `Idempotency-Key` header, the system shall return the cached response for duplicate keys within 24 hours.

**State-driven (applies while in a specific state):**
> While the delivery status is `retrying`, the system shall apply exponential backoff with jitter between attempts.
> While the system is in maintenance mode, the API shall return HTTP 503 with a `Retry-After` header.

### Requirement Granularity

Requirements must be atomic: one testable assertion per requirement ID. Split compound requirements.

**Bad (compound, untestable):**
> The system shall authenticate users and store their preferences and send welcome emails.

**Good (atomic, each independently testable):**
> FR-001: When a user submits valid credentials, the system shall return a JWT with a 15-minute expiry.
> FR-002: When a user updates their preferences, the system shall persist the changes within 500ms.
> FR-003: When a new user completes registration, the system shall send a welcome email within 60 seconds.

### Hard vs Soft Constraints

- **Hard constraints** are non-negotiable requirements that, if violated, make the system unfit for purpose. They block release. Example: "All payment data shall be encrypted at rest using AES-256."
- **Soft constraints** are desirable targets that may be relaxed under negotiation. They trigger a review but do not block release. Example: "The dashboard should load within 2 seconds under normal load."

Tag every NFR as `hard` or `soft` in the traceability matrix. Hard constraints have zero-tolerance acceptance criteria; soft constraints have target and minimum thresholds.

### Anti-Patterns (What This Prevents)
- Vague requirements: "The system shall be fast" → **Wrong**. "The system shall respond to 95% of API requests within 200ms under 1,000 concurrent users" → **Correct**.
- Missing NFRs: specifying only functional behavior and ignoring performance, security, availability.
- Unverifiable requirements: "The system shall be easy to use." (How do you test this?)
- Scope creep: requirements that cannot be traced to a stated stakeholder need.

### Conflict Resolution

When your analysis conflicts with the user's stated preference:

1. **Present both positions** — show your analysis and their preference side by side
2. **Explain the trade-off** — what are the consequences of each choice?
3. **Recommend with reasoning** — state your recommendation and why
4. **Respect the user's decision** — they own the final call
5. **Document the decision** — record it as an `[owner-specified]` override with reasoning

### Document Length

Target length: **10-20 pages** (excluding appendices).

Shorter is better than longer. If the document exceeds the target, check for:
- Redundant content that can be cut
- Overly verbose explanations
- Content that belongs in a separate reference document
- Material the agent already knows (don't explain what HTTP is)

If the document is significantly shorter than the target, check for:
- Missing sections
- Insufficient detail in critical areas
- Unaddressed edge cases

### Data Model Guidance

When the system involves persistent data, include a **Data Model** section in the specification with:
- An ERD (Entity-Relationship Diagram) using Mermaid notation showing all entities, relationships, and cardinality.
- Each entity must have its primary key, key attributes, and relationship to other entities documented.
- Identify sensitive data fields and their classification (Public, Internal, Confidential, Restricted).
- Document data retention and deletion policies per entity.

### Error Handling Specification

Define a systematic error handling strategy:
- **Error Code Taxonomy:** Define a hierarchical error code scheme (e.g., `PAYMENT_FAILED_INSUFFICIENT_FUNDS`, `WEBHOOK_DELIVERY_TIMEOUT`). Every error the system can produce must have a unique, documented code.
- **Error Response Format:** Standardize on a single error response schema (RFC 7807 Problem Details recommended). Include: type URI, title, status, detail, instance, and a structured `errors` array for validation failures.
- **Retry Policies:** For every recoverable error, specify: retry count, backoff strategy (linear, exponential, jitter), maximum retry window, and dead-letter behavior after exhaustion.
- **Error Propagation Rules:** Define which errors are surfaced to end users, which are logged only, and which trigger alerts.

### API Design Standards

When the system exposes or consumes APIs:
- **Naming Conventions:** Resources are plural nouns (`/payments`, not `/payment`). Use kebab-case for multi-word paths. Consistent verb mapping via HTTP methods.
- **Versioning:** Specify the versioning strategy (URI `/v1/` recommended for public APIs, header versioning for internal). Document the deprecation and sunset policy.
- **Pagination:** Every list endpoint must define pagination (offset or cursor). Specify default page size, maximum page size, and the pagination envelope format.

### Migration Specification

When the system replaces or integrates with an existing system:
- **Data Migration:** Document the source-to-target mapping for every data entity. Include transformation rules, data cleansing requirements, and validation criteria.
- **Backward Compatibility:** Specify which existing contracts (APIs, data formats, file formats) must remain compatible during and after migration. Define the compatibility window and deprecation schedule.
- **Cutover Strategy:** Document the migration phases (parallel run, canary, big-bang) and the rollback procedure for each phase.

### Monitoring and Alerting Requirements

Define observable behavior requirements:
- **Metrics:** What must be measured (request rate, error rate, latency percentiles, queue depth, connection pool utilization).
- **Alerts:** Define alert thresholds, severity levels (P1-P4), and escalation paths.
- **Dashboards:** Specify what operational dashboards are required and what they display.
- **SLOs/SLIs:** Map each NFR to a Service Level Indicator and Service Level Objective with error budget policy.

### Test Case Specification

Every requirement must map to at least one test case. Use this structure:
- **Test Case ID:** TC-XXX (linked to requirement FR-XXX or NFR-XXX)
- **Preconditions:** What state must exist before the test runs
- **Steps:** Numbered, specific actions
- **Expected Result:** Exact observable outcome
- **Type:** Unit / Integration / End-to-End / Performance / Security

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
1. **Key workflows**: What are the 1-2 most critical user pathways?
2. **Integration systems**: What external systems must this interface with?

*Wait for the user's response to these questions before drafting the final specification.*

Work through the template.md section by section. For each requirement:
1. Assign a unique ID (`FR-XXX` or `NFR-XXX`)
2. Write the requirement using EARS syntax
3. Define the acceptance criterion
4. Tag the stakeholder who owns it
5. Mark any unresolved assumption with `🔶 Assumption` or any unknown with `🔵 Open Question`

### Phase 2: Context and Scope (60 min)
Establish who commissioned this, what the system boundaries are, what is in scope and explicitly out of scope.

### Phase 3: Stakeholder Analysis (60 min)
Identify every stakeholder class - users, operators, integrators, regulators. Define their primary goals and constraints.

### Phase 4: Functional Requirements (2-4 hrs)
Write all FR-XXX requirements in EARS syntax with measurable acceptance criteria.

### Phase 5: Non-Functional Requirements (2 hrs)
Write all NFR-XXX requirements covering: performance, scalability, security, availability, reliability, compliance, maintainability, portability.

### Phase 6: Constraints, Dependencies, Assumptions (60 min)
Document technical constraints (language, platform, framework), external dependencies, and explicit assumptions.

### Phase 7: Traceability Matrix (60 min)
Map each requirement to at least one test case or acceptance criterion.

### Phase 8: Revision (After User Review)

If the user requests changes after reviewing the document:

1. **Read the user's feedback carefully** — understand what they want changed
2. **Check for conflicts** — does the requested change conflict with prior documents?
3. **Apply changes** — update the document
4. **Re-run consistency check** — verify the change doesn't break cross-document consistency
5. **Update metadata** — set `last_updated` to today's date
6. **Confirm with user** — show the changes and get approval

## Gotchas

- **Writing vague, unmeasurable requirements.** "The system shall be fast" or "The system shall be user-friendly" cannot be tested or verified. Every requirement must have a quantifiable acceptance criterion - specify the exact metric, threshold, and measurement method (e.g., "p99 latency <= 200ms at 1000 concurrent users").
- **Skipping non-functional requirements.** Teams often produce thorough functional requirements and then tack on a single "the system shall perform well" NFR. Performance, security, availability, scalability, and compliance each need their own specific, measurable requirements with acceptance criteria.
- **Missing traceability from requirement to test case.** A requirement without a linked test case is just a wish. Every FR-XXX and NFR-XXX must map to at least one concrete test case or acceptance criterion in the traceability matrix - if you cannot write a test for it, rewrite the requirement.
- **Not explicitly stating what is out of scope.** Failing to define out-of-scope items is an open invitation for scope creep. The "Out of Scope" section is as critical as the "In Scope" section - every excluded capability needs a reason.
- **Confusing assumptions with requirements.** Assumptions are things believed to be true but unvalidated; requirements are commitments. If an assumption is wrong and would change the requirements, it must be flagged with an owner and validation deadline, not buried in the requirements as a soft constraint.

## Handoff

**Reads from:**
- `1-business-plan.md` — problem statement, users, scope, standing constraints
- `2-project-plan.md` — scope boundaries, timeline constraints, team capacity
- `3-user-personas.md` — user-driven functional requirements, success metrics
- `technical-feasibility-study` — feasibility verdict, conditional requirements, risk findings

**Feeds into:**
- `system-architecture-document` — functional and non-functional requirements driving architecture
- `ux-flow-specification` — functional requirements defining screen behavior
- `test-plan` — acceptance criteria and traceability matrix

## Quality Gate

Before marking this document as `final`, verify:
- [ ] Every requirement uses EARS syntax, has a unique FR-XXX or NFR-XXX identifier, and includes at least one measurable acceptance criterion
- [ ] All NFRs have specific numeric targets (not "fast", "scalable", or "secure" without a number)
- [ ] The traceability matrix maps every requirement to at least one test case with no orphaned requirements
- [ ] The "Out of Scope" section is populated and every exclusion has a documented reason
- [ ] All assumptions are flagged as validated or unvalidated with an owner and target resolution date, and no open questions remain unresolved

## Next Steps

After this document is complete, proceed to:
- **`system-architecture-document`** — architectural structure driven by these requirements
- **`ux-flow-specification`** — screen-by-screen flows implementing functional requirements
- Or invoke `using-engineering-docs` to continue the pipeline
