---
name: deployment-plan
argument-hint: "[service or release name]"
description: Write a production deployment plan covering environment specs, deployment strategy (Blue-Green, Canary, Rolling, or Direct), step-by-step execution runsheet, go/no-go criteria, monitoring plan, and rollback procedure. Use before any non-trivial production release.
intent: >-
  Produce a deployment plan that transforms a code release from a high-anxiety event into a controlled, repeatable, and reversible procedure. Every production deployment must have a defined strategy, a clear go/no-go decision gate, a monitoring plan, and a specific rollback procedure written in advance - not improvised during an incident. This document is read by the engineer performing the deployment, the on-call responder, and post-incident reviewers. DORA research shows that organizations with documented deployment plans deploy more frequently and recover more quickly from failures.
type: workflow
theme: engineering-docs
best_for:
  - "Planning a new service deployment to production"
  - "Documenting the deployment procedure for a major feature release"
  - "Establishing a standard deployment runsheet for a service"
  - "Planning a high-risk migration or infrastructure change"
scenarios:
  - "Write a deployment plan for releasing the new webhook delivery system to production"
  - "Plan a blue-green deployment for upgrading our PHP runtime from 8.1 to 8.3"
  - "Create a deployment runsheet for our database migration adding 3 new tables"
estimated_time: "1-2 hours"
---

## Purpose

Produce a deployment plan that specifies exactly how, when, and by whom a release is deployed, what criteria determine success or failure, and what steps to take if something goes wrong.

**A deployment without a rollback plan is a deployment without a safety net.** This skill ensures every production change is made with eyes open and a clear path back.

## Input

**Works best with:** The name of the service being deployed and a description of what is changing.
**Also valuable:** Current production environment specs, existing deployment pipeline, known risks or dependencies, SLA requirements.

**Example invocation:** `Write a deployment plan for releasing OwnPay v2.4.0 to production. This release includes 3 database migrations (additive only), a new webhook delivery queue worker, and updates to the checkout templates. We use a single production server with PHP-FPM and MySQL. Zero downtime is required.`

## Key Concepts

### Deployment Strategies
- **Direct Deploy:** Replace running code in-place. Simple, but brief downtime risk.
- **Rolling Deploy:** Update instances one at a time. No downtime. If failure occurs, some instances run old code while others run new.
- **Blue-Green:** Maintain two identical environments (Blue = current, Green = new). Switch traffic at load balancer after validation. Zero downtime. Full instant rollback by switching back.
- **Canary:** Deploy to small percentage of traffic first (e.g., 5%). Monitor. Gradually increase if metrics hold.
- **Feature Flag:** Deploy code to all servers but enable via config. Decouple deployment from release.

### Go/No-Go Gate
Before deploying to production, verify a defined set of criteria. If any criterion fails, the deployment does not proceed. This is not optional.

### DORA Metrics (What Good Looks Like)
- **Deployment Frequency:** Elite teams deploy multiple times per day.
- **Lead Time for Change:** Elite teams go from commit to production in less than 1 hour.
- **Change Failure Rate:** Elite teams have < 5% deployments causing failures.
- **MTTR:** Elite teams recover from failures in less than 1 hour.

## Application

### Phase 1: Socratic Clarification & Brainstorming (Mandatory Interview)
Before writing any deployment plan, you MUST interrogate the user's initial input, identify deployment risks, and ask **3-5 targeted clarifying questions** to dig deeper. Do NOT generate the template yet.
Ask questions to resolve:
1. **Target Environment & Infrastructure**: What hosting platform (AWS, Docker, VM, PaaS) and OS runner are we deploying to?
2. **Current deployment workflow**: What tools (GitHub Actions, manual rsync, Ansible) execute the deploy?
3. **Downtime limits**: Is any brief service interruption acceptable, or is a zero-downtime strategy (Blue-Green, Canary) mandatory?
4. **Data Migrations**: Does this release involve schema migrations, data transformations, or breaking database updates?
*Wait for the user's response to these questions before drafting the final deployment plan.*

### Phase 2: Document Generation
1. Choose the deployment strategy based on the risk profile and infrastructure.
2. Document the exact execution runsheet - every command, every verification step.
3. Define explicit go/no-go criteria with measurable thresholds.
4. Define the rollback procedure before you start.
5. Identify the on-call owner who will monitor the deployment.
