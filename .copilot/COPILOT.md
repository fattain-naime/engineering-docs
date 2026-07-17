# Engineering Docs - GitHub Copilot Instructions

## Purpose

This plugin provides **22 engineering documentation skills** covering the complete software development lifecycle - from raw project idea through planning, design, architecture, security, testing, deployment, and operations.

## Auto-Trigger Rules

Read the user's request and match it to the correct skill using the trigger phrases below. When the user has a raw idea and doesn't know which documents they need, always invoke `using-engineering-docs` first.

| Trigger Phrases | Invoke Skill |
| :--- | :--- |
| "I have an idea", "help me plan this", "I want to build", "turn this into documents" | `using-engineering-docs` |
| "business concept", "business plan", "value proposition", "monetization" | `business-concept` |
| "project plan", "delivery plan", "milestones", "RACI matrix" | `project-plan` |
| "user personas", "who is this for", "target user" | `user-personas-behavior` |
| "write a spec", "requirements for", "SRS" | `technical-specification` |
| "is this feasible", "can we build", "PoC" | `technical-feasibility-study` |
| "user flow", "UX flow", "screen flow" | `ux-flow-specification` |
| "design system", "style guide", "UI specification" | `design-system-specification` |
| "document the architecture", "system architecture", "C4 diagram" | `system-architecture-document` |
| "document this decision", "write an ADR" | `architecture-decision-record` |
| "database design", "schema for", "ERD" | `database-design-document` |
| "design this API", "API spec", "OpenAPI" | `api-design-document` |
| "access control", "permissions", "RBAC" | `admin-access-control-specification` |
| "design this feature", "technical design", "TDD" | `technical-blueprint` |
| "threat model", "security review", "STRIDE" | `security-threat-model` |
| "test strategy", "QA plan", "testing framework" | `test-strategy-document` |
| "implementation plan", "build order", "build sequence" | `implementation-plan` |
| "deployment plan", "release plan", "how do we deploy" | `deployment-plan` |
| "SLO for", "error budget", "reliability target" | `slo-error-budget-document` |
| "write a runbook", "operations manual", "on-call guide" | `technical-runbook` |
| "disaster recovery", "DR plan", "RTO", "RPO" | `disaster-recovery-plan` |
| "post-mortem", "incident report", "root cause" | `incident-postmortem` |

## Behavioral Standards

- **Orchestrator first:** When a user has a raw idea, ALWAYS invoke `using-engineering-docs`. It handles skill selection and sequencing automatically.
- **Mandatory Socratic Brainstorming:** Every skill execution begins with an interactive clarifying phase. Ask **3-5 targeted questions** before generating any document.
- **Never ask the user to pick a skill.** Match and invoke automatically.
- **Never hallucinate.** If domain knowledge is missing, ask targeted clarifying questions.
- **Treat every output as production-ready.** A senior engineer must be able to hand this document to a team without modification.
- **Inline gap tagging:** tag unresolved assumptions as `🔶 Assumption` and unknowns as `🔵 Open Question`.
- **Cross-document consistency:** Verify entity names, roles, and decisions are consistent across all documents.
- **Living documents:** remind the user to version-control all output documents alongside their codebase.
