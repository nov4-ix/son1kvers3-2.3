@echo off
echo 🚀 Super-Son1k Auto-Deployment Setup
echo ====================================

echo 📋 Requisitos: Tokens de Vercel, Railway y Supabase
echo.

set /p VERCEL_TOKEN="Ingresa tu VERCEL_TOKEN: "
set /p VERCEL_ORG_ID="Ingresa tu VERCEL_ORG_ID: "
set /p RAILWAY_TOKEN="Ingresa tu RAILWAY_TOKEN: "
set /p SUPABASE_URL="Ingresa tu SUPABASE_URL: "
set /p SUPABASE_ANON_KEY="Ingresa tu SUPABASE_ANON_KEY: "
set /p SUPABASE_SERVICE_KEY="Ingresa tu SUPABASE_SERVICE_ROLE_KEY: "

echo.
echo 🔧 Configurando Railway CLI...
call railway login --token %RAILWAY_TOKEN%

echo.
echo 🔧 Configurando Vercel CLI...
call npx vercel login %VERCEL_TOKEN%

echo.
echo 📝 Creando archivos de configuración...

REM Crear railway.json si no existe
if not exist "railway.json" (
    echo {> railway.json
    echo   "build": {>> railway.json
    echo     "builder": "NIXPACKS",>> railway.json
    echo     "buildCommand": "cd packages/backend && pnpm install && pnpm build:backend">> railway.json
    echo   },>> railway.json
    echo   "deploy": {>> railway.json
    echo     "startCommand": "cd packages/backend && pnpm start">> railway.json
    echo   }>> railway.json
    echo }>> railway.json
)

REM Configurar variables de entorno para Railway
echo 📝 Configurando variables de entorno en Railway...
call railway variables set DATABASE_URL "postgresql://[tu-db-url]"
call railway variables set SUPABASE_URL "%SUPABASE_URL%"
call railway variables set SUPABASE_SERVICE_ROLE_KEY "%SUPABASE_SERVICE_KEY%"
call railway variables set NEXT_PUBLIC_SUPABASE_URL "%SUPABASE_URL%"
call railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY "%SUPABASE_ANON_KEY%"
call railway variables set JWT_SECRET "super-son1k-jwt-secret-production"
call railway variables set BACKEND_SECRET "super-son1k-backend-secret-production"
call railway variables set SUNO_COOKIES "__session=[tu-session]; cf_clearance=[tu-clearance]"
call railway variables set GROQ_API_KEY "[tu-groq-key]"

echo.
echo 🔧 Conectando proyectos a Vercel...

REM Web Classic
cd apps/web-classic
call npx vercel link --project web-classic --org %VERCEL_ORG_ID%
call npx vercel env add VITE_BACKEND_URL production
call npx vercel env add VITE_SUPABASE_URL production
call npx vercel env add VITE_SUPABASE_ANON_KEY production
cd ../..

REM The Generator
cd apps/the-generator
call npx vercel link --project the-generator --org %VERCEL_ORG_ID%
call npx vercel env add VITE_BACKEND_URL production
call npx vercel env add VITE_SUPABASE_URL production
call npx vercel env add VITE_SUPABASE_ANON_KEY production
cd ../..

echo.
echo 🎯 Configuración completada!
echo.
echo Próximos pasos:
echo 1. Configurar GitHub Secrets con los tokens
echo 2. Hacer push a main para activar deployment automático
echo 3. Verificar deployments en Vercel y Railway dashboards
echo.
echo URLs esperadas:
echo - Backend: https://[tu-proyecto].up.railway.app
echo - Web Classic: https://web-classic-[hash].vercel.app
echo - The Generator: https://the-generator-[hash].vercel.app
echo.
pause