# Deployment Plan

**Release:** [Service Name] v[X.Y.Z]
**Document ID:** DEP-[IDENTIFIER]-[DATE]
**Status:** `Draft` | `Approved` | `Executing` | `Complete` | `Rolled Back`
**Deployment Date:** YYYY-MM-DD
**Deployment Window:** HH:MM - HH:MM [Timezone]
**Deployment Lead:** [Name]
**On-call Backup:** [Name]
**Approver:** [Name, Role]

---

## 1. Release Summary

### 1.1 What Is Being Deployed

| Item | Type | Description | Risk |
| :--- | :--- | :--- | :--- |
| [Change 1] | `Code` / `DB Migration` / `Config` / `Infra` | [Brief description] | `Low` / `Med` / `High` |
| [Change 2] | | | |

### 1.2 Motivation

[Why is this release going out? Link to tickets, incidents, or milestones it addresses.]

### 1.3 Risk Assessment

**Overall Risk:** `Low` | `Medium` | `High` | `Critical`

| Risk Factor | Assessment | Mitigation |
| :--- | :--- | :--- |
| Database migrations | `None` / `Additive` / `Destructive` | [If destructive: backup taken at step X, tested on staging] |
| External dependencies | [None / List dependencies] | [Dependency risk mitigation] |
| Traffic impact | [Low: off-peak] / [Medium: peak hours] | [Deployment window avoids peak by X hours] |
| Rollback complexity | `Simple` / `Moderate` / `Complex` | [Rollback procedure at Section 7] |

---

## 2. Deployment Strategy

**Strategy:** `Direct Deploy` | `Rolling` | `Blue-Green` | `Canary` | `Feature Flag`

### Rationale

[Why this strategy was chosen for this release]

### Strategy Diagram

```mermaid
graph LR
  subgraph "Before"
    LB1[Load Balancer] --> S1[Server v1.0]
    LB1 --> S2[Server v1.0]
  end
  subgraph "After (Blue-Green)"
    LB2[Load Balancer] --> S3[Server v2.0]
    LB2 --> S4[Server v2.0]
    S1_OLD[Server v1.0 - standby]
    S2_OLD[Server v1.0 - standby]
  end
```

---

## 3. Prerequisites and Go/No-Go Checklist

> **ALL items must be checked before deployment begins.** If any item cannot be verified, deployment is blocked.

### Pre-Deployment Verification

- [ ] Release has been code-reviewed and approved by at least one senior engineer
- [ ] All automated tests pass on the release branch (CI green)
- [ ] Release has been deployed to staging and smoke-tested (date: YYYY-MM-DD, tester: [Name])
- [ ] Database backup verified: taken at [time] on YYYY-MM-DD, confirmed restorable
- [ ] Deployment runbook reviewed by deployment lead and backup
- [ ] Rollback procedure reviewed and tested on staging
- [ ] On-call engineer confirmed available and briefed for the deployment window
- [ ] Monitoring dashboards confirmed accessible
- [ ] Customer / external communications sent (if applicable): [Y/N]
- [ ] Feature flags created and set to `OFF` for any features using flag-based release: [List flags]
- [ ] [Environment-specific prerequisite]

### Go/No-Go Decision

**Deployment proceeds ONLY if all items above are checked.**

| Decision | Authorized By | Time |
| :--- | :--- | :--- |
| `GO` / `NO-GO` | [Deployment Lead name] | HH:MM |

---

## 4. Environment Specifications

### Production Environment

| Component | Spec | Count |
| :--- | :--- | :--- |
| Web servers | [OS, PHP version, Nginx version] | [N] |
| Database | [MySQL version, instance type] | [1 primary + N replicas] |
| Cache / Queue | [Redis version] | [N] |
| Load balancer | [Type] | [N] |

### Deployment Pipeline

```
[Git Tag / Release] → [CI/CD build + test] → [Artifact staging] → [Deploy to production] → [Smoke test] → [Done]
```

**CI/CD System:** [GitHub Actions / Jenkins / GitLab CI / Manual]
**Deployment Tool:** [Deployer / Capistrano / kubectl / Ansible / Custom script]

---

## 5. Execution Runsheet

> Step-by-step execution. Each step must be completed and confirmed before the next begins. Check each box as you execute.

### 5.1 Pre-Deployment (T-30 minutes)

- [ ] **5.1.1** Confirm deployment window: notify `#engineering-ops` channel: "Beginning deployment of [Release] at [time]"
- [ ] **5.1.2** Confirm production is healthy: check monitoring dashboard. Current error rate: `___%`, p99 latency: `___ms`.
- [ ] **5.1.3** Take database backup:
  ```bash
  # Record backup ID or confirm automated backup completed
  # Backup location: [path / S3 bucket]
  # Backup verified: [Y/N]
  ```
- [ ] **5.1.4** Confirm all feature flags are in correct state for deployment:
  | Flag | Required State | Actual State |
  | :--- | :--- | :--- |
  | `[flag_name]` | `OFF` | ___ |

---

### 5.2 Database Migrations (if applicable)

> Run migrations FIRST, before deploying new application code, if migrations are backward-compatible with the current running code.

- [ ] **5.2.1** SSH to migration host or run via deployment pipeline:
  ```bash
  # Run migration
  php artisan migrate --step   # Or equivalent for your stack
  # Or:
  mysql -u [user] -p [database] < migrations/20260709_add_webhook_tables.sql
  ```
- [ ] **5.2.2** Verify migrations applied:
  ```sql
  SHOW TABLES;
  -- Confirm new tables/columns exist
  -- Confirm row counts are as expected
  ```
- [ ] **5.2.3** Verify application still functioning with old code + new schema (30-second smoke test)

---

### 5.3 Application Deployment

- [ ] **5.3.1** Pull new release to staging directory:
  ```bash
  git fetch origin
  git checkout v[X.Y.Z]
  # Or: deploy via pipeline artifact
  ```
- [ ] **5.3.2** Install / update dependencies:
  ```bash
  composer install --no-dev --optimize-autoloader
  npm ci && npm run build  # If frontend assets
  ```
- [ ] **5.3.3** Clear and warm caches:
  ```bash
  php artisan cache:clear
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache
  ```
- [ ] **5.3.4** Switch webroot symlink (zero-downtime swap):
  ```bash
  ln -sfn /var/www/releases/v[X.Y.Z] /var/www/current
  ```
- [ ] **5.3.5** Reload PHP-FPM gracefully:
  ```bash
  sudo systemctl reload php8.3-fpm
  ```

---

### 5.4 Post-Deployment Smoke Test

> Must complete within 10 minutes of code deployment. If any check fails, begin rollback.

- [ ] **5.4.1** Health check endpoint returns 200:
  ```bash
  curl -f https://[domain]/health
  # Expected: {"status": "ok", "version": "X.Y.Z"}
  ```
- [ ] **5.4.2** Login flow works (manual): navigate to admin, log in, confirm dashboard loads
- [ ] **5.4.3** [Critical user flow 1 - e.g., Create payment link]: verify in staging-mirrored production test
- [ ] **5.4.4** Error rate is nominal: check monitoring - error rate `___` (expected: < `0.1%`)
- [ ] **5.4.5** p99 latency is nominal: check monitoring - p99 `___ms` (expected: < `200ms`)
- [ ] **5.4.6** Queue workers running:
  ```bash
  sudo systemctl status [queue-worker-service]
  # Expected: active (running)
  ```

---

### 5.5 Go-Live Completion

- [ ] **5.5.1** Enable any feature flags that should now be `ON`:
  | Flag | Previous State | New State |
  | :--- | :--- | :--- |
  | `[flag_name]` | `OFF` | `ON` |
- [ ] **5.5.2** Notify `#engineering-ops`: "Deployment of [Release] complete. Monitoring for 30 minutes."
- [ ] **5.5.3** Monitor error rates and latency for 30 minutes. Log observations below.

---

## 6. Monitoring Plan

### 6.1 Key Metrics to Watch

| Metric | Baseline (pre-deploy) | Alert Threshold | Action if Exceeded |
| :--- | :--- | :--- | :--- |
| HTTP 5xx error rate | `<0.1%` | `>1% sustained for 2 min` | Begin rollback |
| p99 API response time | `<200ms` | `>500ms sustained for 2 min` | Begin rollback |
| [Business metric - e.g., Payment success rate] | `>98%` | `<95% for 5 min` | Begin rollback |
| Queue job failure rate | `<0.1%` | `>5%` | Investigate; pause queue if needed |

### 6.2 Dashboards and Alerts

| Resource | URL / Location |
| :--- | :--- |
| Application monitoring | [URL - Datadog / Grafana / New Relic] |
| Error tracking | [URL - Sentry / Rollbar] |
| Database dashboard | [URL] |
| Queue dashboard | [URL] |

### 6.3 Monitoring Log

> Record observations every 10 minutes for the first 30 minutes post-deployment.

| Time | Error Rate | p99 Latency | [Business Metric] | Notes |
| :--- | :--- | :--- | :--- | :--- |
| T+10 min | | | | |
| T+20 min | | | | |
| T+30 min | | | | |

**Final Status:** `Healthy - No Action Required` | `Degraded - Monitoring Continues` | `Failed - Rollback Initiated`

---

## 7. Rollback Plan

> **This plan must be written and reviewed BEFORE the deployment begins.** It is executed by the on-call engineer and does not require consultation.

### 7.1 Rollback Triggers

Initiate rollback IMMEDIATELY if any of the following occur:

- HTTP 5xx error rate > `1%` sustained for `2 minutes`
- p99 latency > `500ms` sustained for `2 minutes`
- [Business metric] below `95%` for `5 minutes`
- Any Critical security event detected
- Critical bug reported by user that cannot be fixed forward in < `30 minutes`

### 7.2 Rollback Decision Authority

The deployment lead or on-call backup is authorized to initiate rollback **without approval**. Speed matters.

Notify `#engineering-alerts` simultaneously with initiating rollback.

### 7.3 Rollback Steps

**Estimated rollback time:** [N minutes]

- [ ] **R1** Notify `#engineering-alerts`: "ROLLBACK INITIATED for [Release] at [time]. Reason: [metric/issue]."
- [ ] **R2** Disable any newly-enabled feature flags:
  ```
  Set [flag_name] → OFF
  ```
- [ ] **R3** Switch webroot symlink back to previous release:
  ```bash
  ln -sfn /var/www/releases/v[PREVIOUS.VERSION] /var/www/current
  sudo systemctl reload php8.3-fpm
  ```
- [ ] **R4** If database migrations were applied and are NOT backward-compatible, run rollback script:
  ```bash
  mysql -u [user] -p [database] < migrations/rollback_20260709.sql
  ```
  > **⚠ WARNING:** Only run rollback migration if the migration was NOT additive. If it was additive, skip this step - the old code is compatible with the new schema.
- [ ] **R5** Restart workers to pick up old code:
  ```bash
  sudo systemctl restart [queue-worker-service]
  ```
- [ ] **R6** Verify rollback: health check returns previous version, error rate normalizing:
  ```bash
  curl -f https://[domain]/health
  # Expected: {"status": "ok", "version": "[PREVIOUS.VERSION]"}
  ```
- [ ] **R7** Confirm error rate and latency returning to baseline in monitoring.
- [ ] **R8** Notify `#engineering-alerts`: "Rollback of [Release] complete. System restored to v[PREVIOUS.VERSION]. Opening incident."

### 7.4 Data Loss Assessment

| Scenario | Data Loss Risk | Mitigation |
| :--- | :--- | :--- |
| Application code rollback only | `None` | No data mutation in code rollback |
| Additive schema migration + code rollback | `None` | Old code works with new schema |
| Destructive schema migration reversal | `Low-High depending on activity` | Restore from pre-deployment backup taken at step 5.1.3 |

---

## 8. Communication Plan

| Audience | Channel | Message | Timing |
| :--- | :--- | :--- | :--- |
| Engineering team | `#engineering-ops` | Deployment start / complete / rollback | As events occur |
| On-call backup | Direct / phone | Deployment status at T+30 min | If any alert fires |
| External users (if outage) | Status page / email | [Template] | Within 15 min of confirmed outage |

---

## 9. Post-Deployment Sign-off

| Check | Status | Time | Notes |
| :--- | :--- | :--- | :--- |
| Deployment complete | `Yes` / `No` | | |
| All smoke tests passed | `Yes` / `No` | | |
| Monitoring nominal at T+30 min | `Yes` / `No` | | |
| Rollback required | `Yes` / `No` | | |

**Deployment Lead Signature:** _______________ **Date:** YYYY-MM-DD **Time:** HH:MM
