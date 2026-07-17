---
title: Business Concept
skill: business-concept
status: draft
owner_reviewed: false
last_updated: YYYY-MM-DD
depends_on: []
supersedes: ""
---

# Business Concept: [Project Name]

## 1. Executive Summary

[2-3 sentences: what is being built, for whom, and why it matters. This should be readable in 15 seconds.]

---

## 2. Problem Statement

**What problem does this solve?**

[Describe the problem in concrete terms. What is painful, broken, or missing today?]

**What are people doing today without this?**

[Describe the current workarounds or alternatives. Why are they insufficient?]

**Why now?**

[What changed that makes this the right time to build this? Market shift, technology availability, regulatory change, etc.]

---

## 3. Target Users

**Primary users:**

| Persona | Description | Current Pain | What They Need |
|:---|:---|:---|:---|
| [Name] | [Who they are, concrete description] | [What's broken for them] | [What this product gives them] |

**Secondary users (if applicable):**

| Persona | Description | Relationship to Primary Users |
|:---|:---|:---|
| [Name] | [Who they are] | [How they interact with primary users] |

---

## 4. Problem-Solution Fit

| Problem (from Section 2) | How This Product Solves It | Evidence / Validation |
|:---|:---|:---|
| [Specific problem] | [Specific feature/capability that addresses it] | [User interview, data, assumption] |

> If every problem in Section 2 cannot be mapped to a specific solution capability, the concept has gaps.

---

## 5. Market Context

### 5.1 Competitive Landscape

| Competitor | Core Value Prop | Target User | Pricing | Strength | Weakness |
|:---|:---|:---|:---|:---|:---|
| [Competitor 1] | [What they do well] | [Who they serve] | [Model] | [Key advantage] | [Key gap] |
| [Competitor 2] | [What they do well] | [Who they serve] | [Model] | [Key advantage] | [Key gap] |
| [Competitor 3] | [What they do well] | [Who they serve] | [Model] | [Key advantage] | [Key gap] |

**Competitive advantage of this product:** [What gap does this exploit that competitors miss?]

### 5.2 Market Sizing

| Level | Estimate | Methodology |
|:---|:---|:---|
| **TAM** (Total Addressable Market) | [e.g., $XB globally] | [Bottom-up: N users x $Y/year, or top-down source] |
| **SAM** (Serviceable Addressable Market) | [e.g., $X in target region/segment] | [Filtered by geography, regulation, channel access] |
| **SOM** (Serviceable Obtainable Market) | [e.g., $X in year 1-3] | [Realistic share given competition, budget, team] |

> Tag estimates as `[agent-estimated]` if based on general knowledge rather than user-provided data.

---

## 6. Value Proposition

**Core value:** [One sentence: what does this product do for the user that they can't get elsewhere?]

**Unique advantage:** [What makes this different from alternatives? Why would someone choose this?]

**Alternatives considered by users:**

| Alternative | Why Users Choose It | Why It Falls Short |
|:---|:---|:---|
| [Competitor/workaround 1] | [Reason] | [Gap] |
| [Competitor/workaround 2] | [Reason] | [Gap] |

---

## 7. Monetization Model

**How does this make money?**

- [ ] Subscription (recurring)
- [ ] One-time purchase
- [ ] Freemium (free tier + paid upgrades)
- [ ] Advertising
- [ ] Transaction fees
- [ ] Internal cost savings (not revenue-generating)
- [ ] Other: [describe]
- [ ] Not decided yet `[agent-decided]`

**Pricing model:** [If known, describe the pricing structure. If not, tag as `🔵 Open Question`]

---

## 8. Scope

### Must-Have (v1)

[What is the absolute minimum that's useful? If these features don't exist, the product has no value.]

| Feature | Why It's Essential |
|:---|:---|
| [Feature 1] | [Reason] |
| [Feature 2] | [Reason] |

### Nice-to-Have (v2+)

[What can wait? These are valuable but not critical for launch.]

| Feature | Why It Can Wait |
|:---|:---|
| [Feature 1] | [Reason] |
| [Feature 2] | [Reason] |

### Explicitly Out of Scope

[What are we NOT building? These could reasonably be goals but are explicitly excluded.]

| Feature | Why It's Excluded |
|:---|:---|
| [Feature 1] | [Reason] |

---

## 9. Stakeholder Map

| Stakeholder | Role | Interest in This Project | Influence Level | Communication Needs |
|:---|:---|:---|:---|:---|
| [e.g., CEO] | Sponsor | Strategic vision, revenue | High | Monthly status update |
| [e.g., Head of Engineering] | Technical owner | Architecture, delivery | High | Weekly sync |
| [e.g., End users] | Primary users | Usability, productivity | Medium (aggregate) | Beta testing, feedback surveys |
| [e.g., Compliance team] | Gatekeeper | Regulatory adherence | Medium | Review at design phase |

---

## 10. Key Assumptions & Validation Plan

| # | Assumption | Validation Method | Owner | Deadline | Status |
|:---|:---|:---|:---|:---|:---|
| 1 | [e.g., Users will pay $X/month for this] | [e.g., Landing page test with waitlist] | [Name] | [Date] | `Unvalidated` |
| 2 | [e.g., Market size is at least $XM] | [e.g., Industry report + user interviews] | [Name] | [Date] | `Unvalidated` |
| 3 | [e.g., Users prefer this over spreadsheets] | [e.g., Competitive usability test] | [Name] | [Date] | `Unvalidated` |
| 4 | [e.g., We can acquire users at <$X CAC] | [e.g., Small ad spend test] | [Name] | [Date] | `Unvalidated` |

> Assumptions that are `Invalidated` must trigger a concept re-evaluation.

---

## 11. Standing Constraints

| Constraint | Value | Source |
|:---|:---|:---|
| **Team size** | [e.g., Solo dev / 3 developers] | Owner-specified / Agent-decided |
| **Team skill level** | [e.g., Senior full-stack / Junior frontend + senior backend] | |
| **Hosting** | [e.g., AWS / Self-hosted / No preference] | |
| **Budget sensitivity** | [e.g., Low — prefer managed services] | |
| **Timeline** | [e.g., MVP in 6 weeks] | |
| **Regulatory** | [e.g., GDPR / None] | |
| **Existing systems** | [e.g., Must integrate with existing PostgreSQL DB / None] | |

---

## 12. Success Criteria

**How do we know this worked?**

| Metric | Target | How We Measure |
|:---|:---|:---|
| [e.g., Monthly active users] | [e.g., 1,000 in first 3 months] | [e.g., Analytics dashboard] |
| [e.g., Revenue] | [e.g., $5K MRR by month 6] | [e.g., Stripe dashboard] |
| [e.g., User satisfaction] | [e.g., NPS > 40] | [e.g., In-app survey] |

---

## 13. Risks & Unknowns

| Risk | Likelihood | Impact | Mitigation |
|:---|:---|:---|:---|
| [e.g., Market may not need this] | [High/Med/Low] | [High/Med/Low] | [e.g., Validate with 10 user interviews before building] |
| [e.g., Third-party API may be unreliable] | [High/Med/Low] | [High/Med/Low] | [e.g., Design fallback mechanism] |

---

## 14. Open Questions

| Question | Status | Owner |
|:---|:---|:---|
| [Question] | `Open` / `Resolved` | [Name] |

---

## 15. Agent-Decided Items

> Items where the user answered "I don't know, you decide." A human reviewer should check these before proceeding.

| Item | Decision Made | Reasoning |
|:---|:---|:---|
| [e.g., Monetization model] | [e.g., Freemium] | [e.g., Similar products in market use freemium; lowers barrier to entry] |
