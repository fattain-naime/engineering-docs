# Engineering Docs

`engineering-docs` is a complete software engineering documentation and system design methodology for your coding agents. It provides **21 composable, auto-triggering skills** and manifests that ensure your agent designs, specifies, models, deploys, and operates code to the standard of a 20+ year principal engineer.

---

## Quickstart

Give your agent principal-level documentation skills instantly:

```bash
npx engineering-docs
```

Select your environment: [Gemini (Antigravity)](#gemini-antigravity), [Claude Code](#claude-code), [Cursor / Windsurf](#cursor--windsurf), [Kimi Code](#kimi-code), or [Codex / Copilot](#codex--copilot).

---

## How It Works (Socratic & Interactive)

It starts from the moment you ask your agent to draft, design, or outline any feature, database schema, API endpoint, or infrastructure rollout. Instead of generating vague bullet points or raw code directly, the agent automatically triggers the correct skill:

1. **Interactive Socratic Brainstorming**: The agent will first interrogate your initial prompt, identify technical/scope unknowns, and **ask you 3-5 targeted clarifying questions** to dig deeper before creating any document templates.
2. **Context Structuring**: Once aligned, the agent structures the design using industry-standard formats (ISO/IEC/IEEE 29148, C4 Model, STRIDE).
3. **Gap Identification**: Gaps and assumptions are explicitly marked with `🔶 Assumption` and `🔵 Open Question` tags.
4. **Self-Guiding Documentation**: The agent outputs fully populated, premium templates containing Mermaid diagrams, edge-case test matrices, and automated rollback checklists.

---

## What's Inside

The skills library covers the **complete software engineering lifecycle** across five phases:

### 0. Discovery & Planning

Start here when you have an idea and need to figure out what to build and for whom.

*   **[using-engineering-docs](skills/using-engineering-docs)** - The orchestrator skill. Give it a raw idea and it interviews you, selects the right skills, and sequences all 21 documents automatically. Never manually pick a skill again.
*   **[project-plan](skills/project-plan)** - Delivery timeline, milestones, RACI matrix, and work-breakdown structure. The project manager's source of truth.
*   **[user-personas-behavior](skills/user-personas-behavior)** - Structured user personas with jobs-to-be-done, behavioral patterns, success metrics, and analytics measurement plan.

### 1. Specification & Feasibility
*   **[technical-specification](skills/technical-specification)** - Complete, ISO/IEC/IEEE 29148-aligned Software Requirements Specifications (SRS/TSD) using EARS syntax for functional and non-functional requirements.
*   **[technical-feasibility-study](skills/technical-feasibility-study)** - Assess the technical viability, resource requirements, timelines, and operational risks of a concept before writing code.

### 2. Architectural & Product Design
*   **[ux-flow-specification](skills/ux-flow-specification)** - User flow diagrams, screen states, information architecture, and interaction patterns for every user-facing feature.
*   **[design-system-specification](skills/design-system-specification)** - Production-ready visual style guide: color tokens, typography scales, spacing system, component states, and accessibility rules.
*   **[system-architecture-document](skills/system-architecture-document)** - Full system architecture using the C4 Model and 4+1 View Model with Mermaid diagrams.
*   **[architecture-decision-record](skills/architecture-decision-record)** - Immutable MADR-standard logs capturing the rationale, alternatives, and trade-offs of architectural decisions.
*   **[database-design-document](skills/database-design-document)** - Logical schemas, ERDs, and data dictionaries down to indexes, cascades, and migration rollback scripts.
*   **[api-design-document](skills/api-design-document)** - Production-ready REST/OpenAPI 3.1 API contracts with Richardson Maturity targets and RFC 7807 error handling.
*   **[admin-access-control-specification](skills/admin-access-control-specification)** - Role matrix, RBAC policy, privilege level definitions, break-glass procedures, and audit logging plan.
*   **[technical-blueprint](skills/technical-blueprint)** - Google/Stripe-quality Technical Design Documents (TDD) for individual features: data modeling, component design, and trade-off comparisons.

### 3. Risk & Quality
*   **[security-threat-model](skills/security-threat-model)** - STRIDE + OWASP threat analysis identifying attack surfaces, trust boundaries, and concrete mitigations.
*   **[test-strategy-document](skills/test-strategy-document)** - QA plans mapping unit, integration, and E2E layers with mocking contracts, test isolation rules, and CI pipeline runsheets.
*   **[implementation-plan](skills/implementation-plan)** - Dependency-ordered technical build sequence with phase gates, interface contracts, and parallel-track identification.

### 4. Deployment & Operations
*   **[deployment-plan](skills/deployment-plan)** - Detailed production runsheets: rollout phases, go/no-go gates, monitoring thresholds, and explicit rollback procedures.
*   **[slo-error-budget-document](skills/slo-error-budget-document)** - SLI definitions, SLO targets, error budget policy, burn-rate alert thresholds, and consequences of budget exhaustion.
*   **[technical-runbook](skills/technical-runbook)** - Operations manuals (Google SRE standard) linking alerts to diagnostics, mitigations, and escalation paths.
*   **[disaster-recovery-plan](skills/disaster-recovery-plan)** - RTO/RPO targets, backup strategy, failover procedures, and business continuity playbook.
*   **[incident-postmortem](skills/incident-postmortem)** - Blameless post-incident reviews (RCA) using Five Whys to transform operational outages into systemic hardening.

---

## Multi-Agent Compatibility

`engineering-docs` provides native configurations for all major agentic frameworks:

| Platform | Manifest Format | Installation Path |
| :--- | :--- | :--- |
| **Gemini (Antigravity)** | `gemini-extension.json` + `GEMINI.md` | `~/.gemini/config/plugins/engineering-docs/` |
| **Claude Code** | `.claude-plugin/plugin.json` + `CLAUDE.md` | `~/.claude/plugins/engineering-docs/` |
| **Cursor / Windsurf** | `.cursor-plugin/plugin.json` | `./.cursor/rules/engineering-docs-*.mdc` |
| **Kimi Code** | Plugin directory | `~/.kimi-code/plugins/engineering-docs/` |
| **Codex / GitHub Copilot** | Plugin directory | `./.codex/engineering-docs/` |

---

## Installation

### The Quickest Way (CLI Installer)

Run the NPM initializer to automatically detect and copy the plugin folder based on your preferred harness:

```bash
npx engineering-docs
```

---

### Harness-Specific Guides

#### Gemini (Antigravity)

Run the direct installation command to copy the files to your global Gemini plugin path:

```bash
npx engineering-docs --gemini
```

Or clone the repository manually:
```bash
git clone https://github.com/fattain-naime/engineering-docs.git ~/.gemini/config/plugins/engineering-docs
```

#### Claude Code

Run the direct installation command:

```bash
npx engineering-docs --claude
```

Alternatively, register the repository as a custom marketplace source directly inside Claude Code:

```bash
/plugin marketplace add fattain-naime/engineering-docs
/plugin install engineering-docs@engineering-docs
```

#### Cursor / Windsurf

Run the installer pointing to your local workspace:

```bash
npx engineering-docs --cursor
```

This extracts each skill manifest directly into `.cursor/rules/engineering-docs-[name].mdc` so they auto-trigger when you converse with Cursor's Composer or Agent.

#### Kimi Code

Run the direct installation command:

```bash
npx engineering-docs --kimi
```

Or install inside Kimi Code:
```text
/plugins install https://github.com/fattain-naime/engineering-docs
```

#### Codex / GitHub Copilot

Run the direct installation command:

```bash
npx engineering-docs --codex
```

This installs the plugin to `.codex/engineering-docs/` in your current workspace.

---

## Cross-Platform Scripts

Alternative to `npx` - use the bundled shell scripts directly:

### Windows (PowerShell)

```powershell
# Interactive menu
pwsh scripts\setup.ps1

# Direct install
pwsh scripts\setup.ps1 -Target gemini
pwsh scripts\setup.ps1 -Target claude
pwsh scripts\setup.ps1 -Target local
pwsh scripts\setup.ps1 -Target cursor
pwsh scripts\setup.ps1 -Target kimi
pwsh scripts\setup.ps1 -Target codex
```

### Linux / macOS (Bash)

```bash
# Make executable first
chmod +x scripts/setup.sh

# Interactive menu
./scripts/setup.sh

# Direct install
./scripts/setup.sh --gemini
./scripts/setup.sh --claude
./scripts/setup.sh --local
./scripts/setup.sh --cursor
./scripts/setup.sh --kimi
./scripts/setup.sh --codex
```

### Safe-Write Behavior

All install methods (npx, PowerShell, bash) use **safe-write** for the three agent config files:

| File | Behavior |
|---|---|
| `AGENTS.md` | Created at destination only if it does not already exist |
| `GEMINI.md` | Created at destination only if it does not already exist |
| `CLAUDE.md` | Created at destination only if it does not already exist |

If a file already exists at the destination, the install script skips it and logs a message. **Your customizations are always preserved.**

## Philosophy

- **Systemic over Ad-hoc**: Rigorous, reproducible processes yield safer and cleaner software.
- **Traceability**: Every system requirement must link to a business goal and a test case.
- **Visual-First**: Complex architectures are mapped out visually with text-friendly, Git-trackable Mermaid diagrams.
- **Operational Safety**: No feature is complete without a deployment runsheet, monitoring thresholds, and a rollback plan.
- **Blameless Learning**: Production failures are data points for system hardening, not opportunities for human blame.

---

## Contributing

We welcome community skills! Please review [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines on YAML frontmatter manifests, intent definitions, and coaching block requirements.

---

## Author

- **Fattain Naime** - [iamnaime.info.bd](https://iamnaime.info.bd)
- **Repository**: [https://github.com/fattain-naime/engineering-docs](https://github.com/fattain-naime/engineering-docs)

---

## License

MIT. See [LICENSE](LICENSE).
