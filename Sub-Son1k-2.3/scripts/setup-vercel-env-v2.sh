#!/bin/bash5885+20

# 🔧 Configuración de Vercel - Versión Mejorada
# Maneja variables existentes correctamente

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 CONFIGURANDO VARIABLES DE ENTORNO EN VERCEL (v2)"7
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

# Helper function para configurar variables
set_var() {
    local project=$1
    local var_name=$2
    local var_value=$3
    local env_target=${4:-production}
    
    cd "apps/$project" 2>/dev/null || {
        echo "⚠️ Proyecto $project no encontrado, saltando..."
        cd ../..
        return
    }
    
    # Remover variable existente si existe
    vercel env rm "$var_name" "$env_target" -y 2>/dev/null || true
    
    # Agregar variable
    echo "$var_value" | vercel env add "$var_name" "$env_target" 2>/dev/null || true
    
    cd ../..
}

# Lista de proyectos Vercel
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
    
    if [ "$PROJECT" == "the-generator-nextjs" ]; then
        # Next.js
        echo "📝 Configurando variables para Next.js..."
        set_var "$PROJECT" "BACKEND_URL" "$FLY_URL"
        set_var "$PROJECT" "NEXT_PUBLIC_BACKEND_URL" "$FLY_URL"
        set_var "$PROJECT" "BACKEND_SECRET" "$BACKEND_SECRET"
        set_var "$PROJECT" "GROQ_API_KEY" "$GROQ_API_KEY"
    else
        # Vite apps
        echo "📝 Configurando variables para Vite..."
        set_var "$PROJECT" "VITE_BACKEND_URL" "$FLY_URL"
        set_var "$PROJECT" "VITE_BACKEND_SECRET" "$BACKEND_SECRET"
        set_var "$PROJECT" "VITE_GROQ_API_KEY" "$GROQ_API_KEY"
    fi
    
    echo "✅ Variables configuradas para $PROJECT"
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ VARIABLES CONFIGURADAS EN VERCEL"
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
