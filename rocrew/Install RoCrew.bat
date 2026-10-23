@echo off
rem One-time install: Node.js (if missing), then Claude Code, ffmpeg and, only if Blender is
rem installed, uv and the Blender MCP add-on. Then it starts RoCrew in the system tray.
cd /d "%~dp0"
title Installing RoCrew
set "NODE=node"
where node >nul 2>nul || (
  echo Installing Node.js...
  winget install --id OpenJS.NodeJS.LTS -e --silent --accept-package-agreements --accept-source-agreements
  set "NODE=%ProgramFiles%\nodejs\node.exe"
  set "PATH=%ProgramFiles%\nodejs;%APPDATA%\npm;%PATH%"
)
"%NODE%" studio\setup.mjs
where claude >nul 2>nul && (
  echo.
  echo Sign in to Claude in the window that opens, then close it.
  start "Sign in to Claude" cmd /k claude
)
echo.
echo Starting RoCrew in your system tray...
start "" wscript "%~dp0Start RoCrew.vbs"
timeout /t 5 >nul
