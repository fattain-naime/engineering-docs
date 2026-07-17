---
name: business-concept
argument-hint: "[your project idea, in your own words]"
description: Turn a raw business idea into a complete business concept document. Covers problem, target users, value proposition, monetization, scope, timeline, and constraints. Use as the first step before any technical documentation.
intent: >-
  This skill is Phase 0 of the engineering-docs pipeline. Before any technical
  specification, architecture, or design work begins, the business idea itself
  must be fully understood. This skill conducts a structured interview that
  produces a formal business concept document — the foundational artifact that
  every downstream technical document reads from. It focuses on the BUSINESS,
  not the technology: what problem is being solved, for whom, why it matters,
  and what constraints shape the solution space.
type: workflow
theme: engineering-docs
best_for:
  - "Turning a vague idea into a concrete business concept before technical planning begins"
  - "Establishing the foundational document that all technical specs reference"
  - "Ensuring the 'why' is documented before the 'how'"
  - "Aligning stakeholders on what's being built and why before committing to technical decisions"
scenarios:
  - "I want to build an app that helps restaurants manage reservations. Help me figure out the business side first."
  - "Here's my idea: a marketplace for freelance designers. I need to document what this is before we start building."
  - "We're considering building an internal tool for our support team. Let's document the business case first."
estimated_time: "60-90 minutes"
license: MIT
compatibility: Designed for Gemini (Antigravity), Claude Code, Cursor/Windsurf, Kimi Code, Codex/Copilot, OpenCode, Goose, Pi, Kilo Code, Roo Code, Cline
---

# Business Concept

## Purpose

Turn a raw business idea — however vague or detailed — into a complete business concept document. This is the foundational artifact that every downstream technical document reads from. Without it, every architecture decision, every requirement, and every design choice is built on assumptions.

**This skill focuses on the BUSINESS, not the technology.** It answers: what problem is being solved, for whom, why it matters, and what constraints shape the solution space.

## Input

**Works best with:** A description of the project idea, in the user's own words, at any level of polish.
**Also valuable:** Anything the user already knows about the market, competitors, or constraints.

**Do not require a polished brief before starting.** Extracting the details is this skill's first job.

## Key Concepts

### Business Concept vs Project Plan

| Aspect | Business Concept (this skill) | Project Plan (`project-plan`) |
|:---|:---|:---|
| **Focus** | The IDEA — what and why | The DELIVERY — how and when |
| **Questions** | What problem? For whom? Why now? | What scope? What milestones? Who owns what? |
| **Output** | Problem statement, users, value prop, constraints | WBS, RACI, timeline, risk register |
| **Timing** | Phase 0 — before any technical work | Phase 1 — after the concept is clear |

### Standing Constraint Questions

These questions establish project-wide constraints that affect every downstream document. Ask them once, early, and record the answers. Every later skill reads these.

- **Team size and skill level** — affects stack/framework recommendations
- **Hosting/infra preference** — self-hosted, cloud, existing vendor lock-in
- **Budget sensitivity** — managed-service vs self-hosted tradeoffs
- **Timeline urgency** — MVP-speed vs enterprise rigor
- **Regulatory/compliance needs** — data residency, PCI, GDPR, etc.
- **Existing systems** — what this must integrate with or avoid conflicting with

### The Escape Hatch

Every question must accept "I don't know, you decide" as a valid answer. When the user takes that path:
1. Pick the most reasonable option given everything gathered so far
2. Record the choice AND the reasoning in the document, tagged as `[agent-decided]`
3. Continue without blocking

### Question Design Rules

- **Never assume.** If something is decision-relevant and not yet known, ask.
- **Plain language.** Not technical jargon — the business owner may not know what "idempotency" means.
- **Recommended answer with reason.** Every question comes with a suggested answer and a one-line explanation, so the user can accept the default.
- **One question at a time.** Never batch multiple questions in a single message.
- **Multiple choice preferred.** Reduces cognitive load and keeps answers comparable.

### Competitive Landscape Analysis

Every business concept must situate itself against what already exists. For each known competitor or alternative:
- Identify their core value proposition and target user
- Map their feature strengths and weaknesses against this concept's value proposition
- Note pricing model, market position, and estimated scale
- Identify gaps this concept exploits or must overcome

Produce a **competitor feature matrix** comparing at least 3 alternatives across 5-8 dimensions relevant to the target user's job-to-be-done.

### Market Sizing (TAM / SAM / SOM)

Estimate the addressable market at three levels:
- **TAM (Total Addressable Market):** The total revenue opportunity if every potential customer in the world adopted this product.
- **SAM (Serviceable Addressable Market):** The segment of TAM reachable given geographic, regulatory, and channel constraints.
- **SOM (Serviceable Obtainable Market):** The realistic share of SAM achievable in the first 1-3 years given competition, budget, and team capacity.

Use bottom-up estimation (number of target users x willingness to pay) over top-down (percentage of a large market) wherever possible. Tag estimates with `[agent-estimated]` if no user-provided data exists.

### User Acquisition Strategy

For each target persona, define:
- **Primary channel:** How they first discover the product (organic search, referral, paid ads, partnerships, community, outbound sales)
- **Estimated CAC (Customer Acquisition Cost):** Rough cost to acquire one user in that channel, or `[agent-estimated]`
- **Activation trigger:** The specific action that turns a visitor into an active user

This section forces the concept from "if we build it, they will come" to a concrete, testable acquisition hypothesis.

### Key Assumptions and Validation

Every business concept rests on assumptions. Identify the top 5-8 assumptions that, if wrong, would invalidate the concept. For each:
- State the assumption clearly
- Define how to validate it (interviews, landing page test, prototype, data analysis)
- Assign an owner and a deadline
- Mark current status as `Unvalidated` / `Validated` / `Invalidated`

### Branching Logic: Internal Tools vs External Products

The interview questions and document focus shift depending on whether this is an internal tool or an external product:

| Dimension | Internal Tool | External Product |
|:---|:---|:---|
| **Users** | Known employees with existing workflows | Unknown market; requires persona research |
| **Monetization** | Cost savings / productivity gains | Revenue from customers |
| **Acquisition** | Mandate / rollout / training | Marketing, sales, organic |
| **Competition** | Current process / existing tool / spreadsheets | Market competitors |
| **Success metric** | Efficiency gain, error reduction, adoption rate | Revenue, retention, market share |

When the user indicates this is an internal tool, adapt questions to focus on current workflows, pain points, adoption barriers, and measurable efficiency gains rather than market sizing and acquisition channels.

### Conflict Resolution

When your analysis conflicts with the user's stated preference:

1. **Present both positions** — show your analysis and their preference side by side
2. **Explain the trade-off** — what are the consequences of each choice?
3. **Recommend with reasoning** — state your recommendation and why
4. **Respect the user's decision** — they own the final call
5. **Document the decision** — record it as an `[owner-specified]` override with reasoning

### Document Length

Target length: **3-5 pages** (excluding appendices).

Shorter is better than longer. If the document exceeds the target, check for:
- Redundant content that can be cut
- Overly verbose explanations
- Content that belongs in a separate reference document
- Material the agent already knows (don't explain what HTTP is)

If the document is significantly shorter than the target, check for:
- Missing sections
- Insufficient detail in critical areas
- Unaddressed edge cases

---

## Application

### Phase 1: Socratic Clarification & Brainstorming (Mandatory Interview)

**Interview Mechanism:** Use tool calls (e.g., `AskUserQuestion`) to present questions — do NOT ask inline in the conversation. The user selects from options rather than typing responses. One question per tool call, multiple-choice options preferred, with "I don't know, you decide" as an escape hatch.

Before generating any document, conduct a structured interview. Ask **one question at a time**, not a batch. Each question should have a recommended answer the user can accept.

**Standing constraint questions (ask first):**

1. **Team:** How many people will work on this? What's their skill level? (Solo dev / Small team (2-5) / Medium team (6-15) / Large team (15+))
2. **Hosting:** Where will this run? (Cloud (AWS/GCP/Azure) / Self-hosted / Existing infrastructure / No preference)
3. **Budget:** How sensitive is the budget? (Low — prefer managed services / Medium — balance cost and control / High — minimize costs at all costs)
4. **Timeline:** How urgent is this? (ASAP — MVP in weeks / Normal — few months / Careful — enterprise rigor)
5. **Regulatory:** Any compliance requirements? (None / GDPR / PCI / HIPAA / Other)
6. **Existing systems:** Anything this must integrate with? (None / List them)

**Business concept questions (after constraints):**

7. **The core idea:** What are you building? What's the single most important thing it must do well?
8. **The problem:** What problem does this solve? What are people doing today without this?
9. **The users:** Who specifically will use this? (Be concrete — "restaurant owners in urban areas" not "people who eat out")
10. **The value:** Why would someone choose this over alternatives? What's the unique advantage?
11. **The money:** How does this make money? (Subscription / One-time purchase / Freemium / Ads / Internal cost savings / Not sure yet)
12. **The scope:** What's the absolute minimum that's useful (v1)? What can wait for v2?
13. **The timeline:** When does this need to exist? Is there a hard deadline?

**Contradiction Detection (mandatory before closing Phase 1):**

Before moving to document generation, explicitly check for contradictions in the user's answers:
- Does the stated target user match the monetization model? (e.g., "free for students" but "enterprise subscription pricing")
- Does the scope match the timeline? (e.g., "MVP in 2 weeks" but 15 must-have features)
- Does the value proposition match the target user's pain? (e.g., "saves time" but target user has no time pressure)
- Do the standing constraints conflict with the concept? (e.g., "no budget" but "requires ML model training")

If contradictions are found, surface them to the user with a recommended resolution before proceeding.

**Continue the interview until you can confidently answer:**
- What is being built?
- For whom?
- Why does it matter?
- What are the constraints?
- What's in scope and what's not?

### Phase 2: Document Generation

Generate the business concept document using `template.md`. Fill every section with concrete information from the interview. Do not leave placeholders.

**Tag agent-decided items:** Any decision where the user said "I don't know, you decide" must be tagged `[agent-decided]` in the document, with the reasoning recorded alongside it.

**Quality gate:** The document must be clear enough that a stranger could read it and understand:
- What's being built
- For whom
- Why it matters
- What constraints exist
- What's in scope and what's not

If any of these are unclear, go back to Phase 1 and ask follow-up questions.

### Phase 3: Gap Tagging

Review the completed document for:
- `🔶 Assumption` — things you assumed but didn't verify with the user
- `🔵 Open Question` — things that are still unknown or undecided

Tag each one inline. These become the starting point for the next skill in the pipeline.

### Phase 4: User Review

Present the completed document to the user for review. Ask:
- "Does this accurately capture your idea?"
- "Is anything missing or wrong?"
- "Are the constraints correct?"

Incorporate feedback before marking as final.

### Phase 5: Revision (After User Review)

If the user requests changes after reviewing the document:

1. **Read the user's feedback carefully** — understand what they want changed
2. **Check for conflicts** — does the requested change conflict with prior documents?
3. **Apply changes** — update the document
4. **Re-run consistency check** — verify the change doesn't break cross-document consistency
5. **Update metadata** — set `last_updated` to today's date
6. **Confirm with user** — show the changes and get approval

---

## Gotchas

- **Conflating business concept with project plan.** This skill is about the IDEA, not the DELIVERY. If the user starts talking about milestones and RACI, redirect to the business concept.
- **Skipping standing constraint questions.** Every downstream document depends on these. Don't assume you know the answers.
- **Accepting vague answers.** "We want to build something for people" is not a target user. Push for specificity.
- **Generating without interviewing.** The template is a skeleton. The interview produces the content.
- **Writing secrets.** Never write actual API keys, credentials, or connection strings in the document. Reference by name/purpose only.

## Handoff

**Reads from:**
- User input (structured interview) — raw business idea, constraints, preferences

**Feeds into:**
- `project-plan` — scope, constraints, timeline, team size
- `user-personas-behavior` — target users, value proposition, monetization model
- `technical-feasibility-study` — problem definition, constraints, existing systems
- `technical-specification` — problem statement, users, scope, standing constraints

## Quality Gate

Before marking this document as `final`, verify:
- [ ] Problem statement is concrete and specific (not vague)
- [ ] Target users are clearly defined with specific personas
- [ ] Value proposition explains why this beats alternatives
- [ ] Monetization model is decided (or explicitly marked as undecided)
- [ ] Scope is divided into must-have (v1) and nice-to-have (v2+)
- [ ] Standing constraints are established (team, hosting, budget, timeline, regulatory)
- [ ] Success criteria are measurable
- [ ] All `[agent-decided]` items are flagged for human review
- [ ] No secrets, credentials, or API keys are written in the document

## Next Steps

After this document is complete, proceed to:
- **`project-plan`** — delivery plan with scope, milestones, timeline, and ownership
- **`user-personas-behavior`** — user personas, JTBD, and success metrics
- **`technical-feasibility-study`** — go/no-go assessment of technical viability
- Or invoke `using-engineering-docs` to continue the pipeline
