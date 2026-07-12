#!/usr/bin/env bash
# ============================================================
# Engineering Docs Plugin Installer - Linux / macOS
# Compatible: bash 3.2+, sh, zsh
# ============================================================
#
# USAGE:
#   chmod +x setup.sh && ./setup.sh          Interactive menu
#   ./setup.sh --gemini                      Direct install to Gemini global
#   ./setup.sh --claude                      Direct install to Claude Code global
#   ./setup.sh --local                       Install to .agents/ (workspace)
#   ./setup.sh --cursor                      Install to .cursor/rules/ (workspace)
#   ./setup.sh --kimi                        Install to Kimi Code global
#   ./setup.sh --codex                       Install to .codex/ (workspace)
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
    echo -e "${CYAN}|              v1.1.0 - 21 Skills                 |${RESET}"
    echo -e "${CYAN}|                                                 |${RESET}"
    echo -e "${CYAN}+-------------------------------------------------+${RESET}"
    echo ""
}

# ── Paths ─────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(dirname "$SCRIPT_DIR")"
HOME_DIR="${HOME:-$USERPROFILE}"
WORK_DIR="$(pwd)"

# Detect OS for correct path separators and default paths
OS_TYPE="$(uname -s 2>/dev/null || echo "Windows")"

# ── Targets ───────────────────────────────────────────────────────────────────
GEMINI_PATH="$HOME_DIR/.gemini/config/plugins/engineering-docs"
CLAUDE_PATH="$HOME_DIR/.claude/plugins/engineering-docs"
LOCAL_PATH="$WORK_DIR/.agents/skills/engineering-docs"
CURSOR_PATH="$WORK_DIR/.cursor/rules"
KIMI_PATH="$HOME_DIR/.kimi-code/plugins/engineering-docs"
CODEX_PATH="$WORK_DIR/.codex/engineering-docs"

# Agent config files using safe-write
AGENT_CONFIGS=("AGENTS.md" "GEMINI.md" "CLAUDE.md")

# ── Helpers ───────────────────────────────────────────────────────────────────
copy_plugin() {
    local src="$1" dest="$2"
    mkdir -p "$dest"
    # Copy everything, then handle agent configs separately
    find "$src" -maxdepth 1 | tail -n +2 | while read -r item; do
        name="$(basename "$item")"
        # Skip agent config files - handled by safe_write_configs
        skip=false
        for cfg in "${AGENT_CONFIGS[@]}"; do
            [ "$name" = "$cfg" ] && skip=true && break
        done
        [ "$skip" = "true" ] && continue
        cp -r "$item" "$dest/"
    done
    echo -e "  ${GREEN}[OK]${RESET} Plugin files copied"
}

safe_write_configs() {
    local dest="$1"
    for cfg in "${AGENT_CONFIGS[@]}"; do
        src_file="$PLUGIN_ROOT/$cfg"
        dest_file="$dest/$cfg"
        if [ -f "$dest_file" ]; then
            echo -e "  ${YELLOW}[SKIP]${RESET} $cfg already exists - your customization preserved"
        elif [ -f "$src_file" ]; then
            cp "$src_file" "$dest_file"
            echo -e "  ${GREEN}[OK]${RESET} Created $cfg"
        fi
    done
}

install_cursor() {
    local dest="$1"
    mkdir -p "$dest"
    local skills_dir="$PLUGIN_ROOT/skills"
    for skill_dir in "$skills_dir"/*/; do
        skill_name="$(basename "$skill_dir")"
        skill_md="$skill_dir/SKILL.md"
        if [ -f "$skill_md" ]; then
            cp "$skill_md" "$dest/engineering-docs-${skill_name}.mdc"
            echo -e "  ${GREEN}[OK]${RESET} Cursor rule: engineering-docs-${skill_name}.mdc"
        fi
    done
}

install_standard() {
    local dest="$1"
    mkdir -p "$dest"
    copy_plugin "$PLUGIN_ROOT" "$dest"
    safe_write_configs "$dest"
}

print_done() {
    local is_cursor="${1:-false}"
    echo ""
    echo -e "${GREEN}${BOLD}[DONE] Installation complete!${RESET}"
    if [ "$is_cursor" = "true" ]; then
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
    echo "  ./setup.sh --gemini         Gemini (Antigravity) global"
    echo "  ./setup.sh --claude         Claude Code global"
    echo "  ./setup.sh --local          .agents/ workspace"
    echo "  ./setup.sh --cursor         .cursor/rules/ workspace"
    echo "  ./setup.sh --kimi           Kimi Code global"
    echo "  ./setup.sh --codex          .codex/ workspace"
    echo "  ./setup.sh --help           Show this help"
    echo ""
    echo -e "${YELLOW}Safe-write: AGENTS.md, GEMINI.md, CLAUDE.md are only created"
    echo -e "if they do NOT already exist at the destination.${RESET}"
    echo ""
}

# ── Direct install (flag mode) ────────────────────────────────────────────────
case "${1:-}" in
    --help|-h)    show_help; exit 0 ;;
    --gemini|-g)  print_header; echo -e "Installing to: ${YELLOW}$GEMINI_PATH${RESET}"; echo ""; install_standard "$GEMINI_PATH"; print_done; exit 0 ;;
    --claude|-c)  print_header; echo -e "Installing to: ${YELLOW}$CLAUDE_PATH${RESET}";  echo ""; install_standard "$CLAUDE_PATH";  print_done; exit 0 ;;
    --local|-l)   print_header; echo -e "Installing to: ${YELLOW}$LOCAL_PATH${RESET}";   echo ""; install_standard "$LOCAL_PATH";   print_done; exit 0 ;;
    --cursor|-r)  print_header; echo -e "Installing to: ${YELLOW}$CURSOR_PATH${RESET}";  echo ""; install_cursor   "$CURSOR_PATH";  print_done "true"; exit 0 ;;
    --kimi|-k)    print_header; echo -e "Installing to: ${YELLOW}$KIMI_PATH${RESET}";    echo ""; install_standard "$KIMI_PATH";    print_done; exit 0 ;;
    --codex|-x)   print_header; echo -e "Installing to: ${YELLOW}$CODEX_PATH${RESET}";   echo ""; install_standard "$CODEX_PATH";   print_done; exit 0 ;;
esac

# ── Interactive menu ──────────────────────────────────────────────────────────
print_header
echo -e "${BOLD}Select where to install the engineering-docs plugin:${RESET}"
echo ""
echo -e "  ${CYAN}[1]${RESET} ${BOLD}Gemini (Antigravity) - Global${RESET}"
echo -e "      Path: ${YELLOW}$GEMINI_PATH${RESET}"
echo ""
echo -e "  ${CYAN}[2]${RESET} ${BOLD}Claude Code - Global${RESET}"
echo -e "      Path: ${YELLOW}$CLAUDE_PATH${RESET}"
echo ""
echo -e "  ${CYAN}[3]${RESET} ${BOLD}Local .agents/ (Antigravity / Claude / Codex)${RESET}"
echo -e "      Path: ${YELLOW}$LOCAL_PATH${RESET}"
echo ""
echo -e "  ${CYAN}[4]${RESET} ${BOLD}Cursor / Windsurf - Local .cursor/rules/${RESET}"
echo -e "      Path: ${YELLOW}$CURSOR_PATH${RESET}"
echo ""
echo -e "  ${CYAN}[5]${RESET} ${BOLD}Kimi Code - Global${RESET}"
echo -e "      Path: ${YELLOW}$KIMI_PATH${RESET}"
echo ""
echo -e "  ${CYAN}[6]${RESET} ${BOLD}Codex / GitHub Copilot - Local .codex/${RESET}"
echo -e "      Path: ${YELLOW}$CODEX_PATH${RESET}"
echo ""
echo -e "  ${CYAN}[Q]${RESET} Quit"
echo ""
read -r -p "Enter your choice (1-6 or Q): " CHOICE

case "$CHOICE" in
    Q|q) echo -e "${YELLOW}Cancelled.${RESET}"; exit 0 ;;
    1) DEST="$GEMINI_PATH"; IS_CURSOR=false ;;
    2) DEST="$CLAUDE_PATH"; IS_CURSOR=false ;;
    3) DEST="$LOCAL_PATH";  IS_CURSOR=false ;;
    4) DEST="$CURSOR_PATH"; IS_CURSOR=true  ;;
    5) DEST="$KIMI_PATH";   IS_CURSOR=false ;;
    6) DEST="$CODEX_PATH";  IS_CURSOR=false ;;
    *) echo -e "${RED}Invalid choice. Please run the script again.${RESET}"; exit 1 ;;
esac

echo ""
echo -e "Installing to: ${YELLOW}$DEST${RESET}"
echo ""

if [ "$IS_CURSOR" = "true" ]; then
    install_cursor "$DEST"
else
    install_standard "$DEST"
fi

print_done "$IS_CURSOR"
