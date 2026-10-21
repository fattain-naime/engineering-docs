#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ANSI Colors
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';

console.log(`
${CYAN}${BOLD}+-------------------------------------------------+
|                                                 |
|     ENGINEERING DOCUMENTATION PLUGIN            |
|        Auto-Trigger Skill Installer             |
|              v1.2.3 - 22 Skills                 |
|                                                 |
+-------------------------------------------------+${RESET}
`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const homeDir = process.env.USERPROFILE || process.env.HOME;
const workDir = process.cwd();

// Install kinds, matched to each platform's documented layout:
//   standard     - full plugin tree (Claude Code)
//   kimi         - full plugin tree + .kimi-plugin/ manifest (Kimi Code)
//   gemini       - Gemini CLI extension: gemini-extension.json + GEMINI.md + skills/
//   cursor       - Cursor/Windsurf rules: .cursor/rules/*.mdc with Cursor frontmatter
//   cline        - Cline: .clinerules/*.md + .cline/skills/<name>/
//   skills       - Agent-skills layout: <skillsRoot>/<name>/SKILL.md
//   instructions - safe-write AGENTS.md into the platform's instructions dir
//   roo          - Roo Code: ~/.roo/rules/engineering-docs.md
const OPTIONS = [
  {
    name: 'Gemini CLI - Global (~/.gemini/extensions/)',
    path: path.join(homeDir, '.gemini', 'extensions', 'engineering-docs'),
    flag: '--gemini',
    alias: '-g',
    kind: 'gemini'
  },
  {
    name: 'Claude Code - Global',
    path: path.join(homeDir, '.claude', 'plugins', 'engineering-docs'),
    flag: '--claude',
    alias: '-c',
    kind: 'standard'
  },
  {
    name: 'Local .agents/skills/ (shared Agent Skills dir)',
    path: path.join(workDir, '.agents', 'skills'),
    flag: '--local',
    alias: '-l',
    kind: 'skills'
  },
  {
    name: 'Cursor / Windsurf - Local (.cursor/rules/)',
    path: path.join(workDir, '.cursor', 'rules'),
    flag: '--cursor',
    alias: '-r',
    kind: 'cursor'
  },
  {
    name: 'Kimi Code - Global',
    path: path.join(homeDir, '.kimi-code', 'plugins', 'engineering-docs'),
    flag: '--kimi',
    alias: '-k',
    kind: 'kimi'
  },
  {
    name: 'Codex - Global (~/.codex/AGENTS.md)',
    path: path.join(homeDir, '.codex'),
    flag: '--codex',
    alias: '-x',
    kind: 'instructions'
  },
  {
    name: 'Copilot CLI - Global (~/.copilot/installed-plugins/)',
    path: path.join(homeDir, '.copilot', 'installed-plugins', 'engineering-docs'),
    flag: '--copilot',
    alias: '-p',
    kind: 'standard'
  },
  {
    name: 'Goose - Global (~/.agents/skills/)',
    path: path.join(homeDir, '.agents', 'skills'),
    flag: '--goose',
    alias: '',
    kind: 'skills'
  },
  {
    name: 'Pi - Global (~/.pi/agent/AGENTS.md)',
    path: path.join(homeDir, '.pi', 'agent'),
    flag: '--pi',
    alias: '',
    kind: 'instructions'
  },
  {
    name: 'OpenCode - Local (.opencode/skills/)',
    path: path.join(workDir, '.opencode', 'skills'),
    flag: '--opencode',
    alias: '',
    kind: 'skills'
  },
  {
    name: 'Kilo Code - Global (~/.config/kilo/AGENTS.md)',
    path: path.join(homeDir, '.config', 'kilo'),
    flag: '--kilo',
    alias: '',
    kind: 'instructions'
  },
  {
    name: 'Roo Code - Global (~/.roo/rules/)',
    path: path.join(homeDir, '.roo', 'rules'),
    flag: '--roo',
    alias: '',
    kind: 'roo'
  },
  {
    name: 'Cline - Local (.clinerules/ + .cline/skills/)',
    path: workDir,
    flag: '--cline',
    alias: '',
    kind: 'cline'
  },
  {
    name: 'Factory Droid - Global (~/.factory/skills/)',
    path: path.join(homeDir, '.factory', 'skills'),
    flag: '--factory',
    alias: '',
    kind: 'skills'
  }
];

// Files to copy for standard installations
const STATIC_FILES = ['README.md', 'LICENSE', 'CONTRIBUTING.md', 'package.json'];

// Directories to copy for standard installations
const COPY_DIRS = ['skills', 'agents', 'hooks', 'assets', 'scripts', 'evals'];

// Root config files to copy
const ROOT_CONFIGS = ['.mcp.json'];

// Root plugin-manifest directories to copy for standard/kimi trees
const PLUGIN_MANIFEST_DIRS = ['.claude-plugin', '.kimi-plugin'];

function copyFolderSync(from, to) {
  if (fs.cpSync) {
    fs.cpSync(from, to, { recursive: true, force: true });
  } else {
    if (!fs.existsSync(to)) {
      fs.mkdirSync(to, { recursive: true });
    }
    fs.readdirSync(from).forEach(element => {
      const srcEl = path.join(from, element);
      const destEl = path.join(to, element);
      if (fs.lstatSync(srcEl).isDirectory()) {
        copyFolderSync(srcEl, destEl);
      } else {
        fs.copyFileSync(srcEl, destEl);
      }
    });
  }
}

/**
 * Agent instruction files resolved against their guideline locations.
 * AGENTS.md / CLAUDE.md live under integrations/agents/.
 * GEMINI.md lives at the repo root (it is the Gemini extension context file
 * and its @./skills/ imports are relative to the repo root).
 */
function agentConfigSources(srcDir) {
  return [
    { file: 'AGENTS.md', src: path.join(srcDir, 'integrations', 'agents', 'AGENTS.md') },
    { file: 'CLAUDE.md', src: path.join(srcDir, 'integrations', 'agents', 'CLAUDE.md') },
    { file: 'GEMINI.md', src: path.join(srcDir, 'GEMINI.md') }
  ];
}

/**
 * Safe-write agent config files. Only copies if they do NOT already exist at destination.
 */
function safeWriteAgentConfigs(srcDir, destDir) {
  agentConfigSources(srcDir).forEach(({ file, src }) => {
    const destFile = path.join(destDir, file);
    if (fs.existsSync(destFile)) {
      console.log(`  ${YELLOW}skipped ${file}${RESET} (already exists - your customization preserved)`);
    } else if (fs.existsSync(src)) {
      fs.copyFileSync(src, destFile);
      console.log(`  ${GREEN}created ${file}${RESET}`);
    }
  });
}

/**
 * Safe-write a single instruction file (AGENTS.md content) to destFile.
 */
function safeWriteInstructions(srcDir, destFile) {
  const src = path.join(srcDir, 'integrations', 'agents', 'AGENTS.md');
  if (fs.existsSync(destFile)) {
    console.log(`  ${YELLOW}skipped AGENTS.md${RESET} (already exists - your customization preserved)`);
  } else if (fs.existsSync(src)) {
    fs.mkdirSync(path.dirname(destFile), { recursive: true });
    fs.copyFileSync(src, destFile);
    console.log(`  ${GREEN}created AGENTS.md${RESET}`);
  }
}

/**
 * Standard installation (copy plugin files + agent configs) - Claude Code layout.
 */
function installStandard(srcDir, destDir) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  STATIC_FILES.forEach(file => {
    const srcFile = path.join(srcDir, file);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, path.join(destDir, file));
    }
  });

  ROOT_CONFIGS.forEach(file => {
    const srcFile = path.join(srcDir, file);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, path.join(destDir, file));
    }
  });

  COPY_DIRS.forEach(dir => {
    const srcSubDir = path.join(srcDir, dir);
    if (fs.existsSync(srcSubDir)) {
      copyFolderSync(srcSubDir, path.join(destDir, dir));
    }
  });

  PLUGIN_MANIFEST_DIRS.forEach(dir => {
    const srcSubDir = path.join(srcDir, dir);
    if (fs.existsSync(srcSubDir)) {
      copyFolderSync(srcSubDir, path.join(destDir, dir));
      console.log(`  ${GREEN}copied ${dir}/${RESET}`);
    }
  });

  console.log(`  ${GREEN}plugin files copied${RESET}`);
  safeWriteAgentConfigs(srcDir, destDir);
}

/**
 * Kimi Code installation - full plugin tree including .kimi-plugin/plugin.json.
 */
function installKimi(srcDir, destDir) {
  installStandard(srcDir, destDir);
}

/**
 * Gemini CLI extension installation.
 * Layout (per Gemini CLI extension docs):
 *   <extension-root>/gemini-extension.json
 *   <extension-root>/GEMINI.md          (context file, @./skills/ imports)
 *   <extension-root>/skills/<name>/SKILL.md
 */
function installGemini(srcDir, destDir) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const manifest = path.join(srcDir, 'gemini-extension.json');
  if (fs.existsSync(manifest)) {
    fs.copyFileSync(manifest, path.join(destDir, 'gemini-extension.json'));
    console.log(`  ${GREEN}copied gemini-extension.json${RESET}`);
  } else {
    console.log(`  ${RED}error${RESET} gemini-extension.json not found in plugin`);
  }

  const contextFile = path.join(srcDir, 'GEMINI.md');
  if (fs.existsSync(contextFile)) {
    fs.copyFileSync(contextFile, path.join(destDir, 'GEMINI.md'));
    console.log(`  ${GREEN}copied GEMINI.md${RESET} (context file)`);
  }

  const skillsDir = path.join(srcDir, 'skills');
  if (fs.existsSync(skillsDir)) {
    copyFolderSync(skillsDir, path.join(destDir, 'skills'));
    console.log(`  ${GREEN}copied skills/${RESET}`);
  }
}

/**
 * Extract the `description` value from a SKILL.md frontmatter block.
 */
function extractDescription(md) {
  const fmMatch = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) return null;
  const fm = fmMatch[1];
  const single = fm.match(/^description:\s*(.+)$/m);
  if (!single) return null;
  let value = single[1].trim();
  if (value === '>-' || value === '>' || value === '|' || value === '|-') {
    const lines = fm.split(/\r?\n/);
    const start = lines.findIndex(l => /^description:/.test(l));
    const collected = [];
    for (let i = start + 1; i < lines.length; i++) {
      if (/^\s+/.test(lines[i]) || lines[i].trim() === '') {
        collected.push(lines[i].trim());
      } else {
        break;
      }
    }
    value = collected.join(' ').trim();
  }
  return value.replace(/^["']|["']$/g, '') || null;
}

/**
 * Strip the YAML frontmatter from a markdown document.
 */
function stripFrontmatter(md) {
  const fmMatch = md.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return fmMatch ? md.slice(fmMatch[0].length) : md;
}

/**
 * Cursor / Windsurf installation.
 * Writes .cursor/rules/engineering-docs-<skill>.mdc with Cursor's documented
 * frontmatter keys (description, globs, alwaysApply) and the skill body.
 */
function installCursor(srcDir, destDir) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  const skillsDir = path.join(srcDir, 'skills');
  fs.readdirSync(skillsDir).forEach(skill => {
    const skillPath = path.join(skillsDir, skill);
    if (fs.lstatSync(skillPath).isDirectory()) {
      const skillMd = path.join(skillPath, 'SKILL.md');
      if (fs.existsSync(skillMd)) {
        const md = fs.readFileSync(skillMd, 'utf8');
        const description = extractDescription(md) || `engineering-docs skill: ${skill}`;
        const body = stripFrontmatter(md);
        const descLine = description.replace(/\r?\n/g, ' ');
        const mdc = `---\ndescription: ${descLine}\nglobs: \nalwaysApply: false\n---\n\n${body}`;
        const targetFile = path.join(destDir, `engineering-docs-${skill}.mdc`);
        fs.writeFileSync(targetFile, mdc, 'utf8');
        console.log(`  ${GREEN}created${RESET} Cursor rule: ${CYAN}engineering-docs-${skill}.mdc${RESET}`);
      }
    }
  });
}

/**
 * Cline installation (per Cline docs):
 *   .clinerules/engineering-docs.md   (rules directory - rules are .md files inside)
 *   .cline/skills/<name>/SKILL.md     (workspace skills)
 */
function installCline(srcDir, destDir) {
  const clinerulesSrc = path.join(srcDir, 'integrations', 'plugins', '.cline', '.clinerules', 'engineering-docs.md');
  const clinerulesDest = path.join(destDir, '.clinerules');
  if (!fs.existsSync(clinerulesDest)) {
    fs.mkdirSync(clinerulesDest, { recursive: true });
  }
  if (fs.existsSync(clinerulesSrc)) {
    fs.copyFileSync(clinerulesSrc, path.join(clinerulesDest, 'engineering-docs.md'));
    console.log(`  ${GREEN}created${RESET} .clinerules/engineering-docs.md`);
  } else {
    console.log(`  ${RED}error${RESET} .clinerules/engineering-docs.md not found in plugin`);
  }

  const skillsSrc = path.join(srcDir, 'skills');
  const skillsDest = path.join(destDir, '.cline', 'skills');
  if (fs.existsSync(skillsSrc)) {
    if (!fs.existsSync(skillsDest)) {
      fs.mkdirSync(skillsDest, { recursive: true });
    }
    fs.readdirSync(skillsSrc).forEach(skill => {
      const skillPath = path.join(skillsSrc, skill);
      if (fs.lstatSync(skillPath).isDirectory()) {
        copyFolderSync(skillPath, path.join(skillsDest, skill));
      }
    });
    console.log(`  ${GREEN}copied${RESET} .cline/skills/`);
  }
}

/**
 * Agent-skills layout installation: <skillsRoot>/<name>/SKILL.md
 */
function installSkills(srcDir, destDir) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  const skillsSrc = path.join(srcDir, 'skills');
  fs.readdirSync(skillsSrc).forEach(skill => {
    const skillPath = path.join(skillsSrc, skill);
    if (fs.lstatSync(skillPath).isDirectory()) {
      copyFolderSync(skillPath, path.join(destDir, skill));
      console.log(`  ${GREEN}installed${RESET} skill: ${CYAN}${skill}${RESET}`);
    }
  });
}

/**
 * Instructions installation: safe-write AGENTS.md into the platform dir.
 */
function installInstructions(srcDir, destDir) {
  safeWriteInstructions(srcDir, path.join(destDir, 'AGENTS.md'));
}

/**
 * Roo Code installation: write AGENTS.md content as a rule file in ~/.roo/rules/.
 */
function installRoo(srcDir, destDir) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  safeWriteInstructions(srcDir, path.join(destDir, 'engineering-docs.md'));
}

function installTo(selected) {
  const srcDir = path.join(__dirname, '..');
  switch (selected.kind) {
    case 'cursor':
      installCursor(srcDir, selected.path);
      break;
    case 'cline':
      installCline(srcDir, selected.path);
      break;
    case 'gemini':
      installGemini(srcDir, selected.path);
      break;
    case 'kimi':
      installKimi(srcDir, selected.path);
      break;
    case 'skills':
      installSkills(srcDir, selected.path);
      break;
    case 'instructions':
      installInstructions(srcDir, selected.path);
      break;
    case 'roo':
      installRoo(srcDir, selected.path);
      break;
    default:
      installStandard(srcDir, selected.path);
  }
}

function handleChoice(input) {
  const cleanInput = input.trim().toUpperCase();
  if (cleanInput === 'Q') {
    console.log(`\n${YELLOW}Installation cancelled.${RESET}\n`);
    rl.close();
    process.exit(0);
  }

  const choice = parseInt(cleanInput, 10);
  if (isNaN(choice) || choice < 1 || choice > OPTIONS.length) {
    console.log(`\n${RED}Invalid choice. Please select a valid option.${RESET}\n`);
    showMenu();
    return;
  }

  const selected = OPTIONS[choice - 1];
  console.log(`\n${GREEN}Installing to: ${RESET}${BOLD}${selected.path}${RESET}...\n`);

  try {
    installTo(selected);
    console.log(`\n${GREEN}${BOLD}Installation Completed Successfully!${RESET}\n`);
    if (selected.kind === 'cursor') {
      console.log(`${YELLOW}Note: Restart Cursor or Windsurf to activate the new rules.${RESET}\n`);
    } else {
      console.log(`${YELLOW}Note: Reload your agent or restart the CLI session to load the new plugin.${RESET}\n`);
    }
  } catch (err) {
    console.error(`\n${RED}Error during installation:${RESET}`, err.message);
  }

  rl.close();
}

function showMenu() {
  console.log(`${BOLD}Select where you want to install the engineering-docs plugin:${RESET}\n`);
  OPTIONS.forEach((opt, idx) => {
    console.log(`  ${CYAN}[${idx + 1}]${RESET} ${BOLD}${opt.name}${RESET}`);
    console.log('      Target: ' + YELLOW + opt.path + RESET + '\n');
  });
  console.log(`  ${CYAN}[Q]${RESET} Quit\n`);
  rl.question(`${BOLD}Enter your choice (1-${OPTIONS.length} or Q): ${RESET}`, handleChoice);
}

// CLI Entry Point
const args = process.argv.slice(2);

function runDirectInstall(selectedOption) {
  rl.close();
  console.log(`\n${GREEN}Installing to: ${RESET}${BOLD}${selectedOption.path}${RESET}...\n`);
  try {
    installTo(selectedOption);
    console.log(`\n${GREEN}${BOLD}Installation Completed Successfully!${RESET}\n`);
    if (selectedOption.kind === 'cursor') {
      console.log(`${YELLOW}Note: Restart Cursor or Windsurf to activate the new rules.${RESET}\n`);
    } else {
      console.log(`${YELLOW}Note: Reload your agent or restart the CLI session to load the new plugin.${RESET}\n`);
    }
  } catch (err) {
    console.error(`\n${RED}Error during installation:${RESET}`, err.message);
    process.exit(1);
  }
  process.exit(0);
}

// Check for flag-based installation
for (const option of OPTIONS) {
  if (args.includes(option.flag) || (option.alias && args.includes(option.alias))) {
    runDirectInstall(option);
  }
}

// Help
if (args.includes('--help') || args.includes('-h')) {
  rl.close();
  console.log(`Usage: npx engineering-docs [options]

Options:
  install              Show interactive menu (default)
  --gemini, -g         Install as a Gemini CLI extension (~/.gemini/extensions/)
  --claude, -c         Install globally for Claude Code
  --local, -l          Install skills to .agents/skills/ (workspace)
  --cursor, -r         Install to Cursor/Windsurf rules (.cursor/rules/*.mdc)
  --kimi, -k           Install globally for Kimi Code
  --codex, -x          Install AGENTS.md to ~/.codex/
  --copilot, -p        Install globally for Copilot CLI
  --goose              Install skills to ~/.agents/skills/
  --pi                 Install AGENTS.md to ~/.pi/agent/
  --opencode           Install skills to .opencode/skills/
  --kilo               Install AGENTS.md to ~/.config/kilo/
  --roo                Install rule to ~/.roo/rules/
  --cline              Install .clinerules/ and .cline/skills/ to project root
  --factory            Install skills to ~/.factory/skills/
  --help, -h           Show this help menu

Safe-write: Agent instruction files (AGENTS.md, CLAUDE.md, GEMINI.md) are
only written to the destination if they do NOT already exist there.
Your customizations are preserved.
`);
  process.exit(0);
}

// Default: show interactive menu
showMenu();
