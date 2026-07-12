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

*(Repeat this block per persona.)*

---

## 3. Persona Priority

> When personas' needs conflict in a design decision, this is the tie-breaker.

| Priority | Persona | Rationale |
| :--- | :--- | :--- |
| 1 (wins ties) | [Persona name] | [Why they win] |
| 2 | [Persona name] | [Why they're secondary] |

---

## 4. Success Metrics

### 4.1 Leading Indicators (early signal)

| Metric | Target | Measures |
| :--- | :--- | :--- |
| [e.g., % completing signup within 2 min] | [e.g., ≥ 80%] | [Onboarding friction] |

### 4.2 Lagging Indicators (business outcome)

| Metric | Target | Measured At |
| :--- | :--- | :--- |
| [e.g., 90-day retention] | [e.g., ≥ 40%] | [90 days post-signup] |

---

## 5. Analytics and Event Tracking Plan

| Event Name | Fires When | Properties Captured | Feeds Metric |
| :--- | :--- | :--- | :--- |
| `signup_started` | [User submits signup form] | [source, referrer] | [Signup completion rate] |
| `signup_completed` | [Account fully verified] | [time_to_complete_sec] | [Onboarding friction, leading indicator] |
| `[event_name]` | [Trigger] | [Properties] | [Metric it feeds] |

---

## 6. Open Questions

| Question | Status | Owner |
| :--- | :--- | :--- |
| [e.g., Do we need a distinct persona for admin/manager users?] | `Open` / `Resolved` | [Name] |
