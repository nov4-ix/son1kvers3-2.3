# 🚀 DEPLOYMENT AUTOMÁTICO COMPLETO

## ✅ Sistema Preparado

### Archivos de Configuración Creados:
- ✅ `.github/workflows/deploy.yml` - CI/CD automático
- ✅ `apps/web-classic/vercel.json` - Configuración Vercel
- ✅ `apps/the-generator/vercel.json` - Configuración Vercel
- ✅ `railway.json` - Configuración Railway actualizada
- ✅ `setup-deployment.bat` - Script de setup automático
- ✅ `DEPLOYMENT_AUTO.md` - Guía completa

### Variables de Entorno Requeridas:

#### GitHub Secrets (Settings → Secrets and variables → Actions):
```
VERCEL_TOKEN=vercel_XXXXXXXXXXXXXXXXXXXX
VERCEL_ORG_ID=team_XXXXXXXXXXXXXXXXXXXX
VERCEL_PROJECT_ID=prj_XXXXXXXXXXXXXXXXXXXX
VERCEL_GENERATOR_PROJECT_ID=prj_XXXXXXXXXXXXXXXXXXXX
RAILWAY_TOKEN=XXXXXXXXXXXXXXXXXXXX
```

#### Railway Environment Variables:
```
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
JWT_SECRET=super-son1k-jwt-secret-production
BACKEND_SECRET=super-son1k-backend-secret-production
SUNO_COOKIES=__session=...; cf_clearance=...
GROQ_API_KEY=gsk_...
```

#### Vercel Environment Variables:
```
VITE_BACKEND_URL=https://[tu-railway-app].up.railway.app
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJ...
```

## 🎯 Proceso de Deployment Automático

### Opción 1: Setup Automático (Recomendado)
```bash
# Ejecutar setup automático
.\setup-deployment.bat
```

### Opción 2: Setup Manual

#### 1. Configurar GitHub Secrets
- Ir a: https://github.com/[tu-user]/[tu-repo]/settings/secrets/actions
- Agregar todos los secrets listados arriba

#### 2. Configurar Railway
```bash
# Instalar Railway CLI
npm install -g @railway/cli
railway login

# Conectar proyecto
railway link

# Configurar variables (o desde dashboard)
railway variables set DATABASE_URL "postgresql://..."
railway variables set SUPABASE_URL "https://..."
# ... todas las variables
```

#### 3. Configurar Vercel
```bash
# Instalar Vercel CLI
npm install -g vercel

# Web Classic
cd apps/web-classic
vercel link
vercel env add VITE_BACKEND_URL
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# The Generator
cd ../the-generator
vercel link
vercel env add VITE_BACKEND_URL
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### Opción 3: Deploy Manual Inicial
```bash
# Railway (Backend)
railway up

# Vercel (Frontends)
cd apps/web-classic && vercel --prod
cd apps/the-generator && vercel --prod
```

## 🔄 Flujo de CI/CD

Una vez configurado, cada push a `main`:

1. **GitHub Actions** se activa automáticamente
2. **Build Backend** → **Deploy Railway**
3. **Build Web Classic** → **Deploy Vercel**
4. **Build The Generator** → **Deploy Vercel**

## 📍 URLs de Producción

Después del primer deployment:

- **Backend API**: `https://[tu-proyecto].up.railway.app`
- **Web Classic**: `https://web-classic-[hash].vercel.app`
- **The Generator**: `https://the-generator-[hash].vercel.app`

## 🔧 Troubleshooting

### Si falla CI/CD:
1. ✅ Verificar que todos los **secrets** estén configurados
2. ✅ Verificar **tokens** válidos
3. ✅ Revisar **logs** en GitHub Actions
4. ✅ Verificar **variables de entorno** en Railway/Vercel

### Comandos útiles:
```bash
# Ver status de Railway
railway status

# Ver deployments de Vercel
vercel projects list

# Ver logs de GitHub Actions
# Ir a: https://github.com/[tu-user]/[tu-repo]/actions
```

## 🎉 ¡Deployment Automático Listo!

El sistema está completamente configurado para deployments automáticos. Una vez que configures los tokens y variables de entorno, cada push a main activará el deployment completo. 🚀