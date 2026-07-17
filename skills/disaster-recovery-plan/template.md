---
title: Disaster Recovery & Business Continuity Plan
skill: disaster-recovery-plan
status: draft
owner_reviewed: false
last_updated: 2026-07-17
depends_on: []
supersedes: ""
---

# Disaster Recovery & Business Continuity Plan

**System / Scope:** [System Name]
**Document ID:** DRP-[SYSTEM]-[VERSION]
**Status:** `Draft` | `In Review` | `Approved` | `Outdated`
**Version:** 1.0.0
**Date:** YYYY-MM-DD
**Author(s):** [Name, Role]
**Reviewers:** [Name, Role]
**Plan Owner:** [Name, Role - accountable for keeping this current and running drills]
**Last Drill Date:** YYYY-MM-DD
**Next Scheduled Drill:** YYYY-MM-DD

---

## 1. Executive Summary

> 3-5 sentences: what this plan covers, the worst-case scenarios it addresses, and the headline RTO/RPO commitments. Written for a non-technical audience.

---

## 2. Business Impact Analysis

| System / Component | Criticality Tier | Cost of 1hr Downtime | Cost of Data Loss | Target RTO | Target RPO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [e.g., Payment ledger DB] | `Critical` | [$/impact] | [$/impact - financial data] | [e.g., 30 min] | [e.g., 5 min] |
| [e.g., Admin dashboard] | `Low` | [$/impact] | [$/impact] | [e.g., 4 hours] | [e.g., 24 hours] |

---

## 3. Disaster Recovery Tier Assignment

| System / Component | DR Tier | Strategy | Justification |
| :--- | :--- | :--- | :--- |
| [Payment ledger DB] | `Tier 2 - Warm Standby` | [Replica in secondary region, promoted on failover] | [Matches 30min RTO / 5min RPO target] |

---

## 4. Disaster Scenario Catalog

| Scenario | Detection Method | Declared By | Runsheet Reference |
| :--- | :--- | :--- | :--- |
| Regional/provider outage | [Monitoring alert / provider status page] | [Role - e.g., On-call lead] | Section 8.1 |
| Data corruption / mass deletion | [Alert / anomaly / report] | [Role] | Section 8.2 |
| Ransomware / malicious encryption | [Alert / anomaly] | [Role, escalates to security lead] | Section 8.3 |
| Critical third-party dependency loss | [Provider status / monitoring] | [Role] | Section 8.5 |

---

## 5. Backup Strategy

### 5.1 Backup Inventory

| Data Set | Frequency | Retention | Storage Location(s) | Encrypted? | 3-2-1 Compliant? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [e.g., Production MySQL] | [e.g., Hourly incremental, daily full] | [e.g., 30 days] | [e.g., Primary provider snapshot + off-site object storage in different provider] | `Yes` | `Yes` / `No - gap: <describe>` |

### 5.2 Known Gaps

[List any data set not currently meeting the 3-2-1 rule or target RPO, with a remediation owner and date.]

---

## 6. Recovery Priority Sequence

> Order systems for recovery based on Business Impact Analysis. Dependencies must be recovered before the systems that depend on them.

| Priority | System / Component | RTO | Dependencies (must recover first) | Recovery Owner |
| :--- | :--- | :--- | :--- | :--- |
| `P1 - Immediate` | [e.g., Primary database] | [30 min] | [DNS, VPN, KMS for backup decryption] | [Name] |
| `P1 - Immediate` | [e.g., Authentication service] | [30 min] | [Primary database] | [Name] |
| `P2 - High` | [e.g., Core API] | [1 hour] | [Primary database, Auth service] | [Name] |
| `P2 - High` | [e.g., Queue workers] | [2 hours] | [Primary database, Redis] | [Name] |
| `P3 - Medium` | [e.g., Admin dashboard] | [4 hours] | [Core API] | [Name] |
| `P4 - Low` | [e.g., Dev environment] | [24 hours] | [None - independent] | [Name] |

---

## 7. Cost Modeling

> Present the cost of each DR tier so leadership can make informed decisions about which tier each system warrants.

| System | DR Tier | Monthly Infrastructure Cost | Downtime Cost per Hour | Break-Even (hours/year) | Justification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [Primary database] | `Tier 2 - Warm Standby` | `[$X/month]` | `[$Y/hour]` | `[Z hours]` | [30min RTO required; cost justified by revenue impact] |
| [Admin dashboard] | `Tier 0 - Backup Only` | `[$X/month]` | `[$Y/hour]` | `[Z hours]` | [4hr RTO acceptable; manual restore is sufficient] |
| [Core API] | `Tier 3 - Hot Standby]` | `[$X/month]` | `[$Y/hour]` | `[Z hours]` | [SLA requires <5min RTO; active-active across regions] |

**Cost formula:** Tier N monthly cost / (Downtime cost per hour) = break-even downtime hours per year. If the system is expected to experience more downtime than the break-even point, the higher tier pays for itself.

---

## 8. Failover and Recovery Runsheets

### 8.1 Scenario: Regional / Provider Outage

**Declaration authority:** [Who can declare this a disaster and trigger failover]

| Step | Action | Owner | Est. Time |
| :--- | :--- | :--- | :--- |
| 1 | [Confirm outage via provider status + independent monitoring] | | |
| 2 | [Promote standby / restore from backup to alternate provider] | | |
| 3 | [Redirect DNS/traffic to recovered environment] | | |
| 4 | [Validate data integrity and application health] | | |
| 5 | [Declare recovery complete; begin post-incident review] | | |

### 8.2 Scenario: Data Corruption / Mass Deletion

**Declaration authority:** [Who can declare this a disaster]

| Step | Action | Owner | Est. Time |
| :--- | :--- | :--- | :--- |
| 1 | [Identify scope: which tables/data affected, when did corruption begin] | | |
| 2 | [Stop all write traffic to affected systems (enable maintenance mode if available)] | | |
| 3 | [Identify last known-good backup before corruption] | | |
| 4 | [Restore from backup to isolated environment] | | |
| 5 | [Run data integrity validation (Section 8.6)] | | |
| 6 | [Merge any valid data written after the backup (if feasible)] | | |
| 7 | [Redirect traffic to restored environment] | | |
| 8 | [Declare recovery complete; begin post-incident review] | | |

---

### 8.3 Scenario: Ransomware / Malicious Encryption

**Declaration authority:** [Who can declare this a disaster, escalates to security lead]

| Step | Action | Owner | Est. Time |
| :--- | :--- | :--- | :--- |
| 1 | **ISOLATE:** Immediately disconnect affected systems from the network. Shut down inter-service communication, revoke network access, halt replication from affected to unaffected systems. | | |
| 2 | **ASSESS SCOPE:** Identify all affected systems. Assume compromise may have been present for [N days] before detection. | | |
| 3 | **PRESERVE FORENSICS:** Create disk images of affected systems for forensic analysis before wiping. Store in isolated, write-protected location. | | |
| 4 | **IDENTIFY CLEAN BACKUP:** Find the most recent backup taken BEFORE the estimated compromise date. Do NOT trust any backup taken after the compromise window without verification. | | |
| 5 | **VERIFY BACKUP INTEGRITY:** Run full data integrity validation (Section 8.6) on the clean backup in an isolated environment before connecting to any network. | | |
| 6 | **RESTORE:** Wipe affected systems and restore from the verified-clean backup. Apply all security patches before reconnecting to the network. | | |
| 7 | **VALIDATE:** Run data integrity validation (Section 8.6) and application smoke tests on the restored environment. | | |
| 8 | **HARDEN:** Rotate ALL credentials (passwords, API keys, certificates, encryption keys). Assume all secrets on affected systems were compromised. | | |
| 9 | **RECONNECT:** Reconnect restored systems to the network. Monitor closely for signs of re-infection. | | |
| 10 | **DECLARE RECOVERY:** Declare recovery complete. Begin forensic analysis and post-incident review. | | |

**Ransom payment policy:** [Document organization's policy - typically: do not pay. Decision authority: [Name, Role].]

**Legal / regulatory notification:** [Document required notifications - e.g., law enforcement report, GDPR 72-hour notification, customer notification.]

---

### 8.4 Scenario: Critical Third-Party Dependency Loss

**Declaration authority:** [Who can declare this a disaster]

| Step | Action | Owner | Est. Time |
| :--- | :--- | :--- | :--- |
| 1 | [Confirm outage via provider status page + independent monitoring] | | |
| 2 | [Activate fallback: switch to secondary provider / enable degraded mode / queue requests] | | |
| 3 | [Notify affected customers of degraded functionality] | | |
| 4 | [Monitor provider status for restoration] | | |
| 5 | [When provider recovers: validate data consistency, re-enable full functionality] | | |
| 6 | [Post-incident review: evaluate whether multi-provider strategy is needed] | | |

**Third-party dependency inventory:**

| Dependency | Impact if Down | Fallback Available? | Fallback Procedure | Provider SLA |
| :--- | :--- | :--- | :--- | :--- |
| [Payment processor] | [Payments halt] | `Yes` - [Secondary processor] | [Switch API endpoint + credentials] | [99.99%] |
| [DNS provider] | [All traffic stops] | `Yes` - [Secondary DNS] | [Activate secondary NS records] | [100%] |
| [Email service] | [No transactional emails] | `No` - [Queue for later] | [Queue and retry] | [99.9%] |
| [CDN] | [Static assets slow/failed] | `Partial` - [Origin direct] | [Bypass CDN, serve from origin] | [99.99%] |

---

### 8.5 Scenario: DNS Failover

**Failover trigger:** [Manual decision by: Role / Automatic via health check / Global LB routing]

| Step | Action | Owner | Est. Time |
| :--- | :--- | :--- | :--- |
| 1 | [Confirm primary environment is down via multiple independent checks] | | |
| 2 | [If TTL was pre-lowered: update DNS records to point to failover environment] | | |
| 3 | [If using global LB: verify routing policy has shifted traffic automatically] | | |
| 4 | [If using CDN failover: verify CDN is serving stale content or routing to failover origin] | | |
| 5 | [Verify traffic is flowing to failover environment (monitoring dashboard)] | | |
| 6 | [Run smoke tests against failover environment] | | |
| 7 | [Declare failover complete] | | |

**DNS TTL strategy:** TTL is set to `[N seconds]` for failover-capable records. TTL was last lowered on `[YYYY-MM-DD]` in preparation for `[event/quarterly review]`.

**Global LB configuration:** [Document routing policy: latency-based / health-check-based / weighted. Failover URL: `https://[failover-domain]/health`]

**CDN failover behavior:** [Document: serve stale for N minutes / return 503 / route to failover origin]

---

### 8.6 Data Integrity Validation (Post-Recovery)

> Run these checks after any recovery before declaring recovery complete.

**Row count verification:**
```sql
-- Compare critical table row counts against expected baseline
SELECT table_name, table_rows FROM information_schema.tables
WHERE table_schema = '[database]' ORDER BY table_name;
-- Expected baseline (record from last known-good state):
-- [table_a]: ~[N] rows
-- [table_b]: ~[N] rows
```

**Checksum verification (files/object storage):**
```bash
# Compare restored files against source checksums
sha256sum /var/backups/restored/* | diff - /var/backups/checksums.txt
# Or for S3:
aws s3 ls --recursive s3://[bucket]/ | wc -l  # Compare object count
```

**Referential integrity checks:**
```sql
-- Check for orphaned records (customize per schema)
SELECT COUNT(*) AS orphaned_orders FROM orders
WHERE customer_id NOT IN (SELECT id FROM customers);

SELECT COUNT(*) AS orphaned_items FROM order_items
WHERE order_id NOT IN (SELECT id FROM orders);
-- Expected: 0 for all checks
```

**Application smoke tests:**
```bash
# Run critical user journey tests against restored environment
curl -f https://[restored-domain]/health
# [Additional application-specific smoke tests]
```

**Automated validation script:**
```bash
# [Path to validation script that runs all checks above]
# Run: ./scripts/dr-validation.sh [environment]
# Expected output: all checks PASS
```

---

## 9. Backup Encryption Key Management

> Backup encryption is useless if the keys are stored alongside the encrypted backups.

### 9.1 Key Inventory

| Key ID / Name | Algorithm | Used By | Storage Location | Last Rotated | Rotation Schedule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [key-db-backup-prod] | [AES-256] | [MySQL backup encryption] | [AWS KMS / HashiCorp Vault] | [YYYY-MM-DD] | [Annually] |
| [key-s3-backup] | [AES-256] | [S3 object encryption] | [AWS KMS] | [YYYY-MM-DD] | [Annually] |

### 9.2 Key Access Control

| Key | Access Granted To | Access Method | Emergency Grant Procedure |
| :--- | :--- | :--- | [Contact: Name, Role] |
| [key-db-backup-prod] | [Backup service account, DR lead] | [IAM role / Vault policy] | [Emergency: contact Name with approval from Role] |

### 9.3 Key Backup / Escrow

| Key | KMS Provider | KMS Multi-Region? | Key Escrow Arrangement |
| :--- | :--- | :--- | :--- |
| [key-db-backup-prod] | [AWS KMS] | `Yes` - [us-east-1, us-west-2] | [Sealed envelope in secure location: describe] |

**KMS recovery:** If the KMS itself is unavailable (e.g., regional outage affecting the KMS), the recovery procedure is: [document how to access keys from the secondary region or escrow].

---

## 10. Communication Plan

| Stage | Internal Notification | External / Customer Notification | Owner |
| :--- | :--- | :--- | :--- |
| Disaster declared | [e.g., Immediate page to leadership + eng] | [e.g., Status page update within 15 min] | [Role] |
| Recovery in progress | [e.g., Hourly internal updates] | [e.g., Status page updates every 30 min] | [Role] |
| Recovery complete | [Internal debrief scheduled] | [Customer-facing incident summary] | [Role] |

---

## 11. Drill Log and Validation

| Date | Drill Type | Scenario Tested | Result | Gaps Found | Action Items |
| :--- | :--- | :--- | :--- | :--- | :--- |
| YYYY-MM-DD | `Tabletop` / `Live Restore` | [Scenario] | `Pass` / `Fail` | [Gap description] | [Owner, deadline] |

> A plan with no drill log entries is unverified. Schedule the first drill before marking this document `Approved`.

### 11.2 Tabletop Exercise Template

> Use this template for quarterly tabletop exercises. Walk through the scenario step by step with the team.

**Exercise Date:** YYYY-MM-DD
**Scenario:** [Describe the disaster scenario - be specific]
**Participants:** [Names, Roles]
**Facilitator:** [Name]

**Scenario walkthrough:**

| Step | Plan Section | Question | Team Response | Gap Found? |
| :--- | :--- | :--- | :--- | :--- |
| 1 | [Section X] | [How do we detect this scenario?] | [Team answer] | `Yes` / `No` |
| 2 | [Section X] | [Who declares the disaster?] | [Team answer] | `Yes` / `No` |
| 3 | [Section X] | [What is the first action?] | [Team answer] | `Yes` / `No` |
| 4 | [Section X] | [How long does this step take?] | [Team answer] | `Yes` / `No` |
| 5 | [Section X] | [What could go wrong at this step?] | [Team answer] | `Yes` / `No` |
| 6 | [Section X] | [How do we know recovery is complete?] | [Team answer] | `Yes` / `No` |

**Exercise outcome:** `Pass` / `Fail` / `Partial`
**Gaps identified:** [List all gaps]
**Action items:** [Owner, deadline for each gap]

---

## 12. Compliance Mapping (if applicable)

| Requirement | Standard | How This Plan Satisfies It |
| :--- | :--- | :--- |
| [e.g., Documented recovery procedures] | [PCI-DSS Req. 12.10] | [Reference to Section 6] |
| [e.g., Annual BCP test] | [SOC 2 CC7.x / ISO 22301] | [Reference to Section 8 drill cadence] |
