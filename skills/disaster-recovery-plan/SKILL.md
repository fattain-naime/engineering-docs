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

### Ransomware-Specific Recovery

Ransomware is a distinct disaster scenario that requires specialized procedures beyond generic data corruption recovery:
- **Assume compromise scope is unknown:** Ransomware may have been present in the environment for days or weeks before detection. Backups taken during the compromise window may also be encrypted or contain dormant malware. Do not trust any backup taken after the estimated compromise date without verification.
- **Isolation first:** Before attempting recovery, isolate affected systems from the network to prevent lateral spread. This means shutting down inter-service communication, revoking network access, and potentially shutting down replication from affected systems to unaffected ones.
- **Recovery order:** Restore from the most recent verified-clean backup. Verify the backup's integrity before connecting restored systems to the network (see Data Integrity Validation below).
- **Forensic preservation:** Preserve a copy of the encrypted/affected systems for forensic analysis before wiping and restoring. This aids in understanding the attack vector and preventing recurrence.
- **Ransom payment decision:** Document the organization's policy on ransom payment (typically: do not pay, as it funds criminal operations and does not guarantee decryption). If the policy allows consideration, document the decision authority and process.
- **Communication:** Ransomware incidents often involve legal, regulatory, and law enforcement notification requirements. Reference the communication plan and compliance obligations.

### Data Integrity Validation After Recovery

After any recovery (backup restore, failover, data migration), validate data integrity before declaring recovery complete:
- **Row count verification:** Compare row counts of critical tables between the restored database and the expected counts (from a known-good baseline or the last verified backup).
  ```sql
  SELECT table_name, table_rows FROM information_schema.tables
  WHERE table_schema = '[database]' ORDER BY table_name;
  ```
- **Checksum verification:** For files and object storage, verify checksums of restored artifacts against the source.
  ```bash
  # Compare checksums of restored files
  sha256sum /var/backups/restored/* | diff - /var/backups/checksums.txt
  ```
- **Referential integrity:** Run referential integrity checks on the restored database to detect orphaned records or broken foreign keys.
  ```sql
  -- Example: check for orphaned records
  SELECT COUNT(*) FROM orders WHERE customer_id NOT IN (SELECT id FROM customers);
  ```
- **Application-level smoke tests:** Run a suite of critical user journey tests against the restored environment to verify functional correctness, not just data presence.
- **Automated validation script:** Maintain a script that runs all validation checks automatically and produces a pass/fail report. Do not rely on manual spot-checks.

### Cost Modeling Per DR Tier

Every DR tier has a cost. Document the cost so leadership can make informed decisions about which tier each system warrants:
- **Tier 0 (Backup only):** Storage costs + engineer time for manual restore. Low ongoing cost, high recovery-time cost.
- **Tier 1 (Backup + tested restore):** Same as Tier 0 + periodic drill time. Marginally higher, but significantly more reliable.
- **Tier 2 (Warm standby):** Standby infrastructure running 24/7 but not serving traffic. Costs 30-70% of production infrastructure.
- **Tier 3 (Hot standby / active-active):** Full duplicate infrastructure in multiple regions. Costs 100-200% of single-region production.
- **Present the cost as a function of downtime cost:** "Tier 2 costs $X/month and provides 30-minute RTO. Tier 0 costs $Y/month but has a 4-hour RTO. If 1 hour of downtime costs $Z, Tier 2 pays for itself after [N] hours of avoided downtime per year."

### Recovery Priority Ordering

Not all systems recover simultaneously. Use the Business Impact Analysis (BIA) to define recovery priority:
- **Priority 1 (recover first):** Systems whose RTO is measured in minutes. Typically: primary database, authentication, core API.
- **Priority 2 (recover second):** Systems whose RTO is measured in hours. Typically: secondary services, internal tools, dashboards.
- **Priority 3 (recover last):** Systems whose RTO is measured in days. Typically: development environments, non-critical internal tools.
- **Document the dependency graph:** Priority 1 systems may depend on infrastructure (DNS, VPN, secrets manager) that must be recovered even earlier. Map these dependencies explicitly.

### DNS Failover and Traffic Routing

DNS and traffic routing are the first step in any failover. Document:
- **DNS TTL strategy:** Keep TTL low (60-300 seconds) for records that may need to be changed during a failover. High TTL (1 hour+) means users will continue hitting the failed environment for up to the TTL duration after the DNS change.
- **Global load balancer:** If using a global load balancer (AWS Global Accelerator, Cloudflare Load Balancer, Azure Traffic Manager), document the failover trigger and routing policy (latency-based, health-check-based, weighted).
- **CDN failover:** If the CDN is the edge, what happens when the origin is down? Does the CDN serve stale content, or does it return errors? Document the CDN failover behavior.
- **Pre-configured failover DNS:** Maintain pre-configured DNS records (e.g., failover.example.com) that can be activated quickly without editing zone files during an incident.

### Backup Encryption Key Management

Backup encryption is useless if the encryption keys are stored alongside the encrypted backups:
- **Key storage:** Encryption keys must be stored separately from the encrypted backups - ideally in a dedicated key management system (AWS KMS, HashiCorp Vault, Azure Key Vault).
- **Key rotation:** Document the key rotation schedule and the procedure for re-encrypting backups with new keys.
- **Key access control:** Who has access to the encryption keys? Limit to the minimum necessary personnel. Document the access grant procedure for emergency recovery.
- **Key backup:** The key management system itself must be recoverable. If the KMS is in the same region as the backups and that region is lost, the backups are inaccessible. Document the KMS backup/replication strategy.
- **Key escrow:** For extreme scenarios (loss of all personnel with key access), document the key escrow arrangement (e.g., sealed envelope in a secure location, hardware security module with split knowledge).

### Third-Party Dependency DR

Your DR plan is incomplete if it does not address the loss of critical third-party services:
- **Dependency inventory:** List every third-party service the system depends on (payment processor, DNS provider, CDN, email service, authentication provider, cloud provider).
- **Impact assessment:** For each dependency, document the impact if it is unavailable (full outage, degraded functionality, workarounds available).
- **Fallback procedures:** What can the system do if the dependency is down? Options: graceful degradation (queue requests for later), fallback provider (secondary payment processor), manual workaround (process payments manually).
- **Provider DR documentation:** Request and review each critical provider's own DR plan. Do they have multi-region failover? What is their SLA? What is their track record?
- **Multi-provider strategy:** For the most critical dependencies, consider a multi-provider strategy (e.g., two DNS providers, two payment processors) even if it adds complexity.

### Tabletop Exercise Template

A tabletop exercise is a structured walkthrough of a disaster scenario without actually performing recovery steps. It tests the plan's completeness and the team's understanding:
- **Frequency:** Quarterly at minimum. After any significant infrastructure change or team turnover.
- **Participants:** On-call engineers, service owners, leadership (for communication plan validation).
- **Format:** Present a scenario. Walk through the plan step by step. At each step, ask: "What do we do? Who does it? How long does it take? What could go wrong?"
- **Scenario examples:**
  - "Our primary AWS region (us-east-1) is completely unreachable. We have a warm standby in us-west-2. Walk through the failover."
  - "A ransomware attack has encrypted our production database. Our most recent backup is 6 hours old. Walk through the recovery."
  - "Our primary payment processor has a multi-hour outage. We have a secondary processor configured but never used in production. Walk through the switch."
- **Recording outcomes:** Document every gap, question, and uncertainty raised during the exercise. Each becomes an action item with an owner and deadline.

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
1. **Backup reality check**: What is actually backed up today, how often, where is it stored, and has a full restore ever been tested?
2. **Business tolerance**: In concrete terms, how many hours of downtime and how much data loss would be damaging but survivable versus catastrophic?

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

### Phase 8: Revision (After User Review)

If the user requests changes after reviewing the document:

1. **Read the user's feedback carefully** — understand what they want changed
2. **Check for conflicts** — does the requested change conflict with prior documents (e.g., SLO targets, deployment plan)?
3. **Apply changes** — update the DR plan
4. **Re-run consistency check** — verify the change doesn't break cross-document consistency (e.g., RTO/RPO targets still match SLO commitments)
5. **Update metadata** — set `last_updated` to today's date
6. **Confirm with user** — show the changes and get approval

## Gotchas

- **Treating an untested backup as a recovery plan.** A backup that has never been restored is an unverified assumption, not a plan. If you cannot prove a full restore works by running one, your RPO target is theoretical. Schedule a live restore drill before marking the plan approved.
- **Setting RTO/RPO targets based on current infrastructure instead of business need.** The question is not "what can our infrastructure do?" but "how much downtime and data loss can the business survive?" Work backward from business impact to infrastructure requirements, not the other way around.
- **Storing all backups with a single provider.** Provider-wide outages, account compromises, or billing disputes can make all your snapshots inaccessible simultaneously. The 3-2-1 rule requires at least one copy with a different provider or on different media.
- **Defining disaster scenarios too vaguely.** "Something bad happens" is not a scenario. Name specific threats: regional outage, ransomware, data corruption, third-party dependency loss. Each scenario needs its own detection method, declaration authority, and recovery runsheet.
- **Writing a DR plan and never revisiting it.** A DR plan is a living document. Infrastructure changes, new services, and team turnover all invalidate assumptions. Review and update the plan at least quarterly, and after every significant infrastructure change or drill failure.

## Handoff

**Reads from:**
- `1-business-plan.md` — business impact of downtime, revenue exposure
- `7-system-architecture.md` — infrastructure topology, single points of failure
- `16-deployment-plan.md` — current deployment and rollback procedures
- `19-slo-error-budget.md` — RTO/RPO alignment with SLO commitments

**Feeds into:**
- `17-technical-runbook.md` — recovery procedures referenced during incidents
- Compliance documentation (PCI-DSS, SOC 2, ISO 22301)
- Incident postmortems — DR gaps discovered during incidents

---

## Quality Gate

Before marking this document as `final`, verify:
- [ ] Every critical system has explicit RTO and RPO targets derived from business impact analysis, not from current infrastructure capability
- [ ] The backup strategy for each system satisfies the 3-2-1 rule (3 copies, 2 media types, 1 off-site with a different provider)
- [ ] Every disaster scenario in the catalog has a corresponding recovery runsheet with numbered steps, owners, and estimated times
- [ ] At least one recovery drill (tabletop or live restore) is scheduled before the plan is marked `Approved`, and the drill log table exists
- [ ] The communication plan defines internal and external notification responsibilities at each stage: declaration, recovery in progress, and recovery complete
- [ ] Ransomware-specific recovery procedures are documented, including isolation steps, forensic preservation, and recovery-from-clean-backup verification
- [ ] Data integrity validation procedures (row counts, checksums, referential integrity, application smoke tests) are documented for post-recovery verification
- [ ] Cost modeling is presented per DR tier, showing the cost/downtime trade-off
- [ ] Recovery priority ordering is defined based on BIA, with dependency mapping
- [ ] DNS failover strategy is documented (TTL, global LB routing, CDN failover behavior)
- [ ] Backup encryption key management is documented (storage, rotation, access control, KMS backup/escrow)
- [ ] Third-party dependency DR is addressed (inventory, impact, fallback, provider DR review)

## Next Steps

After this document is complete, proceed to:
- **`slo-error-budget-document`** — formalize reliability targets and error budget policies that inform DR priorities
- Schedule and execute the first recovery drill defined in this plan
- Or invoke `using-engineering-docs` to continue the pipeline
