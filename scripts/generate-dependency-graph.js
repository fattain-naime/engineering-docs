#!/usr/bin/env node

/**
 * generate-dependency-graph.js
 *
 * Reads a .engineering-docs/ directory and generates a Mermaid dependency graph
 * showing which documents depend on which others, based on YAML frontmatter
 * `depends_on` fields.
 *
 * Usage:
 *   node generate-dependency-graph.js <path-to-.engineering-docs-dir>
 *   node generate-dependency-graph.js --help
 *
 * Output: Mermaid diagram code to stdout
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function printHelp() {
  console.log(`
generate-dependency-graph.js

Generate a Mermaid dependency graph from .engineering-docs/ YAML frontmatter.

USAGE
  node generate-dependency-graph.js <dir>
  node generate-dependency-graph.js --help

ARGUMENTS
  <dir>   Path to the .engineering-docs/ directory containing .md files

OUTPUT
  Mermaid graph TD diagram written to stdout.

EXAMPLE
  node generate-dependency-graph.js ./.engineering-docs > deps.mmd
`);
}

/**
 * Parse YAML frontmatter from a markdown file.
 * Returns an object with the parsed key-value pairs, or {} on failure.
 */
function parseFrontmatter(filePath) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }

  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const yaml = match[1];
  const result = {};

  for (const line of yaml.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    let value = trimmed.slice(colonIdx + 1).trim();

    // Handle YAML list values: depends_on: [a, b]
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    } else {
      // Strip surrounding quotes
      value = value.replace(/^["']|["']$/g, '');
    }

    result[key] = value;
  }

  return result;
}

/**
 * Sanitize a string for use as a Mermaid node ID.
 */
function sanitizeId(name) {
  return name
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Sanitize a label for Mermaid (escape quotes and brackets).
 */
function sanitizeLabel(name) {
  return name.replace(/["\[\]]/g, (c) => `\\${c}`);
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

  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    console.error(`Error: "${dir}" is not a valid directory.`);
    process.exit(1);
  }

  // Read all .md files
  const mdFiles = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));

  if (mdFiles.length === 0) {
    console.error('No .md files found in the specified directory.');
    process.exit(1);
  }

  // Parse frontmatter from each file
  const documents = [];
  for (const file of mdFiles) {
    const filePath = path.join(dir, file);
    const meta = parseFrontmatter(filePath);
    if (meta === null) continue;

    const docName = file.replace(/\.md$/, '');
    const dependsOn = Array.isArray(meta.depends_on)
      ? meta.depends_on
      : [];

    documents.push({ name: docName, dependsOn, meta });
  }

  // Build node ID map
  const nodeIdMap = {};
  for (const doc of documents) {
    nodeIdMap[doc.name] = sanitizeId(doc.name);
  }

  // Generate Mermaid graph
  const lines = [];
  lines.push('graph TD');
  lines.push('');

  // Style definitions
  lines.push('  %% Document nodes');
  for (const doc of documents) {
    const nodeId = nodeIdMap[doc.name];
    const label = sanitizeLabel(doc.name);
    const status = doc.meta.status || 'unknown';
    let shape;
    switch (status) {
      case 'approved':
        shape = `${nodeId}["${label}"]`;
        break;
      case 'draft':
        shape = `${nodeId}["${label}"]`;
        break;
      default:
        shape = `${nodeId}["${label}"]`;
    }
    lines.push(`  ${shape}`);
  }

  lines.push('');
  lines.push('  %% Dependencies');

  // Collect edges
  const edges = [];
  const missingDeps = [];

  for (const doc of documents) {
    const sourceId = nodeIdMap[doc.name];
    for (const dep of doc.dependsOn) {
      if (!dep) continue;
      if (nodeIdMap[dep]) {
        const targetId = nodeIdMap[dep];
        edges.push(`  ${sourceId} --> ${targetId}`);
      } else {
        missingDeps.push({ from: doc.name, missing: dep });
      }
    }
  }

  if (edges.length === 0) {
    lines.push('  %% No dependencies declared between documents.');
  } else {
    for (const edge of edges) {
      lines.push(edge);
    }
  }

  // Add style classes
  lines.push('');
  lines.push('  %% Styling');
  lines.push('  classDef approved fill:#d4edda,stroke:#28a745,color:#155724');
  lines.push('  classDef draft fill:#fff3cd,stroke:#ffc107,color:#856404');
  lines.push('  classDef unknown fill:#f8f9fa,stroke:#6c757d,color:#343a40');

  for (const doc of documents) {
    const nodeId = nodeIdMap[doc.name];
    const status = doc.meta.status || 'unknown';
    if (status === 'approved') {
      lines.push(`  class ${nodeId} approved`);
    } else if (status === 'draft') {
      lines.push(`  class ${nodeId} draft`);
    } else {
      lines.push(`  class ${nodeId} unknown`);
    }
  }

  // Output the Mermaid diagram
  console.log(lines.join('\n'));

  // Warn about missing dependencies to stderr
  if (missingDeps.length > 0) {
    console.error('\nWarning: The following depends_on references could not be resolved:');
    for (const m of missingDeps) {
      console.error(`  - "${m.from}" depends on "${m.missing}" (file not found)`);
    }
  }
}

main();
