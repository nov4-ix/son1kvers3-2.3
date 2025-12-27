#!/bin/bash

# Script para agregar tokens desde .env.production.local al backend
# Esto evita depender de la extensión Chrome

set -e

echo "🔐 AGREGANDO TOKENS DESDE .ENV AL BACKEND"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar que existe .env.production.local
if [ ! -f ".env.production.local" ]; then
    echo "❌ Error: No se encuentra .env.production.local"
    exit 1
fi

# Cargar variables de entorno
source .env.production.local

echo "📊 Verificando tokens disponibles..."
echo ""

# Verificar si hay SUNO_TOKENS
if [ -z "$SUNO_TOKENS" ]; then
    echo "❌ No se encontró SUNO_TOKENS en .env.production.local"
    echo ""
    echo "💡 Agrega tus tokens de Suno al archivo .env.production.local:"
    echo "   SUNO_TOKENS='[\"token1\", \"token2\", \"token3\"]'"
    echo ""
    exit 1
fi

echo "✅ Tokens encontrados en .env.production.local"
echo ""

# Parsear tokens del JSON array (formato: ["token1", "token2", ...])
TOKENS=$(echo "$SUNO_TOKENS" | jq -r '.[]' 2>/dev/null)

if [ -z "$TOKENS" ]; then
    echo "⚠️  No se pudieron parsear los tokens."
    echo "   Formato esperado: SUNO_TOKENS='[\"token1\", \"token2\"]'"
    echo ""
    echo "💡 Intentando formato simple (un token sin array)..."
    TOKENS="$SUNO_TOKENS"
fi

echo "📤 Enviando tokens al backend..."
echo ""

COUNT=0
SUCCESS=0
FAILED=0

while IFS= read -r TOKEN; do
    if [ -n "$TOKEN" ]; then
        COUNT=$((COUNT + 1))
        
        # Limpiar el token de comillas y espacios
        CLEAN_TOKEN=$(echo "$TOKEN" | tr -d '"' | tr -d "'" | xargs)
        
        echo "[$COUNT] Enviando token: ${CLEAN_TOKEN:0:30}..."
        
        RESPONSE=$(curl -s -X POST https://sub-son1k-2-2.fly.dev/api/tokens/add-public \
          -H "Content-Type: application/json" \
          -d "{\"token\": \"$CLEAN_TOKEN\", \"label\": \"env-token-$COUNT\", \"source\": \"env-file\"}")
        
        if echo "$RESPONSE" | grep -q "success.*true"; then
            echo "   ✅ Enviado exitosamente"
            SUCCESS=$((SUCCESS + 1))
        else
            echo "   ❌ Error: $RESPONSE"
            FAILED=$((FAILED + 1))
        fi
        echo ""
    fi
done <<< "$TOKENS"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMEN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Total procesados: $COUNT"
echo "✅ Exitosos: $SUCCESS"
echo "❌ Fallidos: $FAILED"
echo ""

# Verificar estado final del pool
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Estado final del pool:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

curl -s https://sub-son1k-2-2.fly.dev/api/tokens/pool/status | jq .

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $SUCCESS -gt 0 ]; then
    echo ""
    echo "✅ Tokens agregados exitosamente al backend"
    echo ""
    echo "🎵 Ahora puedes generar música en:"
    echo "   https://web-classic.vercel.app"
    echo ""
fi
