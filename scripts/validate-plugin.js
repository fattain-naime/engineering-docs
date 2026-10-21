#!/usr/bin/env node

/**
 * validate-plugin.js — Claude Code plugin structure validation
 *
 * Cross-checks the plugin against the contracts in the Claude Code plugin
 * docs (manifest reference, marketplace reference, hooks reference, plugin
 * components):
 *
 *   - .claude-plugin/plugin.json has the required metadata and a kebab-case name
 *   - .claude-plugin/marketplace.json has name/owner/plugins with valid entries,
 *     and the "./" entry matches the manifest name and version
 *   - Versions are consistent across package.json, plugin.json and marketplace.json
 *   - hooks/hooks.json wraps its event map in a top-level "hooks" key, and any
 *     command that references a bundled script uses ${CLAUDE_PLUGIN_ROOT}
 *   - .mcp.json server configs reference bundled scripts via ${CLAUDE_PLUGIN_ROOT}
 *   - agents/*.md carry name and description frontmatter
 *
 * Zero-dependency, same output convention as test-skills.js:
 *   ✓ <check>  /  ✗ <check>: <reason>   and a Results summary; exit 1 on failure.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
let passed = 0;
let failed = 0;

function ok(name) {
  console.log(`  ✓ ${name}`);
  passed++;
}

function fail(name, reason) {
  console.log(`  ✗ ${name}: ${reason}`);
  failed++;
}

function readJson(relPath) {
  const filePath = path.join(ROOT, relPath);
  if (!fs.existsSync(filePath)) {
    return { error: 'file not found' };
  }
  try {
    return { data: JSON.parse(fs.readFileSync(filePath, 'utf8')) };
  } catch (e) {
    return { error: `invalid JSON: ${e.message}` };
  }
}

const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
// Marketplace/plugin entry names allow letters, digits, ".", "_", "-" and must
// start with a letter or digit (marketplace reference, "Plugin entries").
const ENTRY_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const SEMVER = /^\d+\.\d+\.\d+/;

// A command/args/env tuple that references a bundled directory (hooks/,
// scripts/, bin/) without ${CLAUDE_PLUGIN_ROOT} will resolve against the
// session cwd instead of the plugin install dir, and break after install.
// Paths anchored to any ${VAR} placeholder are stripped first, so legitimate
// references such as ${CLAUDE_PROJECT_DIR}/scripts/... don't trip the check.
const BUNDLED_DIR = /(?:^|[\s"'=/\\])(hooks|scripts|bin)\//;
const VAR_ANCHORED_PATH = /\$\{[^}]+\}\/[^\s"']*/g;

function refsBundledWithoutPluginRoot(strings) {
  const combined = strings.filter(Boolean).join(' ');
  if (combined.includes('${CLAUDE_PLUGIN_ROOT}')) return false;
  return BUNDLED_DIR.test(combined.replace(VAR_ANCHORED_PATH, ' '));
}

console.log('Plugin manifest:');

const pluginJson = readJson('.claude-plugin/plugin.json');
if (pluginJson.error) {
  fail('plugin.json', pluginJson.error);
} else {
  const p = pluginJson.data;
  if (typeof p.name !== 'string' || !KEBAB_CASE.test(p.name)) {
    fail('plugin.json name', `expected kebab-case string, got ${JSON.stringify(p.name)}`);
  } else {
    ok(`plugin.json name "${p.name}"`);
  }
  if (typeof p.version !== 'string' || !SEMVER.test(p.version)) {
    fail('plugin.json version', `expected semver string, got ${JSON.stringify(p.version)}`);
  } else {
    ok(`plugin.json version ${p.version}`);
  }
  if (typeof p.description !== 'string' || p.description.length === 0) {
    fail('plugin.json description', 'missing or empty');
  } else {
    ok('plugin.json description present');
  }
  if (!p.author || typeof p.author.name !== 'string' || p.author.name.length === 0) {
    fail('plugin.json author', 'missing author.name');
  } else {
    ok('plugin.json author present');
  }
  // Directory-listing field (manifest reference): Anthropic's directory reads
  // `icon` from plugin.json; the docs show it as a "./"-prefixed path to an
  // image file inside the plugin (e.g. "./logo.png").
  if (p.icon !== undefined) {
    if (typeof p.icon !== 'string' || !p.icon.startsWith('./') || p.icon.includes('..')) {
      fail('plugin.json icon', `expected "./"-prefixed path inside the plugin, got ${JSON.stringify(p.icon)}`);
    } else if (!fs.existsSync(path.join(ROOT, p.icon))) {
      fail('plugin.json icon', `file not found: ${p.icon}`);
    } else {
      ok(`plugin.json icon ${p.icon} exists`);
    }
  }
  // The other directory-listing fields must be https URLs when present.
  for (const field of ['documentationUrl', 'supportUrl', 'privacyPolicyUrl', 'termsOfServiceUrl']) {
    if (p[field] === undefined) continue;
    if (typeof p[field] !== 'string' || !p[field].startsWith('https://')) {
      fail(`plugin.json ${field}`, `expected https:// URL, got ${JSON.stringify(p[field])}`);
    } else {
      ok(`plugin.json ${field} is an https:// URL`);
    }
  }
}

console.log('\nMarketplace:');

const marketplace = readJson('.claude-plugin/marketplace.json');
let marketplaceEntry = null;
if (marketplace.error) {
  fail('marketplace.json', marketplace.error);
} else {
  const m = marketplace.data;
  if (typeof m.name !== 'string' || m.name.length === 0) {
    fail('marketplace name', 'missing or empty');
  } else {
    ok(`marketplace name "${m.name}"`);
  }
  if (!m.owner || typeof m.owner.name !== 'string' || m.owner.name.length === 0) {
    fail('marketplace owner', 'missing owner.name');
  } else {
    ok('marketplace owner present');
  }
  if (!Array.isArray(m.plugins) || m.plugins.length === 0) {
    fail('marketplace plugins', 'plugins array missing or empty');
  } else {
    ok(`marketplace lists ${m.plugins.length} plugin(s)`);
    m.plugins.forEach((entry, i) => {
      const label = `plugins[${i}]`;
      if (typeof entry.name !== 'string' || !ENTRY_NAME.test(entry.name)) {
        fail(label, `invalid entry name ${JSON.stringify(entry.name)}`);
        return;
      }
      if (typeof entry.source !== 'string' && (typeof entry.source !== 'object' || entry.source === null)) {
        fail(`${label} source`, 'missing or invalid');
        return;
      }
      if (typeof entry.source === 'string' && entry.source !== '.' && !entry.source.startsWith('./')) {
        fail(`${label} source`, `relative path must start with "./": ${entry.source}`);
        return;
      }
      if (typeof entry.source === 'string' && entry.source.includes('..')) {
        fail(`${label} source`, 'path contains ".."');
        return;
      }
      ok(`${label} "${entry.name}" has valid name and source`);
      if (typeof entry.source === 'string' && (entry.source === '.' || entry.source === './')) {
        marketplaceEntry = entry;
      }
    });
  }
}

console.log('\nVersion consistency:');

const pkg = readJson('package.json');
const evalsJson = readJson('evals/evals.json');
const versions = [];
if (!pkg.error && pkg.data.version) versions.push(['package.json', pkg.data.version]);
if (!pluginJson.error && pluginJson.data.version) versions.push(['plugin.json', pluginJson.data.version]);
if (marketplaceEntry && marketplaceEntry.version) {
  versions.push(['marketplace.json entry', marketplaceEntry.version]);
}
if (!evalsJson.error && evalsJson.data.version) {
  versions.push(['evals/evals.json', evalsJson.data.version]);
}
if (versions.length >= 2) {
  const [, firstVersion] = versions[0];
  const mismatched = versions.filter(([, v]) => v !== firstVersion);
  if (mismatched.length > 0) {
    fail(
      'versions match',
      versions.map(([f, v]) => `${f}=${v}`).join(', ')
    );
  } else {
    ok(`versions match (${firstVersion})`);
  }
} else {
  fail('versions match', 'could not read versions from package.json/plugin.json');
}

// When the marketplace lists the repo root as the plugin, the entry name must
// equal the manifest name or installs by manifest name fail with
// 'Plugin "<manifest-name>" not found in marketplace'.
if (marketplaceEntry && !pluginJson.error) {
  const manifestName = pluginJson.data.name;
  if (marketplaceEntry.name !== manifestName) {
    fail('entry name matches manifest', `entry="${marketplaceEntry.name}" manifest="${manifestName}"`);
  } else {
    ok('entry name matches manifest name');
  }
}

console.log('\nHooks:');

const hooksFile = readJson('hooks/hooks.json');
if (hooksFile.error) {
  fail('hooks.json', hooksFile.error);
} else {
  const h = hooksFile.data;
  if (!h.hooks || typeof h.hooks !== 'object' || Array.isArray(h.hooks)) {
    fail('hooks.json structure', 'missing top-level "hooks" wrapper key');
  } else {
    ok('hooks.json has top-level "hooks" key');
    let handlerCount = 0;
    let pathIssue = null;
    for (const [event, groups] of Object.entries(h.hooks)) {
      if (!Array.isArray(groups)) {
        fail(`hooks.json ${event}`, 'event must map to an array of matcher groups');
        continue;
      }
      for (const group of groups) {
        for (const handler of group.hooks || []) {
          handlerCount++;
          if (handler.type === 'command' && refsBundledWithoutPluginRoot([handler.command, ...(handler.args || [])])) {
            pathIssue = `${event}: "${handler.command}" references a bundled script without \${CLAUDE_PLUGIN_ROOT}`;
          }
        }
      }
    }
    if (pathIssue) {
      fail('hook script paths', pathIssue);
    } else if (handlerCount === 0) {
      fail('hook handlers', 'no command handlers found');
    } else {
      ok(`all ${handlerCount} hook handler(s) use \${CLAUDE_PLUGIN_ROOT} for bundled scripts`);
    }
  }
}

console.log('\nMCP:');

const mcpFile = readJson('.mcp.json');
if (mcpFile.error) {
  fail('.mcp.json', mcpFile.error);
} else {
  const servers = mcpFile.data.mcpServers || mcpFile.data;
  const names = Object.keys(servers);
  if (names.length === 0) {
    fail('.mcp.json', 'no servers declared');
  }
  let mcpIssue = null;
  for (const [name, config] of Object.entries(servers)) {
    const envValues = config && config.env ? Object.values(config.env) : [];
    const strings = [config && config.command, ...((config && config.args) || []), ...envValues];
    if (refsBundledWithoutPluginRoot(strings)) {
      mcpIssue = `server "${name}" references a bundled script without \${CLAUDE_PLUGIN_ROOT}`;
    }
  }
  if (mcpIssue) {
    fail('MCP script paths', mcpIssue);
  } else if (names.length > 0) {
    ok(`all ${names.length} MCP server(s) use \${CLAUDE_PLUGIN_ROOT} for bundled scripts`);
  }
}

console.log('\nAgents:');

const agentsDir = path.join(ROOT, 'agents');
if (fs.existsSync(agentsDir)) {
  const agents = fs.readdirSync(agentsDir).filter((f) => f.endsWith('.md'));
  for (const agent of agents) {
    const content = fs.readFileSync(path.join(agentsDir, agent), 'utf8');
    const lines = content.split('\n');
    if (lines[0].trim() !== '---') {
      fail(agent, 'missing YAML frontmatter');
      continue;
    }
    const end = lines.slice(1).findIndex((l) => l.trim() === '---');
    const frontmatter = end === -1 ? '' : lines.slice(1, end + 1).join('\n');
    if (!/^name:/m.test(frontmatter)) {
      fail(agent, 'frontmatter missing "name"');
    } else if (!/^description:/m.test(frontmatter)) {
      fail(agent, 'frontmatter missing "description"');
    } else {
      ok(agent);
    }
  }
} else {
  fail('agents/', 'directory not found');
}

// claude plugin validate warns when a CLAUDE.md sits at the plugin root,
// because Claude Code never loads it as context.
if (fs.existsSync(path.join(ROOT, 'CLAUDE.md'))) {
  console.log('  ! warning: CLAUDE.md at plugin root is not loaded as project context');
}

console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(40)}`);

process.exit(failed > 0 ? 1 : 0);
