---
name: user-personas-behavior
argument-hint: "[product name]"
description: Define who a product is for, what they're trying to accomplish, how success is measured, and what to instrument to know if it's working. Covers user personas (goal- and behavior-based, not demographic), jobs-to-be-done, success metrics/KPIs, and an analytics/event-tracking plan. Use before or alongside requirements gathering so "who is this for and how do we know it's working" is answered explicitly.
intent: >-
  Produce the document that keeps a project honest about who it's actually being built for and how anyone will know, after launch, whether it worked. Technical documents in this suite specify what the system does; this one specifies who needs it to do that and why, using the Jobs-to-Be-Done framework rather than shallow demographic labels - a persona defined by "wants to reconcile invoices in under 10 minutes" is buildable; a persona defined only by age or job title is not. It also defines the success metrics and the concrete analytics events required to measure them, so "is this working" has a data-backed answer instead of an opinion after launch.
type: workflow
theme: engineering-docs
best_for:
  - "Defining target users and their goals before or alongside writing a technical specification"
  - "Resolving disagreement about who a feature is really for and what problem it solves for them"
  - "Defining the success metrics and KPIs a project will be judged against post-launch"
  - "Specifying exactly what analytics events must be instrumented to measure those metrics"
scenarios:
  - "Define the target user personas and jobs-to-be-done for our new expense-reporting tool"
  - "What should we track to know if our onboarding redesign is actually working?"
  - "Write the user behavior and success metrics document for our marketplace's seller-side experience"
estimated_time: "2-4 hours"
license: MIT
compatibility: Designed for Gemini (Antigravity), Claude Code, Cursor/Windsurf, Kimi Code, Codex/Copilot
---

## Purpose

Produce a document that defines who a product or feature serves, what job they are trying to get done, what "success" concretely means for them and for the business, and what must be instrumented to measure it.

**A persona is a tool for decisions, not a character sketch.** "Priya, 34, marketing manager" tells an implementer nothing actionable. "A user who needs to approve or reject an expense report in under 60 seconds from a phone, several times a day" tells them exactly what to build and how to judge whether they succeeded.

## Input

**Works best with:** The name of the product or feature.
**Also valuable:** Any existing user research or support tickets, known user complaints, business goals this needs to serve, existing analytics setup.

**Example invocation:** `Define user personas and success metrics for our team calendar-scheduling tool. Two clear user types so far: people trying to book a meeting fast, and people managing their own availability so they get booked less often outside working hours.`

## Key Concepts

### Jobs-to-Be-Done (JTBD), Not Demographics
Define personas by the job they're hiring the product to do, not by age, gender, job title, or other demographic labels - those rarely change what gets built and can bake in assumptions that don't hold. Structure: "When [situation], I want to [motivation], so I can [expected outcome]."

### Behavior Over Biography
Describe usage patterns that affect design decisions: frequency of use (daily vs. rare), context of use (mobile/on-the-go vs. desk), technical comfort with the domain (novice vs. power user), and tolerance for friction at this specific task. These directly inform UI and flow decisions; biographical detail generally doesn't.

### Primary vs. Secondary Personas
Not every user matters equally to every decision. Name the primary persona(s) whose needs win in a trade-off, and secondary personas whose needs matter but yield when in conflict. Undeclared priority between personas causes design debates to stall indefinitely.

### Success Metrics: Leading vs. Lagging
- **Leading indicators:** Observable quickly, predict future outcomes (e.g., % of users completing onboarding step 1).
- **Lagging indicators:** The actual business outcome, observable only after time passes (e.g., 90-day retention, revenue).
A good metrics set has both - leading indicators let you course-correct before the lagging ones are even measurable.

### Analytics and Event Tracking Plan
Every success metric needs a named, specific event to measure it - "we'll track engagement" is not instrumentable. Specify: event name, when it fires, what properties it carries, and which metric it feeds. This becomes a direct instrumentation checklist for implementation.

### User Journey Mapping
For each primary persona, map the end-to-end journey across all touchpoints and sessions: discovery, first use, repeated use, and eventual advocacy or churn. Identify:
- **Moments of delight** — where the product exceeds expectations
- **Moments of friction** — where users drop off, hesitate, or get stuck
- **Handoffs** — where the user moves between channels, sessions, or support touchpoints
- **Emotional state** — what the user feels at each stage (frustrated, confused, confident)

Journey maps are distinct from screen flows (covered in `ux-flow-specification`); they capture the narrative arc, not the pixel-level sequence.

### Negative Personas (Who This Is NOT For)
Explicitly define who this product is not designed to serve. Negative personas prevent scope creep and help teams say "no" to feature requests that would dilute the product for its core users. For each negative persona:
- State who they are and why they are not a target
- Identify what they would want that would conflict with primary persona needs
- Note the risk if this persona is accidentally prioritized

### Persona Validation Plan
Personas are hypotheses, not facts. For each persona, define:
- **Validation method:** How will you confirm this persona exists and behaves as hypothesized? (user interviews, analytics cohort analysis, surveys, prototype testing)
- **Validation timeline:** When will validation occur? (pre-launch, first 30 days, quarterly review)
- **Invalidation criteria:** What observed behavior would disprove this persona? (e.g., "if fewer than 10% of users complete the core action within 5 minutes, the friction tolerance assumption is wrong")
- **Revision trigger:** What data triggers a persona update?

### JTBD Extraction Methodology
When deriving personas from research (user interviews, support tickets, analytics), follow this methodology:
1. **Collect raw statements:** Gather verbatim quotes about what users are trying to accomplish
2. **Cluster by outcome:** Group statements that describe the same desired outcome, regardless of who said them
3. **Extract the job:** Write each cluster as a JTBD statement: "When [situation], I want to [motivation], so I can [expected outcome]"
4. **Validate against data:** Cross-reference JTBD statements with analytics (do users actually do what they say they want?)
5. **Prioritize by frequency and impact:** Rank jobs by how many users express them and how much pain they cause

### Event Naming Conventions
All analytics events must follow a strict `snake_case verb_noun` convention:
- Format: `{verb}_{noun}` — e.g., `signup_started`, `report_exported`, `payment_failed`
- Verbs: `created`, `updated`, `deleted`, `viewed`, `started`, `completed`, `failed`, `clicked`, `submitted`
- Nouns: the entity or action affected — `user`, `report`, `payment`, `onboarding_step`
- Properties use the same convention: `time_to_complete_sec`, `error_code`, `source_channel`
- Never use camelCase, PascalCase, or ambiguous names like `trackEvent1`

### Accessibility Personas
Include at least one persona whose primary dimension is an accessibility need. This ensures accessibility is designed in, not bolted on:
- **Visual impairment persona:** Uses screen readers, needs semantic HTML, alt text, ARIA labels
- **Motor impairment persona:** Uses keyboard-only or switch navigation, needs large touch targets
- **Cognitive load persona:** Needs clear language, predictable patterns, minimal cognitive overhead
- **Situational impairment persona:** Using the product in bright sunlight, noisy environment, or one-handed

These personas influence flow design, not just visual design — keyboard tab order, focus management, and error recovery are flow-level decisions.

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
1. **Distinct user types**: Are there meaningfully different types of users with different goals, or is this one persona with varying context?
2. **Business success definition**: What does the business need to see happen for this to be considered a win - retention, revenue, reduced support load, something else?
3. **Existing measurement**: Is there analytics tooling already in place, or does this plan need to specify what to stand up?

*Wait for the user's response to these questions before drafting the final document.*

### Phase 2: Persona Definition (60-90 min)
Define each persona using Jobs-to-Be-Done framing and behavior/context, not demographics. Mark primary vs. secondary.

### Phase 3: Journey and Pain Point Mapping (40-60 min)
For each primary persona, note where the current process (or lack of product) fails them today - the gap this product closes.

### Phase 4: Success Metrics (40-60 min)
Define leading and lagging indicators per persona and for the business overall, each with a specific numeric target where possible.

### Phase 5: Analytics and Event Tracking Plan (60 min)
For each metric, specify the exact event(s), trigger condition, and properties needed to measure it.

### Phase 6: Revision (After User Review)

If the user requests changes after reviewing the document:

1. **Read the user's feedback carefully** — understand what they want changed
2. **Check for conflicts** — does the requested change conflict with prior documents?
3. **Apply changes** — update the document
4. **Re-run consistency check** — verify the change doesn't break cross-document consistency
5. **Update metadata** — set `last_updated` to today's date
6. **Confirm with user** — show the changes and get approval

## Gotchas

- **Defining personas by demographics instead of behavior.** "Sarah, 28, marketing manager" tells an implementer nothing actionable. Define every persona by the job they are hiring the product to do, their usage context, and their friction tolerance - these drive design and engineering decisions; age and title do not.
- **Listing only lagging indicators.** Revenue and retention are important but take weeks or months to measure. Without leading indicators (e.g., % of users completing step 1 of onboarding), you cannot course-correct until it is too late. Every persona needs both leading and lagging success metrics.
- **Writing analytics events that are too vague to instrument.** "Track user engagement" is not an event specification. Every event needs a precise name, the exact trigger condition, the properties captured, and which metric it feeds - this becomes the developer's instrumentation checklist.
- **Not declaring persona priority for tie-breaking.** When two personas have conflicting needs (e.g., speed vs. safety), an undeclared priority means the design debate stalls indefinitely. Always rank personas so that trade-off decisions have a deterministic resolution.
- **Treating personas as permanent.** Personas are hypotheses, not facts. Define how and when each persona will be validated or revised based on post-launch data - a persona that contradicts observed user behavior must be updated, not defended.

## Handoff

**Reads from:**
- `1-business-plan.md` — target users, value proposition, problem statement

**Feeds into:**
- `ux-flow-specification` — persona goals, journey context, friction tolerance
- `technical-specification` — user-driven functional requirements, success metrics as NFRs
- `design-system-specification` — persona context and usage patterns for UI decisions

## Quality Gate

Before marking this document as `final`, verify:
- [ ] Every persona is defined by a job-to-be-done with behavior and context, not just demographic labels
- [ ] Each persona has both leading and lagging success metrics with specific numeric targets
- [ ] The analytics event tracking plan specifies exact event names, trigger conditions, properties, and which metric each event feeds
- [ ] Persona priority ranking is declared with rationale, providing a deterministic tie-breaker for design decisions
- [ ] At least one validation criterion is defined for each persona explaining how post-launch data will confirm or revise the hypothesis

## Next Steps

After this document is complete, proceed to:
- **`ux-flow-specification`** — screen-by-screen flows informed by persona goals and journeys
- **`technical-specification`** — requirements driven by user needs and success metrics
- Or invoke `using-engineering-docs` to continue the pipeline
