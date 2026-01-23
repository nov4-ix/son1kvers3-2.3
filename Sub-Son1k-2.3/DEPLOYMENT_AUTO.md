# 🚀 Guía de Deployment Automático

## 📋 Requisitos Previos

### 1. Cuentas y Tokens Necesarios

#### Vercel
- Cuenta en [vercel.com](https://vercel.com)
- Token de Vercel: `VERCEL_TOKEN`
- Organization ID: `VERCEL_ORG_ID`
- Project IDs para cada app

#### Railway
- Cuenta en [railway.app](https://railway.app)
- Railway CLI instalado: `npm install -g @railway/cli`
- Token de Railway: `RAILWAY_TOKEN`

#### Supabase
- Proyecto configurado
- URL y keys de Supabase

### 2. Variables de Entorno Requeridas

Crear en **GitHub Secrets** (Settings → Secrets and variables → Actions):

#### Vercel Secrets:
```
VERCEL_TOKEN=vercel_XXXXXXXXXXXXXXXXXXXX
VERCEL_ORG_ID=team_XXXXXXXXXXXXXXXXXXXX
VERCEL_PROJECT_ID=prj_XXXXXXXXXXXXXXXXXXXX (para web-classic)
VERCEL_GENERATOR_PROJECT_ID=prj_XXXXXXXXXXXXXXXXXXXX (para the-generator)
```

#### Railway Secrets:
```
RAILWAY_TOKEN=XXXXXXXXXXXXXXXXXXXX
```

#### Supabase (en Railway/Vercel):
```
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## 🛠️ Configuración Automática

### 1. Instalar Railway CLI
```bash
npm install -g @railway/cli
railway login
```

### 2. Conectar Repositorio a Vercel
```bash
# Para web-classic
vercel link --project web-classic

# Para the-generator
vercel link --project the-generator
```

### 3. Configurar Variables de Entorno

#### En Vercel Dashboard:
1. Ir a proyecto → Settings → Environment Variables
2. Agregar:
```
VITE_BACKEND_URL=https://[tu-railway-app].up.railway.app
VITE_SUPABASE_URL=https://[tu-supabase].supabase.co
VITE_SUPABASE_ANON_KEY=[tu-anon-key]
```

#### En Railway Dashboard:
1. Ir a proyecto → Variables
2. Agregar todas las variables del `.env`

### 4. Push y Deploy Automático

Una vez configurado todo, cada push a `main` activará:

```bash
# GitHub Actions ejecutará automáticamente:
# 1. Build backend → Deploy to Railway
# 2. Build web-classic → Deploy to Vercel
# 3. Build the-generator → Deploy to Vercel
```

## 🎯 URLs de Producción

Después del deployment exitoso:

- **Backend API**: `https://[tu-proyecto].up.railway.app`
- **Web Classic**: `https://web-classic-[tu-nombre].vercel.app`
- **The Generator**: `https://the-generator-[tu-nombre].vercel.app`

## 🔧 Troubleshooting

### Si falla el deployment:

1. **Verificar tokens**: Asegurar que todos los secrets estén configurados
2. **Build logs**: Revisar logs en GitHub Actions
3. **Railway CLI**: Verificar `railway status`
4. **Vercel CLI**: Verificar `vercel projects list`

### Variables críticas:
- `DATABASE_URL` debe ser la de Railway/Supabase
- `VITE_BACKEND_URL` debe apuntar al backend desplegado
- CORS debe incluir los dominios de Vercel

## 🚀 Deploy Manual (Alternativo)

Si GitHub Actions falla, deploy manual:

```bash
# Railway
railway up

# Vercel
cd apps/web-classic && vercel --prod
cd apps/the-generator && vercel --prod
```

¡El sistema de CI/CD está listo para deployments automáticos! 🎉