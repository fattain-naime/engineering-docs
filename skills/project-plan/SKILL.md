---
name: project-plan
argument-hint: "[project or product name]"
description: Create a project delivery plan covering scope, milestones, timeline, work breakdown, resourcing, stakeholder roles (RACI), dependencies, and a project-level risk register. Use at the start of any project to define who is building what, in what order, by when - before any code is written.
intent: >-
  Produce the top-level delivery plan that every other document in this suite hangs off of. A technical specification defines what the system must do; an architecture document defines how it is structured; this document defines who does the work, in what sequence, against what timeline, and what could derail it. Projects rarely fail from lack of technical skill - they fail from unclear ownership, undiscovered dependencies, and unscoped risk. This is a project-management artifact, not an engineering one: it applies Work Breakdown Structure (WBS) decomposition, milestone-based planning, and a RACI matrix to remove ambiguity about ownership before it causes delay.
type: workflow
theme: engineering-docs
best_for:
  - "Kicking off any new project or major initiative before implementation planning begins"
  - "Establishing milestones and a delivery timeline that stakeholders outside engineering can track"
  - "Clarifying who owns what when multiple people or teams are involved"
  - "Surfacing schedule, resource, and scope risks before they become delays"
scenarios:
  - "Create a project plan for building a new customer support ticketing platform from scratch"
  - "We're a team of 4 - write a project plan with milestones and a RACI matrix for our mobile app rewrite"
  - "Plan the delivery timeline and dependencies for migrating our monolith to a new framework"
estimated_time: "1-2 hours"
license: MIT
compatibility: Designed for Gemini (Antigravity), Claude Code, Cursor/Windsurf, Kimi Code, Codex/Copilot
---

## Purpose

Produce a project plan that defines scope, milestones, timeline, ownership, dependencies, and risk at the delivery level - the document that answers "what are we building, in what order, who owns each part, and by when" for anyone tracking the project, not just the engineers building it.

**This is not a technical design document.** It does not specify how any single component works - it specifies the shape and sequence of the overall effort so that individual technical-blueprint and implementation-plan documents have a timeline and ownership structure to slot into.

## Input

**Works best with:** The name of the project and a description of its overall goal and scope.
**Also valuable:** Team size and roles, hard deadlines or launch dates, budget constraints, known dependencies on other teams or vendors, prior similar projects and how long they took.

**Example invocation:** `Create a project plan for building a subscription-billing SaaS product from scratch. Team of 3 engineers, 1 designer, 1 PM. Target: usable beta in 3 months. No hard external deadline but investors expect a demo by month 4.`

## Key Concepts

### Work Breakdown Structure (WBS)
Decompose the project into progressively smaller deliverables until each leaf item is small enough to estimate confidently (typically 1 day - 2 weeks of work). A WBS is a tree, not a flat list: Project → Phases → Workstreams → Deliverables → Tasks.

### Milestone-Based Planning
Milestones are dated, binary (done/not-done) checkpoints tied to a deliverable a stakeholder can actually see or use - not "50% done with backend." Every milestone needs an explicit Definition of Done.

### RACI Matrix
For every major deliverable, assign:
- **Responsible** - does the work
- **Accountable** - owns the outcome; exactly one person per deliverable
- **Consulted** - provides input before decisions
- **Informed** - notified after decisions

Ambiguous ownership (two people "Accountable," or nobody) is the single most common cause of stalled work - resolve it explicitly.

### Dependency and Critical Path Mapping
Identify which deliverables block others. The critical path is the longest chain of dependent tasks - it determines the earliest possible finish date regardless of how much parallel work happens elsewhere. Compressing the timeline requires shortening the critical path specifically, not adding effort anywhere.

### Project-Level Risk Register
Distinct from a security threat model or technical risk - this covers schedule risk (key person unavailable, estimate wrong), resource risk (budget cut, hiring delay), scope risk (requirements change mid-flight), and external risk (vendor delay, dependency on another team).

## Application

### Phase 1: Socratic Clarification & Brainstorming (Mandatory Interview)
Before writing any project plan, you MUST interrogate the user's initial input, identify gaps, and ask **3-5 targeted clarifying questions** to dig deeper. Do NOT generate the template yet.
Ask questions to resolve:
1. **Scope boundary**: What must exist at launch versus what can wait for a later phase?
2. **Team and constraints**: Who is actually available to do the work, and what is their capacity (full-time, part-time, shared across projects)?
3. **Hard dates**: Are there any externally fixed dates (investor demo, contractual deadline, event) versus soft target dates?
4. **Known dependencies**: Does this project depend on another team, a vendor, a not-yet-built piece of infrastructure, or a decision still pending elsewhere?
*Wait for the user's response to these questions before drafting the final project plan.*

### Phase 2: Scope and WBS (30-45 min)
Define what is in and out of scope, then decompose into a Work Breakdown Structure down to estimable deliverables.

### Phase 3: Milestones and Timeline (30 min)
Group deliverables into dated milestones with explicit Definition of Done. Sequence them against team capacity.

### Phase 4: RACI and Ownership (20 min)
Assign Responsible/Accountable/Consulted/Informed for every major deliverable. Flag any deliverable with unclear or dual ownership.

### Phase 5: Dependency and Critical Path Mapping (20 min)
Map which deliverables block others. Identify the critical path and the milestones most exposed to delay.

### Phase 6: Risk Register (20 min)
Identify schedule, resource, scope, and external risks with likelihood, impact, and a mitigation or contingency for each.
