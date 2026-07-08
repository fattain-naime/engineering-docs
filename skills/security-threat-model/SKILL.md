---
name: security-threat-model
argument-hint: "[system or feature name]"
description: Produce a structured security threat model using the STRIDE framework, identify trust boundaries, enumerate attack vectors, assess risk, and define concrete mitigations. Use when reviewing security of a new feature, system, or integration.
intent: >-
  Produce a systematic security threat model that identifies every realistic attack vector against a system or feature, assesses the risk of each threat, and defines concrete, implementable mitigations. Security is not a checklist - it is a structured adversarial thinking exercise. STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) provides the categorical framework. Data Flow Diagrams (DFDs) identify trust boundaries - the architectural locations where attackers concentrate attacks. The output is an actionable security risk register, not a theoretical audit.
type: workflow
theme: engineering-docs
best_for:
  - "Security review of a new feature before implementation"
  - "Threat modeling a new external integration or API"
  - "Pre-launch security assessment of a new service"
  - "Compliance-driven security documentation (PCI-DSS, SOC 2, ISO 27001)"
  - "Training engineers to think adversarially about their own systems"
scenarios:
  - "Threat model the new JWT authentication system for our API"
  - "Security review of our new file upload feature"
  - "What are the security risks of adding a third-party payment processor webhook integration?"
estimated_time: "2-4 hours"
---

## Purpose

Produce a structured threat model that systematically identifies what can go wrong in a system from a security perspective, who would attack it, how they would do it, and what concrete controls prevent or mitigate each attack.

**Security is not a feature to add at the end.** A threat model performed before implementation costs hours. A security breach found after launch costs millions and destroys trust that took years to build.

## Input

**Works best with:** The name of the system, feature, or integration being threat-modeled.
**Also valuable:** An existing architecture document, data flow diagram, API design, or description of how data moves through the system.

**Example invocation:** `Threat model our new webhook delivery system. Merchants register endpoint URLs. Our system sends signed HTTP POST requests with event payloads. Merchants verify signatures using a per-merchant secret. The system retries failed deliveries up to 3 times with exponential backoff.`

## Key Concepts

### STRIDE Framework (Microsoft SDL)
The six threat categories that cover all known attack classes:

| Letter | Threat | Violates | Example |
| :--- | :--- | :--- | :--- |
| **S** | Spoofing | Authentication | Attacker impersonates a legitimate user or system |
| **T** | Tampering | Integrity | Attacker modifies data in transit or at rest |
| **R** | Repudiation | Non-repudiation | User denies performing an action with no audit trail to prove otherwise |
| **I** | Information Disclosure | Confidentiality | Sensitive data exposed to unauthorized parties |
| **D** | Denial of Service | Availability | System overwhelmed or crashed, denying service to legitimate users |
| **E** | Elevation of Privilege | Authorization | Attacker gains access beyond their granted permissions |

### Trust Boundaries
Trust boundaries are the locations in a system where data crosses from one trust zone to another. Attackers target trust boundaries because that is where:
- Input validation is most often missing
- Authentication is most often weak
- Data is most often exposed in transit

Always draw trust boundaries before enumerating threats.

### Risk Scoring
Risk = Probability × Impact. Use a simple 3×3 matrix:
- **Critical:** High probability + High impact (act immediately)
- **High:** High probability + Medium impact OR Medium probability + High impact
- **Medium:** Various mid-tier combinations
- **Low:** Low probability + Low impact (accept or defer)

### Mitigations vs. Residual Risk
A mitigation reduces risk but rarely eliminates it. Document the residual risk after each mitigation - the risk that remains even with controls in place. If residual risk is still High or Critical, escalate for additional review.

## Application

### Phase 1: System and Scope Definition (20 min)
Define what is in scope. Draw the data flow diagram and mark trust boundaries.

### Phase 2: STRIDE Analysis per Component (60-90 min)
For each component and data flow, enumerate all threats in each STRIDE category.

### Phase 3: Risk Assessment (20 min)
Score each threat for probability and impact.

### Phase 4: Mitigation Design (30-45 min)
For each High/Critical threat, define a concrete, implementable control.

### Phase 5: Risk Register and Action Items (20 min)
Produce the prioritized risk register with owners and deadlines.
