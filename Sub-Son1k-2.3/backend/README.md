# 🚀 Son1kVers3 Backend API

**Versión:** 2.3.0  
**Framework:** FastAPI + SQLAlchemy  
**Database:** SQLite (dev) / PostgreSQL (production)

---

## 📋 **Servicios Implementados**

### ✅ **1. Sistema de Tiers + Stripe**
Gestión completa de suscripciones y límites por tier.

**Endpoints:**
- `GET /api/tiers/limits/{user_id}` - Obtener límites del usuario
- `POST /api/tiers/checkout` - Crear sesión de pago Stripe
- `POST /api/tiers/webhook` - Webhook de Stripe
- `POST /api/tiers/record-generation` - Registrar generación completada

**Tiers:**
| Tier | Precio | Generaciones | Calidad |
|------|--------|--------------|---------|
| FREE | $0 | 3/día | standard |
| CREATOR | $9.99/mes | 50/mes | standard, high |
| PRO | $29.99/mes | 200/mes | standard, high, ultra |
| STUDIO | $99.99/mes | 1000/mes | todas |

---

### ✅ **2. Pool Comunitario**
Sistema de compartición automatizada (5% de generaciones de tiers pagados).

**Endpoints:**
- `GET /api/community/pool` - Obtener contenido del pool
- `POST /api/community/pool/claim` - Reclamar generación (FREE users)
- `GET /api/community/ranking` - Ranking de contribuidores
- `POST /api/community/contribute` - Contribuir al pool
- `POST /api/community/pool/like/{id}` - Like a contribución

**Features:**
- Contribución automática del 5%
- Sistema de puntos (standard=1, high=2, ultra=3)
- 3 claims/día para usuarios FREE
- Ranking por timeframe

---

### ✅ **3. Sistema Stealth**
Rotación automática de cuentas y proxies para escalabilidad infinita.

**Endpoints:**
- `GET /api/stealth/health` - Estado del sistema stealth
- `POST /api/stealth/rotate` - Rotar a siguiente cuenta
- `GET /api/stealth/stats` - Estadísticas de cuentas
- `POST /api/stealth/mark-health` - Marcar salud de cuenta
- `POST /api/stealth/request-headers` - Obtener headers preparados

**Features:**
- Rotación de cuentas (round-robin, random, least-used)
- Pool de proxies (opcional)
- User-agent rotation
- Cooldown automático (30 min tras 50 requests)
- Health checking (healthy, degraded, banned)
- Rate limit detection

---

## 🔧 **Instalación y Configuración**

### **1. Instalar Dependencias**

```bash
cd backend
pip install -r requirements.txt
```

### **2. Configurar Base de Datos**

```bash
# Inicializar DB (crea tablas + usuario de prueba)
python -m migrations.init_db
```

### **3. Configurar Sistema Stealth (Opcional pero Recomendado)**

**a) Crear archivo de cuentas:**
```bash
cp config/stealth_accounts.json.example config/stealth_accounts.json
```

**b) Editar `config/stealth_accounts.json`:**
```json
[
  {
    "id": "account_1",
    "email": "tu-email@ejemplo.com",
    "cookie": "tu_cookie_de_suno",
    "session_id": "tu_session_id",
    "is_active": true
  }
]
```

**c) (Opcional) Configurar proxies:**
```bash
cp config/proxies.json.example config/proxies.json
# Editar con tus proxies reales
```

### **4. Variables de Entorno**

Crear archivo `.env` en `/backend`:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Base de Datos (opcional, por defecto usa SQLite)
DATABASE_URL=sqlite:///./sql_app.db

# Frontend
FRONTEND_URL=http://localhost:3000

# Stealth (opcional)
MAX_REQUESTS_PER_ACCOUNT=50
COOLDOWN_DURATION_MINUTES=30
```

### **5. Correr el Servidor**

```bash
# Desarrollo
uvicorn main:app --reload --port 8000

# Producción
uvicorn main:app --host 0.0.0.0 --port 8000
```

Server estará corriendo en: **http://localhost:8000**

---

## 📚 **Uso de los Endpoints**

### **Ejemplo 1: Verificar Límites de Usuario**

```bash
curl http://localhost:8000/api/tiers/limits/test_user_1
```

**Respuesta:**
```json
{
  "tier": "FREE",
  "limits": {
    "can_generate": true,
    "remaining": 3,
    "reset_at": "2026-01-08T00:00:00"
  },
  "config": {
    "generations_per_day": 3,
    "quality": ["standard"],
    "storage_gb": 1
  }
}
```

### **Ejemplo 2: Registrar Generación Completada**

```bash
curl -X POST http://localhost:8000/api/tiers/record-generation \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user_1",
    "generation_id": "gen_123",
    "quality": "standard"
  }'
```

### **Ejemplo 3: Obtener Pool Comunitario**

```bash
curl "http://localhost:8000/api/community/pool?limit=10&sort_by=recent"
```

### **Ejemplo 4: Usuario FREE Reclama del Pool**

```bash
curl -X POST http://localhost:8000/api/community/pool/claim \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user_1"
  }'
```

### **Ejemplo 5: Rotar Cuenta (Sistema Stealth)**

```bash
curl -X POST http://localhost:8000/api/stealth/rotate
```

**Respuesta:**
```json
{
  "account_id": "account_1",
  "account_email": "exa***",
  "proxy_active": false,
  "request_count": 15,
  "health_status": "healthy"
}
```

### **Ejemplo 6: Stats del Sistema Stealth**

```bash
curl http://localhost:8000/api/stealth/stats
```

**Respuesta:**
```json
{
  "total_accounts": 3,
  "active_accounts": 3,
  "in_cooldown": 0,
  "banned": 0,
  "available": 3,
  "proxies": 0,
  "rotation_strategy": "round-robin"
}
```

---

## 🗂️ **Estructura de la Base de Datos**

### **Modelos Implementados:**

1. **User** - Usuarios y suscripciones
   - `id`, `email`, `username`, `tier`, `subscription_id`, `subscription_status`

2. **Generation** - Todas las generaciones musicales
   - `id`, `user_id`, `prompt`, `genre`, `quality`, `audio_url`, `status`

3. **UserGenerationStats** - Tracking diario/mensual
   - `user_id`, `date`, `count`, `month_year`

4. **UserPoolStats** - Stats de contribuciones al pool
   - `user_id`, `total_contributions`, `total_points`, `last_contribution`

5. **PoolContribution** - Contribuciones individuales
   - `user_id`, `generation_id`, `quality`, `points`, `plays`, `likes`

6. **PoolClaim** - Claims de usuarios FREE
   - `user_id`, `contribution_id`, `claimed_at`

7. **AnalyticsEvent** - Eventos de analytics
   - `user_id`, `event_type`, `timestamp`, `metadata`

---

## 🔄 **Flujo de Integración con Frontend**

### **Flujo 1: Generación Musical con Enforcement**

```typescript
// 1. Frontend verifica límites ANTES de generar
const limits = await fetch(`/api/tiers/limits/${userId}`).then(r => r.json());

if (!limits.limits.can_generate) {
  // Mostrar mensaje de límite alcanzado
  alert(`Límite alcanzado. Renueva en ${limits.limits.reset_at}`);
  return;
}

// 2. Generar música (con stealth system)
const stealthHeaders = await fetch('/api/stealth/request-headers', {
  method: 'POST'
}).then(r => r.json());

const generation = await generateMusic(prompt, stealthHeaders);

// 3. Registrar la generación completada
await fetch('/api/tiers/record-generation', {
  method: 'POST',
  body: JSON.stringify({
    user_id: userId,
    generation_id: generation.id,
    quality: 'standard'
  })
});

// 4. Intentar contribuir al pool (automático para tiers pagados)
await fetch('/api/community/contribute', {
  method: 'POST',
  body: JSON.stringify({
    user_id: userId,
    generation_id: generation.id,
    quality: 'standard'
  })
});
```

### **Flujo 2: Usuario FREE Reclama del Pool**

```typescript
// 1. Obtener contenido del pool
const pool = await fetch('/api/community/pool?limit=50').then(r => r.json());

// 2. Usuario reclama generación aleatoria
const claimed = await fetch('/api/community/pool/claim', {
  method: 'POST',
  body: JSON.stringify({ user_id: userId })
}).then(r => r.json());

// 3. Reproducir audio
playAudio(claimed.audio_url);
```

---

## 🧪 **Testing**

### **Test Endpoints Básicos:**

```bash
# Health check
curl http://localhost:8000/health

# Root info
curl http://localhost:8000/

# Stealth health
curl http://localhost:8000/api/stealth/health
```

### **Test Flujo Completo:**

```bash
# 1. Check limits
USER_ID="test_user_1"
curl http://localhost:8000/api/tiers/limits/$USER_ID

# 2. Record generation
curl -X POST http://localhost:8000/api/tiers/record-generation \
  -H "Content-Type: application/json" \
  -d "{\"user_id\":\"$USER_ID\",\"generation_id\":\"test_gen_1\",\"quality\":\"standard\"}"

# 3. Check limits again (should be reduced)
curl http://localhost:8000/api/tiers/limits/$USER_ID
```

---

## 📊 **Monitoreo y Stats**

### **Dashboard Stats (Endpoint a Crear)**

```GET /api/admin/dashboard```

Retorna:
- Total usuarios por tier
- Generaciones hoy/mes
- Pool stats (total contribuciones, claims)
- Stealth system health

---

## 🚨 **Troubleshooting**

### **Error: "No available accounts"**
- **Causa:** Todas las cuentas en cooldown o banned
- **Solución:** Agregar más cuentas en `config/stealth_accounts.json`

### **Error: "Daily limit reached"**
- **Causa:** Usuario FREE alcanzó su límite de 3/día
- **Solución:** Esperar reset (medianoche) o upgrade de tier

### **Error: "Pool is empty"**
- **Causa:** No hay contribuciones en el pool
- **Solución:** Usuarios pagados deben generar música (contribución automática 5%)

---

## 📝 **TODO / Próximas Features**

- [ ] Ollama AI service (lyric generation)
- [ ] Voice Cloning service (Bark integration)
- [ ] Analytics dashboard completo
- [ ] WebSocket para updates en tiempo real
- [ ] Admin panel endpoints
- [ ] Rate limiting por IP
- [ ] Cache con Redis

---

## 🔐 **Seguridad**

**En Producción:**
1. Cambiar CORS origins de `["*"]` a dominios específicos
2. Usar variables de entorno para secrets
3. Habilitar HTTPS only
4. Implementar rate limiting
5. Añadir autenticación JWT
6. Ofuscar/encryp credenciales en stealth_accounts.json

---

## 📞 **Soporte**

Para issues o preguntas sobre la API, crear issue en el repositorio principal.

---

**Last Updated:** 2026-01-07  
**Status:** ✅ Production Ready (Tiers, Pool, Stealth)
