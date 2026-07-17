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
|              v1.2.1 - 22 Skills                 |
|                                                 |
+-------------------------------------------------+${RESET}
`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const homeDir = process.env.USERPROFILE || process.env.HOME;
const workDir = process.cwd();

// All supported agent platforms
const OPTIONS = [
  {
    name: 'Gemini (Antigravity) - Global',
    path: path.join(homeDir, '.gemini', 'config', 'plugins', 'engineering-docs'),
    flag: '--gemini',
    alias: '-g'
  },
  {
    name: 'Claude Code - Global',
    path: path.join(homeDir, '.claude', 'plugins', 'engineering-docs'),
    flag: '--claude',
    alias: '-c'
  },
  {
    name: 'Local .agents/ (Antigravity/Claude/Codex)',
    path: path.join(workDir, '.agents', 'skills', 'engineering-docs'),
    flag: '--local',
    alias: '-l'
  },
  {
    name: 'Cursor / Windsurf - Local (.cursor/rules/)',
    path: path.join(workDir, '.cursor', 'rules'),
    flag: '--cursor',
    alias: '-r',
    isCursor: true
  },
  {
    name: 'Kimi Code - Global',
    path: path.join(homeDir, '.kimi-code', 'plugins', 'engineering-docs'),
    flag: '--kimi',
    alias: '-k'
  },
  {
    name: 'Codex - Local (.codex/)',
    path: path.join(workDir, '.codex', 'engineering-docs'),
    flag: '--codex',
    alias: '-x'
  },
  {
    name: 'Copilot CLI - Global',
    path: path.join(homeDir, '.copilot', 'plugins', 'engineering-docs'),
    flag: '--copilot',
    alias: '-p'
  },
  {
    name: 'Goose - Global',
    path: path.join(homeDir, '.config', 'goose', 'extensions', 'engineering-docs'),
    flag: '--goose',
    alias: ''
  },
  {
    name: 'Pi - Global',
    path: path.join(homeDir, '.pi', 'packages', 'engineering-docs'),
    flag: '--pi',
    alias: ''
  },
  {
    name: 'OpenCode - Local (.opencode/)',
    path: path.join(workDir, '.opencode', 'engineering-docs'),
    flag: '--opencode',
    alias: ''
  },
  {
    name: 'Kilo Code - Global',
    path: path.join(homeDir, '.kilo-code', 'plugins', 'engineering-docs'),
    flag: '--kilo',
    alias: ''
  },
  {
    name: 'Roo Code - Global',
    path: path.join(homeDir, '.roo-code', 'plugins', 'engineering-docs'),
    flag: '--roo',
    alias: ''
  },
  {
    name: 'Cline - Local (.clinerules)',
    path: path.join(workDir, '.clinerules'),
    flag: '--cline',
    alias: '',
    isCline: true
  },
  {
    name: 'Factory Droid - Global',
    path: path.join(homeDir, '.factory', 'plugins', 'engineering-docs'),
    flag: '--factory',
    alias: ''
  }
];

// Agent config files that use safe-write
const AGENT_CONFIGS = ['AGENTS.md', 'CLAUDE.md', 'GEMINI.md', 'COPILOT.md', 'GOOSE.md', 'PI.md'];

// Files to copy for standard installations
const STATIC_FILES = ['README.md', 'LICENSE', 'CONTRIBUTING.md', 'package.json'];

// Directories to copy for standard installations
const COPY_DIRS = ['skills', 'agents', 'hooks', 'assets', 'scripts', 'bin', 'evals'];

// Root config files to copy
const ROOT_CONFIGS = ['.mcp.json'];

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
 * Safe-write agent config files. Only copies if they do NOT already exist at destination.
 */
function safeWriteAgentConfigs(srcDir, destDir) {
  const agentsSrc = path.join(srcDir, 'integrations', 'agents');
  AGENT_CONFIGS.forEach(configFile => {
    const srcFile = path.join(agentsSrc, configFile);
    const destFile = path.join(destDir, configFile);
    if (fs.existsSync(destFile)) {
      console.log(`  ${YELLOW}skipped ${configFile}${RESET} (already exists - your customization preserved)`);
    } else if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, destFile);
      console.log(`  ${GREEN}created ${configFile}${RESET}`);
    }
  });
}

/**
 * Copy Claude-specific plugin files
 */
function copyClaudePlugin(srcDir, destDir) {
  const claudePluginDir = path.join(srcDir, '.claude-plugin');
  if (fs.existsSync(claudePluginDir)) {
    const destClaudePlugin = path.join(destDir, '.claude-plugin');
    copyFolderSync(claudePluginDir, destClaudePlugin);
    console.log(`  ${GREEN}copied .claude-plugin/${RESET}`);
  }
}

/**
 * Install for Cursor/Windsurf (copies SKILL.md as .mdc rules)
 */
function installCursor(selected) {
  const srcDir = path.join(__dirname, '..');
  if (!fs.existsSync(selected.path)) {
    fs.mkdirSync(selected.path, { recursive: true });
  }
  const skillsDir = path.join(srcDir, 'skills');
  fs.readdirSync(skillsDir).forEach(skill => {
    const skillPath = path.join(skillsDir, skill);
    if (fs.lstatSync(skillPath).isDirectory()) {
      const skillMd = path.join(skillPath, 'SKILL.md');
      if (fs.existsSync(skillMd)) {
        const targetFile = path.join(selected.path, `engineering-docs-${skill}.mdc`);
        fs.copyFileSync(skillMd, targetFile);
        console.log(`  ${GREEN}created${RESET} Cursor rule: ${CYAN}engineering-docs-${skill}.mdc${RESET}`);
      }
    }
  });
}

/**
 * Install for Cline (copies .clinerules file)
 */
function installCline(selected) {
  const srcDir = path.join(__dirname, '..');
  const clinerulesSrc = path.join(srcDir, 'integrations', 'plugins', '.cline', '.clinerules');
  if (fs.existsSync(clinerulesSrc)) {
    fs.copyFileSync(clinerulesSrc, selected.path);
    console.log(`  ${GREEN}created${RESET} .clinerules`);
  } else {
    console.log(`  ${RED}error${RESET} .clinerules not found in plugin`);
  }
}

/**
 * Standard installation (copy plugin files + agent configs)
 */
function installStandard(selected) {
  const srcDir = path.join(__dirname, '..');

  if (!fs.existsSync(selected.path)) {
    fs.mkdirSync(selected.path, { recursive: true });
  }

  // Copy static files
  STATIC_FILES.forEach(file => {
    const srcFile = path.join(srcDir, file);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, path.join(selected.path, file));
    }
  });

  // Copy root config files
  ROOT_CONFIGS.forEach(file => {
    const srcFile = path.join(srcDir, file);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, path.join(selected.path, file));
    }
  });

  // Copy directories
  COPY_DIRS.forEach(dir => {
    const srcSubDir = path.join(srcDir, dir);
    if (fs.existsSync(srcSubDir)) {
      copyFolderSync(srcSubDir, path.join(selected.path, dir));
    }
  });

  // Copy Claude plugin manifest
  copyClaudePlugin(srcDir, selected.path);

  console.log(`  ${GREEN}plugin files copied${RESET}`);

  // Safe-write agent config files
  safeWriteAgentConfigs(srcDir, selected.path);
}

function installTo(selected) {
  if (selected.isCursor) {
    installCursor(selected);
  } else if (selected.isCline) {
    installCline(selected);
  } else {
    installStandard(selected);
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
    if (selected.isCursor) {
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
    if (selectedOption.isCursor) {
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
  --gemini, -g         Install globally for Gemini (Antigravity)
  --claude, -c         Install globally for Claude Code
  --local, -l          Install locally to .agents/ directory
  --cursor, -r         Install locally to Cursor/Windsurf rules
  --kimi, -k           Install globally for Kimi Code
  --codex, -x          Install locally to .codex/
  --copilot, -p        Install globally for Copilot CLI
  --goose              Install globally for Goose
  --pi                 Install globally for Pi
  --opencode           Install locally to .opencode/
  --kilo               Install globally for Kilo Code
  --roo                Install globally for Roo Code
  --cline              Install .clinerules to project root
  --factory            Install globally for Factory Droid
  --help, -h           Show this help menu

Safe-write: Agent config files (AGENTS.md, CLAUDE.md, GEMINI.md, etc.) are
only written to the destination if they do NOT already exist there.
Your customizations are preserved.
`);
  process.exit(0);
}

// Default: show interactive menu
showMenu();
