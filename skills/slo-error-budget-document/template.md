# SLO & Error Budget Document

**Service:** [Service / API Name]
**Document ID:** SLO-[SERVICE]-[VERSION]
**Status:** `Draft` | `In Review` | `Approved` | `Under Renegotiation`
**Version:** 1.0.0
**Date:** YYYY-MM-DD
**Author(s):** [Name, Role]
**Reviewers:** [Name, Role - Engineering] | [Name, Role - Business/Product owner]
**Review Cadence:** [e.g., Quarterly, or after any SLO breach]

---

## 1. Overview

### 1.1 Purpose

[2-3 sentences: what service does this cover, why does it need formal reliability targets now, and who consumes this document (on-call engineers, leadership, customers)?]

### 1.2 Critical User Journeys

> The SLIs below must trace back to something a real user actually experiences. List the journeys that matter before picking metrics.

| Journey | Why It Matters | Current Pain Point (if any) |
| :--- | :--- | :--- |
| [e.g., Merchant checkout completion] | [Revenue-critical path] | [e.g., No formal target today; anecdotal slowness complaints] |

---

## 2. Service Level Indicators (SLIs)

| ID | SLI | Measurement | Good Event Definition |
| :--- | :--- | :--- | :--- |
| SLI-01 | [e.g., Checkout availability] | [proportion of checkout requests returning non-5xx] | [HTTP status < 500 within 5s] |
| SLI-02 | [e.g., Checkout latency] | [proportion of requests under threshold] | [Response time < 300ms] |
| SLI-03 | [e.g., Payment durability] | [proportion of accepted payments not silently lost] | [Ledger entry exists within 60s of acceptance] |

---

## 3. Service Level Objectives (SLOs)

| SLI | Target | Measurement Window | Rationale |
| :--- | :--- | :--- | :--- |
| SLI-01 (Availability) | [e.g., 99.9%] | Rolling 30 days | [Evidence: cost of downtime, baseline history] |
| SLI-02 (Latency) | [e.g., 95% < 300ms] | Rolling 30 days | [Evidence] |
| SLI-03 (Durability) | [e.g., 99.99%] | Rolling 30 days | [Payment loss has direct financial + trust cost] |

---

## 4. Error Budget

### 4.1 Budget Calculation

| SLI | SLO | Error Budget (per 30 days) | Budget in Concrete Terms |
| :--- | :--- | :--- | :--- |
| SLI-01 | 99.9% | 0.1% | [~43 minutes of full downtime-equivalent per 30 days] |

### 4.2 Multi-Window, Multi-Burn-Rate Alerts

| Alert | Burn Rate | Long Window | Short Window | Action |
| :--- | :--- | :--- | :--- | :--- |
| Fast burn | 14.4x | 1h | 5m | Page on-call immediately |
| Moderate burn | 6x | 6h | 30m | Page on-call |
| Slow burn | 1x | 3d | 6h | File ticket, review within the week |

---

## 5. Error Budget Policy

> Agreed in advance, applies automatically - not renegotiated mid-incident.

| Budget Remaining | Policy |
| :--- | :--- |
| > 50% | Ship normally. |
| 20-50% | Increase deploy review rigor; avoid risky/large changes without extra sign-off. |
| < 20% | Feature work slows; reliability fixes get priority. |
| 0% (exhausted) | Feature freeze until budget recovers, or explicit leadership sign-off to continue shipping at accepted risk. |

**Policy owner (final call on exceptions):** [Name, Role]

---

## 6. External SLA (if applicable)

| Metric | Internal SLO | External SLA (customer-facing) | Buffer | Penalty for Breach |
| :--- | :--- | :--- | :--- | :--- |
| Availability | [e.g., 99.9%] | [e.g., 99.5%] | [0.4%] | [e.g., service credit per contract §X] |

> The external SLA should always be looser than the internal SLO. The gap is what protects the business from a contractual breach every time an internal target is missed.

---

## 7. Review and Re-Baselining

- **Next scheduled review:** YYYY-MM-DD
- **Trigger for off-cycle review:** [e.g., any SLA breach, major architecture change, 2 consecutive budget exhaustions]
- **Owner of this document:** [Name, Role]
