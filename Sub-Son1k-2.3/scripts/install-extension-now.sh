#!/bin/bash

# Script de instalación rápida de la extensión (mientras esperamos el wizard en Vercel)
# Este script instala la extensión directamente sin necesidad del wizard web

set -e

echo "🚀 INSTALACIÓN RÁPIDA DE LA EXTENSIÓN SON1KVERSE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Ruta de la extensión
EXT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/extensions/suno-extension"

if [ ! -d "$EXT_DIR" ]; then
    echo "❌ Error: No se encuentra la carpeta de la extensión"
    echo "   Ruta esperada: $EXT_DIR"
    exit 1
fi

echo "✅ Extensión encontrada en: $EXT_DIR"
echo ""

echo "📋 PASOS PARA INSTALAR:"
echo ""
echo "${YELLOW}1.${NC} Abre Chrome y ve a: ${GREEN}chrome://extensions/${NC}"
echo ""
echo "${YELLOW}2.${NC} Activa el ${GREEN}Modo de desarrollador${NC} (interruptor arriba a la derecha)"
echo ""
echo "${YELLOW}3.${NC} Haz clic en ${GREEN}\"Cargar extensión sin empaquetar\"${NC}"
echo ""
echo "${YELLOW}4.${NC} Selecciona esta carpeta:"
echo "   ${GREEN}$EXT_DIR${NC}"
echo ""
echo "${YELLOW}5.${NC} ¡Listo! La extensión debería aparecer en la lista"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Ofrecer abrir la carpeta automáticamente
read -p "¿Quieres abrir la carpeta de la extensión ahora? (s/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[SsYy]$ ]]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open "$EXT_DIR"
        echo "✅ Carpeta abierta en Finder"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        xdg-open "$EXT_DIR" 2>/dev/null || nautilus "$EXT_DIR" 2>/dev/null || echo "⚠️ No se pudo abrir automáticamente. Abre manualmente: $EXT_DIR"
    else
        echo "⚠️ Sistema no reconocido. Abre manualmente: $EXT_DIR"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 VERIFICACIÓN POST-INSTALACIÓN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Después de instalar la extensión, verifica:"
echo ""
echo "1. En chrome://extensions/, busca: ${GREEN}Son1kVerse AI Music Engine${NC}"
echo "2. Verifica que esté ${GREEN}activada${NC} (interruptor azul)"
echo "3. Haz clic en ${GREEN}\"Service worker\"${NC} para abrir la consola"
echo "4. En la consola, pega este comando:"
echo ""
echo "${YELLOW}chrome.storage.local.get(['backendUrl'], (r) => console.log('Backend:', r.backendUrl || 'https://sub-son1k-2-2.fly.dev'));${NC}"
echo ""
echo "5. Deberías ver: ${GREEN}Backend: https://sub-son1k-2-2.fly.dev${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "6. Para probar captura de tokens inmediatamente, pega en la consola:"
echo ""
echo "${YELLOW}chrome.runtime.sendMessage({type:'EXTRACT_AND_SEND_TO_POOL',label:'manual'},r=>console.log(r));${NC}"
echo ""
echo "(Nota: Debes tener sesión activa en Suno)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "7. Verifica que los tokens llegaron al backend:"
echo ""
echo "${YELLOW}curl https://sub-son1k-2-2.fly.dev/api/tokens/pool/status${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ ${GREEN}Una vez instalada, ve a https://web-classic.vercel.app y genera música${NC}"
echo ""
