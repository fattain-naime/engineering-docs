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
estimated_time: "1-2 hours"
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

## Application

### Phase 1: Socratic Clarification & Brainstorming (Mandatory Interview)
Before writing any implementation plan, you MUST interrogate the user's initial input, identify gaps, and ask **3-5 targeted clarifying questions** to dig deeper. Do NOT generate the template yet.
Ask questions to resolve:
1. **Existing artifacts**: Does an architecture document, technical specification, or project plan already exist for this? What do they say?
2. **Current state**: Is this greenfield, or is there existing code/infrastructure this must build on top of?
3. **Foundational decisions already made**: Is the tech stack, hosting, and auth approach already decided, or does this plan need to account for choosing them?
4. **Execution context**: Will this be built by a human team, an AI coding agent, or both - and does the plan need to be self-contained enough for autonomous execution?
*Wait for the user's response to these questions before drafting the final implementation plan.*

### Phase 2: Foundation Identification (20 min)
Identify the components that must exist before any feature work can safely begin (data model, auth, core scaffolding, environment/CI setup).

### Phase 3: Dependency Mapping (30 min)
Map every major feature/component against what it depends on. Group independent work into the same phase; sequence dependent work into later phases.

### Phase 4: Phase Definition (45-60 min)
For each phase: list what gets built, its Definition of Ready, its Definition of Done, and the verification steps that prove it's actually done (not just written).

### Phase 5: Integration Checkpoints (20 min)
Define the points where previously-separate workstreams must integrate and be tested together, before proceeding further.

### Phase 6: Risk and Fallback Notes (15 min)
For any phase with high technical uncertainty, note the fallback approach if the primary approach doesn't pan out, so a build doesn't stall waiting for a decision.
