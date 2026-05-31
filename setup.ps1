# CLAUDE OS — one-command setup for Windows.
# Usage: iex (irm <raw-url>/setup.ps1)
$ErrorActionPreference = "Stop"

$Repo = if ($env:CLAUDE_OS_REPO) { $env:CLAUDE_OS_REPO } else { "https://github.com/us24saude/cockpit.git" }
$Dir  = if ($env:CLAUDE_OS_DIR)  { $env:CLAUDE_OS_DIR  } else { Join-Path $HOME "cockpit" }

Write-Host "✦ CLAUDE OS setup"
Write-Host "  repo: $Repo"
Write-Host "  dir:  $Dir"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "✗ Node.js not found. Install from https://nodejs.org and re-run." -ForegroundColor Red
    exit 1
}
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "✗ git not found. Install from https://git-scm.com and re-run." -ForegroundColor Red
    exit 1
}

if (Test-Path (Join-Path $Dir ".git")) {
    Write-Host "↺ Updating existing checkout…"
    git -C $Dir pull --ff-only
} else {
    Write-Host "⇣ Cloning…"
    git clone $Repo $Dir
}

Set-Location (Join-Path $Dir "dashboard")
Write-Host "⇣ Installing dependencies…"
npm install --legacy-peer-deps

Write-Host "▶ Starting dev server on http://localhost:3005"
npm run dev
