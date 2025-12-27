#!/bin/bash

# 🚀 Script de Configuración Automática de Variables de Entorno
# Para Fly.io Backend

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 CONFIGURANDO VARIABLES DE ENTORNO EN FLY.IO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar que fly CLI está instalado
if ! command -v fly &> /dev/null; then
    echo "❌ Fly CLI no está instalado"
    echo "💡 Instala con: curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Verificar que estás autenticado
if ! fly auth whoami &> /dev/null; then
    echo "❌ No estás autenticado en Fly.io"
    echo "💡 Autentica con: fly auth login"
    exit 1
fi

APP_NAME="sub-son1k-2-2"

echo "📊 App: $APP_NAME"
echo ""

# Leer variables desde .env.production.local
if [ ! -f .env.production.local ]; then
    echo "❌ Archivo .env.production.local no encontrado"
    exit 1
fi

echo "✅ Leyendo variables desde .env.production.local..."
echo ""

# Obtener DATABASE_URL actual
echo "📊 Obteniendo DATABASE_URL existente..."
DATABASE_URL=$(fly secrets list -a $APP_NAME | grep DATABASE_URL | awk '{print $2}' 2>/dev/null || echo "")

if [ -z "$DATABASE_URL" ]; then
    echo "⚠️ DATABASE_URL no encontrada en Fly.io secrets"
    echo "💡 Asegúrate de que la base de datos PostgreSQL esté creada"
    echo "💡 Puedes crearla con: fly postgres create"
    echo ""
    read -p "¿Tienes la DATABASE_URL? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Ingresa la DATABASE_URL: " DATABASE_URL
    else
        echo "❌ Abortando. Crea la base de datos primero."
        exit 1
    fi
else
    echo "✅ DATABASE_URL encontrada"
fi

# Cargar variables desde .env.production.local
source .env.production.local

# Obtener la URL de Fly.io
FLY_URL="https://${APP_NAME}.fly.dev"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Configurando secrets en Fly.io..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Configurar todos los secrets
fly secrets set \
  DATABASE_URL="$DATABASE_URL" \
  JWT_SECRET="$JWT_SECRET" \
  BACKEND_SECRET="$BACKEND_SECRET" \
  BACKEND_URL="$FLY_URL" \
  GROQ_API_KEY="$GROQ_API_KEY" \
  SUNO_API_URL="$SUNO_API_URL" \
  SUNO_POLLING_URL="$SUNO_POLLING_URL" \
  SUNO_CHANNEL="$SUNO_CHANNEL" \
  SUNO_ORIGIN="$SUNO_ORIGIN" \
  SUNO_REFERER="$SUNO_REFERER" \
  TOKEN_POOL_SIZE="$TOKEN_POOL_SIZE" \
  TOKEN_ROTATION_INTERVAL="$TOKEN_ROTATION_INTERVAL" \
  TOKEN_RENEWAL_INTERVAL="$TOKEN_RENEWAL_INTERVAL" \
  NODE_ENV="production" \
  LOG_LEVEL="info" \
  -a $APP_NAME

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SECRETS CONFIGURADOS EN FLY.IO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Variables configuradas:"
echo "  ✅ DATABASE_URL"
echo "  ✅ JWT_SECRET"
echo "  ✅ BACKEND_SECRET"
echo "  ✅ BACKEND_URL = $FLY_URL"
echo "  ✅ GROQ_API_KEY"
echo "  ✅ SUNO_API_URL"
echo "  ✅ SUNO_POLLING_URL"
echo "  ✅ TOKEN_POOL_SIZE"
echo "  ✅ TOKEN_ROTATION_INTERVAL"
echo "  ✅ TOKEN_RENEWAL_INTERVAL"
echo ""
echo "🔍 Verificar secrets:"
echo "  fly secrets list -a $APP_NAME"
echo ""
echo "🚀 Próximo paso:"
echo "  1. Deploy el backend: fly deploy"
echo "  2. Configurar frontends en Vercel"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
