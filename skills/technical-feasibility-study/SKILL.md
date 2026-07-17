---
name: technical-feasibility-study
argument-hint: "[concept or proposed solution]"
description: Assess whether a proposed technical solution is viable given the current stack, team, timeline, and constraints. Produces a go/no-go recommendation with evidence. Use before committing engineering resources to design or implementation.
intent: >-
  Prevent wasted engineering effort by rigorously evaluating a proposed technical concept before any design or implementation begins. A technical feasibility study examines four dimensions: technical capability (can this be built?), resource feasibility (do we have the skills and time?), operational feasibility (can we run it?), and risk feasibility (what can go wrong, and how badly?). The output is a structured assessment with a clear go/no-go/conditional recommendation backed by evidence - not opinion.
type: workflow
theme: engineering-docs
best_for:
  - "Evaluating a new technology, framework, or architectural pattern before adoption"
  - "Assessing whether a third-party integration is viable"
  - "Answering 'can we build this in the time we have?' before a commitment is made"
  - "Deciding between competing implementation approaches"
scenarios:
  - "Is it feasible to migrate our monolith to microservices within 6 months?"
  - "Evaluate the technical feasibility of adding real-time collaborative editing to our platform"
  - "Can we integrate with the XYZ payment processor given our current PHP stack?"
estimated_time: "4-8 hours"
license: MIT
compatibility: Designed for Gemini (Antigravity), Claude Code, Cursor/Windsurf, Kimi Code, Codex/Copilot
---

## Purpose

Prevent the most expensive engineering failure mode: committing significant resources to a direction that was never viable. A technical feasibility study is not a design document - it does not specify how to build something. It answers the prior question: **should we build it this way at all?**

## Input

**Works best with:** A description of the proposed concept, approach, or technology being evaluated.
**Also valuable:** Timeline constraints, team skills inventory, existing tech stack, budget limits, regulatory environment.

**Example invocation:** `Assess the feasibility of building a real-time fraud detection engine using stream processing for our payment gateway, given our team of 3 PHP engineers and a 4-month delivery window.`

## Key Concepts

### Four Feasibility Dimensions

**1. Technical Feasibility**
Can this be built with available or acquirable technology? Does the proposed solution have proven precedent at similar scale? Are there known technical blockers?

**2. Resource Feasibility**
Do we have - or can we acquire - the engineering skills, infrastructure, and budget required? What is the realistic timeline given current team capacity?

**3. Operational Feasibility**
Once built, can we operate, monitor, and maintain this system? Does it integrate with existing monitoring, deployment, and support processes?

**4. Risk Feasibility**
What are the critical failure modes? What is the fallback if this approach does not work? What is the blast radius of a failed implementation?

### Recommendation Levels
- **Go:** Proceed with design and implementation. Evidence strongly supports viability.
- **Conditional Go:** Proceed only if stated conditions are met (e.g., hire specialist, resolve dependency X first).
- **No Go:** The approach is not viable under current constraints. Evidence-backed alternative recommended.

### What This Is NOT
- Not a design document. Do not specify implementation details here.
- Not a business case. Business ROI is a separate concern; focus only on technical viability.
- Not a decision made by one person. The output should be reviewed by all stakeholders before committing.

### Benchmarking Methodology
When comparing technologies or approaches, apply a structured benchmarking methodology:
1. **Define comparable criteria:** What specific, measurable attributes are being compared? (throughput, latency, developer ergonomics, ecosystem maturity, operational cost)
2. **Control variables:** Ensure comparisons are fair — same hardware, same dataset, same load pattern
3. **Use real workloads:** Synthetic benchmarks are a starting point, but the evaluation must include workloads representative of actual production use
4. **Document methodology:** Record exact test setup, versions, configurations, and data so results are reproducible
5. **Quantify uncertainty:** Report confidence intervals, not just point estimates — a benchmark showing "10ms average" is meaningless without p95/p99

### PoC Specification Template
When a technology is unfamiliar or the risk is high, require a time-boxed PoC before committing. Specify:
- **Objective:** What specific question does this PoC answer? (e.g., "Can the library handle 10K concurrent connections on our hardware?")
- **Scope:** What is explicitly in scope and out of scope?
- **Time-box:** Maximum time allocated (typically 1-2 weeks)
- **Success criteria:** Pass/fail conditions defined BEFORE the PoC starts — not retroactively adjusted
- **Output:** What artifact proves the result? (benchmark numbers, working prototype, integration demo)
- **Decision:** If the PoC passes, proceed. If it fails, trigger the fallback path.

### Decision Matrix
When weighing multiple feasibility dimensions, use a weighted decision matrix:
1. List the dimensions being evaluated (technical, resource, operational, risk)
2. Assign weights based on project priorities (e.g., risk = 40%, technical = 30%, resource = 20%, operational = 10%)
3. Score each dimension on a 1-5 scale with evidence
4. Calculate weighted scores and present the total alongside the qualitative recommendation

The matrix does not replace judgment — it makes the reasoning transparent. If the matrix says "Go" but the assessor's gut says "No Go," investigate the discrepancy rather than overriding.

### Confirmation Bias Handling
Feasibility studies are particularly vulnerable to confirmation bias — the tendency to seek evidence that supports a desired outcome. Mitigate this by:
- **Assign a devil's advocate:** Explicitly task someone with arguing against the proposed approach
- **Seek disconfirming evidence first:** Before looking for reasons it will work, look for reasons it won't
- **Use pre-mortem analysis:** Imagine the project has failed — what went wrong? This surfaces risks that optimistic analysis misses
- **Separate the evaluator from the advocate:** The person who proposed the approach should not be the sole evaluator of its feasibility
- **Document what you don't know:** Unknowns are more dangerous than known risks — explicitly list them

### Conflict Resolution

When your analysis conflicts with the user's stated preference:

1. **Present both positions** — show your analysis and their preference side by side
2. **Explain the trade-off** — what are the consequences of each choice?
3. **Recommend with reasoning** — state your recommendation and why
4. **Respect the user's decision** — they own the final call
5. **Document the decision** — record it as an `[owner-specified]` override with reasoning

### Document Length

Target length: **5-10 pages** (excluding appendices).

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
1. **Core technical doubts**: What is the most risky or uncertain part of this proposal?
2. **Alternative approaches**: Are there any other alternative routes you have briefly considered?

*Wait for the user's response to these questions before drafting the final feasibility study.*

### Phase 2: Define the Proposition (40-60 min)
State clearly what is being evaluated and what success looks like.

### Phase 3: Technical Assessment (90 min)
Evaluate the technology, architecture, and integration complexity.

### Phase 4: Resource and Timeline Assessment (60 min)
Map required skills, team availability, infrastructure, and realistic timeline.

### Phase 5: Risk Analysis (60 min)
Identify critical risks, blockers, and fallback options.

### Phase 6: Recommendation (30-45 min)
Deliver a clear Go / Conditional Go / No Go with evidence summary.

### Phase 7: Revision (After User Review)

If the user requests changes after reviewing the document:

1. **Read the user's feedback carefully** — understand what they want changed
2. **Check for conflicts** — does the requested change conflict with prior documents?
3. **Apply changes** — update the document
4. **Re-run consistency check** — verify the change doesn't break cross-document consistency
5. **Update metadata** — set `last_updated` to today's date
6. **Confirm with user** — show the changes and get approval

## Gotchas

- **Jumping to a recommendation without evidence.** Every Go/No-Go verdict must cite specific findings from the assessment sections. "It feels risky" is not an analysis; cite the PoC failure, the skills gap, or the missing infrastructure.
- **Confusing feasibility with desirability.** A feasibility study answers "can we build this?" not "should we build this?" Business ROI and strategic fit are separate concerns; do not conflate them into the technical assessment.
- **Skipping the PoC recommendation when technology is unfamiliar.** If the team has no production experience with the proposed technology and no PoC has been run, the only defensible recommendation is Conditional Go with a time-boxed PoC as a prerequisite condition.
- **Underestimating operational feasibility.** Teams often assess "we can build it" but forget to assess "we can run it at 3 AM." Always evaluate monitoring, alerting, deployment, and incident response readiness.
- **Ignoring fallback options.** A feasibility study that recommends "Go" without defining what happens if the approach fails mid-implementation is incomplete. Always document at least one viable fallback path and its trigger condition.

## Handoff

**Reads from:**
- `1-business-plan.md` — problem definition, constraints, existing systems
- `2-project-plan.md` — timeline constraints, team capacity, budget

**Feeds into:**
- `technical-specification` — feasibility verdict, conditional requirements, risk findings
- `system-architecture-document` — technology constraints, integration feasibility, risk mitigations

## Quality Gate

Before marking this document as `final`, verify:
- [ ] All four feasibility dimensions (technical, resource, operational, risk) have explicit verdicts with supporting evidence
- [ ] The recommendation (Go / Conditional Go / No Go) is directly supported by the assessment findings and not contradicted by any dimension
- [ ] At least two alternatives are documented with evidence-based rejection rationale
- [ ] Every Conditional Go condition has an owner and a deadline assigned
- [ ] A fallback option is defined with a clear trigger condition for when to abandon the current approach

## Next Steps

After this document is complete, proceed to:
- **`technical-specification`** — detailed system requirements informed by feasibility findings
- **`system-architecture-document`** — architecture designed around validated technology choices
- Or invoke `using-engineering-docs` to continue the pipeline
