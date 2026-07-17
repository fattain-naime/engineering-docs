#!/usr/bin/env node

/**
 * sync-version.js
 *
 * Scans the repository for plugin version references and updates them
 * to the current version from package.json.
 *
 * Only updates version references that are clearly the PLUGIN version:
 * - package.json, plugin.json, marketplace.json version fields
 * - Installer script headers (install.js, setup.sh, setup.ps1)
 * - README.md version references
 *
 * Does NOT update:
 * - Example versions in templates (v2.4.0, v1.0.0, etc.)
 * - Dependency versions
 * - Semver ranges (^, ~, >=)
 * - Versions in code examples
 *
 * Usage: node scripts/sync-version.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

// Get current version from package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const CURRENT_VERSION = packageJson.version;
const CURRENT_MAJOR_MINOR = CURRENT_VERSION.split('.').slice(0, 2).join('.');

console.log(`Current version: ${CURRENT_VERSION}`);
if (DRY_RUN) {
  console.log('DRY RUN - no files will be modified\n');
}

// Files that contain the plugin version (not example versions)
const VERSION_FILES = [
  'package.json',
  'plugin.json',
  '.claude-plugin/plugin.json',
  '.claude-plugin/marketplace.json',
  'marketplace.json',
  'scripts/install.js',
  'scripts/setup.sh',
  'scripts/setup.ps1',
  'README.md',
];

// Track changes
const changes = [];
let filesUpdated = 0;

function updateJsonVersion(filePath, relativePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(content);

    if (json.version && json.version !== CURRENT_VERSION) {
      const oldVersion = json.version;
      json.version = CURRENT_VERSION;

      if (!DRY_RUN) {
        fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
      }

      changes.push({
        file: relativePath,
        field: 'version',
        old: oldVersion,
        new: CURRENT_VERSION
      });
      filesUpdated++;
    }
  } catch (e) {
    // Skip files that can't be parsed
  }
}

function updateTextVersion(filePath, relativePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Pattern: "version": "X.Y.Z" in JSON-like context
    const versionFieldPattern = /("version"\s*:\s*")([\d]+\.[\d]+\.[\d]+)(")/g;
    let match;

    while ((match = versionFieldPattern.exec(content)) !== null) {
      const foundVersion = match[2];
      if (foundVersion !== CURRENT_VERSION && !isExampleVersion(content, match.index)) {
        const oldMatch = match[0];
        const newMatch = match[1] + CURRENT_VERSION + match[3];
        content = content.replace(oldMatch, newMatch);
        modified = true;
        changes.push({
          file: relativePath,
          field: 'version field',
          old: foundVersion,
          new: CURRENT_VERSION
        });
      }
    }

    // Pattern: vX.Y.Z - N Skills (installer headers)
    const headerPattern = /(v)([\d]+\.[\d]+\.[\d]+)(\s*-\s*\d+\s*Skills)/g;
    while ((match = headerPattern.exec(content)) !== null) {
      const foundVersion = match[2];
      if (foundVersion !== CURRENT_VERSION) {
        const oldMatch = match[0];
        const newMatch = match[1] + CURRENT_VERSION + match[3];
        content = content.replace(oldMatch, newMatch);
        modified = true;
        changes.push({
          file: relativePath,
          field: 'header',
          old: foundVersion,
          new: CURRENT_VERSION
        });
      }
    }

    if (modified && !DRY_RUN) {
      fs.writeFileSync(filePath, content, 'utf8');
      filesUpdated++;
    }
  } catch (e) {
    // Skip files that can't be read
  }
}

function isExampleVersion(content, index) {
  // Check if the version is inside a code block or example
  const before = content.substring(Math.max(0, index - 200), index);

  // If inside a code block marker, it's an example
  if (before.includes('```')) return true;

  // If preceded by "example", "sample", "template", it's an example
  if (/example|sample|template|demo/i.test(before.slice(-50))) return true;

  return false;
}

// Main
console.log('Scanning for plugin version references...\n');

for (const file of VERSION_FILES) {
  const filePath = path.join(ROOT, file);
  const relativePath = file;

  if (!fs.existsSync(filePath)) {
    continue;
  }

  if (file.endsWith('.json')) {
    updateJsonVersion(filePath, relativePath);
  } else {
    updateTextVersion(filePath, relativePath);
  }
}

// Report
console.log(`\n${'='.repeat(60)}`);
console.log(`Files checked: ${VERSION_FILES.length}`);
console.log(`Files updated: ${filesUpdated}`);
console.log(`${'='.repeat(60)}\n`);

if (changes.length > 0) {
  console.log('Changes:');
  for (const change of changes) {
    console.log(`  ${change.file}: ${change.field} ${change.old} → ${change.new}`);
  }

  if (DRY_RUN) {
    console.log('\n[DRY RUN] No files were modified.');
  } else {
    console.log('\n✅ Version references updated!');
  }
} else {
  console.log('✅ All version references are up to date!');
}
