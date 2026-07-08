# Architecture Decision Record

**ADR ID:** ADR-[NNN]
**Title:** [Short, imperative noun phrase describing the decision - e.g., "Use PostgreSQL as the primary database"]
**Status:** `Proposed` | `Accepted` | `Deprecated` | `Superseded by ADR-[NNN]`
**Date:** YYYY-MM-DD
**Author:** [Name]
**Deciders:** [Names of people involved in the decision]
**Supersedes:** ADR-[NNN] (if applicable)

---

## Context

> Describe the situation that necessitates this decision. What is the problem or opportunity? What forces are at play - technical, organizational, business, regulatory? What constraints exist? A reader must understand the context without any prior knowledge of the decision.
>
> Write this section as if you will not be around to explain it in 2 years.

[Context description]

---

## Decision

> State the architectural decision clearly and directly. One sentence is ideal. The decision should be specific enough that a new engineer who reads it knows exactly what was chosen.

**We will [chosen approach].**

[Optional: 2-3 sentences elaborating on how the decision is applied in practice.]

---

## Rationale

> Why was this option chosen over the alternatives? What evidence, benchmarks, or principles support it? Be precise - avoid vague statements like "it seemed better." Reference specific evaluation criteria.

[Rationale with specific evidence and reasoning]

---

## Alternatives Considered

> This section is mandatory. Documenting rejected options prevents future engineers from re-investigating paths already evaluated. For each alternative, clearly state why it was rejected.

### Alternative 1: [Name]

**Description:** [Brief description of this approach]

**Why Rejected:**
- [Specific reason 1 - e.g., "Does not support our required throughput of 10K RPS based on benchmark X"]
- [Specific reason 2]

---

### Alternative 2: [Name]

**Description:** [Brief description]

**Why Rejected:**
- [Specific reason 1]
- [Specific reason 2]

---

### Alternative 3: [Name] (Optional)

**Description:** [Brief description]

**Why Rejected:**
- [Specific reason]

---

## Consequences

> What becomes easier and what becomes harder as a result of this decision? Be honest about both positive and negative consequences. No decision has only upsides.

### Positive Consequences

- [What improves - e.g., "Eliminates N+1 query risk by enforcing repository pattern at the ORM layer"]
- [What improves]

### Negative Consequences / Trade-offs

- [What gets harder - e.g., "Developers must learn the repository abstraction before writing data access code"]
- [What we lose]
- [New constraint introduced]

### Risks

| Risk | Probability | Impact | Mitigation |
| :--- | :--- | :--- | :--- |
| [Risk introduced by this decision] | `Low` / `Med` / `High` | `Low` / `Med` / `High` | [How mitigated] |

---

## Compliance and Standards

> If this decision is driven by or affects compliance requirements, list them here.

- [e.g., Aligns with PCI-DSS Requirement 6.3 - no sensitive data in logs]
- [e.g., Required by internal security policy SEC-042]

---

## References

- [Link to relevant specification, benchmark, article, or prior discussion]
- [Link to related ADR]
