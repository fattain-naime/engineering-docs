#!/usr/bin/env node

/**
 * validate-documents.js
 *
 * Validates all documents in a .engineering-docs/ directory for completeness
 * and consistency. Outputs a structured JSON validation report.
 *
 * Usage:
 *   node validate-documents.js <path-to-.engineering-docs-dir>
 *   node validate-documents.js --help
 *
 * Checks:
 *   - All required documents exist
 *   - All documents have valid YAML frontmatter
 *   - All depends_on references point to existing documents
 *   - No circular dependencies
 *   - All documents have a status field
 *   - All documents with owner_reviewed: false are flagged
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function printHelp() {
  console.log(`
validate-documents.js

Validate .engineering-docs/ documents for completeness and consistency.

USAGE
  node validate-documents.js <dir>
  node validate-documents.js --help

ARGUMENTS
  <dir>   Path to the .engineering-docs/ directory containing .md files

OUTPUT
  JSON validation report written to stdout.
  Exit code 0 if no errors, 1 if errors found.

EXAMPLE
  node validate-documents.js ./.engineering-docs
  node validate-documents.js ./.engineering-docs | jq .summary
`);
}

// Expected document types (skill names) that a complete set should contain.
const EXPECTED_DOCS = [
  'system-architecture-document',
  'technical-specification',
  'api-design-document',
  'database-design-document',
  'security-threat-model',
  'test-strategy-document',
  'implementation-plan',
  'slo-error-budget-document',
  'deployment-plan',
  'disaster-recovery-plan',
  'technical-runbook',
  'architecture-decision-record',
];

/**
 * Parse YAML frontmatter from a markdown file.
 */
function parseFrontmatter(filePath) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    return { error: `Cannot read file: ${err.message}` };
  }

  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    return { error: 'No YAML frontmatter found (missing --- delimiters)' };
  }

  const yaml = match[1];
  const result = {};
  const parseErrors = [];

  for (const line of yaml.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) {
      parseErrors.push(`Invalid YAML line: "${trimmed}"`);
      continue;
    }

    const key = trimmed.slice(0, colonIdx).trim();
    let value = trimmed.slice(colonIdx + 1).trim();

    // Handle YAML list values: depends_on: [a, b]
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    } else if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    } else {
      value = value.replace(/^["']|["']$/g, '');
    }

    result[key] = value;
  }

  if (parseErrors.length > 0) {
    result._parseErrors = parseErrors;
  }

  return result;
}

/**
 * Detect cycles in a directed graph using DFS.
 * Returns an array of cycles, where each cycle is an array of node names.
 */
function detectCycles(graph) {
  const visited = new Set();
  const inStack = new Set();
  const cycles = [];

  function dfs(node, path) {
    if (inStack.has(node)) {
      const cycleStart = path.indexOf(node);
      cycles.push(path.slice(cycleStart).concat(node));
      return;
    }
    if (visited.has(node)) return;

    visited.add(node);
    inStack.add(node);
    path.push(node);

    const neighbors = graph[node] || [];
    for (const neighbor of neighbors) {
      dfs(neighbor, path);
    }

    path.pop();
    inStack.delete(node);
  }

  for (const node of Object.keys(graph)) {
    if (!visited.has(node)) {
      dfs(node, []);
    }
  }

  return cycles;
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

  const dir = path.resolve(args[0]);
  const report = {
    directory: dir,
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: 0,
      validFiles: 0,
      errors: 0,
      warnings: 0,
    },
    missingRequiredDocs: [],
    files: [],
    dependencyErrors: [],
    circularDependencies: [],
    statusIssues: [],
    unreviewedDocuments: [],
  };

  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    console.error(`Error: "${dir}" is not a valid directory.`);
    process.exit(1);
  }

  // Read all .md files
  const mdFiles = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  report.summary.totalFiles = mdFiles.length;

  // Check for required documents
  const docNames = mdFiles.map((f) => f.replace(/\.md$/, ''));
  const docNamesBySkill = {};

  for (const file of mdFiles) {
    const filePath = path.join(dir, file);
    const meta = parseFrontmatter(filePath);
    const docName = file.replace(/\.md$/, '');
    const fileReport = {
      file,
      valid: true,
      errors: [],
      warnings: [],
      frontmatter: {},
    };

    // Check for frontmatter parse errors
    if (meta.error) {
      fileReport.valid = false;
      fileReport.errors.push(meta.error);
      report.files.push(fileReport);
      report.summary.errors++;
      continue;
    }

    if (meta._parseErrors) {
      fileReport.errors.push(...meta._parseErrors);
      fileReport.valid = false;
      delete meta._parseErrors;
    }

    fileReport.frontmatter = meta;

    // Check required frontmatter fields
    const requiredFields = ['title', 'skill', 'status'];
    for (const field of requiredFields) {
      if (!meta[field] && meta[field] !== false) {
        fileReport.errors.push(`Missing required frontmatter field: "${field}"`);
        fileReport.valid = false;
      }
    }

    // Track skill names for required doc check
    if (meta.skill) {
      docNamesBySkill[meta.skill] = file;
    }

    // Check status field
    if (!meta.status) {
      report.statusIssues.push({
        file,
        issue: 'Missing status field',
      });
    } else {
      const validStatuses = [
        'draft', 'in_review', 'review', 'approved', 'superseded',
        'in_progress', 'complete', 'accepted', 'outdated', 'deprecated',
      ];
      if (!validStatuses.includes(meta.status.toLowerCase().replace(/\s+/g, '_'))) {
        report.statusIssues.push({
          file,
          issue: `Unrecognized status value: "${meta.status}"`,
          validValues: validStatuses,
        });
      }
    }

    // Check owner_reviewed field
    if (meta.owner_reviewed === false || meta.owner_reviewed === 'false') {
      report.unreviewedDocuments.push({
        file,
        title: meta.title || docName,
        status: meta.status || 'unknown',
      });
      report.summary.warnings++;
    }

    // Validate depends_on references
    const dependsOn = Array.isArray(meta.depends_on) ? meta.depends_on : [];
    for (const dep of dependsOn) {
      if (!dep) continue;
      const depFile = `${dep}.md`;
      if (!mdFiles.includes(depFile)) {
        report.dependencyErrors.push({
          file,
          dependsOn: dep,
          issue: `Referenced document "${dep}" not found in directory`,
        });
        report.summary.errors++;
      }
    }

    if (fileReport.errors.length > 0) {
      report.summary.errors += fileReport.errors.length;
    }
    report.summary.warnings += fileReport.warnings.length;

    report.files.push(fileReport);
  }

  // Check for required documents
  for (const expected of EXPECTED_DOCS) {
    if (!docNamesBySkill[expected]) {
      report.missingRequiredDocs.push(expected);
      report.summary.warnings++;
    }
  }

  // Build dependency graph for cycle detection
  const depGraph = {};
  for (const file of mdFiles) {
    const filePath = path.join(dir, file);
    const meta = parseFrontmatter(filePath);
    const docName = file.replace(/\.md$/, '');
    const dependsOn = Array.isArray(meta.depends_on) ? meta.depends_on : [];
    depGraph[docName] = dependsOn.filter(Boolean);
  }

  // Detect circular dependencies
  const cycles = detectCycles(depGraph);
  for (const cycle of cycles) {
    report.circularDependencies.push({
      cycle: cycle.join(' -> '),
      nodes: cycle,
    });
    report.summary.errors++;
  }

  // Determine valid file count
  report.summary.validFiles = report.files.filter((f) => f.valid).length;

  // Output
  console.log(JSON.stringify(report, null, 2));

  // Exit code
  if (report.summary.errors > 0) {
    process.exit(1);
  }
}

main();
