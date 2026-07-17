#!/usr/bin/env node

/**
 * calculate-error-budget.js
 *
 * Calculates error budget burn rate from SLO specification documents.
 *
 * Usage:
 *   node calculate-error-budget.js <path-to-slo-document>
 *   node calculate-error-budget.js --help
 *
 * Input: SLO document path (.md file with YAML frontmatter)
 * Output: JSON with error budget calculations to stdout
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function printHelp() {
  console.log(`
calculate-error-budget.js

Calculate error budget burn rate from an SLO specification document.

USAGE
  node calculate-error-budget.js <slo-document-path>
  node calculate-error-budget.js --help

ARGUMENTS
  <slo-document-path>   Path to an SLO & Error Budget .md document

OUTPUT
  JSON object with error budget calculations written to stdout.

EXAMPLE
  node calculate-error-budget.js ./.engineering-docs/slo-error-budget.md
  node calculate-error-budget.js ./.engineering-docs/slo-error-budget.md | jq .budgets
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
 * Parse SLO targets from the markdown body.
 * Looks for patterns like "99.9%", "99.95%", etc. in SLO table sections.
 * Also looks for structured SLO entries in tables.
 */
function parseSLOTargets(content) {
  const targets = [];

  // Match SLO table rows: | SLI-XX | ... | XX.X% | ... |
  const tableRowRegex = /\|\s*(SLI-\d+\w*)\s*\|([^|]*)\|\s*(\d+(?:\.\d+)?)\s*%\s*\|([^|]*)\|([^|]*)\|/gi;
  let match;

  while ((match = tableRowRegex.exec(content)) !== null) {
    const sliId = match[1].trim();
    const sliName = match[2].trim();
    const targetPercent = parseFloat(match[3]);
    const window = match[4].trim();
    const rationale = match[5].trim();

    targets.push({
      sliId,
      sliName: sliName || sliId,
      targetPercent,
      targetDecimal: targetPercent / 100,
      measurementWindow: window,
      rationale,
    });
  }

  // If no structured table matches, try simpler patterns
  if (targets.length === 0) {
    // Look for "Target: XX.X%" or "SLO: XX.X%" patterns
    const simpleRegex = /(?:target|slo|uptime|availability)[^%\n]*?(\d+(?:\.\d+)?)\s*%/gi;
    let idx = 0;
    while ((match = simpleRegex.exec(content)) !== null) {
      idx++;
      const targetPercent = parseFloat(match[1]);
      if (targetPercent > 0 && targetPercent < 100) {
        targets.push({
          sliId: `SLI-${String(idx).padStart(2, '0')}`,
          sliName: `Parsed target ${idx}`,
          targetPercent,
          targetDecimal: targetPercent / 100,
          measurementWindow: 'Not specified',
          rationale: '',
        });
      }
    }
  }

  // Also look for burn rate definitions in table rows
  const burnRates = [];
  const burnRateRegex = /\|\s*([^|]*?(?:fast|moderate|slow)[^|]*?)\s*\|\s*(\d+(?:\.\d+)?)x\s*\|([^|]*)\|([^|]*)\|([^|]*)\|/gi;
  while ((match = burnRateRegex.exec(content)) !== null) {
    burnRates.push({
      name: match[1].trim(),
      burnRate: parseFloat(match[2]),
      longWindow: match[3].trim(),
      shortWindow: match[4].trim(),
      action: match[5].trim(),
    });
  }

  return { targets, burnRates };
}

/**
 * Format a duration in seconds to a human-readable string.
 */
function formatDuration(seconds) {
  if (seconds < 60) return `${seconds.toFixed(1)} seconds`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} minutes`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(2)} hours`;
  return `${(seconds / 86400).toFixed(2)} days`;
}

/**
 * Calculate error budget for a given SLO target and time period.
 */
function calculateBudget(targetDecimal, periodDays) {
  const periodSeconds = periodDays * 24 * 60 * 60;
  const errorBudgetDecimal = 1 - targetDecimal;
  const allowedDowntimeSeconds = periodSeconds * errorBudgetDecimal;

  return {
    errorBudgetPercent: (errorBudgetDecimal * 100).toFixed(4),
    allowedDowntime: {
      seconds: Math.round(allowedDowntimeSeconds),
      humanReadable: formatDuration(allowedDowntimeSeconds),
    },
  };
}

/**
 * Calculate burn rate thresholds.
 * Standard multi-window burn rate alerts from Google SRE workbook.
 */
function calculateBurnRates(errorBudgetDecimal, periodDays) {
  const periodSeconds = periodDays * 24 * 60 * 60;
  const totalBudgetSeconds = periodSeconds * errorBudgetDecimal;

  const thresholds = [
    {
      name: 'Fast burn',
      burnRate: 14.4,
      longWindow: '1h',
      shortWindow: '5m',
      description: 'Will exhaust budget in ~5 hours at this rate',
      budgetExhaustionHours: (1 / (14.4 * errorBudgetDecimal)) * (periodDays * 24),
      action: 'Page on-call immediately',
    },
    {
      name: 'Moderate burn',
      burnRate: 6,
      longWindow: '6h',
      shortWindow: '30m',
      description: 'Will exhaust budget in ~12 hours at this rate',
      budgetExhaustionHours: (1 / (6 * errorBudgetDecimal)) * (periodDays * 24),
      action: 'Page on-call',
    },
    {
      name: 'Slow burn',
      burnRate: 3,
      longWindow: '1d',
      shortWindow: '2h',
      description: 'Will exhaust budget in ~5 days at this rate',
      budgetExhaustionHours: (1 / (3 * errorBudgetDecimal)) * (periodDays * 24),
      action: 'File ticket, review within the week',
    },
    {
      name: 'Very slow burn',
      burnRate: 1,
      longWindow: '3d',
      shortWindow: '6h',
      description: 'Will exhaust budget over the full period at this rate',
      budgetExhaustionHours: (1 / (1 * errorBudgetDecimal)) * (periodDays * 24),
      action: 'Review at next planning session',
    },
  ];

  // Calculate error rate threshold for each burn rate
  for (const t of thresholds) {
    // Error rate = burnRate * (errorBudget / periodSeconds)
    const errorRatePerSecond = t.burnRate * (errorBudgetDecimal / periodSeconds);
    const errorRatePerMinute = errorRatePerSecond * 60;
    t.errorRatePerMinute = parseFloat(errorRatePerMinute.toFixed(6));

    // Short window alert threshold
    const shortWindowMinutes = parseDurationMinutes(t.shortWindow);
    t.shortWindowErrorThreshold = Math.max(
      1,
      Math.ceil(errorRatePerMinute * shortWindowMinutes)
    );
  }

  return thresholds;
}

/**
 * Parse a duration string like "5m", "1h", "3d" to minutes.
 */
function parseDurationMinutes(str) {
  const match = str.match(/^(\d+(?:\.\d+)?)([mhd])$/);
  if (!match) return 0;
  const val = parseFloat(match[1]);
  switch (match[2]) {
    case 'm': return val;
    case 'h': return val * 60;
    case 'd': return val * 60 * 24;
    default: return 0;
  }
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
  const { targets, burnRates: documentBurnRates } = parseSLOTargets(content);

  // Default to 30-day window
  const periodDays = 30;

  const result = {
    document: {
      path: filePath,
      title: frontmatter.title || path.basename(filePath, '.md'),
      skill: frontmatter.skill || 'unknown',
      status: frontmatter.status || 'unknown',
    },
    periodDays,
    budgets: [],
    burnRateThresholds: [],
    documentBurnRates: documentBurnRates.length > 0 ? documentBurnRates : undefined,
  };

  if (targets.length === 0) {
    result.error = 'No SLO targets could be parsed from the document. Ensure the document contains a table with SLI-XX entries and percentage targets.';
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }

  // Calculate budgets for each SLO target
  for (const target of targets) {
    const budget = calculateBudget(target.targetDecimal, periodDays);

    result.budgets.push({
      sliId: target.sliId,
      sliName: target.sliName,
      targetPercent: target.targetPercent,
      measurementWindow: target.measurementWindow,
      errorBudgetPercent: budget.errorBudgetPercent,
      allowedDowntime: budget.allowedDowntime,
    });

    // Calculate burn rate thresholds
    const burnRates = calculateBurnRates(
      1 - target.targetDecimal,
      periodDays
    );

    result.burnRateThresholds.push({
      sliId: target.sliId,
      targetPercent: target.targetPercent,
      thresholds: burnRates,
    });
  }

  // Summary
  result.summary = {
    totalSLITargets: targets.length,
    highestSLO: Math.max(...targets.map((t) => targetPercent(t))),
    lowestSLO: Math.min(...targets.map((t) => targetPercent(t))),
    tightestBudget: result.budgets.reduce(
      (min, b) =>
        parseFloat(b.errorBudgetPercent) < parseFloat(min.errorBudgetPercent) ? b : min,
      result.budgets[0]
    ),
  };

  console.log(JSON.stringify(result, null, 2));
}

function targetPercent(t) {
  return t.targetPercent;
}

main();
