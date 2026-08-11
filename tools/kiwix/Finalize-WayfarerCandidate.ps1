[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$CandidateRoot,
    [string]$RightsDatabase,
    [switch]$IncludeRightsDatabase,
    [string]$ZimcheckPath
)

$ErrorActionPreference = 'Stop'
$candidate = [IO.Path]::GetFullPath($CandidateRoot)
if (-not $ZimcheckPath) {
    $ZimcheckPath = Join-Path $PSScriptRoot '..\..\tmp\zim-tools-3.6.0\zimcheck.exe'
}
$zimFiles = @(Get-ChildItem -LiteralPath (Join-Path $candidate 'Wikipedia') -Filter '*.zim' -File)
if ($zimFiles.Count -ne 1) {
    throw "Candidate must contain exactly one ZIM; found $($zimFiles.Count)."
}

& ([IO.Path]::GetFullPath($ZimcheckPath)) -A $zimFiles[0].FullName
if ($LASTEXITCODE -ne 0) {
    throw "zimcheck rejected the candidate archive."
}

if ($IncludeRightsDatabase) {
    if (-not $RightsDatabase) { throw 'RightsDatabase is required with IncludeRightsDatabase.' }
    $rightsDb = [IO.Path]::GetFullPath($RightsDatabase)
    Copy-Item -LiteralPath $rightsDb -Destination (Join-Path $candidate 'Licenses\media-rights.sqlite')
}

$records = @()
$baseUri = [Uri]($candidate.TrimEnd('\') + '\')
foreach ($file in Get-ChildItem -LiteralPath $candidate -File -Recurse | Sort-Object FullName) {
    if ($file.Name -eq 'release-manifest.json') { continue }
    $relative = [Uri]::UnescapeDataString($baseUri.MakeRelativeUri([Uri]$file.FullName).ToString())
    $records += [pscustomobject][ordered]@{
        path = $relative
        bytes = $file.Length
        sha256 = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
    }
}

$manifest = [ordered]@{
    schemaVersion = 1
    release = 'Wayfarer 1.0'
    generatedUtc = [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ')
    minimumTargetBytes = 125000000000L
    requiredReserveBytes = 2000000000L
    files = $records
}
$manifest | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $candidate 'release-manifest.json') -Encoding UTF8

& (Join-Path $PSScriptRoot 'Test-CandidateCapacity.ps1') -CandidateRoot $candidate
