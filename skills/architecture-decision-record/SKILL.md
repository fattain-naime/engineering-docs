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
estimated_time: "30-60 min"
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

### ADR Numbering Guidance
- **Sequential numbering:** Use `ADR-0001`, `ADR-0002`, etc. Zero-padded to 4 digits for consistent sorting.
- **No gaps:** Never skip numbers, even if an ADR is rejected or abandoned. A rejected ADR is still a record that a decision was considered and declined.
- **No reuse:** Once a number is assigned, it is never reused — even if the ADR file is deleted. The number is a permanent identifier in the log.
- **Monorepo convention:** In monorepos, prefix with the service or domain: `ADR-API-0001`, `ADR-INFRA-0001`. Each service/domain maintains its own sequence.
- **Multi-repo convention:** Each repository maintains its own independent sequence. Cross-repo decisions reference the originating repo: `Supersedes: service-a/ADR-0003`.

### Deprecated Lifecycle Guidance
An ADR transitions to `Deprecated` when:
- The technology or pattern it chose is no longer supported or recommended upstream
- A regulatory change makes the approach non-compliant
- The system has evolved such that the decision is no longer relevant (e.g., a microservice was decommissioned)

Deprecation does NOT mean the ADR is deleted. It remains in the log as historical context. A deprecated ADR should include:
- **Deprecation reason:** Why is this no longer applicable?
- **Deprecation date:** When was it deprecated?
- **Replacement:** What ADR or approach replaces it? (If none, state "No replacement — decision no longer relevant")

### Monorepo / Multi-Repo Handling
- **Monorepo:** Store all ADRs in a shared `docs/adr/` directory. Prefix filenames with the service or domain to avoid collisions: `docs/adr/ADR-API-0001-use-rest-over-grpc.md`. A cross-cutting ADR that affects multiple services uses `ADR-PLATFORM-NNNN`.
- **Multi-repo:** Each repository has its own `docs/adr/` directory and its own numbering sequence. When a decision in one repo affects another, the ADR in the originating repo is referenced by the consuming repo.
- **Shared decisions:** For decisions that span multiple repos (e.g., "all services use Protocol Buffers for inter-service communication"), create the ADR in a shared governance repo and reference it from each affected repo.

### Consensus Failure Handling
When the team cannot reach consensus on a decision:
1. **Document all positions:** Record each advocated approach with its proponent's reasoning — do not discard minority opinions
2. **Identify the decision-maker:** Who has the authority to break the tie? (tech lead, architect, CTO) — make this explicit
3. **Set a deadline:** Consensus-seeking without a deadline is infinite debate. Set a date by which a decision must be made.
4. **Record the override:** If the decision-maker overrides majority opinion, document it as an explicit override with reasoning — this prevents re-litigation
5. **Post-decision commitment:** Once the decision is made, all team members commit to implementing it faithfully, regardless of their prior position

### Decision Revisit Mechanism
ADRs are not permanent edicts. Define a process for revisiting decisions:
- **Scheduled review:** For high-impact decisions, set a review date (6 months, 1 year) when the decision will be formally re-evaluated
- **Trigger conditions:** What events should prompt a revisit? (e.g., "if the chosen library's GitHub activity drops below X commits/month," "if team size doubles," "if a new regulatory requirement affects this area")
- **Revisit process:** Re-read the original ADR, evaluate whether the assumptions still hold, and either reaffirm (add a note) or supersede (write a new ADR)
- **No silent reversals:** A decision is never reversed without a new ADR. Even if everyone agrees the original was wrong, the superseding ADR records why.

### MADR Format
This skill uses a variant of the MADR (Markdown Architectural Decision Records) format, which is the most widely adopted standard for Git-based ADR workflows.

### Document Length

Target length: **1-2 pages** (excluding appendices).

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
1. **Alternatives Considered**: What other options did you explore (at least 2), and why were they rejected?
2. **Downstream Consequences**: What are the negative consequences (technical debt, overhead, limits) of accepting this decision?

*Wait for the user's response to these questions before drafting the final ADR.*

### Phase 2: Document Generation
1. Assign the next available ADR number for the project (check existing ADR log or `docs/adr/` directory)
2. Fill out each section with precision - especially Alternatives Considered
3. Get review from at least one other senior engineer before marking `Accepted`
4. Store the file in `docs/adr/ADR-NNN-[decision-slug].md`
5. Update the ADR log in the System Architecture Document if one exists

### Phase 3: Revision (After User Review)

If the user requests changes after reviewing the ADR:

1. **Read the user's feedback carefully** — understand what they want changed
2. **Check for conflicts** — does the requested change conflict with prior ADRs or architectural decisions?
3. **Apply changes** — update the document; if the ADR was already `Accepted`, create a new ADR with `Supersedes: ADR-NNN` instead of editing
4. **Re-run consistency check** — verify the change does not contradict other accepted ADRs
5. **Update metadata** — set `last_updated` to today's date
6. **Confirm with user** — show the changes and get approval

## Gotchas

- **Editing an accepted ADR instead of superseding it.** ADRs are immutable by design. If a decision is reversed, write a new ADR with `Supersedes: ADR-NNN` - do not modify the original. The history of changed minds is as valuable as the decisions themselves.
- **Writing the ADR after the decision was already implemented.** ADRs capture the reasoning at decision time. Writing one post-hoc leads to rationalization instead of honest trade-off analysis. Write it during the decision, not after.
- **Listing only positive consequences and omitting trade-offs.** An ADR that only lists benefits is incomplete and erodes trust when the negatives materialize. Every decision has costs - document them honestly in the Consequences section.
- **Vague Alternatives Considered that do not explain why options were rejected.** "We considered X but chose Y" is useless without specific, evidence-based reasons for rejecting X. Future engineers will re-investigate rejected paths if the reasoning is not recorded.
- **Treating routine implementation details as ADR-worthy decisions.** Not every choice needs an ADR. Reserve them for decisions that are significant, hard to reverse, or affect multiple teams. Naming conventions and minor refactors belong in style guides, not ADRs.

## Handoff

**Reads from:**
- `4-technical-specification.md` — requirements and constraints that inform the decision
- `7-system-architecture.md` — existing architectural context

**Feeds into:**
- `8-database-design-document.md` — data model decisions influenced by this ADR
- `9-api-design-document.md` — API design choices informed by this ADR
- `14-technical-blueprint.md` — implementation decisions referencing this ADR
- `15-implementation-plan.md` — build sequencing informed by this ADR

## Quality Gate

Before marking this document as `final`, verify:
- [ ] The Context section describes the problem without advocating for the chosen solution
- [ ] At least two alternatives are documented with specific, evidence-based rejection reasons
- [ ] Both positive and negative consequences are listed honestly, including new risks introduced
- [ ] The Decision section is specific enough that an engineer can act on it without follow-up questions
- [ ] At least one other senior engineer has reviewed and approved before status changes to `Accepted`

## Next Steps

After this ADR is complete, proceed to:
- **`database-design-document`** — if the decision affects the data model
- **`api-design-document`** — if the decision affects API contracts
- **`technical-blueprint`** — if the decision informs a specific feature's implementation design
- Or invoke `using-engineering-docs` to continue the pipeline
