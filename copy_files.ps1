$source = "C:\Users\pc\.gemini\antigravity\scratch"
$dest = "C:\Users\pc\Desktop\rentoral"

# Copy all files except node_modules and this script
Get-ChildItem -Path $source -Recurse -File | Where-Object {
    $_.FullName -notmatch 'node_modules' -and $_.FullName -notmatch '\.git\\' -and $_.Name -ne 'copy_files.ps1'
} | ForEach-Object {
    $relativePath = $_.FullName.Substring($source.Length)
    $destPath = Join-Path $dest $relativePath
    $destDir = Split-Path $destPath -Parent
    if (!(Test-Path $destDir)) {
        New-Item -Path $destDir -ItemType Directory -Force | Out-Null
    }
    Copy-Item -Path $_.FullName -Destination $destPath -Force
    Write-Host "Copied: $relativePath"
}
Write-Host "Done! All files copied."
