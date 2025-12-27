#!/bin/bash

# 🚀 Script de Despliegue Automatizado - Super-Son1k 2.1
# Este script ayuda a desplegar todas las aplicaciones de manera organizada

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json. Asegúrate de estar en la raíz del proyecto."
    exit 1
fi

print_header "🚀 Super-Son1k 2.1 - Script de Despliegue"

# Menú de opciones
echo "Selecciona qué deseas desplegar:"
echo "1) Solo Backend (Railway)"
echo "2) Solo Frontends (Vercel)"
echo "3) Todo (Backend + Frontends)"
echo "4) Verificar configuraciones"
echo "5) Generar BACKEND_SECRET"
read -p "Opción [1-5]: " option

case $option in
    1)
        print_header "Desplegando Backend en Railway"
        
        # Verificar que Railway CLI está instalado
        if ! command -v railway &> /dev/null; then
            print_error "Railway CLI no está instalado."
            echo "Instala con: npm i -g @railway/cli"
            exit 1
        fi
        
        print_info "Iniciando deploy en Railway..."
        cd packages/backend
        railway up
        print_success "Backend desplegado en Railway"
        ;;
        
    2)
        print_header "Desplegando Frontends en Vercel"
        
        # Verificar que Vercel CLI está instalado
        if ! command -v vercel &> /dev/null; then
            print_error "Vercel CLI no está instalado."
            echo "Instala con: npm i -g vercel"
            exit 1
        fi
        
        # The Generator Next.js
        print_info "Desplegando The Generator Next.js..."
        cd apps/the-generator-nextjs
        vercel --prod
        print_success "The Generator desplegado"
        cd ../..
        
        # Ghost Studio
        print_info "Desplegando Ghost Studio..."
        cd apps/ghost-studio
        vercel --prod
        print_success "Ghost Studio desplegado"
        cd ../..
        
        # Web Classic
        print_info "Desplegando Web Classic..."
        cd apps/web-classic
        vercel --prod
        print_success "Web Classic desplegado"
        cd ../..
        
        # Nova Post Pilot
        print_info "Desplegando Nova Post Pilot..."
        cd apps/nova-post-pilot
        vercel --prod
        print_success "Nova Post Pilot desplegado"
        cd ../..
        
        print_success "Todos los frontends desplegados"
        ;;
        
    3)
        print_header "Desplegando Todo (Backend + Frontends)"
        
        # Primero el backend
        print_info "Paso 1/2: Desplegando Backend..."
        if ! command -v railway &> /dev/null; then
            print_error "Railway CLI no está instalado."
            exit 1
        fi
        cd packages/backend
        railway up
        print_success "Backend desplegado"
        cd ../..
        
        # Esperar un poco para que el backend esté listo
        print_info "Esperando 10 segundos para que el backend esté listo..."
        sleep 10
        
        # Luego los frontends
        print_info "Paso 2/2: Desplegando Frontends..."
        if ! command -v vercel &> /dev/null; then
            print_error "Vercel CLI no está instalado."
            exit 1
        fi
        
        # The Generator
        cd apps/the-generator-nextjs
        vercel --prod
        cd ../..
        
        # Ghost Studio
        cd apps/ghost-studio
        vercel --prod
        cd ../..
        
        # Web Classic
        cd apps/web-classic
        vercel --prod
        cd ../..
        
        # Nova Post Pilot
        cd apps/nova-post-pilot
        vercel --prod
        cd ../..
        
        print_success "¡Todo desplegado exitosamente!"
        ;;
        
    4)
        print_header "Verificando Configuraciones"
        
        # Verificar archivos de configuración
        print_info "Verificando archivos de configuración..."
        
        files=(
            "railway.toml"
            "vercel.json"
            "apps/the-generator-nextjs/vercel.json"
            "apps/ghost-studio/vercel.json"
            "apps/web-classic/vercel.json"
            "apps/nova-post-pilot/vercel.json"
            "packages/backend/vercel.json"
        )
        
        for file in "${files[@]}"; do
            if [ -f "$file" ]; then
                print_success "$file existe"
            else
                print_warning "$file no existe"
            fi
        done
        
        # Verificar package.json
        print_info "Verificando package.json de cada app..."
        apps=(
            "apps/the-generator-nextjs"
            "apps/ghost-studio"
            "apps/web-classic"
            "apps/nova-post-pilot"
            "packages/backend"
        )
        
        for app in "${apps[@]}"; do
            if [ -f "$app/package.json" ]; then
                print_success "$app/package.json existe"
                
                # Verificar script de build
                if grep -q '"build"' "$app/package.json"; then
                    print_success "  → Script 'build' encontrado"
                else
                    print_warning "  → Script 'build' no encontrado"
                fi
            else
                print_error "$app/package.json no existe"
            fi
        done
        
        print_info "Verificación completada"
        ;;
        
    5)
        print_header "Generando BACKEND_SECRET"
        
        if command -v node &> /dev/null; then
            SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
            echo -e "${GREEN}BACKEND_SECRET generado:${NC}"
            echo -e "${YELLOW}$SECRET${NC}"
            echo ""
            print_info "⚠️  IMPORTANTE: Guarda este valor y úsalo en:"
            echo "  - Railway (Backend): BACKEND_SECRET"
            echo "  - Vercel (The Generator): BACKEND_SECRET"
            echo "  - Vercel (Ghost Studio): VITE_BACKEND_SECRET"
            echo "  - Vercel (Web Classic): VITE_BACKEND_SECRET"
            echo "  - Vercel (Nova Post Pilot): VITE_BACKEND_SECRET"
        else
            print_error "Node.js no está instalado. No se puede generar el secret."
        fi
        ;;
        
    *)
        print_error "Opción inválida"
        exit 1
        ;;
esac

print_header "✨ Proceso Completado"

print_info "Recuerda:"
echo "  1. Verificar que todas las variables de entorno están configuradas"
echo "  2. Verificar que BACKEND_SECRET es el mismo en todas las apps"
echo "  3. Probar los endpoints después del despliegue"
echo "  4. Revisar los logs en Railway/Vercel"

print_success "¡Listo!"

