<#
.SYNOPSIS
    Engineering Docs Plugin Installer for Windows PowerShell.

.DESCRIPTION
    Installs the engineering-docs plugin to your chosen AI agent environment.
    Compatible with PowerShell 5.1+ (Windows) and PowerShell 7+ (cross-platform).

    Safe-write behavior: AGENTS.md, GEMINI.md, and CLAUDE.md are only written
    if they do NOT already exist at the destination. Your existing customizations
    are always preserved.

.EXAMPLE
    .\setup.ps1
    Interactive menu mode.

.EXAMPLE
    .\setup.ps1 -Target gemini
    Direct install to Gemini (Antigravity) global path.

.PARAMETER Target
    Optional. Skip the menu and install directly to a target.
    Valid values: gemini, claude, local, cursor, kimi, codex

.PARAMETER Help
    Show usage information.
#>

[CmdletBinding()]
param(
    [ValidateSet("gemini", "claude", "local", "cursor", "kimi", "codex")]
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
    Write-Color "|              v1.1.0 - 21 Skills                 |" Cyan
    Write-Color "|                                                 |" Cyan
    Write-Color "+-------------------------------------------------+" Cyan
    Write-Color ""
}

$ScriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$PluginRoot = Split-Path -Parent $ScriptDir
$HomeDir    = if ($env:USERPROFILE) { $env:USERPROFILE } elseif ($env:HOME) { $env:HOME } else { "~" }
$WorkDir    = (Get-Location).Path

$Targets = @(
    @{ Key = "gemini"; Name = "Gemini (Antigravity) - Global";                  Path = Join-Path $HomeDir ".gemini\config\plugins\engineering-docs"; IsCursor = $false }
    @{ Key = "claude"; Name = "Claude Code - Global";                            Path = Join-Path $HomeDir ".claude\plugins\engineering-docs";         IsCursor = $false }
    @{ Key = "local";  Name = "Local .agents/ (Antigravity / Claude / Codex)";  Path = Join-Path $WorkDir ".agents\skills\engineering-docs";          IsCursor = $false }
    @{ Key = "cursor"; Name = "Cursor / Windsurf - Local .cursor/rules/";        Path = Join-Path $WorkDir ".cursor\rules";                            IsCursor = $true  }
    @{ Key = "kimi";   Name = "Kimi Code - Global";                              Path = Join-Path $HomeDir ".kimi-code\plugins\engineering-docs";      IsCursor = $false }
    @{ Key = "codex";  Name = "Codex / GitHub Copilot - Local .codex/";         Path = Join-Path $WorkDir ".codex\engineering-docs";                  IsCursor = $false }
)

$AgentConfigs = @("AGENTS.md", "GEMINI.md", "CLAUDE.md")

function Copy-PluginDirectory {
    param([string]$Source, [string]$Destination)
    if (-not (Test-Path $Destination)) {
        New-Item -ItemType Directory -Path $Destination -Force | Out-Null
    }
    Get-ChildItem -Path $Source -Recurse | ForEach-Object {
        $RelPath  = $_.FullName.Substring($Source.Length).TrimStart("\", "/")
        $DestPath = Join-Path $Destination $RelPath
        if ($_.PSIsContainer) {
            if (-not (Test-Path $DestPath)) { New-Item -ItemType Directory -Path $DestPath -Force | Out-Null }
        } else {
            Copy-Item -Path $_.FullName -Destination $DestPath -Force
        }
    }
}

function Install-ToTarget {
    param([hashtable]$Tgt)
    if ($Tgt.IsCursor) {
        if (-not (Test-Path $Tgt.Path)) { New-Item -ItemType Directory -Path $Tgt.Path -Force | Out-Null }
        $SkillsDir = Join-Path $PluginRoot "skills"
        Get-ChildItem -Path $SkillsDir -Directory | ForEach-Object {
            $SkillMd = Join-Path $_.FullName "SKILL.md"
            if (Test-Path $SkillMd) {
                $DestFile = Join-Path $Tgt.Path "engineering-docs-$($_.Name).mdc"
                Copy-Item -Path $SkillMd -Destination $DestFile -Force
                Write-Color "  [OK] Cursor rule: engineering-docs-$($_.Name).mdc" Green
            }
        }
    } else {
        if (-not (Test-Path $Tgt.Path)) { New-Item -ItemType Directory -Path $Tgt.Path -Force | Out-Null }
        Get-ChildItem -Path $PluginRoot | Where-Object { $AgentConfigs -notcontains $_.Name } | ForEach-Object {
            $Dest = Join-Path $Tgt.Path $_.Name
            if ($_.PSIsContainer) { Copy-PluginDirectory -Source $_.FullName -Destination $Dest }
            else                  { Copy-Item -Path $_.FullName -Destination $Dest -Force }
        }
        Write-Color "  [OK] Plugin files copied" Green
        foreach ($ConfigFile in $AgentConfigs) {
            $SrcFile  = Join-Path $PluginRoot $ConfigFile
            $DestFile = Join-Path $Tgt.Path $ConfigFile
            if (Test-Path $DestFile) {
                Write-Color "  [SKIP] $ConfigFile already exists - your customization preserved" Yellow
            } elseif (Test-Path $SrcFile) {
                Copy-Item -Path $SrcFile -Destination $DestFile -Force
                Write-Color "  [OK] Created $ConfigFile" Green
            }
        }
    }
}

if ($Help) {
    Write-Header
    Write-Color "USAGE:" White
    Write-Color "  .\setup.ps1                  Interactive menu" White
    Write-Color "  .\setup.ps1 -Target gemini   Gemini (Antigravity) global" White
    Write-Color "  .\setup.ps1 -Target claude   Claude Code global" White
    Write-Color "  .\setup.ps1 -Target local    .agents/ workspace" White
    Write-Color "  .\setup.ps1 -Target cursor   .cursor/rules/ workspace" White
    Write-Color "  .\setup.ps1 -Target kimi     Kimi Code global" White
    Write-Color "  .\setup.ps1 -Target codex    .codex/ workspace" White
    Write-Color ""
    Write-Color "Safe-write: AGENTS.md, GEMINI.md, CLAUDE.md are only created" Yellow
    Write-Color "if they do NOT already exist at the destination." Yellow
    exit 0
}

if ($Target -ne "") {
    $Selected = $Targets | Where-Object { $_.Key -eq $Target } | Select-Object -First 1
    Write-Header
    Write-Color "Installing to: $($Selected.Path)" White
    Write-Color ""
    try {
        Install-ToTarget -Tgt $Selected
        Write-Color ""
        Write-Color "[DONE] Installation complete!" Green
        if ($Selected.IsCursor) { Write-Color "Restart Cursor/Windsurf to activate new rules." Yellow }
        else                    { Write-Color "Reload your agent or restart the CLI to load the plugin." Yellow }
    } catch { Write-Color "Error: $_" Red; exit 1 }
    exit 0
}

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
    if ($Selected.IsCursor) { Write-Color "Restart Cursor/Windsurf to activate new rules." Yellow }
    else                    { Write-Color "Reload your agent or restart the CLI to load the plugin." Yellow }
} catch { Write-Color "Error: $_" Red; exit 1 }
