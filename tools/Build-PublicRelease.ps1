[CmdletBinding()]
param(
    [string]$PrivateSource = 'E:\PreservationProject',
    [string]$OutputDirectory = (Join-Path $PSScriptRoot '..\artifacts\WayfarersArchive-Public-0.7'),
    [string]$RightsManifest = (Join-Path $PSScriptRoot '..\metadata\WIKIMEDIA_MEDIA_ATTRIBUTION.csv')
)

$ErrorActionPreference = 'Stop'
$source = (Resolve-Path -LiteralPath $PrivateSource).Path.TrimEnd('\')
$rights = (Resolve-Path -LiteralPath $RightsManifest).Path
$output = [System.IO.Path]::GetFullPath($OutputDirectory).TrimEnd('\')
$repoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path

if ($output.StartsWith($source, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'The public release output must not be inside the private source tree.'
}
if (Test-Path -LiteralPath $output) {
    throw "Output already exists. Choose a new empty directory: $output"
}

$xowaSource = Join-Path $source 'WikiProject_v0.5\xowa_app_windows_64_v4.6.12.2009'
$runtimeSource = Join-Path $source 'Runtimes'
foreach ($required in @($xowaSource, $runtimeSource)) {
    if (-not (Test-Path -LiteralPath $required -PathType Container)) { throw "Missing required source: $required" }
}

$media = @(Import-Csv -LiteralPath $rights | Where-Object Decision -eq 'INCLUDE')
if ($media.Count -eq 0) { throw 'The rights manifest contains no approved media.' }
if (@($media | Where-Object { $_.License -match '(?i)\bNC\b|noncommercial|\bND\b|no.?deriv|IGO|OGL|GFDL|Attribution only' }).Count -gt 0) {
    throw 'The rights manifest includes a blocked or review-only license.'
}

New-Item -ItemType Directory -Path $output | Out-Null
foreach ($seedItem in Get-ChildItem -LiteralPath (Join-Path $repoRoot 'drive-root') -Force) {
    Copy-Item -LiteralPath $seedItem.FullName -Destination $output -Recurse -Force
}

$xowaOutput = Join-Path $output 'Wikipedia\XOWA'
New-Item -ItemType Directory -Force -Path $xowaOutput | Out-Null
foreach ($fileName in @('xowa_windows_64.jar', 'xowa_linux_64.jar', 'xowa_macosx_64.jar', 'xowa_64.exe', 'readme.txt')) {
    Copy-Item -LiteralPath (Join-Path $xowaSource $fileName) -Destination $xowaOutput -Force
}

function Copy-TreeWithRobocopy {
    param([string]$From, [string]$To)
    New-Item -ItemType Directory -Force -Path $To | Out-Null
    & robocopy $From $To /E /COPY:DAT /DCOPY:DAT /R:2 /W:1 /NFL /NDL /NJH /NJS /NP
    if ($LASTEXITCODE -gt 7) { throw "Robocopy failed with exit code $LASTEXITCODE while copying $From" }
}

Copy-TreeWithRobocopy (Join-Path $xowaSource 'bin') (Join-Path $xowaOutput 'bin')
Copy-TreeWithRobocopy (Join-Path $xowaSource 'wiki') (Join-Path $xowaOutput 'wiki')
Copy-TreeWithRobocopy $runtimeSource (Join-Path $output 'Runtimes')

$cachePrefix = 'WikiProject_v0.5/xowa_app_windows_64_v4.6.12.2009/file/'
foreach ($item in $media) {
    $normalized = $item.CachePath -replace '\\', '/'
    if (-not $normalized.StartsWith($cachePrefix, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Unexpected media cache path: $($item.CachePath)"
    }
    $relative = $normalized.Substring($cachePrefix.Length).Replace('/', [IO.Path]::DirectorySeparatorChar)
    $sourceFile = Join-Path $xowaSource (Join-Path 'file' $relative)
    $destinationFile = Join-Path $xowaOutput (Join-Path 'file' $relative)
    if (-not (Test-Path -LiteralPath $sourceFile -PathType Leaf)) { throw "Approved media is missing: $sourceFile" }
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destinationFile) | Out-Null
    Copy-Item -LiteralPath $sourceFile -Destination $destinationFile -Force
}

$legal = Join-Path $output 'LEGAL'
$media | Sort-Object FileTitle | Export-Csv -LiteralPath (Join-Path $legal 'WIKIMEDIA_MEDIA_ATTRIBUTION.csv') -NoTypeInformation -Encoding utf8
Copy-Item -LiteralPath (Join-Path $repoRoot 'metadata\WIKIMEDIA_RIGHTS_VERIFICATION.json') -Destination $legal -Force
Copy-Item -LiteralPath (Join-Path $repoRoot 'PUBLIC_RELEASE_POLICY.md') -Destination $legal -Force
Copy-Item -LiteralPath (Join-Path $repoRoot 'EXCLUDED_FROM_PUBLIC_RELEASE.md') -Destination $legal -Force
Copy-Item -LiteralPath (Join-Path $repoRoot 'LICENSE') -Destination (Join-Path $legal 'WAYFARERS_ARCHIVE_MIT_LICENSE.txt') -Force

$files = @(Get-ChildItem -LiteralPath $output -File -Recurse)
$manifest = [ordered]@{
    schemaVersion = 1
    edition = '0.7-public'
    builtUtc = [DateTime]::UtcNow.ToString('o')
    sourceSnapshot = 'English Wikipedia, October 2024'
    fileCount = $files.Count
    totalBytes = ($files | Measure-Object Length -Sum).Sum
    approvedMediaCount = $media.Count
    excludedPrivateCollections = @('PDFLibrary', 'WesCecil')
}
$manifest | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $output 'RELEASE-MANIFEST.json') -Encoding utf8

$integrity = Join-Path $output 'INTEGRITY'
New-Item -ItemType Directory -Force -Path $integrity | Out-Null
$hashPath = Join-Path $integrity 'SHA256SUMS.txt'
$hashRows = foreach ($file in (Get-ChildItem -LiteralPath $output -File -Recurse | Where-Object FullName -ne $hashPath)) {
    $relative = $file.FullName.Substring($output.Length + 1).Replace('\', '/')
    $hash = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
    "$hash  $relative"
}
$hashRows | Set-Content -LiteralPath $hashPath -Encoding utf8

Write-Host "Public release built at: $output"
Write-Host "Files: $($manifest.fileCount); bytes: $($manifest.totalBytes); approved media: $($media.Count)"
