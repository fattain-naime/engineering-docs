---
title: Project Documentation Index
skill: using-engineering-docs
status: draft
owner_reviewed: false
last_updated: YYYY-MM-DD
depends_on: []
supersedes: ""
---

# Project Documentation Index

**Project:** [Project Name]
**Mode:** Greenfield (Mode A) | Brownfield (Mode B)
**Status:** `In Progress` | `Complete`
**Date Created:** YYYY-MM-DD
**Last Updated:** YYYY-MM-DD
**Author(s):** [Name, Role]

---

## 1. Project Summary

[1 paragraph: what this project is, who it's for, and what it does — written so someone with zero prior context understands the project before reading anything else.]

---

## 2. If You Only Read Three Documents

> For an AI agent or developer working on a narrow task who doesn't need the full set in context at once:

1. **[Business Plan]** — what we're building and why
2. **[System Architecture Document]** — how it's structured
3. **[Technical Blueprint for <most relevant feature>]** — detailed design for the specific feature at hand

---

## 3. Recommended Reading Order

> Read in this order to build full context fast. Later documents assume the earlier ones.

| # | Document | Filename | Purpose |
|:--|:---|:---|:---|
| 1 | This index | `index.md` | Navigation and status |
| 2 | Business Plan | `1-business-plan.md` | Problem, users, value proposition, constraints |
| 3 | Project Plan | `2-project-plan.md` | Scope, milestones, RACI, timeline |
| 4 | User Personas | `3-user-personas.md` | Who it's for, JTBD, success metrics |
| 5 | Technical Feasibility Study | `4-feasibility-study.md` | Go/no-go on risky tech (if applicable) |
| 6 | Technical Specification | `5-technical-specification.md` | What it must do |
| 7 | UX Flow Specification | `6-ux-flow-specification.md` | How users move through it (if applicable) |
| 8 | System Architecture | `7-system-architecture.md` | How it's structured |
| 9 | Database Design | `8-database-design.md` | Data model and schema (if applicable) |
| 10 | API Design | `9-api-design.md` | API contract and endpoints (if applicable) |
| 11 | Admin & Access Control | `10-admin-access-control.md` | Who can do what (if applicable) |
| 12 | Security Threat Model | `11-security-threat-model.md` | What could go wrong (if applicable) |
| 13 | Design System | `12-design-system.md` | Visual language and components (if applicable) |
| 14 | Technical Blueprint(s) | `13-blueprint-*.md` | Detailed design per feature |
| 15 | Implementation Plan | `14-implementation-plan.md` | Build order and dependencies |
| 16 | Test Strategy | `15-test-strategy.md` | How we verify it works |
| 17 | Deployment Plan | `16-deployment-plan.md` | How we ship it |
| 18 | Technical Runbook | `17-technical-runbook.md` | How we operate it (if applicable) |
| 19 | Disaster Recovery Plan | `18-disaster-recovery.md` | What happens when things break (if applicable) |
| 20 | SLO & Error Budget | `19-slo-error-budget.md` | Reliability targets (if applicable) |

*(Adjust to the documents actually produced for this project — see Section 4.)*

---

## 4. Document Status

| Document | Filename | Skill Used | Status | Owner Reviewed | Last Updated | Notes |
|:---|:---|:---|:---|:---|:---|:---|
| Business Plan | `1-business-plan.md` | `business-concept` | `Draft` / `Final` | `true` / `false` | YYYY-MM-DD | |
| Project Plan | `2-project-plan.md` | `project-plan` | | | | |
| User Personas | `3-user-personas.md` | `user-personas-behavior` | | | | |
| Technical Feasibility | `4-feasibility-study.md` | `technical-feasibility-study` | | | | [Include only if produced] |
| Technical Specification | `5-technical-specification.md` | `technical-specification` | | | | |
| UX Flow Specification | `6-ux-flow-specification.md` | `ux-flow-specification` | | | | [Include only if produced] |
| System Architecture | `7-system-architecture.md` | `system-architecture-document` | | | | |
| Database Design | `8-database-design.md` | `database-design-document` | | | | [Include only if produced] |
| API Design | `9-api-design.md` | `api-design-document` | | | | [Include only if produced] |
| Admin & Access Control | `10-admin-access-control.md` | `admin-access-control-specification` | | | | [Include only if produced] |
| Security Threat Model | `11-security-threat-model.md` | `security-threat-model` | | | | [Include only if produced] |
| Design System | `12-design-system.md` | `design-system-specification` | | | | [Include only if produced] |
| Technical Blueprint(s) | `13-blueprint-*.md` | `technical-blueprint` | | | | [List each feature covered] |
| Implementation Plan | `14-implementation-plan.md` | `implementation-plan` | | | | |
| Test Strategy | `15-test-strategy.md` | `test-strategy-document` | | | | |
| Deployment Plan | `16-deployment-plan.md` | `deployment-plan` | | | | |
| Technical Runbook | `17-technical-runbook.md` | `technical-runbook` | | | | [Include only if produced] |
| Disaster Recovery | `18-disaster-recovery.md` | `disaster-recovery-plan` | | | | [Include only if produced] |
| SLO & Error Budget | `19-slo-error-budget.md` | `slo-error-budget-document` | | | | [Include only if produced] |
| ADR Log | `adr/` | `architecture-decision-record` | | | | [List each ADR produced] |

---

## 5. Skills Deliberately Skipped

| Skill | Reason Skipped |
|:---|:---|
| [e.g., design-system-specification] | [e.g., Project is API-only with no user-facing UI] |
| [e.g., disaster-recovery-plan] | [e.g., Internal prototype with no production deployment] |

---

## 6. Standing Constraints (Established in Phase 0)

| Constraint | Value | Source |
|:---|:---|:---|
| Team size | [e.g., 2 developers] | Owner-specified / Agent-decided |
| Hosting | [e.g., AWS] | |
| Budget sensitivity | [e.g., Low — prefer managed services] | |
| Timeline | [e.g., MVP in 6 weeks] | |
| Regulatory | [e.g., GDPR, no PCI] | |
| Existing systems | [e.g., Must integrate with existing PostgreSQL DB] | |

---

## 7. Open Questions (Rolled Up Across All Documents)

| Question | From Document | Status | Owner |
|:---|:---|:---|:---|
| [Question] | [Document name] | `Open` / `Resolved` | [Name] |

---

## 8. Agent-Decided Items (Need Owner Review)

> Items where the user answered "I don't know, you decide" during the interview. A human reviewer should check these before build starts.

| Item | Document | Decision Made | Reasoning |
|:---|:---|:---|:---|
| [e.g., Database choice] | [e.g., system-architecture] | [e.g., PostgreSQL] | [e.g., Team has experience, fits data model] |

---

## 9. Change Log

| Date | Document Affected | Change | Author |
|:---|:---|:---|:---|
| YYYY-MM-DD | [Document] | [What changed and why] | [Name] |

---

## 10. For AI Agents: How to Consume This Document Set

> If you're an AI coding agent picking up this project cold:

1. **Read this index first** — it tells you what exists and what order to read in.
2. **Read the "If You Only Read Three Documents" section** — if you're working on a narrow task, start there.
3. **Check `owner_reviewed: false`** — these documents contain agent-decided items that may need human verification.
4. **Check the Standing Constraints** — these are project-wide rules that affect every implementation decision.
5. **Read ADRs for "why"** — if you're confused about why something was designed a certain way, the ADR log explains the reasoning.
6. **Progressive loading** — don't load all documents at once. Start with the three recommended, then load others as needed for your specific task.
