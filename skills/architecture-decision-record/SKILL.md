---
name: architecture-decision-record
argument-hint: "[the decision being recorded]"
description: Create a standalone Architecture Decision Record (ADR) for a single significant architectural decision. Captures context, decision, alternatives considered, and consequences. ADRs are immutable - once accepted, they are never edited, only superseded by a new ADR.
intent: >-
  Produce a single, immutable Architecture Decision Record that permanently captures why a significant technical choice was made, what alternatives were evaluated and rejected, and what the known consequences are. ADRs prevent the most common and expensive form of organizational knowledge loss: the "why" behind architectural decisions lives only in the heads of engineers who eventually leave. ADRs are not retrospective documents; they are written at decision time and never modified. Future readers should be able to reconstruct the full reasoning without needing to ask anyone.
type: component
theme: engineering-docs
best_for:
  - "Recording any significant architectural choice: language, framework, database, pattern, library, protocol"
  - "Documenting a decision that will affect multiple teams or be hard to reverse"
  - "Capturing the outcome of a technical debate or design review"
  - "Building a historical record of why the system is structured the way it is"
scenarios:
  - "Document our decision to use Redis for session storage instead of database-backed sessions"
  - "Write an ADR for choosing PostgreSQL over MongoDB for our primary data store"
  - "Record the decision to adopt the Repository pattern for all database access"
  - "Document why we chose JWT over opaque tokens for our API authentication"
estimated_time: "15-30 minutes"
license: MIT
compatibility: Designed for Gemini (Antigravity), Claude Code, Cursor/Windsurf, Kimi Code, Codex/Copilot
---

## Purpose

Produce a single ADR that permanently captures a significant architectural decision. ADRs are append-only: once `Accepted`, they are never edited. If a decision is reversed, a new ADR is written with `Supersedes: ADR-NNN`.

## Input

**Works best with:** A clear description of the decision being recorded.
**Also valuable:** The context that led to the decision, the alternatives that were considered, any benchmarks or evidence, and the known trade-offs.

**Example invocation:** `Document our decision to use HMAC-SHA256 request signing for webhook delivery instead of bearer tokens. We chose this because webhooks are server-to-server calls where rotating tokens is operationally complex, while HMAC signing uses a per-merchant secret and validates the payload integrity simultaneously.`

## Key Concepts

### ADR Lifecycle
```
Proposed → Accepted → (Deprecated) → (Superseded by ADR-NNN)
```

- **Proposed:** Under discussion. May still change.
- **Accepted:** Binding. Implementation should follow this decision.
- **Deprecated:** The decision is outdated but not actively reversed.
- **Superseded:** A newer ADR (referenced) replaces this one.

### What Qualifies as an ADR
Write an ADR for any decision that:
- Is significant enough that you would regret not having documented it in 2 years
- Affects multiple components, teams, or services
- Will be difficult or expensive to reverse
- Requires understanding the "why" to maintain the system correctly

**Do NOT write an ADR for:** routine implementation details, naming conventions (use a style guide), or decisions that will obviously change soon.

### MADR Format
This skill uses a variant of the MADR (Markdown Architectural Decision Records) format, which is the most widely adopted standard for Git-based ADR workflows.

## Application

### Phase 1: Socratic Clarification & Brainstorming (Mandatory Interview)
Before writing any ADR, you MUST interrogate the user's initial input, identify gaps, and ask **3-5 targeted clarifying questions** to dig deeper. Do NOT generate the template yet.
Ask questions to resolve:
1. **Decision Context**: What problem or driver led to the need for this decision?
2. **Alternatives Considered**: What other options did you explore (at least 2), and why were they rejected?
3. **Downstream Consequences**: What are the negative consequences (technical debt, overhead, limits) of accepting this decision?
4. **Implementation Scope**: Does this change our architectural standards or codebase conventions?
*Wait for the user's response to these questions before drafting the final ADR.*

### Phase 2: Document Generation
1. Assign the next available ADR number for the project (check existing ADR log or `docs/adr/` directory)
2. Fill out each section with precision - especially Alternatives Considered
3. Get review from at least one other senior engineer before marking `Accepted`
4. Store the file in `docs/adr/ADR-NNN-[decision-slug].md`
5. Update the ADR log in the System Architecture Document if one exists
