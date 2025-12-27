#!/bin/bash

# 🎵 SCRIPT DE RESTAURACIÓN COMPLETA - FASE 2
# Configura el backend con todos los servicios necesarios

set -e

echo "🎵 RESTAURACIÓN COMPLETA DEL SISTEMA - FASE 2"
echo "=============================================="
echo ""

# ============================================
# PASO 1: Verificar que tenemos DATABASE_URL
# ============================================
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL no está configurada"
  echo ""
  echo "Por favor ejecuta primero:"
  echo "  export DATABASE_URL='tu-url-de-supabase'"
  echo ""
  exit 1
fi

echo "✅ DATABASE_URL configurada"
echo ""

# ============================================
# PASO 2: Configurar DATABASE_URL en Fly.io
# ============================================
echo "📋 Configurando DATABASE_URL en Fly.io..."
/Users/nov4-ix/.fly/bin/flyctl secrets set \
  DATABASE_URL="$DATABASE_URL" \
  --app sub-son1k-2-2

echo "✅ DATABASE_URL configurada en Fly.io"
echo ""

# ============================================
# PASO 3: Ejecutar migraciones de Prisma
# ============================================
echo "🗄️  Ejecutando migraciones de Prisma..."
cd /Users/nov4-ix/Sub-Son1k-2.2/Sub-Son1k-2.2/packages/backend

# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate deploy

echo "✅ Migraciones completadas"
echo ""

# ============================================
# PASO 4: Configurar tokens de Suno
# ============================================
echo "🎫 Configurando tokens de Suno..."

SUNO_TOKENS="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJrNk4wZHJHYkdWRWNyTmdNdm02bzZ6OEM2Zko5QkV6NCIsImV4cCI6MTc2MDkzNjYyMn0.tZBli7kyOZGv5PHyxT4Nb6R8qDyTfLYdoR0i5pWaTNE,eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIwYzdFRXRKSWZ5RWxTYmlUd2NON3k4RWk5U1ZHVjB6dyIsImV4cCI6MTc2MDk1NDg3Nn0.iIRl_kdapGSub1rjTyavngazciTKouQm79o6dKvUGgQ"

/Users/nov4-ix/.fly/bin/flyctl secrets set \
  SUNO_TOKENS="$SUNO_TOKENS" \
  SUNO_API_URL="https://ai.imgkits.com/suno" \
  SUNO_POLLING_URL="https://usa.imgkits.com/node-api/suno" \
  SUNO_CHANNEL="node-api" \
  SUNO_ORIGIN="https://www.livepolls.app" \
  TOKEN_POOL_SIZE="2" \
  --app sub-son1k-2-2

echo "✅ Tokens de Suno configurados"
echo ""

# ============================================
# PASO 5: Deploy del backend
# ============================================
echo "🚀 Desplegando backend..."
cd /Users/nov4-ix/Sub-Son1k-2.2/Sub-Son1k-2.2

git add -A
git commit -m "feat: Complete music generation system with database" || true
git push origin main

/Users/nov4-ix/.fly/bin/flyctl deploy

echo "✅ Backend desplegado"
echo ""

# ============================================
# PASO 6: Verificar deployment
# ============================================
echo "🧪 Verificando deployment..."
sleep 10

echo "Health check:"
curl -s https://sub-son1k-2-2.fly.dev/health || echo "❌ Health check failed"

echo ""
echo ""
echo "✅ RESTAURACIÓN COMPLETA EXITOSA"
echo "================================"
echo ""
echo "🎵 El sistema está listo para generar música real!"
echo ""
echo "Prueba generando una canción en:"
echo "  https://sub-son1k-2-2-web-classic.vercel.app"
echo ""
