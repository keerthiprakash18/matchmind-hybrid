# MatchMind Hybrid AI: change retired default cloud model to a supported model.
# Run this script from the existing MatchMind project root in PowerShell.
# It does not touch .env, Firebase settings, Git, or any other project.
$ErrorActionPreference = 'Stop'
$target = Join-Path (Get-Location).Path 'src\firebaseAI.ts'
if (-not (Test-Path -LiteralPath $target)) {
    Write-Error 'src\firebaseAI.ts was not found. Open PowerShell inside the MatchMind project folder and retry.'
    exit 1
}
$original = [System.IO.File]::ReadAllText($target)
$old = 'const model = getGenerativeModel(ai, { mode: inferenceMode });'
$new = "const model = getGenerativeModel(ai, { mode: inferenceMode, inCloudParams: { model: 'gemini-3.5-flash-lite' } });"
if ($original.Contains($new)) {
    Write-Host 'Model fix already applied. No source changes needed.'
} elseif ($original.Contains($old)) {
    $backup = "$target.bak-before-model-fix"
    if (-not (Test-Path -LiteralPath $backup)) {
        [System.IO.File]::Copy($target, $backup)
    }
    $updated = $original.Replace($old, $new)
    [System.IO.File]::WriteAllText($target, $updated, (New-Object System.Text.UTF8Encoding($false)))
    Write-Host 'Updated cloud model to gemini-3.5-flash-lite.'
    Write-Host 'Saved backup: src\firebaseAI.ts.bak-before-model-fix'
} else {
    Write-Error 'The expected model initialization was not found. No changes made.'
    exit 1
}
Write-Host 'Running existing automated tests...'
& npm test
if ($LASTEXITCODE -ne 0) { Write-Error 'Tests failed. Do not deploy.'; exit 1 }
Write-Host 'Building for validation...'
& npm run build
if ($LASTEXITCODE -ne 0) { Write-Error 'Build failed. Do not deploy.'; exit 1 }
Write-Host 'PASS: Model fix applied; tests and build succeeded. Refresh the running Vite page and click Generate.'
