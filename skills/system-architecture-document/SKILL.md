---
name: system-architecture-document
argument-hint: "[system name]"
description: Create a System Architecture Document (SAD) with C4 model diagrams, 4+1 view decomposition, integration maps, NFR constraints, and an Architecture Decision Record log. Use when documenting how an entire system or major subsystem is structured.
intent: >-
  Produce a comprehensive, stakeholder-appropriate System Architecture Document that maps the full structural picture of a software system across four levels of abstraction (C4 Model), five architectural views (4+1 View Model), and captures the architectural decisions that shaped it (ADR log). The SAD is the definitive reference for understanding how the system is organized, why key architectural choices were made, and how the system connects to the world around it. It serves onboarding engineers, architects reviewing change impact, security auditors, and operators planning infrastructure changes.
type: workflow
theme: engineering-docs
best_for:
  - "Documenting the architecture of a new system before implementation begins"
  - "Producing architectural documentation for an existing system that lacks it"
  - "Preparing architecture documentation for a security or compliance review"
  - "Onboarding senior engineers or architects to an unfamiliar system"
scenarios:
  - "Document the system architecture for our payment gateway platform"
  - "Create a SAD for our new microservices-based notification system"
  - "I need a C4 diagram and architecture overview for our SaaS billing platform"
estimated_time: "8-16 hours"
license: MIT
compatibility: Designed for Gemini (Antigravity), Claude Code, Cursor/Windsurf, Kimi Code, Codex/Copilot
---

## Purpose

Produce a System Architecture Document (SAD) that gives every stakeholder - from non-technical product leadership to infrastructure engineers - the right level of detail about the system's structure. This document answers:

- **What** components make up the system?
- **How** do they communicate?
- **Why** was the architecture designed this way?
- **Where** does data flow and where are the trust boundaries?
- **What** are the non-functional constraints the architecture must satisfy?

## Input

**Works best with:** The name of the system or subsystem being documented.
**Also valuable:** Existing diagrams, technology stack decisions, known integration points, existing ADRs, NFR targets.

**Example invocation:** `Create a system architecture document for PayFlow, a multi-brand payment gateway with a PHP 8.3 backend, MySQL database, custom plugin system, and white-label domain routing.`

## Key Concepts

### C4 Model (Simon Brown)
The C4 Model provides a hierarchical, developer-friendly approach to architecture documentation - like a "Google Maps" with multiple zoom levels:

- **Level 1: System Context** - The system's place in the world. Users and external systems. Intended for all stakeholders.
- **Level 2: Container** - The major deployable units (web apps, APIs, databases, queues). Intended for technical leads and architects.
- **Level 3: Component** - The internal structure of a container (controllers, services, repositories). Intended for developers.
- **Level 4: Code** - Class/function level. Usually omitted as IDEs serve this better.

Always use Mermaid for diagrams to keep them version-controllable.

### 4+1 View Model (Kruchten)
Five complementary views of the same architecture:
- **Logical View** - Functional decomposition (classes, modules, layers)
- **Process View** - Runtime behavior, concurrency, synchronization
- **Development View** - Code organization, modules, packages
- **Deployment / Physical View** - Infrastructure, nodes, network topology
- **Scenarios (+1)** - Key use cases that validate the other four views

### Architecture Decision Records (ADRs)
Every significant architectural decision must be recorded as an immutable ADR. The SAD contains an inline ADR template and an ADR log that summarizes each decision.

ADR states: `Proposed` → `Accepted` → `Deprecated` → `Superseded by ADR-XXX`

**Inline ADR Template:**

```markdown
### ADR-[NNN]: [Decision Title]

**Status:** `Proposed` | `Accepted` | `Deprecated` | `Superseded by ADR-XXX`
**Date:** YYYY-MM-DD
**Deciders:** [Name, Role]

**Context:** [What is the issue that requires a decision? What are the forces at play?]

**Decision:** [What was decided?]

**Alternatives Considered:**
| Alternative | Pros | Cons | Why Rejected |
| :--- | :--- | :--- | :--- |
| [Option A] | [Pros] | [Cons] | [Reason] |
| [Option B] | [Pros] | [Cons] | [Reason] |

**Consequences:**
- [Positive consequence 1]
- [Negative consequence / trade-off]
- [Risk introduced and how it is mitigated]
```

### Security Architecture

Include a dedicated section covering:
- **Threat Model Summary:** Reference the STRIDE analysis from `security-threat-model`. Document the key threat categories relevant to this architecture and the architectural controls that address them.
- **Security Controls by Layer:** For each trust zone (external, DMZ, internal, data), document the specific controls: WAF rules, input validation, authentication enforcement, encryption, access controls.
- **Secrets Management:** How secrets (API keys, DB credentials, encryption keys) are stored, rotated, and accessed. No secrets in code or config files.
- **Network Security:** Firewall rules, network segmentation, TLS termination points, VPN/private link requirements.

### Disaster Recovery

- **RPO (Recovery Point Objective):** Maximum acceptable data loss measured in time (e.g., "1 hour of data loss is acceptable").
- **RTO (Recovery Time Objective):** Maximum acceptable downtime measured in time (e.g., "system must be restored within 4 hours").
- **Backup Strategy:** What is backed up (database, files, configuration), frequency, retention period, storage location, and encryption.
- **Failover Strategy:** Active-passive, active-active, or manual failover. Document the failover procedure and expected duration.
- **DR Testing:** How often DR procedures are tested and what constitutes a successful test.

### Observability Architecture

- **Logging:** Structured logging format (JSON), log levels, correlation IDs across services, log aggregation pipeline, retention policy.
- **Metrics:** Key metrics collected (request rate, error rate, latency percentiles, queue depth, resource utilization), collection method (Prometheus, CloudWatch, etc.), and cardinality limits.
- **Distributed Tracing:** Trace propagation strategy (W3C Trace Context, B3), sampling rate, trace storage and querying.
- **Alerting:** Alert severity levels (P1-P4), escalation paths, on-call rotation, alert fatigue prevention (grouping, silencing policies).

### Data Architecture

- **Schema Design:** High-level data model overview, key entities, and their relationships. Reference `database-design-document` for full schema.
- **Partitioning Strategy:** How large tables are partitioned (range by date, hash by tenant) and the rationale.
- **Caching Strategy:** What is cached (session data, hot queries, computed aggregations), cache invalidation policy, cache topology (local, distributed, CDN).
- **Data Lifecycle:** Retention policies per data category, archival strategy, GDPR erasure procedures.

### API Governance

- **Versioning Policy:** URI vs header versioning, deprecation timeline, sunset enforcement.
- **Deprecation Process:** How deprecated endpoints are communicated to consumers, monitoring of deprecated endpoint usage.
- **Rate Limiting:** Global rate limits, per-consumer limits, burst allowances, rate limit response headers.
- **API Gateway:** Whether an API gateway is used and what concerns it handles (auth, rate limiting, routing, transformation).

### Cost Model

- **Infrastructure Cost Estimate:** Monthly cost breakdown by component (compute, database, storage, network, third-party services).
- **Scaling Cost Curve:** How costs change at 10x and 100x current scale.
- **Cost Optimization Levers:** Reserved instances, auto-scaling policies, storage tiering, caching to reduce compute.

### Testing Architecture

- **Test Environments:** What environments exist (local, CI, staging, production) and how they differ.
- **CI/CD Pipeline:** Build, test, and deploy stages. What gates exist before production (unit tests, integration tests, security scans, manual approval).
- **Test Data Strategy:** How test data is generated or anonymized. No production data in non-production environments.
- **Contract Testing:** How API contracts between services are verified (e.g., Pact, OpenAPI validation).

### Development View

- **Code Organization:** How the codebase is structured (monorepo vs polyrepo, module boundaries, package structure).
- **Module Boundaries:** What each module/package owns, its public API, and its dependency rules.
- **Dependency Management:** How dependencies are declared, updated, and audited. Policy for evaluating new dependencies.
- **Build and Release:** Build system, artifact management, release process, versioning scheme.

### Non-C4 Architectures

Not all systems are best described with C4. When the system uses non-traditional patterns, supplement C4 with:
- **Serverless Architecture:** Document Lambda/Cloud Functions, event triggers, cold start mitigation, execution limits, vendor lock-in analysis.
- **Event-Driven Architecture:** Document event schemas, event bus/broker, event sourcing vs CQRS patterns, eventual consistency guarantees, dead-letter handling.
- **Micro-Frontend Architecture:** Module federation, shared state management, routing strategy, deployment independence.

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
1. **User load & performance targets**: What are the estimated concurrent users, transaction throughput (TPS), or data storage scale targets?
2. **Resiliency/Availability goals**: What are the target uptime SLAs, disaster recovery goals (RPO/RTO), or multi-region requirements?

*Wait for the user's response to these questions before drafting the final architecture document.*

### Phase 2: System Context (60 min)
Define system boundaries, actors, and external system dependencies. Produce Level 1 C4 diagram.

### Phase 3: Container Architecture (2 hrs)
Decompose into deployable units. Produce Level 2 C4 diagram with technology choices.

### Phase 4: Component Architecture (2-4 hrs)
Decompose key containers into major internal components. Produce Level 3 C4 diagrams for critical containers only.

### Phase 5: Deployment View (90 min)
Map containers to infrastructure. Document network topology, regions, and external services.

### Phase 6: Integration and Data Flow (60 min)
Map all integration points. Document data flow, trust boundaries, and API contracts.

### Phase 7: Non-Functional Requirements and Quality Attributes (60 min)
Document architectural decisions driven by performance, scalability, security, and reliability NFRs.

### Phase 8: ADR Log (60 min per ADR)
Document each significant architectural decision.

### Phase 9: Revision (After User Review)

If the user requests changes after reviewing the document:

1. **Read the user's feedback carefully** — understand what they want changed
2. **Check for conflicts** — does the requested change conflict with prior documents?
3. **Apply changes** — update the document
4. **Re-run consistency check** — verify the change doesn't break cross-document consistency
5. **Update metadata** — set `last_updated` to today's date
6. **Confirm with user** — show the changes and get approval

## Gotchas

- **Drawing diagrams at only one C4 level.** Agents often produce a container diagram and stop. The C4 model requires multiple zoom levels: System Context (Level 1) for all stakeholders, Container (Level 2) for technical leads, and Component (Level 3) for developers. Skipping levels forces every audience to read the same abstraction.
- **Omitting the Alternatives Considered section for major decisions.** Architecture documents that state "we chose X" without explaining why Y and Z were rejected are incomplete. Future engineers will re-investigate rejected paths if the reasoning is not recorded.
- **Documenting the desired architecture instead of the actual one.** For existing systems, agents sometimes describe what the system should look like rather than what it actually is. The SAD must reflect reality (including known tech debt) or it becomes fiction that misleads onboarding engineers.
- **Missing trust boundaries and data flow analysis.** The architecture document must show where data crosses trust boundaries. Without this, security reviewers cannot assess the system and integration risks remain invisible.
- **Treating the ADR log as optional.** Every significant architectural decision (database choice, auth strategy, deployment model, communication pattern) needs an ADR. Agents that skip ADRs leave future maintainers guessing why the system was built this way.

## Handoff

**Reads from:**
- `technical-specification` — functional and non-functional requirements
- `technical-feasibility-study` — technology constraints, integration feasibility, risk mitigations
- `2-project-plan` — delivery timeline, team structure, dependencies
- `ux-flow-specification` — frontend component structure, API interaction points

**Feeds into:**
- Implementation — architectural structure guiding code organization
- `infrastructure-specification` — deployment topology, scaling strategy, monitoring needs
- Security review — trust boundaries, data flow, threat model foundation

## Quality Gate

Before marking this document as `final`, verify:
- [ ] C4 diagrams exist at Level 1 (System Context) and Level 2 (Container), with Level 3 (Component) for critical containers
- [ ] The Alternatives Considered table documents at least two rejected alternatives with specific reasoning
- [ ] Trust boundaries and data flow are explicitly mapped with sensitive data classification
- [ ] Every significant architectural decision has a corresponding ADR in the log
- [ ] Non-functional requirements (availability, performance, security, scalability) have measurable targets linked to architectural decisions

## Next Steps

After this document is complete, proceed to:
- **Implementation** — begin coding based on the architectural structure defined here
- **`infrastructure-specification`** — deployment topology, scaling, and monitoring based on architecture
- Or invoke `using-engineering-docs` to continue the pipeline
