# Engineering Docs - Claude Extension

## Extended Behavior for Claude Code

This plugin extends the base `AGENTS.md` instructions with Claude-specific behaviors.

## Memory and Context

- When working on a multi-phase skill (workflow type), use extended thinking to reason through the user's system before producing output.
- Retain context from earlier phases within the same conversation. If the user already described the system in a `technical-specification` session, reuse that context when they invoke `technical-blueprint` next.
- Do not re-ask questions already answered in the current session.

## Output Format

- Always render templates as clean Markdown. Never wrap them in a code fence unless explicitly asked.
- Use Mermaid for all diagrams (C4, sequence, deployment, ERD). Always include a text description below the diagram for audiences without diagram rendering.
- For ADRs, always assign an incrementing number (e.g., `ADR-001`, `ADR-002`) if prior ADRs exist in the conversation or codebase.

## Quality Gate

Before delivering any documentation output, internally verify:
1. Every required section has real content - no placeholder text like `[TODO]` or `[insert here]`.
2. All NFRs have measurable targets (e.g., "p99 latency < 200ms", not "fast").
3. Security and risk sections are not empty or generic.
4. Diagrams are syntactically valid Mermaid.
