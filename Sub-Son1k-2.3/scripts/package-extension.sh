#!/bin/bash

# Script para empaquetar la extensión de Chrome
# Genera un archivo .zip listo para distribuir o subir a Chrome Web Store

set -e

echo "📦 Empaquetando extensión Son1kVerse..."

# Directorio de la extensión
EXT_DIR="./extensions/suno-extension"
OUTPUT_DIR="./public/downloads"
ZIP_NAME="son1kverse-extension.zip"

# Crear directorio de salida si no existe
mkdir -p "$OUTPUT_DIR"

# Limpiar archivo anterior si existe
rm -f "$OUTPUT_DIR/$ZIP_NAME"

echo "📂 Creando archivo ZIP..."

# Crear ZIP excluyendo archivos innecesarios
cd "$EXT_DIR"
zip -r "../../$OUTPUT_DIR/$ZIP_NAME" . \
  -x "*.md" \
  -x "*.example.js" \
  -x "._*" \
  -x ".DS_Store" \
  -x "*.backup" \
  -x "node_modules/*"

cd ../..

# Obtener tamaño del archivo
FILE_SIZE=$(du -h "$OUTPUT_DIR/$ZIP_NAME" | cut -f1)

echo "✅ Extensión empaquetada exitosamente"
echo "📍 Ubicación: $OUTPUT_DIR/$ZIP_NAME"
echo "📊 Tamaño: $FILE_SIZE"
echo ""
echo "🌐 Próximos pasos:"
echo "  1. Sube este archivo a Chrome Web Store (https://chrome.google.com/webstore/devconsole)"
echo "  2. O distribúyelo directamente desde tu sitio web"
echo ""
echo "💡 Tip: Copia el archivo a apps/web-classic/public/ para que esté disponible en Vercel"
