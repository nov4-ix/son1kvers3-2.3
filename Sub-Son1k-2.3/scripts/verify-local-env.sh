#!/bin/bash

# 🔍 Script de Verificación de Entorno Local - Super-Son1k-2.2

echo "🔍 Verificando Entorno Local - Super-Son1k-2.2"
echo "============================================="
echo ""

ERRORS=()
WARNINGS=()

# Verificar Node.js
echo "📦 Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    NODE_MAJOR=$(echo $NODE_VERSION | sed 's/v\([0-9]*\).*/\1/')
    if [ "$NODE_MAJOR" -lt 18 ]; then
        ERRORS+=("Node.js versión $NODE_VERSION encontrada. Se requiere Node.js 18+")
    else
        echo "✅ Node.js $NODE_VERSION (OK)"
    fi
else
    ERRORS+=("Node.js no está instalado")
fi

# Verificar pnpm
echo "📦 Verificando pnpm..."
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    echo "✅ pnpm $PNPM_VERSION (OK)"
else
    WARNINGS+=("pnpm no está instalado. Ejecuta: npm install -g pnpm")
fi

# Verificar PostgreSQL
echo "🗄️  Verificando PostgreSQL..."
if command -v psql &> /dev/null; then
    PG_VERSION=$(psql --version)
    echo "✅ PostgreSQL encontrado: $PG_VERSION"
else
    WARNINGS+=("PostgreSQL no encontrado en PATH. Asegúrate de tener acceso a una base de datos PostgreSQL")
fi

# Verificar Redis (opcional)
echo "🔴 Verificando Redis..."
if command -v redis-cli &> /dev/null; then
    REDIS_VERSION=$(redis-cli --version)
    echo "✅ Redis encontrado: $REDIS_VERSION"
else
    WARNINGS+=("Redis no encontrado. Opcional pero recomendado para desarrollo completo")
fi

# Verificar archivo .env del backend
echo "🔐 Verificando configuración del backend..."
if [ -f "packages/backend/.env" ]; then
    echo "✅ Archivo .env encontrado"
    
    # Verificar variables críticas
    REQUIRED_VARS=("DATABASE_URL" "JWT_SECRET" "SUPABASE_URL" "BACKEND_SECRET")
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^${var}=" packages/backend/.env; then
            echo "   ✅ $var configurado"
        else
            WARNINGS+=("$var no encontrado en .env")
        fi
    done
else
    ERRORS+=("Archivo packages/backend/.env no encontrado. Copia env.example a packages/backend/.env")
fi

# Verificar dependencias instaladas
echo "📦 Verificando dependencias..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules encontrado"
else
    WARNINGS+=("node_modules no encontrado. Ejecuta: pnpm install")
fi

# Verificar Prisma Client generado
echo "🗄️  Verificando Prisma Client..."
if [ -d "packages/backend/node_modules/.prisma/client" ]; then
    echo "✅ Prisma Client generado"
else
    WARNINGS+=("Prisma Client no generado. Ejecuta: cd packages/backend && pnpm db:generate")
fi

# Verificar puertos disponibles
echo "🔌 Verificando puertos..."
PORTS=(3001 3002 3003)
for port in "${PORTS[@]}"; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        WARNINGS+=("Puerto $port está en uso. Puede causar conflictos")
    else
        echo "   ✅ Puerto $port disponible"
    fi
done

# Resumen
echo ""
echo "============================================="
echo "📊 RESUMEN"
echo "============================================="
echo ""

if [ ${#ERRORS[@]} -eq 0 ] && [ ${#WARNINGS[@]} -eq 0 ]; then
    echo "✅ Entorno completamente configurado y listo!"
    echo ""
    echo "🚀 Puedes iniciar los servicios con:"
    echo "   ./scripts/deploy-local.sh"
    exit 0
else
    if [ ${#ERRORS[@]} -gt 0 ]; then
        echo "❌ ERRORES CRÍTICOS:"
        for error in "${ERRORS[@]}"; do
            echo "   • $error"
        done
        echo ""
    fi
    
    if [ ${#WARNINGS[@]} -gt 0 ]; then
        echo "⚠️  ADVERTENCIAS:"
        for warning in "${WARNINGS[@]}"; do
            echo "   • $warning"
        done
        echo ""
    fi
    
    if [ ${#ERRORS[@]} -gt 0 ]; then
        echo "❌ Corrige los errores antes de continuar"
        exit 1
    else
        echo "⚠️  Puedes continuar, pero algunas funcionalidades pueden no estar disponibles"
        exit 0
    fi
fi

