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
estimated_time: "4-8 hrs"
license: MIT
compatibility: Designed for Gemini (Antigravity), Claude Code, Cursor/Windsurf, Kimi Code, Codex/Copilot
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
Risk = Probability * Impact. Use a simple 3x3 matrix:
- **Critical:** High probability + High impact (act immediately)
- **High:** High probability + Medium impact OR Medium probability + High impact
- **Medium:** Various mid-tier combinations
- **Low:** Low probability + Low impact (accept or defer)

### Mitigations vs. Residual Risk
A mitigation reduces risk but rarely eliminates it. Document the residual risk after each mitigation - the risk that remains even with controls in place. If residual risk is still High or Critical, escalate for additional review.

### Threat Actor Profiling

Not all attackers are equal. Profile the likely threat actors for the system:
- **Opportunistic attackers:** Use automated tools (scanners, credential stuffing bots). Low skill, high volume. Defeated by basic hygiene (rate limiting, patched software, strong passwords).
- **Targeted attackers:** Specific interest in the system (competitors, disgruntled insiders, fraud rings). Moderate to high skill. Require defense-in-depth.
- **Advanced Persistent Threats (APTs):** Nation-state or well-funded groups. High skill, patient, resourceful. Require layered security, monitoring, and incident response.
- **Insider threats:** Employees, contractors, or partners with legitimate access. Require least-privilege, audit logging, and anomaly detection.

Document which actor profiles are in scope and tailor the threat analysis accordingly.

### Supply Chain Threats

Modern systems depend on third-party components. Analyze supply chain risks:
- **Dependency vulnerabilities:** Known CVEs in third-party libraries. Mitigate with dependency scanning (Dependabot, Snyk), pinning versions, and auditing updates.
- **Compromised packages:** Typosquatting, dependency confusion, malicious maintainer takeovers. Mitigate with lockfiles, verified publishers, and private registries.
- **Third-party service compromise:** If a vendor (payment processor, CDN, auth provider) is breached, what is the blast radius? Mitigate with least-privilege API keys, monitoring, and fallback procedures.
- **Build pipeline attacks:** Compromised CI/CD, malicious build scripts. Mitigate with signed builds, reproducible builds, and access controls on deployment.

### Cryptographic Threat Analysis

Analyze cryptographic risks specifically:
- **Algorithm selection:** Are algorithms appropriate for the use case? (AES-256-GCM for symmetric encryption, RSA-2048+ or Ed25519 for signatures, bcrypt/argon2 for password hashing.)
- **Key management:** How are keys generated, stored, rotated, and revoked? Hardware security modules (HSMs) or managed KMS for production keys.
- **Protocol vulnerabilities:** TLS version enforcement (1.2+ minimum, 1.3 preferred), cipher suite selection, certificate pinning.
- **Side-channel attacks:** Timing attacks on comparison functions (use constant-time comparison for secrets), padding oracle attacks (use authenticated encryption).

### Social Engineering

Technical controls cannot prevent all attacks. Document social engineering risks:
- **Phishing:** Attackers target employees to steal credentials. Mitigate with MFA, security awareness training, and email filtering.
- **Pretexting:** Attackers impersonate support staff, executives, or vendors to gain access. Mitigate with verification procedures and least-privilege.
- **Baiting:** Physical or digital lures (USB drops, fake login pages). Mitigate with endpoint protection and user education.

### Privacy Threat Modeling

When the system processes personal data, apply privacy-specific analysis:
- **Data minimization:** Is every collected data element necessary? Can the system function with less data?
- **Purpose limitation:** Is data used only for the stated purpose? Is there function creep?
- **Consent management:** How is consent obtained, recorded, and revoked? Is it granular and informed?
- **Data subject rights:** How does the system support access, rectification, portability, and erasure requests?
- **Cross-border transfers:** Does data leave the jurisdiction? Are appropriate safeguards (SCCs, adequacy decisions) in place?

### Incident Response Integration

The threat model must connect to incident response:
- **Detection:** For each high/critical threat, how would it be detected? What alerts would fire?
- **Containment:** What is the immediate containment procedure? (e.g., revoke API keys, block IP ranges, disable account)
- **Eradication:** How is the threat removed from the system?
- **Recovery:** How is the system restored to normal operation?
- **Lessons learned:** How is the incident post-mortem fed back into the threat model?

### Proper DFD Notation

Data Flow Diagrams must use consistent notation:
- **External entities** (rectangles): Actors outside the system boundary (users, external systems).
- **Processes** (circles/rounded rectangles): Components that transform data (APIs, services, workers).
- **Data stores** (parallel lines or open-ended rectangles): Where data rests (databases, file systems, caches).
- **Data flows** (arrows): How data moves between components. Label with the data being transferred.
- **Trust boundaries** (dashed lines): Where data crosses from one trust zone to another. Mark every boundary crossing.

### Document Length

Target length: **8-12 pages** (excluding appendices).

Shorter is better than longer. If the document exceeds the target, check for:
- Redundant content that can be cut
- Overly verbose explanations
- Content that belongs in a separate reference document
- Material the agent already knows (don't explain what HTTP is)

If the document is significantly shorter than the target, check for:
- Missing sections
- Insufficient detail in critical areas
- Unaddressed edge cases

### Conflict Resolution

When your analysis conflicts with the user's stated preference:

1. **Present both positions** — show your analysis and their preference side by side
2. **Explain the trade-off** — what are the consequences of each choice?
3. **Recommend with reasoning** — state your recommendation and why
4. **Respect the user's decision** — they own the final call
5. **Document the decision** — record it as an `[owner-specified]` override with reasoning

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
1. **User privilege classes**: Who are the actors (e.g. anonymous visitor, staff, vendor, superadmin) and what are their specific privilege limits?
2. **Data sensitivity**: What sensitive data (PII, tokens, credit card info, passwords) is processed or stored?

*Wait for the user's response to these questions before drafting the final security threat model.*

### Phase 2: System and Scope Definition (40-60 min)
Define what is in scope. Draw the data flow diagram and mark trust boundaries.

### Phase 3: STRIDE Analysis per Component (2-3 hrs)
For each component and data flow, enumerate all threats in each STRIDE category.

### Phase 4: Risk Assessment (40-60 min)
Score each threat for probability and impact.

### Phase 5: Mitigation Design (1-1.5 hrs)
For each High/Critical threat, define a concrete, implementable control.

### Phase 6: Risk Register and Action Items (40-60 min)
Produce the prioritized risk register with owners and deadlines.

### Phase 7: Revision (After User Review)

If the user requests changes after reviewing the threat model:

1. **Read the user's feedback carefully** — understand what they want changed
2. **Check for conflicts** — does the requested change affect risk scores, mitigation strategies, or trust boundary definitions?
3. **Apply changes** — update the document, cascading changes through the STRIDE analysis, risk register, and mitigation controls
4. **Re-run consistency check** — verify all threats have specific mitigations, residual risk is documented, and the risk register is re-prioritized
5. **Update metadata** — set `last_updated` to today's date
6. **Confirm with user** — show the changes and get approval

## Gotchas

- **Skipping trust boundary identification and jumping straight to STRIDE.** Without drawing data flow diagrams and marking trust boundaries first, agents enumerate threats randomly and miss the most critical attack surfaces where data crosses from untrusted to trusted zones.
- **Treating all STRIDE categories equally for every component.** Not every component faces all six threat categories. A static content delivery endpoint does not face Elevation of Privilege the same way an admin API does. Focus analysis where each category is realistic.
- **Writing mitigations that are too vague to implement.** "Validate all inputs" is not a mitigation. "Rate limit login to 5 attempts/IP/10 minutes with CAPTCHA after 3 failures" is a mitigation. Every control must be specific enough for an engineer to implement directly.
- **Forgetting to document residual risk.** A mitigation reduces risk but rarely eliminates it. Agents that mark a threat as "mitigated" without documenting what risk remains give a false sense of security. Always note the residual risk level after controls are applied.
- **Ignoring repudiation threats.** Agents frequently skip the "R" in STRIDE because it seems less critical than spoofing or injection. Repudiation matters for any system with financial transactions, admin actions, or compliance requirements where audit trails are legally necessary.

## Handoff

**Reads from:**
- `7-system-architecture.md` — system components, trust zones, data flows
- `8-database-design-document.md` — data storage, sensitivity classification
- `9-api-design-document.md` — API surface, authentication mechanisms
- `11-admin-access-control-specification.md` — privilege model, trust boundaries

**Feeds into:**
- `13-design-system-specification.md` — security UX requirements (auth flows, error states)
- `14-technical-blueprint.md` — security requirements and mitigations for feature designs
- `15-implementation-plan.md` — security controls sequenced in build phases

## Quality Gate

Before marking this document as `final`, verify:
- [ ] Data flow diagrams with trust boundaries are drawn before any STRIDE analysis begins
- [ ] Every threat has a specific, implementable mitigation (not generic advice like "validate inputs")
- [ ] Residual risk is documented for every mitigated threat
- [ ] All six STRIDE categories are considered for each component (even if some are marked "Not Applicable" with justification)
- [ ] The risk register is prioritized with named owners and target dates for High/Critical items

## Next Steps

After this document is complete, proceed to:
- **`technical-blueprint`** — design feature implementations with security mitigations incorporated
- **`implementation-plan`** — sequence security controls into the build phases
- Or invoke `using-engineering-docs` to continue the pipeline
