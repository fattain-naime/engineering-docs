@echo off
REM run-hook.cmd — Windows batch wrapper for engineering-docs hooks
REM
REM Usage: run-hook.cmd <hook-name>
REM
REM Supported hooks:
REM   check-progress  — Check for in-progress documentation and display a reminder

setlocal

set HOOK_NAME=%~1

if "%HOOK_NAME%"=="" (
    echo Usage: run-hook.cmd ^<hook-name^>
    echo.
    echo Supported hooks:
    echo   check-progress  Check for in-progress documentation
    exit /b 1
)

if "%HOOK_NAME%"=="check-progress" (
    node "%~dp0check-progress.js"
    exit /b %ERRORLEVEL%
)

echo Unknown hook: %HOOK_NAME%
echo Supported hooks: check-progress
exit /b 1
