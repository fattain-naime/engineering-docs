---
name: slo-error-budget-document
argument-hint: "[service or API name]"
description: Define Service Level Indicators (SLIs), Service Level Objectives (SLOs), and error budgets for a service, including multi-window multi-burn-rate alerting and an error budget policy. Use when establishing reliability targets, negotiating an external SLA, or deciding how much risk a team can spend on shipping velocity versus reliability work.
intent: >-
  Produce a rigorous SLO document that turns "the service should be reliable" into a specific, measurable, and enforceable contract. Every other reliability artifact in this suite - the runbook, the deployment plan, the postmortem - references an SLA/SLO without ever defining one; this skill is where that number comes from and is justified. An SLO without an error budget policy is just a wish. This skill applies Google SRE Workbook principles: SLIs are measured from the user's perspective, SLOs are chosen deliberately below 100%, and the error budget - the amount of unreliability a service is allowed to spend - governs whether the team ships features or does reliability work.
type: workflow
theme: engineering-docs
best_for:
  - "Defining reliability targets for a new or existing service before launch"
  - "Formalizing an external SLA with customers or partners, backed by an internal SLO with margin"
  - "Resolving a recurring conflict between shipping velocity and reliability work with data instead of opinion"
  - "Setting the alerting thresholds that a runbook's alert-response procedures are triggered by"
scenarios:
  - "Define SLOs for our checkout API before we commit to an uptime SLA with customers"
  - "Set up error budget policy for the checkout service so we stop debating whether to freeze feature work after each blip"
  - "Write the SLI/SLO document for our webhook delivery pipeline and the burn-rate alerts that should page on-call"
estimated_time: "1-2 hours"
license: MIT
compatibility: Designed for Gemini (Antigravity), Claude Code, Cursor/Windsurf, Kimi Code, Codex/Copilot
---

## Purpose

Produce an SLO document that defines exactly how a service's reliability is measured (SLIs), what target is acceptable (SLOs), how much unreliability the team is allowed to spend before it must stop shipping and fix things (error budget), and what alerts fire as that budget burns.

**"The service should be reliable" is not a target - it is an opinion.** This skill turns it into a number everyone can point to, measure against, and hold each other to.

## Input

**Works best with:** The name of the service or API being measured.
**Also valuable:** Existing incident history, any external SLA already promised to customers, current monitoring/metrics stack, the business cost of downtime.

**Example invocation:** `Define SLOs for our checkout API. We currently have no formal target - customers complain when checkout is slow but we've never quantified it. We use Prometheus/Grafana for metrics. We are not yet contractually bound to any external SLA.`

## Key Concepts

### SLI, SLO, SLA - Not the Same Thing
- **SLI (Indicator):** A direct measurement of user-facing behavior. E.g., "proportion of successful checkout requests" or "proportion of API requests completing under 300ms."
- **SLO (Objective):** The internal target for an SLI over a window. E.g., "99.9% of checkout requests succeed, measured over a rolling 30 days."
- **SLA (Agreement):** An external, often contractual, promise - usually looser than the internal SLO, with financial penalties or credits attached to missing it. Never set the SLA equal to the SLO; the gap is the buffer that lets you miss the SLO occasionally without breaching a customer contract.

### Why Not 100%
100% reliability is the wrong target for almost every system: it is disproportionately expensive to approach, and it eliminates all room for planned risk - deploys, migrations, experiments. The error budget (`1 - SLO`) is the amount of unreliability the business has explicitly decided is an acceptable cost of moving fast.

### Multi-Window, Multi-Burn-Rate Alerting (Google SRE Workbook)
A single "error rate > X%" alert either fires too late for fast, severe burns or too often for slow, minor ones. Use multiple burn-rate windows:

| Burn Rate | Long Window | Short Window | Budget Consumed | Meaning |
| :--- | :--- | :--- | :--- | :--- |
| 14.4x | 1 hour | 5 min | 2% of 30-day budget in 1hr | Page immediately - critical |
| 6x | 6 hours | 30 min | 5% of 30-day budget in 6hr | Page - urgent |
| 1x | 3 days | 6 hours | 10% of 30-day budget in 3d | Ticket - investigate this week |

### Error Budget Policy
The document is incomplete without a pre-agreed policy for what happens when the budget is spent - decided calmly in advance, not argued about during an incident:
- **Budget healthy:** Ship normally.
- **Budget low (e.g., <20% remaining):** Increase caution - require extra review on risky deploys.
- **Budget exhausted:** Feature work freezes; the team's top priority becomes reliability work until the budget recovers, or leadership explicitly accepts the risk of continuing to ship.

## Application

### Phase 1: Socratic Clarification & Brainstorming (Mandatory Interview)
Before writing any SLO document, you MUST interrogate the user's initial input, identify gaps, and ask **3-5 targeted clarifying questions** to dig deeper. Do NOT generate the template yet.
Ask questions to resolve:
1. **Critical user journeys**: What does "the service is up" actually mean from the user's point of view - which specific requests or flows matter most?
2. **Reliability baseline**: What has actual historical performance/availability looked like, if known (even roughly)?
3. **External commitments**: Is there already an external SLA promised to customers or partners? What does it say?
4. **Risk appetite**: Does the team currently favor shipping speed or stability, and is there a recent incident that changed that calculus?
*Wait for the user's response to these questions before drafting the final SLO document.*

### Phase 2: SLI Selection (20 min)
Choose 2-4 SLIs per critical user journey - typically availability, latency, and correctness/durability. Reject vanity metrics that don't reflect user experience.

### Phase 3: SLO Target Setting (20 min)
Set the target window (e.g., rolling 30 days) and the numeric target per SLI, justified by baseline data and business cost of missing it - not round numbers picked for looks.

### Phase 4: Error Budget and Burn-Rate Alerts (30 min)
Calculate the error budget per window and define the multi-window burn-rate alert thresholds that page on-call at the right urgency.

### Phase 5: Error Budget Policy (20 min)
Define, in advance, what the team does at each budget-remaining threshold. Get sign-off from both engineering and the stakeholder who owns the shipping roadmap.

### Phase 6: External SLA (if applicable) and Review Cadence (15 min)
If an external SLA exists or is being negotiated, set it looser than the internal SLO with an explicit buffer. Define how often the SLO itself is reviewed and re-baselined (quarterly is typical).
