# Engineering Docs - Agent Instructions

## Purpose

This plugin provides 11 engineering documentation skills that cover the complete software development lifecycle. The agent MUST automatically detect when a user needs any form of technical documentation and invoke the matching skill WITHOUT asking the user to manually select it.

## Auto-Trigger Rules

Read the user's request and match it to the correct skill using the trigger phrases below. If the intent is ambiguous, prefer the more specific skill (e.g., prefer `api-design-document` over `technical-blueprint` if the user explicitly mentions APIs).

| Trigger Phrases | Invoke Skill |
| :--- | :--- |
| "write a spec", "requirements for", "SRS for", "TSD for", "define requirements", "functional requirements", "system requirements" | `technical-specification` |
| "is this feasible", "can we build", "evaluate this technically", "PoC for", "proof of concept", "technical feasibility", "assess this idea" | `technical-feasibility-study` |
| "document the architecture", "system architecture for", "SAD for", "C4 diagram", "how does this system work", "architecture overview" | `system-architecture-document` |
| "design this feature", "technical design for", "design doc for", "TDD for", "how do we build", "engineering design", "technical approach" | `technical-blueprint` |
| "design this API", "API spec for", "API contract", "OpenAPI for", "REST API design", "GraphQL schema", "define the endpoints" | `api-design-document` |
| "database design", "schema for", "data model for", "ERD for", "database schema", "data dictionary", "table design" | `database-design-document` |
| "document this decision", "write an ADR", "record this decision", "why did we choose", "architecture decision", "we decided to use" | `architecture-decision-record` |
| "threat model", "security review", "STRIDE analysis", "security risks of", "what can go wrong security", "attack surface" | `security-threat-model` |
| "deployment plan", "release plan", "how do we deploy", "rollout plan", "blue-green", "canary deployment", "go-live plan" | `deployment-plan` |
| "write a runbook", "operations manual", "on-call guide", "how to operate", "ops runbook", "playbook for" | `technical-runbook` |
| "post-mortem", "postmortem", "incident report", "RCA for", "root cause", "blameless review", "what went wrong" | `incident-postmortem` |

## Behavioral Standards

- **Never ask the user to pick a skill.** Match and invoke automatically.
- **Never hallucinate.** If domain knowledge is missing, ask targeted clarifying questions using the skill's Input section.
- **Use the template.md** as the fill-in document for the output. Do not invent a different structure.
- **Treat every output as production-ready.** A senior engineer should be able to hand this document directly to a team without modification.
- **Apply the relevant industry standard** for each skill (see each SKILL.md's Key Concepts section).
- **Inline gap tagging:** tag unresolved assumptions as `🔶 Assumption` and unknowns as `🔵 Open Question`.
- **Living documents:** remind the user to version-control the output document alongside their codebase.
