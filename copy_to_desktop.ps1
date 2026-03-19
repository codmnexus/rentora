$source = 'C:\Users\pc\.gemini\antigravity\scratch'
$dest = 'C:\Users\pc\Desktop\rentoral'

Get-ChildItem -Path $source -Recurse -File | Where-Object {
    $_.FullName -notmatch 'node_modules'
} | ForEach-Object {
    $rel = $_.FullName.Substring($source.Length)
    $dp = Join-Path $dest $rel
    $dd = Split-Path $dp -Parent
    if (!(Test-Path $dd)) {
        New-Item -Path $dd -ItemType Directory -Force | Out-Null
    }
    Copy-Item -Path $_.FullName -Destination $dp -Force
    Write-Host "Copied: $rel"
}
Write-Host 'Done! All files copied.'
