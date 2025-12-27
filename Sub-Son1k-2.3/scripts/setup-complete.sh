#!/bin/bash

# 🚀 INSTALACIÓN Y CONFIGURACIÓN AUTOMÁTICA COMPLETA
# Este script hace TODO: PATH, autenticación y configuración

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 INSTALACIÓN AUTOMÁTICA COMPLETA - SUPER-SON1K-2.2"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Paso 1: Configurar PATH de Fly CLI
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Paso 1: Configurando Fly CLI"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Agregar Fly CLI al PATH para esta sesión
export FLYCTL_INSTALL="$HOME/.fly"
export PATH="$FLYCTL_INSTALL/bin:$PATH"

# Verificar que Fly CLI funciona
if fly version &> /dev/null; then
    echo -e "${GREEN}✅ Fly CLI instalado y funcional${NC}"
    fly version
else
    echo -e "${YELLOW}⚠️ Instalando Fly CLI...${NC}"
    curl -L https://fly.io/install.sh | sh
    export FLYCTL_INSTALL="$HOME/.fly"
    export PATH="$FLYCTL_INSTALL/bin:$PATH"
fi

echo ""

# Paso 2: Agregar al .zshrc para futuras sesiones
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Paso 2: Agregando al PATH permanente"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Detectar shell
SHELL_RC="$HOME/.zshrc"
if [ -f "$HOME/.bashrc" ]; then
    SHELL_RC="$HOME/.bashrc"
fi

# Agregar al shell config si no existe
if ! grep -q "FLYCTL_INSTALL" "$SHELL_RC" 2>/dev/null; then
    echo "" >> "$SHELL_RC"
    echo "# Fly CLI" >> "$SHELL_RC"
    echo 'export FLYCTL_INSTALL="$HOME/.fly"' >> "$SHELL_RC"
    echo 'export PATH="$FLYCTL_INSTALL/bin:$PATH"' >> "$SHELL_RC"
    echo -e "${GREEN}✅ PATH agregado a $SHELL_RC${NC}"
else
    echo -e "${GREEN}✅ PATH ya estaba configurado${NC}"
fi

echo ""

# Paso 3: Autenticación en Fly.io
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 Paso 3: Autenticación en Fly.io"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar si ya está autenticado
if fly auth whoami &> /dev/null; then
    echo -e "${GREEN}✅ Ya estás autenticado en Fly.io${NC}"
    fly auth whoami
else
    echo -e "${YELLOW}🔑 Abriendo navegador para autenticación...${NC}"
    echo ""
    fly auth login
fi

echo ""

# Paso 4: Configurar variables de entorno en Fly.io
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Paso 4: Configurando variables en Fly.io"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

./scripts/setup-flyio-secrets.sh

echo ""

# Paso 5: Configurar variables de entorno en Vercel
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Paso 5: Configurando variables en Vercel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "¿Configurar Vercel ahora? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ./scripts/setup-vercel-env.sh
else
    echo -e "${YELLOW}⏭️ Saltando configuración de Vercel${NC}"
    echo "   Puedes ejecutar después: ./scripts/setup-vercel-env.sh"
fi

echo ""

# Resumen final
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ ¡INSTALACIÓN Y CONFIGURACIÓN COMPLETADA!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Resumen:"
echo "  ✅ Fly CLI instalado y en PATH"
echo "  ✅ Autenticado en Fly.io"
echo "  ✅ Variables configuradas en Fly.io"
echo "  ✅ Sistema listo para deployment"
echo ""
echo "🚀 Próximos pasos:"
echo ""
echo "  1️⃣  Deploy backend:"
echo "     $ fly deploy"
echo ""
echo "  2️⃣  Deploy frontends:"
echo "     $ cd apps/the-generator-nextjs && vercel --prod"
echo ""
echo "  3️⃣  Agregar tokens al pool:"
echo "     $ curl -X POST https://sub-son1k-2-2.fly.dev/api/tokens/add-public \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"token\":\"tu-token\"}'"
echo ""
echo "  4️⃣  Probar integración:"
echo "     $ ./scripts/test-music-generation-integration.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}💡 TIP: Las futuras sesiones tendrán fly CLI en el PATH automáticamente${NC}"
echo ""
