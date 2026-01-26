# run-backend.ps1
param(
  [string]$RootPath = "C:\Users\qrrom\Downloads\Sub-Son1k-2.3\Sub-Son1k-2.3"
)

$BackendPath = Join-Path $RootPath "packages\backend"

Write-Host "Installing dependencies..." -ForegroundColor Green
Push-Location $BackendPath
pnpm i
Write-Host "Starting backend..."
# Arranca en background y redirige logs
$logFile = Join-Path $RootPath "logs\backend.log"
New-Item -ItemType Directory -Force -Path (Join-Path $RootPath "logs") | Out-Null
Start-Process -FilePath "pnpm" -ArgumentList "dev" -WorkingDirectory $BackendPath `
  -NoNewWindow -RedirectStandardOutput $logFile -RedirectStandardError $logFile -PassThru | Out-Null
$proc = Get-Process -Id ${$.LastErrorLine} -ErrorAction SilentlyContinue
Write-Host "Backend process started (log: $logFile)" -ForegroundColor Green
Pop-Location
