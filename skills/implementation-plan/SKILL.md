---
name: implementation-plan
argument-hint: "[project or system name]"
description: Create a phased implementation roadmap that sequences the technical build of an entire project - build order, module dependencies, environment/tooling setup, per-phase Definition of Ready/Done, and integration checkpoints. Use after the project plan and architecture exist, to turn "what we're building and when" into "in what technical order we actually build it."
intent: >-
  Produce the document that sits between the project plan (business timeline, ownership) and individual technical-blueprint documents (single-feature design detail): the build sequence itself. Most implementation failures are ordering failures - building the UI before the API contract is stable, building features before the auth/permissions foundation exists, integrating a payment provider before the data model that records its results is finalized. This skill forces explicit build-order decisions driven by technical dependency, not by which feature seems most exciting to build first, and defines what "ready to start" and "actually done" mean for each phase so an implementer - human or AI agent - knows exactly when to move to the next one.
type: workflow
theme: engineering-docs
best_for:
  - "Sequencing the technical build of a new project once architecture and requirements exist"
  - "Handing off a project to an AI coding agent or new team member with an unambiguous build order"
  - "Deciding what foundational work (auth, data model, CI/CD) must exist before feature work starts"
  - "Defining phase gates so partially-built features don't get integrated prematurely"
scenarios:
  - "Create an implementation plan for building our SaaS app - we have the architecture and specs, now sequence the actual build"
  - "What order should we build the auth system, admin panel, and public API in for this new project?"
  - "Write a phased implementation roadmap an AI coding agent could follow end-to-end without stopping to ask what comes next"
estimated_time: "2-4 hrs"
license: MIT
compatibility: Designed for Gemini (Antigravity), Claude Code, Cursor/Windsurf, Kimi Code, Codex/Copilot
---

## Purpose

Produce an implementation plan that sequences the technical build of a project into ordered phases, driven by dependency rather than preference, with an explicit Definition of Ready and Definition of Done for each phase.

**Build order is a technical decision with real consequences, not a scheduling afterthought.** Building a feature before its data foundation exists means rework; building the UI before the API contract is frozen means integration churn. This document exists so those decisions are made once, deliberately, instead of discovered mid-build.

## Input

**Works best with:** The project or system name, plus its architecture and/or requirements if they exist.
**Also valuable:** The system-architecture-document, technical-specification, and project-plan for this project if already written - this skill sequences their contents rather than re-deriving them.

**Example invocation:** `Create an implementation plan for our new marketplace platform. We have the architecture doc (Next.js frontend, Node/Postgres backend, Stripe Connect for payouts) and the technical spec. Sequence the build so an AI coding agent could execute it phase by phase without needing to ask what to build next.`

## Key Concepts

### Foundation Before Features
Certain components block almost everything else and must be built first regardless of what feels most important to stakeholders: data model/schema, authentication and authorization, core API scaffolding, CI/CD and environment setup. Sequencing feature work before these exist guarantees rework.

### Dependency-Driven Phases, Not Calendar Phases
A phase boundary should represent a real technical dependency ("Phase 2 cannot start until the data model in Phase 1 is migrated and tested"), not an arbitrary time slice. If two workstreams have no dependency on each other, they belong in the same phase, done in parallel.

### Definition of Ready / Definition of Done (per phase)
- **Definition of Ready:** What must be true before work on this phase can begin (e.g., "API contract for Phase 2 is frozen and reviewed").
- **Definition of Done:** What must be true before moving to the next phase (e.g., "all Phase 1 endpoints pass integration tests against a seeded database").
Vague phase boundaries ("mostly done") are the most common cause of premature integration and cascading bugs.

### Vertical Slices Over Horizontal Layers
Prefer implementing a thin, fully-working slice through all layers (one complete user flow: UI → API → DB → response) over building one entire layer (all of the database, then all of the API, then all of the UI) before anything is testable end-to-end. Vertical slices surface integration problems early, when they're cheap to fix.

### Designed for Agent Execution
Because an AI coding agent may execute this plan directly, each phase should be self-contained enough to hand to an agent with no additional context: what exists already, what to build, what "done" looks like, and what to verify before reporting the phase complete.

### Effort Estimation Methodology
For each phase, estimate effort using one or more of:
- **Analogous estimation:** Compare to similar past projects. Adjust for complexity, team familiarity, and scope differences.
- **Three-point estimation:** For each task, estimate optimistic (O), most likely (M), and pessimistic (P). Expected = (O + 4M + P) / 6. This surfaces uncertainty.
- **T-shirt sizing:** For early planning, use S/M/L/XL to indicate relative effort. Convert to person-days only after architecture is stable.
- **Confidence indicator:** Always tag estimates with confidence (High/Medium/Low). Low-confidence estimates need a spike or PoC before the phase starts.

Never present a single number without a range or confidence level — a "3-week estimate" without context is meaningless.

### Resource Allocation
Map phases to available people and skills:
- **Skill matching:** Which phases require which skills? (frontend, backend, DevOps, security, domain expertise)
- **Parallel capacity:** How many people can work in parallel on the same phase without blocking each other?
- **Bottleneck identification:** Which team member is a dependency for multiple phases? Plan around their availability.
- **Contingency buffer:** Add 15-25% buffer for unknowns, depending on estimate confidence.

### Phase Failure Handling
When a phase's Definition of Done cannot be met:
1. **Diagnose:** Is the blocker technical, resource, or scope-related?
2. **Triage:** Can the blocker be resolved within the phase, or does it require scope change?
3. **Options:**
   - **Extend the phase:** If the delay is small and does not cascade
   - **Split the phase:** Complete what's done, defer the blocker to a new phase
   - **Reduce scope:** Move non-critical items to a later phase
   - **Escalate:** If the blocker is external (vendor, team, decision)
4. **Document:** Record the failure, the decision, and the impact on downstream phases in the plan's change log.

### Code Review Strategy per Phase
Define the review approach for each phase based on risk and complexity:
- **Foundation phases (auth, data model):** Require two reviewers. Security-sensitive changes need a security-aware reviewer.
- **Feature phases:** One reviewer minimum. Use automated checks (linting, type checking, test coverage) as a first gate.
- **Integration phases:** Reviewer from each integrated team. Focus on API contract adherence and error handling.
- **Agent-generated code:** Requires human review before merge. Flag for extra scrutiny on edge cases and error handling.

### Scope Change Management
When scope changes mid-implementation:
1. **Impact analysis:** Which phases are affected? What is the schedule impact?
2. **Approval:** Who can approve scope changes? (product owner, tech lead, or both)
3. **Documentation:** Update the plan, the change log, and any affected DoD criteria.
4. **Communication:** Notify all affected team members and stakeholders.
5. **No silent scope creep:** Every addition must be explicitly approved and documented. "Just one more thing" is the most common cause of schedule overrun.

### Technical Debt Tracking
Track technical debt incurred during implementation:
- **When to incur debt:** Acceptable when a deadline forces a shortcut, but ONLY if:
  - The debt is documented with a specific follow-up task
  - An owner and target date are assigned
  - The shortcut does not compromise security or data integrity
- **Debt register:** Maintain a running list in the plan or as a separate section. Each entry: what, why, owner, target resolution date, and the cost of leaving it unresolved.
- **Debt review:** At each integration checkpoint, review the debt register. Resolve high-cost debt before proceeding.

### External Dependency Handling
When a phase depends on an external entity (third-party API, vendor deliverable, another team):
- **Identify early:** List all external dependencies during Phase 2 (Dependency Mapping).
- **Define the interface:** What exactly is expected from the external party? (API contract, data format, delivery date)
- **Mock until available:** Build against a mock or stub. Never let an external dependency block internal progress.
- **Track status:** Monitor external dependency status at each integration checkpoint.
- **Fallback plan:** If the external dependency is late or fails to deliver, what is the fallback? (in-house implementation, alternative vendor, scope reduction)

### Environment Progression
Define the path code takes from development to production:

| Environment | Purpose | Who Deploys | Approval Required |
|:---|:---|:---|:---|
| **Dev** | Local development, rapid iteration | Developer | None |
| **CI** | Automated tests, static analysis | Automatic on push | Tests must pass |
| **Staging** | Integration testing, UAT, demo | Manual or automatic | QA sign-off |
| **Production** | Live users | Manual with approval | Tech lead + product owner |

Each environment should mirror production as closely as possible. Document the differences (e.g., "staging uses a smaller database, no real payment processing").

### Document Length

Target length: **8-15 pages** (excluding appendices).

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
1. **Current state**: Is this greenfield, or is there existing code/infrastructure this must build on top of?
2. **Execution context**: Will this be built by a human team, an AI coding agent, or both - and does the plan need to be self-contained enough for autonomous execution?

*Wait for the user's response to these questions before drafting the final implementation plan.*

### Phase 2: Foundation Identification (40-60 min)
Identify the components that must exist before any feature work can safely begin (data model, auth, core scaffolding, environment/CI setup).

### Phase 3: Dependency Mapping (60-90 min)
Map every major feature/component against what it depends on. Group independent work into the same phase; sequence dependent work into later phases.

### Phase 4: Phase Definition (1.5-2 hrs)
For each phase: list what gets built, its Definition of Ready, its Definition of Done, and the verification steps that prove it's actually done (not just written).

### Phase 5: Integration Checkpoints (40-60 min)
Define the points where previously-separate workstreams must integrate and be tested together, before proceeding further.

### Phase 6: Risk and Fallback Notes (30-45 min)
For any phase with high technical uncertainty, note the fallback approach if the primary approach doesn't pan out, so a build doesn't stall waiting for a decision.

### Phase 7: Revision (After User Review)

If the user requests changes after reviewing the implementation plan:

1. **Read the user's feedback carefully** — understand what they want changed
2. **Check for conflicts** — does the requested change break dependency ordering, invalidate Definition of Ready/Done criteria, or create circular dependencies?
3. **Apply changes** — update the document, cascading changes through dependency maps, phase definitions, and integration checkpoints
4. **Re-run consistency check** — verify no phase starts before its dependencies are complete, all DoR/DoD criteria are still valid, and integration checkpoints cover all converging workstreams
5. **Update metadata** — set `last_updated` to today's date
6. **Confirm with user** — show the changes and get approval

## Gotchas

- **Sequencing by preference instead of dependency.** Agents often put the "interesting" feature first rather than the foundational layer it depends on. Always ask "what must exist before this can be built?" before assigning a phase.
- **Skipping Definition of Ready/Done for phases.** Without explicit, verifiable DoD criteria, agents declare phases "done" when code is written but not tested or integrated. Every phase needs a concrete verification step, not just a deliverable list.
- **Creating too many phases with single tasks.** Over-decomposing into one-task phases adds overhead without reducing risk. Group independent work into the same phase; only split when there is a real dependency boundary.
- **Ignoring the execution context.** Writing a plan for a human team with the same granularity as one for an AI agent wastes effort. If an agent executes, each phase must be fully self-contained with no implicit context.
- **Forgetting integration checkpoints between parallel workstreams.** Independent phases that converge later need explicit integration points. Without them, incompatible work merges late and causes cascading rework.

## Handoff

**Reads from:**
- `1-business-plan.md` — project scope, timeline, priorities
- `4-technical-specification.md` — functional requirements to sequence
- `7-system-architecture.md` — technology decisions, infrastructure constraints
- `8-database-design-document.md` — schema as Phase 0/1 foundation
- `9-api-design-document.md` — API contracts to sequence across phases
- `14-technical-blueprint.md` — feature designs to sequence into build phases

**Feeds into:**
- Execution — this is the final planning artifact before implementation begins
- ADRs — build-order decisions that warrant permanent records

## Quality Gate

Before marking this document as `final`, verify:
- [ ] Every phase has a Definition of Ready, Definition of Done, and a concrete verification step
- [ ] The build order is driven by technical dependency, not stakeholder preference or feature excitement
- [ ] Foundation-layer components (data model, auth, CI/CD) are in Phase 0 and block all feature phases
- [ ] Independent workstreams are grouped into the same phase for parallel execution, not split unnecessarily
- [ ] Integration checkpoints exist wherever parallel workstreams converge

## Next Steps

After this document is complete, the planning pipeline is complete. Proceed to:
- **Execute the plan** — hand Phase 0 to an engineering team or AI coding agent
- **`architecture-decision-record`** — record any build-order decisions that warrant permanent documentation
- Or invoke `using-engineering-docs` to review the full pipeline
