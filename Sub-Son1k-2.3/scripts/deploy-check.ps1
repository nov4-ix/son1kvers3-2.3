# 🚀 Deploy Check Script
# Verifica que todo esté listo para deploy

Write-Host "🔍 Verificando preparación para deploy...`n" -ForegroundColor Cyan

$errors = 0
$warnings = 0

# 1. Verificar que estamos en la raíz del proyecto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json. Ejecuta este script desde la raíz del proyecto." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Estructura del proyecto correcta`n" -ForegroundColor Green

# 2. Verificar dependencias
Write-Host "📦 Verificando dependencias..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules encontrado" -ForegroundColor Green
} else {
    Write-Host "⚠️  node_modules no encontrado. Ejecuta 'pnpm install'" -ForegroundColor Yellow
    $warnings++
}

# 3. Verificar variables de entorno
Write-Host "`n🔐 Verificando variables de entorno..." -ForegroundColor Yellow

$envFiles = @(
    "apps/the-generator/.env.local",
    "apps/ghost-studio/.env.local",
    "apps/web-classic/.env.local",
    "packages/backend/.env"
)

foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        Write-Host "✅ $envFile encontrado" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $envFile no encontrado (opcional para desarrollo local)" -ForegroundColor Yellow
        $warnings++
    }
}

# 4. Verificar builds
Write-Host "`n🔨 Verificando builds..." -ForegroundColor Yellow

# Backend
Write-Host "Verificando backend..." -ForegroundColor Gray
try {
    Push-Location "packages/backend"
    $backendBuild = pnpm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend build exitoso" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend build falló" -ForegroundColor Red
        $errors++
    }
} catch {
    Write-Host "❌ Error verificando backend build: $_" -ForegroundColor Red
    $errors++
} finally {
    Pop-Location
}

# The Generator
Write-Host "Verificando the-generator..." -ForegroundColor Gray
try {
    Push-Location "apps/the-generator"
    $generatorBuild = pnpm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ The Generator build exitoso" -ForegroundColor Green
    } else {
        Write-Host "❌ The Generator build falló" -ForegroundColor Red
        $errors++
    }
} catch {
    Write-Host "❌ Error verificando the-generator build: $_" -ForegroundColor Red
    $errors++
} finally {
    Pop-Location
}

# Ghost Studio
Write-Host "Verificando ghost-studio..." -ForegroundColor Gray
try {
    Push-Location "apps/ghost-studio"
    $ghostBuild = pnpm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Ghost Studio build exitoso" -ForegroundColor Green
    } else {
        Write-Host "❌ Ghost Studio build falló" -ForegroundColor Red
        $errors++
    }
} catch {
    Write-Host "❌ Error verificando ghost-studio build: $_" -ForegroundColor Red
    $errors++
} finally {
    Pop-Location
}

# 5. Verificar TypeScript
Write-Host "`n📝 Verificando TypeScript..." -ForegroundColor Yellow

# The Generator
Write-Host "Verificando the-generator type-check..." -ForegroundColor Gray
try {
    Push-Location "apps/the-generator"
    $generatorTypeCheck = pnpm run type-check 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ The Generator type-check exitoso" -ForegroundColor Green
    } else {
        Write-Host "⚠️  The Generator type-check tiene errores" -ForegroundColor Yellow
        $warnings++
    }
} catch {
    Write-Host "⚠️  Error verificando the-generator type-check: $_" -ForegroundColor Yellow
    $warnings++
} finally {
    Pop-Location
}

# 6. Verificar configuraciones de deploy
Write-Host "`n🚀 Verificando configuraciones de deploy..." -ForegroundColor Yellow

# Vercel
if (Test-Path "vercel.json") {
    Write-Host "✅ vercel.json encontrado" -ForegroundColor Green
} else {
    Write-Host "⚠️  vercel.json no encontrado" -ForegroundColor Yellow
    $warnings++
}

# Railway
if (Test-Path "railway.toml") {
    Write-Host "✅ railway.toml encontrado" -ForegroundColor Green
} else {
    Write-Host "⚠️  railway.toml no encontrado" -ForegroundColor Yellow
    $warnings++
}

# 7. Resumen
Write-Host "`n" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host "📊 RESUMEN" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan

if ($errors -eq 0) {
    Write-Host "✅ No se encontraron errores críticos" -ForegroundColor Green
} else {
    Write-Host "❌ Se encontraron $errors error(es) crítico(s)" -ForegroundColor Red
}

if ($warnings -gt 0) {
    Write-Host "⚠️  Se encontraron $warnings advertencia(s)" -ForegroundColor Yellow
}

Write-Host "`n" -ForegroundColor Cyan

if ($errors -eq 0) {
    Write-Host "✅ Listo para deploy!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Corrige los errores antes de deployar" -ForegroundColor Red
    exit 1
}

