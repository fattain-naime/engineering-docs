---
name: using-engineering-docs
argument-hint: "[your project idea, in your own words]"
description: The entry point for this plugin. Give it a raw project idea or concept and it takes over: runs a discovery conversation, decides which document skills apply and in what order, then generates that full document set one skill at a time. Use when you have an idea and don't yet know which documents you need.
intent: >-
  Every other skill in this plugin assumes you already know which document you want. This skill removes that assumption. Most people starting a project do not think in terms of "I need a technical specification and then a system architecture document" — they think in terms of "I want to build X." This skill's entire job is to sit between a raw idea and the 21 specialist skills in this plugin: understand the idea well enough to know which documents a project of this shape actually needs, propose a sequence, and then execute that sequence end to end without ever asking the user to pick a skill by name. The person answers questions about their project; the agent handles every routing decision. The end state is a complete, cross-consistent document set thorough enough that another engineer — or another AI agent starting cold — could read it and build the entire thing to production without having to ask what was meant.
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
  - "We have an existing app and want to add a payment system. Help me document what's needed."
estimated_time: "1-2 hours for idea intake and planning, then 2-4 hours per document generated — varies by project size"
license: MIT
compatibility: Designed for Gemini (Antigravity), Claude Code, Cursor/Windsurf, Kimi Code, Codex/Copilot, OpenCode, Goose, Pi, Kilo Code, Roo Code, Cline
---

# Engineering-Docs Orchestrator

## Purpose

Take a project idea in whatever form it arrives — a sentence, a messy paragraph, a half-formed concept — and turn it into a complete, right-sized set of pre-development documents, using the other skills in this plugin as building blocks. The user never needs to know a skill's name or pick one; they answer questions about their project, and this skill handles which document gets written, in what order, and by which underlying skill.

**This is a router, not a writer.** It does not draft documents itself — it understands the project well enough to hand off to the correct specialist skill at the correct time, in the correct sequence, and then stitches the results into one coherent, navigable set.

## Input

**Works best with:** A description of the project idea, in the user's own words, at any level of polish — a one-line pitch is enough to start.
**Also valuable:** Anything the user already knows: target users, rough scale, budget/timeline pressure, whether this is a side project or something with real users depending on it, any part of the idea they're already unsure about.

**Do not require a polished brief before starting.** Extracting the details is this skill's first job, not a precondition for using it.

---

## Mode Detection

Before anything else, determine which of two modes you're operating in. The required documents and the questions are different.

### Mode A — Greenfield (new product from an idea)

No existing `.engineering-docs/` folder, and no indication of an existing codebase. Full pipeline runs, starting from business concept.

### Mode B — Brownfield (new feature / change on an existing system)

Triggered when:
- A `.engineering-docs/` folder with an `index.md` already exists in the repo, OR
- The user's request references "add a feature," "extend," "modify," or similar language, OR
- An existing codebase is present in the project root with no engineering-docs history

**In Mode B, do NOT re-run the full business-plan / system-architecture interview.** Instead:

1. Read the existing `index.md` (if present) and the docs it links to for context.
2. If no docs exist, scan the existing codebase/README first to infer current architecture, stack, and conventions — and ask the user to confirm or correct that inference rather than starting from zero.
3. Run only the subset of skills relevant to the change (typically: `technical-blueprint` for the feature itself, `architecture-decision-record` if it affects architecture, `database-design-document` if it touches the data model, `api-design-document` if it adds/changes endpoints, `test-strategy-document` scoped to the feature, `security-threat-model` if it touches auth/payments/PII, `project-plan` if scope/timeline changes, `implementation-plan` if build order changes).
4. Produce new numbered docs that append to the existing set, never overwriting prior history.

---

## Anti-Rationalization

These thoughts mean STOP — you're rationalizing a shortcut:

| Thought | Reality |
|:---|:---|
| "This project is simple enough to skip idea intake" | Simple projects have the most unexamined assumptions. The intake takes 5 minutes. |
| "I can batch all the clarifying questions at once" | One question at a time produces better answers. Batching overwhelms the user. |
| "I'll generate all conditional documents just to be thorough" | Right-sizing is the point. Generating unnecessary docs wastes time and dilutes quality. |
| "I'll do the consistency check at the end" | Incremental checks catch errors when they're cheap to fix. End-of-run checks find compounding problems. |
| "The user probably knows what they want, I'll skip the interview" | The interview IS the value. Without it, you're guessing. |
| "This document looks good enough, I'll move on" | Quality gates exist for a reason. "Good enough" without verification is not good enough. |
| "I remember the skill, I don't need to read it" | Skills evolve. Always read the current SKILL.md before invoking. |
| "I'll just generate the template without the interview" | The interview produces the content. The template is just the structure. |
| "I'll ask inline in the conversation" | Use tool calls for interviews. Inline questions pollute conversation context and force users to type responses. |

---

## Gotchas — Common Orchestrator Mistakes

- **Skipping Phase 0.** The business concept interview is mandatory. Without it, every downstream document is built on assumptions.
- **Asking inline questions.** Use tool calls (e.g., `AskUserQuestion`) for ALL interview questions. Inline questions pollute conversation context and force users to type responses.
- **Batching clarifying questions.** One question per tool call. Multiple questions in one message produce partial or shallow answers.
- **Generating all conditional documents.** Not every project needs a disaster recovery plan or an SLO document. Right-size based on the project's actual stakes.
- **Deferring consistency checks to the end.** Check after each document. Naming mismatches compound if caught late.
- **Not reading the skill's SKILL.md before invoking it.** Each skill has its own interview process. Read it, then follow it.
- **Treating the template as the output.** The template is a skeleton. The interview produces the content that fills it.
- **Silently overwriting documents on re-run.** Never overwrite. Append new versions or archive old ones.
- **Writing secrets into documents.** Never write actual API keys, credentials, or connection strings. Reference by name/purpose only.

---

## Key Concepts

### The Skill Directory

| Phase | Skill | Produces | Always Core, or Conditional? |
|:---|:---|:---|:---|
| 0 | `business-concept` | Problem, users, value proposition, monetization, constraints | Always |
| 0.5 | `project-plan` | Scope, milestones, RACI, timeline, work breakdown structure | Always |
| 0.6 | `user-personas-behavior` | User personas, jobs-to-be-done, success metrics, analytics plan | Always |
| 1 | `technical-feasibility-study` | Go/no-go on a specific risky technical approach | Conditional — only if a specific part of the idea is technically uncertain |
| 2 | `technical-specification` | Functional & non-functional requirements (SRS/TSD) | Always |
| 2.5 | `ux-flow-specification` | User journeys, screen-by-screen flow, every UI state | Conditional — skip only for a pure backend/API-only project with no UI |
| 3 | `system-architecture-document` | Overall structure — diagrams, tech stack, NFRs | Always |
| 3+ | `architecture-decision-record` | One immutable record per significant decision | Ad hoc — created throughout, not as a single upfront document |
| 4 | `database-design-document` | ERD, schema, indexing, migration plan | Conditional — skip only if the project genuinely has no structured data to persist |
| 5 | `api-design-document` | API contract, resources, auth, versioning | Conditional — include if there's any internal or external API surface |
| 5.5 | `admin-access-control-specification` | Roles, permission matrix, audit logging, break-glass access | Conditional — include as soon as there is more than one privilege level |
| 6 | `security-threat-model` | STRIDE-based threat model and risk register | Conditional — include whenever the project handles accounts, payments, PII, or any external attack surface |
| 7 | `design-system-specification` | Visual design tokens, components, accessibility | Conditional — skip for API-only or purely internal CLI-type projects |
| 8 | `technical-blueprint` | Detailed design for one specific feature/component | Ad hoc — one per non-trivial feature surfaced during implementation planning |
| 8.5 | `implementation-plan` | Dependency-ordered build sequence, phase gates | Always |
| 9 | `test-strategy-document` | Testing pyramid, mocking strategy, CI gates | Always |
| 10 | `deployment-plan` | Release strategy, go/no-go gate, rollback | Always |
| 11 | `technical-runbook` | On-call operations manual | Conditional — include once something will actually run in production |
| 11.5 | `disaster-recovery-plan` | RTO/RPO, backup strategy, failover runsheets | Conditional — include whenever downtime or data loss has real business or compliance cost |
| 11.6 | `slo-error-budget-document` | Reliability targets, error budget, burn-rate alerts | Conditional — include once real users/customers depend on uptime |
| ongoing | `incident-postmortem` | Blameless review of a real incident | Never scheduled upfront — only used reactively after launch |

### Right-Sizing, Not Maximalism

A weekend side project and a payments platform do not need the same 15 documents. The point of the idea-intake conversation is to determine which conditional skills actually apply — producing every possible document regardless of project size defeats the purpose. When in doubt on a conditional skill, lean toward including it for anything with real users, money, or personal data involved, and toward skipping it for a prototype or internal experiment — and say which way you leaned and why.

### One Skill at a Time, Never Batched

Invoke exactly one underlying skill's own mandatory clarifying interview at a time. Do not pre-ask questions belonging to a later skill just because they're on your mind — each skill's interview happens only when it's that skill's turn, using its own SKILL.md.

**Interview Mechanism:** All skill interviews use tool calls (e.g., `AskUserQuestion`) to present questions — NOT inline conversation. One question per tool call, multiple-choice options preferred, with "I don't know, you decide" as an escape hatch.

### Cross-Document Consistency

After each new document is produced, check it against documents already written for this project: do entity names in the database design match the technical specification? Does the architecture document reflect roles defined in the access-control spec? Reconcile mismatches before moving on rather than letting them accumulate.

### The Master Index Is the Deliverable That Ties It Together

The final output of this skill is not just a folder of documents — it's the master index (see `template.md`) that lists every document produced, its status, and the order a new reader (human or AI agent) should read them in to get full context fast.

### Conflict Resolution

When your analysis conflicts with the user's stated preference:

1. **Present both positions** — show your analysis and their preference side by side
2. **Explain the trade-off** — what are the consequences of each choice?
3. **Recommend with reasoning** — state your recommendation and why
4. **Respect the user's decision** — they own the final call
5. **Document the decision** — record it as an `[owner-specified]` override with reasoning

### Diagramming Model Selection

For `system-architecture-document`, do not default to one notation. Ask a short set of plain-language questions and recommend accordingly:

- How many people need to read and act on this document? (just you / a small team / a large org with multiple teams)
- Will this document need to stay accurate for years, or does the system change weekly right now?
- Do you need to show this to non-technical stakeholders, or only engineers?

**Recommendation logic:**
- Solo/small team, fast-moving, MVP stage → plain narrative + a couple of targeted diagrams + an ADR log
- Growing team, needs onboarding docs, moderate stability → full C4 (Context → Container → Component)
- Large org, multiple teams, formal governance needs → C4 plus a 4+1 view breakdown, or ArchiMate if they already use it elsewhere

Always state the recommendation with its reasoning and let the user override.

---

## Application

### Phase 0: Business Concept Completion (Mode A Only)

Before any technical skill runs, interview the user until the business idea itself is complete.

**Interview Mechanism:** Use tool calls (e.g., `AskUserQuestion`) to present questions — do NOT ask inline in the conversation. The user selects from options rather than typing responses. This prevents conversation pollution and ensures clean input capture.

**Rules:**
- One question per tool call
- Present multiple-choice options with a recommended answer
- Include "I don't know, you decide" as an escape hatch option
- Wait for the user's selection before proceeding to the next question

**Standing constraint questions (ask once, early — every downstream document depends on these):**

1. Team size and skill level (affects stack/framework recommendations)
2. Hosting/infra preference or constraint (self-hosted, cloud, existing vendor lock-in)
3. Budget sensitivity (affects managed-service vs self-hosted tradeoffs)
4. Timeline urgency (MVP-speed vs enterprise rigor)
5. Regulatory/compliance needs if known (data residency, PCI, GDPR, etc.)
6. Existing systems this must integrate with or avoid conflicting with

**Business concept questions (one at a time, multiple choice preferred):**

1. **The core idea:** What is being built, and what's the single most important thing it needs to do well?
2. **Who it's for:** Who are the users? What problem are they currently solving without this product?
3. **Value proposition:** Why would someone choose this over alternatives (including doing nothing)?
4. **Monetization:** How does this make money? (subscription, one-time, freemium, ads, internal cost savings)
5. **Must-have vs nice-to-have:** What's the minimum that's useful? What can wait for v2?
6. **Timeline and budget:** When does this need to exist? What's the rough budget?

**Escape hatch:** Every question must accept "I don't know, you decide" as a valid answer. When the user takes that path:
1. Pick the most reasonable option given everything gathered so far
2. Record the choice AND the reasoning in the document, tagged as `[agent-decided]` rather than `[owner-specified]`
3. Continue without blocking

**Output:** `1-business-plan.md` — the foundational document every later skill reads from.

**Quality gate:** Cannot proceed until the business concept is clear enough that a stranger could understand what's being built, for whom, and why.

---

### Phase 1: Idea Intake & Project Characterization

**For Mode A:** The business concept (Phase 0) IS the idea intake. Summarize the key facts and proceed to skill selection.

**For Mode B:** Read existing docs or scan the codebase. Ask the user to confirm or correct your inference about the current state.

**Then:** Using the Skill Directory, determine which conditional skills apply to this specific project, and note the "always core" ones. Do this internally — the output is a plan, not a request for the user to choose skills.

---

### Phase 2: Sequencing Plan Preview

Present the resulting document list and order in a few lines — what will be produced, roughly in what order, and a one-line reason for any conditional skill included or excluded. Invite the user to redirect ("skip the design system doc, we're API-only") but do not turn this into a multi-question gate — proceed once there's no objection.

**Create the progress ledger:** Initialize the master index (`index.md`) using the template. This serves as the durable progress tracker that survives context compaction.

---

### Phase 3: Sequential Document Generation

For each document in the plan, in order:

1. **Read the skill's SKILL.md** to know what that document needs.
2. **Read ALL prior documents** in `.engineering-docs/` to extract already-known information (team size, budget, timeline, tech stack, constraints, etc.).
3. **Diff:** What does this document need that isn't already known from prior documents?
4. **Ask ONLY the truly missing items** — maximum 2-3 questions per skill. If information exists in any prior document, USE IT — do not re-ask.
5. **Generate the document** using the skill's template.
6. **Write it to `.engineering-docs/<N>-<slug>.md`** with the metadata header (see Document Metadata below).
7. **Update `index.md`** with the new document's status.
8. **Confirm with the user** before moving to the next — don't silently chain documents with no checkpoint.

**Context Passing Rules:**
- Business Plan (Phase 0) contains: problem, users, value proposition, monetization, scope, timeline, budget, constraints
- Project Plan contains: milestones, RACI, dependencies
- User Personas contains: target users, JTBD, success metrics
- All subsequent skills MUST read these before asking questions
- NEVER ask a question that's already answered in a prior document

Create `architecture-decision-record` and `technical-blueprint` documents ad hoc, at the point in the sequence where a significant decision or a non-trivial feature is actually identified — not as single monolithic steps.

---

### Phase 4: Consistency & Completeness Pass

After each document (incremental), and again as a final pass before the doc set is declared ready, do a lightweight cross-check:

- Does the architecture doc's chosen approach match what the database and API docs assume?
- Does every endpoint in the API doc have a corresponding entity in the database doc, or a documented external dependency?
- Does the security threat model cover every external-facing API surface listed in the API doc?
- Does the test strategy reference every feature blueprint that exists?
- Do entity names, role names, and terminology match across all documents?

Where a mismatch is found, surface the conflict to the user in plain language with a recommended resolution — same as any other question. Do not silently pick one.

**Definition of done per document type:** each skill defines its own completeness bar. Check against this bar before marking a document `status: final`.

---

### Phase 5: Master Project Index

Produce the master index (using `template.md`) — the single document that lists everything produced, its status, and the recommended reading order for anyone (or any agent) picking up the project cold.

---

### Phase 6: Revision (After User Review)

If the user requests changes to any document after reviewing it:

1. **Read the user's feedback carefully** — understand what they want changed
2. **Check for conflicts** — does the requested change conflict with other documents already generated?
3. **Apply changes** — update the target document
4. **Re-run consistency check** — verify the change doesn't break cross-document consistency across the entire set
5. **Update metadata** — set `last_updated` to today's date
6. **Update index.md** — reflect the revision in the master index
7. **Confirm with user** — show the changes and get approval before moving on

---

## Output Structure

```
<project root>/
  .engineering-docs/
    index.md
    1-business-plan.md
    2-project-plan.md
    3-user-personas.md
    4-feasibility-study.md              (if applicable)
    5-technical-specification.md
    6-ux-flow-specification.md          (if applicable)
    7-system-architecture.md
    8-database-design.md                (if applicable)
    9-api-design.md                     (if applicable)
    10-admin-access-control.md          (if applicable)
    11-security-threat-model.md         (if applicable)
    12-design-system.md                 (if applicable)
    13-blueprint-<feature-name>.md      (one per feature, numbered sub-sequence)
    14-implementation-plan.md
    15-test-strategy.md
    16-deployment-plan.md
    17-technical-runbook.md             (if applicable)
    18-disaster-recovery.md             (if applicable)
    19-slo-error-budget.md              (if applicable)
    adr/
      0001-<decision-slug>.md           (ADRs accumulate over the project's life)
```

### Versioning on Re-Run

If the orchestrator is invoked again later (Mode B, or a Mode A project revisited), never overwrite an existing numbered file. New or revised content either:
- Appends a new numbered file continuing the existing sequence (e.g., `18-blueprint-checkout-v2.md`), or
- If truly replacing a stale document, moves the old one to `.engineering-docs/archive/` with its original name and a timestamp suffix, and the new version takes the next available number.

Either way, `index.md` always reflects current reality, and nothing is silently lost.

---

## Document Metadata Standard

Every generated document opens with a frontmatter block so any agent parsing the folder can understand a file's status without reading its full body:

```yaml
---
title: <document title>
skill: <source skill name>
status: draft | final | superseded
owner_reviewed: true | false
last_updated: <date>
depends_on: [<other doc filenames this one assumes as context>]
supersedes: <filename, if this replaces an earlier doc>
---
```

`owner_reviewed: false` specifically flags any document containing one or more `[agent-decided]` answers from the escape hatch — signals to a human reviewer exactly where to focus if they want to sanity-check before build starts.

---

## Security Policy

Never write actual secrets, credentials, API keys, or connection strings into any generated document — even if the user provides them during the interview. Where a document needs to reference such a value (e.g., "the payment provider's API key"), reference it by name/purpose only (e.g., `STRIPE_SECRET_KEY`, to be set via environment variable) and never the literal value.

---

## Session Persistence

Interviews for a full Mode A pipeline can span multiple sessions. The orchestrator must be able to stop and resume without restarting:

- After every phase completes, `index.md` records which phases are done, which is in progress, and what the next unanswered question is.
- On a new invocation of `using-engineering-docs` in a project that already has a partial `.engineering-docs/` folder, read that state first and resume exactly where it left off — do not re-ask anything already answered.

---

## Context Management

For projects requiring 10+ documents, context window management is critical:

- **Between major phases**, suggest the user start a fresh session if context is getting large.
- **Each document generation** should be as self-contained as possible — the skill reads prior docs from files, not from conversation memory.
- **The index.md** is the anchor — it's always the first thing read on resume, and it contains everything needed to know what's done and what's next.

---

## Subagent Delegation

For projects requiring 10+ documents, consider delegating document generation to subagents to preserve the orchestrator's context for coordination.

### When to Use Subagents

- **Independent documents:** After the architecture is complete, database design and API design can often be generated in parallel since they depend on the same source (the architecture) but not on each other.
- **Long sessions:** If the context window is getting large, delegate the next document generation to a subagent that starts fresh.
- **Complex documents:** Documents like system-architecture-document (8 phases, 4-8 hours) benefit from a dedicated subagent with focused context.

### How to Delegate

1. **Prepare the context:** Write the necessary prior documents to files (they should already be in `.engineering-docs/`).
2. **Craft the subagent prompt:** Include:
   - The skill path to invoke
   - The business concept and standing constraints (from `1-business-plan.md`)
   - Any prior documents this document depends on (reference by filename)
   - The output file path
3. **Collect the result:** The subagent writes the document to the specified file. The orchestrator reads it and updates the index.

### Parallel Generation

Documents that can be generated in parallel (once architecture is complete):
- `database-design-document` and `api-design-document` (both depend on architecture, not on each other)
- `admin-access-control-specification` and `security-threat-model` (both depend on architecture and API design)
- Multiple `technical-blueprint` documents for independent features

Documents that MUST be sequential:
- `business-concept` → `project-plan` → `user-personas-behavior` → `technical-specification` → `system-architecture-document` (each depends on the previous)
- `implementation-plan` → `test-strategy-document` → `deployment-plan` (each depends on the previous)

---

## Cross-Agent Compatibility

- The orchestrator and all 22 skills must be pure markdown + plain instructions — no logic that depends on a specific agent harness's proprietary tool names.
- Any harness-specific action (e.g., "write a file," "ask the user a question") must be described in terms every harness supports, not tied to one platform's tool schema.

---

## Standalone Skill Usage

Every skill remains independently callable outside the orchestrator for users who already have partial documentation and want a single artifact (e.g., calling `engineering-docs:security-threat-model` directly on an existing system). Standalone mode skips the orchestrator's phase sequencing and context-loading — it interviews for exactly what that one skill needs.

---

## Handoff

**Reads from:**
- User's raw project idea or existing codebase
- Existing `.engineering-docs/` folder (if brownfield)
- Standing constraints: team size, hosting, budget, timeline, compliance

**Feeds into:**
- Every downstream skill in the pipeline — provides business context, constraints, and prior documents
- The master `index.md` — tracks progress and reading order
- Any AI coding agent starting cold — the complete document set is the handoff artifact

---

## Quality Gate

Before declaring the document set complete, verify:
- [ ] Mode detection was correct (greenfield vs brownfield)
- [ ] Phase 0 (business concept) was completed for Mode A
- [ ] Standing constraint questions were asked once, early
- [ ] Each document was generated using its skill's template
- [ ] Each document has the required metadata frontmatter
- [ ] Incremental consistency checks were run after each document
- [ ] Final consistency pass found no unresolved conflicts
- [ ] Master index (`index.md`) is complete and accurate
- [ ] All `[agent-decided]` items are flagged in the index
- [ ] No secrets, credentials, or API keys appear in any document
- [ ] Reading order in index matches dependency order
- [ ] "If you only read three documents" pointer is accurate

## Error Handling

### Template Missing
If a skill's template file is not found:
1. Check the skill's directory for the template — it may have been renamed or moved
2. If truly missing, use the skill's SKILL.md as the structural guide and generate the document from its Key Concepts and Phase descriptions
3. Log the missing template in `index.md` so it can be addressed
4. Continue the pipeline — do not block on a missing template

### Document Generation Fails
If a document generation step fails mid-way:
1. Save any partial output to the target file with `status: draft` and a note in `index.md`
2. Report the failure to the user with the specific error or blocker
3. Offer to retry, skip the document, or generate it in a fresh session
4. If skipped, mark it as `status: skipped` in `index.md` with the reason — it can be revisited later

### User Wants to Skip a Document
If the user wants to skip a conditional document:
1. Confirm the skip and explain what downstream documents may be affected
2. Mark it as `status: skipped` in `index.md` with the user's stated reason
3. Continue with the next document in the sequence
4. Note in any downstream document that depends on the skipped one that assumptions were made without it

### User Wants to Revisit an Earlier Document
If the user wants to go back and revise a document already marked `final`:
1. Create a new version (do not overwrite) per the versioning rules
2. Run the consistency check against all downstream documents
3. Flag any downstream documents that may need updates due to the change

## Progress Reporting

After each document completes, report progress to the user:

```
Document 5 of 12 complete: system-architecture-document
Status: draft (awaiting your review)
Next up: database-design-document
```

Include:
- The document number and total count
- The document name and status
- Any `[agent-decided]` items that need human review
- The next document in the sequence
- Estimated time remaining based on remaining documents

## Context Window Thresholds

For large projects (10+ documents), manage context window proactively:

- **After 5-7 documents:** Suggest starting a fresh session. The orchestrator's context accumulates with each interview and generation cycle, and quality degrades when context is too large.
- **Signal to watch for:** If the agent starts re-asking questions already answered, or loses track of entity names established in earlier documents, context is too full — start a fresh session immediately.
- **How to resume:** The `index.md` file is the anchor. A fresh session reads `index.md` first, loads the most recent 2-3 documents for context, and resumes exactly where the previous session left off.
- **Between complex documents:** For documents with 6+ phases (e.g., system-architecture-document, disaster-recovery-plan), consider generating them in a dedicated subagent session to keep the orchestrator's context focused on coordination.

## Next Steps

After the full document set is complete:
- Hand the `.engineering-docs/` folder to a coding agent — it has everything needed to build the project
- Use the master `index.md` as the reading guide for any new team member or agent
- Return to any individual skill directly if a single document needs updating (e.g., `engineering-docs:technical-runbook`)
