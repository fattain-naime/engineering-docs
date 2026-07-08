# engineering-docs

> 11 world-class engineering documentation skills for AI coding agents. Auto-triggers on user intent. No manual selection needed.

Built to the standard of a 20+ year senior engineer. Grounded in ISO/IEC/IEEE 29148, C4 Model, ADR Pattern, STRIDE Threat Modeling, OpenAPI 3.1, Google SRE Runbook standards, and blameless post-mortem culture.

---

## Skills Included

| # | Skill | What It Produces | When It Triggers |
| :- | :--- | :--- | :--- |
| 1 | `technical-specification` | SRS / TSD (requirements document) | "write a spec for...", "requirements for..." |
| 2 | `technical-feasibility-study` | Technical feasibility assessment | "is this feasible?", "PoC for...", "can we build..." |
| 3 | `system-architecture-document` | SAD with C4 diagrams + ADR log | "document the architecture of...", "C4 diagram for..." |
| 4 | `technical-blueprint` | TDD / SDD (design doc) | "design this feature...", "how do we build..." |
| 5 | `api-design-document` | OpenAPI 3.1 aligned API contract | "design this API...", "REST API spec for..." |
| 6 | `database-design-document` | ERD + schema + data dictionary | "database design for...", "schema for...", "ERD for..." |
| 7 | `architecture-decision-record` | Immutable ADR per decision | "document this decision...", "write an ADR for..." |
| 8 | `security-threat-model` | STRIDE threat model + mitigations | "threat model for...", "security risks of..." |
| 9 | `deployment-plan` | Release plan + rollback procedure | "deployment plan for...", "how do we release..." |
| 10 | `technical-runbook` | Production operations runbook | "write a runbook for...", "ops manual for..." |
| 11 | `incident-postmortem` | Blameless RCA report | "post-mortem for...", "root cause of..." |

---

## Installation

### Gemini (Antigravity)

```bash
# Global install (available across all workspaces)
cp -r engineering-docs ~/.gemini/config/plugins/engineering-docs

# Workspace install (current project only)
cp -r engineering-docs .agents/skills/engineering-docs
```

### Claude Code

```bash
cp -r engineering-docs ~/.claude/plugins/engineering-docs
```

Or add to your `.claude/CLAUDE.md`:
```markdown
@engineering-docs/CLAUDE.md
```

### Cursor / Windsurf

Copy the `skills/` directory contents into your `.cursor/rules/` or `.windsurfrules` directory, one rule file per skill.

### GitHub Copilot / Codex

Copy the `AGENTS.md` content into your repository's `AGENTS.md` or `.github/copilot-instructions.md`.

---

## Usage

**You never need to manually invoke a skill.** Simply describe what you need:

> "Write a technical specification for a JWT-based authentication service."

> "Design the database schema for a multi-tenant SaaS billing system."

> "Document our decision to use PostgreSQL instead of MongoDB."

> "Write a post-mortem for last night's payment processing outage."

The agent will automatically detect intent and apply the correct skill.

---

## Standards Reference

| Skill | Standard |
| :--- | :--- |
| `technical-specification` | ISO/IEC/IEEE 29148:2018 |
| `system-architecture-document` | C4 Model, 4+1 View Model (Kruchten), IEEE 1471 |
| `api-design-document` | OpenAPI 3.1, REST Maturity Model (Richardson), AsyncAPI 2.x |
| `architecture-decision-record` | ADR Pattern (Michael Nygard), MADR |
| `security-threat-model` | STRIDE (Microsoft SDL), OWASP Threat Modeling |
| `technical-runbook` | Google SRE Book, ITIL v4 |
| `incident-postmortem` | Google SRE Blameless Post-mortem Culture |
| `deployment-plan` | DORA Metrics, Blue-Green / Canary / Rolling deployment patterns |

---

## Contributing

See `CONTRIBUTING.md` for skill authoring standards. Each skill must include:
- `SKILL.md` with valid YAML frontmatter
- `template.md` that is fully self-guiding

---

## License

MIT. See `LICENSE`.
