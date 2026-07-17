---
name: project-plan
argument-hint: "[project or product name]"
description: Create a project delivery plan covering scope, milestones, timeline, work breakdown, resourcing, stakeholder roles (RACI), dependencies, budget, quality gates, and a project-level risk register. Use at the start of any project to define who is building what, in what order, by when - before any code is written.
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
estimated_time: "2-4 hours"
license: MIT
compatibility: Designed for Gemini (Antigravity), Claude Code, Cursor/Windsurf, Kimi Code, Codex/Copilot
---

## Purpose

Produce a project plan that defines scope, milestones, timeline, ownership, dependencies, budget, quality standards, and risk at the delivery level - the document that answers "what are we building, in what order, who owns each part, and by when" for anyone tracking the project, not just the engineers building it.

**This is not a technical design document.** It does not specify how any single component works - it specifies the shape and sequence of the overall effort so that individual technical-blueprint and implementation-plan documents have a timeline and ownership structure to slot into.

## Input

**Works best with:** The name of the project and a description of its overall goal and scope.
**Also valuable:** Team size and roles, hard deadlines or launch dates, budget constraints, known dependencies on other teams or vendors, prior similar projects and how long they took.

**Example invocation:** `Create a project plan for building a subscription-billing SaaS product from scratch. Team of 3 engineers, 1 designer, 1 PM. Target: usable beta in 3 months. No hard external deadline but investors expect a demo by month 4.`

## Key Concepts

### Work Breakdown Structure (WBS)
Decompose the project into progressively smaller deliverables until each leaf item is small enough to estimate confidently (typically 1 day - 2 weeks of work). A WBS is a tree, not a flat list: Project -> Phases -> Workstreams -> Deliverables -> Tasks.

### Estimation Methodology

Use a structured estimation approach rather than gut-feel guesses. The recommended methods, in order of preference:

- **Three-point estimation** -- For each deliverable, estimate three values:
  - **Optimistic (O):** Best-case scenario, everything goes right
  - **Most likely (M):** Realistic estimate under normal conditions
  - **Pessimistic (P):** Worst-case scenario, significant obstacles
  - **Expected duration:** E = (O + 4M + P) / 6
  - **Standard deviation:** SD = (P - O) / 6
  - This produces a probability-weighted estimate and exposes estimate uncertainty.

- **Story points** -- Relative sizing using a modified Fibonacci sequence (1, 2, 3, 5, 8, 13, 21). Best for teams with a shared reference backlog. Requires a calibration sprint or reference story.

- **T-shirt sizing** -- XS, S, M, L, XL for rough early-phase estimation when details are insufficient for points. Convert to numeric ranges later (e.g., S = 1-3 days, M = 3-5 days).

- **Ideal hours** -- Best for well-understood, granular tasks. Use when the work is procedural and the team has done it before.

**What "estimable" means:** A deliverable is estimable when the team can describe what "done" looks like, identify the major steps, and has either done similar work before or has enough context to reason about effort. If a deliverable cannot be estimated, it needs further decomposition or a research spike before it enters the plan.

### Milestone-Based Planning
Milestones are dated, binary (done/not-done) checkpoints tied to a deliverable a stakeholder can actually see or use - not "50% done with backend." Every milestone needs an explicit Definition of Done and an explicit Acceptance Criteria.

### Acceptance Criteria per Milestone
Each milestone must include:
- **Observable outcome:** What a stakeholder can see, test, or verify
- **Sign-off owner:** The specific person who declares the milestone complete
- **Sign-off process:** How acceptance is recorded (e.g., PR approval, demo attendance, written sign-off email)
- **Escalation path:** What happens if the milestone is not accepted (rework plan, timeline impact)

### RACI Matrix
For every major deliverable, assign:
- **Responsible** - does the work
- **Accountable** - owns the outcome; exactly one person per deliverable
- **Consulted** - provides input before decisions
- **Informed** - notified after decisions

Ambiguous ownership (two people "Accountable," or nobody) is the single most common cause of stalled work - resolve it explicitly.

### Dependency and Critical Path Mapping
Identify which deliverables block others. The critical path is the longest chain of dependent tasks - it determines the earliest possible finish date regardless of how much parallel work happens elsewhere. Compressing the timeline requires shortening the critical path specifically, not adding effort anywhere.

### Critical Path Calculation

Calculate the critical path explicitly using forward and backward pass methodology:

**Forward pass (earliest start/finish):**
1. Start at the first deliverable with no predecessors. Set its Earliest Start (ES) = 0.
2. For each deliverable, Earliest Finish (EF) = ES + Duration.
3. For each deliverable with multiple predecessors, ES = max(EF of all predecessors).
4. The EF of the last deliverable is the project's earliest completion date.

**Backward pass (latest start/finish):**
1. Start at the last deliverable. Set its Latest Finish (LF) = project earliest completion date.
2. For each deliverable, Latest Start (LS) = LF - Duration.
3. For each deliverable with multiple successors, LF = min(LS of all successors).

**Float (slack) calculation:**
- Float = LS - ES (or equivalently, LF - EF)
- Deliverables with Float = 0 are on the critical path
- Float > 0 indicates schedule flexibility (the deliverable can slip by that many days without delaying the project)

**Critical path = the chain of zero-float deliverables from first to last.**

Document this explicitly in the plan. When the project needs to accelerate, focus compression efforts (crashing, fast-tracking) only on critical-path deliverables.

### Project-Level Risk Register
Distinct from a security threat model or technical risk - this covers schedule risk (key person unavailable, estimate wrong), resource risk (budget cut, hiring delay), scope risk (requirements change mid-flight), and external risk (vendor delay, dependency on another team).

### Budget and Cost Tracking
A project plan must include a budget breakdown that covers:
- **Per-phase cost estimates** -- labor, infrastructure, tools, vendor costs per phase
- **Total project budget** -- aggregate with contingency buffer (typically 10-20%)
- **Burn rate** -- expected spend per week/month, plotted against timeline
- **Cost tracking mechanism** -- how actual spend will be monitored against plan (spreadsheet, tool, finance review cadence)
- **Budget risk** -- what happens if a phase overruns; is there a reserve?

If the user does not provide cost data, note the budget section as TBD and flag it as a required follow-up.

### Quality Assurance Plan
Define quality standards at the project level, not just per-component:
- **Code review policy** -- who reviews, approval requirements, turnaround expectations
- **Testing strategy** -- unit, integration, end-to-end coverage targets per phase
- **Quality gates per milestone** -- what must pass before a milestone is accepted (test pass rate, code coverage threshold, performance benchmarks, security scan results)
- **Definition of Done** -- project-wide standards that apply to every deliverable (e.g., tests pass, documentation updated, reviewed, deployed to staging)

### Change Management Process
Scope changes are inevitable. Define the framework upfront:
- **How changes are proposed** -- who can request, what format (RFC, ticket, email)
- **Impact analysis requirements** -- every change request must include timeline impact, budget impact, resource impact, and dependency impact
- **Approval authority** -- who can approve minor changes (within buffer) vs. major changes (exceeds contingency)
- **Communication** -- how approved changes are broadcast to the team and stakeholders
- **Tracking** -- where changes are logged (change log in the plan document)

### Definition of Ready
Before any deliverable enters active work, it must meet a readiness checklist:
- **Acceptance criteria defined** -- clear, testable conditions for completion
- **Dependencies resolved or scheduled** -- no blocking unknowns
- **Resources assigned** -- the Responsible person is identified and available
- **Estimate agreed upon** -- the team has estimated and committed
- **Outstanding questions answered** -- no open design or requirement questions

Flag deliverables that do not meet the Definition of Ready. They should not appear in a milestone until they are ready.

### Team Onboarding
For projects with new team members or cross-functional contributors:
- **Ramp-up plan** -- what a new team member needs to read, set up, and understand before contributing
- **Knowledge transfer timeline** -- when handoffs from existing team or subject matter experts happen
- **Buddy/mentor assignment** -- who answers questions during the first sprint
- **Access and tooling** -- accounts, permissions, environments that need provisioning
- **First deliverable** -- a scoped, low-risk task to build context

### Retrospective Cadence
Build a learning mechanism into the project:
- **Cadence** -- when retrospectives happen (end of each phase, every 2 weeks, at each milestone)
- **Format** -- what framework is used (Start/Stop/Continue, 4Ls, Mad/Sad/Glad)
- **Action items** -- how improvement items are tracked and assigned
- **Blameless culture** -- retrospectives focus on process, not people

### Conflict Resolution

When your analysis conflicts with the user's stated preference:

1. **Present both positions** -- show your analysis and their preference side by side
2. **Explain the trade-off** -- what are the consequences of each choice?
3. **Recommend with reasoning** -- state your recommendation and why
4. **Respect the user's decision** -- they own the final call
5. **Document the decision** -- record it as an `[owner-specified]` override with reasoning

### Document Length

Target length: **5-8 pages** (excluding appendices).

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
1. **Hard dates**: Are there any externally fixed dates (investor demo, contractual deadline, event) versus soft target dates?
2. **Known dependencies**: Does this project depend on another team, a vendor, a not-yet-built piece of infrastructure, or a decision still pending elsewhere?

*Wait for the user's response to these questions before drafting the final project plan.*

### Phase 2: Scope and WBS (60-90 min)
Define what is in and out of scope, then decompose into a Work Breakdown Structure down to estimable deliverables.

**Estimation methodology guidance:**
- Apply three-point estimation (Optimistic, Most Likely, Pessimistic) to each deliverable. Use the formula E = (O + 4M + P) / 6 to produce probability-weighted estimates.
- For early-stage deliverables where detail is insufficient, use t-shirt sizing (XS/S/M/L/XL) and convert to numeric ranges when detail becomes available.
- For well-understood procedural work, use ideal hours.
- A deliverable is "estimable" when the team can describe what done looks like, identify the major steps, and has enough context to reason about effort. Target range: 1 day to 2 weeks. Deliverables larger than 2 weeks need further decomposition. Deliverables smaller than 1 day should be grouped.
- If a deliverable cannot be estimated, flag it for a research spike before including it in a milestone.

### Phase 3: Milestones and Timeline (60 min)
Group deliverables into dated milestones with explicit Definition of Done and Acceptance Criteria. Sequence them against team capacity.

For each milestone, define:
- Binary Definition of Done (observable, verifiable)
- Acceptance Criteria with sign-off owner
- Definition of Ready prerequisites for all deliverables in the milestone
- Quality gate requirements (test pass rate, coverage, performance)

### Phase 4: RACI and Ownership (40-60 min)
Assign Responsible/Accountable/Consulted/Informed for every major deliverable. Flag any deliverable with unclear or dual ownership.

**When the team is not yet staffed:**
- Use placeholder roles (e.g., "Backend Engineer - TBD") in the RACI matrix
- Add a hiring timeline column or note indicating when the role must be filled for work to begin
- Flag unstaffed roles as a risk in the risk register
- Define the hiring/recruiting owner as Accountable for staffing
- Identify which deliverables are blocked by unfilled roles and adjust the timeline accordingly
- Include a team onboarding section with ramp-up plan for roles filled after project start

### Phase 5: Dependency and Critical Path Mapping (40-60 min)
Map which deliverables block others. Identify the critical path and the milestones most exposed to delay.

**Critical path calculation instructions:**

1. **Forward pass** -- Start at the first deliverable (ES = 0). For each deliverable, EF = ES + Duration. For deliverables with multiple predecessors, ES = max(EF of all predecessors). The EF of the final deliverable is the earliest project completion date.

2. **Backward pass** -- Start at the final deliverable (LF = earliest completion date). For each deliverable, LS = LF - Duration. For deliverables with multiple successors, LF = min(LS of all successors).

3. **Float calculation** -- Float = LS - ES. Deliverables with Float = 0 are on the critical path.

4. **Document the critical path** -- List the chain of zero-float deliverables. Flag the milestone most exposed to slippage.

5. **Compression guidance** -- If the timeline needs to shorten, focus on crashing (add resources to) or fast-tracking (parallelize) only critical-path deliverables. Non-critical path work cannot shorten the project.

### Phase 6: Risk Register (40-60 min)
Identify schedule, resource, scope, and external risks with likelihood, impact, and a mitigation or contingency for each.

Include risks for:
- Unstaffed roles and hiring delays
- Budget overruns
- Scope creep from unmanaged change requests
- Quality issues discovered late

### Phase 7: Revision (After User Review)

If the user requests changes after reviewing the document:

1. **Read the user's feedback carefully** -- understand what they want changed
2. **Check for conflicts** -- does the requested change conflict with prior documents?
3. **Apply changes** -- update the document
4. **Re-run consistency check** -- verify the change doesn't break cross-document consistency
5. **Update metadata** -- set `last_updated` to today's date
6. **Confirm with user** -- show the changes and get approval

## Gotchas

- **Confusing the project plan with a technical design document.** The project plan defines who does what by when, not how any component works technically. Agents that include implementation details here duplicate the technical-blueprint and create maintenance burden.
- **Assigning multiple people as "Accountable" for the same deliverable.** The RACI matrix requires exactly one Accountable person per deliverable. Two Accountable people means nobody is accountable. Flag and resolve every instance of dual or missing ownership.
- **Using vague milestone definitions like "backend mostly done."** Milestones must be binary (done or not done) and tied to something a stakeholder can observe or verify. "API endpoints deployed and passing integration tests" is a milestone; "backend 80% complete" is not.
- **Ignoring the critical path.** Agents list deliverables and dates without identifying which chain of dependencies sets the earliest possible finish date. Without critical path analysis, timeline compression efforts target the wrong workstreams.
- **Treating all risks as technical.** Project-level risks include schedule risks (key person leaves), resource risks (budget cut), scope risks (requirements change), and external risks (vendor delay). Agents that only list technical risks miss the most common project failures.
- **Skipping the budget section.** Even if the user did not provide cost data, the template must include budget placeholders. A project plan without a budget is incomplete.
- **No Definition of Ready.** Deliverables that enter a milestone without clear acceptance criteria, resolved dependencies, and assigned resources will stall. Enforce readiness before committing to a milestone.
- **No change management process.** Without a defined process for evaluating and approving scope changes, projects accumulate untracked scope creep until the timeline collapses.

## Handoff

**Reads from:**
- `business-concept` -- problem, users, constraints, scope, timeline, market context
- `user-personas-behavior` -- target users, usage patterns, priority features by persona
- `technical-specification` -- system requirements, technical constraints, integration points

**Feeds into:**
- `implementation-plan` -- scope boundaries, timeline constraints, team capacity, milestone definitions
- `test-strategy-document` -- quality gates, acceptance criteria, testing cadence per phase
- `deployment-plan` -- timeline, dependencies, go-live milestones, rollback ownership
- `system-architecture-document` -- delivery timeline, team structure, dependencies
- `ux-flow-specification` -- feature prioritization, phased delivery scope

## Quality Gate

Before marking this document as `final`, verify:
- [ ] Every deliverable in the WBS has exactly one Accountable person in the RACI matrix
- [ ] All milestones have a binary Definition of Done tied to an observable outcome
- [ ] All milestones have Acceptance Criteria with a sign-off owner and process
- [ ] The critical path is identified and the milestone most exposed to slippage is flagged
- [ ] The risk register covers schedule, resource, scope, and external risk categories (not just technical)
- [ ] Scope boundaries are explicit: what is in scope and what is explicitly out of scope
- [ ] Budget section exists with per-phase estimates, total budget, and burn rate (or is flagged TBD)
- [ ] Quality gates are defined per milestone (test pass rate, coverage, review requirements)
- [ ] Change management process is defined (proposal, impact analysis, approval authority)
- [ ] Definition of Ready checklist is specified for deliverables
- [ ] Retrospective cadence is established
- [ ] Unstaffed roles are flagged with hiring timeline and risk mitigation

## Next Steps

After this document is complete, proceed to:
- **`implementation-plan`** -- detailed task-level breakdown with sprint assignments
- **`test-strategy-document`** -- comprehensive testing approach aligned with quality gates
- **`deployment-plan`** -- release strategy, environments, rollback procedures
- **`technical-specification`** -- detailed system requirements with acceptance criteria
- **`system-architecture-document`** -- architectural structure and design decisions
- **`ux-flow-specification`** -- user flows and screen-by-screen behavior
- Or invoke `using-engineering-docs` to continue the pipeline
