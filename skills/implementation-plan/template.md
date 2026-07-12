# Implementation Plan

**Project / System:** [Name]
**Document ID:** IMP-[IDENTIFIER]-[VERSION]
**Status:** `Draft` | `In Review` | `Approved` | `In Progress` | `Complete`
**Version:** 1.0.0
**Date:** YYYY-MM-DD
**Author(s):** [Name, Role]
**Related Documents:** [System Architecture Doc, Technical Specification, Project Plan]

---

## 1. Overview

### 1.1 Purpose

[2-3 sentences: what is being built, and what does this plan sequence that the project plan and architecture doc do not already cover?]

### 1.2 Starting State

[What already exists, if anything: prior codebase, decided tech stack, existing infrastructure. State "greenfield" explicitly if nothing exists yet.]

### 1.3 Execution Context

**Built by:** `Human team` / `AI coding agent` / `Both`
[If an agent will execute this directly, note that each phase below must be self-contained and independently verifiable.]

---

## 2. Foundation Layer

> Components that must exist before feature work begins. Build these first regardless of feature priority.

| Component | Why It's Foundational | Owner |
| :--- | :--- | :--- |
| [e.g., Data model / core schema] | [Nearly everything reads or writes through it] | |
| [e.g., Auth & session handling] | [Most features require an authenticated user context] | |
| [e.g., CI/CD + environment setup] | [Nothing can be verified or deployed without it] | |

---

## 3. Phased Build Sequence

### Phase 0: Foundation

**Builds:** [Foundation-layer components from Section 2]
**Definition of Ready:** [e.g., Architecture and data model are approved]
**Definition of Done:** [e.g., Schema migrated, auth flow passes smoke test, CI pipeline runs green on a trivial commit]
**Verification:** [Specific check(s) that prove Done - not just "looks complete"]

### Phase 1: [Name - e.g., Core vertical slice]

**Builds:** [List features/components - prefer one complete vertical slice over a partial layer]
**Depends on:** Phase 0
**Definition of Ready:** [What must be true to start]
**Definition of Done:** [Specific, verifiable condition]
**Verification:** [Test/check that proves it]

### Phase 2: [Name]

**Builds:** [...]
**Depends on:** [Phase(s)]
**Definition of Ready:** [...]
**Definition of Done:** [...]
**Verification:** [...]

*(Repeat per phase. Independent workstreams with no dependency on each other belong in the same phase.)*

---

## 4. Dependency Map

| Component | Depends On | Can Run in Parallel With |
| :--- | :--- | :--- |
| [Component A] | [Foundation] | [Component B] |
| [Component B] | [Foundation] | [Component A] |
| [Component C] | [Component A, B] | [None - integration point] |

---

## 5. Integration Checkpoints

| Checkpoint | Workstreams Being Integrated | Verification |
| :--- | :--- | :--- |
| [e.g., End of Phase 1] | [Frontend flow + backend API] | [Full end-to-end test of the vertical slice] |

---

## 6. High-Uncertainty Items and Fallbacks

| Item | Uncertainty | Primary Approach | Fallback If It Doesn't Work |
| :--- | :--- | :--- | :--- |
| [e.g., Third-party API rate limits] | [Unknown actual throughput] | [Direct integration] | [Add a queue/buffer layer] |

---

## 7. Completion Criteria (Whole Project)

[The observable, testable condition(s) that mean the full implementation is done and ready for the deployment-plan skill to take over for release.]
