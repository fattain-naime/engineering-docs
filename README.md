# Engineering Docs

`engineering-docs` is a complete software engineering documentation and system design methodology for your coding agents. It provides a set of 11 composable, auto-triggering skills and manifests that ensure your agent designs, specifies, models, deploys, and operates code to the standard of a 20+ year principal engineer.

---

## Quickstart

Give your agent principal-level documentation skills instantly:

```bash
npx engineering-docs
```

Select your environment: [Gemini (Antigravity)](#gemini-antigravity), [Claude Code](#claude-code), [Cursor / Windsurf](#cursor--windsurf), [Kimi Code](#kimi-code), or [Codex / Copilot](#codex--copilot).

---

## How It Works

It starts from the moment you ask your agent to draft, design, or outline any feature, database schema, API endpoint, or infrastructure rollout. Instead of generating vague bullet points or raw code directly, the agent automatically triggers the correct skill:

1. It **structures the context** using industry-standard engineering formats (ISO/IEC/IEEE 29148, C4 Model, STRIDE).
2. It **surfaces gaps** by explicitly marking assumptions (`🔶 Assumption`) and unknowns (`🔵 Open Question`).
3. It **generates self-guiding templates** complete with Mermaid diagrams, edge-case test matrices, and automated rollback checklists.
4. Because the manifests auto-trigger based on semantic intent, you do not need to manually configure them. Your agent simply documents like a principal engineer.

---

## What's Inside

The skills library is organized into four key phases of the software engineering lifecycle:

### 📋 1. Specification & Feasibility
*   **[technical-specification](skills/technical-specification)** — Produce complete, ISO/IEC/IEEE 29148-aligned Software Requirements Specifications (SRS/TSD). Formulates strict functional and non-functional requirements (NFRs) using EARS syntax.
*   **[technical-feasibility-study](skills/technical-feasibility-study)** — Assess the technical viability, resource requirements, timelines, and operational risks of a concept before writing code.

### 🏛️ 2. Architectural Design
*   **[system-architecture-document](skills/system-architecture-document)** — Document full system architecture using Kruchten's 4+1 View Model and Simon Brown's C4 Model (Context, Container, and Component Mermaid diagrams).
*   **[technical-blueprint](skills/technical-blueprint)** — Google/Stripe-quality design docs (TDD) focusing on detailed design, data modeling, and trade-off comparisons.
*   **[api-design-document](skills/api-design-document)** — Design production-ready API contracts (REST/OpenAPI 3.1) with consistent schemas, Richardson Maturity targets, and RFC 7807 problem details.
*   **[database-design-document](skills/database-design-document)** — Model logical schemas, ERDs, and data dictionaries down to indexes, cascades, and migration rollback scripts.
*   **[architecture-decision-record](skills/architecture-decision-record)** — Write immutable, append-only logs (MADR standard) capturing the rationale, alternatives, and trade-offs of architectural decisions.

### 🛡️ 3. Risk & Security
*   **[security-threat-model](skills/security-threat-model)** — Systematically analyze system components for security risks using Microsoft STRIDE and OWASP threat models.

### 🚀 4. Deployment & Operations
*   **[deployment-plan](skills/deployment-plan)** — Create highly detailed production runsheets specifying rollout phases, go/no-go gates, Sentry/Grafana metrics, and explicit rollback steps.
*   **[technical-runbook](skills/technical-runbook)** — Operations manuals (Google SRE Book standard) linking alerts to diagnostics, mitigations, and escalation paths.
*   **[incident-postmortem](skills/incident-postmortem)** — Write blameless post-incident reviews (RCA) using Five Whys to transform operational outages into systemic hardening.

---

## Multi-Agent Compatibility

`engineering-docs` provides native configurations for all major agentic frameworks:

| Platform | Manifest Format | Global Installation Path |
| :--- | :--- | :--- |
| **Gemini (Antigravity)** | `gemini-extension.json` & `GEMINI.md` | `~/.gemini/config/plugins/engineering-docs/` |
| **Claude Code** | `.claude-plugin/plugin.json` & `marketplace.json` | `~/.claude/plugins/engineering-docs/` |
| **Cursor / Windsurf** | `.cursor-plugin/plugin.json` | Copy `.mdc` rules to `./.cursor/rules/` |
| **Kimi Code** | `.kimi-plugin/plugin.json` | Local/Global plugin directory |
| **Copilot / Codex** | `.codex-plugin/plugin.json` | Workspace root |

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

---

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

- **Fattain Naime** — [iamnaime@builderhall.com](mailto:iamnaime@builderhall.com)
- **Repository**: [https://github.com/fattain-naime/engineering-docs](https://github.com/fattain-naime/engineering-docs)

---

## License

MIT. See [LICENSE](LICENSE).
