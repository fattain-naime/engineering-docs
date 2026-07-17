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
estimated_time: "2-4 hours"
license: MIT
compatibility: Designed for Gemini (Antigravity), Claude Code, Cursor/Windsurf, Kimi Code, Codex/Copilot
---

## Purpose

Produce a deployment plan that specifies exactly how, when, and by whom a release is deployed, what criteria determine success or failure, and what steps to take if something goes wrong.

**A deployment without a rollback plan is a deployment without a safety net.** This skill ensures every production change is made with eyes open and a clear path back.

## Input

**Works best with:** The name of the service being deployed and a description of what is changing.
**Also valuable:** Current production environment specs, existing deployment pipeline, known risks or dependencies, SLA requirements.

**Example invocation:** `Write a deployment plan for releasing PayFlow v2.4.0 to production. This release includes 3 database migrations (additive only), a new webhook delivery queue worker, and updates to the checkout templates. We use a single production server with PHP-FPM and MySQL. Zero downtime is required.`

## Key Concepts

### Deployment Strategies
- **Direct Deploy:** Replace running code in-place. Simple, but brief downtime risk.
- **Rolling Deploy:** Update instances one at a time. No downtime. If failure occurs, some instances run old code while others run new.
- **Blue-Green:** Maintain two identical environments (Blue = current, Green = new). Switch traffic at load balancer after validation. Zero downtime. Full instant rollback by switching back.
- **Canary:** Deploy to small percentage of traffic first (e.g., 5%). Monitor. Gradually increase if metrics hold.
- **Feature Flag:** Deploy code to all servers but enable via config. Decouple deployment from release.

### Strategy Decision Matrix

Choose the deployment strategy based on three factors: risk tolerance, downtime tolerance, and infrastructure capability.

| Risk Level | Downtime OK? | Infrastructure | Recommended Strategy |
| :--- | :--- | :--- | :--- |
| Low | Yes | Single server | Direct Deploy |
| Low | No | Multiple instances | Rolling Deploy |
| Medium | No | Load balancer available | Blue-Green |
| High | No | Load balancer + metrics pipeline | Canary |
| Any | No | Feature flag system in place | Feature Flag |
| High | No | Kubernetes / ECS | Canary with pod-level rollback |

When risk is high and downtime is unacceptable but infrastructure is limited, invest in the infrastructure before deploying - do not paper over the gap with manual vigilance.

### Multi-Service/Microservice Deployment Coordination

When deploying changes that span multiple services, document the dependency graph and deployment order explicitly:
- **Deployment ordering:** Which service deploys first? Which depends on which? Use a directed acyclic graph (DAG) to visualize.
- **Backward compatibility window:** During a multi-service rollout, both old and new versions of each service must coexist. Document the compatibility contract for each interface change.
- **Rollback coordination:** If service A is rolled back, must services B and C also roll back? Define this before the deployment begins.
- **Shared schema changes:** Database migrations that affect multiple services require a coordinated deployment sequence - typically: migrate schema (backward-compatible) -> deploy consumers -> deploy producers -> remove old columns.

### Infrastructure-as-Code (IaC) Changes

When the deployment includes IaC changes (Terraform, Pulumi, CloudFormation, CDK), treat infrastructure changes with the same rigor as application code:
- **Plan before apply:** Always run `terraform plan` (or equivalent) and review the diff before applying. Document the expected changes in the deployment plan.
- **Blast radius assessment:** Which resources will be created, modified, or destroyed? Destroying and recreating a database is not the same as updating a security group rule.
- **State management:** Ensure remote state is locked during the deployment window. Concurrent applies cause state corruption.
- **Rollback for IaC:** Infrastructure rollbacks are often harder than code rollbacks. If a `terraform apply` creates a new load balancer, rolling back requires another `apply`, not just a symlink swap. Document the IaC rollback steps explicitly.
- **Drift detection:** Before deploying, check for configuration drift between the IaC state and actual infrastructure. Drift means the plan may not apply cleanly.

### DNS and TLS Certificate Management

DNS and certificate changes have unique timing characteristics that must be planned:
- **DNS TTL:** If changing DNS records, lower TTL to 60-300 seconds at least 24 hours before the deployment. After the change is stable, raise TTL back. Document the TTL reduction step in the pre-deployment checklist.
- **Certificate provisioning:** If deploying to a new domain or subdomain, ensure certificates are provisioned and validated before the deployment window. Automated provisioning (Let's Encrypt) can fail due to DNS propagation delays or rate limits.
- **Certificate expiry monitoring:** Confirm no certificates in the deployment chain expire within 30 days. An expired certificate during a deployment window is a self-inflicted outage.
- **Multi-domain / SAN certificates:** If the service serves multiple domains, verify all SANs are covered.

### Canary Deployment Metrics Comparison

For canary deployments, define the metrics comparison methodology before the deployment:
- **Comparison tool:** How will canary metrics be compared to baseline? (Prometheus queries, Datadog monitors, custom dashboard)
- **Comparison thresholds:** What metric deltas trigger automatic rollback vs. manual review vs. automatic promotion?
  - Error rate: canary must not exceed baseline by more than [X%]
  - Latency: canary p99 must not exceed baseline p99 by more than [Y ms]
  - Business metrics: canary success rate must not drop below [Z%]
- **Promotion criteria:** What is the exact decision logic?
  1. Canary at 5% for 15 minutes, all metrics within thresholds -> promote to 25%
  2. Canary at 25% for 30 minutes, all metrics within thresholds -> promote to 100%
  3. Any threshold breach at any stage -> automatic rollback
- **Promotion authority:** Who approves the final promotion from canary to full rollout? Automated, or requires human sign-off?

### Deployment Freeze Windows

Define periods when deployments are prohibited or restricted:
- **Scheduled freeze windows:** Holidays, end-of-quarter, major business events, audit periods. Document these in the deployment plan.
- **Incident-triggered freezes:** After a SEV-1 or SEV-2 incident, enforce a deployment freeze for [N hours] while the team stabilizes and recovers.
- **Freeze exceptions:** Who can authorize a deployment during a freeze? What is the approval process?
- **Freeze communication:** How are freeze windows communicated to the team? (Shared calendar, Slack announcement, deployment tool enforcement)

### Post-Deployment Verification Automation

Automate post-deployment verification to catch regressions faster than manual smoke tests:
- **Synthetic monitoring:** Run automated user journey tests against production every [N minutes] post-deployment. Tools: Checkly, Datadog Synthetics, custom scripts.
- **Canary analysis automation:** Automatically compare canary vs. baseline metrics and produce a pass/fail verdict.
- **Deployment health scorecard:** A single dashboard that aggregates all post-deployment checks (health endpoint, error rate, latency, queue depth, business metrics) into a pass/fail status.
- **Automated rollback trigger:** If verification automation detects a failure, it should trigger automatic rollback without waiting for human intervention (for deployments where this is safe).

### Container/Orchestration Specifics

When deploying to containerized environments (Kubernetes, ECS), additional considerations apply:
- **Image tagging:** Never deploy with the `latest` tag. Use immutable, version-specific tags (e.g., `sha-abc1234` or `v2.4.0`).
- **Resource limits:** Define CPU and memory requests/limits in the deployment manifest. Deploying without limits risks noisy-neighbor issues or OOM kills.
- **Readiness and liveness probes:** Ensure the new image's health endpoints are compatible with the configured probes. A failed readiness probe means the pod never receives traffic; a failed liveness probe means the pod gets killed repeatedly.
- **Rolling update strategy:** Configure `maxSurge` and `maxUnavailable` to control the rollout speed. Too aggressive risks capacity loss; too conservative wastes deployment window time.
- **Helm chart / Kustomize changes:** If the deployment modifies Helm values or Kustomize overlays, treat these as infrastructure changes with the same plan-before-apply discipline.
- **ECS-specific:** For ECS, document the task definition revision, service update configuration (minimum healthy percent, maximum percent), and whether the deployment uses rolling update or blue/green via CodeDeploy.

### Go/No-Go Gate
Before deploying to production, verify a defined set of criteria. If any criterion fails, the deployment does not proceed. This is not optional.

### DORA Metrics (What Good Looks Like)
- **Deployment Frequency:** Elite teams deploy multiple times per day.
- **Lead Time for Change:** Elite teams go from commit to production in less than 1 hour.
- **Change Failure Rate:** Elite teams have < 5% deployments causing failures.
- **MTTR:** Elite teams recover from failures in less than 1 hour.

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
1. **Current deployment workflow**: What tools (GitHub Actions, manual rsync, Ansible) execute the deploy?
2. **Downtime limits**: Is any brief service interruption acceptable, or is a zero-downtime strategy (Blue-Green, Canary) mandatory?

*Wait for the user's response to these questions before drafting the final deployment plan.*

### Phase 2: Document Generation
1. Choose the deployment strategy based on the risk profile and infrastructure.
2. Document the exact execution runsheet - every command, every verification step.
3. Define explicit go/no-go criteria with measurable thresholds.
4. Define the rollback procedure before you start.
5. Identify the on-call owner who will monitor the deployment.

### Phase 3: Revision (After User Review)

If the user requests changes after reviewing the document:

1. **Read the user's feedback carefully** — understand what they want changed
2. **Check for conflicts** — does the requested change conflict with prior documents (e.g., technical specification, system architecture)?
3. **Apply changes** — update the deployment plan
4. **Re-run consistency check** — verify the change doesn't break cross-document consistency (e.g., rollback steps still match the architecture's infrastructure)
5. **Update metadata** — set `last_updated` to today's date
6. **Confirm with user** — show the changes and get approval

## Gotchas

- **Deploying without a written rollback plan.** If you cannot articulate the rollback steps before deploying, you are not ready to deploy. The rollback plan must be written, reviewed, and tested on staging before the deployment window opens.
- **Running database migrations after application code deployment.** If the migration is backward-compatible, run it before the new code deploys so old code still works with the new schema. If it is not backward-compatible, it needs a multi-phase migration strategy - not a single deploy.
- **Skipping the post-deployment monitoring window.** Declaring "deploy complete" and walking away means no one catches the slow-burn failure (memory leak, queue backup, gradual error rate increase). Monitor for at least 30 minutes after smoke tests pass.
- **Defining go/no-go criteria as subjective gut feelings.** "Looks good" is not a go/no-go criterion. Use measurable thresholds: error rate below X%, p99 latency below Y ms, specific smoke test passes. If you cannot measure it, you cannot decide on it.
- **Forgetting to disable feature flags during rollback.** If the deployment enabled feature flags, the rollback must disable them. A code rollback without flag rollback leaves the system in an inconsistent state where old code is running but new behavior is partially enabled.

## Handoff

**Reads from:**
- `1-business-plan.md` — business constraints, uptime requirements
- `5-technical-specification.md` — performance and reliability requirements
- `7-system-architecture.md` — infrastructure topology, tech stack
- `15-test-strategy.md` — test gates that must pass before deployment
- `14-implementation-plan.md` — feature scope, migration requirements

**Feeds into:**
- `17-technical-runbook.md` — post-deployment monitoring procedures
- `18-disaster-recovery.md` — infrastructure context for failover planning
- `19-slo-error-budget.md` — deployment impact on reliability targets

---

## Quality Gate

Before marking this document as `final`, verify:
- [ ] The rollback procedure is complete with numbered steps, estimated time, and was tested on staging
- [ ] Every go/no-go criterion is measurable and binary (pass/fail, not "looks okay")
- [ ] The execution runsheet includes exact commands, not just descriptions of what to do
- [ ] Monitoring thresholds are defined with specific numeric values and corresponding actions
- [ ] A deployment lead and on-call backup are both named and confirmed available for the deployment window
- [ ] If deploying to containers/Kubernetes: image uses an immutable tag, resource limits are defined, and readiness/liveness probes are verified
- [ ] If canary strategy: promotion criteria are defined with specific metric thresholds and comparison tool
- [ ] If multi-service: deployment order DAG is documented, backward compatibility window is defined, and coordinated rollback plan exists
- [ ] If IaC changes: `terraform plan` output reviewed, blast radius assessed, and IaC-specific rollback steps documented
- [ ] If DNS/TLS changes: TTL pre-lowered, certificate provisioning verified, and expiry checked
- [ ] Deployment freeze windows checked and documented (or exception authorized)

## Next Steps

After this document is complete, proceed to:
- **`technical-runbook`** — document operational procedures for monitoring and responding to alerts post-deployment
- **`disaster-recovery-plan`** — define RTO/RPO targets and failover procedures for the deployed system
- **`slo-error-budget-document`** — formalize reliability targets and error budget policies
- Or invoke `using-engineering-docs` to continue the pipeline
