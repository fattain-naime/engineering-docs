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
estimated_time: "1-2 hours"
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

## Application

### Phase 1: Socratic Clarification & Brainstorming (Mandatory Interview)
Before writing any personas or metrics document, you MUST interrogate the user's initial input, identify gaps, and ask **3-5 targeted clarifying questions** to dig deeper. Do NOT generate the template yet.
Ask questions to resolve:
1. **Distinct user types**: Are there meaningfully different types of users with different goals, or is this one persona with varying context?
2. **The job being hired for**: What is the user trying to accomplish, and what were they doing before this product existed (the alternative they're replacing)?
3. **Business success definition**: What does the business need to see happen for this to be considered a win - retention, revenue, reduced support load, something else?
4. **Existing measurement**: Is there analytics tooling already in place, or does this plan need to specify what to stand up?
*Wait for the user's response to these questions before drafting the final document.*

### Phase 2: Persona Definition (30-45 min)
Define each persona using Jobs-to-Be-Done framing and behavior/context, not demographics. Mark primary vs. secondary.

### Phase 3: Journey and Pain Point Mapping (20 min)
For each primary persona, note where the current process (or lack of product) fails them today - the gap this product closes.

### Phase 4: Success Metrics (20-30 min)
Define leading and lagging indicators per persona and for the business overall, each with a specific numeric target where possible.

### Phase 5: Analytics and Event Tracking Plan (30 min)
For each metric, specify the exact event(s), trigger condition, and properties needed to measure it.
