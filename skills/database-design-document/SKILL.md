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
estimated_time: "1-3 hours"
license: MIT
compatibility: Designed for Gemini (Antigravity), Claude Code, Cursor/Windsurf, Kimi Code, Codex/Copilot
---

## Purpose

Produce a database design document that specifies the complete logical and physical data model, including entity relationships, table definitions, column constraints, indexing strategy, and migration plan.

**Database schema is the hardest type of technical debt to remediate.** Changing a column name on a 50M-row table is a 4-hour maintenance window. Designing it correctly upfront is a 2-hour design session.

## Input

**Works best with:** The domain or system being modeled.
**Also valuable:** Business rules, cardinality constraints, known query patterns, performance requirements, existing tables that must integrate.

**Example invocation:** `Design the database schema for OwnPay's merchant management system. Merchants have multiple brands, each with their own settings, domains, and staff users. Users have roles with specific permissions. Brands can have multiple currencies and payment methods.`

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

## Application

### Phase 1: Socratic Clarification & Brainstorming (Mandatory Interview)
Before writing any database design document, you MUST interrogate the user's initial input, identify gaps, and ask **3-5 targeted clarifying questions** to dig deeper. Do NOT generate the template yet.
Ask questions to resolve:
1. **Target Engine**: What database management system (MariaDB, PostgreSQL, MySQL, SQLite) is being used?
2. **Access patterns**: What are the most common or high-frequency read and write operations?
3. **Data scaling**: What is the anticipated growth rate of tables (e.g. thousands vs. millions of rows)?
4. **Data retention**: Are there regulatory or audit requirements for data archiving, audit logging, or soft-deletes?
*Wait for the user's response to these questions before drafting the final database design document.*

### Phase 2: Entity Identification (20 min)
Identify all domain entities and their attributes.

### Phase 3: Relationship Mapping (20 min)
Define relationships, cardinality, and ownership. Produce ERD.

### Phase 4: Table Definitions (30-60 min)
Write complete DDL for each table with column types, constraints, and indexes.

### Phase 5: Data Dictionary (20 min)
Document every table and non-obvious column in plain language.

### Phase 6: Query Patterns and Index Validation (20 min)
Identify the 5-10 hottest queries and verify indexes cover them.

### Phase 7: Migration Plan (20 min)
Document how the schema will be applied and how to roll back.
