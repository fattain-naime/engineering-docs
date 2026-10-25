# Testing Claude Code plugins

How to test a Claude Code plugin with the official CLI: `validate`, `eval`,
`--plugin-dir`, and the Plugin Developer Toolkit. Every command below was run
against `@anthropic-ai/claude-code` **2.1.305** on **2026-10-21**.

## TL;DR

```bash
# Install a current CLI (plugin eval needs >= 2.1.269)
npm install -g @anthropic-ai/claude-code@latest
claude --version   # confirm 2.1.269+

# Static checks (no model calls, no login)
claude plugin validate .

# Author an eval suite
claude plugin eval init              # interactive interview
claude plugin eval init --bare first-case   # blank single-case template

# Run the suite (needs the same auth as a normal session)
claude plugin eval . --trust-plugin --no-publish

# Load a plugin for one session without installing it
claude --plugin-dir ./my-plugin

# Install the official Plugin Developer Toolkit
claude plugin marketplace add anthropics/claude-plugins-official
claude plugin install plugin-dev@claude-plugins-official
```

## Requirements

| Requirement | Notes |
| :--- | :--- |
| Claude Code **v2.1.269+** | Official minimum for `claude plugin eval`. Check with `claude --version`. |
| Git **2.31+** | Optional. Older git makes eval refuse to start; no git at all runs normally. |
| A plugin directory | `plugin.json` or `.claude-plugin/plugin.json`, or a skills-dir plugin. |
| Auth | `eval` and judge graders are real model calls. Use the same credentials as interactive sessions (`ANTHROPIC_API_KEY`, OAuth, Bedrock/Vertex/Foundry). |

`claude plugin validate` and `claude plugin eval init --bare` need no model
calls and no login — only `eval`, `eval init` (interview), and interactive
sessions call the model.

## Command surface

Full inventory from `claude plugin --help` on 2.1.305:

| Command | What it does |
| :--- | :--- |
| `claude plugin validate <path>` | Schema-check a plugin or marketplace manifest, or the skills/agents/commands in a directory. No model calls. |
| `claude plugin eval [target]` | Run the eval suite against a path, plugin name, or `plugin@marketplace`. |
| `claude plugin eval init [name]` | Interactive interview that authors cases under `evals/`. |
| `claude plugin eval init --bare <name>` | Write a blank `prompt.md` + `graders/criteria.md` instead of interviewing. |
| `claude plugin init\|new <name>` | Scaffold a new plugin at `~/.claude/skills/<name>/`. |
| `claude plugin install\|i <plugin>` | Install from a configured marketplace (`name@marketplace`). |
| `claude plugin uninstall\|remove <plugin>` | Uninstall. |
| `claude plugin list` | List installed plugins. |
| `claude plugin details <name>` | Component inventory + projected always-on / on-invoke token cost. |
| `claude plugin update <plugin>` | Update to the latest version. |
| `claude plugin enable\|disable [plugin]` | Toggle a plugin without uninstalling. |
| `claude plugin configure <plugin>` | Show/set the plugin's options (`--values-stdin` for scripting). |
| `claude plugin marketplace add\|list\|update\|remove` | Manage marketplaces (GitHub repo, URL, or local path). |
| `claude plugin tag [path]` | Create a `{name}--v{version}` release tag after checking manifest/marketplace agreement. |
| `claude plugin test [dir]` | Run a mod's `*.test.ts` files against the `claude-code/testing` kit. |
| `claude plugin prune\|autoremove` | Drop auto-installed dependencies that are no longer needed. |

Related top-level flag (not under `plugin`):

```bash
claude --plugin-dir ./my-plugin          # load a plugin for this session only
claude --plugin-dir A --plugin-dir B.zip # repeatable; folders of plugins load each child
claude --plugin-url https://…/plug.zip  # fetch a .zip for this session only
```

## `claude plugin validate`

Static validation. No credentials, no network model calls.

```bash
claude plugin validate .                        # the plugin in cwd
claude plugin validate . --json                 # machine-readable report
claude plugin validate . --strict               # warnings become errors (exit 1)
claude plugin validate . --profile directory    # also fail what a catalog submission would refuse
claude plugin validate .claude-plugin/marketplace.json
```

Exit codes: `0` success (warnings allowed unless `--strict`), `1` failure.

What it checks:

- Manifest fields (`name`, `description`, …) and marketplace entry shape.
- Cross-file version agreement: marketplace `plugins[].version` vs `plugin.json`.
- Plugin-directory profile (`--profile directory`): README, LICENSE (or a
  `license` SPDX id in `plugin.json`), icon, and a bounded file inventory.
- Skills, agents, and commands discovered in the directory.

Empirical results from this run:

```text
# anthropics/claude-plugins-official · plugins/plugin-dev
✔ Validation passed with warnings
  ⚠ version: No version specified
  ⚠ ICON_MISSING

# this repository (before the fix in this PR)
⚠ plugins[0].version: Entry declares "1.2.1" but plugin.json says "1.2.2"
✔ Validation passed with warnings   # exit 0 without --strict

# scratch plugin, --strict --profile directory
✘ Validation failed                # exit 1: README_MISSING, LICENSE_MISSING
```

`claude plugin validate` caught a marketplace version skew that
`node scripts/sync-version.js` missed (it only rewrites top-level `version`
keys, not `plugins[].version`). Fix by hand or extend the sync script.

## `claude plugin eval`

Runs each case as an isolated `claude -p` child with only the plugin loaded,
then scores the result with graders. Requires auth.

```bash
cd my-plugin
claude plugin eval .                       # every case under evals/
claude plugin eval . --trust-plugin        # skip the first-run trust prompt (CI)
claude plugin eval . --case first-case --runs 1 --ablation none
claude plugin eval . --json results.json --no-publish --threshold 0.8
claude plugin eval plugin-name@claude-plugins-official
```

Important flags:

| Flag | Purpose |
| :--- | :--- |
| `--trust-plugin` | Assert trust for CI / non-TTY. Without it, a non-interactive run is refused (exit 1). |
| `--runs <n>` | Runs per case per arm (default: case `runs` ?? 3). |
| `-j, --concurrency <n>` | Parallel agent runs, 1–8. They share one rate limit. |
| `--ablation with-without\|none` | Default is with-without when a plugin resolves: each case also runs a no-plugin baseline and reports Δ. |
| `--threshold <0..1>` | Exit 1 if any with-arm score is below this (default 1.0). |
| `--max-cost-usd <usd>` | Hard cost ceiling; exit 2 with partial results if hit. |
| `--allow-tools <tools…>` | Grant Bash/Write/Edit/WebFetch/WebSearch (or `mcp__*`) for every case. |
| `--mocks record\|off` | MCP stand-ins from `evals/mocks/` (default record; real servers do not start). |
| `--allow-real-servers` | Start real MCP processes for servers that have no mock. |
| `--judge-model <model>` | Model for `llm` / `baseline` graders (default: haiku). |
| `--no-publish` | Keep the HTML report local. |
| `--keep-temp` | Preserve sandbox dirs for debugging. |

Exit codes (official contract, confirmed empirically for auth):

| Code | Meaning |
| :--- | :--- |
| 0 | Every case met `--threshold`. |
| 1 | A case below threshold, invalid case file, no cases, untrusted dir without `--trust-plugin`, bad option. |
| 2 | Partial: cost ceiling hit, or credential rejected at/before the first run. |
| 130 / 143 | Interrupted / terminated. |

Auth-failure sample (`claude plugin eval . --trust-plugin --runs 1 --ablation none`, no login):

```text
Plugin under test: "test-plugin" version "0.1.0"
first-case run 1/1: score 0.00  error: exit 1: Not logged in · Please run /login
✗ first-case  score 0.00
Report: …/evals/results/2026-10-21T00-23-46-614Z/report.html
1 case(s) · 1s · $0.00 · ⚠ partial (stopped: authentication failed)
exit: 2
```

JSON (`--json`) records `"partial": true`, `"partialReason": "auth_failed"`,
and still writes `aggregate-result.json` / `report.html`.

### Case layout

```text
my-plugin/
├── .claude-plugin/plugin.json
└── evals/
    ├── first-case/
    │   ├── prompt.md            # frontmatter: case fields; body: the prompt
    │   └── graders/
    │       ├── criteria.md      # type: llm — rubric for the judge
    │       └── skill-fired.md   # type: tool_used — did the skill fire?
    └── results/                 # written by each run; gitignore it
```

`claude plugin eval init --bare first-case` writes exactly:

```markdown
# evals/first-case/prompt.md
---
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

TODO: describe what the agent should do
```

```markdown
# evals/first-case/graders/criteria.md
---
type: llm
weight: 1
---

TODO: describe what a successful response looks like
```

Unknown frontmatter keys are hard errors. Grader types: `regex`, `tool_used`,
`tool_order`, `file_exists`, `llm`, `baseline`. The "skill must not fire"
pattern is `arm: both` with `min: 0` / `max: 0` on a `tool_used` grader.

### Isolation notes that affect tests

- Each run gets a temporary home, cwd, and Claude Code config. No user
  settings, other plugins, `CLAUDE.md`, or project `.claude/` load.
- Case definitions (prompt, graders, siblings) are hidden from the agent.
- Scaffold scripts (`context.scaffold_script`) run only with `--scaffold`.
- Real MCP servers start only with `--allow-real-servers` or `--mocks off`.
- Hooks and real MCP servers run as you, outside the agent sandbox — treat
  scores from plugins you did not write as advisory unless you run them in a
  container.

## `claude plugin eval init`

```bash
claude plugin eval init                # interview in a terminal
claude plugin eval init --bare my-case # blank template, no interview
claude plugin eval init --eval-dir qa  # write under qa/ instead of evals/
```

Without a TTY, the interview is skipped automatically:

```text
No TTY available — writing a blank template. Re-run in a terminal for the authoring interview.
Created evals/second-case/prompt.md and evals/second-case/graders/criteria.md
```

In CI, always use `--bare`.

## `claude --plugin-dir`

Load a plugin for one session without installing it. Same trust decision as
`eval` — only point it at code you would run yourself.

```bash
claude --plugin-dir ./my-plugin
claude --plugin-dir ./my-plugin -p 'List your available skills.' --max-turns 1
claude --plugin-dir /path/to/plugin-dev   # load an unpacked toolkit for one session
```

Without credentials this prints `Not logged in · Please run /login` — the
flag itself is accepted; only the model call fails.

## Plugin Developer Toolkit

Official catalog plugin:  
https://github.com/anthropics/claude-plugins-official/tree/main/plugins/plugin-dev

### Install (2026-10-21)

```bash
claude plugin marketplace add anthropics/claude-plugins-official
claude plugin install plugin-dev@claude-plugins-official
claude plugin list
claude plugin details plugin-dev@claude-plugins-official
```

Observed install:

```text
✔ Successfully added marketplace: claude-plugins-official
✔ Successfully installed plugin: plugin-dev@claude-plugins-official (scope: user)

Installed plugins:
  ❯ plugin-dev@claude-plugins-official
    Version: 5d6e71434145          # git short sha at install time
    Status: ✔ enabled
```

Installed path (user scope):
`~/.claude/plugins/cache/claude-plugins-official/plugin-dev/<sha>`.

### Inventory

`claude plugin details plugin-dev@claude-plugins-official`:

| Component | Count | Names |
| :--- | :--- | :--- |
| Skills | 8 | `agent-development`, `command-development`, `create-plugin`, `hook-development`, `mcp-integration`, `plugin-settings`, `plugin-structure`, `skill-development` |
| Agents | 3 | `plugin-validator`, `skill-reviewer`, `agent-creator` |
| Commands | 1 | `create-plugin` |
| Hooks / MCP / LSP | 0 | — |

Always-on token cost ≈ 1,704 tokens per session.

### Validate the toolkit

```bash
claude plugin validate ~/.claude/plugins/cache/claude-plugins-official/plugin-dev/<sha>
# or against the marketplace checkout:
claude plugin validate /path/to/claude-plugins-official/plugins/plugin-dev
```

```text
✔ Validation passed with warnings
  ⚠ version: No version specified
  ⚠ ICON_MISSING
```

### Use it while developing this plugin

With `plugin-dev` installed (user scope), a session at the plugin root can
invoke its skills and agents, for example:

- `/create-plugin` — scaffold a new plugin
- Ask for the `plugin-validator` agent to re-check structure after a change
- Use the `plugin-structure` / `skill-development` skills as reference while
  editing skills

Or load the unpacked plugin for one session only:

```bash
claude --plugin-dir ~/.claude/plugins/cache/claude-plugins-official/plugin-dev/<sha>
```

Note: the marketplace name `claude-plugins-official` is reserved. A local
clone cannot `marketplace add` under that name; use the GitHub source
(`anthropics/claude-plugins-official`) or a different local name.

## CI

Two layers:

1. **`claude plugin validate`** — free, no secrets beyond a Claude Code
   install. Gate every PR.
2. **`claude plugin eval`** — real model calls. Needs credentials and
   `--trust-plugin`. Pin models and set a cost ceiling.

See `.github/workflows/claude-plugin-ci.yml` for a copy-paste workflow that
runs validate on every pull request and eval on demand.

```bash
claude plugin eval . \
  --trust-plugin \
  --json results.json \
  --threshold 0.8 \
  --model claude-sonnet-5 \
  --judge-model claude-haiku-4-5 \
  --no-publish \
  --max-cost-usd 20
```

Auth in CI: export `ANTHROPIC_API_KEY` (or your cloud provider variables) in
the job environment. The same variables can route Claude Code through a
gateway such as OpenRouter (`ANTHROPIC_BASE_URL` + `ANTHROPIC_AUTH_TOKEN`);
whatever the shell exports is inherited by each eval child.

## Troubleshooting

| Symptom | Fix |
| :--- | :--- |
| `Not logged in · Please run /login` | Export credentials, or run `/login` interactively. `eval` exits 2 with `partialReason: auth_failed`. |
| Exit 1 with no cases | Confirm the plugin root has `plugin.json` / `.claude-plugin/plugin.json` and cases live under the eval dir (`evals/` by default). |
| Trust prompt blocks CI | Pass `--trust-plugin`. Non-TTY runs without it are refused (exit 1). |
| Marketplace `add` fails: name reserved | `claude-plugins-official` must come from the `anthropics` GitHub org. Use `anthropics/claude-plugins-official`, not a local path under that name. |
| Version warning on marketplace entry | Align `plugins[].version` with `plugin.json` (plugin.json wins at install time). |
| `--strict` fails on warnings | Expected: `--strict` turns every warning into exit 1. Drop it unless you want catalog-grade cleanliness. |
| Sandbox errors when granting `Bash` | Need a sandbox backend (bubblewrap + socat on Linux; WSL2 on Windows). Without one, runs that grant Bash refuse rather than run unconfined. |
| Git older than 2.31 | Upgrade git, or accept that eval refuses to start. |
| `Skill called 0x` in every run, zero mock calls, agent says it has no tools | The model or gateway is not honoring Anthropic-style tool definitions, so the `Skill` tool never fires. Confirm with the uploaded traces (`/tmp/claude-eval-*/out/trace.jsonl`): check whether any `tool_use` block for `Skill` appears. If none, re-run the eval with a model known to support tool use (for example a Claude model) to separate a plugin problem from a model/gateway problem. |

## Further reading

- Plugin evals: https://code.claude.com/docs/en/plugin-evals
- CLI reference: https://code.claude.com/docs/en/cli-reference
- Manifest reference: https://code.claude.com/docs/en/plugins/manifest-reference
- Marketplace reference: https://code.claude.com/docs/en/plugins/marketplace-reference
- Official catalog: https://github.com/anthropics/claude-plugins-official
