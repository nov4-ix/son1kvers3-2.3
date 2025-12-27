# 🚀 Script de Despliegue Automatizado - Super-Son1k 2.1 (PowerShell)
# Este script ayuda a desplegar todas las aplicaciones de manera organizada

$ErrorActionPreference = "Stop"

# Colores (si está disponible)
function Write-Header {
    param([string]$Text)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host $Text -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Text)
    Write-Host "✅ $Text" -ForegroundColor Green
}

function Write-Error {
    param([string]$Text)
    Write-Host "❌ $Text" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Text)
    Write-Host "⚠️  $Text" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Text)
    Write-Host "ℹ️  $Text" -ForegroundColor Cyan
}

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Error "No se encontró package.json. Asegúrate de estar en la raíz del proyecto."
    exit 1
}

Write-Header "🚀 Super-Son1k 2.1 - Script de Despliegue"

# Menú de opciones
Write-Host "Selecciona qué deseas desplegar:"
Write-Host "1) Solo Backend (Railway)"
Write-Host "2) Solo Frontends (Vercel)"
Write-Host "3) Todo (Backend + Frontends)"
Write-Host "4) Verificar configuraciones"
Write-Host "5) Generar BACKEND_SECRET"
$option = Read-Host "Opción [1-5]"

switch ($option) {
    "1" {
        Write-Header "Desplegando Backend en Railway"
        
        # Verificar que Railway CLI está instalado
        try {
            railway --version | Out-Null
        } catch {
            Write-Error "Railway CLI no está instalado."
            Write-Host "Instala con: npm i -g @railway/cli"
            exit 1
        }
        
        Write-Info "Iniciando deploy en Railway..."
        Set-Location packages/backend
        railway up
        Set-Location ../..
        Write-Success "Backend desplegado en Railway"
    }
    
    "2" {
        Write-Header "Desplegando Frontends en Vercel"
        
        # Verificar que Vercel CLI está instalado
        try {
            vercel --version | Out-Null
        } catch {
            Write-Error "Vercel CLI no está instalado."
            Write-Host "Instala con: npm i -g vercel"
            exit 1
        }
        
        # The Generator Next.js
        Write-Info "Desplegando The Generator Next.js..."
        Set-Location apps/the-generator-nextjs
        vercel --prod
        Set-Location ../..
        Write-Success "The Generator desplegado"
        
        # Ghost Studio
        Write-Info "Desplegando Ghost Studio..."
        Set-Location apps/ghost-studio
        vercel --prod
        Set-Location ../..
        Write-Success "Ghost Studio desplegado"
        
        # Web Classic
        Write-Info "Desplegando Web Classic..."
        Set-Location apps/web-classic
        vercel --prod
        Set-Location ../..
        Write-Success "Web Classic desplegado"
        
        # Nova Post Pilot
        Write-Info "Desplegando Nova Post Pilot..."
        Set-Location apps/nova-post-pilot
        vercel --prod
        Set-Location ../..
        Write-Success "Nova Post Pilot desplegado"
        
        Write-Success "Todos los frontends desplegados"
    }
    
    "3" {
        Write-Header "Desplegando Todo (Backend + Frontends)"
        
        # Primero el backend
        Write-Info "Paso 1/2: Desplegando Backend..."
        try {
            railway --version | Out-Null
        } catch {
            Write-Error "Railway CLI no está instalado."
            exit 1
        }
        Set-Location packages/backend
        railway up
        Set-Location ../..
        Write-Success "Backend desplegado"
        
        # Esperar un poco
        Write-Info "Esperando 10 segundos para que el backend esté listo..."
        Start-Sleep -Seconds 10
        
        # Luego los frontends
        Write-Info "Paso 2/2: Desplegando Frontends..."
        try {
            vercel --version | Out-Null
        } catch {
            Write-Error "Vercel CLI no está instalado."
            exit 1
        }
        
        # The Generator
        Set-Location apps/the-generator-nextjs
        vercel --prod
        Set-Location ../..
        
        # Ghost Studio
        Set-Location apps/ghost-studio
        vercel --prod
        Set-Location ../..
        
        # Web Classic
        Set-Location apps/web-classic
        vercel --prod
        Set-Location ../..
        
        # Nova Post Pilot
        Set-Location apps/nova-post-pilot
        vercel --prod
        Set-Location ../..
        
        Write-Success "¡Todo desplegado exitosamente!"
    }
    
    "4" {
        Write-Header "Verificando Configuraciones"
        
        # Verificar archivos de configuración
        Write-Info "Verificando archivos de configuración..."
        
        $files = @(
            "railway.toml",
            "vercel.json",
            "apps/the-generator-nextjs/vercel.json",
            "apps/ghost-studio/vercel.json",
            "apps/web-classic/vercel.json",
            "apps/nova-post-pilot/vercel.json",
            "packages/backend/vercel.json"
        )
        
        foreach ($file in $files) {
            if (Test-Path $file) {
                Write-Success "$file existe"
            } else {
                Write-Warning "$file no existe"
            }
        }
        
        # Verificar package.json
        Write-Info "Verificando package.json de cada app..."
        $apps = @(
            "apps/the-generator-nextjs",
            "apps/ghost-studio",
            "apps/web-classic",
            "apps/nova-post-pilot",
            "packages/backend"
        )
        
        foreach ($app in $apps) {
            if (Test-Path "$app/package.json") {
                Write-Success "$app/package.json existe"
                
                # Verificar script de build
                $content = Get-Content "$app/package.json" -Raw
                if ($content -match '"build"') {
                    Write-Success "  → Script 'build' encontrado"
                } else {
                    Write-Warning "  → Script 'build' no encontrado"
                }
            } else {
                Write-Error "$app/package.json no existe"
            }
        }
        
        Write-Info "Verificación completada"
    }
    
    "5" {
        Write-Header "Generando BACKEND_SECRET"
        
        try {
            # Generar secret usando Node.js
            $secret = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
            Write-Host "BACKEND_SECRET generado:" -ForegroundColor Green
            Write-Host $secret -ForegroundColor Yellow
            Write-Host ""
            Write-Info "⚠️  IMPORTANTE: Guarda este valor y úsalo en:"
            Write-Host "  - Railway (Backend): BACKEND_SECRET"
            Write-Host "  - Vercel (The Generator): BACKEND_SECRET"
            Write-Host "  - Vercel (Ghost Studio): VITE_BACKEND_SECRET"
            Write-Host "  - Vercel (Web Classic): VITE_BACKEND_SECRET"
            Write-Host "  - Vercel (Nova Post Pilot): VITE_BACKEND_SECRET"
        } catch {
            Write-Error "Node.js no está instalado. No se puede generar el secret."
        }
    }
    
    default {
        Write-Error "Opción inválida"
        exit 1
    }
}

Write-Header "✨ Proceso Completado"

Write-Info "Recuerda:"
Write-Host "  1. Verificar que todas las variables de entorno están configuradas"
Write-Host "  2. Verificar que BACKEND_SECRET es el mismo en todas las apps"
Write-Host "  3. Probar los endpoints después del despliegue"
Write-Host "  4. Revisar los logs en Railway/Vercel"

Write-Success "¡Listo!"

