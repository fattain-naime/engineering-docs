<#
.SYNOPSIS
    Engineering Docs Plugin Installer for Windows PowerShell.

.DESCRIPTION
    Installs the engineering-docs plugin to your chosen AI agent environment.
    Compatible with PowerShell 5.1+ (Windows) and PowerShell 7+ (cross-platform).

    Safe-write behavior: AGENTS.md, GEMINI.md, CLAUDE.md
    are only written if they do NOT already exist at the destination.
    Your existing customizations are always preserved.

.EXAMPLE
    .\setup.ps1
    Interactive menu mode.

.EXAMPLE
    .\setup.ps1 -Target gemini
    Install as a Gemini CLI extension.

.PARAMETER Target
    Optional. Skip the menu and install directly to a target.
    Valid values: gemini, claude, local, cursor, kimi, codex, goose, pi, opencode, kilo, roo, cline, factory, copilot

.PARAMETER Help
    Show usage information.
#>

[CmdletBinding()]
param(
    [ValidateSet("gemini", "claude", "local", "cursor", "kimi", "codex", "goose", "pi", "opencode", "kilo", "roo", "cline", "factory", "copilot")]
    [string]$Target = "",
    [switch]$Help
)

function Write-Color {
    param([string]$Text, [string]$Color = "White")
    Write-Host $Text -ForegroundColor $Color
}

function Write-Header {
    Write-Color ""
    Write-Color "+-------------------------------------------------+" Cyan
    Write-Color "|                                                 |" Cyan
    Write-Color "|     ENGINEERING DOCUMENTATION PLUGIN            |" Cyan
    Write-Color "|        Auto-Trigger Skill Installer             |" Cyan
    Write-Color "|              v1.2.3 - 22 Skills                 |" Cyan
    Write-Color "|                                                 |" Cyan
    Write-Color "+-------------------------------------------------+" Cyan
    Write-Color ""
}

$ScriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$PluginRoot = Split-Path -Parent $ScriptDir
$HomeDir    = if ($env:USERPROFILE) { $env:USERPROFILE } elseif ($env:HOME) { $env:HOME } else { "~" }
$WorkDir    = (Get-Location).Path

# Kind: standard | gemini | cursor | cline | skills | instructions | roo
$Targets = @(
    @{ Key = "gemini";   Name = "Gemini CLI - Global (~/.gemini/extensions/)";        Path = Join-Path $HomeDir ".gemini\extensions\engineering-docs";               Kind = "gemini" }
    @{ Key = "claude";   Name = "Claude Code - Global";                               Path = Join-Path $HomeDir ".claude\plugins\engineering-docs";                   Kind = "standard" }
    @{ Key = "local";    Name = "Local .agents/skills/ (shared Agent Skills dir)";    Path = Join-Path $WorkDir ".agents\skills";                                      Kind = "skills" }
    @{ Key = "cursor";   Name = "Cursor / Windsurf - Local .cursor/rules/";           Path = Join-Path $WorkDir ".cursor\rules";                                       Kind = "cursor" }
    @{ Key = "kimi";     Name = "Kimi Code - Global";                                 Path = Join-Path $HomeDir ".kimi-code\plugins\engineering-docs";                 Kind = "standard" }
    @{ Key = "codex";    Name = "Codex - Global (~/.codex/AGENTS.md)";                Path = Join-Path $HomeDir ".codex";                                              Kind = "instructions" }
    @{ Key = "goose";    Name = "Goose - Global (~/.agents/skills/)";                 Path = Join-Path $HomeDir ".agents\skills";                                      Kind = "skills" }
    @{ Key = "pi";       Name = "Pi - Global (~/.pi/agent/AGENTS.md)";                Path = Join-Path $HomeDir ".pi\agent";                                           Kind = "instructions" }
    @{ Key = "opencode"; Name = "OpenCode - Workspace (.opencode/skills/)";           Path = Join-Path $WorkDir ".opencode\skills";                                    Kind = "skills" }
    @{ Key = "kilo";     Name = "Kilo Code - Global (~/.config/kilo/AGENTS.md)";      Path = Join-Path $HomeDir ".config\kilo";                                        Kind = "instructions" }
    @{ Key = "roo";      Name = "Roo Code - Global (~/.roo/rules/)";                  Path = Join-Path $HomeDir ".roo\rules";                                          Kind = "roo" }
    @{ Key = "cline";    Name = "Cline - Workspace (.clinerules/ + .cline/skills/)";  Path = $WorkDir;                                                                Kind = "cline" }
    @{ Key = "factory";  Name = "Factory Droid - Global (~/.factory/skills/)";        Path = Join-Path $HomeDir ".factory\skills";                                     Kind = "skills" }
    @{ Key = "copilot";  Name = "Copilot CLI - Global (~/.copilot/installed-plugins/)"; Path = Join-Path $HomeDir ".copilot\installed-plugins\engineering-docs";       Kind = "standard" }
)

function Copy-Folder {
    param([string]$Source, [string]$Destination)
    if (-not (Test-Path $Destination)) {
        New-Item -ItemType Directory -Path $Destination -Force | Out-Null
    }
    Get-ChildItem -Path $Source -Force | ForEach-Object {
        $DestPath = Join-Path $Destination $_.Name
        if ($_.PSIsContainer) { Copy-Folder -Source $_.FullName -Destination $DestPath }
        else                  { Copy-Item -Path $_.FullName -Destination $DestPath -Force }
    }
}

function Safe-WriteInstructions {
    param([string]$DestFile, [string]$SourceFile)
    if (Test-Path $DestFile) {
        Write-Color "  [SKIP] $(Split-Path -Leaf $DestFile) already exists - your customization preserved" Yellow
    } elseif (Test-Path $SourceFile) {
        $Dir = Split-Path -Parent $DestFile
        if (-not (Test-Path $Dir)) { New-Item -ItemType Directory -Path $Dir -Force | Out-Null }
        Copy-Item -Path $SourceFile -Destination $DestFile -Force
        Write-Color "  [OK] Created $(Split-Path -Leaf $DestFile)" Green
    }
}

function Install-Standard {
    param([string]$Dest)
    if (-not (Test-Path $Dest)) { New-Item -ItemType Directory -Path $Dest -Force | Out-Null }
    foreach ($f in @("README.md", "LICENSE", "CONTRIBUTING.md", "package.json", ".mcp.json")) {
        $Src = Join-Path $PluginRoot $f
        if (Test-Path $Src) { Copy-Item -Path $Src -Destination (Join-Path $Dest $f) -Force }
    }
    foreach ($d in @("skills", "agents", "hooks", "assets", "scripts", "evals")) {
        $Src = Join-Path $PluginRoot $d
        if (Test-Path $Src) { Copy-Folder -Source $Src -Destination (Join-Path $Dest $d) }
    }
    foreach ($d in @(".claude-plugin", ".kimi-plugin")) {
        $Src = Join-Path $PluginRoot $d
        if (Test-Path $Src) {
            Copy-Folder -Source $Src -Destination (Join-Path $Dest $d)
            Write-Color "  [OK] Copied $d/" Green
        }
    }
    Write-Color "  [OK] Plugin files copied" Green
    Safe-WriteInstructions -DestFile (Join-Path $Dest "AGENTS.md") -SourceFile (Join-Path $PluginRoot "integrations\agents\AGENTS.md")
    Safe-WriteInstructions -DestFile (Join-Path $Dest "CLAUDE.md") -SourceFile (Join-Path $PluginRoot "integrations\agents\CLAUDE.md")
    Safe-WriteInstructions -DestFile (Join-Path $Dest "GEMINI.md") -SourceFile (Join-Path $PluginRoot "GEMINI.md")
}

function Install-Gemini {
    param([string]$Dest)
    if (-not (Test-Path $Dest)) { New-Item -ItemType Directory -Path $Dest -Force | Out-Null }
    $Manifest = Join-Path $PluginRoot "gemini-extension.json"
    if (Test-Path $Manifest) {
        Copy-Item -Path $Manifest -Destination (Join-Path $Dest "gemini-extension.json") -Force
        Write-Color "  [OK] Copied gemini-extension.json" Green
    } else {
        Write-Color "  [ERROR] gemini-extension.json not found" Red
    }
    $Context = Join-Path $PluginRoot "GEMINI.md"
    if (Test-Path $Context) {
        Copy-Item -Path $Context -Destination (Join-Path $Dest "GEMINI.md") -Force
        Write-Color "  [OK] Copied GEMINI.md (context file)" Green
    }
    $Skills = Join-Path $PluginRoot "skills"
    if (Test-Path $Skills) {
        Copy-Folder -Source $Skills -Destination (Join-Path $Dest "skills")
        Write-Color "  [OK] Copied skills/" Green
    }
}

function Install-Cursor {
    param([string]$Dest)
    if (-not (Test-Path $Dest)) { New-Item -ItemType Directory -Path $Dest -Force | Out-Null }
    $SkillsDir = Join-Path $PluginRoot "skills"
    Get-ChildItem -Path $SkillsDir -Directory | ForEach-Object {
        $SkillMd = Join-Path $_.FullName "SKILL.md"
        if (Test-Path $SkillMd) {
            $Lines = Get-Content -Path $SkillMd
            $Description = ""
            $InFm = $false
            $FmCount = 0
            $BodyStart = 0
            for ($i = 0; $i -lt $Lines.Count; $i++) {
                if ($Lines[$i] -match '^---\s*$') {
                    $FmCount++
                    if ($FmCount -eq 2) { $BodyStart = $i + 1; break }
                    $InFm = $true
                    continue
                }
                if ($InFm -and $Lines[$i] -match '^description:\s*(.+)$') {
                    $Description = $Matches[1].Trim().Trim('"', "'")
                }
            }
            if (-not $Description) { $Description = "engineering-docs skill: $($_.Name)" }
            $Body = if ($BodyStart -lt $Lines.Count) { $Lines[$BodyStart..($Lines.Count - 1)] -join "`n" } else { "" }
            $Mdc = "---`ndescription: $Description`nglobs: `nalwaysApply: false`n---`n`n$Body"
            $DestFile = Join-Path $Dest "engineering-docs-$($_.Name).mdc"
            Set-Content -Path $DestFile -Value $Mdc -Encoding UTF8
            Write-Color "  [OK] Cursor rule: engineering-docs-$($_.Name).mdc" Green
        }
    }
}

function Install-Cline {
    param([string]$Dest)
    $SrcFile = Join-Path $PluginRoot "integrations\plugins\.cline\.clinerules\engineering-docs.md"
    $RulesDir = Join-Path $Dest ".clinerules"
    if (-not (Test-Path $RulesDir)) { New-Item -ItemType Directory -Path $RulesDir -Force | Out-Null }
    if (Test-Path $SrcFile) {
        Copy-Item -Path $SrcFile -Destination (Join-Path $RulesDir "engineering-docs.md") -Force
        Write-Color "  [OK] Created .clinerules/engineering-docs.md" Green
    } else {
        Write-Color "  [ERROR] .clinerules/engineering-docs.md not found" Red
    }
    $Skills = Join-Path $PluginRoot "skills"
    if (Test-Path $Skills) {
        Copy-Folder -Source $Skills -Destination (Join-Path $Dest ".cline\skills")
        Write-Color "  [OK] Copied .cline/skills/" Green
    }
}

function Install-Skills {
    param([string]$Dest)
    if (-not (Test-Path $Dest)) { New-Item -ItemType Directory -Path $Dest -Force | Out-Null }
    $SkillsDir = Join-Path $PluginRoot "skills"
    Get-ChildItem -Path $SkillsDir -Directory | ForEach-Object {
        Copy-Folder -Source $_.FullName -Destination (Join-Path $Dest $_.Name)
        Write-Color "  [OK] Installed skill: $($_.Name)" Green
    }
}

function Install-Instructions {
    param([string]$Dest)
    Safe-WriteInstructions -DestFile (Join-Path $Dest "AGENTS.md") -SourceFile (Join-Path $PluginRoot "integrations\agents\AGENTS.md")
}

function Install-Roo {
    param([string]$Dest)
    if (-not (Test-Path $Dest)) { New-Item -ItemType Directory -Path $Dest -Force | Out-Null }
    Safe-WriteInstructions -DestFile (Join-Path $Dest "engineering-docs.md") -SourceFile (Join-Path $PluginRoot "integrations\agents\AGENTS.md")
}

function Install-ToTarget {
    param([hashtable]$Tgt)
    switch ($Tgt.Kind) {
        "gemini"       { Install-Gemini -Dest $Tgt.Path }
        "cursor"       { Install-Cursor -Dest $Tgt.Path }
        "cline"        { Install-Cline -Dest $Tgt.Path }
        "skills"       { Install-Skills -Dest $Tgt.Path }
        "instructions" { Install-Instructions -Dest $Tgt.Path }
        "roo"          { Install-Roo -Dest $Tgt.Path }
        default        { Install-Standard -Dest $Tgt.Path }
    }
}

# ── Help ──────────────────────────────────────────────────────────────────────
if ($Help) {
    Write-Header
    Write-Color "USAGE:" White
    Write-Color "  .\setup.ps1                      Interactive menu" White
    Write-Color "  .\setup.ps1 -Target gemini       Gemini CLI extension (~/.gemini/extensions/)" White
    Write-Color "  .\setup.ps1 -Target claude       Claude Code global" White
    Write-Color "  .\setup.ps1 -Target local        .agents/skills/ workspace" White
    Write-Color "  .\setup.ps1 -Target cursor       .cursor/rules/ workspace" White
    Write-Color "  .\setup.ps1 -Target kimi         Kimi Code global" White
    Write-Color "  .\setup.ps1 -Target codex        ~/.codex/AGENTS.md" White
    Write-Color "  .\setup.ps1 -Target goose        ~/.agents/skills/" White
    Write-Color "  .\setup.ps1 -Target pi           ~/.pi/agent/AGENTS.md" White
    Write-Color "  .\setup.ps1 -Target opencode     .opencode/skills/ workspace" White
    Write-Color "  .\setup.ps1 -Target kilo         ~/.config/kilo/AGENTS.md" White
    Write-Color "  .\setup.ps1 -Target roo          ~/.roo/rules/" White
    Write-Color "  .\setup.ps1 -Target cline        .clinerules/ + .cline/skills/ workspace" White
    Write-Color "  .\setup.ps1 -Target factory      ~/.factory/skills/" White
    Write-Color "  .\setup.ps1 -Target copilot      ~/.copilot/installed-plugins/" White
    Write-Color ""
    Write-Color "Safe-write: AGENTS.md, GEMINI.md, CLAUDE.md" Yellow
    Write-Color "are only created if they do NOT already exist at the destination." Yellow
    exit 0
}

# ── Direct install (flag mode) ────────────────────────────────────────────────
if ($Target -ne "") {
    $Selected = $Targets | Where-Object { $_.Key -eq $Target } | Select-Object -First 1
    Write-Header
    Write-Color "Installing to: $($Selected.Path)" White
    Write-Color ""
    try {
        Install-ToTarget -Tgt $Selected
        Write-Color ""
        Write-Color "[DONE] Installation complete!" Green
        if ($Selected.Kind -eq "cursor") { Write-Color "Restart Cursor/Windsurf to activate new rules." Yellow }
        else                            { Write-Color "Reload your agent or restart the CLI to load the plugin." Yellow }
    } catch { Write-Color "Error: $_" Red; exit 1 }
    exit 0
}

# ── Interactive menu ──────────────────────────────────────────────────────────
Write-Header
Write-Color "Select where to install the engineering-docs plugin:" White
Write-Color ""
for ($i = 0; $i -lt $Targets.Count; $i++) {
    $T = $Targets[$i]
    Write-Color "  [$($i+1)] $($T.Name)" Cyan
    Write-Color "      Path: $($T.Path)" Yellow
    Write-Color ""
}
Write-Color "  [Q] Quit" Cyan
Write-Color ""
$Choice = Read-Host "Enter your choice (1-$($Targets.Count) or Q)"
if ($Choice -match "^[Qq]$") { Write-Color "Cancelled." Yellow; exit 0 }
$Idx = [int]$Choice - 1
if ($Idx -lt 0 -or $Idx -ge $Targets.Count) { Write-Color "Invalid choice." Red; exit 1 }
$Selected = $Targets[$Idx]
Write-Color ""
Write-Color "Installing to: $($Selected.Path)" White
Write-Color ""
try {
    Install-ToTarget -Tgt $Selected
    Write-Color ""
    Write-Color "[DONE] Installation complete!" Green
    if ($Selected.Kind -eq "cursor") { Write-Color "Restart Cursor/Windsurf to activate new rules." Yellow }
    else                            { Write-Color "Reload your agent or restart the CLI to load the plugin." Yellow }
} catch { Write-Color "Error: $_" Red; exit 1 }
