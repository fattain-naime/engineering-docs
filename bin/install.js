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
${CYAN}${BOLD}┌──────────────────────────────────────────────┐
│                                              │
│       ENGINEERING DOCUMENTATION PLUGINS      │
│          Auto-Trigger Skill Installer        │
│                                              │
└──────────────────────────────────────────────┘${RESET}
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
    name: 'Local Project Workspace - .agents/ (Antigravity/Claude)',
    path: path.join(process.cwd(), '.agents', 'skills', 'engineering-docs')
  },
  {
    name: 'Cursor/Windsurf - Local Project Workspace (.cursor/rules/)',
    path: path.join(process.cwd(), '.cursor', 'rules'),
    isCursor: true
  }
];

function showMenu() {
  console.log(`${BOLD}Select where you want to install the engineering-docs plugin:${RESET}\n`);
  OPTIONS.forEach((opt, idx) => {
    console.log(`  ${CYAN}[${idx + 1}]${RESET} ${BOLD}${opt.name}${RESET}`);
    console.log(`      Target: ${YELLOW}${opt.path}${RESET}\n`);
  });
  console.log(`  ${CYAN}[Q]${RESET} Quit\n`);

  rl.question(`${BOLD}Enter your choice (1-${OPTIONS.length} or Q): ${RESET}`, handleChoice);
}

function copyFolderSync(from, to) {
  if (fs.cpSync) {
    fs.cpSync(from, to, { recursive: true, force: true });
  } else {
    // Fallback for older Node versions
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
    const srcDir = path.join(__dirname, '..');

    if (selected.isCursor) {
      // For Cursor/Windsurf, we copy each skill's SKILL.md into Cursor's rule format
      if (!fs.existsSync(selected.path)) {
        fs.mkdirSync(selected.path, { recursive: true });
      }

      const skillsDir = path.join(srcDir, 'skills');
      const skills = fs.readdirSync(skillsDir);

      skills.forEach(skill => {
        const skillPath = path.join(skillsDir, skill);
        if (fs.lstatSync(skillPath).isDirectory()) {
          const skillMd = path.join(skillPath, 'SKILL.md');
          if (fs.existsSync(skillMd)) {
            // Write Cursor MDC file format (rule file)
            const targetFile = path.join(selected.path, `engineering-docs-${skill}.mdc`);
            fs.copyFileSync(skillMd, targetFile);
            console.log(`  ${GREEN}✓${RESET} Created Cursor rule: ${CYAN}engineering-docs-${skill}.mdc${RESET}`);
          }
        }
      });
    } else {
      // Standard plugin installation (copy root files + skills folder)
      if (!fs.existsSync(selected.path)) {
        fs.mkdirSync(selected.path, { recursive: true });
      }

      // Copy key root files
      const filesToCopy = ['plugin.json', 'AGENTS.md', 'CLAUDE.md', 'README.md', 'LICENSE', 'CONTRIBUTING.md'];
      filesToCopy.forEach(file => {
        const srcFile = path.join(srcDir, file);
        if (fs.existsSync(srcFile)) {
          fs.copyFileSync(srcFile, path.join(selected.path, file));
        }
      });

      // Copy skills directory
      const srcSkills = path.join(srcDir, 'skills');
      const destSkills = path.join(selected.path, 'skills');
      copyFolderSync(srcSkills, destSkills);
    }

    console.log(`\n${GREEN}${BOLD}✓ Installation Completed Successfully!${RESET}\n`);
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

showMenu();
