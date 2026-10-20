# Automating Claude Code in GitHub Actions with OpenRouter

Run the official `anthropics/claude-code-action` against OpenRouter so Claude Code can
validate, review, and check the repository automatically, without an Anthropic API key.

## TL;DR

1. Install the [Claude GitHub App](https://github.com/apps/claude) on the repository.
2. Add a repository secret named `OPENROUTER_API_KEY` containing your OpenRouter key.
3. Copy `examples/claude-code-openrouter.yml` into `.github/workflows/`.
4. Claude Code now reviews pull requests opened from branches in this repository (automation
   mode) and can answer `@claude` mentions (interactive mode). Fork and Dependabot pull requests
   cannot read the secret; see [Troubleshooting](#troubleshooting).

All routing is three environment variables: `ANTHROPIC_BASE_URL`, `ANTHROPIC_AUTH_TOKEN`,
and `ANTHROPIC_API_KEY`.

## How OpenRouter connects

OpenRouter exposes an endpoint that is wire-compatible with the Anthropic Messages API
(the "Anthropic Skin"). Point Claude Code at it and authenticate with a bearer token:

| Variable | Value | Notes |
| :--- | :--- | :--- |
| `ANTHROPIC_BASE_URL` | `https://openrouter.ai/api` | Include the scheme. Do **not** append `/v1`. |
| `ANTHROPIC_AUTH_TOKEN` | your OpenRouter key | Sent as `Authorization: Bearer <token>`. |
| `ANTHROPIC_API_KEY` | empty (`""`) when running locally | Stops Claude Code from falling back to Anthropic. In the GitHub Action this is populated from the `anthropic_api_key` input, which is fine. |
| `CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY` | `1` (optional) | Shows OpenRouter models in the `/model` picker. |

No local proxy is required. See the
[OpenRouter Claude Code guide](https://openrouter.ai/docs/guides/coding-agents/claude-code-integration)
for the upstream walkthrough.

## Model selection (read this before choosing "free")

OpenRouter is explicit: **Claude Code with OpenRouter is only guaranteed to work with the
Anthropic first-party provider.** Claude Code depends on Anthropic-specific request
semantics (native tool use, thinking blocks, its system prompt), and non-Anthropic models
are not guaranteed to honor them. Every `:free` model on OpenRouter today is non-Anthropic.

Two practical options:

- **Recommended for CI:** `anthropic/claude-haiku-5.5` (or its `:batch` variant). It is the
  cheapest Anthropic model on OpenRouter and fully supports Claude Code's tool protocol. A
  validation run costs a fraction of a cent.
- **Truly free:** one of the `:free` models, for example
  `minimax/minimax-m3.1-flash:free`, `thinkingmachines/inkling:free`, or
  `nvidia/nemotron-3.5-super-vl:free`. These advertise tool support, but expect intermittent
  failures and weaker instruction following. Use them for experiments, not as a hard CI gate.

There are currently no free Anthropic models on OpenRouter. If you want both free and
reliable, run Haiku on a schedule and use a free model only for best-effort checks.

Pin the model with `--model` for a single model, or route each model class explicitly:

```bash
export ANTHROPIC_MODEL="anthropic/claude-haiku-5.5"

# or pin each class:
export ANTHROPIC_DEFAULT_OPUS_MODEL="anthropic/claude-opus-5"
export ANTHROPIC_DEFAULT_SONNET_MODEL="anthropic/claude-sonnet-5"
export ANTHROPIC_DEFAULT_HAIKU_MODEL="anthropic/claude-haiku-5.5"
export CLAUDE_CODE_SUBAGENT_MODEL="anthropic/claude-haiku-5.5"
```

## The workflow

`examples/claude-code-openrouter.yml` is a working automation-mode workflow. The parts that
matter:

- `anthropic_api_key: ${{ secrets.OPENROUTER_API_KEY }}` satisfies the action's launch check.
- The `env` block sets `ANTHROPIC_BASE_URL` and `ANTHROPIC_AUTH_TOKEN`, which is what
  actually routes requests to OpenRouter.
- The `prompt` input puts the action in automation mode (it runs without waiting for
  `@claude`).
- `claude_args` caps turns and grants only the tools the task needs.

Copy it to `.github/workflows/` and adjust the `prompt` and `claude_args`. The model is set
in one place (`--model`) so switching between Haiku and a free model is a one-line change.

### Interactive mode

Drop the `prompt` input and trigger on comments to let Claude respond to `@claude` mentions
instead:

```yaml
name: Claude Code
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
jobs:
  claude:
    if: contains(github.event.comment.body, '@claude')
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: write
      id-token: write
      actions: read
    steps:
      - uses: actions/checkout@v6
        with:
          fetch-depth: 1
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.OPENROUTER_API_KEY }}
        env:
          ANTHROPIC_BASE_URL: https://openrouter.ai/api
          ANTHROPIC_AUTH_TOKEN: ${{ secrets.OPENROUTER_API_KEY }}
```

## Security

- Never commit an OpenRouter key. Store it as a repository (or organization) secret and
  reference it as `secrets.OPENROUTER_API_KEY`.
- Grant the workflow only the permissions it needs. `contents: read` is enough for a
  read-only review; add `pull-requests: write` only if Claude posts comments.
- `id-token: write` is required for the action's default GitHub App authentication.
- Use `concurrency` to cancel superseded runs, and `allowed_bots` if a scheduled run is
  attributed to a bot account.
- Review Claude's output before merging. A free model is a suggestion engine, not an oracle.
- On a public repository the interactive `@claude` trigger is reachable by any commenter, so
  anyone can spend the OpenRouter key's credits. Keep the key scoped to what the workflow needs
  and set an OpenRouter spending limit (budget) so a burst of mentions cannot drain the account.

## Troubleshooting

- **Auth errors on fork or Dependabot pull requests:** GitHub does not pass repository secrets to
  workflows triggered by `pull_request` from a fork (those runs get only a read-only
  `GITHUB_TOKEN`), and Dependabot pull requests are treated the same way, so
  `OPENROUTER_API_KEY` is empty and the action fails its launch check. Re-run the workflow after
  the pull request is merged, or use `pull_request_target` with a read-only checkout of the
  untrusted code, and never execute that code while the secret is exposed.
- **Auth errors or model-not-found for OpenRouter models:** make sure `ANTHROPIC_API_KEY` is
  empty locally, and run `/logout` if you previously signed in to Claude Code with an
  Anthropic account.
- **Requests go to Anthropic instead of OpenRouter:** verify `ANTHROPIC_BASE_URL` is
  `https://openrouter.ai/api` (no trailing `/v1`) and `ANTHROPIC_AUTH_TOKEN` is set.
- **Free model returns garbage or fails tool calls:** expected for non-Anthropic providers;
  switch to an Anthropic model.
- **Workflow does not trigger:** the Claude GitHub App must be installed and the secret must
  exist.
