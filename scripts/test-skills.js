#!/usr/bin/env node

/**
 * Basic validation test for engineering-docs plugin
 * Checks that all SKILL.md files have valid frontmatter
 */

const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(__dirname, '..', 'skills');
let passed = 0;
let failed = 0;

function validateSkill(skillPath) {
  const skillMd = path.join(skillPath, 'SKILL.md');
  const templateMd = path.join(skillPath, 'template.md');
  const skillName = path.basename(skillPath);

  // Check SKILL.md exists
  if (!fs.existsSync(skillMd)) {
    console.log(`  ✗ ${skillName}: Missing SKILL.md`);
    failed++;
    return;
  }

  // Check template.md exists
  if (!fs.existsSync(templateMd)) {
    console.log(`  ✗ ${skillName}: Missing template.md`);
    failed++;
    return;
  }

  // Check SKILL.md has frontmatter
  const content = fs.readFileSync(skillMd, 'utf8');
  if (!content.startsWith('---')) {
    console.log(`  ✗ ${skillName}: SKILL.md missing frontmatter`);
    failed++;
    return;
  }

  // Check for required fields
  const hasName = content.includes('name:');
  const hasDescription = content.includes('description:');

  if (!hasName || !hasDescription) {
    console.log(`  ✗ ${skillName}: Missing required frontmatter fields`);
    failed++;
    return;
  }

  console.log(`  ✓ ${skillName}`);
  passed++;
}

// Main
console.log('Validating engineering-docs plugin...\n');

// Check skills directory
if (!fs.existsSync(SKILLS_DIR)) {
  console.error('ERROR: skills/ directory not found');
  process.exit(1);
}

console.log('Skills:');
const skills = fs.readdirSync(SKILLS_DIR).filter(f => {
  return fs.statSync(path.join(SKILLS_DIR, f)).isDirectory();
});

skills.forEach(skill => validateSkill(path.join(SKILLS_DIR, skill)));

// Check agents directory
console.log('\nAgents:');
const agentsDir = path.join(__dirname, '..', 'agents');
if (fs.existsSync(agentsDir)) {
  const agents = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
  agents.forEach(agent => {
    const content = fs.readFileSync(path.join(agentsDir, agent), 'utf8');
    if (content.includes('name:') && content.includes('description:')) {
      console.log(`  ✓ ${agent}`);
      passed++;
    } else {
      console.log(`  ✗ ${agent}: Missing required fields`);
      failed++;
    }
  });
}

// Check hooks
console.log('\nHooks:');
const hooksFile = path.join(__dirname, '..', 'hooks', 'hooks.json');
if (fs.existsSync(hooksFile)) {
  try {
    JSON.parse(fs.readFileSync(hooksFile, 'utf8'));
    console.log('  ✓ hooks.json valid');
    passed++;
  } catch (e) {
    console.log('  ✗ hooks.json invalid JSON');
    failed++;
  }
}

// Check MCP config
console.log('\nMCP:');
const mcpFile = path.join(__dirname, '..', '.mcp.json');
if (fs.existsSync(mcpFile)) {
  try {
    JSON.parse(fs.readFileSync(mcpFile, 'utf8'));
    console.log('  ✓ .mcp.json valid');
    passed++;
  } catch (e) {
    console.log('  ✗ .mcp.json invalid JSON');
    failed++;
  }
}

// Summary
console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(40)}`);

process.exit(failed > 0 ? 1 : 0);
