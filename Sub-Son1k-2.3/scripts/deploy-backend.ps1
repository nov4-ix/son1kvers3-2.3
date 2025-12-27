# 🚀 Deploy Backend Script
# Deploy del backend a Railway/Render

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("railway", "render")]
    [string]$Platform = "railway",
    
    [Parameter(Mandatory=$false)]
    [string]$Environment = "production"
)

Write-Host "🚀 Desplegando backend a $Platform...`n" -ForegroundColor Cyan

# 1. Verificar que estamos en la raíz del proyecto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json. Ejecuta este script desde la raíz del proyecto." -ForegroundColor Red
    exit 1
}

# 2. Verificar que el backend existe
if (-not (Test-Path "packages/backend")) {
    Write-Host "❌ Error: No se encontró packages/backend" -ForegroundColor Red
    exit 1
}

# 3. Verificar build
Write-Host "🔨 Verificando build del backend...`n" -ForegroundColor Yellow
Push-Location "packages/backend"

try {
    pnpm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build falló. Corrige los errores antes de deployar." -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Build exitoso`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en build: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}

# 4. Verificar variables de entorno
Write-Host "🔐 Verificando variables de entorno...`n" -ForegroundColor Yellow

$requiredEnvVars = @(
    "DATABASE_URL",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "BACKEND_SECRET"
)

$missingVars = @()

foreach ($var in $requiredEnvVars) {
    if (-not $env:$var) {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host "⚠️  Variables de entorno faltantes:" -ForegroundColor Yellow
    foreach ($var in $missingVars) {
        Write-Host "  - $var" -ForegroundColor Yellow
    }
    Write-Host "`nAsegúrate de configurarlas en $Platform antes de deployar.`n" -ForegroundColor Yellow
} else {
    Write-Host "✅ Variables de entorno configuradas`n" -ForegroundColor Green
}

# 5. Instrucciones de deploy
Write-Host "📋 INSTRUCCIONES DE DEPLOY:`n" -ForegroundColor Cyan

if ($Platform -eq "railway") {
    Write-Host "Para deployar en Railway:`n" -ForegroundColor Yellow
    Write-Host "1. Ve a https://railway.app" -ForegroundColor White
    Write-Host "2. Crea un nuevo proyecto o selecciona uno existente" -ForegroundColor White
    Write-Host "3. Conecta tu repositorio GitHub" -ForegroundColor White
    Write-Host "4. Configura las variables de entorno en Railway Dashboard" -ForegroundColor White
    Write-Host "5. Configura el Root Directory: packages/backend" -ForegroundColor White
    Write-Host "6. Configura el Build Command: pnpm install && pnpm run build" -ForegroundColor White
    Write-Host "7. Configura el Start Command: pnpm run start" -ForegroundColor White
    Write-Host "8. Railway desplegará automáticamente`n" -ForegroundColor White
} else {
    Write-Host "Para deployar en Render:`n" -ForegroundColor Yellow
    Write-Host "1. Ve a https://render.com" -ForegroundColor White
    Write-Host "2. Crea un nuevo Web Service" -ForegroundColor White
    Write-Host "3. Conecta tu repositorio GitHub" -ForegroundColor White
    Write-Host "4. Configura:" -ForegroundColor White
    Write-Host "   - Root Directory: packages/backend" -ForegroundColor White
    Write-Host "   - Build Command: cd packages/backend && pnpm install && pnpm run build" -ForegroundColor White
    Write-Host "   - Start Command: cd packages/backend && pnpm run start" -ForegroundColor White
    Write-Host "5. Configura las variables de entorno en Render Dashboard" -ForegroundColor White
    Write-Host "6. Render desplegará automáticamente`n" -ForegroundColor White
}

# 6. Migración de base de datos
Write-Host "🗄️  IMPORTANTE: Ejecuta la migración después del deploy:`n" -ForegroundColor Yellow
Write-Host "  pnpm prisma migrate deploy" -ForegroundColor White
Write-Host "`nO desde Railway/Render, ejecuta:" -ForegroundColor White
Write-Host "  cd packages/backend && pnpm prisma migrate deploy`n" -ForegroundColor White

Write-Host "✅ Script completado. Sigue las instrucciones arriba para completar el deploy.`n" -ForegroundColor Green

