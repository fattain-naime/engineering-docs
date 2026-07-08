# Incident Post-Mortem

**Incident ID:** INC-[YYYYMMDD]-[NNN]
**Incident Title:** [Short, descriptive title - e.g., "Payment Gateway 22-Minute Outage Due to DB Connection Exhaustion"]
**Severity:** `SEV-1` | `SEV-2` | `SEV-3` | `SEV-4`
**Status:** `Draft` | `In Review` | `Final`
**Date of Incident:** YYYY-MM-DD
**Duration:** [N hours N minutes]
**Post-Mortem Date:** YYYY-MM-DD
**Post-Mortem Author(s):** [Name, Role]
**Incident Commander:** [Name]
**Reviewers:** [Name, Role]
**Review Meeting:** YYYY-MM-DD HH:MM [Timezone]

---

> **Blamelessness Statement**
> This post-mortem is written in the spirit of blameless culture. Incidents are caused by systemic failures. The purpose of this document is to identify and fix those systems, not to assign blame to individuals. All participants are expected to read and contribute honestly.

---

## 1. Executive Summary

> 3-5 sentences. What happened, when, how long, what was the impact, what fixed it. Written for a non-technical audience. Should be the only section a senior executive needs to read.

[Executive summary]

---

## 2. Impact Assessment

### 2.1 User Impact

| Metric | Value |
| :--- | :--- |
| Duration of user impact | [N hours N minutes] (HH:MM to HH:MM [TZ]) |
| % of users affected | [N%] |
| Features / services affected | [List] |
| Geographic scope | [All regions / Specific regions] |

### 2.2 Business Impact

| Metric | Value |
| :--- | :--- |
| Transactions failed | [N transactions] |
| Estimated revenue impact | [$X] (estimated) |
| SLA violated | `Yes` / `No` — [Which SLA, by how much] |
| Customer complaints received | [N] |
| Support tickets opened | [N] |

### 2.3 Service Health During Incident

| Metric | Baseline (normal) | At Peak Impact | Timestamp of Peak |
| :--- | :--- | :--- | :--- |
| HTTP 5xx rate | `< 0.1%` | `[N%]` | HH:MM |
| p99 API latency | `< 200ms` | `[Nms]` | HH:MM |
| [Business metric - e.g., Payment success rate] | `> 98%` | `[N%]` | HH:MM |

---

## 3. Timeline

> Precise timestamps are critical. Every event must have a time. Use UTC unless stated otherwise.

| Time (UTC) | Event | Who |
| :--- | :--- | :--- |
| HH:MM | [First symptom - e.g., Automated alert fired: `high_error_rate` 2.3%] | PagerDuty |
| HH:MM | [On-call engineer paged and acknowledged] | [Name] |
| HH:MM | [First action taken - e.g., Checked error tracking dashboard; saw spike in `PDOException: too many connections`] | [Name] |
| HH:MM | [Hypothesis formed - e.g., Suspected DB connection exhaustion] | [Name] |
| HH:MM | [Diagnosis confirmed - e.g., `SHOW PROCESSLIST` confirmed 500/500 connections in use] | [Name] |
| HH:MM | [Mitigation applied - e.g., Restarted PHP-FPM to release held connections] | [Name] |
| HH:MM | [Partial recovery - e.g., Error rate dropped from 8% to 2%] | Monitoring |
| HH:MM | [Root cause identified - e.g., Identified slow query in v2.3.0 deployment] | [Name] |
| HH:MM | [Permanent fix applied - e.g., Rolled back to v2.2.1] | [Name] |
| HH:MM | [Full recovery - e.g., Error rate returned to < 0.1%] | Monitoring |
| HH:MM | [All-clear declared] | [Name] |
| HH:MM | [Incident closed] | [Name] |

**Total time from first alert to all-clear:** [N hours N minutes]
**Time to first mitigation:** [N minutes]
**Time from first mitigation to full recovery:** [N minutes]

---

## 4. Root Cause Analysis

### 4.1 Proximate Cause (What Broke)

> The immediate, technical cause. This is the first "Why."

[The proximate cause - e.g., "Database connection pool was exhausted because a slow query introduced in v2.3.0 held connections for 30+ seconds each, consuming all available connections within 2 hours of deployment."]

### 4.2 Five Whys Analysis

> Dig through the proximate cause to find systemic failures. Stop when you reach an actionable root cause.

| # | Why? | Finding |
| :--- | :--- | :--- |
| Why 1 | Why did the service return 500 errors? | Database connection pool was exhausted (100% of connections in use) |
| Why 2 | Why was the connection pool exhausted? | A query in the v2.3.0 payment report feature executed without a proper index, causing a full table scan lasting 30+ seconds on a 5M-row table |
| Why 3 | Why was this query deployed without detecting the performance issue? | The feature had no load test. Integration tests used a 10-row test database that did not expose the O(n) scan behavior |
| Why 4 | Why did monitoring not alert before the pool was fully exhausted? | We had no alert on DB connection count. The only DB alert was for query errors, not slow queries |
| Why 5 | Why did the slow query not appear in staging? | Staging uses a database with 1,000 rows versus production's 5,000,000 rows. No data-volume parity between environments |

### 4.3 Root Causes (Systemic Failures)

> These are the actionable root causes that action items must address. There should be 3-5.

| # | Root Cause | Type |
| :--- | :--- | :--- |
| RC-1 | No database performance testing / query profiling in CI pipeline | Testing gap |
| RC-2 | No alert on DB connection pool utilization (only alerted on full exhaustion) | Observability gap |
| RC-3 | Staging database has < 0.1% of production data volume, masking performance regressions | Environment parity gap |
| RC-4 | No deployment gate checking for slow queries using `EXPLAIN ANALYZE` | Deployment control gap |

### 4.4 What Went Well

> Document what worked. This reinforces good practices and builds morale.

- [e.g., On-call engineer was paged and acknowledged within 3 minutes of alert firing]
- [e.g., Rollback procedure executed correctly and reduced error rate within 5 minutes]
- [e.g., Clear incident channel communication prevented redundant parallel debugging]
- [e.g., Database backup verified before any risky mitigation steps were taken]

### 4.5 What Went Poorly

> Document the systemic failures honestly.

- [e.g., Incident was not detected until 2 hours after the bad deployment, when the pool was 100% exhausted]
- [e.g., Root cause identification took 25 minutes because there were no slow query logs enabled]
- [e.g., Staging environment did not reflect production data volume, making the performance test useless]

---

## 5. Action Items

> **Each action item must have:** a specific description, an owner (a named person, not a team), a deadline, and a measurable success criterion.
>
> Vague action items like "improve testing" are not acceptable. "Add a slow-query detection step to CI that rejects any query with EXPLAIN rows > 100K by YYYY-MM-DD, owned by [Name]" is acceptable.

| ID | Action Item | Type | Owner | Due Date | Success Criterion | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| AI-001 | Add DB connection utilization alert: page at 80% of `max_connections` sustained for 3 min | Monitoring | [Name] | YYYY-MM-DD | Alert fires in staging test at 80% connection load | `Open` |
| AI-002 | Enable MySQL slow query log (> 1s threshold) in production; route to monitoring | Observability | [Name] | YYYY-MM-DD | Slow queries visible in Grafana within 1 min of occurrence | `Open` |
| AI-003 | Seed staging database with representative data volume: minimum 10% of production row counts for hot tables | Environment | [Name] | YYYY-MM-DD | Staging DB contains ≥ 500K rows in `[table_name]` | `Open` |
| AI-004 | Add `EXPLAIN ANALYZE` query validation step to CI pipeline: fail build if any new query has `rows_examined` > 100K | CI/CD | [Name] | YYYY-MM-DD | CI fails on a test query with missing index | `Open` |
| AI-005 | Add load test for [feature that caused incident]: simulate 1K concurrent users in CI | Testing | [Name] | YYYY-MM-DD | Load test runs in CI and passes at p99 < 200ms | `Open` |

---

## 6. Lessons Learned

> Distill the most important learnings for the team. These inform future design reviews, code reviews, and on-call training.

1. **[Lesson 1]:** [e.g., "Staging data volume must be representative of production for any performance-related feature. A 10-row staging DB will never reveal a query that is O(n) in table size."]

2. **[Lesson 2]:** [e.g., "Alert on approach to limits, not on limit breach. An alert at 80% connection pool utilization gives 20 minutes to act; an alert at 100% means we are already in an outage."]

3. **[Lesson 3]:** [e.g., "The slow query log is the first tool to reach for in any DB-related incident. Enabling it permanently with a 1-second threshold has near-zero performance overhead and high diagnostic value."]

---

## 7. Communication Log

> Track all external communications made during the incident.

| Time | Audience | Channel | Message Summary | Sent By |
| :--- | :--- | :--- | :--- | :--- |
| HH:MM | All engineers | `#incidents` Slack | Incident declared for elevated error rate | [Name] |
| HH:MM | Affected merchants | Status page | "We are investigating elevated error rates affecting payment processing" | [Name] |
| HH:MM | Leadership | Email | "Payment processing SEV-2 incident - 8% failure rate. Investigating." | [Name] |
| HH:MM | All engineers | `#incidents` Slack | Incident resolved. Rollback complete. | [Name] |
| HH:MM | Affected merchants | Status page | "Payment processing restored. All-clear." | [Name] |

---

## 8. Appendix

### 8.1 Relevant Monitoring Screenshots

> Attach or link to monitoring graphs showing the incident signature.

- [Link to error rate graph during incident]
- [Link to DB connection count graph during incident]

### 8.2 Relevant Log Excerpts

```
[HH:MM:SS] CRITICAL: PDOException: SQLSTATE[HY000]: too many connections in /var/www/...
[HH:MM:SS] ERROR: Maximum connection count 500 reached
```

### 8.3 Related Incidents

| Incident ID | Date | Description | Relationship |
| :--- | :--- | :--- | :--- |
| INC-YYYYMMDD-NNN | YYYY-MM-DD | [Similar incident] | Same root cause / Similar pattern |
