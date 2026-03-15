$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir

Set-Location $ProjectDir

Write-Host "Building Prelegal Docker image..."
docker build -t prelegal .

Write-Host "Stopping any existing container..."
docker rm -f prelegal-app 2>$null

Write-Host "Starting Prelegal..."
docker run -d `
  --name prelegal-app `
  -p 8000:8000 `
  --env-file .env `
  prelegal

Write-Host ""
Write-Host "Prelegal is running at http://localhost:8000"
