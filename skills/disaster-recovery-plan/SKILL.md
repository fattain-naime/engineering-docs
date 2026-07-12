---
name: disaster-recovery-plan
argument-hint: "[system or service name]"
description: Write a disaster recovery and business continuity plan defining RTO/RPO targets, backup and failover procedures, DR tiers, and a recovery drill cadence for surviving major infrastructure loss, data corruption, ransomware, or regional outages. Use before launch of any system holding critical or financial data, or to formalize continuity commitments for compliance (PCI-DSS, SOC 2, ISO 22301).
intent: >-
  Produce a disaster recovery plan that answers the question a runbook and a deployment plan deliberately do not: what happens when the primary infrastructure itself is gone - a region is down, a database is corrupted, a backup was never actually tested, or an attacker has encrypted production data. A runbook assumes the system is mostly intact and a known alert has fired; a DR plan assumes the worst case and defines, in dollars and hours, how much data loss and downtime the business has decided is survivable, then works backward to the backup, replication, and failover architecture required to hit that number. Untested backups are not a recovery plan - this skill treats the recovery drill as the artifact's real test of validity, not the document itself.
type: workflow
theme: engineering-docs
best_for:
  - "Formalizing recovery commitments before launching a system that holds financial, payment, or otherwise critical data"
  - "Satisfying compliance or audit requirements that mandate documented business continuity (PCI-DSS, SOC 2, ISO 22301)"
  - "Assessing whether current backup and infrastructure topology can actually meet the business's downtime and data-loss tolerance"
  - "Planning and scheduling regular disaster recovery drills / game days"
scenarios:
  - "Write a disaster recovery plan in case our primary hosting provider has a regional outage"
  - "Define RTO and RPO targets for our payment ledger database and the backup strategy needed to hit them"
  - "We've never actually tested restoring from backup - help me build a DR plan and drill schedule that fixes that"
estimated_time: "2-4 hours"
license: MIT
compatibility: Designed for Gemini (Antigravity), Claude Code, Cursor/Windsurf, Kimi Code, Codex/Copilot
---

## Purpose

Produce a disaster recovery (DR) and business continuity plan that defines, per system, how much downtime (RTO) and data loss (RPO) is tolerable, and the concrete backup, replication, and failover procedure required to stay within those limits when the primary environment is lost entirely.

**A backup that has never been restored is not a backup - it is an unverified assumption.** This skill treats the recovery drill, not the document, as the real proof the plan works.

## Input

**Works best with:** The name of the system or service, and what infrastructure it currently runs on.
**Also valuable:** Current backup tooling and frequency, any prior outage or data-loss history, compliance obligations (PCI-DSS, SOC 2), and the business cost of downtime or data loss for this system.

**Example invocation:** `Write a DR plan for our production system. We run on a single VPS with MySQL, daily automated backups to object storage, no secondary region, and no replica database. Extended downtime and data loss are both expensive for us, but we've never tested a full restore.`

## Key Concepts

### RTO vs RPO
- **RTO (Recovery Time Objective):** The maximum acceptable time the system can be down before the business impact becomes unacceptable. Answers "how long can we be down?"
- **RPO (Recovery Point Objective):** The maximum acceptable amount of data loss, measured in time. Answers "how much data can we afford to lose?" An RPO of 1 hour means backups/replication must run at least hourly.
- These are business decisions with a cost curve attached - lower RTO/RPO requires more expensive infrastructure (replicas, multi-region, continuous backup).

### DR Tiers (Cost vs. Recovery Speed Trade-off)
| Tier | Strategy | Typical RTO | Typical RPO | Cost |
| :--- | :--- | :--- | :--- | :--- |
| Tier 0 | Backup only, manual restore | Hours to days | Hours (backup interval) | Lowest |
| Tier 1 | Backup + documented restore procedure, tested | Hours | Backup interval | Low |
| Tier 2 | Warm standby (replica, not serving traffic) | Minutes to 1 hour | Near-zero to minutes | Medium |
| Tier 3 | Hot standby / active-active (multi-region) | Seconds to minutes | Near-zero | High |

Do not default to the highest tier for every system - map each system's actual business criticality to the cheapest tier that meets its RTO/RPO.

### The 3-2-1 Backup Rule
Keep **3** copies of data, on **2** different media/storage types, with **1** copy off-site (different provider or region than production). A single provider's snapshot feature alone does not satisfy this - a provider-wide outage or account compromise takes the snapshot with it.

### Disaster Scenario Catalog
A DR plan must name specific scenarios, not just "something bad happens":
- Regional/provider-wide infrastructure outage
- Data corruption or accidental mass deletion (human error)
- Ransomware / malicious encryption of production data
- Loss of a critical third-party dependency (payment processor, DNS, CDN)
- Total loss of the primary database with backups present but unverified

### Drills Are the Real Test
A DR plan is a hypothesis until it has been drilled. Schedule recovery drills (tabletop exercises at minimum, live restores ideally) on a fixed cadence, and treat any drill failure as more urgent than the document itself.

## Application

### Phase 1: Socratic Clarification & Brainstorming (Mandatory Interview)
Before writing any DR plan, you MUST interrogate the user's initial input, identify gaps, and ask **3-5 targeted clarifying questions** to dig deeper. Do NOT generate the template yet.
Ask questions to resolve:
1. **Current infrastructure topology**: Is this single-server, single-region? Any existing replicas, secondary regions, or standby capacity?
2. **Backup reality check**: What is actually backed up today, how often, where is it stored, and has a full restore ever been tested?
3. **Business tolerance**: In concrete terms, how many hours of downtime and how much data loss would be damaging but survivable versus catastrophic?
4. **Compliance drivers**: Are there regulatory or contractual requirements (PCI-DSS, SOC 2, customer contracts) mandating specific recovery commitments?
*Wait for the user's response to these questions before drafting the final DR plan.*

### Phase 2: Business Impact Analysis (30-45 min)
Identify every critical system/component and classify its criticality tier. For each, state the cost of downtime and of data loss in concrete terms (revenue, compliance exposure, trust).

### Phase 3: RTO/RPO Target Setting (20 min)
Set explicit RTO/RPO per system, driven by the business impact analysis - not by what current infrastructure happens to already provide.

### Phase 4: Backup and Replication Strategy (30-45 min)
Design the concrete backup/replication architecture required to hit each RPO. Apply the 3-2-1 rule. Specify retention periods and encryption of backups at rest.

### Phase 5: Failover and Recovery Procedures (45-60 min)
Write the exact, numbered runsheet for each disaster scenario: detection, decision authority to declare a disaster, failover/restore steps, and validation that recovery is complete and correct.

### Phase 6: Communication Plan (15 min)
Define who is notified internally and externally (customers, regulators if required) at each stage of a declared disaster, and who owns that communication.

### Phase 7: Drill Schedule and Validation (15 min)
Set a recurring cadence for tabletop exercises and live restore tests. Every drill result - pass or fail - gets logged and any gap found becomes an action item with an owner and deadline.
