#!/usr/bin/env node

/**
 * generate-ddl.js
 *
 * Generates SQL DDL (CREATE TABLE, indexes, foreign keys) from a database
 * design document's schema definitions.
 *
 * Usage:
 *   node generate-ddl.js <path-to-db-design-doc>
 *   node generate-ddl.js --dialect=postgresql <path>
 *   node generate-ddl.js --dialect=mysql <path>
 *   node generate-ddl.js --help
 *
 * Supports: MySQL and PostgreSQL dialects (default: mysql)
 * Output: SQL DDL to stdout
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function printHelp() {
  console.log(`
generate-ddl.js

Generate SQL DDL from a database design document.

USAGE
  node generate-ddl.js [options] <db-design-document-path>
  node generate-ddl.js --help

ARGUMENTS
  <db-design-document-path>   Path to a database design .md document

OPTIONS
  --dialect=<mysql|postgresql>   Target SQL dialect (default: mysql)

OUTPUT
  SQL DDL (CREATE TABLE, indexes, foreign keys) written to stdout.

EXAMPLE
  node generate-ddl.js ./.engineering-docs/database-design.md
  node generate-ddl.js --dialect=postgresql ./.engineering-docs/database-design.md > schema.sql
`);
}

// ---------------------------------------------------------------------------
// Type mapping between MySQL and PostgreSQL
// ---------------------------------------------------------------------------

const MYSQL_TO_PG_TYPE_MAP = {
  'BIGINT UNSIGNED': 'BIGINT',
  'BIGINT UNSIGNED AUTO_INCREMENT': 'BIGINT GENERATED ALWAYS AS IDENTITY',
  'BIGINT UNSIGNED NOT NULL AUTO_INCREMENT': 'BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL',
  'INT UNSIGNED': 'INTEGER',
  'INT UNSIGNED AUTO_INCREMENT': 'INTEGER GENERATED ALWAYS AS IDENTITY',
  'INT': 'INTEGER',
  'TINYINT(1)': 'BOOLEAN',
  'TINYINT': 'SMALLINT',
  'DATETIME(6)': 'TIMESTAMP(6)',
  'DATETIME': 'TIMESTAMP',
  'TEXT': 'TEXT',
  'LONGTEXT': 'TEXT',
  'MEDIUMTEXT': 'TEXT',
  'ENUM': 'VARCHAR(255)',
  'DECIMAL(19, 4)': 'DECIMAL(19, 4)',
  'DECIMAL': 'DECIMAL',
  'FLOAT': 'REAL',
  'DOUBLE': 'DOUBLE PRECISION',
  'BLOB': 'BYTEA',
  'LONGBLOB': 'BYTEA',
  'JSON': 'JSONB',
};

/**
 * Convert a MySQL type to PostgreSQL equivalent.
 */
function mysqlToPgType(mysqlType) {
  const upper = mysqlType.toUpperCase().trim();

  // Check direct mapping first
  if (MYSQL_TO_PG_TYPE_MAP[upper]) {
    return MYSQL_TO_PG_TYPE_MAP[upper];
  }

  // Handle ENUM types: convert to VARCHAR
  if (upper.startsWith('ENUM(')) {
    return 'VARCHAR(255)';
  }

  // Handle VARCHAR - stays the same
  if (upper.startsWith('VARCHAR')) {
    return mysqlType;
  }

  // Handle DECIMAL precision
  if (upper.startsWith('DECIMAL')) {
    return mysqlType;
  }

  // Handle BIGINT with AUTO_INCREMENT
  if (upper.includes('AUTO_INCREMENT')) {
    return mysqlType
      .replace(/BIGINT\s+UNSIGNED/i, 'BIGINT')
      .replace(/AUTO_INCREMENT/i, 'GENERATED ALWAYS AS IDENTITY')
      .replace(/UNSIGNED/g, '');
  }

  // Default: strip UNSIGNED
  return mysqlType.replace(/UNSIGNED/gi, '').trim();
}

/**
 * Convert MySQL default values to PostgreSQL equivalents.
 */
function mysqlToPgDefault(value, type) {
  if (!value) return value;

  const upper = value.toUpperCase().trim();

  if (upper === 'CURRENT_TIMESTAMP(6)') return 'CURRENT_TIMESTAMP';
  if (upper === 'CURRENT_TIMESTAMP') return 'CURRENT_TIMESTAMP';
  if (upper === 'NOW()') return 'NOW()';

  // TINYINT(1) -> BOOLEAN: convert 0/1 to false/true
  if (type && type.toUpperCase().includes('TINYINT(1)')) {
    if (value === '0') return 'false';
    if (value === '1') return 'true';
  }

  return value;
}

/**
 * Convert a MySQL engine clause to PostgreSQL (no-op, but used for formatting).
 */
function pgEngineClause() {
  return '';
}

// ---------------------------------------------------------------------------
// SQL generation
// ---------------------------------------------------------------------------

/**
 * Parse CREATE TABLE blocks from the document content.
 */
function parseTableDefinitions(content) {
  const tables = [];

  // Find all CREATE TABLE blocks in code fences
  const createTableRegex = /```sql\s*\n([\s\S]*?)```/gi;
  let match;

  while ((match = createTableRegex.exec(content)) !== null) {
    const sqlBlock = match[1].trim();

    // Only process CREATE TABLE statements
    if (!sqlBlock.toUpperCase().includes('CREATE TABLE')) continue;

    // Extract table name
    const tableNameMatch = sqlBlock.match(
      /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"']?(\w+)[`"']?\s*\(/i
    );
    if (!tableNameMatch) continue;

    const tableName = tableNameMatch[1];

    // Extract the body between the first ( and last )
    const bodyStart = sqlBlock.indexOf('(');
    const bodyEnd = sqlBlock.lastIndexOf(')');
    if (bodyStart === -1 || bodyEnd === -1) continue;

    const body = sqlBlock.slice(bodyStart + 1, bodyEnd);

    // Parse columns, constraints, indexes
    const columns = [];
    const indexes = [];
    const foreignKeys = [];
    let comment = '';

    // Extract table comment
    const commentMatch = sqlBlock.match(/COMMENT\s*=\s*'([^']+)'/i);
    if (commentMatch) {
      comment = commentMatch[1];
    }

    // Split body into logical lines (handle multi-line entries)
    const lines = splitSqlBody(body);

    for (const line of lines) {
      const trimmed = line.trim().replace(/,\s*$/, '').trim();
      if (!trimmed) continue;

      // Skip PRIMARY KEY constraint
      if (trimmed.match(/^PRIMARY\s+KEY/i)) continue;
      // Skip CONSTRAINT ... FOREIGN KEY
      if (trimmed.match(/^CONSTRAINT/i)) continue;
      // Skip standalone INDEX
      if (trimmed.match(/^INDEX\s/i)) continue;
      // Skip standalone KEY
      if (trimmed.match(/^KEY\s/i)) continue;
      // Skip comments-only lines
      if (trimmed.startsWith('--')) continue;

      // Parse column definition
      const colMatch = trimmed.match(
        /^[`"']?(\w+)[`"']?\s+([\w().,\s]+?)(?:\s+(NOT\s+NULL|NULL|AUTO_INCREMENT|GENERATED\s+.*?IDENTITY))?(?:\s+DEFAULT\s+('.*?'|[^\s,]+))?(?:\s+COMMENT\s+'([^']*)')?(?:\s+ON\s+UPDATE\s+\w+(?:\(\d?\))?)?\s*$/i
      );

      if (colMatch) {
        const colName = colMatch[1];
        const rawType = colMatch[2].trim();
        const nullable = colMatch[3] || '';
        let defaultVal = colMatch[4] || '';
        const colComment = colMatch[5] || '';

        // Clean up default value
        defaultVal = defaultVal.replace(/^'|'$/g, '');

        columns.push({
          name: colName,
          type: rawType,
          nullable: nullable.toUpperCase().includes('NOT NULL') ? false : true,
          autoIncrement:
            nullable.toUpperCase().includes('AUTO_INCREMENT') ||
            nullable.toUpperCase().includes('IDENTITY'),
          default: defaultVal,
          comment: colComment,
        });
      }
    }

    // Parse INDEX definitions from the body
    const indexRegex = /INDEX\s+[`"']?(\w+)[`"']?\s*\(([^)]+)\)/gi;
    let idxMatch;
    while ((idxMatch = indexRegex.exec(body)) !== null) {
      const idxName = idxMatch[1];
      const idxCols = idxMatch[2]
        .split(',')
        .map((c) => c.trim().replace(/[`"']/g, ''));
      indexes.push({ name: idxName, columns: idxCols });
    }

    // Parse FOREIGN KEY / CONSTRAINT definitions
    const fkRegex =
      /CONSTRAINT\s+[`"']?(\w+)[`"']?\s+FOREIGN\s+KEY\s*\(\s*[`"']?(\w+)[`"']?\s*\)\s*REFERENCES\s+[`"']?(\w+)[`"']?\s*\(\s*[`"']?(\w+)[`"']?\s*\)(?:\s+ON\s+DELETE\s+(CASCADE|RESTRICT|SET\s+NULL|NO\s+ACTION))?(?:\s+ON\s+UPDATE\s+(CASCADE|RESTRICT|SET\s+NULL|NO\s+ACTION))?/gi;
    let fkMatch;
    while ((fkMatch = fkRegex.exec(body)) !== null) {
      foreignKeys.push({
        constraintName: fkMatch[1],
        column: fkMatch[2],
        referencesTable: fkMatch[3],
        referencesColumn: fkMatch[4],
        onDelete: fkMatch[5] || 'RESTRICT',
        onUpdate: fkMatch[6] || 'CASCADE',
      });
    }

    tables.push({
      name: tableName,
      columns,
      indexes,
      foreignKeys,
      comment,
    });
  }

  return tables;
}

/**
 * Split SQL body into logical lines, handling commas and multi-line entries.
 */
function splitSqlBody(body) {
  const lines = [];
  let current = '';
  let depth = 0;

  for (const char of body) {
    if (char === '(') depth++;
    if (char === ')') depth--;
    if (char === ',' && depth === 0) {
      lines.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) lines.push(current);

  return lines;
}

/**
 * Generate MySQL DDL.
 */
function generateMysql(tables) {
  const lines = [];

  lines.push('-- ============================================');
  lines.push('-- Generated DDL (MySQL)');
  lines.push(`-- Generated: ${new Date().toISOString()}`);
  lines.push('-- ============================================');
  lines.push('');
  lines.push("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;");
  lines.push("SET FOREIGN_KEY_CHECKS = 0;");
  lines.push('');

  for (const table of tables) {
    lines.push(`-- Table: ${table.name}`);
    if (table.comment) {
      lines.push(`-- ${table.comment}`);
    }
    lines.push(`CREATE TABLE IF NOT EXISTS \`${table.name}\` (`);

    const colDefs = [];

    for (const col of table.columns) {
      let def = `  \`${col.name}\` ${col.type}`;
      if (!col.nullable) def += ' NOT NULL';
      if (col.autoIncrement) def += ' AUTO_INCREMENT';
      if (col.default) def += ` DEFAULT ${quoteDefault(col.default)}`;
      if (col.comment) def += ` COMMENT '${col.comment}'`;
      colDefs.push(def);
    }

    // Primary key
    const pkCols = table.columns.filter((c) => c.name === 'id');
    if (pkCols.length > 0) {
      colDefs.push('  PRIMARY KEY (`id`)');
    }

    // Foreign keys
    for (const fk of table.foreignKeys) {
      colDefs.push(
        `  CONSTRAINT \`${fk.constraintName}\` FOREIGN KEY (\`${fk.column}\`) REFERENCES \`${fk.referencesTable}\` (\`${fk.referencesColumn}\`) ON DELETE ${fk.onDelete} ON UPDATE ${fk.onUpdate}`
      );
    }

    lines.push(colDefs.join(',\n'));

    // Table options
    const options = [];
    options.push('ENGINE=InnoDB');
    options.push('DEFAULT CHARSET=utf8mb4');
    options.push('COLLATE=utf8mb4_unicode_ci');
    if (table.comment) {
      options.push(`COMMENT='${table.comment}'`);
    }

    lines.push(`) ${options.join(' ')};`);
    lines.push('');

    // Indexes
    for (const idx of table.indexes) {
      const idxCols = idx.columns.map((c) => `\`${c}\``).join(', ');
      lines.push(
        `CREATE INDEX \`${idx.name}\` ON \`${table.name}\` (${idxCols});`
      );
    }
    if (table.indexes.length > 0) lines.push('');
  }

  lines.push("SET FOREIGN_KEY_CHECKS = 1;");
  lines.push('');

  return lines.join('\n');
}

/**
 * Generate PostgreSQL DDL.
 */
function generatePostgresql(tables) {
  const lines = [];

  lines.push('-- ============================================');
  lines.push('-- Generated DDL (PostgreSQL)');
  lines.push(`-- Generated: ${new Date().toISOString()}`);
  lines.push('-- ============================================');
  lines.push('');
  lines.push('BEGIN;');
  lines.push('');

  for (const table of tables) {
    lines.push(`-- Table: ${table.name}`);
    if (table.comment) {
      lines.push(`-- ${table.comment}`);
    }
    lines.push(`CREATE TABLE IF NOT EXISTS "${table.name}" (`);

    const colDefs = [];

    for (const col of table.columns) {
      const pgType = mysqlToPgType(col.type);
      let def = `  "${col.name}" ${pgType}`;

      if (col.autoIncrement) {
        // SERIAL / GENERATED ALWAYS AS IDENTITY is handled in type mapping
        if (!pgType.includes('IDENTITY')) {
          def = `  "${col.name}" BIGSERIAL`;
        }
      }

      if (!col.nullable) def += ' NOT NULL';

      const pgDefault = mysqlToPgDefault(col.default, col.type);
      if (pgDefault) {
        def += ` DEFAULT ${quoteDefault(pgDefault)}`;
      }

      colDefs.push(def);
    }

    // Primary key
    const pkCols = table.columns.filter((c) => c.name === 'id');
    if (pkCols.length > 0) {
      colDefs.push('  PRIMARY KEY ("id")');
    }

    // Foreign keys
    for (const fk of table.foreignKeys) {
      colDefs.push(
        `  CONSTRAINT "${fk.constraintName}" FOREIGN KEY ("${fk.column}") REFERENCES "${fk.referencesTable}" ("${fk.referencesColumn}") ON DELETE ${fk.onDelete} ON UPDATE ${fk.onUpdate}`
      );
    }

    lines.push(colDefs.join(',\n'));
    lines.push(');');
    lines.push('');

    // Table comment
    if (table.comment) {
      lines.push(
        `COMMENT ON TABLE "${table.name}" IS '${table.comment.replace(/'/g, "''")}';`
      );
      lines.push('');
    }

    // Column comments
    for (const col of table.columns) {
      if (col.comment) {
        lines.push(
          `COMMENT ON COLUMN "${table.name}"."${col.name}" IS '${col.comment.replace(/'/g, "''")}';`
        );
      }
    }
    if (table.columns.some((c) => c.comment)) lines.push('');

    // Indexes
    for (const idx of table.indexes) {
      const idxCols = idx.columns.map((c) => `"${c}"`).join(', ');
      lines.push(
        `CREATE INDEX "${idx.name}" ON "${table.name}" (${idxCols});`
      );
    }
    if (table.indexes.length > 0) lines.push('');
  }

  lines.push('COMMIT;');
  lines.push('');

  return lines.join('\n');
}

/**
 * Quote a default value appropriately.
 */
function quoteDefault(value) {
  if (!value) return '';

  const upper = value.toUpperCase();
  // SQL functions / keywords should not be quoted
  if (
    upper === 'CURRENT_TIMESTAMP' ||
    upper === 'CURRENT_TIMESTAMP(6)' ||
    upper === 'NOW()' ||
    upper === 'NULL' ||
    upper === 'TRUE' ||
    upper === 'FALSE' ||
    upper === 'CURRENT_DATE' ||
    /^\d+(\.\d+)?$/.test(value)
  ) {
    return value;
  }

  return `'${value.replace(/'/g, "''")}'`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    printHelp();
    process.exit(0);
  }

  // Parse dialect flag
  let dialect = 'mysql';
  const filePathArgs = [];

  for (const arg of args) {
    if (arg.startsWith('--dialect=')) {
      dialect = arg.split('=')[1].toLowerCase();
    } else if (!arg.startsWith('-')) {
      filePathArgs.push(arg);
    }
  }

  if (!['mysql', 'postgresql'].includes(dialect)) {
    console.error(`Error: Unsupported dialect "${dialect}". Use "mysql" or "postgresql".`);
    process.exit(1);
  }

  const filePath = path.resolve(filePathArgs[0]);

  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: "${filePath}"`);
    process.exit(1);
  }

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    console.error(`Error reading file: ${err.message}`);
    process.exit(1);
  }

  const tables = parseTableDefinitions(content);

  if (tables.length === 0) {
    console.error(
      'Warning: No CREATE TABLE definitions found in SQL code blocks.'
    );
    console.error(
      'Ensure table definitions are enclosed in ```sql ... ``` code fences.'
    );
    process.exit(0);
  }

  let ddl;
  if (dialect === 'postgresql') {
    ddl = generatePostgresql(tables);
  } else {
    ddl = generateMysql(tables);
  }

  console.log(ddl);
}

main();
