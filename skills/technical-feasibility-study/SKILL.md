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
estimated_time: "2-3 hours"
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

## Application

### Phase 1: Socratic Clarification & Brainstorming (Mandatory Interview)
Before writing any feasibility study, you MUST interrogate the user's initial input, identify technical unknowns, and ask **3-5 targeted clarifying questions** to dig deeper. Do NOT generate the template yet.
Ask questions to resolve:
1. **Core technical doubts**: What is the most risky or uncertain part of this proposal?
2. **Current stack capabilities**: What languages, frameworks, or cloud infrastructures are already in use that this must integrate with?
3. **Timeline and budget boundaries**: What are the strict limits on time or resources for this evaluation?
4. **Alternative approaches**: Are there any other alternative routes you have briefly considered?
*Wait for the user's response to these questions before drafting the final feasibility study.*

### Phase 2: Define the Proposition (20 min)
State clearly what is being evaluated and what success looks like.

### Phase 3: Technical Assessment (45 min)
Evaluate the technology, architecture, and integration complexity.

### Phase 4: Resource and Timeline Assessment (30 min)
Map required skills, team availability, infrastructure, and realistic timeline.

### Phase 5: Risk Analysis (30 min)
Identify critical risks, blockers, and fallback options.

### Phase 6: Recommendation (15 min)
Deliver a clear Go / Conditional Go / No Go with evidence summary.
