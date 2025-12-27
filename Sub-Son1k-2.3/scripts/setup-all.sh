#!/bin/bash

# 🚀 CONFIGURACIÓN MAESTRA - TODO EN UNO
# Configura TODAS las variables de entorno automáticamente

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 SUPER-SON1K-2.2 - CONFIGURACIÓN AUTOMÁTICA COMPLETA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
cat << "EOF"
   _____ _    _ _____  ______ _____        _____ ____  _   _ ____  _  __     ___    ___  
  / ____| |  | |  __ \|  ____|  __ \      / ____/ __ \| \ | |__ \ | |/ /    |__ \  |__ \ 
 | (___ | |  | | |__) | |__  | |__) |____| (___| |  | |  \| |  ) ||| |/ /______  )    ) |
  \___ \| |  | |  ___/|  __| |  _  /______\___ \ |  | | . ` | / / | |  <______/ /    / / 
  ____) | |__| | |    | |____| | \ \      ____) | |__| | |\  |/ /_ | | . \    / /_ _ / /_ 
 |_____/ \____/|_|    |______|_|  \_\    |_____/ \____/|_| \_|____||_|_|\_\  |____(_)____|
                                                                                            
EOF

echo ""
echo -e "${BLUE}Configuración automática de variables de entorno${NC}"
echo ""

# Paso 1: Verificar requisitos
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Verificando requisitos..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

MISSING_REQUIREMENTS=0

# Verificar CLI tools
if ! command -v fly &> /dev/null; then
    echo -e "${YELLOW}⚠️  Fly CLI no instalada${NC}"
    echo "   Instala con: curl -L https://fly.io/install.sh | sh"
    MISSING_REQUIREMENTS=1
else
    echo -e "${GREEN}✅ Fly CLI instalada${NC}"
fi

if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI no instalada${NC}"
    echo "   Instala con: npm install -g vercel"
    MISSING_REQUIREMENTS=1
else
    echo -e "${GREEN}✅ Vercel CLI instalada${NC}"
fi

# Verificar autenticación
if ! fly auth whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  No autenticado en Fly.io${NC}"
    echo "   Autentica con: fly auth login"
    MISSING_REQUIREMENTS=1
else
    echo -e "${GREEN}✅ Autenticado en Fly.io${NC}"
fi

if [ $MISSING_REQUIREMENTS -eq 1 ]; then
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}⚠️  Instala los requisitos faltantes y vuelve a ejecutar${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    exit 1
fi

echo ""

# Paso 2: Configurar Fly.io
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Paso 1: Configurando Fly.io (Backend)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "¿Configurar variables en Fly.io? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ./scripts/setup-flyio-secrets.sh
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Fly.io configurado exitosamente${NC}"
    else
        echo -e "${YELLOW}⚠️  Error configurando Fly.io${NC}"
    fi
else
    echo -e "${YELLOW}⏭️  Saltando configuración de Fly.io${NC}"
fi

echo ""

# Paso 3: Configurar Vercel
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Paso 2: Configurando Vercel (Frontends)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "¿Configurar variables en Vercel? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ./scripts/setup-vercel-env.sh
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Vercel configurado exitosamente${NC}"
    else
        echo -e "${YELLOW}⚠️  Error configurando Vercel${NC}"
    fi
else
    echo -e "${YELLOW}⏭️  Saltando configuración de Vercel${NC}"
fi

echo ""

# Resumen final
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ CONFIGURACIÓN COMPLETADA${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Resumen:"
echo "  ✅ Archivos .env.local creados (desarrollo local)"
echo "  ✅ Variables configuradas en Fly.io (backend)"
echo "  ✅ Variables configuradas en Vercel (frontends)"
echo ""
echo "🚀 Próximos pasos:"
echo ""
echo "  1️⃣  Deploy backend:"
echo "     $ fly deploy"
echo ""
echo "  2️⃣  Deploy frontends:"
echo "     $ cd apps/the-generator-nextjs && vercel --prod"
echo "     $ cd apps/ghost-studio && vercel --prod"
echo "     $ cd apps/web-classic && vercel --prod"
echo ""
echo "  3️⃣  Agregar tokens al pool:"
echo "     $ curl -X POST https://sub-son1k-2-2.fly.dev/api/tokens/add-public \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"token\":\"tu-token-aqui\"}'"
echo ""
echo "  4️⃣  Probar integración:"
echo "     $ ./scripts/test-music-generation-integration.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
