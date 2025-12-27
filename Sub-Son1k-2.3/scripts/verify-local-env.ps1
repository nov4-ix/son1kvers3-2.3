# 🔍 Script de Verificación de Entorno Local - Super-Son1k-2.2

Write-Host "🔍 Verificando Entorno Local - Super-Son1k-2.2" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$errors = @()
$warnings = @()

# Verificar Node.js
Write-Host "📦 Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $nodeMajor = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($nodeMajor -lt 18) {
        $errors += "Node.js versión $nodeVersion encontrada. Se requiere Node.js 18+"
    } else {
        Write-Host "✅ Node.js $nodeVersion (OK)" -ForegroundColor Green
    }
} catch {
    $errors += "Node.js no está instalado"
}

# Verificar pnpm
Write-Host "📦 Verificando pnpm..." -ForegroundColor Yellow
try {
    $pnpmVersion = pnpm --version
    Write-Host "✅ pnpm $pnpmVersion (OK)" -ForegroundColor Green
} catch {
    $warnings += "pnpm no está instalado. Ejecuta: npm install -g pnpm"
}

# Verificar PostgreSQL
Write-Host "🗄️  Verificando PostgreSQL..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version
    Write-Host "✅ PostgreSQL encontrado: $pgVersion" -ForegroundColor Green
} catch {
    $warnings += "PostgreSQL no encontrado en PATH. Asegúrate de tener acceso a una base de datos PostgreSQL"
}

# Verificar Redis (opcional)
Write-Host "🔴 Verificando Redis..." -ForegroundColor Yellow
try {
    $redisVersion = redis-cli --version
    Write-Host "✅ Redis encontrado: $redisVersion" -ForegroundColor Green
} catch {
    $warnings += "Redis no encontrado. Opcional pero recomendado para desarrollo completo"
}

# Verificar archivo .env del backend
Write-Host "🔐 Verificando configuración del backend..." -ForegroundColor Yellow
if (Test-Path "packages/backend/.env") {
    Write-Host "✅ Archivo .env encontrado" -ForegroundColor Green
    
    # Leer y verificar variables críticas
    $envContent = Get-Content "packages/backend/.env" -Raw
    $requiredVars = @("DATABASE_URL", "JWT_SECRET", "SUPABASE_URL", "BACKEND_SECRET")
    
    foreach ($var in $requiredVars) {
        if ($envContent -match "$var=") {
            Write-Host "   ✅ $var configurado" -ForegroundColor Green
        } else {
            $warnings += "$var no encontrado en .env"
        }
    }
} else {
    $errors += "Archivo packages/backend/.env no encontrado. Copia env.example a packages/backend/.env"
}

# Verificar dependencias instaladas
Write-Host "📦 Verificando dependencias..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules encontrado" -ForegroundColor Green
} else {
    $warnings += "node_modules no encontrado. Ejecuta: pnpm install"
}

# Verificar Prisma Client generado
Write-Host "🗄️  Verificando Prisma Client..." -ForegroundColor Yellow
if (Test-Path "packages/backend/node_modules/.prisma/client") {
    Write-Host "✅ Prisma Client generado" -ForegroundColor Green
} else {
    $warnings += "Prisma Client no generado. Ejecuta: cd packages/backend && pnpm db:generate"
}

# Verificar puertos disponibles
Write-Host "🔌 Verificando puertos..." -ForegroundColor Yellow
$ports = @(3001, 3002, 3003)
foreach ($port in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        $warnings += "Puerto $port está en uso. Puede causar conflictos"
    } else {
        Write-Host "   ✅ Puerto $port disponible" -ForegroundColor Green
    }
}

# Resumen
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "📊 RESUMEN" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "✅ Entorno completamente configurado y listo!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Puedes iniciar los servicios con:" -ForegroundColor Yellow
    Write-Host "   .\scripts\deploy-local.ps1" -ForegroundColor White
    exit 0
} else {
    if ($errors.Count -gt 0) {
        Write-Host "❌ ERRORES CRÍTICOS:" -ForegroundColor Red
        foreach ($error in $errors) {
            Write-Host "   • $error" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host "⚠️  ADVERTENCIAS:" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "   • $warning" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    if ($errors.Count -gt 0) {
        Write-Host "❌ Corrige los errores antes de continuar" -ForegroundColor Red
        exit 1
    } else {
        Write-Host "⚠️  Puedes continuar, pero algunas funcionalidades pueden no estar disponibles" -ForegroundColor Yellow
        exit 0
    }
}

