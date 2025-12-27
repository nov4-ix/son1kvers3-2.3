#!/bin/bash

# 🔍 SCRIPT DE VERIFICACIÓN POST-DEPLOYMENT
# Verifica que toda la plataforma esté funcionando correctamente

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 VERIFICACIÓN COMPLETA DE LA PLATAFORMA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

BACKEND_URL="https://sub-son1k-2-2.fly.dev"
ERRORS=0

# Test 1: Backend Health
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  Backend Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/health" || echo "FAILED\n000")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Backend Health OK${NC}"
    echo "$RESPONSE_BODY"
else
    echo -e "${RED}❌ Backend Health FAILED (HTTP $HTTP_CODE)${NC}"
    echo "$RESPONSE_BODY"
    ((ERRORS++))
fi

echo ""

# Test 2: Token Pool Status
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  Token Pool Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

POOL_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/tokens/pool/status" || echo "FAILED\n000")
HTTP_CODE=$(echo "$POOL_RESPONSE" | tail -1)
RESPONSE_BODY=$(echo "$POOL_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Token Pool OK${NC}"
    echo "$RESPONSE_BODY"
else
    echo -e "${RED}❌ Token Pool FAILED (HTTP $HTTP_CODE)${NC}"
    echo "$RESPONSE_BODY"
    ((ERRORS++))
fi

echo ""

# Test 3: Frontend Deployments
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  Frontend Deployments"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

FRONTENDS=(
    "https://the-generator-nextjs-son1kvers3s-projects-c805d053.vercel.app|The Generator (Next.js)"
    "https://ghost-studio-9nzfqsxeg-son1kvers3s-projects-c805d053.vercel.app|Ghost Studio"
    "https://web-classic-823nt5b3j-son1kvers3s-projects-c805d053.vercel.app|Web Classic"
)

for frontend in "${FRONTENDS[@]}"; do
    IFS='|' read -r url name <<< "$frontend"
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ $name OK${NC}"
    else
        echo -e "${RED}❌ $name FAILED (HTTP $HTTP_CODE)${NC}"
        ((ERRORS++))
    fi
done

echo ""

# Test 4: Fly Machines Status
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  Fly Machines Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

export FLYCTL_INSTALL="$HOME/.fly"
export PATH="$FLYCTL_INSTALL/bin:$PATH"

if command -v fly &> /dev/null; then
    fly status -a sub-son1k-2-2 | grep -E "(STATE|started)" || true
else
    echo -e "${YELLOW}⚠️  Fly CLI not available, skipping${NC}"
fi

echo ""

# Resumen Final
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMEN DE VERIFICACIÓN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ TODOS LOS TESTS PASARON${NC}"
    echo ""
    echo "🎉 La plataforma está funcionando correctamente!"
    echo ""
    echo "URLs de acceso:"
    echo "  Backend:  $BACKEND_URL"
    echo "  The Generator: https://the-generator-nextjs-son1kvers3s-projects-c805d053.vercel.app"
    echo "  Ghost Studio:  https://ghost-studio-9nzfqsxeg-son1kvers3s-projects-c805d053.vercel.app"
    echo "  Web Classic:   https://web-classic-823nt5b3j-son1kvers3s-projects-c805d053.vercel.app"
else
    echo -e "${RED}❌ $ERRORS TESTS FALLARON${NC}"
    echo ""
    echo "Acciones recomendadas:"
    echo "  1. Ver logs del backend: fly logs -a sub-son1k-2-2"
    echo "  2. Verificar variables de entorno: fly secrets list -a sub-son1k-2-2"
    echo "  3. Revisar health del servicio: curl $BACKEND_URL/health"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit $ERRORS
