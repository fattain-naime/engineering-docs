# Engineering Docs - Gemini Context File
#
# This file is the Gemini (Antigravity) context loader for the engineering-docs plugin.
# It eagerly loads all 21 skill SKILL.md files into Gemini's context window so the
# agent knows each skill's intent, triggers, and workflow without needing to fetch them
# at runtime. This file is standalone - it does not depend on AGENTS.md or any other
# agent config file.
#
# Skill routing rules and behavioral standards are embedded in each SKILL.md loaded below.
# For Gemini-specific trigger routing, see AGENTS.md in the same directory.

@./skills/using-engineering-docs/SKILL.md
@./skills/project-plan/SKILL.md
@./skills/user-personas-behavior/SKILL.md
@./skills/technical-specification/SKILL.md
@./skills/technical-feasibility-study/SKILL.md
@./skills/ux-flow-specification/SKILL.md
@./skills/design-system-specification/SKILL.md
@./skills/system-architecture-document/SKILL.md
@./skills/architecture-decision-record/SKILL.md
@./skills/database-design-document/SKILL.md
@./skills/api-design-document/SKILL.md
@./skills/admin-access-control-specification/SKILL.md
@./skills/technical-blueprint/SKILL.md
@./skills/security-threat-model/SKILL.md
@./skills/test-strategy-document/SKILL.md
@./skills/implementation-plan/SKILL.md
@./skills/deployment-plan/SKILL.md
@./skills/slo-error-budget-document/SKILL.md
@./skills/technical-runbook/SKILL.md
@./skills/disaster-recovery-plan/SKILL.md
@./skills/incident-postmortem/SKILL.md
