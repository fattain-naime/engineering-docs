---
title: Project Plan
skill: project-plan
status: draft
owner_reviewed: false
last_updated: 2026-07-17
depends_on: []
supersedes: ""
---

# Project Plan

**Project:** [Project / Product Name]
**Document ID:** PP-[IDENTIFIER]-[VERSION]
**Status:** `Draft` | `In Review` | `Approved` | `Active` | `Complete`
**Version:** 1.0.0
**Date:** YYYY-MM-DD
**Author(s):** [Name, Role]
**Reviewers:** [Name, Role]
**Sponsor / Approver:** [Name, Role]

---

## 1. Overview

### 1.1 Goal

[2-3 sentences: what is this project, why does it matter, and what does success look like?]

### 1.2 Scope

**In scope:**
- [Deliverable / capability 1]
- [Deliverable / capability 2]

**Out of scope (explicitly deferred):**
- [Item deferred to a later phase, with brief reason]

### 1.3 Key Dates

| Milestone | Target Date | Type |
| :--- | :--- | :--- |
| [e.g., Beta launch] | YYYY-MM-DD | `Hard deadline` / `Target` |

---

## 2. Work Breakdown Structure

**Estimation methodology:** [Three-point estimation / T-shirt sizing / Story points / Ideal hours]

**Estimation key:**
- Three-point: E = (O + 4M + P) / 6 where O = Optimistic, M = Most Likely, P = Pessimistic
- T-shirt: XS = 1 day, S = 1-3 days, M = 3-5 days, L = 1-2 weeks, XL = 2+ weeks (decompose further)
- All deliverables must be in the 1 day - 2 week range. Items outside this range need decomposition or grouping.

```
[Project Name]
├── Phase 1: [Name]
│   ├── Workstream: [Name]
│   │   ├── Deliverable: [Name] - [Owner] - [Estimate]
│   │   └── Deliverable: [Name] - [Owner] - [Estimate]
├── Phase 2: [Name]
│   └── ...
```

### 2.1 Estimation Detail

| Deliverable | Optimistic (O) | Most Likely (M) | Pessimistic (P) | Expected (E) | Std Dev (SD) | Ready? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| [Deliverable 1] | [days] | [days] | [days] | [calculated] | [calculated] | `Yes` / `No` |

**Definition of Ready checklist per deliverable:**
- [ ] Acceptance criteria defined
- [ ] Dependencies resolved or scheduled
- [ ] Resources assigned (Responsible person identified and available)
- [ ] Estimate agreed upon by the team
- [ ] Outstanding questions answered

---

## 3. Milestones

| Milestone | Definition of Done | Acceptance Criteria | Sign-off Owner | Target Date | Owner | Quality Gate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| [M1: Name] | [Specific, observable, binary condition] | [Testable conditions for stakeholder acceptance] | [Name who declares it complete] | YYYY-MM-DD | [Name] | [e.g., 90% test pass, code coverage > 80%, perf benchmarks met] |

---

## 4. RACI Matrix

| Deliverable | Responsible | Accountable | Consulted | Informed | Staffing Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [Deliverable 1] | [Name] | [Name - one owner] | [Name(s)] | [Name(s)] | `Staffed` / `Hiring by YYYY-MM-DD` / `TBD` |

**Unstaffed roles:**

| Role | Hiring Owner | Target Fill Date | Blocked Deliverables | Risk if Delayed |
| :--- | :--- | :--- | :--- | :--- |
| [e.g., Senior Backend Engineer] | [Name] | YYYY-MM-DD | [Deliverable list] | [Impact description] |

---

## 5. Dependencies and Critical Path

| Deliverable | Depends On | Blocks | Duration | Earliest Start (ES) | Earliest Finish (EF) | Latest Start (LS) | Latest Finish (LF) | Float | On Critical Path? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| [Deliverable A] | [None] | [Deliverable B] | [days] | [calculated] | [calculated] | [calculated] | [calculated] | [calculated] | `Yes` |
| [Deliverable B] | [Deliverable A] | [Milestone 1] | [days] | [calculated] | [calculated] | [calculated] | [calculated] | [calculated] | `Yes` |

**Forward pass:**
1. Deliverable A: ES=0, EF=[duration]. Deliverable B: ES=max(predecessor EFs), EF=ES+[duration]. Continue to final deliverable.
2. Project earliest completion = EF of final deliverable.

**Backward pass:**
1. Final deliverable: LF=project earliest completion, LS=LF-duration.
2. For each predecessor: LF=min(successor LS values), LS=LF-duration.

**Float:** Float = LS - ES. Float = 0 means the deliverable is on the critical path.

**Critical path summary:** [Name the chain of dependent deliverables that sets the earliest possible finish date, and which milestone is most exposed to slippage.]

**Compression guidance:** To shorten the timeline, crash (add resources to) or fast-track (parallelize) only critical-path deliverables. Non-critical path compression does not shorten the project.

---

## 6. Resourcing

| Role | Person | Allocation | Notes | Onboarding Required? |
| :--- | :--- | :--- | :--- | :--- |
| [e.g., Backend engineer] | [Name] | [Full-time / 50%] | [Shared with another project?] | `No` / `Yes - see Section 6.1` |

### 6.1 Team Onboarding

| Team Member | Role | Start Date | Ramp-up Plan | Buddy/Mentor | First Deliverable | Access/Tooling Needed |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| [Name] | [Role] | YYYY-MM-DD | [What they need to read/set up] | [Name] | [Scoped, low-risk task] | [Accounts, permissions, environments] |

**Knowledge transfer timeline:**
| Topic | From | To | Scheduled Date | Format |
| :--- | :--- | :--- | :--- | :--- |
| [e.g., Existing architecture overview] | [SME Name] | [New team member] | YYYY-MM-DD | [Meeting / Doc / Pair session] |

---

## 7. Risk Register

| ID | Risk | Category | Likelihood | Impact | Mitigation / Contingency | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| R-01 | [e.g., Key engineer unavailable in Phase 2] | `Schedule` | `Medium` | `High` | [Cross-train a backup / adjust sequencing] | [Name] |
| R-02 | [e.g., Third-party API access delayed] | `External` | `Low` | `High` | [Start integration test with sandbox early] | [Name] |
| R-03 | [e.g., Unstaffed role delays Phase 3] | `Resource` | [L] | [I] | [Accelerate hiring / reallocate from another team] | [Name] |
| R-04 | [e.g., Budget overrun in Phase 2] | `Budget` | [L] | [I] | [Phase buffer / scope reduction plan] | [Name] |

---

## 8. Budget

| Phase | Labor Cost | Infrastructure | Tools/Licenses | Vendor/External | Phase Total |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Phase 1: [Name] | [$] | [$] | [$] | [$] | [$] |
| Phase 2: [Name] | [$] | [$] | [$] | [$] | [$] |
| **Total** | **[$]** | **[$]** | **[$]** | **[$]** | **[$]** |

| Item | Amount |
| :--- | :--- |
| **Total project budget** | [$] |
| **Contingency buffer (10-20%)** | [$] |
| **Budget with contingency** | [$] |

**Burn rate:** [$ per week / $ per month]

**Cost tracking mechanism:** [e.g., Monthly finance review, weekly budget dashboard, spreadsheet updated by PM]

**Budget risks:**
| Risk | Trigger | Response |
| :--- | :--- | :--- |
| [e.g., Phase 2 exceeds estimate by >20%] | [Actual vs. planned at phase gate] | [Reduce scope / draw from contingency / escalate] |

---

## 9. Quality Assurance

### 9.1 Code Review Policy
- **Reviewers required:** [e.g., minimum 1 senior engineer]
- **Approval requirement:** [e.g., 2 approvals for production code, 1 for internal tools]
- **Turnaround expectation:** [e.g., within 24 business hours]
- **Review checklist:** [Link or inline checklist]

### 9.2 Testing Strategy

| Phase | Unit Test Target | Integration Test Target | E2E Test Target | Performance Target |
| :--- | :--- | :--- | :--- | :--- |
| Phase 1 | [e.g., 80% coverage] | [e.g., Critical paths covered] | [e.g., Smoke tests] | [e.g., Baseline established] |
| Phase 2 | [e.g., 85% coverage] | [e.g., All integrations] | [e.g., Full regression] | [e.g., <200ms p95] |

### 9.3 Quality Gates per Milestone

| Milestone | Gate Requirement | Gate Owner | Pass Criteria |
| :--- | :--- | :--- | :--- |
| [M1: Name] | [e.g., All unit tests pass, code coverage > 80%, security scan clean] | [Name] | [Specific measurable criteria] |

### 9.4 Definition of Done (Project-Wide)

Every deliverable must meet ALL of the following before it is considered complete:
- [ ] Code reviewed and approved per review policy
- [ ] Unit tests written and passing
- [ ] Integration tests written for API boundaries
- [ ] Documentation updated (README, API docs, inline comments)
- [ ] Deployed to staging and verified
- [ ] No known critical or high-severity bugs

---

## 10. Communication Plan

### 10.1 Communication RACI

| Communication | Author | Approver | Contributor | Informed |
| :--- | :--- | :--- | :--- | :--- |
| Weekly status update | [PM Name] | [Sponsor] | [Team leads] | [All stakeholders] |
| Milestone review | [PM Name] | [Sponsor] | [Deliverable owners] | [Executive team] |
| Risk escalation | [Risk owner] | [Sponsor] | [PM] | [Affected teams] |
| Scope change request | [Requester] | [Change board / Sponsor] | [Tech lead, PM] | [All stakeholders] |
| Retrospective summary | [Facilitator] | -- | [All team members] | [Sponsor] |

### 10.2 Cadence

| Meeting / Update | Frequency | Participants | Format | Duration |
| :--- | :--- | :--- | :--- | :--- |
| Daily standup | Daily | [Core team] | [Sync / Async] | [15 min] |
| Status update | [Weekly] | [Team + stakeholders] | [Async doc / Email] | -- |
| Stakeholder review | [Bi-weekly] | [Sponsor, PM, leads] | [Sync meeting] | [30 min] |
| Milestone review | [Per milestone] | [Full team + stakeholders] | [Demo + sync] | [60 min] |
| Retrospective | [See Section 12] | [Core team] | [Sync meeting] | [45 min] |

### 10.3 Tools

| Purpose | Tool | Notes |
| :--- | :--- | :--- |
| Task tracking | [e.g., Jira, Linear, GitHub Projects] | [Board URL] |
| Documentation | [e.g., Confluence, Notion, Git repo] | [Space URL] |
| Real-time communication | [e.g., Slack, Teams] | [Channel name] |
| File sharing | [e.g., Google Drive, SharePoint] | [Folder URL] |

---

## 11. Change Log

Track all scope changes during project execution. Each change must include impact analysis before approval.

| ID | Date | Proposed By | Description | Timeline Impact | Budget Impact | Resource Impact | Status | Approved By |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| CR-01 | YYYY-MM-DD | [Name] | [Brief description] | [+/- days] | [+/- $] | [Who is affected] | `Proposed` / `Approved` / `Rejected` | [Name] |

**Change management process:**
1. **Propose:** Anyone can submit a change request using the format above
2. **Analyze:** Tech lead and PM assess timeline, budget, resource, and dependency impact
3. **Decide:** [Sponsor / Change board] approves or rejects based on impact analysis
4. **Communicate:** Approved changes are broadcast to all stakeholders via [tool]
5. **Track:** This change log is updated and the project plan is revised accordingly

---

## 12. Retrospective / Learning

**Cadence:** [e.g., End of each phase / Every 2 weeks / At each milestone]
**Format:** [Start/Stop/Continue / 4Ls (Liked, Learned, Lacked, Longed for) / Mad/Sad/Glad]
**Duration:** [e.g., 45 minutes]
**Facilitator:** [Name - rotates each session]
**Blameless principle:** Focus on process and systems, not individuals.

| Retro # | Date | Phase / Milestone | Key Findings | Action Items | Owner | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | YYYY-MM-DD | [Phase 1] | [What went well, what didn't] | [Specific improvements] | [Name] | `Open` / `Done` |

---

## 13. Glossary

Define project-specific terms, acronyms, and abbreviations to ensure shared understanding across all stakeholders.

| Term | Definition |
| :--- | :--- |
| [e.g., MVP] | [Minimum Viable Product - the smallest feature set that delivers user value] |
| [e.g., Critical path] | [The longest chain of dependent tasks that determines earliest project completion] |
| [e.g., Spike] | [A time-boxed research task to reduce uncertainty before estimation] |
| [Add project-specific terms] | |
