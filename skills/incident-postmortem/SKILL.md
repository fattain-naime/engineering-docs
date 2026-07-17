---
name: incident-postmortem
argument-hint: "[incident name or ID]"
description: Write a blameless post-incident review (post-mortem / RCA) that documents what happened, the timeline, root cause analysis, impact assessment, and concrete action items to prevent recurrence. Follows Google SRE blameless post-mortem culture.
intent: >-
  Produce a blameless post-mortem that transforms a production incident from a painful failure into a permanent improvement in system reliability. The core principle is blamelessness: incidents are caused by systemic failures, not individual mistakes. Attacking people instead of systems destroys the psychological safety that enables honest post-mortems, which are the only post-mortems worth writing. A good post-mortem has a precise timeline, a multi-layer root cause analysis (not just the proximate cause), a quantified impact, and specific, actionable, owner-assigned items with deadlines - not vague intentions.
type: component
theme: engineering-docs
best_for:
  - "After any production incident affecting users or SLA"
  - "After any near-miss that could have caused user impact"
  - "Building an organizational culture of continuous reliability improvement"
  - "Satisfying compliance or contractual obligations for incident reporting"
scenarios:
  - "Write a post-mortem for last night's payment processing outage"
  - "Document the root cause of the database connection exhaustion incident"
  - "Create a blameless review of the API timeout that affected 15% of users"
estimated_time: "1-2 hours"
license: MIT
compatibility: Designed for Gemini (Antigravity), Claude Code, Cursor/Windsurf, Kimi Code, Codex/Copilot
---

## Purpose

Produce a blameless post-mortem that captures what happened, why it happened at every causal layer, and what specific, measurable actions will prevent recurrence.

**A post-mortem that blames a person is a post-mortem that will not be written honestly next time.** The goal is to find and fix system failures, not to assign individual culpability.

## Input

**Works best with:** A description of the incident.
**Also valuable:** Timeline of events, monitoring data, the alert that fired, what was done to mitigate, any on-call notes from the incident.

**Example invocation:** `Write a post-mortem for the incident on 2026-07-09 where the payment gateway returned 500 errors for 22 minutes affecting 8% of payment attempts. The root cause was a database connection pool exhaustion triggered by a slow query introduced in the v2.3.0 deployment 2 hours earlier.`

## Key Concepts

### Blameless Culture (Google SRE)
People do not cause incidents. **Systems do.** When an engineer makes a mistake that leads to an incident, the real questions are:
- Why did the system allow that mistake to have this impact?
- What alerting, testing, or deployment control would have prevented it?
- What process would have caught this before production?

Blameless does not mean consequence-free. It means the post-mortem focuses on systemic remediation, not individual punishment.

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

### Five Whys (Root Cause Analysis)
Do not stop at the proximate cause. The proximate cause is almost always "a bad change was deployed." The real causes are at least 4 Whys deeper:
- Why did the change cause the failure? (technical root cause)
- Why was the change deployed without detecting this? (testing gap)
- Why did monitoring not alert earlier? (observability gap)
- Why was the impact this broad? (blast radius issue)

### Severity Levels
| Severity | Definition | Example |
| :--- | :--- | :--- |
| SEV-1 | Complete service outage; all users affected | Payment gateway returning 100% 5xx |
| SEV-2 | Partial outage; significant user impact | 20% of payments failing |
| SEV-3 | Degraded performance; subset of users affected | p99 latency > 2s for 15 min |
| SEV-4 | Minor issue; minimal user impact | Admin panel slow for 5 min |

### Incident Severity Auto-Classification

Use this decision tree to classify severity immediately upon detection, before the full impact is known. Re-classify as more information becomes available.

```
START
  |
  v
Is the service completely unreachable for ALL users?
  |-- YES --> SEV-1
  |-- NO --> v
  Is a significant user-facing feature broken (>10% of users affected)?
    |-- YES --> SEV-2
    |-- NO --> v
    Is performance degraded (latency, error rate elevated)?
      |-- YES, sustained > 5 min --> SEV-3
      |-- YES, brief < 5 min --> SEV-4
      |-- NO --> v
      Is there a minor, non-user-facing issue (admin tools, internal dashboards)?
        |-- YES --> SEV-4
        |-- NO --> Not an incident (monitor)
```

**Re-classification triggers:**
- Escalate if: impact broadens, duration exceeds 30 minutes without mitigation, customer complaints increase
- De-escalate if: mitigation reduces impact, blast radius smaller than initially reported

### Incident Commander Role

For SEV-1 and SEV-2 incidents, an Incident Commander (IC) must be designated. The IC owns the incident response, not the technical fix:
- **IC responsibilities:**
  - Declare the incident and set the severity
  - Designate roles (communications lead, technical lead, scribe)
  - Run the incident bridge (Slack channel, call, or war room)
  - Make go/no-go decisions on mitigation actions
  - Ensure external communications are sent on schedule
  - Declare the incident resolved
  - Schedule the postmortem
- **IC does NOT:** perform the technical debugging (that is the technical lead's job). The IC's job is coordination, communication, and decision-making.
- **IC authority:** The IC can override normal process during an incident (e.g., deploy without normal review, page additional engineers, authorize emergency changes). Document these emergency authorities.
- **IC handoff:** If the IC needs to step away (shift change, fatigue), they must hand off to a new IC with a status briefing. Document the handoff in the incident timeline.

### Near-Miss Postmortem

Near-misses are incidents that were caught before they caused user impact, or incidents where the impact was narrowly avoided. They deserve postmortems because:
- A near-miss today is a real incident tomorrow if the underlying system gap is not fixed.
- Near-misses are lower-pressure learning opportunities - the team is not in crisis mode.
- **When to write a near-miss postmortem:**
  - An alert fired but the issue self-resolved before mitigation was needed
  - A bad deployment was caught in staging before reaching production
  - A monitoring gap was discovered during a drill or review (not during a real incident)
  - A failure occurred in a redundant component (the backup worked, but the primary should not have failed)
- **Near-miss postmortem format:** Same as a full postmortem, but the Impact Assessment section documents the *potential* impact if the near-miss had become a real incident. The timeline is typically shorter and the tone is less urgent.
- **Cultural note:** Organizations that only write postmortems for real incidents incentivize under-reporting. Reward near-miss reporting.

### Action Item Tracking

Action items without tracking are promises that will be forgotten:
- **Review cadence:** Action items must be reviewed weekly by the postmortem author until all items are closed. After the postmortem is published, add action items to the team's regular sprint/iteration planning.
- **Escalation if overdue:** If an action item is overdue by more than 1 week with no progress, escalate to the team lead. If overdue by more than 2 weeks, escalate to engineering management. Overdue action items from SEV-1 incidents are engineering leadership's top priority.
- **Tracking system:** Action items must be in a system that supports deadlines, assignees, and status tracking (Jira, Linear, GitHub Issues). A spreadsheet or wiki table is not sufficient for tracking.
- **Closure criteria:** Each action item must have a measurable success criterion. "Improve monitoring" is not closable. "Add DB connection alert at 80% threshold and verify it fires in staging" is closable.
- **Postmortem review meeting:** Hold a postmortem review meeting within 48-72 hours of the incident. The meeting reviews the draft postmortem, validates the timeline and root cause, and ensures action items are agreed upon and assigned.

### Statistical Analysis Across Postmortems

Track patterns across postmortems to identify systemic issues:
- **Metrics to track:**
  - Number of postmortems per month (trending up = systemic issue)
  - Mean time to detect (MTTD) and mean time to recover (MTTR) - trending down is the goal
  - Root cause categories (testing gap, observability gap, deployment control gap, etc.) - which category is most frequent?
  - Repeat root causes (same root cause appearing in multiple postmortems)
  - Action item completion rate (are we actually fixing what we commit to?)
- **Quarterly review:** Present postmortem statistics to engineering leadership quarterly. Highlight trends, not individual incidents.
- **Root cause categorization:** Every postmortem must categorize its root causes. Standard categories:
  - `Testing gap` - insufficient test coverage
  - `Observability gap` - monitoring/alerting did not detect or alert
  - `Deployment control gap` - no gate prevented the bad change
  - `Architecture gap` - single point of failure, insufficient redundancy
  - `Process gap` - procedure existed but was not followed, or procedure was insufficient
  - `Knowledge gap` - operator did not know the correct action
  - `Third-party dependency` - failure in an external service

### Incident Response Tooling

Document the tools used for incident response so any engineer can use them:
- **PagerDuty:** How incidents are created, escalated, and resolved. Link to the service configuration.
- **OpsGenie:** Alert routing, on-call schedules, escalation policies. Link to the team configuration.
- **incident.io / FireHydrant / Rootly:** Incident management platform usage - how to declare, update, and resolve incidents.
- **Slack / Teams:** Incident channel naming convention (e.g., `#inc-YYYYMMDD-short-description`). Bot integrations for status updates.
- **Status page:** How to update the external status page. Who has access. Template messages for different incident stages.
- **Video bridge:** How to set up the incident bridge call. Link to the standing bridge URL.

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
1. **Symptom & Detection**: How was the incident first noticed (e.g. customer support ticket, automated alarm, internal observation)?
2. **Timeline points**: What are the key timestamps (incident start, detection, mitigation, complete resolution)?
3. **Failure impact**: What is the estimated business or database impact (e.g. amount of failed requests, transaction losses)?

*Wait for the user's response to these questions before drafting the final postmortem.*

### Phase 2: Document Generation
1. Write the timeline from the first symptom to full resolution with exact timestamps.
2. Perform Five Whys to identify root causes at every layer.
3. Quantify the impact precisely.
4. Define specific, assignable action items - not vague intentions.
5. Share with the team within 24-48 hours of resolution.

### Phase 3: Revision (After User Review)

If the user requests changes after reviewing the document:

1. **Read the user's feedback carefully** — understand what they want changed
2. **Check for conflicts** — does the requested change conflict with prior documents (e.g., runbook procedures, SLO targets)?
3. **Apply changes** — update the postmortem
4. **Re-run consistency check** — verify the change doesn't break cross-document consistency (e.g., action items still align with system architecture)
5. **Update metadata** — set `last_updated` to today's date
6. **Confirm with user** — show the changes and get approval

## Gotchas

- **Stopping at the proximate cause.** Agents frequently stop the Five Whys at "a bad change was deployed" and never dig into why the change was not caught by testing, monitoring, or code review. The systemic causes are always deeper.
- **Writing blameful language.** Phrases like "engineer X failed to check" or "the developer forgot" shift focus from system failures to individual culpability. Rephrase every finding as a system gap: "no automated check existed to prevent..."
- **Vague action items without owners or deadlines.** "Improve monitoring" is not an action item. Every item needs a named owner, a due date, and a measurable success criterion that proves it is done.
- **Missing the "What Went Well" section.** Agents skip this because it feels optional. It is not. Documenting what worked reinforces good practices and prevents future incidents from discarding effective responses.
- **Omitting the communication log.** External communications during an incident (status page, customer emails, Slack messages) are often forgotten. They matter for compliance and for reviewing the incident response process itself.

## Handoff

**Reads from:**
- `17-technical-runbook.md` — operational procedures that were followed (or not)
- `19-slo-error-budget.md` — SLO targets to measure impact against
- `16-deployment-plan.md` — deployment that may have caused the incident
- Monitoring and alerting data — timeline, metrics, logs

**Feeds into:**
- `17-technical-runbook.md` — updated procedures based on lessons learned
- `15-test-strategy.md` — new test cases to prevent recurrence
- `7-system-architecture.md` — architecture changes to reduce blast radius
- `18-disaster-recovery.md` — DR gaps discovered during the incident

---

## Quality Gate

Before marking this document as `final`, verify:
- [ ] The timeline has precise timestamps for every event from first symptom to all-clear
- [ ] The Five Whys analysis goes at least 4 layers deep past the proximate cause
- [ ] Every action item has a named owner, due date, and measurable success criterion
- [ ] The document contains zero blameful language targeting individuals
- [ ] Impact is quantified with concrete metrics (users affected, transactions failed, revenue impact)
- [ ] Severity is classified using the decision tree and justified
- [ ] Incident Commander is designated (for SEV-1/SEV-2) and their responsibilities are clear
- [ ] Action items are tracked in a system with deadlines and weekly review cadence
- [ ] Root cause categories are assigned for statistical trending
- [ ] Near-miss incidents have a postmortem if they reveal system gaps
- [ ] Incident response tooling is documented (PagerDuty/OpsGenie/incident.io configuration)

## Next Steps

After this document is complete, proceed to:
- **`technical-runbook`** — update alert response procedures based on lessons learned
- **`test-strategy-document`** — add test cases to prevent recurrence of the root cause
- **`disaster-recovery-plan`** — address any DR gaps surfaced by the incident
- Or invoke `using-engineering-docs` to continue the pipeline
