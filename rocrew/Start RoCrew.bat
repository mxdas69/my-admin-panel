@echo off
rem Starts the RoCrew studio and opens it in your browser.
rem If the app ever stops unexpectedly it starts again by itself, and the crew carries on
rem where it left off. Close this window (or press Ctrl+C) to stop RoCrew.
cd /d "%~dp0"
title RoCrew studio
where node >nul 2>nul || (echo Node.js is not installed. Get it from https://nodejs.org and try again. & pause & exit /b 1)
set "OPEN=--open"
if /i "%~1"=="nobrowser" set "OPEN="
:run
node studio\server.mjs %OPEN%
if %errorlevel%==0 goto :eof
set "OPEN="
echo.
echo RoCrew stopped unexpectedly. Starting it again in 5 seconds (close this window to stop)...
timeout /t 5 /nobreak >nul
goto run
