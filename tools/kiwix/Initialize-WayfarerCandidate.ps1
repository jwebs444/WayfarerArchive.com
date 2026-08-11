[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$Destination,
    [string]$ReaderPackageDirectory,
    [string]$TemplateDirectory
)

$ErrorActionPreference = 'Stop'
if (-not $ReaderPackageDirectory) {
    $ReaderPackageDirectory = Join-Path $PSScriptRoot '..\..\staging\1.0\readers'
}
if (-not $TemplateDirectory) {
    $TemplateDirectory = Join-Path $PSScriptRoot '..\..\builder\wayfarer-1.0-template'
}

$destinationRoot = [IO.Path]::GetFullPath($Destination)
if (Test-Path -LiteralPath $destinationRoot) {
    if (@(Get-ChildItem -LiteralPath $destinationRoot -Force).Count -gt 0) {
        throw "Candidate destination is not empty: $destinationRoot"
    }
} else {
    New-Item -ItemType Directory -Path $destinationRoot | Out-Null
}

Copy-Item -Path (Join-Path ([IO.Path]::GetFullPath($TemplateDirectory)) '*') -Destination $destinationRoot -Recurse
foreach ($directory in @('Wikipedia', 'Readers\Windows', 'Readers\Linux', 'Readers\macOS', 'Licenses')) {
    New-Item -ItemType Directory -Path (Join-Path $destinationRoot $directory) -Force | Out-Null
}

$readerRoot = [IO.Path]::GetFullPath($ReaderPackageDirectory)
$windowsZip = Join-Path $readerRoot 'kiwix-desktop_windows_x64_2.5.1.zip'
$linuxReader = Join-Path $readerRoot 'kiwix-desktop_x86_64_2.5.1.appimage'
$macReader = Join-Path $readerRoot 'kiwix-macos_3.16.1.dmg'
foreach ($required in @($windowsZip, $linuxReader, $macReader)) {
    if (-not (Test-Path -LiteralPath $required -PathType Leaf)) {
        throw "Required reader package is missing: $required"
    }
}

Expand-Archive -LiteralPath $windowsZip -DestinationPath (Join-Path $destinationRoot 'Readers\Windows')
Copy-Item -LiteralPath $linuxReader -Destination (Join-Path $destinationRoot 'Readers\Linux\kiwix-desktop.AppImage')
Copy-Item -LiteralPath $macReader -Destination (Join-Path $destinationRoot 'Readers\macOS\kiwix-macos.dmg')
$windowsExecutable = Get-ChildItem -LiteralPath (Join-Path $destinationRoot 'Readers\Windows') -Filter 'kiwix-desktop.exe' -File -Recurse | Select-Object -First 1
if ($null -eq $windowsExecutable) {
    throw 'The Windows package did not contain kiwix-desktop.exe.'
}
New-Item -ItemType File -Path (Join-Path $windowsExecutable.Directory.FullName '.portable') -Force | Out-Null
New-Item -ItemType File -Path (Join-Path $destinationRoot 'Readers\Linux\.portable') -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $readerRoot 'sources') -Destination (Join-Path $destinationRoot 'Licenses\Reader-Source') -Recurse
Copy-Item -LiteralPath (Join-Path $readerRoot 'sources\CC-BY-SA-4.0.txt') -Destination (Join-Path $destinationRoot 'Licenses\CC-BY-SA-4.0.txt')

[pscustomobject]@{
    CandidateRoot = $destinationRoot
    ZimDestination = Join-Path $destinationRoot 'Wikipedia\wikipedia_en_all_wayfarer_1.0.zim'
}
