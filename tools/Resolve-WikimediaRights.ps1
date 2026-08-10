[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$SourceManifest,

    [string]$OutputDirectory = (Join-Path $PSScriptRoot '..\metadata')
)

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$sourcePath = (Resolve-Path -LiteralPath $SourceManifest).Path
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
$outputPath = [System.IO.Path]::GetFullPath($OutputDirectory)

function ConvertFrom-HtmlFragment {
    param([AllowNull()][string]$Value)
    if ([string]::IsNullOrWhiteSpace($Value)) { return '' }
    $withoutTags = [regex]::Replace($Value, '<[^>]+>', ' ')
    $decoded = [System.Net.WebUtility]::HtmlDecode($withoutTags)
    return ([regex]::Replace($decoded, '\s+', ' ')).Trim()
}

function Get-MetadataValue {
    param($Metadata, [string]$Name)
    $property = $Metadata.PSObject.Properties[$Name]
    if ($null -eq $property -or $null -eq $property.Value) { return '' }
    return ConvertFrom-HtmlFragment ([string]$property.Value.value)
}

function Get-NormalizedLicense {
    param([string]$License)
    $value = ([regex]::Replace($License.Trim(), '\s+', ' '))
    $value = $value -replace '^CC-BY-SA-', 'CC BY-SA '
    $value = $value -replace '^CC-BY-', 'CC BY '
    if ($value -eq 'PD') { return 'Public domain' }
    return $value
}

function Test-CommercialFreeLicense {
    param([string]$License)
    if ($License -match '(?i)noncommercial|\bNC\b|no.?deriv|\bND\b|IGO|OGL|GFDL|Attribution only|Copyrighted') { return $false }
    return $License -match '^(Public domain|CC0(?: 1\.0)?|CC BY (?:2\.0|2\.5|3\.0|4\.0)|CC BY-SA (?:2\.0|2\.5|3\.0|4\.0))$'
}

$inputRows = @(Import-Csv -LiteralPath $sourcePath)
if ($inputRows.Count -eq 0) { throw 'The source image manifest is empty.' }

$records = [System.Collections.Generic.List[object]]::new()
$groups = $inputRows | Group-Object {
    if ($_.DescriptionUrl -match '^https://en\.wikipedia\.org/') {
        'https://en.wikipedia.org/w/api.php'
    } else {
        'https://commons.wikimedia.org/w/api.php'
    }
}

foreach ($group in $groups) {
    $api = $group.Name
    $rows = @($group.Group)
    for ($offset = 0; $offset -lt $rows.Count; $offset += 20) {
        $last = [Math]::Min($offset + 19, $rows.Count - 1)
        $batch = @($rows[$offset..$last])
        $body = @{
            action = 'query'
            format = 'json'
            formatversion = '2'
            redirects = '1'
            prop = 'imageinfo'
            iiprop = 'url|sha1|extmetadata'
            titles = ($batch.FileTitle -join '|')
        }
        $headers = @{ 'User-Agent' = 'WayfarersArchiveRightsAudit/0.7 (public release verification)' }
        $tempResponse = New-TemporaryFile
        try {
            & curl.exe --fail --silent --show-error --retry 3 --request POST `
                --user-agent $headers['User-Agent'] `
                --data-urlencode "action=$($body.action)" `
                --data-urlencode "format=$($body.format)" `
                --data-urlencode "formatversion=$($body.formatversion)" `
                --data-urlencode "redirects=$($body.redirects)" `
                --data-urlencode "prop=$($body.prop)" `
                --data-urlencode "iiprop=$($body.iiprop)" `
                --data-urlencode "titles=$($body.titles)" `
                --output $tempResponse.FullName $api
            if ($LASTEXITCODE -ne 0) { throw "Wikimedia API request failed with curl exit code $LASTEXITCODE" }
            $response = Get-Content -LiteralPath $tempResponse.FullName -Raw -Encoding utf8 | ConvertFrom-Json
        } finally {
            Remove-Item -LiteralPath $tempResponse.FullName -Force -ErrorAction SilentlyContinue
        }
        $pagesByTitle = @{}
        foreach ($page in @($response.query.pages)) { $pagesByTitle[$page.title] = $page }

        foreach ($row in $batch) {
            $page = $pagesByTitle[$row.FileTitle]
            if ($null -eq $page -and $null -ne $response.query.normalized) {
                $normalized = @($response.query.normalized | Where-Object from -eq $row.FileTitle | Select-Object -First 1)
                if ($normalized.Count -gt 0) { $page = $pagesByTitle[$normalized[0].to] }
            }

            $ii = if ($null -ne $page) { @($page.imageinfo)[0] } else { $null }
            $metadata = if ($null -ne $ii) { $ii.extmetadata } else { $null }
            $license = if ($null -ne $metadata) { Get-NormalizedLicense (Get-MetadataValue $metadata 'LicenseShortName') } else { '' }
            $artist = if ($null -ne $metadata) { Get-MetadataValue $metadata 'Artist' } else { '' }
            if ([string]::IsNullOrWhiteSpace($artist) -and $null -ne $metadata) {
                $artist = Get-MetadataValue $metadata 'Credit'
            }
            $remoteSha1 = if ($null -ne $ii) { [string]$ii.sha1 } else { '' }
            $hashMatches = -not [string]::IsNullOrWhiteSpace($remoteSha1) -and $remoteSha1 -eq $row.WikimediaSha1
            $licenseAllowed = Test-CommercialFreeLicense $license
            $creditComplete = $license -in @('Public domain', 'CC0', 'CC0 1.0') -or -not [string]::IsNullOrWhiteSpace($artist)
            $decision = if ($null -eq $ii) {
                'EXCLUDE_MISSING_REMOTE_RECORD'
            } elseif (-not $hashMatches) {
                'EXCLUDE_HASH_CHANGED'
            } elseif (-not $licenseAllowed) {
                'EXCLUDE_LICENSE_REVIEW'
            } elseif (-not $creditComplete) {
                'EXCLUDE_MISSING_CREDIT'
            } else {
                'INCLUDE'
            }

            $records.Add([pscustomobject]@{
                Article = $row.Article
                Domain = $row.Domain
                FileTitle = $row.FileTitle
                License = $license
                Artist = $artist
                DescriptionUrl = $row.DescriptionUrl
                SourceUrl = $row.SourceUrl
                RemoteSha1 = $remoteSha1
                ManifestSha1 = $row.WikimediaSha1
                CachePath = $row.CachePath
                Bytes = [int64]$row.Bytes
                VerifiedUtc = [DateTime]::UtcNow.ToString('o')
                Decision = $decision
            })
        }
    }
}

$csvPath = Join-Path $outputPath 'WIKIMEDIA_MEDIA_ATTRIBUTION.csv'
$records | Sort-Object FileTitle | Export-Csv -LiteralPath $csvPath -NoTypeInformation -Encoding utf8

$summary = [ordered]@{
    schemaVersion = 1
    verifiedUtc = [DateTime]::UtcNow.ToString('o')
    sourceManifest = $sourcePath
    total = $records.Count
    included = @($records | Where-Object Decision -eq 'INCLUDE').Count
    excluded = @($records | Where-Object Decision -ne 'INCLUDE').Count
    decisions = [ordered]@{}
}
foreach ($decisionGroup in ($records | Group-Object Decision | Sort-Object Name)) {
    $summary.decisions[$decisionGroup.Name] = $decisionGroup.Count
}
$jsonPath = Join-Path $outputPath 'WIKIMEDIA_RIGHTS_VERIFICATION.json'
$summary | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $jsonPath -Encoding utf8

$summary | ConvertTo-Json -Depth 6
if ($summary.included -eq 0) { throw 'No Wikimedia media passed the public release gate.' }
