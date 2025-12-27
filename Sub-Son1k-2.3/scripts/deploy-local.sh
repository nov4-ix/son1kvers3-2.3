#!/bin/bash

# 🚀 Script de Deploy Local - Super-Son1k-2.2
# Para pruebas locales de generación musical (Linux/Mac)

echo "🎵 Super-Son1k-2.2 - Deploy Local para Pruebas"
echo "================================================"
echo ""

# Verificar Node.js
echo "📦 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18+."
    exit 1
fi
NODE_VERSION=$(node --version)
echo "✅ Node.js $NODE_VERSION encontrado"

# Verificar pnpm
echo "📦 Verificando pnpm..."
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm no encontrado. Instalando..."
    npm install -g pnpm
fi
PNPM_VERSION=$(pnpm --version)
echo "✅ pnpm $PNPM_VERSION encontrado"

# Verificar .env
echo "🔐 Verificando variables de entorno..."
if [ ! -f "packages/backend/.env" ]; then
    echo "⚠️  Archivo .env no encontrado en packages/backend/"
    echo "📝 Creando .env desde env.example..."
    cp env.example packages/backend/.env
    echo "⚠️  IMPORTANTE: Edita packages/backend/.env con tus valores reales"
    echo "   - DATABASE_URL (PostgreSQL local o remoto)"
    echo "   - REDIS_URL (Redis local o remoto)"
    echo "   - SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY"
    echo "   - BACKEND_SECRET (genera uno con: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\")"
else
    echo "✅ Archivo .env encontrado"
fi

# Instalar dependencias
echo ""
echo "📦 Instalando dependencias..."
pnpm install
if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias"
    exit 1
fi
echo "✅ Dependencias instaladas"

# Generar Prisma Client
echo ""
echo "🗄️  Generando Prisma Client..."
cd packages/backend
pnpm db:generate
if [ $? -ne 0 ]; then
    echo "❌ Error generando Prisma Client"
    exit 1
fi
echo "✅ Prisma Client generado"
cd ../..

# Ejecutar migraciones
echo ""
echo "🗄️  Ejecutando migraciones de base de datos..."
cd packages/backend
pnpm db:push
if [ $? -ne 0 ]; then
    echo "⚠️  Error ejecutando migraciones. Verifica tu DATABASE_URL"
    echo "   Puedes continuar, pero algunas funcionalidades pueden no funcionar"
fi
cd ../..

# Verificar Redis
echo ""
echo "🔴 Verificando conexión a Redis..."
if [ -z "$REDIS_URL" ]; then
    echo "⚠️  REDIS_URL no configurado. Algunas funcionalidades pueden no funcionar"
    echo "   Para desarrollo local, puedes usar: redis://localhost:6379"
else
    echo "✅ Redis configurado: $REDIS_URL"
fi

# Build del backend
echo ""
echo "🔨 Compilando backend..."
cd packages/backend
pnpm build
if [ $? -ne 0 ]; then
    echo "❌ Error compilando backend"
    exit 1
fi
echo "✅ Backend compilado"
cd ../..

# Iniciar servicios
echo ""
echo "🚀 Iniciando servicios..."
echo ""
echo "📋 Servicios que se iniciarán:"
echo "   1. Backend (puerto 3001)"
echo "   2. The Generator Next.js (puerto 3002)"
echo "   3. Ghost Studio (puerto 3003)"
echo ""
echo "💡 Presiona Ctrl+C para detener todos los servicios"
echo ""

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo "🛑 Deteniendo servicios..."
    kill $BACKEND_PID $GENERATOR_PID $GHOST_PID 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

# Iniciar backend en background
echo "🔵 Iniciando Backend..."
cd packages/backend
pnpm dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
cd ../..
sleep 5

# Iniciar The Generator en background
echo "🟢 Iniciando The Generator..."
cd apps/the-generator-nextjs
pnpm dev > /tmp/generator.log 2>&1 &
GENERATOR_PID=$!
cd ../..
sleep 3

# Iniciar Ghost Studio en background
echo "🟣 Iniciando Ghost Studio..."
cd apps/ghost-studio
pnpm dev > /tmp/ghost.log 2>&1 &
GHOST_PID=$!
cd ../..

echo ""
echo "✅ Todos los servicios iniciados!"
echo ""
echo "🌐 URLs de acceso:"
echo "   Backend:        http://localhost:3001"
echo "   Health Check:   http://localhost:3001/health"
echo "   The Generator:  http://localhost:3002"
echo "   Ghost Studio:   http://localhost:3003"
echo ""
echo "🧪 Para probar generación musical:"
echo "   1. Abre http://localhost:3002 en tu navegador"
echo "   2. Escribe un prompt musical (ej: 'indie rock energético')"
echo "   3. Click en 'Generar Música'"
echo "   4. Espera 60-120 segundos para la generación"
echo "   5. Verifica que el audio se reproduce correctamente"
echo ""
echo "📝 Ver logs en:"
echo "   Backend:        tail -f /tmp/backend.log"
echo "   The Generator:  tail -f /tmp/generator.log"
echo "   Ghost Studio:   tail -f /tmp/ghost.log"
echo ""

# Esperar a que el usuario presione Ctrl+C
wait

