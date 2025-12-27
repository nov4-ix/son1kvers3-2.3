# 🚀 Script de Deploy Local - Super-Son1k-2.2
# Para pruebas locales de generación musical

Write-Host "🎵 Super-Son1k-2.2 - Deploy Local para Pruebas" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "📦 Verificando Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js no está instalado. Por favor instala Node.js 18+." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js $nodeVersion encontrado" -ForegroundColor Green

# Verificar pnpm
Write-Host "📦 Verificando pnpm..." -ForegroundColor Yellow
$pnpmVersion = pnpm --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  pnpm no encontrado. Instalando..." -ForegroundColor Yellow
    npm install -g pnpm
}
Write-Host "✅ pnpm $pnpmVersion encontrado" -ForegroundColor Green

# Verificar .env
Write-Host "🔐 Verificando variables de entorno..." -ForegroundColor Yellow
if (-not (Test-Path "packages/backend/.env")) {
    Write-Host "⚠️  Archivo .env no encontrado en packages/backend/" -ForegroundColor Yellow
    Write-Host "📝 Creando .env desde env.example..." -ForegroundColor Yellow
    Copy-Item "env.example" "packages/backend/.env"
    Write-Host "⚠️  IMPORTANTE: Edita packages/backend/.env con tus valores reales" -ForegroundColor Red
    Write-Host "   - DATABASE_URL (PostgreSQL local o remoto)" -ForegroundColor Yellow
    Write-Host "   - REDIS_URL (Redis local o remoto)" -ForegroundColor Yellow
    Write-Host "   - SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Yellow
    Write-Host "   - BACKEND_SECRET (genera uno con: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\")" -ForegroundColor Yellow
} else {
    Write-Host "✅ Archivo .env encontrado" -ForegroundColor Green
}

# Instalar dependencias
Write-Host ""
Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error instalando dependencias" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencias instaladas" -ForegroundColor Green

# Generar Prisma Client
Write-Host ""
Write-Host "🗄️  Generando Prisma Client..." -ForegroundColor Yellow
cd packages/backend
pnpm db:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error generando Prisma Client" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma Client generado" -ForegroundColor Green
cd ../..

# Ejecutar migraciones
Write-Host ""
Write-Host "🗄️  Ejecutando migraciones de base de datos..." -ForegroundColor Yellow
cd packages/backend
pnpm db:push
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Error ejecutando migraciones. Verifica tu DATABASE_URL" -ForegroundColor Yellow
    Write-Host "   Puedes continuar, pero algunas funcionalidades pueden no funcionar" -ForegroundColor Yellow
}
cd ../..

# Verificar Redis
Write-Host ""
Write-Host "🔴 Verificando conexión a Redis..." -ForegroundColor Yellow
$redisUrl = $env:REDIS_URL
if (-not $redisUrl) {
    Write-Host "⚠️  REDIS_URL no configurado. Algunas funcionalidades pueden no funcionar" -ForegroundColor Yellow
    Write-Host "   Para desarrollo local, puedes usar: redis://localhost:6379" -ForegroundColor Yellow
} else {
    Write-Host "✅ Redis configurado: $redisUrl" -ForegroundColor Green
}

# Build del backend
Write-Host ""
Write-Host "🔨 Compilando backend..." -ForegroundColor Yellow
cd packages/backend
pnpm build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error compilando backend" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend compilado" -ForegroundColor Green
cd ../..

# Iniciar servicios
Write-Host ""
Write-Host "🚀 Iniciando servicios..." -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Servicios que se iniciarán:" -ForegroundColor Yellow
Write-Host "   1. Backend (puerto 3001)" -ForegroundColor White
Write-Host "   2. The Generator Next.js (puerto 3002)" -ForegroundColor White
Write-Host "   3. Ghost Studio (puerto 3003)" -ForegroundColor White
Write-Host ""
Write-Host "💡 Presiona Ctrl+C para detener todos los servicios" -ForegroundColor Yellow
Write-Host ""

# Iniciar backend en background
Write-Host "🔵 Iniciando Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd packages/backend; pnpm dev" -WindowStyle Normal

# Esperar un poco para que el backend inicie
Start-Sleep -Seconds 5

# Iniciar The Generator
Write-Host "🟢 Iniciando The Generator..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps/the-generator-nextjs; pnpm dev" -WindowStyle Normal

# Esperar un poco
Start-Sleep -Seconds 3

# Iniciar Ghost Studio
Write-Host "🟣 Iniciando Ghost Studio..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps/ghost-studio; pnpm dev" -WindowStyle Normal

Write-Host ""
Write-Host "✅ Todos los servicios iniciados!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 URLs de acceso:" -ForegroundColor Cyan
Write-Host "   Backend:        http://localhost:3001" -ForegroundColor White
Write-Host "   Health Check:   http://localhost:3001/health" -ForegroundColor White
Write-Host "   The Generator:  http://localhost:3002" -ForegroundColor White
Write-Host "   Ghost Studio:   http://localhost:3003" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Para probar generación musical:" -ForegroundColor Yellow
Write-Host "   1. Abre http://localhost:3002 en tu navegador" -ForegroundColor White
Write-Host "   2. Escribe un prompt musical (ej: 'indie rock energético')" -ForegroundColor White
Write-Host "   3. Click en 'Generar Música'" -ForegroundColor White
Write-Host "   4. Espera 60-120 segundos para la generación" -ForegroundColor White
Write-Host "   5. Verifica que el audio se reproduce correctamente" -ForegroundColor White
Write-Host ""
Write-Host "📝 Verifica los logs en las ventanas de PowerShell abiertas" -ForegroundColor Yellow
Write-Host ""

