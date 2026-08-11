[CmdletBinding()]
param(
    [string]$DestinationDirectory
)

$ErrorActionPreference = 'Stop'
if (-not $DestinationDirectory) {
    $DestinationDirectory = Join-Path $PSScriptRoot '..\..\staging\1.0\source'
}
$fileName = 'wikipedia_en_all_maxi_2026-02.zim'
$sourceUrl = "https://download.kiwix.org/zim/wikipedia/$fileName"
$expectedBytes = 123980647016L
$expectedSha256 = 'BF0853BF94ED8C53524E5EE67288BC4898819BC9D496AF2B3F852B6588ABDD27'
$reserveBytes = 10000000000L

$destination = [IO.Path]::GetFullPath($DestinationDirectory)
$partial = Join-Path $destination "$fileName.partial"
$final = Join-Path $destination $fileName
$volumeRoot = [IO.Path]::GetPathRoot($destination)
$freeBytes = (Get-PSDrive -Name $volumeRoot.TrimEnd('\').TrimEnd(':')).Free
$existingBytes = if (Test-Path -LiteralPath $partial) { (Get-Item -LiteralPath $partial).Length } else { 0L }
$requiredBytes = ($expectedBytes - $existingBytes) + $reserveBytes

if ($freeBytes -lt $requiredBytes) {
    throw "Insufficient scratch space. Need $requiredBytes bytes including reserve; $freeBytes bytes are free."
}

New-Item -ItemType Directory -Path $destination -Force | Out-Null

$verified = $false
if (-not (Test-Path -LiteralPath $final)) {
    & curl.exe --fail --location --continue-at - --output $partial $sourceUrl
    if ($LASTEXITCODE -ne 0) {
        throw "Kiwix source download failed with curl exit code $LASTEXITCODE. The partial file is retained for resume."
    }
    if ((Get-Item -LiteralPath $partial).Length -ne $expectedBytes) {
        throw "Downloaded byte count does not match the published source length."
    }
    $actualSha256 = (Get-FileHash -LiteralPath $partial -Algorithm SHA256).Hash
    if ($actualSha256 -ne $expectedSha256) {
        throw "Downloaded SHA-256 does not match Kiwix's published checksum."
    }
    Move-Item -LiteralPath $partial -Destination $final
    $verified = $true
}

if (-not $verified) {
    $finalHash = (Get-FileHash -LiteralPath $final -Algorithm SHA256).Hash
    if ($finalHash -ne $expectedSha256) {
        throw "Existing source ZIM failed SHA-256 verification."
    }
}

Get-Item -LiteralPath $final | Select-Object FullName, Length, LastWriteTimeUtc
