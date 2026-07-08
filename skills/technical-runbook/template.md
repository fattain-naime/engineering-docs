# Technical Runbook

**Service:** [Service Name]
**Document ID:** RUN-[SERVICE]-[VERSION]
**Version:** 1.0.0
**Last Updated:** YYYY-MM-DD
**Last Verified Against Production:** YYYY-MM-DD
**Owner Team:** [Team Name]
**On-call Rotation:** [Link to PagerDuty / OpsGenie rotation]

---

## ⚡ Quick Reference

> This section is for engineers who are mid-incident and need answers in 60 seconds.

| Symptom | Jump To |
| :--- | :--- |
| High 5xx error rate | [Section 4.1](#41-alert-high-5xx-error-rate) |
| Site is down / not responding | [Section 4.2](#42-alert-service-unreachable) |
| Database is slow or unresponsive | [Section 4.3](#43-alert-database-slow-query--connection-exhaustion) |
| Queue depth growing / jobs not processing | [Section 4.4](#44-alert-queue-depth-elevated) |
| Memory or CPU critically high | [Section 4.5](#45-alert-resource-exhaustion) |
| Need to restart a service | [Section 7.1](#71-restart-application-service) |
| Need to check logs | [Section 6.1](#61-log-locations-and-search) |
| Need to escalate | [Section 5](#5-escalation-path) |

---

## 1. Service Overview

### 1.1 What This Service Does

[2-3 sentences: what does this service do, who depends on it, and what is the impact if it goes down?]

### 1.2 Service SLA

| SLA Component | Target | Alert Threshold |
| :--- | :--- | :--- |
| Availability | `99.9%` (monthly) | Page if < `99.5%` over 5 min |
| p99 Latency | `< 200ms` | Page if > `500ms` sustained 2 min |
| Error Rate | `< 0.1%` | Page if > `1%` sustained 2 min |

### 1.3 Architecture Summary

```
[Client] → [Load Balancer] → [Web/App Server(s)] → [Database Primary]
                                                   → [Redis Cache/Queue]
                                                   → [Queue Worker(s)]
```

| Component | Technology | Count | Responsibility |
| :--- | :--- | :--- | :--- |
| Web server | Nginx + PHP-FPM | [N] | HTTP request handling |
| Database | MySQL 8.x | 1 primary + [N] replicas | Data persistence |
| Cache / Queue | Redis | [N] | Session cache, async job queue |
| Queue worker | PHP CLI process | [N] | Background job processing |

### 1.4 External Dependencies

| Dependency | Type | Impact if Down | Fallback |
| :--- | :--- | :--- | :--- |
| [External service A] | Critical | [Service is fully degraded] | [None / Graceful degradation] |
| [External service B] | Non-critical | [Feature X unavailable] | [Cached response for N hours] |

---

## 2. Monitoring and Dashboards

| Dashboard | URL | What to Check |
| :--- | :--- | :--- |
| Primary monitoring | [URL - Grafana / Datadog] | Error rate, latency, throughput |
| Error tracking | [URL - Sentry / Rollbar] | Exception rate, new errors |
| Database | [URL] | Query time, connections, replication lag |
| Queue | [URL] | Queue depth, job failure rate, worker count |
| Infrastructure | [URL] | CPU, memory, disk, network |

### Key Metrics to Watch

| Metric | Normal Range | Warning | Critical |
| :--- | :--- | :--- | :--- |
| HTTP 5xx rate | `< 0.1%` | `0.1% - 1%` | `> 1%` |
| p99 API latency | `< 200ms` | `200-500ms` | `> 500ms` |
| DB connections active | `< [N]` | `> [N*0.7]` | `> [N*0.9]` |
| DB replication lag | `< 1s` | `1-5s` | `> 5s` |
| Queue depth | `< 100` | `100-1000` | `> 1000` |
| Server CPU | `< 60%` | `60-85%` | `> 85%` |
| Server memory | `< 70%` | `70-90%` | `> 90%` |
| Disk usage | `< 70%` | `70-85%` | `> 85%` |

---

## 3. Alert Index

| Alert Name | Severity | Trigger Condition | Runbook Section |
| :--- | :--- | :--- | :--- |
| `[SERVICE]_high_error_rate` | `Critical` | 5xx rate > 1% for 2 min | [4.1] |
| `[SERVICE]_unreachable` | `Critical` | Health check fails for 1 min | [4.2] |
| `[SERVICE]_db_slow` | `Critical` | Query p99 > 1s for 5 min | [4.3] |
| `[SERVICE]_queue_depth` | `Warning` | Queue depth > 1000 for 5 min | [4.4] |
| `[SERVICE]_resource_high` | `Warning` | CPU > 85% or Memory > 90% for 5 min | [4.5] |
| `[SERVICE]_disk_full` | `Critical` | Disk usage > 90% | [4.6] |

---

## 4. Alert Response Procedures

---

### 4.1 Alert: High 5xx Error Rate

**Severity:** Critical | **Page:** Yes | **SLA Impact:** Yes

#### Diagnosis (< 5 minutes)

1. **Check error tracking** for new exceptions:
   - Open [Sentry/Rollbar URL]
   - Filter to last 15 minutes
   - Look for new or spiking error classes

2. **Check recent deployments:**
   - Was a deployment made in the last 30 minutes?
   ```bash
   # Check deployment log
   cat /var/www/current/RELEASE
   ```
   - If yes, prepare for rollback (Section 7.4)

3. **Check application logs:**
   ```bash
   # Last 100 error lines
   tail -n 200 /var/log/[app]/error.log | grep -E "ERROR|CRITICAL|Exception"

   # PHP-FPM errors
   tail -n 100 /var/log/php8.3-fpm.log
   ```

4. **Check if specific endpoints are failing** (not all):
   - Look at error tracking for which URL patterns are throwing 5xx
   - Isolate: is this all traffic or specific functionality?

#### Mitigation Options

| Root Cause | Action |
| :--- | :--- |
| Recent bad deployment | Rollback → Section 7.4 |
| Database down / unreachable | → Section 4.3 |
| PHP-FPM pool exhausted | Restart PHP-FPM → Section 7.2 |
| Memory exhaustion causing OOM kills | Check memory → Scale or clear cache |
| External dependency down | Enable fallback if available; notify [Dependency team] |
| Bad data input causing exception | Identify specific input; consider feature flag to disable if safe |

#### Escalation Trigger

Escalate to [Lead Engineer] if:
- Root cause not identified within 15 minutes
- Mitigation does not reduce error rate within 10 minutes of applying
- Error rate reaches 5% sustained

---

### 4.2 Alert: Service Unreachable

**Severity:** Critical | **Page:** Yes | **SLA Impact:** Yes

#### Diagnosis

1. **Check from outside** (is it a network issue?):
   ```bash
   curl -v https://[domain]/health
   # Expected: HTTP 200 {"status":"ok"}
   # If timeout: check load balancer / networking
   ```

2. **Check web server status:**
   ```bash
   sudo systemctl status nginx
   sudo systemctl status php8.3-fpm
   ```

3. **Check process resource limits:**
   ```bash
   # PHP-FPM pool status
   sudo php-fpm8.3 -t  # Config test
   ps aux | grep php-fpm | wc -l  # Count running workers
   ```

4. **Check system resources:**
   ```bash
   free -h          # Memory
   df -h            # Disk
   top -b -n1       # CPU snapshot
   ```

#### Mitigation

```bash
# Restart web server (graceful)
sudo systemctl reload nginx

# Restart PHP-FPM (graceful reload preserves in-flight requests)
sudo systemctl reload php8.3-fpm

# If still unresponsive, full restart (brief 5xx spike expected):
sudo systemctl restart php8.3-fpm
sudo systemctl restart nginx
```

---

### 4.3 Alert: Database Slow Query / Connection Exhaustion

**Severity:** Critical | **Page:** Yes | **SLA Impact:** Yes

#### Diagnosis

1. **Check active queries:**
   ```sql
   -- Connect to MySQL
   mysql -u [user] -p

   -- Show currently running queries (anything > 5s is suspicious)
   SHOW PROCESSLIST;
   -- Or:
   SELECT id, user, host, db, time, state, info
   FROM information_schema.processlist
   WHERE time > 5
   ORDER BY time DESC;
   ```

2. **Check replication lag** (if using replicas):
   ```sql
   -- On replica:
   SHOW REPLICA STATUS\G
   -- Check: Seconds_Behind_Source
   ```

3. **Check connection count:**
   ```sql
   SHOW STATUS LIKE 'Threads_connected';
   SHOW VARIABLES LIKE 'max_connections';
   ```

4. **Check slow query log:**
   ```bash
   tail -n 50 /var/log/mysql/slow.log
   ```

#### Mitigation

| Issue | Action |
| :--- | :--- |
| Specific slow query blocking everything | `KILL [processlist_id];` |
| Connection pool exhausted | Reduce app workers temporarily; restart worker processes |
| Replication lag > 30s | Route reads to primary temporarily; investigate replica load |
| Index missing | Identify query pattern; add index during low-traffic window |
| Table lock | Identify locking query; kill if appropriate; investigate why lock occurred |

---

### 4.4 Alert: Queue Depth Elevated

**Severity:** Warning | **Page:** Yes (if Critical threshold) | **SLA Impact:** Delayed jobs

#### Diagnosis

1. **Check queue worker status:**
   ```bash
   sudo systemctl status [queue-worker-service]
   ps aux | grep [worker-process-name]
   ```

2. **Check for failed jobs:**
   ```bash
   # Application-specific command
   php artisan queue:failed  # Or equivalent
   ```

3. **Check worker logs:**
   ```bash
   tail -n 100 /var/log/[app]/worker.log | grep -E "ERROR|FAILED|Exception"
   ```

#### Mitigation

```bash
# Restart workers (if they are stuck or crashed)
sudo systemctl restart [queue-worker-service]

# Scale workers temporarily (if depth is due to volume, not errors)
# Start N additional worker processes
for i in {1..3}; do
  nohup php /var/www/current/artisan queue:work --max-time=3600 &
done

# Clear failed jobs (only after investigating root cause)
php artisan queue:flush
```

---

### 4.5 Alert: Resource Exhaustion (CPU/Memory)

**Severity:** Warning → Critical | **Page:** Yes at Critical | **SLA Impact:** Degraded performance

#### Diagnosis

```bash
# CPU
top -b -n1 | head -20
# Identify high-CPU processes

# Memory
free -h
ps aux --sort=-%mem | head -20

# Check for memory leaks in PHP-FPM (workers using > N MB may have leak)
ps aux | grep php-fpm | awk '{print $6}' | sort -n | tail -5
```

#### Mitigation

```bash
# Graceful PHP-FPM restart (recycles workers, frees leaked memory)
sudo systemctl reload php8.3-fpm

# If disk full (different from memory):
# Find large files
du -sh /var/log/[app]/* | sort -h
# Rotate/clear old logs
sudo logrotate -f /etc/logrotate.d/[app]
# Clear PHP opcache
# (if applicable to your setup)
```

---

### 4.6 Alert: Disk Full

**Severity:** Critical | **Page:** Yes | **SLA Impact:** Writes fail, application crashes**

```bash
# Find top disk consumers
du -sh /* 2>/dev/null | sort -rh | head -20
du -sh /var/log/* 2>/dev/null | sort -rh | head -10

# Rotate logs immediately
sudo journalctl --vacuum-size=500M
sudo logrotate -f /etc/logrotate.conf

# Clear old application exports or temporary files
find /var/www/current/storage/exports -mtime +7 -delete
find /tmp -mtime +1 -delete

# Check for unrotated application logs
ls -lah /var/log/[app]/
```

---

## 5. Escalation Path

> Contact in order. Do not skip levels during business hours. Skip directly to L2 for Severity 1 (full outage) at any hour.

| Level | Who | When to Contact | How to Reach |
| :--- | :--- | :--- | :--- |
| L0 | This runbook | Always try first | You are reading it |
| L1 | [On-call Engineer] | Runbook step fails or unknown issue | PagerDuty / Phone: [number] |
| L2 | [Senior/Lead Engineer] | L1 cannot resolve in 15 min, or Sev-1 | Phone: [number] / Slack: @[handle] |
| L3 | [Architect / Principal] | L2 cannot resolve; data loss risk; security incident | Phone: [number] |
| Vendor | [Cloud provider / DB vendor support] | Infrastructure-level issue confirmed | Support portal: [URL] |

**Incident channel:** `#incidents` in Slack

---

## 6. Diagnostic Reference

### 6.1 Log Locations and Search

| Log | Path | Format |
| :--- | :--- | :--- |
| Application error log | `/var/log/[app]/error.log` | JSON |
| PHP-FPM log | `/var/log/php8.3-fpm.log` | Text |
| Nginx access log | `/var/log/nginx/access.log` | Combined format |
| Nginx error log | `/var/log/nginx/error.log` | Text |
| MySQL slow query log | `/var/log/mysql/slow.log` | Text |
| Queue worker log | `/var/log/[app]/worker.log` | JSON |

```bash
# Find all ERROR-level entries in the last 1 hour
grep '"level":"error"' /var/log/[app]/error.log | \
  awk -v ts="$(date -d '1 hour ago' +%s)" \
  '{ if ($0 ~ /"timestamp":"[0-9]+"/) { ... } }' | tail -50
# Or simpler:
tail -f /var/log/[app]/error.log | grep -E "ERROR|CRITICAL"
```

### 6.2 Health Check Commands

```bash
# Full health check
curl -s https://[domain]/health | python3 -m json.tool

# Database connectivity check
php /var/www/current/artisan db:show  # Or equivalent
mysql -u [user] -p -e "SELECT 1;" [database]

# Redis connectivity check
redis-cli ping  # Expected: PONG

# Queue worker alive check
ps aux | grep queue:work | grep -v grep
```

### 6.3 Useful SQL Snippets

```sql
-- Check table sizes
SELECT table_name, round(data_length/1024/1024, 2) AS data_mb,
       round(index_length/1024/1024, 2) AS index_mb
FROM information_schema.tables
WHERE table_schema = '[database_name]'
ORDER BY data_length DESC
LIMIT 20;

-- Kill a slow query by ID (get ID from SHOW PROCESSLIST)
KILL QUERY [process_id];

-- Check replication status
SHOW REPLICA STATUS\G
```

---

## 7. Maintenance Procedures

### 7.1 Restart Application Service

```bash
# Graceful restart (preferred - no request drops)
sudo systemctl reload php8.3-fpm
sudo systemctl reload nginx

# Full restart (use only if graceful fails)
sudo systemctl restart php8.3-fpm
sudo systemctl restart nginx

# Verify:
curl -f https://[domain]/health
```

**Impact:** Graceful reload: < 1 second latency spike. Full restart: 5-10 second 502 spike.

---

### 7.2 Restart Queue Workers

```bash
# Graceful stop (workers finish current job then stop)
sudo systemctl stop [queue-worker-service]

# Start workers
sudo systemctl start [queue-worker-service]

# Verify workers running:
sudo systemctl status [queue-worker-service]
ps aux | grep queue:work | grep -v grep
```

---

### 7.3 Clear Application Cache

```bash
# Clear all caches
php /var/www/current/artisan cache:clear

# Rebuild config/route/view cache
php /var/www/current/artisan config:cache
php /var/www/current/artisan route:cache
php /var/www/current/artisan view:cache
```

---

### 7.4 Emergency Rollback

See [Deployment Plan template] for the full rollback procedure.

**Quick version:**
```bash
# List available releases
ls -lt /var/www/releases/

# Switch to previous release
ln -sfn /var/www/releases/[PREVIOUS_VERSION] /var/www/current
sudo systemctl reload php8.3-fpm

# Verify:
curl -f https://[domain]/health
```

---

### 7.5 Database Backup (Emergency)

```bash
# Take an emergency backup before a risky operation
mysqldump \
  -u [user] -p \
  --single-transaction \
  --quick \
  --lock-tables=false \
  [database_name] \
  > /var/backups/mysql/emergency_$(date +%Y%m%d_%H%M%S).sql

# Verify backup:
ls -lh /var/backups/mysql/emergency_*.sql
```

---

## 8. Change Log

| Date | Version | Author | Change |
| :--- | :--- | :--- | :--- |
| YYYY-MM-DD | 1.0.0 | [Name] | Initial runbook created |
