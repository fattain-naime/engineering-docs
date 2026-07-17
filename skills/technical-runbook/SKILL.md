---
name: technical-runbook
argument-hint: "[service or system name]"
description: Write a production operations runbook that provides on-call engineers with step-by-step procedures for operating, monitoring, and recovering a system. Covers system overview, alert response procedures, common failure modes, diagnostic commands, escalation paths, and maintenance procedures. Modeled on Google SRE runbook standards.
intent: >-
  Produce a production operations runbook that enables any on-call engineer - including one unfamiliar with this specific service - to diagnose and resolve common incidents without calling the original developer. Runbooks are the operational contract of a service: they translate system knowledge from the heads of the authors into durable, executable procedures. A runbook that reduces mean time to recovery (MTTR) from 2 hours to 15 minutes for common failures pays for its authorship cost in the first incident it handles. This skill follows Google SRE Book principles: runbooks document what to do, not why the system was designed this way (that is the SAD's job).
type: workflow
theme: engineering-docs
best_for:
  - "Documenting the operations procedures for a new service before it goes to production"
  - "Capturing tribal knowledge from senior engineers about how a legacy service behaves"
  - "Preparing on-call documentation before a service is handed to a new team"
  - "Creating the reference document linked from monitoring alerts"
scenarios:
  - "Write a runbook for the PayFlow payment gateway application"
  - "Create an operations manual for our webhook delivery worker service"
  - "Document how to operate and troubleshoot our Redis session cache"
estimated_time: "2-4 hours"
license: MIT
compatibility: Designed for Gemini (Antigravity), Claude Code, Cursor/Windsurf, Kimi Code, Codex/Copilot
---

## Purpose

Produce a runbook that enables any trained engineer - with no prior knowledge of this specific service - to respond to an alert, diagnose a failure, and execute recovery procedures.

**A runbook is not a tutorial or an architecture overview.** It is a rapid-reference guide for someone who is paged at 3 AM and needs to resolve an incident in 15 minutes, not learn the system from scratch.

## Input

**Works best with:** The name of the service being documented.
**Also valuable:** The alert definitions, common failure modes, diagnostic commands, architecture overview, and escalation contacts.

**Example invocation:** `Write a runbook for the PayFlow payment gateway. It's a PHP 8.3 app on Nginx/PHP-FPM, MySQL primary + replica, Redis for sessions/cache, and a queue worker process for async jobs. Alerts fire for: high 5xx rate, slow DB queries, queue depth > 1000, and PHP-FPM pool exhaustion.`

## Key Concepts

### What a Good Runbook Contains (Google SRE Standard)
1. **Overview** - What the service does, its SLA, and its dependencies (30 seconds to read)
2. **Monitoring and Dashboards** - Where to look when something is wrong
3. **Alert Response Procedures** - One procedure per alert: diagnosis, mitigation, escalation
4. **Common Failure Modes** - The top 5-10 failures that happen repeatedly
5. **Diagnostic Commands** - The exact commands to run for each symptom
6. **Escalation Path** - Who to call when the runbook cannot resolve the issue
7. **Maintenance Procedures** - Restart, scale, backup, restore

### MTTR Reduction
The primary goal of a runbook is to reduce MTTR. Every section should ask: "Can an on-call engineer execute this step in < 5 minutes?" If not, simplify or add more specific commands.

### Certificate Management and Rotation

TLS certificates are a common source of outages when they expire or are misconfigured. Document:
- **Certificate inventory:** Every certificate in use, its issuer, expiry date, and the service(s) it protects.
- **Rotation procedure:** Exact steps to renew and deploy a new certificate. Include both automated (Let's Encrypt / certbot) and manual (purchased certificate) paths.
- **Rotation schedule:** How often certificates are rotated (e.g., 90 days for Let's Encrypt, annually for purchased certs). Document the reminder/automation mechanism.
- **Emergency rotation:** What to do if a certificate is compromised or expires unexpectedly. Include the expedited path (e.g., bypassing normal change control).
- **Verification commands:** How to verify a certificate is correctly deployed and valid after rotation:
  ```bash
  echo | openssl s_client -connect [domain]:443 -servername [domain] 2>/dev/null | openssl x509 -noout -dates
  curl -vI https://[domain] 2>&1 | grep -i "expire\|issuer\|subject"
  ```

### Secret Rotation Procedures

Secrets (API keys, database passwords, encryption keys, service account credentials) must be rotatable without downtime. Document:
- **Secret inventory:** Every secret in use, where it is stored (Vault, AWS Secrets Manager, env vars), and which services consume it.
- **Rotation procedure per secret type:**
  - **API keys:** Generate new key -> update secret store -> restart/reload consumers -> revoke old key (with grace period if dual-key is supported).
  - **Database passwords:** Create new user with new password -> update secret store -> restart consumers -> drop old user (after confirming no connections).
  - **Encryption keys:** Generate new key -> re-encrypt data (if required) -> update key reference -> retain old key for decryption of legacy data.
- **Zero-downtime rotation:** How to rotate secrets without service interruption. Does the secret store support dual-read? Does the application hot-reload secrets or require a restart?
- **Rotation schedule:** How often each secret type is rotated (e.g., API keys quarterly, DB passwords monthly).
- **Emergency rotation:** What to do if a secret is suspected compromised. Include the expedited path and the blast radius assessment.

### Configuration Change Procedures

Configuration changes (environment variables, feature flags, runtime settings) are a common source of incidents when applied incorrectly or without validation. Document:
- **Configuration inventory:** Where configuration lives (env files, config management tool, feature flag service, Kubernetes ConfigMaps/Secrets).
- **Change procedure:**
  1. Document the current value and the proposed new value.
  2. Verify the change in staging (if applicable).
  3. Apply the change (exact command or tool).
  4. Verify the application picked up the change (log entry, health check, feature behavior).
  5. Document rollback: how to revert the configuration change if it causes issues.
- **Feature flag management:** How flags are toggled, who has authority, and what the blast radius is. Document the flag state required for each deployment phase.
- **Sensitive configuration:** Changes to secrets, credentials, or encryption settings follow the Secret Rotation Procedures (above), not the general configuration change procedure.

### Performance Profiling Procedures

When the service is slow but not failing, runbook steps must include performance profiling, not just restart-and-hope:
- **When to profile:** Trigger profiling when p99 latency exceeds warning threshold but is below critical, or when a specific endpoint is slow while others are fine.
- **Profiling tools and commands:**
  - **Xdebug profiler:** Enable for a single request, capture cachegrind file, analyze with KCachegrind or QCachegrind.
    ```bash
    # Enable for one request via query parameter (if configured)
    curl "https://[domain]/[slow-endpoint]?XDEBUG_PROFILE=1"
    # Cachegrind output: /tmp/cachegrind.out.[pid]
    ```
  - **Blackfire profiler:**
    ```bash
    blackfire curl https://[domain]/[slow-endpoint]
    # Review profile at blackfire.io
    ```
  - **New Relic / Datadog APM:** Check the APM dashboard for slow transaction traces. Identify the slow span (database query, external HTTP call, template rendering).
  - **MySQL slow query log:**
    ```bash
    tail -n 50 /var/log/mysql/slow.log
    # Look for queries with Rows_examined >> Rows_sent (missing index)
    ```
  - **PHP-FPM slow log:**
    ```bash
    tail -n 50 /var/log/php-fpm-slow.log
    ```
- **Profile in production safely:** Profiling tools add overhead. Use sampling (1-5% of requests) or enable profiling only for specific requests (query parameter, cookie) to avoid degrading all users.

### Runbook Validation Drills

A runbook that has never been tested against a real incident is a hypothesis, not a tool. Conduct validation drills:
- **Quarterly review checklist:**
  - [ ] Every diagnostic command in the runbook has been executed against the current production environment and the output matches what is documented
  - [ ] Every alert listed in the alert index has been verified to still exist in the monitoring system with the documented trigger conditions
  - [ ] Escalation contacts are current (no one has left the team or changed roles)
  - [ ] Log paths and formats have not changed (application updates, log rotation policy changes)
  - [ ] All referenced tools and CLIs are still installed and accessible on the on-call engineer's workstation
  - [ ] "Last Verified" date updated on each procedure section
- **Drill format:** Simulate an alert (e.g., inject a test error, stage a slow query) and have an engineer resolve it using only the runbook. Time it. If it takes longer than the target MTTR, the runbook needs improvement.
- **Drill log:** Record every drill in the Change Log with the date, scenario, result (pass/fail), and any gaps found.

### Multi-Region / Multi-Server Procedures

When the service runs across multiple regions or servers, additional operational considerations apply:
- **Per-region dashboards:** Do monitoring dashboards filter by region? Can an on-call engineer quickly isolate which region is degraded?
- **Region-specific runbooks:** Are there any procedures that differ by region (e.g., different DNS records, different backup locations, different scaling groups)?
- **Cross-region failover:** Document the failover procedure if one region becomes unavailable. Reference the disaster-recovery-plan for the full failover runsheet.
- **Distributed debugging:** How to correlate logs and traces across multiple servers. What request ID or trace ID is used, and how to search for it across all servers.
- **Server inventory:** Maintain a list of all servers/instances, their roles, and their region. An on-call engineer must be able to answer "how many servers are running this service and where?" in under 60 seconds.

### Living Document
A runbook that is not updated when the system changes becomes worse than no runbook (it gives false confidence). Add a "Last Verified" date to each procedure. Put the runbook update in the deployment checklist.

### Conflict Resolution

When your analysis conflicts with the user's stated preference:

1. **Present both positions** — show your analysis and their preference side by side
2. **Explain the trade-off** — what are the consequences of each choice?
3. **Recommend with reasoning** — state your recommendation and why
4. **Respect the user's decision** — they own the final call
5. **Document the decision** — record it as an `[owner-specified]` override with reasoning

### Document Length

Target length: **8-15 pages** (excluding appendices).

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
1. **Critical Alerts**: What are the most common alerts that trigger for this service?
2. **Escalation contacts**: Who is the primary engineer on-call, secondary contact, or manager?

*Wait for the user's response to these questions before drafting the final runbook.*

### Phase 2: Document Generation
1. Start with the service overview (what it does, SLA, dependencies).
2. Document every active alert with a response procedure.
3. Walk through the most common failure modes from recent incident history.
4. Write exact diagnostic commands - no vague instructions.
5. Define the escalation path unambiguously.
6. Document routine maintenance procedures.

### Phase 3: Revision (After User Review)

If the user requests changes after reviewing the document:

1. **Read the user's feedback carefully** — understand what they want changed
2. **Check for conflicts** — does the requested change conflict with prior documents (e.g., deployment plan, SLO document)?
3. **Apply changes** — update the runbook
4. **Re-run consistency check** — verify the change doesn't break cross-document consistency (e.g., alert names still match monitoring definitions in the architecture)
5. **Update metadata** — set `last_updated` to today's date
6. **Confirm with user** — show the changes and get approval

## Gotchas

- **Writing "why" instead of "what to do."** A runbook is an operational procedure, not an architecture document. An on-call engineer at 3 AM needs exact commands and decision trees, not design rationale. Save the "why" for the System Architecture Document.
- **Vague diagnostic commands.** "Check the logs" is not a diagnostic step. Write the exact command with the exact file path, filter pattern, and what to look for in the output. Every step must be executable by someone who has never seen this system before.
- **Missing the Quick Reference section.** An engineer mid-incident needs to jump to the right procedure in under 60 seconds. Without a symptom-to-section lookup table, the runbook fails its primary use case.
- **Not covering the "last verified" date.** A runbook that has not been verified against the current production state is dangerous - it may reference commands that no longer work or services that have been decommissioned. Every procedure needs a "Last Verified" timestamp.
- **Forgetting escalation triggers.** Every alert response procedure must state exactly when to stop trying the runbook and escalate. Without this, engineers waste time on steps that will not resolve the issue, increasing MTTR instead of reducing it.

## Handoff

**Reads from:**
- `7-system-architecture.md` — system components, dependencies, infrastructure
- `16-deployment-plan.md` — deployment procedures, rollback steps
- `19-slo-error-budget.md` — SLI/SLO targets, alert thresholds
- `9-api-design.md` — endpoints to monitor and diagnose

**Feeds into:**
- Incident postmortems — diagnostic procedures referenced during incidents
- `18-disaster-recovery.md` — operational procedures for recovery scenarios
- On-call handoff documentation — operational context for new responders

---

## Quality Gate

Before marking this document as `final`, verify:
- [ ] Every active alert in the monitoring system has a corresponding response procedure with exact diagnostic commands
- [ ] All diagnostic commands have been tested against the current production environment and include expected output samples
- [ ] The Quick Reference table covers the top 5-10 symptoms and links to the correct sections
- [ ] Each alert response procedure includes a clear escalation trigger with a specific time threshold and condition
- [ ] The runbook includes a "Last Verified" date and the Change Log reflects the current system state
- [ ] Certificate inventory is complete with expiry dates and rotation procedures are documented
- [ ] Secret inventory is complete and rotation procedures (with zero-downtime path) are documented for each secret type
- [ ] Configuration change procedure is documented with rollback steps
- [ ] Performance profiling procedures are documented for the relevant stack (tools, commands, safe production profiling approach)
- [ ] Multi-region/multi-server considerations are addressed (if applicable): region-specific procedures, distributed debugging, server inventory

## Next Steps

After this document is complete, proceed to:
- **`disaster-recovery-plan`** — define RTO/RPO targets and failover procedures for catastrophic scenarios
- **`slo-error-budget-document`** — formalize reliability targets and error budget policies
- Or invoke `using-engineering-docs` to continue the pipeline
