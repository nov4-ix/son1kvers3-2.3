# SON1KVERS3 v2.3 - Script de Desarrollo Rápido
# PowerShell Script para Windows

Write-Host "🚀 SON1KVERS3 v2.3 - Inicializando Ecosistema" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "🔍 Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Node.js no encontrado. Por favor instala Node.js 18+" -ForegroundColor Red
    exit 1
}

# Verificar pnpm
Write-Host "🔍 Verificando pnpm..." -ForegroundColor Yellow
try {
    $pnpmVersion = pnpm --version
    Write-Host "✅ pnpm instalado: $pnpmVersion" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  pnpm no encontrado. Instalando..." -ForegroundColor Yellow
    npm install -g pnpm
}

# Verificar Python
Write-Host "🔍 Verificando Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version
    Write-Host "✅ Python instalado: $pythonVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Python no encontrado. Por favor instala Python 3.8+" -ForegroundColor Red
    Write-Host "   Descarga: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📦 Instalando dependencias..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Instalar dependencias frontend
Write-Host ""
Write-Host "📦 Instalando dependencias frontend (pnpm)..." -ForegroundColor Yellow
pnpm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error instalando dependencias frontend" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencias frontend instaladas" -ForegroundColor Green

# Instalar dependencias backend
Write-Host ""
Write-Host "🐍 Instalando dependencias backend (pip)..." -ForegroundColor Yellow
Push-Location backend
pip install -r requirements.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error instalando dependencias backend" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host "✅ Dependencias backend instaladas" -ForegroundColor Green

Write-Host ""
Write-Host "⚙️  Configurando entorno..." -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

# Verificar .env
if (!(Test-Path ".env")) {
    Write-Host "⚠️  Archivo .env no encontrado" -ForegroundColor Yellow
    if (Test-Path "env.example") {
        Write-Host "📋 Copiando env.example a .env..." -ForegroundColor Yellow
        Copy-Item "env.example" ".env"
        Write-Host "✅ Archivo .env creado" -ForegroundColor Green
        Write-Host "⚠️  IMPORTANTE: Edita .env con tus credenciales" -ForegroundColor Yellow
    }
}

# Verificar backend/.env o env.template
Push-Location backend
if (!(Test-Path ".env")) {
    if (Test-Path "env.template") {
        Write-Host "📋 Copiando backend/env.template a backend/.env..." -ForegroundColor Yellow
        Copy-Item "env.template" ".env"
        Write-Host "✅ Archivo backend/.env creado" -ForegroundColor Green
    }
}
Pop-Location

Write-Host ""
Write-Host "✅ Setup completado!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Próximos pasos:" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Edita los archivos .env con tus credenciales:" -ForegroundColor White
Write-Host "   - .env (frontend)" -ForegroundColor Gray
Write-Host "   - backend/.env (backend)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Inicia el desarrollo:" -ForegroundColor White
Write-Host "   pnpm dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. En otra terminal, inicia el backend:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   uvicorn main:app --reload" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Documentación:" -ForegroundColor Cyan
Write-Host "   - INICIO_RAPIDO.md" -ForegroundColor Gray
Write-Host "   - ARQUITECTURA_INTEGRACION.md" -ForegroundColor Gray
Write-Host "   - REPORTE_EJECUTIVO_INTEGRACION.md" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 URLs del ecosistema (después de iniciar):" -ForegroundColor Cyan
Write-Host "   - Backend API: http://localhost:8000" -ForegroundColor Gray
Write-Host "   - API Docs: http://localhost:8000/docs" -ForegroundColor Gray
Write-Host "   - Web Classic: http://localhost:3000" -ForegroundColor Gray
Write-Host "   - The Generator: http://localhost:3001" -ForegroundColor Gray
Write-Host "   - Ghost Studio: http://localhost:3003" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 ¡Listo para desarrollar!" -ForegroundColor Green
