[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$ReleaseDirectory
)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath $ReleaseDirectory).Path.TrimEnd('\')
$errors = [System.Collections.Generic.List[string]]::new()

$required = @(
    'START_HERE.html',
    'README.txt',
    'RELEASE-MANIFEST.json',
    'LEGAL\README.txt',
    'LEGAL\WIKIMEDIA_MEDIA_ATTRIBUTION.csv',
    'INTEGRITY\SHA256SUMS.txt',
    'Wikipedia\XOWA\xowa_windows_64.jar',
    'Wikipedia\XOWA\wiki\en.wikipedia.org'
)
foreach ($relative in $required) {
    if (-not (Test-Path -LiteralPath (Join-Path $root $relative))) { $errors.Add("Missing required path: $relative") }
}

$files = @(Get-ChildItem -LiteralPath $root -File -Recurse)
$forbidden = @($files | Where-Object {
    $relative = $_.FullName.Substring($root.Length + 1)
    $relative -match '(?i)(^|\\)(PDFLibrary|WesCecil|Quarantine)(\\|$)' -or
    $relative -match '(?i)^Wikipedia\\XOWA\\user(\\|$)' -or
    $_.Extension -match '^(?i:\.pdf|\.mp3|\.m4a|\.mp4|\.mkv|\.avi)$'
})
foreach ($file in $forbidden) { $errors.Add("Forbidden public payload: $($file.FullName.Substring($root.Length + 1))") }

$attributionPath = Join-Path $root 'LEGAL\WIKIMEDIA_MEDIA_ATTRIBUTION.csv'
if (Test-Path -LiteralPath $attributionPath) {
    $media = @(Import-Csv -LiteralPath $attributionPath)
    foreach ($row in $media) {
        if ($row.Decision -ne 'INCLUDE') { $errors.Add("Non-approved media record included: $($row.FileTitle)") }
        if ($row.License -match '(?i)\bNC\b|noncommercial|\bND\b|no.?deriv|IGO|OGL|GFDL|Attribution only') {
            $errors.Add("Blocked media license included: $($row.FileTitle) [$($row.License)]")
        }
    }

    $expected = @{}
    foreach ($row in $media) {
        $prefix = 'WikiProject_v0.5/xowa_app_windows_64_v4.6.12.2009/file/'
        $relativeCache = ($row.CachePath -replace '\\','/').Substring($prefix.Length)
        $expected[$relativeCache.ToLowerInvariant()] = $true
    }
    $fileRoot = Join-Path $root 'Wikipedia\XOWA\file'
    foreach ($file in @(Get-ChildItem -LiteralPath $fileRoot -File -Recurse)) {
        $relative = $file.FullName.Substring($fileRoot.Length + 1).Replace('\','/').ToLowerInvariant()
        if (-not $expected.ContainsKey($relative)) { $errors.Add("Unmanifested cached media: $relative") }
    }
}

$hashPath = Join-Path $root 'INTEGRITY\SHA256SUMS.txt'
if (Test-Path -LiteralPath $hashPath) {
    $lineNumber = 0
    foreach ($line in Get-Content -LiteralPath $hashPath -Encoding utf8) {
        $lineNumber++
        if ($line -notmatch '^([0-9a-f]{64})  (.+)$') { $errors.Add("Malformed hash line $lineNumber"); continue }
        $expectedHash = $Matches[1]
        $relative = $Matches[2].Replace('/', '\')
        $path = Join-Path $root $relative
        if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { $errors.Add("Hashed file missing: $relative"); continue }
        $actual = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant()
        if ($actual -ne $expectedHash) { $errors.Add("Hash mismatch: $relative") }
    }
}

if ($errors.Count -gt 0) {
    $errors | ForEach-Object { Write-Error $_ }
    throw "Public release verification failed with $($errors.Count) error(s)."
}

[pscustomobject]@{
    release = $root
    verifiedUtc = [DateTime]::UtcNow.ToString('o')
    files = $files.Count
    bytes = ($files | Measure-Object Length -Sum).Sum
    result = 'PASS'
} | Format-List
