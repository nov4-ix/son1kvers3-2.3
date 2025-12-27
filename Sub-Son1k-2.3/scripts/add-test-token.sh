#!/bin/bash

# Script para agregar un token de prueba directamente al backend
# Esto te permitirá probar la generación mientras diagnosticamos la extensión

set -e

echo "🔧 AGREGANDO TOKEN DE PRUEBA AL BACKEND"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Token de prueba (puede que no funcione para generación real, pero permite testing)
TEST_TOKEN="test-token-$(date +%s)-$(openssl rand -hex 8)"

echo "📝 Token de prueba generado: ${TEST_TOKEN:0:30}..."
echo ""

# Agregar token al backend
echo "📤 Enviando token al backend..."
RESPONSE=$(curl -s -X POST https://sub-son1k-2-2.fly.dev/api/tokens/add-public \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$TEST_TOKEN\", \"label\": \"test-manual-$(date +%Y%m%d)\", \"source\": \"manual-script\"}")

echo "📊 Respuesta del backend:"
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
echo ""

# Verificar estado del pool
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Estado del pool de tokens:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

POOL_STATUS=$(curl -s https://sub-son1k-2-2.fly.dev/api/tokens/pool/status)
echo "$POOL_STATUS" | jq . 2>/dev/null || echo "$POOL_STATUS"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar si fue exitoso
if echo "$RESPONSE" | grep -q "success.*true"; then
    echo "✅ Token agregado exitosamente"
    echo ""
    echo "⚠️  NOTA IMPORTANTE:"
    echo "   Este es un token de PRUEBA y probablemente NO funcionará"
    echo "   para generación real de música."
    echo ""
    echo "   Para que funcione realmente, necesitas tokens válidos de Suno"
    echo "   capturados por la extensión."
    echo ""
    echo "🔍 Diagnóstico de la extensión:"
    echo "   Sigue los pasos en: DIAGNOSTICO_NO_TOKENS.md"
else
    echo "❌ Error al agregar token"
    echo ""
    echo "Posibles causas:"
    echo "  - El backend no está aceptando tokens públicos"
    echo "  - Hay un problema de conectividad"
    echo "  - El endpoint /api/tokens/add-public no existe o cambió"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
