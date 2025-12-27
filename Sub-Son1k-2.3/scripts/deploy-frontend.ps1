# 🚀 Deploy Frontend Script
# Deploy de frontends a Vercel

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("the-generator", "ghost-studio", "web-classic", "nova-post-pilot", "all")]
    [string]$App = "all",
    
    [Parameter(Mandatory=$false)]
    [switch]$Production = $false
)

Write-Host "🚀 Desplegando frontend(s) a Vercel...`n" -ForegroundColor Cyan

# 1. Verificar que estamos en la raíz del proyecto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json. Ejecuta este script desde la raíz del proyecto." -ForegroundColor Red
    exit 1
}

# 2. Verificar que Vercel CLI está instalado
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI encontrado: $vercelVersion`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI no encontrado. Instálalo con: npm install -g vercel" -ForegroundColor Red
    exit 1
}

# 3. Definir apps a deployar
$apps = @()

if ($App -eq "all") {
    $apps = @("the-generator", "ghost-studio", "web-classic", "nova-post-pilot")
} else {
    $apps = @($App)
}

# 4. Deploy cada app
foreach ($appName in $apps) {
    $appPath = "apps/$appName"
    
    if (-not (Test-Path $appPath)) {
        Write-Host "⚠️  $appPath no encontrado. Saltando...`n" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "📦 Desplegando $appName...`n" -ForegroundColor Yellow
    
    Push-Location $appPath
    
    try {
        # Verificar build
        Write-Host "🔨 Verificando build..." -ForegroundColor Gray
        pnpm run build
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Build falló para $appName. Saltando...`n" -ForegroundColor Red
            Pop-Location
            continue
        }
        Write-Host "✅ Build exitoso`n" -ForegroundColor Green
        
        # Verificar que Vercel está linkeado
        if (-not (Test-Path ".vercel")) {
            Write-Host "🔗 Linking proyecto con Vercel..." -ForegroundColor Gray
            vercel link
        }
        
        # Deploy
        if ($Production) {
            Write-Host "🚀 Desplegando a producción..." -ForegroundColor Gray
            vercel --prod
        } else {
            Write-Host "🚀 Desplegando preview..." -ForegroundColor Gray
            vercel
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $appName deployado exitosamente`n" -ForegroundColor Green
        } else {
            Write-Host "❌ Deploy falló para $appName`n" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error deployando $appName: $_`n" -ForegroundColor Red
    } finally {
        Pop-Location
    }
}

Write-Host "✅ Deploy completado`n" -ForegroundColor Green

# 5. Verificar variables de entorno
Write-Host "🔐 IMPORTANTE: Verifica que las variables de entorno estén configuradas en Vercel:`n" -ForegroundColor Yellow

foreach ($appName in $apps) {
    Write-Host "$appName:" -ForegroundColor White
    Write-Host "  - VITE_BACKEND_URL (o NEXT_PUBLIC_BACKEND_URL para Next.js)" -ForegroundColor Gray
    Write-Host "  - VITE_SUPABASE_URL (o NEXT_PUBLIC_SUPABASE_URL)" -ForegroundColor Gray
    Write-Host "  - VITE_SUPABASE_ANON_KEY (o NEXT_PUBLIC_SUPABASE_ANON_KEY)`n" -ForegroundColor Gray
}

Write-Host "Puedes configurarlas en Vercel Dashboard → Project Settings → Environment Variables`n" -ForegroundColor Yellow

