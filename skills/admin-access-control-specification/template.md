# Admin & Access Control Specification

**System:** [Name]
**Document ID:** ACL-[IDENTIFIER]-[VERSION]
**Status:** `Draft` | `In Review` | `Approved`
**Version:** 1.0.0
**Date:** YYYY-MM-DD
**Author(s):** [Name, Role]
**Reviewers:** [Name, Role - Security]

---

## 1. Overview

[2-3 sentences: what system this governs, and how many distinct privilege levels it has.]

---

## 2. Role Inventory

| Role | Description | Who Holds It |
| :--- | :--- | :--- |
| [e.g., Owner] | [Full control over a workspace/org] | [First user to create a workspace] |
| [e.g., Admin] | [Manages users and settings, not billing] | [Invited by Owner] |
| [e.g., Member] | [Standard user, own data only] | [Invited by Admin/Owner] |
| [e.g., Support (internal)] | [Read access to customer data for ticket resolution] | [Internal support team] |
| [e.g., Guest] | [View-only, scoped access] | [Invited to specific resource] |

---

## 3. Permission Matrix

> Every cell must be explicitly `Allow` or `Deny`. No blanks.

| Action / Resource | Owner | Admin | Member | Support | Guest |
| :--- | :--- | :--- | :--- | :--- | :--- |
| View own data | Allow | Allow | Allow | Allow (scoped) | Allow (scoped) |
| Edit workspace settings | Allow | Allow | Deny | Deny | Deny |
| Invite/remove users | Allow | Allow | Deny | Deny | Deny |
| View billing | Allow | Deny | Deny | Deny | Deny |
| Export all workspace data | Allow | Deny | Deny | Deny | Deny |
| Impersonate a user (support tooling) | Deny | Deny | Deny | Allow (logged, time-boxed) | Deny |
| Delete workspace | Allow | Deny | Deny | Deny | Deny |

---

## 4. Sensitive Actions and Separation of Duties

| Action | Risk if Misused | Requires Dual Approval? | Approval Flow |
| :--- | :--- | :--- | :--- |
| [e.g., Refund > $X] | [Financial loss] | `Yes` | [Requester ≠ Approver; both logged] |
| [e.g., Delete organization] | [Irrecoverable data loss] | `Yes` | [Owner requests, second Owner or platform admin confirms] |
| [e.g., User impersonation] | [Privacy violation] | `No, but time-boxed + logged` | [Auto-expires after N minutes; user notified] |

---

## 5. Audit Logging Specification

| Field | Captured? | Notes |
| :--- | :--- | :--- |
| Actor (who) | Yes | [User ID, role at time of action] |
| Action | Yes | [Specific action taken] |
| Target (affected resource/user) | Yes | |
| Timestamp | Yes | |
| Before/after state (for changes) | Yes | [Where feasible] |

- **Retention period:** [e.g., 1 year, or per compliance requirement]
- **Who can read the log:** [e.g., Security team, workspace Owner for their own workspace]
- **Who explicitly cannot alter/delete log entries:** [e.g., No role, including the actor, can modify or delete audit entries]

---

## 6. Break-Glass / Emergency Access Procedure

**Trigger conditions:** [e.g., Production incident requiring elevated database access outside normal deploy process]
**Who can invoke it:** [e.g., On-call engineer, with notification to security lead]
**What happens automatically:** [e.g., Access granted for N hours max, Slack alert fires to #security, access auto-revokes]
**Mandatory post-use review:** [e.g., Reviewed within 24 hours by someone who did not use the access]

---

## 7. Access Review Cadence

- **Review frequency:** [e.g., Quarterly review of all Admin/Owner role assignments]
- **Owner of this document:** [Name, Role]
- **Trigger for off-cycle review:** [e.g., Any break-glass use, any compliance audit, role structure change]
