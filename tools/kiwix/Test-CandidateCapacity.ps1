[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$CandidateRoot,
    [long]$MinimumTargetBytes = 125000000000L,
    [long]$ReserveBytes = 2000000000L
)

$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath($CandidateRoot)
if (-not (Test-Path -LiteralPath $root -PathType Container)) {
    throw "Candidate directory does not exist: $root"
}

$files = @(Get-ChildItem -LiteralPath $root -File -Recurse)
$payloadBytes = [long](($files | Measure-Object -Property Length -Sum).Sum)
$maximumPayloadBytes = $MinimumTargetBytes - $ReserveBytes
$fits = $payloadBytes -le $maximumPayloadBytes

[pscustomobject]@{
    CandidateRoot = $root
    FileCount = $files.Count
    PayloadBytes = $payloadBytes
    MinimumTargetBytes = $MinimumTargetBytes
    ReserveBytes = $ReserveBytes
    MaximumPayloadBytes = $maximumPayloadBytes
    RemainingAtMinimum = $maximumPayloadBytes - $payloadBytes
    Fits = $fits
}

if (-not $fits) {
    throw "Candidate exceeds the minimum target capacity contract by $($payloadBytes - $maximumPayloadBytes) bytes."
}
