# 🛠️ Scripts de Utilidad

## 🎵 Gestión de Tokens Suno

### `add_token_to_pool.py`
Agrega tokens Suno al pool de The Generator automáticamente.

**Instalación:**
```bash
pip install requests
```

**Uso interactivo:**
```bash
python3 scripts/add_token_to_pool.py
```

**Uso directo:**
```bash
python3 scripts/add_token_to_pool.py --token "BEARER_TOKEN" --label "railway-01"
```

**Ver métricas:**
```bash
python3 scripts/add_token_to_pool.py --metrics
```

**Opciones:**
- `--token`: Bearer token de Suno
- `--label`: Label para identificar el token
- `--url`: URL del Generator (default: https://the-generator.son1kvers3.com)
- `--metrics`: Solo mostrar métricas del pool

---

### `suno_quick_client.py`
Cliente Python interactivo para probar la API de Suno.

**Uso:**
```bash
python3 scripts/suno_quick_client.py
```

Permite:
- Ver feed de canciones
- Ver créditos disponibles
- Ver proyectos
- Generar canciones de prueba
- Recomendar tags

---

## 📝 Cómo Obtener Tokens Suno

1. Ve a https://suno.com (inicia sesión)
2. Abre DevTools (F12) → Console
3. Pega el script extractor (ver `EXTRACT_SUNO_TOKENS.md`)
4. Copia el `bearer_token`
5. Úsalo con `add_token_to_pool.py`

**Nota:** Los tokens Bearer expiran en ~1 hora. Necesitarás reemplazarlos periódicamente.

---

## 🔄 Workflow Recomendado

1. **Extraer token** desde suno.com (script en navegador)
2. **Agregar al pool:**
   ```bash
   python3 scripts/add_token_to_pool.py --token "BEARER_TOKEN"
   ```
3. **Verificar:**
   ```bash
   python3 scripts/add_token_to_pool.py --metrics
   ```
4. **Probar generación** en The Generator

---

## ⚠️ Notas Importantes

- Los tokens Bearer expiran rápido (~1 hora)
- Agrega múltiples tokens para rotación
- No compartas tokens públicamente
- Verifica que el pool tenga tokens antes de generar música

