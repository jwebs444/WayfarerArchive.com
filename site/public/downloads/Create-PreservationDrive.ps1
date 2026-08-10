[CmdletBinding()]
param(
    [string]$TargetDrive,
    [string]$ManifestUri = 'https://wayfarerarchive.com/downloads/release-manifest.json',
    [switch]$Resume,
    [switch]$AllowStagedManifest
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

Write-Host "Wayfarer's Archive — public drive builder"
if (-not $TargetDrive) { $TargetDrive = Read-Host 'Enter the removable-drive letter or root path (example: E:\)' }
$targetRoot = [IO.Path]::GetPathRoot([IO.Path]::GetFullPath($TargetDrive))
if (-not $targetRoot -or -not (Test-Path -LiteralPath $targetRoot -PathType Container)) { throw "Target drive not found: $TargetDrive" }
$systemRoot = [IO.Path]::GetPathRoot($env:SystemRoot)
if ($targetRoot.TrimEnd('\') -eq $systemRoot.TrimEnd('\')) { throw 'Refusing to use the Windows system drive.' }

$manifest = Invoke-RestMethod -UseBasicParsing -Uri $ManifestUri -Headers @{'User-Agent'='WayfarersArchiveDriveBuilder/0.7'}
if ($manifest.schemaVersion -ne 2) { throw 'Unsupported release-manifest schema.' }
if ($manifest.releaseStatus -ne 'ready' -and -not $AllowStagedManifest) {
    throw "Release $($manifest.edition) is not ready: $($manifest.message)"
}

$drive = [IO.DriveInfo]::new($targetRoot)
if ($drive.AvailableFreeSpace -lt [int64]$manifest.minimumTargetBytes) { throw 'The selected drive does not meet the 125 GB minimum.' }
$archiveRoot = Join-Path $targetRoot 'WayfarersArchive'
if ((Test-Path -LiteralPath $archiveRoot) -and -not $Resume) { throw "The target already exists. Re-run with -Resume: $archiveRoot" }
$staging = Join-Path $archiveRoot '.downloads'
$tools = Join-Path $staging 'tools'
New-Item -ItemType Directory -Path $tools -Force | Out-Null

function Receive-VerifiedFile {
    param($Record, [string]$Destination)
    if (Test-Path -LiteralPath $Destination -PathType Leaf) {
        $existing = (Get-FileHash -LiteralPath $Destination -Algorithm SHA256).Hash.ToLowerInvariant()
        if ($existing -eq $Record.sha256.ToLowerInvariant()) { return }
    }
    $partial = "$Destination.part"
    Write-Host "Downloading $($Record.fileName)..."
    Invoke-WebRequest -UseBasicParsing -Uri $Record.url -OutFile $partial -Headers @{'User-Agent'='WayfarersArchiveDriveBuilder/0.7'}
    $actual = (Get-FileHash -LiteralPath $partial -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actual -ne $Record.sha256.ToLowerInvariant()) { throw "Checksum failed: $($Record.fileName)" }
    Move-Item -LiteralPath $partial -Destination $Destination -Force
}

foreach ($item in $manifest.bootstrap) {
    Receive-VerifiedFile $item (Join-Path $tools $item.fileName)
}
$sevenZip = Join-Path $tools '7za.exe'
if (-not (Test-Path -LiteralPath $sevenZip -PathType Leaf)) { throw 'The verified 7-Zip extractor is missing.' }

foreach ($package in ($manifest.packages | Sort-Object order)) {
    $marker = Join-Path $staging "$($package.fileName).installed"
    if ($Resume -and (Test-Path -LiteralPath $marker -PathType Leaf)) {
        Write-Host "Already installed: $($package.fileName)"
        continue
    }
    $localPackage = Join-Path $staging $package.fileName
    Receive-VerifiedFile $package $localPackage
    Write-Host "Installing package $($package.order) of $($manifest.packages.Count)..."
    & $sevenZip x -y "-o$archiveRoot" $localPackage
    if ($LASTEXITCODE -ne 0) { throw "Extraction failed: $($package.fileName)" }
    Set-Content -LiteralPath $marker -Value $package.sha256 -Encoding ascii
    if ($package.deleteAfterInstall) { Remove-Item -LiteralPath $localPackage -Force }
}

$verify = Join-Path $archiveRoot 'Maintenance\Verify-Checksums.ps1'
if (-not (Test-Path -LiteralPath $verify -PathType Leaf)) { throw 'The assembled archive is missing its verifier.' }
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $verify -ArchiveRoot $archiveRoot
if ($LASTEXITCODE -ne 0) { throw 'Archive verification failed.' }
Write-Host "Drive complete: $archiveRoot"

