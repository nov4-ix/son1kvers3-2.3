#!/bin/bash

# 🚀 DEPLOY AUTOMÁTICO DE TODOS LOS FRONTENDS
# Ejecuta desde la raíz del proyecto

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 DEPLOY AUTOMÁTICO - TODOS LOS FRONTENDS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Guardar directorio actual
ROOT_DIR=$(pwd)

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Lista de proyectos a deployar
PROJECTS=(
    "the-generator-nextjs"
    "ghost-studio"
    "web-classic"
    "the-generator"
)

echo "📊 Proyectos a deployar:"
for PROJECT in "${PROJECTS[@]}"; do
    echo "  - $PROJECT"
done
echo ""

# Función para deploy
deploy_project() {
    local project=$1
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🚀 Deploying: $project"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Ir al directorio del proyecto
    cd "$ROOT_DIR/apps/$project" || {
        echo -e "${RED}❌ Proyecto $project no encontrado${NC}"
        return 1
    }
    
    # Intentar deploy
    if vercel --prod --yes 2>&1 | tee /tmp/vercel-deploy-$project.log; then
        echo -e "${GREEN}✅ $project deployed exitosamente${NC}"
        echo ""
        return 0
    else
        echo -e "${YELLOW}⚠️ Error deploying $project${NC}"
        echo ""
        
        # Verificar si es error de permisos
        if grep -q "must have access" /tmp/vercel-deploy-$project.log; then
            echo -e "${YELLOW}📝 Problema de permisos detectado${NC}"
            echo ""
            echo "Soluciones:"
            echo "  1. Cambiar git author:"
            echo "     git config user.email 'nov4.ix@gmail.com'"
            echo ""
            echo "  2. O agregar dev@guitarrasochoa.com al team son1kvers3"
            echo "     https://vercel.com/dashboard/son1kvers3/settings/members"
            echo ""
        fi
        
        return 1
    fi
}

# Verificar problema de git author
CURRENT_GIT_EMAIL=$(git config user.email)
echo "📧 Git author actual: $CURRENT_GIT_EMAIL"
echo ""

if [ "$CURRENT_GIT_EMAIL" != "nov4.ix@gmail.com" ]; then
    echo -e "${YELLOW}⚠️ Git author no coincide con usuario de Vercel${NC}"
    echo ""
    read -p "¿Cambiar git author a nov4.ix@gmail.com? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git config user.email "nov4.ix@gmail.com"
        git config user.name "nov4-ix"
        echo -e "${GREEN}✅ Git author actualizado${NC}"
        echo ""
    fi
fi

# Deploy cada proyecto
SUCCESSFUL=0
FAILED=0

for PROJECT in "${PROJECTS[@]}"; do
    if deploy_project "$PROJECT"; then
        ((SUCCESSFUL++))
    else
        ((FAILED++))
    fi
    
    # Volver a la raíz
    cd "$ROOT_DIR"
done

# Resumen final
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMEN DE DEPLOYMENTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ Exitosos: $SUCCESSFUL${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}❌ Fallidos: $FAILED${NC}"
fi
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡Todos los deployments completados!${NC}"
else
    echo -e "${YELLOW}⚠️ Ver logs arriba para detalles de errores${NC}"
fi
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
