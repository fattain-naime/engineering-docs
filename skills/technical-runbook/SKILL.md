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
estimated_time: "1-2 hours"
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

### Living Document
A runbook that is not updated when the system changes becomes worse than no runbook (it gives false confidence). Add a "Last Verified" date to each procedure. Put the runbook update in the deployment checklist.

## Application

### Phase 1: Socratic Clarification & Brainstorming (Mandatory Interview)
Before writing any runbook, you MUST interrogate the user's initial input, identify operational unknowns, and ask **3-5 targeted clarifying questions** to dig deeper. Do NOT generate the template yet.
Ask questions to resolve:
1. **Critical Alerts**: What are the most common alerts that trigger for this service?
2. **Monitoring stack**: What log aggregation (ELK, Datadog), dashboarding (Grafana), or APM tools are in use?
3. **Escalation contacts**: Who is the primary engineer on-call, secondary contact, or manager?
4. **Manual operations**: What manual steps (e.g. database restarts, clearing Redis cache) are frequently performed to resolve issues?
*Wait for the user's response to these questions before drafting the final runbook.*

### Phase 2: Document Generation
1. Start with the service overview (what it does, SLA, dependencies).
2. Document every active alert with a response procedure.
3. Walk through the most common failure modes from recent incident history.
4. Write exact diagnostic commands - no vague instructions.
5. Define the escalation path unambiguously.
6. Document routine maintenance procedures.
