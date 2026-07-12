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
| Regional/provider outage | [Monitoring alert / provider status page] | [Role - e.g., On-call lead] | Section 6.1 |
| Data corruption / mass deletion | [Alert / anomaly / report] | [Role] | Section 6.2 |
| Ransomware / malicious encryption | [Alert / anomaly] | [Role, escalates to security lead] | Section 6.3 |
| Critical third-party dependency loss | [Provider status / monitoring] | [Role] | Section 6.4 |

---

## 5. Backup Strategy

### 5.1 Backup Inventory

| Data Set | Frequency | Retention | Storage Location(s) | Encrypted? | 3-2-1 Compliant? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [e.g., Production MySQL] | [e.g., Hourly incremental, daily full] | [e.g., 30 days] | [e.g., Primary provider snapshot + off-site object storage in different provider] | `Yes` | `Yes` / `No - gap: <describe>` |

### 5.2 Known Gaps

[List any data set not currently meeting the 3-2-1 rule or target RPO, with a remediation owner and date.]

---

## 6. Failover and Recovery Runsheets

### 6.1 Scenario: Regional / Provider Outage

**Declaration authority:** [Who can declare this a disaster and trigger failover]

| Step | Action | Owner | Est. Time |
| :--- | :--- | :--- | :--- |
| 1 | [Confirm outage via provider status + independent monitoring] | | |
| 2 | [Promote standby / restore from backup to alternate provider] | | |
| 3 | [Redirect DNS/traffic to recovered environment] | | |
| 4 | [Validate data integrity and application health] | | |
| 5 | [Declare recovery complete; begin post-incident review] | | |

*(Repeat this runsheet structure for each scenario in Section 4.)*

---

## 7. Communication Plan

| Stage | Internal Notification | External / Customer Notification | Owner |
| :--- | :--- | :--- | :--- |
| Disaster declared | [e.g., Immediate page to leadership + eng] | [e.g., Status page update within 15 min] | [Role] |
| Recovery in progress | [e.g., Hourly internal updates] | [e.g., Status page updates every 30 min] | [Role] |
| Recovery complete | [Internal debrief scheduled] | [Customer-facing incident summary] | [Role] |

---

## 8. Drill Log and Validation

| Date | Drill Type | Scenario Tested | Result | Gaps Found | Action Items |
| :--- | :--- | :--- | :--- | :--- | :--- |
| YYYY-MM-DD | `Tabletop` / `Live Restore` | [Scenario] | `Pass` / `Fail` | [Gap description] | [Owner, deadline] |

> A plan with no drill log entries is unverified. Schedule the first drill before marking this document `Approved`.

---

## 9. Compliance Mapping (if applicable)

| Requirement | Standard | How This Plan Satisfies It |
| :--- | :--- | :--- |
| [e.g., Documented recovery procedures] | [PCI-DSS Req. 12.10] | [Reference to Section 6] |
| [e.g., Annual BCP test] | [SOC 2 CC7.x / ISO 22301] | [Reference to Section 8 drill cadence] |
