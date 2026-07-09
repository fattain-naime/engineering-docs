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
estimated_time: "3-5 hours"
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

### Anti-Patterns (What This Prevents)
- Vague requirements: "The system shall be fast" → **Wrong**. "The system shall respond to 95% of API requests within 200ms under 1,000 concurrent users" → **Correct**.
- Missing NFRs: specifying only functional behavior and ignoring performance, security, availability.
- Unverifiable requirements: "The system shall be easy to use." (How do you test this?)
- Scope creep: requirements that cannot be traced to a stated stakeholder need.

## Application

### Phase 1: Socratic Clarification & Brainstorming (Mandatory Interview)
Before writing any specification, you MUST interrogate the user's initial input, identify gaps, and ask **3-5 targeted clarifying questions** to dig deeper. Do NOT generate the template yet.
Ask questions to resolve:
1. **Scope boundaries**: What is explicitly in-scope vs. out-of-scope for the release?
2. **Key workflows**: What are the 1-2 most critical user pathways?
3. **Performance/Security NFR constraints**: Are there specific response time SLA targets, peak load requirements, or data compliance mandates (e.g. PCI, GDPR)?
4. **Integration systems**: What external systems must this interface with?
*Wait for the user's response to these questions before drafting the final specification.*

Work through the template.md section by section. For each requirement:
1. Assign a unique ID (`FR-XXX` or `NFR-XXX`)
2. Write the requirement using EARS syntax
3. Define the acceptance criterion
4. Tag the stakeholder who owns it
5. Mark any unresolved assumption with `🔶 Assumption` or any unknown with `🔵 Open Question`

### Phase 2: Context and Scope (30 min)
Establish who commissioned this, what the system boundaries are, what is in scope and explicitly out of scope.

### Phase 3: Stakeholder Analysis (30 min)
Identify every stakeholder class - users, operators, integrators, regulators. Define their primary goals and constraints.

### Phase 4: Functional Requirements (1-2 hrs)
Write all FR-XXX requirements in EARS syntax with measurable acceptance criteria.

### Phase 5: Non-Functional Requirements (1 hr)
Write all NFR-XXX requirements covering: performance, scalability, security, availability, reliability, compliance, maintainability, portability.

### Phase 6: Constraints, Dependencies, Assumptions (30 min)
Document technical constraints (language, platform, framework), external dependencies, and explicit assumptions.

### Phase 7: Traceability Matrix (30 min)
Map each requirement to at least one test case or acceptance criterion.
