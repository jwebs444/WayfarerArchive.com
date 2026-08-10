[CmdletBinding()]
param(
    [string]$PackageDirectory = (Join-Path $PSScriptRoot '..\packages\0.7'),
    [string]$Bucket = 'wayfarers-archive-releases',
    [string]$Prefix = 'releases/0.7',
    [Parameter(Mandatory = $true)]
    [string]$NodeExecutable,
    [Parameter(Mandatory = $true)]
    [string]$WranglerScript
)

$ErrorActionPreference = 'Stop'
$packageRoot = (Resolve-Path -LiteralPath $PackageDirectory).Path
$node = (Resolve-Path -LiteralPath $NodeExecutable).Path
$wrangler = (Resolve-Path -LiteralPath $WranglerScript).Path

if ([string]::IsNullOrWhiteSpace($env:CLOUDFLARE_API_TOKEN)) {
    throw 'CLOUDFLARE_API_TOKEN is not configured. No upload was attempted.'
}

foreach ($file in Get-ChildItem -LiteralPath $packageRoot -File -Recurse | Sort-Object FullName) {
    $relative = $file.FullName.Substring($packageRoot.Length + 1).Replace('\', '/')
    $key = "$Bucket/$($Prefix.Trim('/'))/$relative"
    Write-Host "Uploading $relative"
    & $node $wrangler r2 object put $key --file $file.FullName --content-type 'application/octet-stream' --remote
    if ($LASTEXITCODE -ne 0) { throw "R2 upload failed for $relative" }
}

Write-Host 'Upload complete. Keep releaseStatus staged until every public URL and SHA-256 is independently verified.'
