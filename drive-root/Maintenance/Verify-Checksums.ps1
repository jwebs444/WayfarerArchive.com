[CmdletBinding()]
param([string]$ArchiveRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath $ArchiveRoot).Path.TrimEnd('\')
$sumPath = Join-Path $root 'INTEGRITY\SHA256SUMS.txt'
if (-not (Test-Path -LiteralPath $sumPath -PathType Leaf)) { throw "Checksum ledger missing: $sumPath" }

$checked = 0
foreach ($line in Get-Content -LiteralPath $sumPath -Encoding utf8) {
    if ($line -notmatch '^([0-9a-f]{64})  (.+)$') { throw "Malformed checksum line: $line" }
    $expected = $Matches[1]
    $relative = $Matches[2].Replace('/', '\')
    $path = Join-Path $root $relative
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Missing file: $relative" }
    $actual = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actual -ne $expected) { throw "Checksum mismatch: $relative" }
    $checked++
}
Write-Host "PASS — verified $checked files."

