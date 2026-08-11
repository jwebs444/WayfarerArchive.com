[CmdletBinding()]
param(
    [string]$DestinationDirectory
)

$ErrorActionPreference = 'Stop'
if (-not $DestinationDirectory) {
    $DestinationDirectory = Join-Path $PSScriptRoot '..\..\staging\1.0\readers'
}
$destination = [IO.Path]::GetFullPath($DestinationDirectory)
New-Item -ItemType Directory -Path $destination -Force | Out-Null

$packages = @(
    @{
        Name = 'kiwix-desktop_windows_x64_2.5.1.zip'
        Url = 'https://download.kiwix.org/release/kiwix-desktop/kiwix-desktop_windows_x64_2.5.1.zip'
        Md5 = '0D1BE45F654072C5133198074845E415'
    },
    @{
        Name = 'kiwix-desktop_x86_64_2.5.1.appimage'
        Url = 'https://download.kiwix.org/release/kiwix-desktop/kiwix-desktop_x86_64_2.5.1.appimage'
        Md5 = '3CF59F67451B802836ED903593709C26'
    },
    @{
        Name = 'kiwix-macos_3.16.1.dmg'
        Url = 'https://download.kiwix.org/release/kiwix-macos/kiwix-macos_3.16.1.dmg'
        Md5 = '3E39C6FB66AF94DA6E7E46880AF1A9E4'
    }
)

$manifest = @()
foreach ($package in $packages) {
    $final = Join-Path $destination $package.Name
    $partial = "$final.partial"
    if (-not (Test-Path -LiteralPath $final)) {
        & curl.exe --fail --location --continue-at - --output $partial $package.Url
        if ($LASTEXITCODE -ne 0) {
            throw "Reader download failed: $($package.Name)"
        }
        $actualMd5 = (Get-FileHash -LiteralPath $partial -Algorithm MD5).Hash
        if ($actualMd5 -ne $package.Md5) {
            throw "Published MD5 check failed: $($package.Name)"
        }
        Move-Item -LiteralPath $partial -Destination $final
    }
    if ((Get-FileHash -LiteralPath $final -Algorithm MD5).Hash -ne $package.Md5) {
        throw "Existing reader package failed its published MD5: $($package.Name)"
    }
    $item = Get-Item -LiteralPath $final
    $manifest += [pscustomobject][ordered]@{
        name = $item.Name
        bytes = $item.Length
        upstreamMd5 = $package.Md5.ToLowerInvariant()
        sha256 = (Get-FileHash -LiteralPath $final -Algorithm SHA256).Hash.ToLowerInvariant()
        source = $package.Url
    }
}

$manifest | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $destination 'reader-manifest.json') -Encoding UTF8
$manifest | Format-Table name, bytes, sha256

$sourceDirectory = Join-Path $destination 'sources'
New-Item -ItemType Directory -Path $sourceDirectory -Force | Out-Null
$sources = @(
    @{
        Name = 'kiwix-desktop-2.5.1.tar.gz'
        Url = 'https://download.kiwix.org/release/kiwix-desktop/kiwix-desktop-2.5.1.tar.gz'
        Algorithm = 'MD5'
        Hash = '5157AF4E767F7264525E5CA3D7349ABC'
    },
    @{
        Name = 'kiwix-apple-3.16.1-source.tar.gz'
        Url = 'https://github.com/kiwix/kiwix-apple/archive/f4e98702acc14818cb34b130ea3ae5bd8eca2797.tar.gz'
        Algorithm = 'SHA256'
        Hash = '66181174E5E9B6E1E0A7F58E676E0EED00DEB5694A8127DA35AEB0E5CD5D6BB8'
    },
    @{
        Name = 'GPL-3.0.txt'
        Url = 'https://raw.githubusercontent.com/kiwix/kiwix-desktop/2.5.1/LICENSE'
        Algorithm = 'SHA256'
        Hash = '8CEB4B9EE5ADEDDE47B31E975C1D90C73AD27B6B165A1DCD80C7C545EB65B903'
    },
    @{
        Name = 'CC-BY-SA-4.0.txt'
        Url = 'https://creativecommons.org/licenses/by-sa/4.0/legalcode.txt'
        Algorithm = 'SHA256'
        Hash = '28A9529C7D0BB4DC51F4BF5C116A3D16EF247A052F7591466768DDF563FD1CF5'
    }
)
foreach ($source in $sources) {
    $path = Join-Path $sourceDirectory $source.Name
    if (-not (Test-Path -LiteralPath $path)) {
        & curl.exe --fail --location --output "$path.partial" $source.Url
        if ($LASTEXITCODE -ne 0) { throw "Source download failed: $($source.Name)" }
        if ((Get-FileHash -LiteralPath "$path.partial" -Algorithm $source.Algorithm).Hash -ne $source.Hash) {
            throw "Source checksum failed: $($source.Name)"
        }
        Move-Item -LiteralPath "$path.partial" -Destination $path
    }
    if ((Get-FileHash -LiteralPath $path -Algorithm $source.Algorithm).Hash -ne $source.Hash) {
        throw "Existing source checksum failed: $($source.Name)"
    }
}
