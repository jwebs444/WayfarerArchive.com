[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [int]$BulkProcessId,

    [string]$PythonExecutable = 'C:\Users\Jason\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
)

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$bulkProcess = Get-Process -Id $BulkProcessId -ErrorAction Stop
$bulkProcess.WaitForExit()
$bulkProcess.Refresh()
$bulkExitCode = $bulkProcess.ExitCode

if ($null -eq $bulkExitCode) {
    Write-Warning "Windows did not expose an exit code for bulk process $BulkProcessId; continuing with the conservative per-file API audit."
} elseif ($bulkExitCode -ne 0) {
    # The per-file audit safely handles every still-pending record, so a bulk
    # optimization failure should slow the run rather than strand it.
    Write-Warning "Bulk rights audit process $BulkProcessId exited with code $bulkExitCode; continuing with the conservative per-file API audit."
}

$env:PYTHONPATH = @(
    (Resolve-Path (Join-Path $projectRoot 'tmp\python-packages')).Path
    (Resolve-Path (Join-Path $projectRoot 'tools\kiwix')).Path
) -join ';'

& $PythonExecutable `
    (Join-Path $projectRoot 'tools\kiwix\zim_media_audit.py') `
    (Join-Path $projectRoot 'staging\1.0\source\wikipedia_en_all_maxi_2026-02.zim') `
    (Join-Path $projectRoot 'staging\1.0\audit\media-rights.sqlite') `
    --skip-inventory `
    --batch-size 50 `
    --delay 1

if ($LASTEXITCODE -ne 0) {
    throw "Per-file rights audit exited with code $LASTEXITCODE."
}
