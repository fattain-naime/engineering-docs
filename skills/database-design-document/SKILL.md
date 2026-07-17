---
name: database-design-document
argument-hint: "[domain or system name]"
description: Design a production database schema including ERD, table definitions, data dictionary, indexing strategy, normalization decisions, and migration plan. Use when designing a new database, adding major entities, or documenting an existing schema.
intent: >-
  Produce a comprehensive database design document that specifies every table, column, relationship, index, and constraint required to correctly and efficiently store the domain's data. Poor database design is one of the most expensive technical debts in software: schema changes on tables with millions of rows are painful, slow, and risky. Getting the data model right before writing a single INSERT statement prevents years of painful migrations, performance problems, and data integrity bugs. This document applies principles of normalization (3NF minimum), referential integrity, explicit constraint definitions, and performance-oriented indexing.
type: workflow
theme: engineering-docs
best_for:
  - "Designing the database schema for a new system or major domain"
  - "Documenting an existing schema that lacks formal specification"
  - "Planning a schema migration or refactoring"
  - "Onboarding engineers to the data model of a complex system"
scenarios:
  - "Design the database schema for a multi-tenant SaaS billing system"
  - "Document the complete database design for our payment gateway"
  - "I need an ERD and schema spec for a new inventory management module"
estimated_time: "3-6 hrs"
license: MIT
compatibility: Designed for Gemini (Antigravity), Claude Code, Cursor/Windsurf, Kimi Code, Codex/Copilot
---

## Purpose

Produce a database design document that specifies the complete logical and physical data model, including entity relationships, table definitions, column constraints, indexing strategy, and migration plan.

**Database schema is the hardest type of technical debt to remediate.** Changing a column name on a 50M-row table is a 4-hour maintenance window. Designing it correctly upfront is a 2-hour design session.

## Input

**Works best with:** The domain or system being modeled.
**Also valuable:** Business rules, cardinality constraints, known query patterns, performance requirements, existing tables that must integrate.

**Example invocation:** `Design the database schema for PayFlow's merchant management system. Merchants have multiple brands, each with their own settings, domains, and staff users. Users have roles with specific permissions. Brands can have multiple currencies and payment methods.`

## Key Concepts

### Normalization
- **1NF:** Atomic values. No repeating groups. Single value per cell.
- **2NF:** No partial dependencies. Non-key columns depend on the full primary key.
- **3NF:** No transitive dependencies. Non-key columns depend only on the primary key.
- **BCNF:** Stronger form of 3NF. Every determinant is a candidate key.
- **Practical rule:** Design to 3NF minimum. Denormalize intentionally and explicitly for performance, with documentation.

### Indexing Principles
- Every foreign key column must have an index.
- Columns used in `WHERE`, `JOIN ON`, and `ORDER BY` clauses of hot queries must be indexed.
- Composite indexes: column order matters. Most selective column first.
- Never index columns with very low cardinality (e.g., a boolean flag) unless combined with a high-cardinality column.
- Generated stored columns for computed or JSON-extracted values that are queried frequently.

### Data Integrity
- Use foreign key constraints for referential integrity - do not enforce at application layer only.
- Use CHECK constraints for value validation where supported.
- Use NOT NULL aggressively. NULL means "unknown" - if a value should always be present, make it NOT NULL.
- Use appropriate data types. `DECIMAL(10,2)` not `FLOAT` for money. `DATETIME(6)` for timestamps. `VARCHAR(255)` with deliberate limits, not arbitrary.

### Partitioning Strategy

For tables expected to grow beyond millions of rows, document the partitioning approach:
- **Range Partitioning:** Partition by date (e.g., `created_at`). Best for time-series data, audit logs, and event tables where queries are typically scoped to a time window. Enables easy archival by dropping old partitions.
- **Hash Partitioning:** Partition by a high-cardinality column (e.g., `tenant_id`, `user_id`). Best for multi-tenant systems where even distribution across partitions is needed. Eliminates hot-partition problems.
- **List Partitioning:** Partition by a discrete value (e.g., `region`, `status`). Best for data with natural categorical boundaries.

Document for each partitioned table: partition key, partition count/strategy, pruning behavior (how queries benefit), and maintenance plan (how old partitions are archived or dropped).

### Connection Pooling

Database connections are expensive. Document the connection pool configuration:
- **max_connections:** The database server's global limit. Setting this too high causes memory exhaustion and context-switching overhead.
- **pool_size:** Per-application-instance pool size. Rule of thumb: `(core_count * 2) + effective_spindle_count` for CPU-bound workloads. For typical web apps: 10-20 per instance.
- **pool_timeout:** How long a request waits for a connection before failing. Set to match the expected max query time (e.g., 5-10 seconds).
- **pool_recycle:** How long a connection lives before being recycled. Must be less than the database's `wait_timeout` to avoid stale connections.
- **Connection leak detection:** Log warnings if a connection is held longer than a threshold (e.g., 30 seconds).

### JSON Column Design Patterns

JSON columns are powerful but must be used intentionally:

**When to use JSON:**
- Semi-structured data with variable schemas (e.g., `metadata`, `settings`, `attributes`)
- Data that does not need to be filtered, joined, or indexed individually
- Third-party API response storage where schema is not under your control

**When NOT to use JSON (use normalized tables instead):**
- Data that needs foreign key relationships
- Data that needs individual column indexes for WHERE/JOIN
- Data with a fixed, known schema that rarely changes
- Data that needs aggregate queries (SUM, COUNT on individual fields)

**Design rules for JSON columns:**
- Use `JSON` type (not `TEXT` storing JSON) to enable database-level validation.
- Document the expected JSON schema in a comment or CHECK constraint.
- Use generated stored columns for frequently queried JSON paths (MySQL 5.7+: `ALTER TABLE t ADD COLUMN extracted_val VARCHAR(255) AS (JSON_UNQUOTE(JSON_EXTRACT(data, '$.key'))) STORED`).
- Never store more than 1-2KB average per row in JSON columns; large blobs belong in separate tables or object storage.

### Database Views

Views encapsulate complex read-only query logic:
- **Read-heavy query patterns:** Use views for dashboards, reports, and admin UIs that require multi-table JOINs. This separates the read model from the write model.
- **Security:** Views can restrict column access (e.g., a `user_profiles_safe` view that excludes `password_hash` and `ssn`).
- **Abstraction:** Views insulate consumers from schema changes. If a column is renamed, the view can be updated to alias it without breaking downstream queries.
- **Performance caveat:** Views are not inherently faster. Materialized views (PostgreSQL) or summary tables may be needed for complex aggregations.

### Multi-Tenant Data Isolation

For SaaS systems, document the tenant isolation strategy:

| Pattern | Description | Pros | Cons |
| :--- | :--- | :--- | :--- |
| **Shared database, shared schema** | All tenants in same tables, filtered by `tenant_id` | Simple, cost-effective, easy to maintain | Noisy-neighbor risk, data leak risk if `tenant_id` filter is missed |
| **Shared database, separate schema** | Each tenant gets their own schema | Better isolation, per-tenant backup | Harder to manage at scale (1000s of schemas) |
| **Separate database per tenant** | Each tenant gets their own database instance | Strongest isolation, per-tenant scaling | Highest cost, operational complexity |

For the shared-schema pattern: enforce `tenant_id` filtering at the repository layer (never rely on application-level filtering alone). Every query must include `WHERE tenant_id = ?` bound from the authenticated user context.

### Backup Strategy

Every database design document must reference the backup strategy:
- **Full backups:** Frequency (daily), method (mysqldump, pg_dump, native snapshots), storage location, encryption.
- **Incremental/WAL backups:** Continuous archiving for point-in-time recovery.
- **Retention:** How long backups are kept (e.g., 30 days daily, 12 months monthly).
- **Testing:** How often restore-from-backup is tested and what constitutes a successful test.

### Document Length

Target length: **8-15 pages** (excluding appendices).

Shorter is better than longer. If the document exceeds the target, check for:
- Redundant content that can be cut
- Overly verbose explanations
- Content that belongs in a separate reference document
- Material the agent already knows (don't explain what HTTP is)

If the document is significantly shorter than the target, check for:
- Missing sections
- Insufficient detail in critical areas
- Unaddressed edge cases

### Conflict Resolution

When your analysis conflicts with the user's stated preference:

1. **Present both positions** — show your analysis and their preference side by side
2. **Explain the trade-off** — what are the consequences of each choice?
3. **Recommend with reasoning** — state your recommendation and why
4. **Respect the user's decision** — they own the final call
5. **Document the decision** — record it as an `[owner-specified]` override with reasoning

## Application

### Phase 1: Socratic Clarification & Brainstorming (Mandatory Interview)

**Interview Mechanism:** Use tool calls (e.g., `AskUserQuestion`) to present questions — do NOT ask inline in the conversation. The user selects from options rather than typing responses. One question per tool call, multiple-choice options preferred, with "I don't know, you decide" as an escape hatch.

**Context Loading:** Before asking ANY questions, read ALL prior documents in `.engineering-docs/` to extract already-known information. Look for:
- Team size, budget, timeline (from business-plan)
- Tech stack, hosting (from system-architecture)
- Target users, JTBD (from user-personas)
- Constraints, regulatory requirements (from business-plan)
- Scope, features (from technical-specification)

**If information exists in a prior document, USE IT — do not re-ask.**

**Maximum 2-3 questions per skill.** Only ask about:
- Skill-specific details not covered in prior documents
- Technical decisions that affect this specific document
- Clarifications on ambiguous requirements

Ask questions to resolve:
1. **Access patterns**: What are the most common or high-frequency read and write operations?
2. **Data scaling**: What is the anticipated growth rate of tables (e.g. thousands vs. millions of rows)?

*Wait for the user's response to these questions before drafting the final database design document.*

### Phase 2: Entity Identification (40-60 min)
Identify all domain entities and their attributes.

### Phase 3: Relationship Mapping (40-60 min)
Define relationships, cardinality, and ownership. Produce ERD.

### Phase 4: Table Definitions (1-2 hrs)
Write complete DDL for each table with column types, constraints, and indexes.

### Phase 5: Data Dictionary (40-60 min)
Document every table and non-obvious column in plain language.

### Phase 6: Query Patterns and Index Validation (40-60 min)
Identify the 5-10 hottest queries and verify indexes cover them.

### Phase 7: Migration Plan (40-60 min)
Document how the schema will be applied and how to roll back.

### Phase 8: Revision (After User Review)

If the user requests changes after reviewing the document:

1. **Read the user's feedback carefully** — understand what they want changed
2. **Check for conflicts** — does the requested change affect table relationships, indexes, or migration scripts already defined?
3. **Apply changes** — update the document, cascading changes through the ERD, DDL, and data dictionary as needed
4. **Re-run consistency check** — verify the ERD matches table definitions, all FK indexes are present, and migration scripts are updated
5. **Update metadata** — set `last_updated` to today's date
6. **Confirm with user** — show the changes and get approval

## Gotchas

- **Using FLOAT for financial amounts.** Floating-point arithmetic introduces rounding errors that compound over time. Always use `DECIMAL(19,4)` (or similar exact-precision type) for money, prices, and balances.
- **Omitting indexes on foreign key columns.** Every FK column must have an index. Without it, JOIN operations and cascading deletes degrade to full table scans as data grows. This is one of the most common and costly oversights.
- **Leaving columns nullable when they should not be.** NULL means "unknown." If a value is always required at the application layer, make it `NOT NULL` at the database layer. Relying on app-only validation means any direct DB access or migration script can introduce invalid data.
- **Designing to a higher normalization level than needed without documenting why.** Over-normalization creates excessive JOINs that hurt read performance. If you denormalize, document it in the Normalization Decisions table with a clear justification - do not leave future maintainers guessing.
- **Writing migrations without tested rollback scripts.** Every migration must have a tested rollback. If a migration is destructive (drops columns, changes types), the rollback must be written and validated on staging before the migration runs in production.

## Handoff

**Reads from:**
- `1-business-plan.md` — problem, users, constraints
- `3-user-personas.md` — target users, usage patterns
- `4-technical-specification.md` — functional and non-functional requirements
- `7-system-architecture.md` — technology decisions, hosting constraints

**Feeds into:**
- `9-api-design-document.md` — data model that API resources map to
- `11-admin-access-control-specification.md` — data entities that permissions govern
- `14-technical-blueprint.md` — schema referenced in feature designs
- `15-implementation-plan.md` — schema as Phase 0/1 foundation

## Quality Gate

Before marking this document as `final`, verify:
- [ ] Every table has a primary key, all foreign keys, NOT NULL constraints, and appropriate data types defined
- [ ] Every foreign key column has a corresponding index documented in the Indexing Strategy section
- [ ] The ERD matches the table definitions - no entity in the diagram is missing from Section 3, and vice versa
- [ ] All intentional denormalizations are documented in the Normalization Decisions table with justification
- [ ] Every migration has a tested rollback script and the Migration Risks table identifies lock contention and data type change risks

## Next Steps

After this document is complete, proceed to:
- **`api-design-document`** — design the API contract that maps to this data model
- **`admin-access-control-specification`** — define permissions on the entities modeled here
- **`security-threat-model`** — assess security risks of the data storage design
- Or invoke `using-engineering-docs` to continue the pipeline
