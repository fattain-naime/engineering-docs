# UX Flow Specification

**Product / Feature:** [Name]
**Document ID:** UXF-[IDENTIFIER]-[VERSION]
**Status:** `Draft` | `In Review` | `Approved`
**Version:** 1.0.0
**Date:** YYYY-MM-DD
**Author(s):** [Name, Role]
**Reviewers:** [Name, Role]
**Related Documents:** [design-system-specification, user-personas-behavior]

---

## 1. Overview

### 1.1 Purpose

[2-3 sentences: what flow(s) does this document cover, and what primary user task(s) do they serve?]

### 1.2 Primary Task(s)

| Task | User Goal | Entry Point(s) |
| :--- | :--- | :--- |
| [e.g., Complete signup] | [Get to a usable account] | [Landing page CTA, invite link] |

---

## 2. Information Architecture

```
[Site map - indent to show nesting]
Home
├── Dashboard
│   ├── Settings
│   └── Reports
├── Onboarding
│   ├── Sign Up
│   ├── Verify Email
│   └── First-Run Setup
```

---

## 3. User Journey: [Journey Name]

> Narrative, end-to-end. Cross-session steps are fine here - screen-level detail comes in Section 4.

[e.g., "A new user discovers the product via a landing page, signs up with email, verifies via a 6-digit code sent by email, sets a password, and lands on an empty dashboard prompting their first action."]

---

## 4. Screen-by-Screen Flow

### Screen: [Name - e.g., "Sign Up"]

**Entry point(s):** [How a user arrives here]
**Primary action:** [What the user does on this screen]

| State | What the User Sees | Available Actions |
| :--- | :--- | :--- |
| Loading | [e.g., Skeleton form / spinner] | [None / Cancel] |
| Empty | [N/A for this screen, or describe] | |
| Error | [e.g., "Email already in use" inline, field preserved] | [Retry, switch to login] |
| Success / Populated | [e.g., Form with email + password fields] | [Submit, navigate to Login] |

**Exit points:** [Where each action leads - e.g., Submit → Verify Email screen; "Already have an account?" → Login screen]

*(Repeat this screen block for every screen in the flow.)*

---

## 5. Edge Cases and Recovery Paths

| Scenario | Trigger | Behavior | Recovery Path |
| :--- | :--- | :--- | :--- |
| [e.g., Expired verification code] | [Code older than 15 min] | [Inline error, "Resend code" button shown] | [User can request new code without restarting signup] |
| [e.g., User already has account] | [Email exists in system] | [Inline message + link] | [Redirect to login with email pre-filled] |

> No scenario in this table should result in a dead end (a screen with no way forward, back, or recovery).

---

## 6. Accessibility Notes

| Screen | Keyboard/Tab Order | Focus Management | Completable Without Mouse? |
| :--- | :--- | :--- | :--- |
| [Sign Up] | [Email → Password → Submit] | [Focus moves to first error field on validation failure] | `Yes` |

---

## 7. Open Questions

| Question | Status | Owner |
| :--- | :--- | :--- |
| [e.g., Should social login be supported at launch?] | `Open` / `Resolved` | [Name] |
