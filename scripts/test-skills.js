#!/usr/bin/env node

/**
 * Basic validation test for engineering-docs plugin
 * Checks that all SKILL.md files have valid YAML frontmatter
 */

const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(__dirname, '..', 'skills');
let passed = 0;
let failed = 0;

class FrontmatterError extends Error {
  constructor(line, message) {
    super(message);
    this.line = line;
  }
}

function fail(reader, index, message) {
  throw new FrontmatterError(reader.base + index, message);
}

function skipIgnorable(reader) {
  while (reader.i < reader.lines.length) {
    const trimmed = reader.lines[reader.i].trim();
    if (trimmed === '' || trimmed.charAt(0) === '#') reader.i++;
    else break;
  }
}

function indentOf(reader, index) {
  const indent = /^[ \t]*/.exec(reader.lines[index])[0];
  if (indent.indexOf('\t') !== -1) fail(reader, index, 'tabs cannot be used for indentation');
  return indent.length;
}

// Returns the key of a `key: value` line, or null for any other line. Quoted
// keys are deliberately not recognised, so `"a: b"` stays a scalar.
function keyOf(line) {
  if (line.charAt(0) === '"' || line.charAt(0) === "'") return null;
  const match = /^([^:\t]+):(?:[ \t]|$)/.exec(line);
  if (!match || /[ \t]#/.test(match[1])) return null;
  return match[1].trim();
}

function isSequenceItem(line) {
  return /^ *-(?:[ \t]|$)/.test(line);
}

const NULL_WORDS = ['~', 'null', 'Null', 'NULL'];

function assertPlain(reader, index, text) {
  if (text.startsWith('[') || text.startsWith('{')) {
    fail(reader, index, 'flow collections are not supported in frontmatter');
  }
  if (/^[&*!]/.test(text)) {
    fail(reader, index, 'anchors, aliases and tags are not supported in frontmatter');
  }
  if (/^[,[\]}%@`]/.test(text)) {
    fail(reader, index, `"${text.charAt(0)}" cannot start a plain scalar — quote the value`);
  }
  if (/^-(?:[ \t]|$)/.test(text)) fail(reader, index, 'block sequence entries are not allowed here');
  if (/^\?(?:[ \t]|$)/.test(text)) fail(reader, index, 'mapping keys are not allowed here');
  if (/:\s/.test(text) || text.endsWith(':')) {
    fail(reader, index, 'mapping values are not allowed here — quote the value with double quotes');
  }
}

function readPlain(reader, raw, lineIndex, foldBase) {
  if (/\t/.test(raw)) fail(reader, lineIndex, 'tabs are not allowed');
  let text = raw.replace(/\s+#.*$/, '').trim();
  assertPlain(reader, lineIndex, text);
  if (NULL_WORDS.indexOf(text) !== -1) return null;

  // Plain scalars may wrap onto more indented continuation lines.
  while (reader.i < reader.lines.length) {
    const trimmed = reader.lines[reader.i].trim();
    if (trimmed === '') { reader.i++; continue; }
    if (trimmed.charAt(0) === '#') break;
    if (indentOf(reader, reader.i) <= foldBase) break;
    reader.i++;
    text = `${text} ${trimmed}`;
    assertPlain(reader, reader.i - 1, text);
  }
  return text;
}

const PLAIN_ESCAPES = '0abtnvfre"/\\N_LP ';

function quotedEnd(reader, buffer, quote) {
  const lineIndex = reader.i - 1;
  for (let i = 0; i < buffer.length; i++) {
    const char = buffer[i];
    if (quote === '"' && char === '\\') {
      if (i === buffer.length - 1) return -1;
      const escape = buffer[i + 1];
      if (escape === '\n') { i++; continue; }
      if (escape === 'x' || escape === 'u' || escape === 'U') {
        const width = escape === 'x' ? 2 : escape === 'u' ? 4 : 8;
        const digits = buffer.slice(i + 2, i + 2 + width);
        if (digits.length < width || !/^[0-9a-fA-F]+$/.test(digits)) {
          fail(reader, lineIndex, `invalid escape sequence "\\${escape}"`);
        }
        i += 1 + width;
      } else if (PLAIN_ESCAPES.indexOf(escape) === -1) {
        fail(reader, lineIndex, `unknown escape sequence "\\${escape}"`);
      } else {
        i++;
      }
    } else if (char === quote) {
      if (quote === "'" && buffer[i + 1] === "'") { i++; continue; }
      return i;
    }
  }
  return -1;
}

function readQuoted(reader, raw, lineIndex) {
  const quote = raw.charAt(0);
  let buffer = raw.slice(1);
  for (;;) {
    const end = quotedEnd(reader, buffer, quote);
    if (end !== -1) {
      const tail = buffer.slice(end + 1).trim();
      if (tail !== '' && tail.charAt(0) !== '#') {
        fail(reader, reader.i, 'unexpected content after a quoted scalar');
      }
      return buffer.slice(0, end);
    }
    if (reader.i >= reader.lines.length) {
      const kind = quote === '"' ? 'double' : 'single';
      fail(reader, lineIndex, `unterminated ${kind}-quoted scalar`);
    }
    buffer += `\n${reader.lines[reader.i]}`;
    reader.i++;
  }
}

function readBlock(reader, raw, lineIndex, parentIndent) {
  const header = /^([|>])(?:[+-]\d*|\d+[+-]?)?(?:[ \t]+#.*)?$/.exec(raw);
  if (!header) fail(reader, lineIndex, 'invalid block scalar header');
  const declared = /\d/.exec(header[0]);
  let contentIndent = declared ? parentIndent + Number(declared[0]) : null;

  while (reader.i < reader.lines.length && reader.lines[reader.i].trim() === '') reader.i++;
  if (reader.i >= reader.lines.length) return '';
  const firstIndent = indentOf(reader, reader.i);
  if (firstIndent <= parentIndent) return '';
  if (contentIndent === null) contentIndent = firstIndent;

  const content = [];
  while (reader.i < reader.lines.length) {
    const line = reader.lines[reader.i];
    if (line.trim() === '') { content.push(''); reader.i++; continue; }
    const lineIndent = indentOf(reader, reader.i);
    if (lineIndent <= parentIndent) break;
    if (lineIndent < contentIndent) fail(reader, reader.i, 'inconsistent indentation in block scalar');
    content.push(line.slice(contentIndent));
    reader.i++;
  }
  return content.join('\n');
}

// Reads the value starting on the line at reader.i, consuming that line and
// anything it continues onto.
function readValue(reader, raw, foldBase) {
  const lineIndex = reader.i;
  reader.i = lineIndex + 1;
  if (raw.charAt(0) === '\t') fail(reader, lineIndex, 'tabs are not allowed');
  const value = raw.trim();
  if (value.charAt(0) === '"' || value.charAt(0) === "'") return readQuoted(reader, value, lineIndex);
  if (value.charAt(0) === '|' || value.charAt(0) === '>') return readBlock(reader, value, lineIndex, foldBase);
  return readPlain(reader, raw, lineIndex, foldBase);
}

function parseNode(reader, indent, foldBase) {
  skipIgnorable(reader);
  if (reader.i >= reader.lines.length) return null;
  const ind = indentOf(reader, reader.i);
  if (ind < indent) return null;
  const line = reader.lines[reader.i];
  if (isSequenceItem(line)) return parseSequence(reader, ind);
  if (keyOf(line) !== null) return parseMapping(reader, ind);
  return readValue(reader, line.slice(ind), foldBase);
}

function parseChild(reader, keyIndent) {
  skipIgnorable(reader);
  if (reader.i >= reader.lines.length) return null;
  const ind = indentOf(reader, reader.i);
  if (ind > keyIndent) return parseNode(reader, ind, keyIndent);
  if (ind === keyIndent && isSequenceItem(reader.lines[reader.i])) return parseNode(reader, ind, keyIndent);
  return null;
}

function parseSequence(reader, indent) {
  const items = [];
  for (;;) {
    skipIgnorable(reader);
    if (reader.i >= reader.lines.length) break;
    const index = reader.i;
    const ind = indentOf(reader, index);
    if (ind < indent) break;
    if (ind > indent) fail(reader, index, 'unexpected indentation');
    const line = reader.lines[index];
    if (!isSequenceItem(line)) break;
    const rest = line.slice(ind + 1);
    const lead = /^[ \t]*/.exec(rest)[0];
    if (lead.indexOf('\t') !== -1) fail(reader, index, 'tabs are not allowed');
    if (rest.trim() === '' || rest.trim().charAt(0) === '#') {
      reader.i++;
      skipIgnorable(reader);
      if (reader.i < reader.lines.length && indentOf(reader, reader.i) > indent) {
        items.push(parseNode(reader, indentOf(reader, reader.i), indent));
      } else {
        items.push(null);
      }
    } else {
      // Re-indent the item body so its value parses at its real column.
      const contentCol = ind + 1 + lead.length;
      reader.lines[index] = ' '.repeat(contentCol) + rest.slice(lead.length);
      items.push(parseNode(reader, contentCol, indent));
    }
  }
  return items;
}

function parseMapping(reader, indent) {
  const map = {};
  for (;;) {
    skipIgnorable(reader);
    if (reader.i >= reader.lines.length) break;
    const index = reader.i;
    const ind = indentOf(reader, index);
    if (ind < indent) break;
    if (ind > indent) fail(reader, index, 'unexpected indentation');
    const line = reader.lines[index];
    if (isSequenceItem(line)) fail(reader, index, 'block sequence entries are not allowed here');
    const key = keyOf(line);
    if (key === null) fail(reader, index, 'expected a `key: value` entry');
    assertPlain(reader, index, key);
    const rest = line.slice(line.indexOf(':') + 1);
    if (rest.trim() === '' || rest.trim().charAt(0) === '#') {
      reader.i++;
      map[key] = parseChild(reader, indent);
    } else {
      map[key] = readValue(reader, rest, indent);
    }
  }
  return map;
}

/**
 * Parses the frontmatter block of a SKILL.md file as YAML and returns
 * `{ data }`, or `{ error: { line, message } }` when the block cannot be
 * parsed. Only the subset the manifests use is understood (mappings, block
 * sequences, block scalars, quoted and plain scalars); anything else is
 * rejected with an explicit message instead of guessed at, so unsupported or
 * malformed frontmatter fails the test rather than passing silently.
 */
function parseFrontmatter(content) {
  const lines = content.split(/\r?\n/);
  if (lines[0] !== '---') return { error: { line: 1, message: 'missing `---` opening fence' } };
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---' || lines[i] === '...') { end = i; break; }
  }
  if (end === -1) return { error: { line: 1, message: 'missing closing `---` fence' } };

  const reader = { lines: lines.slice(1, end), i: 0, base: 2 };
  try {
    skipIgnorable(reader);
    if (reader.i >= reader.lines.length) return { data: {} };
    const indent = indentOf(reader, reader.i);
    if (keyOf(reader.lines[reader.i]) === null) {
      fail(reader, reader.i, 'frontmatter must be a block mapping of `key: value` entries');
    }
    const data = parseMapping(reader, indent);
    skipIgnorable(reader);
    if (reader.i < reader.lines.length) fail(reader, reader.i, 'unexpected content in frontmatter');
    return { data };
  } catch (error) {
    if (!(error instanceof FrontmatterError)) throw error;
    return { error: { line: error.line, message: error.message } };
  }
}

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

  // Check the frontmatter block parses as YAML
  const content = fs.readFileSync(skillMd, 'utf8');
  if (!content.startsWith('---')) {
    console.log(`  ✗ ${skillName}: SKILL.md missing frontmatter`);
    failed++;
    return;
  }

  // Keep SKILL.md focused: every skill has a 500-line ceiling, and detailed
  // reference material belongs in companion files (e.g. reference.md).
  const lines = content.split(/\r?\n/);
  if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
  if (lines.length > 500) {
    console.log(`  ✗ ${skillName}: SKILL.md is ${lines.length} lines (limit 500 — move reference material to a separate file)`);
    failed++;
    return;
  }

  const frontmatter = parseFrontmatter(content);
  if (frontmatter.error) {
    console.log(`  ✗ ${skillName}: Invalid YAML at frontmatter line ${frontmatter.error.line}: ${frontmatter.error.message}`);
    failed++;
    return;
  }

  // Check for required fields
  const { name, description } = frontmatter.data;
  if (!name || !description) {
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
