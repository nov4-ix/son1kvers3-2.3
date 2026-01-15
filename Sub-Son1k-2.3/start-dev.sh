#!/bin/bash

# Script para iniciar todos los servicios de desarrollo

echo "🚀 Iniciando Son1kvers3 en modo desarrollo..."

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Función para matar procesos al salir
cleanup() {
    echo -e "\n${YELLOW}Deteniendo servicios...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Verificar servicios necesarios
echo "Verificando servicios..."

# PostgreSQL
if ! pg_isready -q; then
    echo -e "${YELLOW}⚠️  PostgreSQL no está corriendo. Inícialo con: brew services start postgresql${NC}"
fi

# Redis
if ! redis-cli ping > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Redis no está corriendo. Inícialo con: brew services start redis${NC}"
fi

echo ""
echo -e "${GREEN}Iniciando servicios...${NC}"

# Backend
echo "📦 Backend en puerto 4000..."
cd packages/backend && pnpm dev > ../../logs/backend.log 2>&1 &

# The Generator
echo "🎵 The Generator en puerto 3000..."
cd apps/the-generator && pnpm dev > ../../logs/frontend.log 2>&1 &

# Stripe Webhooks
echo "💳 Stripe CLI escuchando webhooks..."
stripe listen --forward-to localhost:4000/api/webhooks/stripe > ../../logs/stripe.log 2>&1 &

echo ""
echo -e "${GREEN}✓ Todos los servicios iniciados${NC}"
echo ""
echo "Servicios disponibles:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend: http://localhost:4000"
echo "  - Stripe Webhooks: activos"
echo ""
echo "Logs en tiempo real:"
echo "  - Backend: tail -f logs/backend.log"
echo "  - Frontend: tail -f logs/frontend.log"
echo "  - Stripe: tail -f logs/stripe.log"
echo ""
echo -e "${YELLOW}Presiona Ctrl+C para detener todos los servicios${NC}"

# Mantener script corriendo
wait
