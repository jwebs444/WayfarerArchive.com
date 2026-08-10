@echo off
setlocal
set "ARCHIVE_ROOT=%~dp0"
set "XOWA_HOME=%ARCHIVE_ROOT%Wikipedia\XOWA"
set "XOWA_JAR=%XOWA_HOME%\xowa_windows_64.jar"
set "JAVA_W=%ARCHIVE_ROOT%Runtimes\Java\Windows-x64\jdk8u502-b07-jre\bin\javaw.exe"

if not exist "%JAVA_W%" (
  echo Portable Java is missing: %JAVA_W%
  pause
  exit /b 1
)
if not exist "%XOWA_JAR%" (
  echo XOWA is missing: %XOWA_JAR%
  pause
  exit /b 1
)
start "" /D "%XOWA_HOME%" "%JAVA_W%" -Xmx1024m -jar "%XOWA_JAR%" --root_dir "%XOWA_HOME%" --app_mode gui --url "en.wikipedia.org/wiki/Main_Page" --show_license n --show_args n
if errorlevel 1 pause

