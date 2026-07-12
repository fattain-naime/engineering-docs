# Engineering Docs - Agent Instructions

## Purpose

This plugin provides **21 engineering documentation skills** covering the complete software development lifecycle - from raw project idea through planning, design, architecture, security, testing, deployment, and operations. The agent MUST automatically detect when a user needs any form of technical documentation and invoke the matching skill WITHOUT asking the user to manually select it.

## Auto-Trigger Rules

Read the user's request and match it to the correct skill using the trigger phrases below. When the user has a raw idea and doesn't know which documents they need, always invoke `using-engineering-docs` first - it is the orchestrator that selects and sequences all other skills automatically.

| Trigger Phrases | Invoke Skill |
| :--- | :--- |
| "I have an idea", "help me plan this", "I want to build", "turn this into documents", "full project docs", "document my project", "idea to production", "help me figure out what documents" | `using-engineering-docs` |
| "project plan", "delivery plan", "milestones for", "RACI matrix", "work breakdown structure", "project timeline", "who owns what", "project kick-off plan" | `project-plan` |
| "user personas", "who is this for", "target user", "jobs-to-be-done", "analytics plan", "success metrics", "what should we measure", "define our users" | `user-personas-behavior` |
| "write a spec", "requirements for", "SRS for", "TSD for", "define requirements", "functional requirements", "system requirements", "what must the system do" | `technical-specification` |
| "is this feasible", "can we build", "evaluate this technically", "PoC for", "proof of concept", "technical feasibility", "assess this idea" | `technical-feasibility-study` |
| "user flow", "UX flow", "screen flow", "information architecture", "user journey map", "UI states", "what screens do we need", "how does the user move through" | `ux-flow-specification` |
| "design system for", "style guide for", "visual tokens for", "UI specification", "design.md", "design-system.md", "color palette", "typography scale" | `design-system-specification` |
| "document the architecture", "system architecture for", "SAD for", "C4 diagram", "how does this system work", "architecture overview", "system design" | `system-architecture-document` |
| "document this decision", "write an ADR", "record this decision", "why did we choose", "architecture decision", "we decided to use" | `architecture-decision-record` |
| "database design", "schema for", "data model for", "ERD for", "database schema", "data dictionary", "table design" | `database-design-document` |
| "design this API", "API spec for", "API contract", "OpenAPI for", "REST API design", "GraphQL schema", "define the endpoints" | `api-design-document` |
| "access control", "permissions for", "RBAC", "admin roles", "role matrix", "who can do what", "audit logging", "privilege levels", "break-glass access" | `admin-access-control-specification` |
| "design this feature", "technical design for", "design doc for", "TDD for", "how do we build", "engineering design", "technical approach" | `technical-blueprint` |
| "threat model", "security review", "STRIDE analysis", "security risks of", "what can go wrong security", "attack surface" | `security-threat-model` |
| "test strategy for", "QA plan for", "testing framework for", "test cases for", "test-strategy.md", "how do we test" | `test-strategy-document` |
| "implementation plan", "build order", "build sequence", "what order to build", "phase gates", "technical build sequence", "dependency-driven phases" | `implementation-plan` |
| "deployment plan", "release plan", "how do we deploy", "rollout plan", "blue-green", "canary deployment", "go-live plan" | `deployment-plan` |
| "SLO for", "error budget", "reliability target", "SLI definition", "burn-rate alert", "uptime target", "service level objective" | `slo-error-budget-document` |
| "write a runbook", "operations manual", "on-call guide", "how to operate", "ops runbook", "playbook for" | `technical-runbook` |
| "disaster recovery", "DR plan", "RTO", "RPO", "backup strategy", "failover plan", "business continuity", "what if the server dies" | `disaster-recovery-plan` |
| "post-mortem", "postmortem", "incident report", "RCA for", "root cause", "blameless review", "what went wrong" | `incident-postmortem` |

## Behavioral Standards

- **Orchestrator first:** When a user has a raw idea and doesn't know which documents they need, ALWAYS invoke `using-engineering-docs`. It handles skill selection and sequencing automatically.
- **Mandatory Socratic Brainstorming:** Every skill execution begins with an interactive clarifying phase. Ask **3-5 targeted questions** before generating any document. Do not generate the template until the user responds.
- **Never ask the user to pick a skill.** Match and invoke automatically based on trigger phrases above.
- **Never hallucinate.** If domain knowledge is missing, ask targeted clarifying questions.
- **Use the template.md** as the fill-in document for output. Do not invent a different structure.
- **Treat every output as production-ready.** A senior engineer must be able to hand this document to a team without modification.
- **Apply the relevant industry standard** for each skill (see each SKILL.md's Key Concepts section).
- **Inline gap tagging:** tag unresolved assumptions as `🔶 Assumption` and unknowns as `🔵 Open Question`.
- **Cross-document consistency:** When multiple documents are generated in sequence, verify entity names, roles, and decisions are consistent across all of them before delivering.
- **Living documents:** remind the user to version-control all output documents alongside their codebase.
