@echo off
rem Starts the RoCrew studio and opens it in your browser.
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js is not installed. Get it from https://nodejs.org and try again. & pause & exit /b 1)
start "RoCrew studio" node studio\server.mjs
timeout /t 2 /nobreak >nul
start "" http://localhost:4600
