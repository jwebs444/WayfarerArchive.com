@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Maintenance\Verify-Checksums.ps1" -ArchiveRoot "%~dp0"
if errorlevel 1 pause
