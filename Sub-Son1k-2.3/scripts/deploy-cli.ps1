# 🚀 Script de Despliegue CLI - Super-Son1k 2.1
# Este script te guía paso a paso para desplegar desde CLI

$ErrorActionPreference = "Stop"

# BACKEND_SECRET generado
$BACKEND_SECRET = "d0a238b61777b7ab94c8a1df612e6aa8eead9c01736b847508d5cb48240c06a1"

Write-Host "`n🚀 Super-Son1k 2.1 - Despliegue CLI`n" -ForegroundColor Cyan
Write-Host "BACKEND_SECRET: $BACKEND_SECRET`n" -ForegroundColor Yellow

# Verificar CLIs
Write-Host "Verificando herramientas..." -ForegroundColor Cyan

try {
    railway --version | Out-Null
    Write-Host "✅ Railway CLI instalado" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI no encontrado. Instala con: npm i -g @railway/cli" -ForegroundColor Red
    exit 1
}

try {
    vercel --version | Out-Null
    Write-Host "✅ Vercel CLI instalado" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI no encontrado. Instala con: npm i -g vercel" -ForegroundColor Red
    exit 1
}

Write-Host "`n¿Qué deseas desplegar?`n" -ForegroundColor Cyan
Write-Host "1) Solo Backend (Railway)"
Write-Host "2) Solo Frontends (Vercel)"
Write-Host "3) Todo (Backend + Frontends)"
Write-Host "4) Solo configurar variables de entorno"
$option = Read-Host "`nOpción [1-4]"

switch ($option) {
    "1" {
        Write-Host "`n🚂 Desplegando Backend en Railway...`n" -ForegroundColor Cyan
        
        Set-Location packages/backend
        
        # Verificar si está linkeado
        Write-Host "Conectando proyecto a Railway..." -ForegroundColor Yellow
        railway link
        
        Write-Host "`nConfigurando variables de entorno..." -ForegroundColor Yellow
        
        # BACKEND_SECRET
        railway variables set "BACKEND_SECRET=$BACKEND_SECRET"
        Write-Host "✅ BACKEND_SECRET configurado" -ForegroundColor Green
        
        # FRONTEND_URL (placeholder - actualizar después)
        $frontendUrl = Read-Host "Ingresa FRONTEND_URL (URLs separadas por comas, o Enter para skip)"
        if ($frontendUrl) {
            railway variables set "FRONTEND_URL=$frontendUrl"
            Write-Host "✅ FRONTEND_URL configurado" -ForegroundColor Green
        }
        
        # Variables opcionales
        $supabaseUrl = Read-Host "SUPABASE_URL (Enter para skip)"
        if ($supabaseUrl) {
            railway variables set "SUPABASE_URL=$supabaseUrl"
            $supabaseKey = Read-Host "SUPABASE_SERVICE_ROLE_KEY"
            railway variables set "SUPABASE_SERVICE_ROLE_KEY=$supabaseKey"
            Write-Host "✅ Supabase configurado" -ForegroundColor Green
        }
        
        Write-Host "`n🚀 Desplegando..." -ForegroundColor Cyan
        railway up
        
        Write-Host "`n✅ Backend desplegado!" -ForegroundColor Green
        Write-Host "Obtén la URL con: railway domain" -ForegroundColor Yellow
        
        Set-Location ../..
    }
    
    "2" {
        Write-Host "`n🌐 Desplegando Frontends en Vercel...`n" -ForegroundColor Cyan
        
        $backendUrl = Read-Host "Ingresa la URL del backend (ej: https://tu-backend.railway.app)"
        
        if (-not $backendUrl) {
            Write-Host "❌ URL del backend requerida" -ForegroundColor Red
            exit 1
        }
        
        $apps = @(
            @{ name = "the-generator-nextjs"; prefix = "NEXT_PUBLIC_"; isNext = $true },
            @{ name = "ghost-studio"; prefix = "VITE_"; isNext = $false },
            @{ name = "web-classic"; prefix = "VITE_"; isNext = $false },
            @{ name = "nova-post-pilot"; prefix = "VITE_"; isNext = $false }
        )
        
        foreach ($app in $apps) {
            Write-Host "`n📦 Desplegando $($app.name)...`n" -ForegroundColor Cyan
            
            Set-Location "apps/$($app.name)"
            
            # Conectar proyecto
            Write-Host "Conectando proyecto..." -ForegroundColor Yellow
            vercel link
            
            # Variables de entorno
            Write-Host "Configurando variables de entorno..." -ForegroundColor Yellow
            
            if ($app.isNext) {
                vercel env add "BACKEND_URL" production $backendUrl
                vercel env add "BACKEND_SECRET" production $BACKEND_SECRET
                vercel env add "NEXT_PUBLIC_BACKEND_URL" production $backendUrl
            } else {
                vercel env add "$($app.prefix)BACKEND_URL" production $backendUrl
                vercel env add "$($app.prefix)BACKEND_SECRET" production $BACKEND_SECRET
            }
            
            # Preguntar por Supabase
            $useSupabase = Read-Host "¿Configurar Supabase? (s/n)"
            if ($useSupabase -eq "s") {
                $supabaseUrl = Read-Host "SUPABASE_URL"
                $supabaseKey = Read-Host "SUPABASE_ANON_KEY"
                
                if ($app.isNext) {
                    vercel env add "SUPABASE_URL" production $supabaseUrl
                    vercel env add "SUPABASE_ANON_KEY" production $supabaseKey
                    vercel env add "NEXT_PUBLIC_SUPABASE_URL" production $supabaseUrl
                    vercel env add "NEXT_PUBLIC_SUPABASE_ANON_KEY" production $supabaseKey
                } else {
                    vercel env add "$($app.prefix)SUPABASE_URL" production $supabaseUrl
                    vercel env add "$($app.prefix)SUPABASE_ANON_KEY" production $supabaseKey
                }
            }
            
            # Groq para The Generator y Web Classic
            if ($app.name -eq "the-generator-nextjs" -or $app.name -eq "web-classic") {
                $useGroq = Read-Host "¿Configurar Groq API? (s/n)"
                if ($useGroq -eq "s") {
                    $groqKey = Read-Host "GROQ_API_KEY"
                    if ($app.isNext) {
                        vercel env add "GROQ_API_KEY" production $groqKey
                    } else {
                        vercel env add "$($app.prefix)GROQ_API_KEY" production $groqKey
                    }
                }
            }
            
            # Deploy
            Write-Host "`n🚀 Desplegando..." -ForegroundColor Cyan
            vercel --prod
            
            Write-Host "✅ $($app.name) desplegado!" -ForegroundColor Green
            
            Set-Location ../..
        }
        
        Write-Host "`n✅ Todos los frontends desplegados!" -ForegroundColor Green
    }
    
    "3" {
        Write-Host "`n🚀 Desplegando Todo...`n" -ForegroundColor Cyan
        
        # Primero backend
        Write-Host "=== Paso 1/2: Backend ===`n" -ForegroundColor Yellow
        Set-Location packages/backend
        railway link
        
        railway variables set "BACKEND_SECRET=$BACKEND_SECRET"
        $frontendUrl = Read-Host "FRONTEND_URL (placeholder - actualizar después)"
        if ($frontendUrl) {
            railway variables set "FRONTEND_URL=$frontendUrl"
        }
        
        railway up
        $backendUrl = Read-Host "`nIngresa la URL del backend desplegado"
        Set-Location ../..
        
        # Luego frontends
        Write-Host "`n=== Paso 2/2: Frontends ===`n" -ForegroundColor Yellow
        
        # Continuar con el despliegue de frontends...
        Write-Host "Ahora despliega los frontends con la opción 2" -ForegroundColor Yellow
    }
    
    "4" {
        Write-Host "`n⚙️  Configurando Variables de Entorno...`n" -ForegroundColor Cyan
        
        Write-Host "Backend (Railway) o Frontends (Vercel)?`n" -ForegroundColor Yellow
        Write-Host "1) Backend (Railway)"
        Write-Host "2) Frontends (Vercel)"
        $subOption = Read-Host "Opción"
        
        if ($subOption -eq "1") {
            Set-Location packages/backend
            railway link
            railway variables set "BACKEND_SECRET=$BACKEND_SECRET"
            Write-Host "✅ Variables configuradas" -ForegroundColor Green
            Set-Location ../..
        } else {
            Write-Host "Usa la opción 2 del menú principal para configurar frontends" -ForegroundColor Yellow
        }
    }
    
    default {
        Write-Host "❌ Opción inválida" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n✨ Proceso completado!`n" -ForegroundColor Green

