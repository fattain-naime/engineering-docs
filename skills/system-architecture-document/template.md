# System Architecture Document

**System:** [System Name]
**Document ID:** SAD-[SYSTEM]-[VERSION]
**Status:** `Draft` | `In Review` | `Approved` | `Superseded`
**Version:** 1.0.0
**Date:** YYYY-MM-DD
**Author(s):** [Name, Role]
**Reviewers:** [Name, Role] | [Name, Role]

---

## 1. Executive Summary

> 2-3 paragraphs. Describe the system's purpose, its architectural style (monolith, microservices, event-driven, layered, etc.), the key drivers that shaped the architecture (NFRs, constraints, team structure), and the most important architectural decisions made.

---

## 2. Architecture Principles

> The guiding principles that govern all architectural decisions in this system. These act as tie-breakers when trade-offs arise.

| Principle | Rationale | Implication |
| :--- | :--- | :--- |
| [e.g., Simplicity over sophistication] | [Reason] | [What this means in practice] |
| [e.g., Explicit over implicit] | [Reason] | [What this means in practice] |
| [e.g., Data integrity over performance] | [Reason] | [What this means in practice] |

---

## 3. System Context (C4 Level 1)

> Who uses the system and what external systems does it depend on or serve? Intended for all stakeholders, including non-technical.

```mermaid
C4Context
  title System Context - [System Name]

  Person(user, "End User", "Description of primary user")
  Person(admin, "Administrator", "Description of admin role")

  System(thisSystem, "[System Name]", "What this system does in one sentence")

  System_Ext(extSystemA, "[External System A]", "What it does")
  System_Ext(extSystemB, "[External System B]", "What it does")

  Rel(user, thisSystem, "Uses", "HTTPS")
  Rel(admin, thisSystem, "Manages", "HTTPS")
  Rel(thisSystem, extSystemA, "Calls", "REST / HTTPS")
  Rel(extSystemB, thisSystem, "Sends events to", "Webhook / HTTPS")
```

### External System Dependencies

| External System | Direction | Protocol | Purpose | SLA Dependency |
| :--- | :--- | :--- | :--- | :--- |
| [System A] | Outbound | REST/HTTPS | [Why we call it] | Yes / No |
| [System B] | Inbound | Webhook | [Why it calls us] | No |

---

## 4. Container Architecture (C4 Level 2)

> The major deployable/executable units. Each container has its own process space, deployment lifecycle, and technology.

```mermaid
C4Container
  title Container Diagram - [System Name]

  Person(user, "End User")

  System_Boundary(system, "[System Name]") {
    Container(web, "Web Application", "PHP 8.3 / Twig", "Serves the admin UI and checkout flows")
    Container(api, "API Layer", "PHP 8.3 / Custom Router", "Handles REST API requests from merchants")
    Container(db, "Database", "MySQL 8.x", "Stores all transactional and configuration data")
    Container(queue, "Job Queue", "Redis / Custom Worker", "Processes async jobs: webhooks, reports, notifications")
    Container(storage, "File Storage", "Local / S3", "Stores uploaded assets, exports, backups")
  }

  Rel(user, web, "Uses", "HTTPS")
  Rel(web, api, "Calls", "Internal / HTTP")
  Rel(api, db, "Reads/Writes", "PDO / MySQL")
  Rel(api, queue, "Enqueues jobs", "Redis")
  Rel(queue, db, "Reads/Writes", "PDO / MySQL")
```

### Container Inventory

| Container | Technology | Responsibility | Scalability Strategy |
| :--- | :--- | :--- | :--- |
| [Web App] | [PHP 8.3 / Twig] | [Description] | [Horizontal / Vertical] |
| [API] | [PHP 8.3] | [Description] | [Horizontal] |
| [Database] | [MySQL 8.x] | [Description] | [Read replicas / Sharding] |
| [Queue] | [Redis] | [Description] | [Horizontal workers] |

---

## 5. Component Architecture (C4 Level 3)

> Internal structure of the most critical containers. Not required for every container - focus on the most complex ones.

### 5.1 [Container Name] - Internal Components

```mermaid
C4Component
  title Component Diagram - [Container Name]

  Container_Boundary(container, "[Container Name]") {
    Component(router, "Router", "Custom PSR-7", "Routes incoming HTTP requests to controllers")
    Component(controller, "[Domain] Controller", "PHP Class", "Handles [domain] requests")
    Component(service, "[Domain] Service", "PHP Class", "Contains business logic for [domain]")
    Component(repository, "[Domain] Repository", "PHP Class", "Data access layer for [entity]")
  }

  ContainerDb(db, "Database", "MySQL")

  Rel(router, controller, "Routes to")
  Rel(controller, service, "Delegates to")
  Rel(service, repository, "Reads/Writes via")
  Rel(repository, db, "Queries", "PDO")
```

---

## 6. Deployment View

> Where do the containers run? What is the network topology? What cloud regions or data centers are involved?

```mermaid
graph TB
  subgraph "Production Environment"
    subgraph "Web Tier (DMZ)"
      LB[Load Balancer<br/>Nginx / HAProxy]
      WEB1[Web Server 1<br/>PHP-FPM + Nginx]
      WEB2[Web Server 2<br/>PHP-FPM + Nginx]
    end
    subgraph "Application Tier (Private)"
      WORKER1[Queue Worker 1<br/>PHP CLI]
      WORKER2[Queue Worker 2<br/>PHP CLI]
    end
    subgraph "Data Tier (Private)"
      DB_PRIMARY[(MySQL Primary)]
      DB_REPLICA[(MySQL Replica)]
      REDIS[(Redis)]
    end
  end

  CLIENT[Client Browser] --> LB
  LB --> WEB1
  LB --> WEB2
  WEB1 --> DB_PRIMARY
  WEB2 --> DB_PRIMARY
  DB_PRIMARY --> DB_REPLICA
  WORKER1 --> REDIS
  WORKER1 --> DB_PRIMARY
```

### Infrastructure Inventory

| Component | Type | Specs | Count | Region | Managed By |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Web Server | VPS / Container | [CPU/RAM] | [N] | [Region] | [Team] |
| Database Primary | VPS / RDS | [CPU/RAM/Storage] | 1 | [Region] | [Team] |

---

## 7. Process View - Key Flows

> How does the system behave at runtime for its most critical use cases?

### 7.1 [Critical Flow Name - e.g., Payment Processing]

```mermaid
sequenceDiagram
  actor User
  participant WebApp
  participant API
  participant PaymentGateway as External Gateway
  participant DB

  User->>WebApp: Submit payment form
  WebApp->>API: POST /payments {amount, method}
  API->>DB: BEGIN TRANSACTION
  API->>PaymentGateway: Charge request
  PaymentGateway-->>API: Charge result {success/fail}
  API->>DB: Record transaction + COMMIT
  API-->>WebApp: Payment result
  WebApp-->>User: Confirmation / Error
```

### 7.2 [Next Critical Flow]

[Follow same structure]

---

## 8. Integration Map

> Every integration point the system has with external systems.

| Integration | Direction | Protocol | Auth | Data Format | Error Handling | SLA |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| [External System A] | Outbound | REST/HTTPS | API Key | JSON | Retry x3, exponential backoff | 99.9% |
| [External System B] | Inbound | Webhook | HMAC-SHA256 | JSON | Return 200 immediately, process async | N/A |

---

## 9. Data Flow and Trust Boundaries

> Where does data enter the system, how does it move between containers, and where are the trust boundaries?

```mermaid
graph LR
  EXTERNAL[External / Untrusted]

  subgraph "DMZ - Low Trust"
    WAF[WAF / Load Balancer]
    WEB[Web App]
  end

  subgraph "Internal - High Trust"
    API[API Layer]
    WORKER[Workers]
    DB[(Database)]
  end

  EXTERNAL -->|HTTPS| WAF
  WAF -->|Validated request| WEB
  WEB -->|Sanitized input| API
  API -->|Parameterized queries| DB
  WORKER -->|Parameterized queries| DB
```

### Sensitive Data Classification

| Data Category | Classification | Storage | Transmission | Retention |
| :--- | :--- | :--- | :--- | :--- |
| Payment card data | `Restricted` | Tokenized / Not stored | TLS 1.2+ | Never raw |
| User PII | `Confidential` | Encrypted at rest | TLS 1.2+ | Per GDPR policy |
| Session tokens | `Confidential` | Server-side (Redis) | HTTPS only | Session lifetime |
| API keys | `Confidential` | Hashed (SHA-256) | HTTPS only | Indefinite |

---

## 10. Quality Attribute Requirements

> The architectural decisions here are driven by specific measurable NFRs.

| Quality Attribute | Target | Architectural Decision | ADR Reference |
| :--- | :--- | :--- | :--- |
| Availability | 99.9% uptime | Multi-instance deployment behind load balancer | ADR-003 |
| Performance | p99 < 200ms API response | MySQL connection pooling + Redis caching | ADR-005 |
| Security | Zero SQL injection risk | Parameterized PDO queries enforced at repo layer | ADR-002 |
| Scalability | 10x traffic handled without code change | Stateless web tier; horizontal scaling | ADR-004 |
| Maintainability | New developer productive in < 1 week | PSR-4 autoloading, clear layer separation | ADR-001 |

---

## 11. Architecture Decision Record Log

> Summary of all significant architectural decisions. Each ADR is an immutable record. Use `adr-template.md` for the full detail.

| ADR ID | Title | Status | Date | Summary |
| :--- | :--- | :--- | :--- | :--- |
| ADR-001 | [Decision title] | `Accepted` | YYYY-MM-DD | [One-sentence summary of the decision] |
| ADR-002 | [Decision title] | `Accepted` | YYYY-MM-DD | [One-sentence summary] |
| ADR-003 | [Decision title] | `Superseded by ADR-007` | YYYY-MM-DD | [One-sentence summary] |

---

## 12. Known Technical Debt

> Architectural compromises made deliberately. Documenting these prevents them from becoming invisible and permanent.

| Item | Description | Why Accepted | Remediation Path | Priority |
| :--- | :--- | :--- | :--- | :--- |
| [Debt item] | [Technical detail] | [Constraint that forced the compromise] | [How to fix eventually] | `High` / `Medium` / `Low` |

---

## 13. Glossary

| Term | Definition |
| :--- | :--- |
| [Domain / Technical term] | [Plain-language definition] |
