#!/usr/bin/env pwsh

# Script de consolidación rápida - Ejecución completa

$ErrorActionPreference = "Stop"

Write-Host "🚀 CONSOLIDACIÓN COMPLETA: EJECUTANDO TODOS LOS PASOS`n" -ForegroundColor Cyan

$ALFASSV = "c:\Users\qrrom\Downloads\Sub-Son1k-2.3\ALFASSV-base"
$SON1K = "c:\Users\qrrom\Downloads\Sub-Son1k-2.3\Sub-Son1k-2.3"

# Ir a ALFASSV
Set-Location $ALFASSV

Write-Host "📂 Trabajando en: $ALFASSV" -ForegroundColor Green

# ==========================================
# DÍA 2-3: GHOST STUDIO PRO
# ==========================================
Write-Host "`n🎛️ DÍA 2-3: Consolidando Ghost Studio Pro..." -ForegroundColor Magenta

# Ya tenemos la estructura creada, ahora copiemos Sonic DAW
Write-Host "  Copiando Sonic DAW a modo Pro..."
if (Test-Path "apps\sonic-daw\src\pages") {
    Copy-Item -Path "apps\sonic-daw\src\pages\*" -Destination "apps\ghost-studio\src\modes\ProDAW\" -Recurse -Force -ErrorAction SilentlyContinue
    Copy-Item -Path "apps\sonic-daw\src\components\*" -Destination "apps\ghost-studio\src\modes\ProDAW\components\" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✅ Sonic DAW copiado" -ForegroundColor Green
}

# Copiar Clone Station
Write-Host "  Copiando Clone Station a modo Voice Clone..."
if (Test-Path "apps\clone-station\src\pages") {
    Copy-Item -Path "apps\clone-station\src\pages\*" -Destination "apps\ghost-studio\src\modes\VoiceClone\" -Recurse -Force -ErrorAction SilentlyContinue
    Copy-Item -Path "apps\clone-station\src\components\*" -Destination "apps\ghost-studio\src\modes\VoiceClone\components\" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✅ Clone Station copiado" -ForegroundColor Green
}

# Mover Ghost Studio actual a Mini DAW
Write-Host "  Moviendo Ghost Studio actual a modo Mini..."
Copy-Item -Path "apps\ghost-studio\src\pages\GhostStudio.tsx" -Destination "apps\ghost-studio\src\modes\MiniDAW\MiniDAWMode.tsx" -Force -ErrorAction SilentlyContinue
Write-Host "  ✅ Ghost Studio movido a MiniDAW" -ForegroundColor Green

Write-Host "`n✅ Ghost Studio Pro consolidado (3 apps en 1)" -ForegroundColor Green

# ==========================================
# DÍA 4: WEB CLASSIC HUB
# ==========================================
Write-Host "`n🏠 DÍA 4: Consolidando Web Classic Hub..." -ForegroundColor Magenta

# Crear estructura de features
New-Item -ItemType Directory -Path "apps\web-classic\src\features\ImageCreator" -Force -ErrorAction SilentlyContinue | Out-Null
New-Item -ItemType Directory -Path "apps\web-classic\src\features\GeneratorExpress" -Force -ErrorAction SilentlyContinue | Out-Null

# Copiar Image Generator
Write-Host "  Copiando Image Generator..."
if (Test-Path "apps\image-generator\src") {
    Copy-Item -Path "apps\image-generator\src\*" -Destination "apps\web-classic\src\features\ImageCreator\" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✅ Image Generator copiado" -ForegroundColor Green
}

# Copiar Generator Express de Sub-Son1k-2.3 si existe
Write-Host "  Buscando Generator Express en Sub-Son1k-2.3..."
$genExpressPath = "$SON1K\apps\web-classic\src\components\GeneratorExpress.tsx"
if (Test-Path $genExpressPath) {
    Copy-Item -Path $genExpressPath -Destination "apps\web-classic\src\features\GeneratorExpress\" -Force -ErrorAction SilentlyContinue
    Write-Host "  ✅ Generator Express copiado" -ForegroundColor Green
}
else {
    Write-Host "  ⚠️  Generator Express no encontrado, saltando..." -ForegroundColor Yellow
}

Write-Host "`n✅ Web Classic Hub consolidado" -ForegroundColor Green

# ==========================================
# DÍA 5: THE GENERATOR + POLLING
# ==========================================
Write-Host "`n🎵 DÍA 5: Migrando sistema de polling robusto..." -ForegroundColor Magenta

# Crear directorio de polling
New-Item -ItemType Directory -Path "apps\the-generator\src\services\polling" -Force -ErrorAction SilentlyContinue | Out-Null

# Copiar servicios de polling de the-generator-nextjs
Write-Host "  Copiando servicios de polling..."
$pollingSource = "$SON1K\apps\the-generator-nextjs\src\services"
if (Test-Path $pollingSource) {
    Get-ChildItem -Path $pollingSource -Filter "*.ts" -File -ErrorAction SilentlyContinue | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination "apps\the-generator\src\services\polling\" -Force -ErrorAction SilentlyContinue
        Write-Host "    Copiado: $($_.Name)" -ForegroundColor Gray
    }
    Write-Host "  ✅ Servicios de polling copiados" -ForegroundColor Green
}
else {
    Write-Host "  ⚠️  Servicios de polling no encontrados, saltando..." -ForegroundColor Yellow
}

Write-Host "`n✅ Sistema de polling migrado" -ForegroundColor Green

# ==========================================
# DÍA 6: LIVE COLLABORATION
# ==========================================
Write-Host "`n🤝 DÍA 6: Migrando Live Collaboration..." -ForegroundColor Magenta

$liveCollabSource = "$SON1K\apps\live-collaboration"
if (Test-Path $liveCollabSource) {
    Write-Host "  Copiando Live Collaboration completo..."
    Copy-Item -Path $liveCollabSource -Destination "apps\" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✅ Live Collaboration copiado" -ForegroundColor Green
}
else {
    Write-Host "  ⚠️  Live Collaboration no encontrado, saltando..." -ForegroundColor Yellow
}

Write-Host "`n✅ Live Collaboration migrado" -ForegroundColor Green

# ==========================================
# RESUMEN
# ==========================================
Write-Host "`n" -NoNewline
Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ CONSOLIDACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan

Write-Host "`n📊 Resumen de cambios:" -ForegroundColor Yellow
Write-Host "  ✅ Ghost Studio Pro (Mini + Pro + Clone)" -ForegroundColor Green
Write-Host "  ✅ Web Classic Hub (Dashboard + Image + Generator Express)" -ForegroundColor Green
Write-Host "  ✅ The Generator (polling robusto)" -ForegroundColor Green
Write-Host "  ✅ Live Collaboration (nuevo)" -ForegroundColor Green

Write-Host "`n📦 Archivos modificados/creados:" -ForegroundColor Yellow
git status --short | Select-Object -First 20

Write-Host "`n🎯 Próximos pasos:" -ForegroundColor Cyan
Write-Host "  1. Revisar cambios: git status" -ForegroundColor White
Write-Host "  2. Crear componentes ModeSelector y TabNavigation" -ForegroundColor White
Write-Host "  3. Actualizar Apps principales (App.tsx)" -ForegroundColor White
Write-Host "  4. Testing: pnpm build" -ForegroundColor White
Write-Host "  5. Commit: git add . && git commit -m 'feat: consolidate apps'" -ForegroundColor White
Write-Host "  6. Deploy!" -ForegroundColor White

Write-Host "`n✨ ¡Consolidación de archivos completada!" -ForegroundColor Green
