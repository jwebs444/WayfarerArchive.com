[CmdletBinding()]
param(
    [string]$ReleaseDirectory = (Join-Path $PSScriptRoot '..\artifacts\WayfarersArchive-Public-0.7'),
    [string]$PackageDirectory = (Join-Path $PSScriptRoot '..\packages\0.7'),
    [string]$PublicBaseUrl = 'https://downloads.wayfarerarchive.com/releases/0.7',
    [int]$MaximumUnpackedMiB = 3000
)

$ErrorActionPreference = 'Stop'
$release = (Resolve-Path -LiteralPath $ReleaseDirectory).Path.TrimEnd('\')
$packageRoot = [IO.Path]::GetFullPath($PackageDirectory).TrimEnd('\')
if (Test-Path -LiteralPath $packageRoot) { throw "Package directory already exists: $packageRoot" }
New-Item -ItemType Directory -Path $packageRoot | Out-Null

$sevenZip = Join-Path $release 'Wikipedia\XOWA\bin\windows_64\7-zip\7za.exe'
$sevenZipLicense = Join-Path $release 'Wikipedia\XOWA\bin\windows_64\7-zip\license.txt'
foreach ($required in @($sevenZip, $sevenZipLicense)) {
    if (-not (Test-Path -LiteralPath $required -PathType Leaf)) { throw "Missing packaging dependency: $required" }
}

$bootstrap = Join-Path $packageRoot 'bootstrap'
New-Item -ItemType Directory -Path $bootstrap | Out-Null
Copy-Item -LiteralPath $sevenZip -Destination $bootstrap
Copy-Item -LiteralPath $sevenZipLicense -Destination $bootstrap

$maximumBytes = [int64]$MaximumUnpackedMiB * 1MB
$groups = [System.Collections.Generic.List[object]]::new()
$current = [System.Collections.Generic.List[object]]::new()
$currentBytes = [int64]0
$allFiles = @(Get-ChildItem -LiteralPath $release -File -Recurse | Sort-Object FullName)
foreach ($file in $allFiles) {
    if ($file.Length -gt $maximumBytes) { throw "A source file exceeds the package limit: $($file.FullName)" }
    if ($current.Count -gt 0 -and ($currentBytes + $file.Length) -gt $maximumBytes) {
        $groups.Add(@($current))
        $current = [System.Collections.Generic.List[object]]::new()
        $currentBytes = 0
    }
    $current.Add($file)
    $currentBytes += $file.Length
}
if ($current.Count -gt 0) { $groups.Add(@($current)) }

$packageRecords = [System.Collections.Generic.List[object]]::new()
Push-Location $release
try {
    for ($index = 0; $index -lt $groups.Count; $index++) {
        $number = $index + 1
        $name = 'WayfarersArchive-Public-0.7-part-{0:d3}.7z' -f $number
        $archivePath = Join-Path $packageRoot $name
        $listPath = Join-Path $packageRoot ('files-{0:d3}.txt' -f $number)
        $relativePaths = foreach ($file in @($groups[$index])) {
            $file.FullName.Substring($release.Length + 1)
        }
        $relativePaths | Set-Content -LiteralPath $listPath -Encoding utf8
        Write-Host "Creating package $number of $($groups.Count): $name"
        & $sevenZip a -t7z -mx=0 -scsUTF-8 $archivePath "@$listPath"
        if ($LASTEXITCODE -ne 0) { throw "7-Zip packaging failed with exit code $LASTEXITCODE" }
        Remove-Item -LiteralPath $listPath -Force
        $archive = Get-Item -LiteralPath $archivePath
        $packageRecords.Add([ordered]@{
            order = $number
            fileName = $archive.Name
            bytes = $archive.Length
            unpackedBytes = (@($groups[$index]) | Measure-Object Length -Sum).Sum
            sha256 = (Get-FileHash -LiteralPath $archive.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
            url = "$($PublicBaseUrl.TrimEnd('/'))/$($archive.Name)"
            format = '7z'
            deleteAfterInstall = $true
        })
    }
} finally {
    Pop-Location
}

$bootstrapRecords = foreach ($file in Get-ChildItem -LiteralPath $bootstrap -File | Sort-Object Name) {
    [ordered]@{
        fileName = $file.Name
        bytes = $file.Length
        sha256 = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
        url = "$($PublicBaseUrl.TrimEnd('/'))/bootstrap/$($file.Name)"
    }
}

$manifest = [ordered]@{
    schemaVersion = 2
    edition = '0.7-public'
    releaseStatus = 'staged'
    message = 'Locally packaged and verified; public URLs must be uploaded and checked before status changes to ready.'
    minimumTargetBytes = 125000000000
    installedBytes = ($allFiles | Measure-Object Length -Sum).Sum
    archiveFormat = 'sequential-7z'
    packages = @($packageRecords)
    bootstrap = @($bootstrapRecords)
}
$manifestPath = Join-Path $packageRoot 'release-manifest.json'
$manifest | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $manifestPath -Encoding utf8

[pscustomobject]@{
    packageDirectory = $packageRoot
    packages = $packageRecords.Count
    packageBytes = (Get-ChildItem -LiteralPath $packageRoot -File -Filter '*.7z' | Measure-Object Length -Sum).Sum
    manifest = $manifestPath
} | Format-List

