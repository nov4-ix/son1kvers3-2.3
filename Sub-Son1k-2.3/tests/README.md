# 🧪 Testing Suite - Sub-Son1k 2.2

Documentación completa de las suites de testing profesionales para validación del ecosistema.

## 📁 Estructura

```
tests/
├── integration/
│   ├── professional_suite.py    # Tests con mocks (lógica interna)
│   └── production_suite.py      # Tests contra endpoints reales
scripts/
└── test-production-integration.ts  # Tests rápidos en TypeScript
```

## 🚀 Uso Rápido

### Tests de Producción (Recomendado)
```bash
# Suite completa contra endpoints reales
python3 tests/integration/production_suite.py

# Salida esperada: 4/4 tests PASSED
```

### Tests Mock (Desarrollo)
```bash
# Suite con lógica simulada
python3 tests/integration/professional_suite.py

# Salida esperada: 2/2 tests PASSED
```

### Tests TypeScript (Health Check Rápido)
```bash
# Validación básica de endpoints
npx tsx scripts/test-production-integration.ts

# Salida esperada: 3/3 checks PASSED
```

## 📊 Tests Implementados

### Production Suite (`production_suite.py`)

#### Test 1: Health Check
- **Qué verifica:** Estado del backend en Fly.io
- **Endpoint:** `GET /health`
- **Esperado:** `200 OK` + JSON con métricas

#### Test 2: Pixel AI Security
- **Qué verifica:** Protección de endpoints privados
- **Endpoint:** `GET /api/pixel-memory`
- **Esperado:** `401 Unauthorized`

#### Test 3: Music Generation Endpoint
- **Qué verifica:** Existencia del endpoint de generación
- **Endpoint:** `POST /api/generation/create`
- **Esperado:** `401` (auth required) o `400` (validation)
- **NO esperado:** `404` (not found) o `500` (server error)

#### Test 4: Frontend Availability
- **Qué verifica:** Disponibilidad de todos los frontends
- **Frontends:**
  - Web Classic
  - Ghost Studio
  - The Generator
  - Nova Post Pilot
- **Esperado:** `200`, `401`, o `403` (servicio vivo)
- **NO esperado:** `404`, `500+`, timeout

### Professional Suite (`professional_suite.py`)

#### Test 1: Basic Generation
- **Qué verifica:** Generación básica de música (mock)
- **Validaciones:**
  - ID de generación creado
  - Status = COMPLETED
  - Audio URL generada
  - Metadata correcta

#### Test 2: Prompt Variations
- **Qué verifica:** Múltiples variaciones de prompts
- **Prompts probados:**
  - Balada romántica
  - Beat de trap
  - Ambient espacial
  - Salsa tradicional
  - Rock progresivo

## 🔧 Configuración

### Requisitos
```bash
# Python 3.9+
python3 --version

# Dependencias Python
python3 -m pip install requests

# Node.js 18+ (para tests TS)
node --version
```

### Variables de Entorno (Opcional)
```bash
# Para tests con autenticación real
export TEST_API_TOKEN="your-token-here"
```

## 📈 Interpretación de Resultados

### ✅ PASSED
Todos los tests pasaron. El sistema está operacional.

### ❌ FAILED
Revisar el mensaje de error específico:

**401/403 en frontends:**
- Normal si Vercel tiene protección temporal
- Verificar configuración de autenticación

**404 en cualquier endpoint:**
- Servicio no desplegado correctamente
- Verificar configuración de rutas

**500+ en backend:**
- Error del servidor
- Revisar logs: `flyctl logs --app sub-son1k-2-2`

**Timeout:**
- Servicio no responde
- Verificar estado del deployment

## 🎯 Mejores Prácticas

### Antes de Deploy
```bash
# 1. Ejecutar tests mock localmente
python3 tests/integration/professional_suite.py

# 2. Si pasancommit y push
git add -A
git commit -m "feat: ..."
git push
```

### Después de Deploy
```bash
# 1. Esperar 30 segundos para que el deploy termine

# 2. Ejecutar suite de producción
python3 tests/integration/production_suite.py

# 3. Verificar logs si hay errores
flyctl logs --app sub-son1k-2-2
```

### Testing Continuo
```bash
# Ejecutar cada hora/día automáticamente
watch -n 3600 python3 tests/integration/production_suite.py
```

## 🔍 Debugging

### Backend no responde
```bash
# Ver logs en tiempo real
flyctl logs --app sub-son1k-2-2 -a

# Verificar status
flyctl status --app sub-son1k-2-2

# Reiniciar si es necesario
flyctl restart --app sub-son1k-2-2
```

### Frontend da 404
```bash
# Verificar deployment en Vercel
vercel ls

# Redeployar si es necesario
cd apps/[app-name]
vercel --prod
```

### Tests fallan localmente
```bash
# Verificar conectividad
curl https://sub-son1k-2-2.fly.dev/health

# Verificar DNS
nslookup sub-son1k-2-2.fly.dev

# Verificar certificados SSL
curl -vI https://sub-son1k-2-2.fly.dev
```

## 📝 Extender Tests

### Agregar nuevo test a Production Suite
```python
def test_05_custom_feature(self):
    """Verificar [descripción]"""
    print("Verificando [feature]...")
    response = requests.get(f"{self.base_url}/api/endpoint")
    
    self.assertEqual(response.status_code, 200)
    print("✓ [Feature]: PASSED")
```

### Agregar nuevo test Mock
```python
def test_custom_logic(self):
    """Test: [descripción]"""
    result = self.platform.some_method(params)
    
    self.assertIsNotNone(result)
    print("✓ Test [name]: PASSED")
```

## 🎉 Resultados Actuales

**Última ejecución:** 29 Nov 2025, 00:05 CST

**Production Suite:** ✅ 4/4 PASSED
- Health Check: ✅
- Pixel AI Security: ✅
- Generation Endpoint: ✅
- Frontend Availability: ✅

**Mock Suite:** ✅ 2/2 PASSED
- Basic Generation: ✅
- Prompt Variations: ✅

**Sistema:** 100% OPERACIONAL

---

**Documentación actualizada:** 29 Nov 2025
