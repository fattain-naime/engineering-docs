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
|              v1.2.0 - 22 Skills                 |
|                                                 |
+-------------------------------------------------+${RESET}
`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const homeDir = process.env.USERPROFILE || process.env.HOME;

const OPTIONS = [
  {
    name: 'Gemini (Antigravity) - Global Installation',
    path: path.join(homeDir, '.gemini', 'config', 'plugins', 'engineering-docs')
  },
  {
    name: 'Claude Code - Global Installation',
    path: path.join(homeDir, '.claude', 'plugins', 'engineering-docs')
  },
  {
    name: 'Local Project Workspace - .agents/ (Antigravity/Claude/Codex)',
    path: path.join(process.cwd(), '.agents', 'skills', 'engineering-docs')
  },
  {
    name: 'Cursor/Windsurf - Local Project Workspace (.cursor/rules/)',
    path: path.join(process.cwd(), '.cursor', 'rules'),
    isCursor: true
  },
  {
    name: 'Kimi Code - Global Installation',
    path: path.join(homeDir, '.kimi-code', 'plugins', 'engineering-docs')
  },
  {
    name: 'Codex / GitHub Copilot - Local Project Workspace (.codex/)',
    path: path.join(process.cwd(), '.codex', 'engineering-docs')
  }
];

// Agent config files that use safe-write (skip if already present at destination)
const AGENT_CONFIGS = ['AGENTS.md', 'GEMINI.md', 'CLAUDE.md'];

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
 * Safe-write agent config files. Only copies AGENTS.md / GEMINI.md / CLAUDE.md
 * if they do NOT already exist at the destination.
 */
function safeWriteAgentConfigs(srcDir, destDir) {
  AGENT_CONFIGS.forEach(configFile => {
    const srcFile = path.join(srcDir, configFile);
    const destFile = path.join(destDir, configFile);
    if (fs.existsSync(destFile)) {
      console.log(`  ${YELLOW}skipped ${configFile}${RESET} (already exists - your customization preserved)`);
    } else if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, destFile);
      console.log(`  ${GREEN}created ${configFile}${RESET}`);
    }
  });
}

function installTo(selected) {
  const srcDir = path.join(__dirname, '..');

  if (selected.isCursor) {
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
  } else {
    if (!fs.existsSync(selected.path)) {
      fs.mkdirSync(selected.path, { recursive: true });
    }

    // Copy static files (not agent configs)
    ['plugin.json', 'README.md', 'LICENSE', 'CONTRIBUTING.md',
     'gemini-extension.json', 'marketplace.json', 'package.json'].forEach(file => {
      const srcFile = path.join(srcDir, file);
      if (fs.existsSync(srcFile)) {
        fs.copyFileSync(srcFile, path.join(selected.path, file));
      }
    });

    // Copy directories
    ['skills', 'assets', 'scripts', '.claude-plugin', '.cursor-plugin', 'bin'].forEach(dir => {
      const srcSubDir = path.join(srcDir, dir);
      if (fs.existsSync(srcSubDir)) {
        copyFolderSync(srcSubDir, path.join(selected.path, dir));
      }
    });

    console.log(`  ${GREEN}plugin files copied${RESET}`);

    // Safe-write agent config files
    safeWriteAgentConfigs(srcDir, selected.path);
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

if (args.includes('--gemini') || args.includes('-g')) {
  runDirectInstall(OPTIONS[0]);
} else if (args.includes('--claude') || args.includes('-c')) {
  runDirectInstall(OPTIONS[1]);
} else if (args.includes('--local') || args.includes('-l')) {
  runDirectInstall(OPTIONS[2]);
} else if (args.includes('--cursor') || args.includes('-r')) {
  runDirectInstall(OPTIONS[3]);
} else if (args.includes('--kimi') || args.includes('-k')) {
  runDirectInstall(OPTIONS[4]);
} else if (args.includes('--codex') || args.includes('-x')) {
  runDirectInstall(OPTIONS[5]);
} else if (args.includes('--help') || args.includes('-h')) {
  rl.close();
  console.log(`Usage: npx engineering-docs [options]

Options:
  install             Show interactive menu (default)
  --gemini, -g        Install globally for Gemini (Antigravity)
  --claude, -c        Install globally for Claude Code
  --local, -l         Install locally to the current workspace .agents directory
  --cursor, -r        Install locally to Cursor/Windsurf rules (.cursor/rules/)
  --kimi, -k          Install globally for Kimi Code
  --codex, -x         Install locally to .codex/ (Codex / Copilot)
  --help, -h          Show this help menu

Safe-write: AGENTS.md, GEMINI.md, and CLAUDE.md are only written to the
destination if they do NOT already exist there. Your customizations are preserved.
`);
  process.exit(0);
} else {
  showMenu();
}
