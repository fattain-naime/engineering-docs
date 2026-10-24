#!/usr/bin/env bash
# ============================================================
# Engineering Docs Plugin Installer - Linux / macOS
# Compatible: bash 3.2+, sh, zsh
# ============================================================
#
# USAGE:
#   chmod +x setup.sh && ./setup.sh          Interactive menu
#   ./setup.sh --gemini                      Install as Gemini CLI extension
#   ./setup.sh --claude                      Direct install to Claude Code global
#   ./setup.sh --local                       Install skills to .agents/skills/ (workspace)
#   ./setup.sh --cursor                      Install to .cursor/rules/ (workspace)
#   ./setup.sh --kimi                        Install to Kimi Code global
#   ./setup.sh --codex                       Install AGENTS.md to ~/.codex/
#   ./setup.sh --goose                       Install skills to ~/.agents/skills/
#   ./setup.sh --pi                          Install AGENTS.md to ~/.pi/agent/
#   ./setup.sh --opencode                    Install skills to .opencode/skills/
#   ./setup.sh --kilo                        Install AGENTS.md to ~/.config/kilo/
#   ./setup.sh --roo                         Install rule to ~/.roo/rules/
#   ./setup.sh --cline                       Install .clinerules/ + .cline/skills/ (workspace)
#   ./setup.sh --factory                     Install skills to ~/.factory/skills/
#   ./setup.sh --copilot                     Install to Copilot CLI installed-plugins
#   ./setup.sh --help                        Show this help
#
# Safe-write: AGENTS.md, GEMINI.md, CLAUDE.md are only written if they
# do NOT already exist at the destination. Existing files are preserved.
# ============================================================

set -e

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

print_header() {
    echo ""
    echo -e "${CYAN}+-------------------------------------------------+${RESET}"
    echo -e "${CYAN}|                                                 |${RESET}"
    echo -e "${CYAN}|     ENGINEERING DOCUMENTATION PLUGIN            |${RESET}"
    echo -e "${CYAN}|        Auto-Trigger Skill Installer             |${RESET}"
    echo -e "${CYAN}|              v1.2.4 - 22 Skills                 |${RESET}"
    echo -e "${CYAN}|                                                 |${RESET}"
    echo -e "${CYAN}+-------------------------------------------------+${RESET}"
    echo ""
}

# ── Paths ─────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(dirname "$SCRIPT_DIR")"
HOME_DIR="${HOME:-$USERPROFILE}"
WORK_DIR="$(pwd)"

# ── Targets (paths match each platform's documented layout) ──────────────────
GEMINI_PATH="$HOME_DIR/.gemini/extensions/engineering-docs"
CLAUDE_PATH="$HOME_DIR/.claude/plugins/engineering-docs"
LOCAL_PATH="$WORK_DIR/.agents/skills"
CURSOR_PATH="$WORK_DIR/.cursor/rules"
KIMI_PATH="$HOME_DIR/.kimi-code/plugins/engineering-docs"
CODEX_PATH="$HOME_DIR/.codex"
GOOSE_PATH="$HOME_DIR/.agents/skills"
PI_PATH="$HOME_DIR/.pi/agent"
OPENCODE_PATH="$WORK_DIR/.opencode/skills"
KILO_PATH="$HOME_DIR/.config/kilo"
ROO_PATH="$HOME_DIR/.roo/rules"
CLINE_PATH="$WORK_DIR"
FACTORY_PATH="$HOME_DIR/.factory/skills"
COPILOT_PATH="$HOME_DIR/.copilot/installed-plugins/engineering-docs"

# ── Helpers ───────────────────────────────────────────────────────────────────
copy_folder() {
    cp -r "$1"/. "$2"/ 2>/dev/null || cp -r "$1" "$2"
}

safe_write_instructions() {
    local dest_file="$1"
    local src_file="$PLUGIN_ROOT/integrations/agents/AGENTS.md"
    if [ -f "$dest_file" ]; then
        echo -e "  ${YELLOW}[SKIP]${RESET} $(basename "$dest_file") already exists - your customization preserved"
    elif [ -f "$src_file" ]; then
        mkdir -p "$(dirname "$dest_file")"
        cp "$src_file" "$dest_file"
        echo -e "  ${GREEN}[OK]${RESET} Created $(basename "$dest_file")"
    fi
}

install_standard() {
    local dest="$1"
    mkdir -p "$dest"
    # Static files
    for f in README.md LICENSE CONTRIBUTING.md package.json .mcp.json; do
        [ -f "$PLUGIN_ROOT/$f" ] && cp "$PLUGIN_ROOT/$f" "$dest/" && continue
        true
    done
    # Directories
    for d in skills agents hooks assets scripts evals; do
        if [ -d "$PLUGIN_ROOT/$d" ]; then
            mkdir -p "$dest/$d"
            copy_folder "$PLUGIN_ROOT/$d" "$dest/$d"
        fi
    done
    # Plugin manifest directories
    for d in .claude-plugin .kimi-plugin; do
        if [ -d "$PLUGIN_ROOT/$d" ]; then
            mkdir -p "$dest/$d"
            copy_folder "$PLUGIN_ROOT/$d" "$dest/$d"
            echo -e "  ${GREEN}[OK]${RESET} Copied $d/"
        fi
    done
    echo -e "  ${GREEN}[OK]${RESET} Plugin files copied"
    # Safe-write agent instruction files (from their guideline locations)
    safe_write_instructions "$dest/AGENTS.md"
    if [ ! -f "$dest/CLAUDE.md" ] && [ -f "$PLUGIN_ROOT/integrations/agents/CLAUDE.md" ]; then
        cp "$PLUGIN_ROOT/integrations/agents/CLAUDE.md" "$dest/CLAUDE.md"
        echo -e "  ${GREEN}[OK]${RESET} Created CLAUDE.md"
    elif [ -f "$dest/CLAUDE.md" ]; then
        echo -e "  ${YELLOW}[SKIP]${RESET} CLAUDE.md already exists - your customization preserved"
    fi
    # GEMINI.md comes from repo root (extension context file)
    if [ ! -f "$dest/GEMINI.md" ] && [ -f "$PLUGIN_ROOT/GEMINI.md" ]; then
        cp "$PLUGIN_ROOT/GEMINI.md" "$dest/GEMINI.md"
        echo -e "  ${GREEN}[OK]${RESET} Created GEMINI.md"
    elif [ -f "$dest/GEMINI.md" ]; then
        echo -e "  ${YELLOW}[SKIP]${RESET} GEMINI.md already exists - your customization preserved"
    fi
}

install_gemini() {
    local dest="$1"
    mkdir -p "$dest"
    if [ -f "$PLUGIN_ROOT/gemini-extension.json" ]; then
        cp "$PLUGIN_ROOT/gemini-extension.json" "$dest/gemini-extension.json"
        echo -e "  ${GREEN}[OK]${RESET} Copied gemini-extension.json"
    else
        echo -e "  ${RED}[ERROR]${RESET} gemini-extension.json not found"
    fi
    if [ -f "$PLUGIN_ROOT/GEMINI.md" ]; then
        cp "$PLUGIN_ROOT/GEMINI.md" "$dest/GEMINI.md"
        echo -e "  ${GREEN}[OK]${RESET} Copied GEMINI.md (context file)"
    fi
    if [ -d "$PLUGIN_ROOT/skills" ]; then
        mkdir -p "$dest/skills"
        copy_folder "$PLUGIN_ROOT/skills" "$dest/skills"
        echo -e "  ${GREEN}[OK]${RESET} Copied skills/"
    fi
}

install_cursor() {
    local dest="$1"
    mkdir -p "$dest"
    local skills_dir="$PLUGIN_ROOT/skills"
    for skill_dir in "$skills_dir"/*/; do
        skill_name="$(basename "$skill_dir")"
        skill_md="$skill_dir/SKILL.md"
        if [ -f "$skill_md" ]; then
            # Extract description from frontmatter (first description: line)
            description="$(awk '/^description:/{sub(/^description:[ \t]*/,""); print; exit}' "$skill_md" | sed 's/^["'\'']//; s/["'\'']$//')"
            [ -z "$description" ] && description="engineering-docs skill: $skill_name"
            # Strip frontmatter for the body
            body="$(awk 'BEGIN{fm=0} /^---[ \t]*$/{fm++; next} fm<2{next} {print}' "$skill_md")"
            {
                echo "---"
                echo "description: $description"
                echo "globs: "
                echo "alwaysApply: false"
                echo "---"
                echo ""
                echo "$body"
            } > "$dest/engineering-docs-${skill_name}.mdc"
            echo -e "  ${GREEN}[OK]${RESET} Cursor rule: engineering-docs-${skill_name}.mdc"
        fi
    done
}

install_cline() {
    local dest="$1"
    local src_file="$PLUGIN_ROOT/integrations/plugins/.cline/.clinerules/engineering-docs.md"
    mkdir -p "$dest/.clinerules"
    if [ -f "$src_file" ]; then
        cp "$src_file" "$dest/.clinerules/engineering-docs.md"
        echo -e "  ${GREEN}[OK]${RESET} Created .clinerules/engineering-docs.md"
    else
        echo -e "  ${RED}[ERROR]${RESET} .clinerules/engineering-docs.md not found"
    fi
    if [ -d "$PLUGIN_ROOT/skills" ]; then
        mkdir -p "$dest/.cline/skills"
        copy_folder "$PLUGIN_ROOT/skills" "$dest/.cline/skills"
        echo -e "  ${GREEN}[OK]${RESET} Copied .cline/skills/"
    fi
}

install_skills() {
    local dest="$1"
    mkdir -p "$dest"
    local skills_dir="$PLUGIN_ROOT/skills"
    for skill_dir in "$skills_dir"/*/; do
        skill_name="$(basename "$skill_dir")"
        mkdir -p "$dest/$skill_name"
        copy_folder "$skill_dir" "$dest/$skill_name"
        echo -e "  ${GREEN}[OK]${RESET} Installed skill: $skill_name"
    done
}

install_instructions() {
    local dest="$1"
    safe_write_instructions "$dest/AGENTS.md"
}

install_roo() {
    local dest="$1"
    mkdir -p "$dest"
    safe_write_instructions "$dest/engineering-docs.md"
}

print_done() {
    local kind="${1:-standard}"
    echo ""
    echo -e "${GREEN}${BOLD}[DONE] Installation complete!${RESET}"
    if [ "$kind" = "cursor" ]; then
        echo -e "${YELLOW}Restart Cursor/Windsurf to activate new rules.${RESET}"
    else
        echo -e "${YELLOW}Reload your agent or restart the CLI to load the plugin.${RESET}"
    fi
    echo ""
}

# ── Help ──────────────────────────────────────────────────────────────────────
show_help() {
    print_header
    echo -e "${BOLD}USAGE:${RESET}"
    echo "  ./setup.sh                  Interactive menu"
    echo "  ./setup.sh --gemini         Gemini CLI extension (~/.gemini/extensions/)"
    echo "  ./setup.sh --claude         Claude Code global"
    echo "  ./setup.sh --local          .agents/skills/ workspace"
    echo "  ./setup.sh --cursor         .cursor/rules/ workspace"
    echo "  ./setup.sh --kimi           Kimi Code global"
    echo "  ./setup.sh --codex          ~/.codex/AGENTS.md"
    echo "  ./setup.sh --goose          ~/.agents/skills/"
    echo "  ./setup.sh --pi             ~/.pi/agent/AGENTS.md"
    echo "  ./setup.sh --opencode       .opencode/skills/ workspace"
    echo "  ./setup.sh --kilo           ~/.config/kilo/AGENTS.md"
    echo "  ./setup.sh --roo            ~/.roo/rules/"
    echo "  ./setup.sh --cline          .clinerules/ + .cline/skills/ workspace"
    echo "  ./setup.sh --factory        ~/.factory/skills/"
    echo "  ./setup.sh --copilot        ~/.copilot/installed-plugins/"
    echo "  ./setup.sh --help           Show this help"
    echo ""
    echo -e "${YELLOW}Safe-write: AGENTS.md, GEMINI.md, CLAUDE.md are only created"
    echo -e "if they do NOT already exist at the destination.${RESET}"
    echo ""
}

# ── Direct install (flag mode) ────────────────────────────────────────────────
case "${1:-}" in
    --help|-h)      show_help; exit 0 ;;
    --gemini|-g)    print_header; echo -e "Installing to: ${YELLOW}$GEMINI_PATH${RESET}"; echo ""; install_gemini    "$GEMINI_PATH"; print_done; exit 0 ;;
    --claude|-c)    print_header; echo -e "Installing to: ${YELLOW}$CLAUDE_PATH${RESET}";  echo ""; install_standard "$CLAUDE_PATH";  print_done; exit 0 ;;
    --local|-l)     print_header; echo -e "Installing to: ${YELLOW}$LOCAL_PATH${RESET}";   echo ""; install_skills    "$LOCAL_PATH";   print_done; exit 0 ;;
    --cursor|-r)    print_header; echo -e "Installing to: ${YELLOW}$CURSOR_PATH${RESET}";  echo ""; install_cursor    "$CURSOR_PATH";  print_done "cursor"; exit 0 ;;
    --kimi|-k)      print_header; echo -e "Installing to: ${YELLOW}$KIMI_PATH${RESET}";    echo ""; install_standard "$KIMI_PATH";    print_done; exit 0 ;;
    --codex|-x)     print_header; echo -e "Installing to: ${YELLOW}$CODEX_PATH${RESET}";   echo ""; install_instructions "$CODEX_PATH"; print_done; exit 0 ;;
    --goose)        print_header; echo -e "Installing to: ${YELLOW}$GOOSE_PATH${RESET}";   echo ""; install_skills    "$GOOSE_PATH";   print_done; exit 0 ;;
    --pi)           print_header; echo -e "Installing to: ${YELLOW}$PI_PATH${RESET}";      echo ""; install_instructions "$PI_PATH";    print_done; exit 0 ;;
    --opencode)     print_header; echo -e "Installing to: ${YELLOW}$OPENCODE_PATH${RESET}"; echo ""; install_skills   "$OPENCODE_PATH"; print_done; exit 0 ;;
    --kilo)         print_header; echo -e "Installing to: ${YELLOW}$KILO_PATH${RESET}";    echo ""; install_instructions "$KILO_PATH";  print_done; exit 0 ;;
    --roo)          print_header; echo -e "Installing to: ${YELLOW}$ROO_PATH${RESET}";     echo ""; install_roo       "$ROO_PATH";     print_done; exit 0 ;;
    --cline)        print_header; echo -e "Installing to: ${YELLOW}$CLINE_PATH${RESET}";   echo ""; install_cline     "$CLINE_PATH";   print_done; exit 0 ;;
    --factory)      print_header; echo -e "Installing to: ${YELLOW}$FACTORY_PATH${RESET}"; echo ""; install_skills    "$FACTORY_PATH"; print_done; exit 0 ;;
    --copilot)      print_header; echo -e "Installing to: ${YELLOW}$COPILOT_PATH${RESET}"; echo ""; install_standard "$COPILOT_PATH"; print_done; exit 0 ;;
esac

# ── Interactive menu ──────────────────────────────────────────────────────────
print_header
echo -e "${BOLD}Select where to install the engineering-docs plugin:${RESET}"
echo ""
echo -e "  ${CYAN}[1]${RESET} ${BOLD}Gemini CLI - Global (~/.gemini/extensions/)${RESET}"
echo -e "      Path: ${YELLOW}$GEMINI_PATH${RESET}"
echo ""
echo -e "  ${CYAN}[2]${RESET} ${BOLD}Claude Code - Global${RESET}"
echo -e "      Path: ${YELLOW}$CLAUDE_PATH${RESET}"
echo ""
echo -e "  ${CYAN}[3]${RESET} ${BOLD}Local .agents/skills/ (shared Agent Skills dir)${RESET}"
echo -e "      Path: ${YELLOW}$LOCAL_PATH${RESET}"
echo ""
echo -e "  ${CYAN}[4]${RESET} ${BOLD}Cursor / Windsurf - Local .cursor/rules/${RESET}"
echo -e "      Path: ${YELLOW}$CURSOR_PATH${RESET}"
echo ""
echo -e "  ${CYAN}[5]${RESET} ${BOLD}Kimi Code - Global${RESET}"
echo -e "      Path: ${YELLOW}$KIMI_PATH${RESET}"
echo ""
echo -e "  ${CYAN}[6]${RESET} ${BOLD}Codex - Global (~/.codex/AGENTS.md)${RESET}"
echo -e "      Path: ${YELLOW}$CODEX_PATH${RESET}"
echo ""
echo -e "  ${CYAN}[7]${RESET} ${BOLD}Goose - Global (~/.agents/skills/)${RESET}"
echo -e "      Path: ${YELLOW}$GOOSE_PATH${RESET}"
echo ""
echo -e "  ${CYAN}[8]${RESET} ${BOLD}Pi - Global (~/.pi/agent/AGENTS.md)${RESET}"
echo -e "      Path: ${YELLOW}$PI_PATH${RESET}"
echo ""
echo -e "  ${CYAN}[9]${RESET} ${BOLD}OpenCode - Workspace (.opencode/skills/)${RESET}"
echo -e "      Path: ${YELLOW}$OPENCODE_PATH${RESET}"
echo ""
echo -e "  ${CYAN}[10]${RESET} ${BOLD}Kilo Code - Global (~/.config/kilo/AGENTS.md)${RESET}"
echo -e "      Path: ${YELLOW}$KILO_PATH${RESET}"
echo ""
echo -e "  ${CYAN}[11]${RESET} ${BOLD}Roo Code - Global (~/.roo/rules/)${RESET}"
echo -e "      Path: ${YELLOW}$ROO_PATH${RESET}"
echo ""
echo -e "  ${CYAN}[12]${RESET} ${BOLD}Cline - Workspace (.clinerules/ + .cline/skills/)${RESET}"
echo -e "      Path: ${YELLOW}$CLINE_PATH${RESET}"
echo ""
echo -e "  ${CYAN}[13]${RESET} ${BOLD}Factory Droid - Global (~/.factory/skills/)${RESET}"
echo -e "      Path: ${YELLOW}$FACTORY_PATH${RESET}"
echo ""
echo -e "  ${CYAN}[14]${RESET} ${BOLD}Copilot CLI - Global (~/.copilot/installed-plugins/)${RESET}"
echo -e "      Path: ${YELLOW}$COPILOT_PATH${RESET}"
echo ""
echo -e "  ${CYAN}[Q]${RESET} Quit"
echo ""
read -r -p "Enter your choice (1-14 or Q): " CHOICE

case "$CHOICE" in
    Q|q) echo -e "${YELLOW}Cancelled.${RESET}"; exit 0 ;;
    1)  DEST="$GEMINI_PATH";    KIND="gemini" ;;
    2)  DEST="$CLAUDE_PATH";    KIND="standard" ;;
    3)  DEST="$LOCAL_PATH";     KIND="skills" ;;
    4)  DEST="$CURSOR_PATH";    KIND="cursor" ;;
    5)  DEST="$KIMI_PATH";      KIND="standard" ;;
    6)  DEST="$CODEX_PATH";     KIND="instructions" ;;
    7)  DEST="$GOOSE_PATH";     KIND="skills" ;;
    8)  DEST="$PI_PATH";        KIND="instructions" ;;
    9)  DEST="$OPENCODE_PATH";  KIND="skills" ;;
    10) DEST="$KILO_PATH";      KIND="instructions" ;;
    11) DEST="$ROO_PATH";       KIND="roo" ;;
    12) DEST="$CLINE_PATH";     KIND="cline" ;;
    13) DEST="$FACTORY_PATH";   KIND="skills" ;;
    14) DEST="$COPILOT_PATH";   KIND="standard" ;;
    *) echo -e "${RED}Invalid choice. Please run the script again.${RESET}"; exit 1 ;;
esac

echo ""
echo -e "Installing to: ${YELLOW}$DEST${RESET}"
echo ""

case "$KIND" in
    gemini)        install_gemini "$DEST" ;;
    cursor)        install_cursor "$DEST" ;;
    cline)         install_cline "$DEST" ;;
    skills)        install_skills "$DEST" ;;
    instructions)  install_instructions "$DEST" ;;
    roo)           install_roo "$DEST" ;;
    *)             install_standard "$DEST" ;;
esac

print_done "$KIND"
