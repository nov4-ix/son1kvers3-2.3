# 🔑 Extraer Tokens de Suno

## Método 1: Bookmarklet (Más Rápido) ⚡

### Pasos:

1. **Copia este código completo:**
```javascript
javascript:(function(){function getCookie(name){const value=`; ${document.cookie}`;const parts=value.split(`; ${name}=`);if(parts.length===2)return parts.pop().split(';').shift();return null;}const token=getCookie('__client');if(token){const modal=document.createElement('div');modal.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:30px;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,0.3);z-index:999999;max-width:80%;max-height:80%;overflow:auto;font-family:monospace;';modal.innerHTML=`<h2 style="margin-top:0;color:#333;">🎵 Suno JWT Token</h2><div style="background:#f5f5f5;padding:15px;border-radius:5px;margin:15px 0;word-break:break-all;font-size:12px;">${token}</div><button id="copyBtn" style="background:#4CAF50;color:white;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;font-size:14px;margin-right:10px;">📋 Copiar Token</button><button id="closeBtn" style="background:#f44336;color:white;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;font-size:14px;">❌ Cerrar</button><div id="status" style="margin-top:15px;color:green;font-size:12px;"></div>`;document.body.appendChild(modal);document.getElementById('copyBtn').onclick=function(){navigator.clipboard.writeText(token);document.getElementById('status').textContent='✅ Token copiado al portapapeles!';};document.getElementById('closeBtn').onclick=function(){document.body.removeChild(modal);};}else{alert('❌ No se encontró el token. Asegúrate de estar en suno.com y haber iniciado sesión.');}})();
```

2. **Crea un marcador/favorito:**
   - En Chrome: Bookmarks → Bookmark Manager → Add New → Name: "Suno Token" → URL: pega el código

3. **Usa el bookmarklet:**
   - Ve a https://suno.com (debes estar logueado)
   - Click en el bookmarklet "Suno Token"
   - Se abrirá un modal con el token
   - Click en "Copiar Token"

---

## Método 2: Script en Console (Más Completo)

Ve a `scripts/` y usa el script completo que ya está guardado.

---

## 📡 Endpoints de Suno API

### Base URL:
```
https://studio-api.prod.suno.com/api
```

### Endpoints Disponibles:

1. **Feed de canciones:**
   ```
   POST /feed/v3
   Body: {
     "cursor": null,
     "limit": 10,
     "filters": {...}
   }
   ```

2. **Generar canción:**
   ```
   POST /generate/v2/
   Body: {
     "prompt": "rock song, upbeat",
     "tags": "",
     "make_instrumental": false,
     "wait_audio": false
   }
   ```

3. **Ver créditos:**
   ```
   GET /billing/info/
   ```

4. **Proyectos:**
   ```
   GET /project/me?page=1&sort=created_at&show_trashed=false
   ```

5. **Recomendar tags:**
   ```
   POST /tags/recommend
   Body: {
     "tags": []
   }
   ```

### Headers Requeridos:
```
authorization: Bearer {TU_JWT_TOKEN}
device-id: {device_id}
Content-Type: application/json
origin: https://suno.com
referer: https://suno.com/
```

---

## 🚀 Uso Rápido

### 1. Extraer Token:
- Usa el bookmarklet o script en console

### 2. Agregar al Pool:
```bash
python3 scripts/add_token_to_pool.py --token "TU_JWT_TOKEN"
```

### 3. Verificar:
```bash
python3 scripts/add_token_to_pool.py --metrics
```

### 4. Probar Generación:
- Abre The Generator: https://the-generator.son1kvers3.com
- Escribe prompt → Generate → Espera → Audio ✅

---

## ⚠️ Notas Importantes

- El token JWT (`__client`) es más estable que Bearer tokens
- Los tokens pueden expirar, reemplázalos periódicamente
- Agrega múltiples tokens para tener redundancia
- No compartas tokens públicamente

