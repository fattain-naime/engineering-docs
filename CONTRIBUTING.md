# Contributing to engineering-docs

Thank you for contributing! This repository standardizes software engineering documentation. To maintain high quality, all custom skills must adhere to the following architectural guidelines.

## Skill Structure

Every skill is a standalone folder inside `skills/` containing:
1. `SKILL.md` — The skill manifest (YAML frontmatter + workflow phases)
2. `template.md` — The self-guiding, fill-in template

## 1. Manifest (`SKILL.md`) Rules

The manifest must start with a valid YAML frontmatter block containing:
- `name`: Lowercase, hyphenated matching the folder name.
- `description`: A clear, single-sentence summary of the skill's purpose.
- `intent`: A detailed, multi-line paragraph explaining when, why, and how the AI agent triggers this skill.
- `type`: Either `workflow` (multi-phase, complex) or `component` (simple, single-turn).
- `best_for`: List of 3-4 bullet points indicating ideal use cases.
- `scenarios`: 3-4 real-world query prompts that should auto-trigger the skill.
- `estimated_time`: Estimated time for completion (e.g., "1-2 hours").

### Example Frontmatter
```yaml
---
name: database-design-document
argument-hint: "[domain name]"
description: Design a database schema including ERD, table definitions, and indexing.
intent: >-
  Produce a database design document that specifies all tables, relationships, and constraints...
type: workflow
best_for:
  - "Designing a schema for a new microservice"
scenarios:
  - "design the database for a billing system"
estimated_time: "1-3 hours"
---
```

## 2. Template (`template.md`) Rules

The template is a markdown file with placeholders (e.g., `[SYSTEM]`, `[VERSION]`, `YYYY-MM-DD`).
- **Coaching Blocks**: Use GitHub blockquotes to guide the engineer or the agent through writing each section:
  > **Coaching Tip:** What this section does, why it matters, and a quick example.
- **Standards Aligned**: Build upon industry standards (e.g., C4 model, ISO/IEC/IEEE 29148, STRIDE, RFC 7807, DORA).
- **Mermaid Diagrams**: Include Mermaid diagram templates (C4, sequence, ERD, or flowcharts) to encourage visual documentation.
- **Traceability / Checklists**: Always include a checklist, sign-off table, or error catalog section to make the document highly operational.

## 3. Submitting Changes

1. Fork the repository.
2. Create your feature branch (`git checkout -b skill/new-skill-name`).
3. Implement the skill following the rules above.
4. Add the new skill to the table in `README.md`.
5. Open a Pull Request explaining the industry standard your skill aligns with and the problem it solves.
