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
estimated_time: "30-60 minutes"
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

## Application

1. Write the timeline from the first symptom to full resolution with exact timestamps.
2. Perform Five Whys to identify root causes at every layer.
3. Quantify the impact precisely.
4. Define specific, assignable action items - not vague intentions.
5. Share with the team within 24-48 hours of resolution.
