# Engineering Docs Utility Scripts

Command-line utilities for working with `.engineering-docs/` document sets. All scripts are self-contained Node.js modules with zero external dependencies (uses only Node.js built-ins).

## Quick Reference

| Script | Purpose | Input | Output |
| :--- | :--- | :--- | :--- |
| `generate-dependency-graph.js` | Mermaid dependency diagram | `.engineering-docs/` directory | Mermaid code to stdout |
| `validate-documents.js` | Validate completeness and consistency | `.engineering-docs/` directory | JSON report to stdout |
| `calculate-error-budget.js` | Error budget burn rate calculations | SLO document path | JSON to stdout |
| `generate-test-cases.js` | Test case templates from requirements | Technical spec path | JSON to stdout |
| `generate-ddl.js` | SQL DDL from schema definitions | Database design doc path | SQL to stdout |
| `check-consistency.js` | Cross-document consistency checks | `.engineering-docs/` directory | JSON report to stdout |

---

## Scripts

### generate-dependency-graph.js

Reads all `.md` files in a `.engineering-docs/` directory, parses the `depends_on` field from each file's YAML frontmatter, and generates a Mermaid graph showing document dependencies.

```bash
node scripts/generate-dependency-graph.js ./.engineering-docs
node scripts/generate-dependency-graph.js ./.engineering-docs > deps.mmd
```

- Nodes are styled by status: green for approved, yellow for draft, grey for unknown.
- Warnings for unresolvable `depends_on` references are printed to stderr.

---

### validate-documents.js

Validates all documents in a `.engineering-docs/` directory for structural completeness.

**Checks performed:**
- All required document types exist (architecture, spec, API design, DB design, security, test strategy, implementation plan, SLO, deployment, DR, runbook, ADR)
- All documents have valid YAML frontmatter with required fields (`title`, `skill`, `status`)
- All `depends_on` references point to existing documents
- No circular dependencies (DFS cycle detection)
- All documents have a recognized `status` field
- Documents with `owner_reviewed: false` are flagged as warnings

```bash
node scripts/validate-documents.js ./.engineering-docs
node scripts/validate-documents.js ./.engineering-docs | jq '.summary'
```

Exit code 0 if no errors, 1 if errors found.

---

### calculate-error-budget.js

Parses an SLO document and calculates error budget burn rates for each SLI target.

**Calculations include:**
- Error budget percentage (1 - uptime target)
- Allowed downtime per period (daily, weekly, monthly)
- Multi-window burn rate thresholds (fast, moderate, slow, very slow)
- Error rate thresholds per minute for alerting

```bash
node scripts/calculate-error-budget.js ./.engineering-docs/slo-error-budget.md
node scripts/calculate-error-budget.js ./.engineering-docs/slo-error-budget.md | jq '.budgets'
```

---

### generate-test-cases.js

Parses `FR-XXX` and `NFR-XXX` requirement identifiers from a technical specification document and generates structured test case templates.

**For each requirement, generates:**
- Test case ID (e.g., `TC-FR-001-01`)
- Requirement reference
- Test type (unit, integration, e2e, performance, security)
- Preconditions from GIVEN clauses
- Steps from WHEN clauses
- Expected results from THEN clauses

```bash
node scripts/generate-test-cases.js ./.engineering-docs/technical-specification.md
node scripts/generate-test-cases.js ./.engineering-docs/technical-specification.md | jq 'length'
```

Test types are assigned based on requirement type:
- `FR-*` (functional) -> unit + integration
- `NFR-*` (non-functional) -> categorized by domain (performance, security, e2e, etc.)

---

### generate-ddl.js

Parses `CREATE TABLE` definitions from SQL code blocks in a database design document and regenerates clean, formatted DDL.

**Supports:**
- MySQL dialect (default)
- PostgreSQL dialect (via `--dialect=postgresql` flag)
- Type conversion between MySQL and PostgreSQL
- CREATE TABLE, indexes, and foreign keys
- Table and column comments

```bash
node scripts/generate-ddl.js ./.engineering-docs/database-design.md
node scripts/generate-ddl.js --dialect=postgresql ./.engineering-docs/database-design.md > schema.sql
```

---

### check-consistency.js

Checks cross-document consistency across the entire `.engineering-docs/` document set.

**Checks performed:**
1. **Entity consistency** - Entity names match across database-design and api-design documents
2. **Endpoint-entity alignment** - API endpoints have corresponding database entities
3. **Threat coverage** - Security threat model covers API surfaces
4. **Test coverage** - Test strategy references feature entities
5. **Implementation dependencies** - Implementation plan phases respect architecture layering

```bash
node scripts/check-consistency.js ./.engineering-docs
node scripts/check-consistency.js ./.engineering-docs | jq '.checks.entityConsistency'
```

Exit code 0 if no errors, 1 if errors found.

---

## Common Flags

All scripts support:

- `--help` or `-h` - Print usage information and exit

## Requirements

- Node.js 18+ (uses built-in modules only: `fs`, `path`)
- No npm install needed

## Integration

These scripts can be integrated into CI/CD pipelines or pre-commit hooks:

```bash
# Validate documents before commit
node scripts/validate-documents.js ./.engineering-docs || exit 1

# Check consistency before merge
node scripts/check-consistency.js ./.engineering-docs || exit 1
```
