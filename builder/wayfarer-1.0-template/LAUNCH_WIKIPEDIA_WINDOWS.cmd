@echo off
setlocal EnableExtensions
set "ROOT=%~dp0"
set "ZIM="
set "READER="

for %%F in ("%ROOT%Wikipedia\*.zim") do if exist "%%~fF" if not defined ZIM set "ZIM=%%~fF"
for /r "%ROOT%Readers\Windows" %%F in (kiwix-desktop.exe) do if exist "%%~fF" if not defined READER set "READER=%%~fF"

if not defined ZIM (
  echo Wikipedia archive not found in "%ROOT%Wikipedia".
  pause
  exit /b 1
)
if not defined READER (
  echo Kiwix for Windows not found in "%ROOT%Readers\Windows".
  pause
  exit /b 1
)

start "Wayfarer's Archive" "%READER%" "%ZIM%"
exit /b 0
