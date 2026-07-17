#!/usr/bin/env node

/**
 * check-consistency.js
 *
 * Checks cross-document consistency across a .engineering-docs/ directory.
 * Validates that entities, endpoints, threats, and references align across
 * database-design, api-design, security-threat-model, test-strategy, and
 * implementation-plan documents.
 *
 * Usage:
 *   node check-consistency.js <path-to-.engineering-docs-dir>
 *   node check-consistency.js --help
 *
 * Output: JSON consistency report to stdout
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function printHelp() {
  console.log(`
check-consistency.js

Check cross-document consistency across engineering documents.

USAGE
  node check-consistency.js <dir>
  node check-consistency.js --help

ARGUMENTS
  <dir>   Path to the .engineering-docs/ directory containing .md files

CHECKS PERFORMED
  1. Entity names match across database-design and api-design documents
  2. API endpoints have corresponding database entities
  3. Security threat model covers all API surfaces
  4. Test strategy references all feature blueprints
  5. Implementation plan respects architecture dependencies

OUTPUT
  JSON consistency report written to stdout.
  Exit code 0 if no issues, 1 if issues found.

EXAMPLE
  node check-consistency.js ./.engineering-docs
  node check-consistency.js ./.engineering-docs | jq .summary
`);
}

/**
 * Read a file and return its content, or null on error.
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Parse YAML frontmatter from a markdown file.
 */
function parseFrontmatter(content) {
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
 * Normalize an entity/table name for comparison.
 * Converts to lowercase, strips underscores/hyphens, singularizes.
 */
function normalizeEntityName(name) {
  let norm = name.toLowerCase().replace(/[_\-\s]+/g, '');

  // Simple singularization
  if (norm.endsWith('ies') && norm.length > 4) {
    norm = norm.slice(0, -3) + 'y';
  } else if (norm.endsWith('ses') || norm.endsWith('xes') || norm.endsWith('zes')) {
    norm = norm.slice(0, -2);
  } else if (norm.endsWith('s') && !norm.endsWith('ss') && norm.length > 3) {
    norm = norm.slice(0, -1);
  }

  return norm;
}

// ---------------------------------------------------------------------------
// Document parsers
// ---------------------------------------------------------------------------

/**
 * Extract entity/table names from database-design document.
 * Looks for CREATE TABLE statements and entity definitions in ER diagrams.
 */
function extractDbEntities(content) {
  const entities = new Set();

  // From CREATE TABLE statements
  const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"']?(\w+)[`"']?\s*\(/gi;
  let match;
  while ((match = createTableRegex.exec(content)) !== null) {
    entities.add(match[1]);
  }

  // From ER diagram entity definitions
  const erEntityRegex = /^\s*(\w+)\s*\{/gm;
  while ((match = erEntityRegex.exec(content)) !== null) {
    const name = match[1].trim();
    // Filter out non-entity names (like graph directives)
    if (name && !name.match(/^(erDiagram|graph|subgraph|end|class|style)$/i)) {
      entities.add(name);
    }
  }

  // From table definition headers: ### 3.1 `[table_name]`
  const tableHeaderRegex = /###\s+\d+\.\d+\s+[`"']?(\w+)[`"']?/g;
  while ((match = tableHeaderRegex.exec(content)) !== null) {
    entities.add(match[1]);
  }

  // From data dictionary headers: ### `[table_name]`
  const dictHeaderRegex = /###\s+[`"'](\w+)[`"']/g;
  while ((match = dictHeaderRegex.exec(content)) !== null) {
    entities.add(match[1]);
  }

  return [...entities];
}

/**
 * Extract API resource/entity names from api-design document.
 * Looks for resource model entities and endpoint path segments.
 */
function extractApiEntities(content) {
  const entities = new Set();

  // From ER diagram entity definitions in resource model
  const erEntityRegex = /^\s*(\w+)\s*\{/gm;
  let match;
  while ((match = erEntityRegex.exec(content)) !== null) {
    const name = match[1].trim();
    if (name && !name.match(/^(erDiagram|graph|subgraph|end)$/i)) {
      entities.add(name);
    }
  }

  // From resource ownership table
  const resourceRegex = /\|\s*`?(\/[\w/{}]+)`?\s*\|/g;
  while ((match = resourceRegex.exec(content)) !== null) {
    // Extract the resource name from the path
    const pathStr = match[1];
    const segments = pathStr.split('/').filter(Boolean);
    for (const seg of segments) {
      if (!seg.startsWith('{') && seg !== 'v1' && seg !== 'v2') {
        entities.add(seg);
      }
    }
  }

  return [...entities];
}

/**
 * Extract API endpoint paths from api-design document.
 */
function extractApiEndpoints(content) {
  const endpoints = [];

  // Match HTTP method + path patterns
  const endpointRegex = /(?:GET|POST|PUT|PATCH|DELETE)\s+(\/v\d+\/[\w/{}]+)/gi;
  let match;
  while ((match = endpointRegex.exec(content)) !== null) {
    endpoints.push({
      method: match[0].split(/\s+/)[0].toUpperCase(),
      path: match[1],
    });
  }

  return endpoints;
}

/**
 * Extract security threats/components from security-threat-model document.
 */
function extractThreatComponents(content) {
  const components = new Set();

  // From STRIDE threat tables - extract component/flow column
  const threatRowRegex = /\|\s*\w+-\d+\s*\|\s*([^|]+)\s*\|/g;
  let match;
  while ((match = threatRowRegex.exec(content)) !== null) {
    const component = match[1].trim();
    if (component && component !== 'Component / Flow') {
      components.add(component);
    }
  }

  // From trust zone table
  const trustRegex = /\|\s*(?:External|DMZ|Internal|Data)\s*\|[^|]*\|\s*([^|]+)\s*\|/gi;
  while ((match = trustRegex.exec(content)) !== null) {
    const compStr = match[1].trim();
    const comps = compStr.split(',').map((c) => c.trim());
    for (const c of comps) {
      if (c && c !== 'Components') components.add(c);
    }
  }

  // From data flow diagram nodes
  const dfdNodeRegex = /\b(\w+)\[([^\]]+)\]/g;
  while ((match = dfdNodeRegex.exec(content)) !== null) {
    components.add(match[2].trim());
  }

  return [...components];
}

/**
 * Extract test strategy references/features.
 */
function extractTestFeatures(content) {
  const features = new Set();

  // From acceptance test scenarios
  const scenarioRegex = /###\s+\d+\.\d+\s+Scenario\s+\d+:\s*(?:\[)?([^\]\n]+?)(?:\])?$/gm;
  let match;
  while ((match = scenarioRegex.exec(content)) !== null) {
    const name = match[1].trim().replace(/^\[|\]$/g, '');
    if (name && name !== 'Name of Core Path' && name !== 'Name of Edge Case') {
      features.add(name);
    }
  }

  // From section headers that reference features
  const featureHeaderRegex = /##\s+\d+\.\s+([^\n]+)/g;
  while ((match = featureHeaderRegex.exec(content)) !== null) {
    features.add(match[1].trim());
  }

  return [...features];
}

/**
 * Extract implementation plan phases and their dependencies.
 */
function extractImplPhases(content) {
  const phases = [];

  // Match phase headers
  const phaseRegex = /###\s+Phase\s+(\d+):\s*(.+?)(?:\n|$)/g;
  let match;
  while ((match = phaseRegex.exec(content)) !== null) {
    phases.push({
      number: parseInt(match[1], 10),
      name: match[2].trim(),
      dependsOn: [],
      builds: '',
    });
  }

  // Extract "Depends on:" lines within each phase
  const phaseBlockRegex = /###\s+Phase\s+(\d+)[^]*?(?=###\s+Phase\s+\d+|$)/g;
  let blockIdx = 0;
  while ((match = phaseBlockRegex.exec(content)) !== null) {
    const block = match[1] + match[0].slice(match[0].indexOf('\n'));
    const phaseNum = parseInt(match[1], 10);

    const dependsMatch = block.match(/\*\*Depends\s+on:\*\*\s*(.+?)(?:\n|$)/i);
    if (dependsMatch) {
      const depsStr = dependsMatch[1].trim();
      // Parse "Phase 0", "Phase 1, Phase 2", etc.
      const depPhases = depsStr.match(/Phase\s+\d+/gi) || [];
      const phaseObj = phases.find((p) => p.number === phaseNum);
      if (phaseObj) {
        phaseObj.dependsOn = depPhases.map((d) => parseInt(d.match(/\d+/)[0], 10));
      }
    }

    const buildsMatch = block.match(/\*\*Builds:\*\*\s*(.+?)(?:\n|$)/i);
    if (buildsMatch) {
      const phaseObj = phases.find((p) => p.number === phaseNum);
      if (phaseObj) {
        phaseObj.builds = buildsMatch[1].trim();
      }
    }

    blockIdx++;
  }

  return phases;
}

// ---------------------------------------------------------------------------
// Consistency checks
// ---------------------------------------------------------------------------

/**
 * Check 1: Entity names match across database-design and api-design.
 */
function checkEntityConsistency(dbEntities, apiEntities) {
  const issues = [];
  const dbNormalized = {};
  const apiNormalized = {};

  for (const entity of dbEntities) {
    dbNormalized[normalizeEntityName(entity)] = entity;
  }
  for (const entity of apiEntities) {
    apiNormalized[normalizeEntityName(entity)] = entity;
  }

  // DB entities not found in API
  for (const [norm, original] of Object.entries(dbNormalized)) {
    if (!apiNormalized[norm]) {
      issues.push({
        severity: 'warning',
        message: `Database entity "${original}" has no corresponding API resource`,
        source: 'database-design',
        target: 'api-design',
        entity: original,
      });
    }
  }

  // API entities not found in DB
  for (const [norm, original] of Object.entries(apiNormalized)) {
    if (!dbNormalized[norm]) {
      issues.push({
        severity: 'warning',
        message: `API resource "${original}" has no corresponding database entity`,
        source: 'api-design',
        target: 'database-design',
        entity: original,
      });
    }
  }

  return issues;
}

/**
 * Check 2: API endpoints have corresponding database entities.
 */
function checkEndpointEntityAlignment(endpoints, dbEntities) {
  const issues = [];
  const dbNormalizedSet = new Set(dbEntities.map(normalizeEntityName));

  for (const ep of endpoints) {
    // Extract resource names from path
    const segments = ep.path.split('/').filter(Boolean);
    const resourceSegments = segments.filter(
      (s) => !s.startsWith('{') && !s.startsWith('v')
    );

    let hasEntity = false;
    for (const seg of resourceSegments) {
      if (dbNormalizedSet.has(normalizeEntityName(seg))) {
        hasEntity = true;
        break;
      }
    }

    // Only flag if the endpoint has identifiable resource segments
    if (resourceSegments.length > 0 && !hasEntity) {
      issues.push({
        severity: 'info',
        message: `Endpoint ${ep.method} ${ep.path} may not have a direct database entity mapping`,
        endpoint: `${ep.method} ${ep.path}`,
        resourceSegments,
      });
    }
  }

  return issues;
}

/**
 * Check 3: Security threat model covers API surfaces.
 */
function checkThreatCoverage(endpoints, threatComponents) {
  const issues = [];

  // Normalize threat components
  const normalizedThreats = new Set(
    threatComponents.map((c) => normalizeEntityName(c))
  );

  // Check if common API-related threats are covered
  const apiRelatedThreats = [
    'api',
    'endpoint',
    'authentication',
    'authorization',
    'token',
    'jwt',
    'login',
    'webhook',
    'input',
    'injection',
    'idor',
    'rate',
    'dos',
  ];

  const coveredApiThreats = apiRelatedThreats.filter((t) => {
    for (const comp of normalizedThreats) {
      if (comp.includes(t)) return true;
    }
    return false;
  });

  const uncoveredApiThreats = apiRelatedThreats.filter(
    (t) => !coveredApiThreats.includes(t)
  );

  if (uncoveredApiThreats.length > 0 && endpoints.length > 0) {
    issues.push({
      severity: 'info',
      message: 'Security threat model may not explicitly cover some API-related threat categories',
      uncoveredCategories: uncoveredApiThreats,
      note: 'Verify that STRIDE analysis addresses all API surfaces',
    });
  }

  // Check if any endpoints are mentioned in threat analysis
  const threatContent = [...threatComponents].join(' ').toLowerCase();
  const unmatchedEndpoints = endpoints.filter((ep) => {
    const pathNorm = ep.path.toLowerCase();
    // Check if the endpoint path or its segments appear in threat analysis
    const segments = pathNorm.split('/').filter(Boolean);
    return !segments.some(
      (seg) => !seg.startsWith('v') && threatContent.includes(seg)
    );
  });

  if (unmatchedEndpoints.length > 0 && unmatchedEndpoints.length <= endpoints.length) {
    for (const ep of unmatchedEndpoints) {
      issues.push({
        severity: 'warning',
        message: `Endpoint ${ep.method} ${ep.path} may not be explicitly covered in security threat model`,
        endpoint: `${ep.method} ${ep.path}`,
      });
    }
  }

  return issues;
}

/**
 * Check 4: Test strategy references feature blueprints.
 */
function checkTestCoverage(testFeatures, dbEntities, apiEntities) {
  const issues = [];

  // Check if test strategy mentions key entities
  const testContent = [...testFeatures].join(' ').toLowerCase();
  const allEntities = [...new Set([...dbEntities, ...apiEntities])];

  const untestedEntities = allEntities.filter((entity) => {
    const norm = normalizeEntityName(entity);
    return !testContent.includes(norm) && !testContent.includes(entity.toLowerCase());
  });

  if (untestedEntities.length > 0) {
    issues.push({
      severity: 'info',
      message: 'Test strategy may not explicitly reference some entities/resources',
      untestedEntities: untestedEntities.slice(0, 10),
      note: 'Verify acceptance test scenarios cover critical user paths for these entities',
    });
  }

  return issues;
}

/**
 * Check 5: Implementation plan respects architecture dependencies.
 */
function checkImplDependencies(phases, dbEntities) {
  const issues = [];

  // Check that foundation phase (Phase 0) includes data model
  const phase0 = phases.find((p) => p.number === 0);
  if (phase0) {
    const buildsLower = phase0.builds.toLowerCase();
    if (
      dbEntities.length > 0 &&
      !buildsLower.includes('data') &&
      !buildsLower.includes('schema') &&
      !buildsLower.includes('model') &&
      !buildsLower.includes('database')
    ) {
      issues.push({
        severity: 'warning',
        message: 'Phase 0 (Foundation) may not explicitly include data model/schema setup',
        phase: phase0,
        note: 'Database entities exist but Phase 0 builds description does not mention data layer',
      });
    }
  }

  // Check phase dependency ordering
  for (const phase of phases) {
    for (const dep of phase.dependsOn) {
      if (dep >= phase.number) {
        issues.push({
          severity: 'error',
          message: `Phase ${phase.number} depends on Phase ${dep}, which would create a forward or self dependency`,
          phase: phase.number,
          dependsOn: dep,
        });
      }
      if (!phases.find((p) => p.number === dep)) {
        issues.push({
          severity: 'warning',
          message: `Phase ${phase.number} depends on Phase ${dep}, which is not defined in the implementation plan`,
          phase: phase.number,
          dependsOn: dep,
        });
      }
    }
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Document finder
// ---------------------------------------------------------------------------

/**
 * Find a document by skill name in the directory.
 */
function findDocBySkill(dir, mdFiles, skillName) {
  for (const file of mdFiles) {
    const filePath = path.join(dir, file);
    const content = readFile(filePath);
    if (!content) continue;

    const meta = parseFrontmatter(content);
    if (meta.skill === skillName) {
      return { file, content, meta };
    }
  }
  return null;
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

  const mdFiles = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));

  const report = {
    directory: dir,
    timestamp: new Date().toISOString(),
    summary: {
      totalDocuments: mdFiles.length,
      checksPerformed: 5,
      errors: 0,
      warnings: 0,
      info: 0,
    },
    checks: {
      entityConsistency: { status: 'not_run', issues: [] },
      endpointEntityAlignment: { status: 'not_run', issues: [] },
      threatCoverage: { status: 'not_run', issues: [] },
      testCoverage: { status: 'not_run', issues: [] },
      implementationDependencies: { status: 'not_run', issues: [] },
    },
  };

  // Load documents by skill
  const dbDoc = findDocBySkill(dir, mdFiles, 'database-design-document');
  const apiDoc = findDocBySkill(dir, mdFiles, 'api-design-document');
  const securityDoc = findDocBySkill(dir, mdFiles, 'security-threat-model');
  const testDoc = findDocBySkill(dir, mdFiles, 'test-strategy-document');
  const implDoc = findDocBySkill(dir, mdFiles, 'implementation-plan');

  // Extract entities and features
  const dbEntities = dbDoc ? extractDbEntities(dbDoc.content) : [];
  const apiEntities = apiDoc ? extractApiEntities(apiDoc.content) : [];
  const apiEndpoints = apiDoc ? extractApiEndpoints(apiDoc.content) : [];
  const threatComponents = securityDoc
    ? extractThreatComponents(securityDoc.content)
    : [];
  const testFeatures = testDoc ? extractTestFeatures(testDoc.content) : [];
  const implPhases = implDoc ? extractImplPhases(implDoc.content) : [];

  // Check 1: Entity consistency
  if (dbDoc && apiDoc) {
    report.checks.entityConsistency.status = 'checked';
    report.checks.entityConsistency.issues = checkEntityConsistency(
      dbEntities,
      apiEntities
    );
    report.checks.entityConsistency.entitiesFound = {
      database: dbEntities,
      api: apiEntities,
    };
  } else {
    report.checks.entityConsistency.status = 'skipped';
    report.checks.entityConsistency.reason = !dbDoc
      ? 'database-design-document not found'
      : 'api-design-document not found';
  }

  // Check 2: Endpoint-entity alignment
  if (apiDoc && dbDoc) {
    report.checks.endpointEntityAlignment.status = 'checked';
    report.checks.endpointEntityAlignment.issues =
      checkEndpointEntityAlignment(apiEndpoints, dbEntities);
    report.checks.endpointEntityAlignment.endpointsFound = apiEndpoints;
  } else {
    report.checks.endpointEntityAlignment.status = 'skipped';
    report.checks.endpointEntityAlignment.reason = !apiDoc
      ? 'api-design-document not found'
      : 'database-design-document not found';
  }

  // Check 3: Threat coverage
  if (securityDoc && apiDoc) {
    report.checks.threatCoverage.status = 'checked';
    report.checks.threatCoverage.issues = checkThreatCoverage(
      apiEndpoints,
      threatComponents
    );
    report.checks.threatCoverage.threatComponentsFound = threatComponents;
  } else {
    report.checks.threatCoverage.status = 'skipped';
    report.checks.threatCoverage.reason = !securityDoc
      ? 'security-threat-model not found'
      : 'api-design-document not found';
  }

  // Check 4: Test coverage
  if (testDoc) {
    report.checks.testCoverage.status = 'checked';
    report.checks.testCoverage.issues = checkTestCoverage(
      testFeatures,
      dbEntities,
      apiEntities
    );
    report.checks.testCoverage.testFeaturesFound = testFeatures;
  } else {
    report.checks.testCoverage.status = 'skipped';
    report.checks.testCoverage.reason = 'test-strategy-document not found';
  }

  // Check 5: Implementation dependencies
  if (implDoc) {
    report.checks.implementationDependencies.status = 'checked';
    report.checks.implementationDependencies.issues = checkImplDependencies(
      implPhases,
      dbEntities
    );
    report.checks.implementationDependencies.phasesFound = implPhases;
  } else {
    report.checks.implementationDependencies.status = 'skipped';
    report.checks.implementationDependencies.reason =
      'implementation-plan not found';
  }

  // Aggregate counts
  for (const check of Object.values(report.checks)) {
    for (const issue of check.issues || []) {
      if (issue.severity === 'error') report.summary.errors++;
      else if (issue.severity === 'warning') report.summary.warnings++;
      else report.summary.info++;
    }
  }

  console.log(JSON.stringify(report, null, 2));

  if (report.summary.errors > 0) {
    process.exit(1);
  }
}

main();
