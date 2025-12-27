#!/bin/bash

# 🔌 Script para instalar la extensión Neural Bridge

echo "🔌 INSTALACIÓN DE EXTENSIÓN NEURAL BRIDGE"
echo "=========================================="
echo ""

# Paso 1: Descomprimir el archivo ZIP
echo "📦 Descomprimiendo extensión..."

cd ~/Downloads

# Buscar el archivo ZIP
ZIP_FILE=$(ls -t | grep -i "son1k-engine\|neural" | grep ".zip" | head -1)

if [ -z "$ZIP_FILE" ]; then
  echo "❌ No se encontró el archivo ZIP en ~/Downloads"
  echo ""
  echo "Por favor descarga la extensión desde:"
  echo "  https://sub-son1k-2-2-web-classic.vercel.app"
  echo ""
  exit 1
fi

echo "✅ Encontrado: $ZIP_FILE"

# Descomprimir
FOLDER_NAME="son1k-neural-bridge-extension"

rm -rf "$FOLDER_NAME" 2>/dev/null
unzip -q "$ZIP_FILE" -d "$FOLDER_NAME"

echo "✅ Extensión descomprimida en: ~/Downloads/$FOLDER_NAME"
echo ""

# Paso 2: Instrucciones para cargar en Chrome
echo "📋 INSTRUCCIONES PARA CARGAR LA EXTENSIÓN:"
echo "==========================================="
echo ""
echo "1. Abre Google Chrome"
echo "2. Ve a: chrome://extensions"
echo "3. Activa 'Modo de desarrollador' (arriba a la derecha)"
echo "4. Click en 'Cargar extensión sin empaquetar'"
echo "5. Selecciona esta carpeta:"
echo "   ~/Downloads/$FOLDER_NAME"
echo ""
echo "✅ ¡Listo! La extensión debería estar instalada"
echo ""

# Abrir la carpeta en Finder
open ~/Downloads/$FOLDER_NAME

echo "📁 Se abrió la carpeta en Finder"
echo ""
