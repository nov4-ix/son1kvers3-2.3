#!/bin/bash

# 🚀 Script de Configuración Automática de Variables de Entorno
# Para Frontends en Vercel

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 CONFIGURANDO VARIABLES DE ENTORNO EN VERCEL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar que vercel CLI está instalada
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI no está instalada"
    echo "💡 Instala con: npm install -g vercel"
    exit 1
fi

# Cargar variables desde .env.production.local
if [ ! -f .env.production.local ]; then
    echo "❌ Archivo .env.production.local no encontrado"
    exit 1
fi

source .env.production.local

# URL del backend en Fly.io
FLY_URL="https://sub-son1k-2-2.fly.dev"

echo "📊 Backend URL: $FLY_URL"
echo ""

# Lista de proyectos Vercel a configurar
PROJECTS=(
    "the-generator-nextjs"
    "ghost-studio"
    "web-classic"
    "the-generator"
)

for PROJECT in "${PROJECTS[@]}"; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔧 Configurando: $PROJECT"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    cd "apps/$PROJECT"
    
    # Determinar qué variables usar según el tipo de proyecto
    if [ "$PROJECT" == "the-generator-nextjs" ]; then
        # Next.js usa NEXT_PUBLIC_ y variables de servidor
        echo "📝 Configurando variables para Next.js..."
        
        vercel env add BACKEND_URL production <<EOF
$FLY_URL
EOF
        
        vercel env add NEXT_PUBLIC_BACKEND_URL production <<EOF
$FLY_URL
EOF
        
        vercel env add BACKEND_SECRET production <<EOF
$BACKEND_SECRET
EOF
        
        vercel env add GROQ_API_KEY production <<EOF
$GROQ_API_KEY
EOF
        
    else
        # Vite apps usan VITE_
        echo "📝 Configurando variables para Vite..."
        
        vercel env add VITE_BACKEND_URL production <<EOF
$FLY_URL
EOF
        
        vercel env add VITE_BACKEND_SECRET production <<EOF
$BACKEND_SECRET
EOF
        
        vercel env add VITE_GROQ_API_KEY production <<EOF
$GROQ_API_KEY
EOF
    fi
    
    echo "✅ Variables configuradas para $PROJECT"
    echo ""
    
    cd ../..
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ VARIABLES CONFIGURADAS EN TODOS LOS PROYECTOS VERCEL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Proyectos configurados:"
for PROJECT in "${PROJECTS[@]}"; do
    echo "  ✅ $PROJECT"
done
echo ""
echo "🚀 Próximo paso:"
echo "  Deploy cada proyecto con: vercel --prod"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
