---
title: User Personas, Behavior & Success Metrics
skill: user-personas-behavior
status: draft
owner_reviewed: false
last_updated: 2026-07-17
depends_on: []
supersedes: ""
---

# User Personas, Behavior & Success Metrics

**Product / Feature:** [Name]
**Document ID:** UPB-[IDENTIFIER]-[VERSION]
**Status:** `Draft` | `In Review` | `Approved`
**Version:** 1.0.0
**Date:** YYYY-MM-DD
**Author(s):** [Name, Role]
**Reviewers:** [Name, Role]

---

## 1. Overview

[2-3 sentences: what product/feature this covers and what decisions this document is meant to inform.]

---

## 2. Personas

### Persona: [Name/Label - e.g., "Fast Booker"] - `Primary` / `Secondary`

**Job-to-be-done:** When [situation], I want to [motivation], so I can [expected outcome].

**Behavior and context:**
| Attribute | Detail |
| :--- | :--- |
| Frequency of use | [e.g., Several times daily] |
| Context of use | [e.g., Mobile, between meetings] |
| Domain proficiency | [e.g., Novice - first time managing a shared calendar] |
| Friction tolerance for this task | [e.g., Very low - must complete in under 30 seconds] |

**Current alternative (what they do without this product):** [e.g., Back-and-forth email to find a meeting time]

**Pain point this product addresses:** [Specific, concrete gap]

**Accessibility needs (if applicable):**
| Accessibility Dimension | Need | Design Implication |
| :--- | :--- | :--- |
| [e.g., Visual impairment] | [e.g., Uses screen reader] | [e.g., Semantic HTML, ARIA labels, alt text] |
| [e.g., Motor impairment] | [e.g., Keyboard-only navigation] | [e.g., Large touch targets, no hover-only actions] |
| [e.g., Cognitive load] | [e.g., Needs simple language] | [e.g., Clear labels, predictable patterns] |

> Include at least one persona with an accessibility dimension to ensure a11y is designed in, not bolted on.

*(Repeat this block per persona.)*

---

## 3. Negative / Exclusion Personas

> Who is this product NOT designed for? Defining exclusion personas prevents scope creep and helps say "no" to conflicting feature requests.

| Negative Persona | Why Not a Target | What They'd Want (That Conflicts) | Risk If Prioritized |
| :--- | :--- | :--- | :--- |
| [e.g., "Power admin managing 500 users"] | [Product targets small teams] | [Bulk operations, advanced RBAC] | [UI complexity alienates primary users] |

---

## 4. User Journey Map: [Persona Name]

> End-to-end narrative across all touchpoints and sessions. Distinct from screen flows — captures the story, not the pixels.

| Stage | User Action | Emotional State | Touchpoint | Friction / Delight |
| :--- | :--- | :--- | :--- | :--- |
| Discovery | [e.g., Searches for "expense report tool"] | [e.g., Frustrated with current process] | [e.g., Google, peer recommendation] | [Friction: too many irrelevant results] |
| First Use | [e.g., Signs up, tries first report] | [e.g., Cautiously optimistic] | [e.g., Web app] | [Delight: report created in under 60 seconds] |
| Habitual Use | [e.g., Submits weekly reports] | [e.g., Confident, efficient] | [e.g., Mobile app] | [Friction: can't approve from mobile] |
| Advocacy / Churn | [e.g., Recommends to colleague / stops using] | [e.g., Satisfied / frustrated] | [e.g., Slack, email] | [Delight: one-click invite for colleague] |

*(Repeat per primary persona.)*

---

## 5. Persona Priority

> When personas' needs conflict in a design decision, this is the tie-breaker.

| Priority | Persona | Rationale |
| :--- | :--- | :--- |
| 1 (wins ties) | [Persona name] | [Why they win] |
| 2 | [Persona name] | [Why they're secondary] |

---

## 6. Success Metrics

### 6.1 Leading Indicators (early signal)

| Metric | Target | Measures | Measurement Methodology |
| :--- | :--- | :--- | :--- |
| [e.g., % completing signup within 2 min] | [e.g., ≥ 80%] | [Onboarding friction] | [e.g., Analytics event `signup_completed` with `time_to_complete_sec` filter] |

### 6.2 Lagging Indicators (business outcome)

| Metric | Target | Measured At | Measurement Methodology |
| :--- | :--- | :--- | :--- |
| [e.g., 90-day retention] | [e.g., ≥ 40%] | [90 days post-signup] | [e.g., Cohort analysis: users with `last_active_at` within 90 days of `signup_completed`] |

---

## 7. Analytics and Event Tracking Plan

| Event Name | Fires When | Properties Captured | Feeds Metric |
| :--- | :--- | :--- | :--- |
| `signup_started` | [User submits signup form] | [source, referrer] | [Signup completion rate] |
| `signup_completed` | [Account fully verified] | [time_to_complete_sec] | [Onboarding friction, leading indicator] |
| `[event_name]` | [Trigger] | [Properties] | [Metric it feeds] |

### 7.1 Analytics Implementation Notes

| Concern | Decision | Notes |
| :--- | :--- | :--- |
| **Analytics platform** | [e.g., Mixpanel / Amplitude / PostHog / custom] | [Why this choice] |
| **Identity resolution** | [e.g., Anonymous ID → user ID on signup] | [When/how the merge happens] |
| **Event delivery** | [e.g., Client-side SDK / server-side / both] | [Reliability vs latency tradeoff] |
| **Data warehouse** | [e.g., BigQuery / Snowflake / none yet] | [If/when raw event data is needed] |
| **Consent / privacy** | [e.g., Cookie consent banner, GDPR opt-out] | [What data is excluded if user opts out] |

---

## 8. Persona Validation Plan

> Personas are hypotheses. Define how and when each will be confirmed or revised.

| Persona | Validation Method | Timeline | Invalidation Criteria | Revision Trigger |
| :--- | :--- | :--- | :--- | :--- |
| [Persona 1] | [e.g., 10 user interviews + analytics cohort] | [e.g., Pre-launch + 30-day review] | [e.g., <10% complete core action in 5 min] | [e.g., Two consecutive months of declining engagement] |
| [Persona 2] | [e.g., Prototype usability test] | [e.g., Before beta] | [e.g., Users abandon flow at step 3 >50%] | [e.g., Support tickets mentioning this use case double] |

---

## 9. Open Questions

| Question | Status | Owner |
| :--- | :--- | :--- |
| [e.g., Do we need a distinct persona for admin/manager users?] | `Open` / `Resolved` | [Name] |
