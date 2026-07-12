---
name: using-engineering-docs
argument-hint: "[your project idea, in your own words]"
description: The entry point for this plugin. Give it a raw project idea or concept - a sentence, a paragraph, informal notes - and it takes over from there: runs a discovery conversation about the idea itself, decides which of the plugin's document skills actually apply to this project and in what order, and then generates that full document set one skill at a time, running each skill's own clarifying interview automatically. Use this when you have an idea and don't yet know which documents you need - not when you already know you want a specific document (call that skill directly instead).
intent: >-
  Every other skill in this plugin assumes you already know which document you want. This skill removes that assumption. Most people starting a project do not think in terms of "I need a technical specification and then a system architecture document" - they think in terms of "I want to build X." This skill's entire job is to sit between a raw idea and the 20 specialist skills in this plugin: understand the idea well enough to know which documents a project of this shape actually needs, propose a sequence, and then execute that sequence end to end without ever asking the user to pick a skill by name. The person answers questions about their project; the agent handles every routing decision. The end state is a complete, cross-consistent document set thorough enough that another engineer - or another AI agent starting cold - could read it and build the entire thing to production without having to ask what was meant.
type: orchestrator
theme: engineering-docs
best_for:
  - "Turning a raw business or product idea into a complete set of pre-development documents automatically"
  - "Starting any new project when you don't know (and shouldn't have to know) which specific documents you need"
  - "Handing a project to an AI coding agent and wanting the full context it would need already written down"
  - "Working through documentation for a project idea interactively, one document at a time, with the right skill invoked automatically at each step"
scenarios:
  - "I have an idea: an e-commerce site where customers build custom gift boxes by picking items, and the site recommends what pairs well or auto-builds a set from a short quiz. Help me turn this into everything needed to build it."
  - "I want to build a subscription-based habit tracker app. I don't know what documents I need, just help me figure out and write whatever's necessary."
  - "Here's a rough concept for an internal tool our support team needs. Take it from idea to something a developer could start building from."
estimated_time: "30-60 min for idea intake and planning, then 1-2 hours per document generated - varies by project size"
license: MIT
compatibility: Designed for Gemini (Antigravity), Claude Code, Cursor/Windsurf, Kimi Code, Codex/Copilot
---

## Purpose

Take a project idea in whatever form it arrives - a sentence, a messy paragraph, a half-formed concept - and turn it into a complete, right-sized set of pre-development documents, using the other skills in this plugin as building blocks. The user never needs to know a skill's name or pick one; they answer questions about their project, and this skill handles which document gets written, in what order, and by which underlying skill.

**This is a router, not a writer.** It does not draft documents itself - it understands the project well enough to hand off to the correct specialist skill at the correct time, in the correct sequence, and then stitches the results into one coherent, navigable set.

## Input

**Works best with:** A description of the project idea, in the user's own words, at any level of polish - a one-line pitch is enough to start.
**Also valuable:** Anything the user already knows: target users, rough scale, budget/timeline pressure, whether this is a side project or something with real users depending on it, any part of the idea they're already unsure about.

**Do not require a polished brief before starting.** Extracting the details is this skill's first job, not a precondition for using it.

## Key Concepts

### Discovery Before Routing
Never jump straight to a specific document. The idea itself must be understood first - at a level above any single skill - before deciding which skills even apply. A skill-specific interview (e.g., technical-specification's own clarifying questions) only starts once this skill has already decided that document is needed.

### The Skill Directory

| Phase | Skill | Produces | Always Core, or Conditional? |
| :--- | :--- | :--- | :--- |
| Discovery | `project-plan` | Scope, milestones, RACI, timeline, project-level risks | Always |
| Discovery | `user-personas-behavior` | Who it's for, jobs-to-be-done, success metrics, analytics plan | Always |
| Discovery | `technical-feasibility-study` | Go/no-go on a specific risky technical approach | Conditional - only if a specific part of the idea is technically uncertain |
| Requirements & Experience | `technical-specification` | Functional & non-functional requirements (SRS/TSD) | Always |
| Requirements & Experience | `ux-flow-specification` | User journeys, screen-by-screen flow, every UI state | Conditional - skip only for a pure backend/API-only project with no UI |
| Requirements & Experience | `design-system-specification` | Visual design tokens, components, accessibility | Conditional - skip for API-only or purely internal CLI-type projects |
| Architecture & Design | `system-architecture-document` | Overall structure - C4 diagrams, 4+1 views, NFRs | Always |
| Architecture & Design | `architecture-decision-record` | One immutable record per significant decision | Ad hoc - created throughout Architecture & Design, not as a single upfront document |
| Architecture & Design | `database-design-document` | ERD, schema, indexing, migration plan | Conditional - skip only if the project genuinely has no structured data to persist |
| Architecture & Design | `api-design-document` | API contract, resources, auth, versioning | Conditional - include if there's any internal or external API surface |
| Architecture & Design | `admin-access-control-specification` | Roles, permission matrix, audit logging, break-glass access | Conditional - include as soon as there is more than one privilege level |
| Architecture & Design | `technical-blueprint` | Detailed design for one specific feature/component | Ad hoc - one per non-trivial feature surfaced during implementation planning |
| Quality & Risk | `security-threat-model` | STRIDE-based threat model and risk register | Conditional - include whenever the project handles accounts, payments, PII, or any external attack surface (this is most projects) |
| Quality & Risk | `test-strategy-document` | Testing pyramid, mocking strategy, CI gates | Always |
| Delivery & Operations | `implementation-plan` | Dependency-ordered build sequence, phase gates | Always |
| Delivery & Operations | `deployment-plan` | Release strategy, go/no-go gate, rollback | Always |
| Delivery & Operations | `slo-error-budget-document` | Reliability targets, error budget, burn-rate alerts | Conditional - include once real users/customers depend on uptime |
| Delivery & Operations | `technical-runbook` | On-call operations manual | Conditional - include once something will actually run in production |
| Delivery & Operations | `disaster-recovery-plan` | RTO/RPO, backup strategy, failover runsheets | Conditional - include whenever downtime or data loss has real business or compliance cost |
| Reactive (not part of pre-dev sequence) | `incident-postmortem` | Blameless review of a real incident | Never scheduled upfront - only used reactively after launch |

### Right-Sizing, Not Maximalism
A weekend side project and a payments platform do not need the same 15 documents. The point of the idea-intake conversation is to determine which conditional skills actually apply - producing every possible document regardless of project size defeats the purpose of "complete and right-sized." When in doubt on a conditional skill, lean toward including it for anything with real users, money, or personal data involved, and toward skipping it for a prototype or internal experiment - and say which way you leaned and why.

### One Skill at a Time, Never Batched
Invoke exactly one underlying skill's own mandatory clarifying interview at a time. Do not pre-ask questions belonging to a later skill just because they're on your mind - each skill's interview happens only when it's that skill's turn, using its own SKILL.md.

### Cross-Document Consistency
After each new document is produced, check it against documents already written for this project: do entity names in the database design match the technical specification? Does the architecture document reflect roles defined in the access-control spec? Reconcile mismatches before moving on rather than letting them accumulate.

### The Master Index Is the Deliverable That Ties It Together
The final output of this skill is not just a folder of documents - it's the master index (see `template.md`) that lists every document produced, its status, and the order a new reader (human or AI agent) should read them in to get full context fast.

## Application

### Phase 1: Idea Intake (Mandatory Interview)
Before selecting any skill, understand the idea itself. Ask **3-5 targeted questions** about the project - not about documents:
1. **The core idea**: What is being built, and what's the single most important thing it needs to do well?
2. **Who it's for and how it makes sense**: Who are the users, and is there a business model or organizational goal behind this?
3. **Scale and stakes**: Is this a prototype/side project, an internal tool, or something with real paying users or sensitive data from day one?
4. **Constraints**: Team size, timeline pressure, budget, existing tech stack or infrastructure already decided.
5. **Known uncertainty**: Is there a specific part of the idea the user is already unsure is technically possible or sensible?
*Wait for the user's answers before proposing anything.*

### Phase 2: Project Characterization and Skill Selection
Using the Skill Directory, determine which conditional skills apply to this specific project, and note the "always core" ones. Do this internally - the output is a plan, not a request for the user to choose skills.

### Phase 3: Sequencing Plan Preview
Present the resulting document list and order in a few lines - what will be produced, roughly in what order, and a one-line reason for any conditional skill included or excluded. Invite the user to redirect ("skip the design system doc, we're API-only") but do not turn this into a multi-question gate - proceed once there's no objection.

### Phase 4: Sequential Document Generation
For each document in the plan, in order:
1. Switch into that skill's own SKILL.md and run its mandatory Socratic clarification interview.
2. Generate that document using its template.
3. Briefly confirm it's good before moving to the next - don't silently chain 15 documents with no checkpoint.
Create `architecture-decision-record` and `technical-blueprint` documents ad hoc, at the point in the sequence where a significant decision or a non-trivial feature is actually identified - not as single monolithic steps.

### Phase 5: Cross-Document Consistency Pass
After the full set is generated, re-scan for contradictions between documents (naming, scope, ownership) and resolve them.

### Phase 6: Master Project Index
Produce the master index (using `template.md`) - the single document that lists everything produced, its status, and the recommended reading order for anyone (or any agent) picking up the project cold.
