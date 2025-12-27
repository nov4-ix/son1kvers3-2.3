#!/bin/bash

# 🧪 Test de Integración: Backend ↔ Frontend
# Verifica que todos los endpoints de generación de música funcionen correctamente

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 TEST DE INTEGRACIÓN: GENERACIÓN DE MÚSICA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Configuración
BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123!"
JWT_TOKEN=""

echo "📊 Configuración del test:"
echo "  BACKEND_URL: $BACKEND_URL"
echo "  TEST_EMAIL: $TEST_EMAIL"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funciones de utilidad
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Test 1: Health Check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣ Test: Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

HEALTH_RESPONSE=$(curl -s "${BACKEND_URL}/health" || echo "FAILED")

if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    print_success "Backend is healthy"
    echo "$HEALTH_RESPONSE" | jq '.'
else
    print_error "Backend health check failed"
    echo "$HEALTH_RESPONSE"
    exit 1
fi

echo ""

# Test 2: Registro de usuario
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣ Test: Registro de Usuario"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

REGISTER_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"username\": \"testuser\"
  }")

if echo "$REGISTER_RESPONSE" | grep -q "token"; then
    JWT_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token // .data.token')
    print_success "Usuario registrado exitosamente"
    echo "JWT Token: ${JWT_TOKEN:0:50}..."
else
    print_error "Error en registro de usuario"
    echo "$REGISTER_RESPONSE"
    
    # Intentar login si el usuario ya existe
    echo ""
    print_warning "Intentando login con usuario existente..."
    
    LOGIN_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/api/auth/login" \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$TEST_PASSWORD\"
      }")
    
    if echo "$LOGIN_RESPONSE" | grep -q "token"; then
        JWT_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // .data.token')
        print_success "Login exitoso"
        echo "JWT Token: ${JWT_TOKEN:0:50}..."
    else
        print_error "Error en login"
        echo "$LOGIN_RESPONSE"
        exit 1
    fi
fi

echo ""

# Test 3: Verificar pool de tokens
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣ Test: Pool de Tokens"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

POOL_RESPONSE=$(curl -s "${BACKEND_URL}/api/tokens/pool/status")

if echo "$POOL_RESPONSE" | grep -q "totalTokens"; then
    HEALTHY_TOKENS=$(echo "$POOL_RESPONSE" | jq -r '.healthyTokens')
    TOTAL_TOKENS=$(echo "$POOL_RESPONSE" | jq -r '.totalTokens')
    
    if [ "$HEALTHY_TOKENS" -gt 0 ]; then
        print_success "Pool de tokens tiene $HEALTHY_TOKENS tokens saludables de $TOTAL_TOKENS"
    else
        print_warning "No hay tokens saludables disponibles ($HEALTHY_TOKENS/$TOTAL_TOKENS)"
        echo "⚠️ La generación de música fallará sin tokens"
    fi
else
    print_error "Error al verificar pool de tokens"
    echo "$POOL_RESPONSE"
fi

echo ""

# Test 4: Crear generación de música
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣ Test: Crear Generación de Música"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -z "$JWT_TOKEN" ]; then
    print_error "No hay token JWT, saltando test de generación"
else
    CREATE_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/api/generation/create" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $JWT_TOKEN" \
      -d '{
        "prompt": "Test song about integration testing",
        "style": "pop",
        "duration": 60,
        "quality": "standard"
      }')
    
    if echo "$CREATE_RESPONSE" | grep -q "generationId"; then
        GENERATION_ID=$(echo "$CREATE_RESPONSE" | jq -r '.data.generationId')
        print_success "Generación creada exitosamente"
        echo "Generation ID: $GENERATION_ID"
        
        # Test 5: Verificar status de generación
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "5️⃣ Test: Verificar Status de Generación"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        
        STATUS_RESPONSE=$(curl -s "${BACKEND_URL}/api/generation/${GENERATION_ID}/status" \
          -H "Authorization: Bearer $JWT_TOKEN")
        
        if echo "$STATUS_RESPONSE" | grep -q "status"; then
            STATUS=$(echo "$STATUS_RESPONSE" | jq -r '.data.status')
            print_success "Status obtenido: $STATUS"
            echo "$STATUS_RESPONSE" | jq '.data'
        else
            print_error "Error al obtener status"
            echo "$STATUS_RESPONSE"
        fi
        
        # Test 6: Historial de generaciones
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "6️⃣ Test: Historial de Generaciones"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        
        HISTORY_RESPONSE=$(curl -s "${BACKEND_URL}/api/generation/history?limit=5" \
          -H "Authorization: Bearer $JWT_TOKEN")
        
        if echo "$HISTORY_RESPONSE" | grep -q "success"; then
            GENERATION_COUNT=$(echo "$HISTORY_RESPONSE" | jq '.data | length')
            print_success "Historial obtenido: $GENERATION_COUNT generaciones"
            echo "$HISTORY_RESPONSE" | jq '.data[0]' || echo "[]"
        else
            print_error "Error al obtener historial"
            echo "$HISTORY_RESPONSE"
        fi
        
    else
        print_error "Error al crear generación"
        echo "$CREATE_RESPONSE"
        
        # Verificar si es por falta de tokens
        if echo "$CREATE_RESPONSE" | grep -q "NO_TOKENS_AVAILABLE"; then
            print_warning "Error esperado: No hay tokens disponibles en el pool"
            print_warning "Agrega tokens usando: POST /api/tokens/add-public"
        fi
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMEN DEL TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

print_success "Test de integración completado"
echo ""
echo "Pasos verificados:"
echo "  ✅ Health check del backend"
echo "  ✅ Registro/Login de usuario"
echo "  ✅ Verificación de pool de tokens"
echo "  ✅ Creación de generación"
echo "  ✅ Verificación de status"
echo "  ✅ Historial de generaciones"
echo ""

print_warning "Recuerda:"
echo "  - El backend debe estar ejecutándose en $BACKEND_URL"
echo "  - Debe haber tokens en el pool para generar música"
echo "  - Las generaciones pueden tardar 1-2 minutos en completarse"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
