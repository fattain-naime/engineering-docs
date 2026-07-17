#!/usr/bin/env node

/**
 * generate-test-cases.js
 *
 * Generates test case templates from technical specification requirements.
 * Parses FR-XXX and NFR-XXX requirement identifiers from the document and
 * creates structured test case objects for each.
 *
 * Usage:
 *   node generate-test-cases.js <path-to-technical-spec>
 *   node generate-test-cases.js --help
 *
 * Input: Technical specification document path (.md)
 * Output: JSON array of test case templates to stdout
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function printHelp() {
  console.log(`
generate-test-cases.js

Generate test case templates from technical specification requirements.

USAGE
  node generate-test-cases.js <spec-document-path>
  node generate-test-cases.js --help

ARGUMENTS
  <spec-document-path>   Path to a technical specification .md document

OUTPUT
  JSON array of test case templates written to stdout.

TEST TYPES ASSIGNED
  FR-*   requirements  -> unit + integration tests
  NFR-*  requirements  -> integration + e2e tests (performance/security/e2e)

EXAMPLE
  node generate-test-cases.js ./.engineering-docs/technical-specification.md
  node generate-test-cases.js ./.engineering-docs/technical-specification.md | jq '.[0]'
`);
}

/**
 * Parse YAML frontmatter from a markdown file.
 */
function parseFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
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
    value = value.replace(/^["']|["']$/g, '');
    result[key] = value;
  }

  return result;
}

/**
 * Extract requirements from the markdown body.
 *
 * Looks for patterns like:
 *   #### FR-001: Requirement Name
 *   #### NFR-001: Requirement Name
 *
 * Extracts: id, name, statement, acceptance criteria, priority, section context.
 */
function extractRequirements(content) {
  const requirements = [];

  // Split content into sections by #### headers that contain requirement IDs
  const reqBlocks = content.split(/(?=^#{3,4}\s+(?:FR|NFR)-\d+)/m);

  for (const block of reqBlocks) {
    // Match the header: #### FR-001: Name or ### 6.1 FR-001: Name
    const headerMatch = block.match(
      /^#{3,4}\s+((?:FR|NFR)-\d+(?:\w*)?)\s*:\s*(.+)$/m
    );
    if (!headerMatch) continue;

    const id = headerMatch[1].trim();
    const name = headerMatch[2].trim();
    const type = id.startsWith('NFR') ? 'nfr' : 'fr';

    // Extract statement
    let statement = '';
    const stmtMatch = block.match(
      /\*\*Statement:\*\*\s*(.+?)(?:\n\n|\n\*\*)/s
    );
    if (stmtMatch) {
      statement = stmtMatch[1].trim().replace(/\n\s*/g, ' ');
    }

    // Extract acceptance criteria
    const criteria = [];
    const criteriaRegex = /-\s*`?GIVEN`?\s*(.+?)`?\s*WHEN`?\s*(.+?)`?\s*THEN`?\s*(.+?)$/gm;
    let critMatch;
    while ((critMatch = criteriaRegex.exec(block)) !== null) {
      criteria.push({
        given: critMatch[1].trim().replace(/^`|`$/g, ''),
        when: critMatch[2].trim().replace(/^`|`$/g, ''),
        then: critMatch[3].trim().replace(/^`|`$/g, ''),
      });
    }

    // Extract priority
    let priority = 'Should Have';
    const prioMatch = block.match(/\*\*Priority:\*\*\s*`([^`]+)`/);
    if (prioMatch) {
      priority = prioMatch[1].trim();
    }

    // Extract owner
    let owner = '';
    const ownerMatch = block.match(/\*\*Owner:\*\*\s*(.+?)(?:\n|$)/);
    if (ownerMatch) {
      owner = ownerMatch[1].trim();
    }

    // Extract parent section from context (look for ### heading before this)
    let section = '';
    const sectionMatch = content.match(
      new RegExp(`###\\s+([\\d.]+\\s+[^\\n]+)\\n[\\s\\S]*?#### ${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)
    );
    if (sectionMatch) {
      section = sectionMatch[1].trim();
    }

    requirements.push({
      id,
      name,
      type,
      statement,
      acceptanceCriteria: criteria,
      priority,
      owner,
      section,
    });
  }

  return requirements;
}

/**
 * Determine which test types are appropriate for a requirement.
 */
function determineTestTypes(req) {
  const types = [];

  if (req.type === 'fr') {
    // Functional requirements get unit and integration tests
    types.push('unit');
    types.push('integration');
  } else if (req.type === 'nfr') {
    // Non-functional requirements are categorized by their domain
    const nameLC = req.name.toLowerCase();
    const stmtLC = (req.statement || '').toLowerCase();
    const combined = `${nameLC} ${stmtLC}`;

    if (combined.includes('performance') || combined.includes('latency') || combined.includes('throughput')) {
      types.push('performance');
      types.push('integration');
    } else if (combined.includes('security') || combined.includes('auth') || combined.includes('encrypt') || combined.includes('input validation')) {
      types.push('security');
      types.push('integration');
    } else if (combined.includes('availability') || combined.includes('uptime') || combined.includes('mttr')) {
      types.push('e2e');
      types.push('integration');
    } else if (combined.includes('scal')) {
      types.push('performance');
      types.push('e2e');
    } else if (combined.includes('observability') || combined.includes('log')) {
      types.push('integration');
    } else if (combined.includes('compliance')) {
      types.push('e2e');
    } else {
      types.push('integration');
      types.push('e2e');
    }
  }

  return [...new Set(types)];
}

/**
 * Generate preconditions from acceptance criteria.
 */
function generatePreconditions(req) {
  const preconditions = [];

  if (req.acceptanceCriteria && req.acceptanceCriteria.length > 0) {
    for (const criteria of req.acceptanceCriteria) {
      if (criteria.given) {
        preconditions.push(criteria.given);
      }
    }
  }

  if (preconditions.length === 0) {
    preconditions.push(`System is configured and running for: ${req.name}`);
    preconditions.push('Required dependencies are available');
  }

  return [...new Set(preconditions)];
}

/**
 * Generate test steps from acceptance criteria.
 */
function generateSteps(req) {
  const steps = [];

  if (req.acceptanceCriteria && req.acceptanceCriteria.length > 0) {
    let stepNum = 1;
    for (const criteria of req.acceptanceCriteria) {
      if (criteria.when) {
        steps.push({
          step: stepNum++,
          action: criteria.when,
        });
      }
    }
  }

  if (steps.length === 0) {
    steps.push({
      step: 1,
      action: `Execute the action described in: ${req.name}`,
    });
    steps.push({
      step: 2,
      action: 'Observe system behavior',
    });
  }

  return steps;
}

/**
 * Generate expected results from acceptance criteria.
 */
function generateExpectedResults(req) {
  const results = [];

  if (req.acceptanceCriteria && req.acceptanceCriteria.length > 0) {
    for (const criteria of req.acceptanceCriteria) {
      if (criteria.then) {
        results.push(criteria.then);
      }
    }
  }

  if (results.length === 0) {
    results.push(`System satisfies requirement: ${req.name}`);
  }

  return results;
}

/**
 * Generate a test case template for a single requirement and test type.
 */
function generateTestCase(req, testType, index) {
  const tcId = `TC-${req.id}-${String(index).padStart(2, '0')}`;

  return {
    testCaseId: tcId,
    requirementRef: req.id,
    requirementName: req.name,
    testType,
    priority: req.priority,
    preconditions: generatePreconditions(req),
    steps: generateSteps(req),
    expectedResult: generateExpectedResults(req),
    tags: [req.type, testType],
    status: 'not_started',
  };
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

  const filePath = path.resolve(args[0]);

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

  const frontmatter = parseFrontmatter(filePath);
  const requirements = extractRequirements(content);

  if (requirements.length === 0) {
    console.error('Warning: No FR-XXX or NFR-XXX requirements found in the document.');
    console.error('Ensure requirements follow the pattern: #### FR-001: Name');
    console.log(JSON.stringify([], null, 2));
    process.exit(0);
  }

  const testCases = [];
  let globalIndex = 1;

  for (const req of requirements) {
    const testTypes = determineTestTypes(req);

    for (const testType of testTypes) {
      testCases.push(generateTestCase(req, testType, globalIndex++));
    }
  }

  // Sort by requirement ID then test type
  testCases.sort((a, b) => {
    const aId = a.requirementRef;
    const bId = b.requirementRef;
    if (aId !== bId) return aId.localeCompare(bId);
    return a.testType.localeCompare(b.testType);
  });

  console.log(JSON.stringify(testCases, null, 2));
}

main();
