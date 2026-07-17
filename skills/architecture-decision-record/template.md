---
title: Architecture Decision Record
skill: architecture-decision-record
status: draft
owner_reviewed: false
last_updated: 2026-07-17
depends_on: []
supersedes: ""
---

# ADR-[NNN]: [Short Imperative Title - e.g., "Use PostgreSQL as Primary Database"]

**Status:** `Proposed` | `Accepted` | `Deprecated` | `Superseded by ADR-[NNN]`
**Date:** YYYY-MM-DD
**Author:** [Name]
**Deciders:** [Names of engineers involved in this decision]
**Technical Story:** [Link to ticket / issue / discussion thread]
**Supersedes:** ADR-[NNN] *(if applicable - otherwise remove this line)*
**Review Date:** YYYY-MM-DD *(when this decision should be formally re-evaluated — remove if not applicable)*
**Expiration:** YYYY-MM-DD *(if this decision has a built-in expiry — remove if not applicable)*

---

## Related ADRs

| ADR | Relationship | Notes |
| :--- | :--- | :--- |
| [e.g., ADR-0003] | `Depends on` / `Conflicts with` / `Influenced by` | [How it relates] |
| [e.g., ADR-0007] | `Supersedes` / `Superseded by` | [If applicable] |

> Link any ADRs that interact with this decision. Decisions do not exist in isolation.

---

## Context

> Describe the situation that makes this decision necessary. What forces are at play? What problem, opportunity, or constraint is this decision responding to?
>
> Be specific and factual. Avoid framing this as a defense of the chosen option - write it as if you have not made the decision yet. A reader should fully understand the problem space without any prior knowledge.
>
> Include relevant constraints: team skills, existing infrastructure, timeline, regulatory requirements, performance data, failure history.

[Context - write with specificity. Include numbers, evidence, and constraints where available.]

---

## Decision

**We will [chosen approach / technology / pattern].**

[1-3 sentences on how this decision is implemented in practice. Specific enough that an engineer can act on it without asking follow-up questions.]

---

## Rationale

> Why was this option chosen? Be specific. Reference evidence, benchmarks, or principles. Avoid vague statements like "it seemed like the right fit" or "it was the most popular option."

[Evidence-based rationale. If you ran a PoC or benchmark, cite the results. If a specific technical constraint forced the decision, state it.]

---

## Alternatives Considered

> **This section is mandatory.** Documenting rejected alternatives prevents future engineers from re-investigating paths already evaluated, and demonstrates that the decision was made with due diligence.

### Option 1: [Name of this alternative]

**What it is:** [Brief, neutral description]

**Why it was rejected:**
- [Specific reason - e.g., "Does not support point-in-time recovery required by our 30-day backup policy"]
- [Specific reason 2 - with evidence where available]

**What we lose by not choosing it:** [The genuine upside of this alternative that we forgo]

---

### Option 2: [Name of this alternative]

**What it is:** [Brief, neutral description]

**Why it was rejected:**
- [Specific reason]
- [Specific reason 2]

**What we lose by not choosing it:** [The genuine upside]

---

### Option 3: [Name of this alternative] *(optional)*

**What it is:** [Description]

**Why it was rejected:**
- [Specific reason]

---

## Consequences

> Every architectural decision has trade-offs. Be honest about both the benefits and the costs. An ADR that only lists positive consequences is incomplete and will erode trust when the negatives materialize.

### Positive Consequences

- [What becomes better or easier]
- [Risk that is eliminated]
- [Constraint that is satisfied]

### Negative Consequences / Trade-offs

- [What becomes harder or more constrained]
- [New dependency introduced]
- [Skill gap that must be addressed]
- [Future flexibility that is reduced]

### Risks Introduced

| Risk | Probability | Impact | Mitigation |
| :--- | :--- | :--- | :--- |
| [Specific risk this decision introduces] | `Low` / `Med` / `High` | `Low` / `Med` / `High` | [How mitigated] |

---

## Assumptions That Could Invalidate This Decision

> List the assumptions this decision depends on. If any assumption proves false, the decision should be revisited.

| # | Assumption | How to Verify | Consequence If False |
| :--- | :--- | :--- | :--- |
| 1 | [e.g., Team will remain at current size] | [e.g., Quarterly headcount review] | [e.g., Need a more managed solution] |
| 2 | [e.g., Library X continues active maintenance] | [e.g., Monitor GitHub activity monthly] | [e.g., Migrate to alternative Y] |
| 3 | [e.g., Traffic stays below 10K RPS for 2 years] | [e.g., Monthly traffic review] | [e.g., Re-evaluate architecture for scale] |

---

## Compliance and Governance

> Only include if relevant.

- [e.g., This decision satisfies PCI-DSS Requirement 8.3 (strong authentication for all access to the cardholder data environment)]
- [e.g., Reviewed and approved by Security on YYYY-MM-DD]

**Compliance enforcement:** [How is this decision enforced in practice? e.g., CI check, code review policy, architecture review board, automated linting rule]

---

## References

- [Link to PoC, benchmark, or technical spike]
- [Link to related ADR]
- [Link to external documentation, RFC, or standard]
- [Link to the discussion thread or meeting notes where this was decided]
