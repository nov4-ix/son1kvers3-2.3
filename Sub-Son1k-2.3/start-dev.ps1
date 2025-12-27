$root = $PSScriptRoot
Write-Host "🚀 Iniciando Entorno de Desarrollo Super-Son1k..." -ForegroundColor Cyan
Write-Host "📂 Directorio Raíz del Proyecto: $root" -ForegroundColor Gray

if (!(Test-Path "$root\packages\backend")) {
    Write-Host "❌ Error: No se encuentra la carpeta packages\backend en $root" -ForegroundColor Red
    Write-Host "Asegúrate de ejecutar este script desde la carpeta correcta (Sub-Son1k-2.3\Sub-Son1k-2.3)" -ForegroundColor Red
    exit
}

# Start Backend
Write-Host "📦 Arrancando Backend (Puerto 3001)..." -ForegroundColor Green
Start-Process powershell -WorkingDirectory "$root\packages\backend" -ArgumentList "-NoExit", "-Command", "pnpm dev"

# Wait a moment for backend to initialize
Start-Sleep -Seconds 2

# Start Frontend
Write-Host "🎨 Arrancando Frontend (The Generator - Puerto 3002)..." -ForegroundColor Magenta
Start-Process powershell -WorkingDirectory "$root\apps\the-generator-nextjs" -ArgumentList "-NoExit", "-Command", "pnpm dev"

Write-Host "✅ Servicios iniciados en ventanas separadas." -ForegroundColor Yellow
Write-Host "👉 Backend: http://localhost:3001"
Write-Host "👉 Frontend: http://localhost:3002"
