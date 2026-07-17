# Engineering-Docs Eval Framework

This directory contains evaluation test cases for the `engineering-docs` plugin. The evals verify that the orchestrator and individual document skills produce correct, high-quality output across different scenarios.

---

## Directory Structure

```
evals/
  evals.json              # Main eval configuration with all test cases
  README.md               # This file
  test-prompts/           # Reusable prompt templates for manual or automated testing
    greenfield-idea.txt   # Sample greenfield (new product) prompt
    brownfield-feature.txt # Sample brownfield (existing system) prompt
    direct-skill.txt      # Sample direct skill invocation prompt
```

---

## What the Evals Test

The eval suite covers two dimensions:

### 1. Orchestrator Evals (evals 1-2)

These test the `using-engineering-docs` orchestrator skill, which is the entry point for the plugin. They verify:

- **Mode detection**: Correctly distinguishing greenfield (Mode A) from brownfield (Mode B)
- **Phase sequencing**: Running Phase 0 business concept before technical skills
- **Right-sizing**: Including only the conditional skills that apply to the project
- **Standing constraints**: Asking team size, hosting, budget, timeline, regulatory, and integration questions once, early
- **Index generation**: Producing a master `index.md` with reading order and document statuses
- **Cross-document consistency**: Checking that entity names, terminology, and decisions align across documents
- **Non-destructive writes**: Appending new documents rather than overwriting existing ones

### 2. Direct Skill Evals (evals 3-8)

These test individual skills invoked directly (outside the orchestrator). Each eval checks:

- **Interview quality**: Whether the skill asks the right clarifying questions
- **Output structure**: Whether the produced document follows the skill's template
- **Content quality**: Whether requirements are SMART, diagrams use Mermaid, mitigations are actionable, etc.
- **Metadata**: Whether YAML frontmatter is present and correct

---

## Eval Case Structure

Each eval in `evals.json` has this schema:

```json
{
  "id": 1,                              // Unique numeric ID
  "name": "orchestrator-greenfield",    // Machine-readable name
  "category": "orchestrator",           // "orchestrator" or "direct-skill"
  "prompt": "The user prompt...",       // The input to send to the agent
  "should_trigger": "using-engineering-docs", // Which skill should activate
  "expected_skills": [...],             // Skills expected to be invoked (orchestrator only)
  "expected_outputs": [...],            // Files expected in output (direct-skill only)
  "assertions": [...],                  // What the output MUST demonstrate
  "anti_assertions": [...]              // What the output must NOT exhibit
}
```

### Assertion Types

- **Positive assertions** (`assertions`): The output must contain or demonstrate this quality. These are pass/fail checks.
- **Negative assertions** (`anti_assertions`): The output must NOT exhibit this behavior. These catch common failure modes.

---

## How to Run Evals

### Manual Execution

For each eval case:

1. Open a fresh agent session (no prior context).
2. Paste the `prompt` from the eval case.
3. Observe the agent's behavior and output.
4. Check each assertion against what happened.
5. Record pass/fail for each assertion.

### Using Test Prompts

The `test-prompts/` directory contains longer, more detailed prompts for manual testing:

- **`greenfield-idea.txt`**: A complete greenfield scenario with enough detail to exercise the full orchestrator pipeline. Use when testing Mode A end-to-end.
- **`brownfield-feature.txt`**: A brownfield scenario with an existing codebase and docs. Use when testing Mode B subset selection and append behavior.
- **`direct-skill.txt`**: A prompt designed to invoke a specific skill directly. Use when testing individual skill quality outside the orchestrator.

### Automated Execution (Agent Harness)

If your agent harness supports automated eval runs:

```bash
# Example: run all evals
zcode eval run evals/evals.json

# Example: run only orchestrator evals
zcode eval run evals/evals.json --category orchestrator

# Example: run a single eval by ID
zcode eval run evals/evals.json --id 3
```

Check your harness documentation for exact commands.

---

## How to Interpret Results

### Pass Criteria

An eval **passes** when:
- The correct skill is triggered (`should_trigger` matches)
- All positive assertions are satisfied
- No negative assertions are violated

### Partial Pass

An eval **partially passes** when:
- The correct skill is triggered
- Most assertions pass, but 1-2 fail
- The failures are non-critical (e.g., missing a metadata field vs. skipping the entire interview)

### Fail Criteria

An eval **fails** when:
- The wrong skill is triggered (e.g., orchestrator runs when a direct skill should)
- Critical assertions fail (e.g., Phase 0 is skipped, requirements are vague)
- Negative assertions are violated (e.g., documents are overwritten, secrets are written)

### Common Failure Modes

| Failure | Likely Cause |
|:---|:---|
| Orchestrator skips Phase 0 | The agent jumped to technical docs without completing the business concept interview |
| Questions are batched | The agent asked multiple questions in one message instead of one at a time |
| All conditional skills included | The agent did not right-size the document set to the project |
| Requirements are vague | The skill template was filled with placeholder values instead of interview-derived content |
| No metadata frontmatter | The skill's output template was not followed |
| Documents overwritten | The versioning-on-re-run logic was not followed |
| Secrets in output | The security policy was violated |

---

## How to Add New Test Cases

### 1. Identify the Gap

Ask: What behavior is not currently tested? Common gaps:
- A specific conditional skill (e.g., `database-design-document`, `disaster-recovery-plan`)
- Edge cases (e.g., "I don't know" answers, re-running the orchestrator on an existing set)
- Error handling (e.g., conflicting requirements across documents)

### 2. Write the Eval

Add a new entry to the `evals` array in `evals.json`:

```json
{
  "id": 9,
  "name": "database-design-direct",
  "category": "direct-skill",
  "prompt": "Design the database schema for a multi-tenant SaaS application with user accounts, organizations, and billing.",
  "should_trigger": "database-design-document",
  "expected_outputs": ["database-design.md"],
  "assertions": [
    "ERD diagram is included using Mermaid",
    "Schema includes indexes for common query patterns",
    "Migration strategy is defined",
    "Tenant isolation approach is specified"
  ],
  "anti_assertions": [
    "The skill does NOT produce a schema without explaining the reasoning behind key decisions"
  ]
}
```

### 3. Validate the Prompt

Before committing:
- Test the prompt manually to confirm it triggers the expected skill
- Verify the assertions are specific enough to catch real failures
- Ensure the anti-assertions target realistic failure modes

### 4. Increment the ID

Use the next available sequential ID. Do not reuse IDs from deleted evals.

---

## Eval Design Principles

1. **Assert on behavior, not output format.** Check that requirements are SMART, not that they use a specific heading style.
2. **Anti-assertions catch the common shortcuts.** The most likely failures are the agent taking shortcuts, not producing wildly wrong output.
3. **Prompts should be realistic.** Use prompts that real users would write, not artificially precise specifications.
4. **One eval, one scenario.** Do not combine greenfield and brownfield in a single eval.
5. **Assertions should be independently verifiable.** Each assertion should be checkable without reading the entire document set.

---

## Skill Coverage

The current eval suite covers:

| Skill | Eval ID | Type |
|:---|:---|:---|
| using-engineering-docs (orchestrator) | 1, 2 | orchestrator |
| business-concept | 3 | direct-skill |
| technical-specification | 4 | direct-skill |
| system-architecture-document | 5 | direct-skill |
| security-threat-model | 6 | direct-skill |
| test-strategy-document | 7 | direct-skill |
| implementation-plan | 8 | direct-skill |

### Not Yet Covered (Candidates for Future Evals)

- project-plan
- user-personas-behavior
- technical-feasibility-study
- ux-flow-specification
- design-system-specification
- architecture-decision-record
- database-design-document
- api-design-document
- admin-access-control-specification
- technical-blueprint
- deployment-plan
- technical-runbook
- disaster-recovery-plan
- slo-error-budget-document
- incident-postmortem
- Orchestrator re-run / resume (Mode B with existing `.engineering-docs/`)
- Orchestrator "I don't know" escape hatch handling
- Cross-document consistency conflict resolution
