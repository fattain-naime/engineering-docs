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
estimated_time: "2-4 hours"
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

### SLI Implementation Details

An SLI definition is incomplete without the exact query or metric that implements it. Document the implementation for each SLI:
- **Prometheus / PromQL examples:**
  - Availability: `sum(rate(http_requests_total{service="checkout",code!~"5.."}[30d])) / sum(rate(http_requests_total{service="checkout"}[30d]))`
  - Latency: `sum(rate(http_request_duration_seconds_bucket{service="checkout",le="0.3"}[30d])) / sum(rate(http_request_duration_seconds_count{service="checkout"}[30d]))`
- **Datadog examples:**
  - Availability: `sum:http.requests{service:checkout,!code:5xx}.as_count() / sum:http.requests{service:checkout}.as_count()`
  - Latency: `sum:http.request_duration.sum{service:checkout} / sum:http.request_duration.count` (with threshold filter)
- **Implementation vs. definition gap:** If the metric proxy is imperfect (e.g., only measuring at the load balancer, not end-to-end), document the gap and its impact on accuracy.
- **Data source and retention:** Where does the metric data come from, and how long is it retained? If the retention window is shorter than the SLO measurement window, the SLO cannot be computed.

### Error Budget Visualization

An error budget dashboard makes the SLO actionable at a glance:
- **Dashboard components:**
  - Current SLI value over the measurement window (time series)
  - SLO target line (horizontal reference line)
  - Error budget remaining (gauge or percentage)
  - Budget burn rate (current vs. threshold)
  - Historical budget exhaustion events
- **Design principles:** The dashboard must answer "how much budget do we have left?" in under 5 seconds. If an engineer has to do mental math, the dashboard has failed.
- **Recommended tools:** Grafana (for Prometheus), Datadog SLO widgets, or dedicated SLO platforms (Nobl9, Lightstep).

### SLO-Based Alerting Implementation

Burn-rate alerts must be implemented in the monitoring system, not just documented:
- **Prometheus alerting rules (examples):**
  ```yaml
  # Fast burn: 14.4x burn rate over 1h, validated against 5m
  - alert: SLO_FastBurn_Availability
    expr: (
      1 - (sum(rate(http_requests_total{service="checkout",code!~"5.."}[1h])) / sum(rate(http_requests_total{service="checkout"}[1h])))
    ) > (1 - 0.999) * 14.4
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "Fast burn on checkout availability SLO"
  ```
- **Datadog monitor examples:** Define the burn-rate threshold as a Datadog monitor with the appropriate query, evaluation window, and alert conditions.
- **Alert routing:** Burn-rate alerts must page the on-call engineer, not just create a ticket. A fast burn can exhaust the monthly budget in hours.

### SLO Review Meeting Structure

SLOs must be reviewed on a fixed cadence, not just when they breach:
- **Frequency:** Quarterly is typical. After any SLO breach or major architecture change.
- **Attendees:** Engineering lead, product owner, SRE (if separate), and the business stakeholder who owns the shipping roadmap.
- **Agenda:**
  1. Review SLI performance over the last quarter (actual vs. target)
  2. Review error budget consumption (how much was used, what consumed it)
  3. Review any SLO breaches and their root causes
  4. Evaluate whether SLO targets are still appropriate (too loose? too tight?)
  5. Review action items from previous meetings
  6. Decide on any SLO target adjustments or new SLIs
- **Decision authority:** Who can approve SLO target changes? Document the approval chain.

### SLO vs SLA Breach Response Procedure

An SLO breach and an SLA breach are different events with different response procedures:
- **SLO breach (internal):** The internal reliability target was missed. Response: investigate root cause, consume error budget, file action items. No external consequence unless the SLA is also breached.
- **SLA breach (external contract):** The customer-facing commitment was missed. Response: everything from SLO breach + customer communication, service credit issuance, potential legal/compliance review.
- **Escalation path:** If an SLO breach is trending toward an SLA breach (budget exhaustion imminent), escalate to [Role] before the SLA breach occurs. The goal is to prevent the SLA breach, not respond to it after the fact.
- **Breach documentation:** Every SLA breach must be documented with: root cause, duration, customer impact, credits issued, and remediation actions.

### Multiple Service Dependency Modeling

Services do not operate in isolation. An SLO that ignores dependencies is misleading:
- **Dependency-aware SLO:** If Service A depends on Service B, and Service B has a 99.9% SLO, then Service A's effective SLO ceiling is 99.9% (assuming no other failure modes). Document the dependency chain and calculate the composite SLO.
- **Shared fate:** When multiple services share an SLO (e.g., all services depend on a shared database), a single database failure affects all SLOs simultaneously. Document shared dependencies and their blast radius.
- **Dependency SLO requirements:** If Service A requires a 99.95% SLO, it must not depend on any service with a worse SLO unless graceful degradation is implemented. Document the minimum SLO requirement for each dependency.

### Buffer Sizing Between Internal SLO and External SLA

The gap between internal SLO and external SLA is the safety margin. Size it deliberately:
- **Minimum buffer:** The SLA should be loose enough that a single SLO breach does not cause an SLA breach. A common rule: SLA = SLO - (2x typical monthly error budget consumption).
- **Buffer factors to consider:**
  - Measurement error (SLI proxy may not perfectly capture user experience)
  - Incident frequency (more frequent incidents = larger buffer needed)
  - Recovery time (longer MTTR = larger buffer needed)
  - Business risk tolerance (higher stakes = larger buffer needed)
- **Example:** If the internal SLO is 99.9% and the team typically consumes 30% of the error budget monthly, set the SLA at 99.5% (not 99.9%). This gives 0.4% of buffer - enough to survive one significant incident per month without breaching the contract.
- **Review the buffer quarterly:** If the team consistently uses less than 10% of the error budget, the SLO may be too loose. If the team consistently exceeds 80%, the SLA buffer is too thin.

### Conflict Resolution

When your analysis conflicts with the user's stated preference:

1. **Present both positions** — show your analysis and their preference side by side
2. **Explain the trade-off** — what are the consequences of each choice?
3. **Recommend with reasoning** — state your recommendation and why
4. **Respect the user's decision** — they own the final call
5. **Document the decision** — record it as an `[owner-specified]` override with reasoning

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
1. **Reliability baseline**: What has actual historical performance/availability looked like, if known (even roughly)?
2. **External commitments**: Is there already an external SLA promised to customers or partners? What does it say?

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

### Phase 7: Revision (After User Review)

If the user requests changes after reviewing the document:

1. **Read the user's feedback carefully** — understand what they want changed
2. **Check for conflicts** — does the requested change conflict with prior documents (e.g., technical specification, runbook alert definitions)?
3. **Apply changes** — update the SLO document
4. **Re-run consistency check** — verify the change doesn't break cross-document consistency (e.g., SLO targets still align with DR plan's RTO/RPO)
5. **Update metadata** — set `last_updated` to today's date
6. **Confirm with user** — show the changes and get approval

## Gotchas

- **Setting SLOs at 100% or picking round numbers without justification.** 100% reliability eliminates all error budget, making every deploy a potential breach. SLOs must be chosen based on baseline data and business cost, not aesthetics. "99.9%" is only correct if the evidence supports it.
- **Defining SLIs that do not reflect user experience.** "Server CPU is below 80%" is not an SLI -- it is an infrastructure metric. SLIs must measure what the user actually experiences: request success rate, latency below a threshold, data durability. Vanity metrics mislead reliability decisions.
- **Setting the external SLA equal to the internal SLO.** The gap between internal SLO and external SLA is the safety buffer that prevents a missed internal target from becoming a contractual breach with financial penalties. Always leave margin.
- **Creating an error budget policy but never enforcing it.** The policy is useless if leadership overrides it every time the budget is exhausted. The policy must be agreed in advance by both engineering and the business stakeholder who owns the shipping roadmap, and enforced automatically.
- **Using only single-window alerting.** A single "error rate > X%" alert either fires too late for fast, severe burns or too often for slow, minor ones. Multi-window multi-burn-rate alerting (per Google SRE Workbook) is required to catch both scenarios at the right urgency.

## Handoff

**Reads from:**
- `1-business-plan.md` — business cost of downtime, user expectations
- `5-technical-specification.md` — performance and reliability requirements
- `7-system-architecture.md` — system components, dependencies, monitoring stack

**Feeds into:**
- `17-technical-runbook.md` — alert thresholds and response procedures
- `16-deployment-plan.md` — deployment risk tolerance based on error budget
- `18-disaster-recovery.md` — RTO/RPO targets derived from SLOs
- Incident postmortems — severity classification and impact measurement

---

## Quality Gate

Before marking this document as `final`, verify:
- [ ] Every SLI measures user-facing behavior, not infrastructure metrics
- [ ] Every SLO target is justified by baseline data and business cost, not round numbers
- [ ] The external SLA (if any) is looser than the internal SLO with an explicit buffer documented
- [ ] Multi-window multi-burn-rate alert thresholds are defined for each SLO
- [ ] The error budget policy is agreed upon by both engineering and the business stakeholder who owns the roadmap
- [ ] Each SLI has an implementation query (Prometheus/Datadog) that is exact and executable
- [ ] Error budget dashboard design is specified with components that answer "how much budget remains?" in under 5 seconds
- [ ] Alerting rules are implemented in the monitoring system, not just documented as thresholds
- [ ] SLO review meeting structure is defined with frequency, attendees, and agenda
- [ ] SLO vs SLA breach response procedure is documented with escalation path
- [ ] Service dependencies are modeled and composite SLO is calculated
- [ ] SLA buffer is sized deliberately based on measurement error, incident frequency, and business risk

## Next Steps

After this document is complete, proceed to:
- **`technical-runbook`** — document alert response procedures that reference the SLO thresholds defined here
- **`disaster-recovery-plan`** — align RTO/RPO targets with the SLO commitments
- Or invoke `using-engineering-docs` to continue the pipeline
