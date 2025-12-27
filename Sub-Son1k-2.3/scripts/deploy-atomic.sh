#!/bin/bash
set -e

echo "🦁 STARTING ATOMIC DEPLOYMENT PROTOCOL"
echo "========================================"

# 1. Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf apps/web-classic/dist
rm -rf .vercel/output

# 2. Build Shared Libraries (Critical for Web Classic)
echo "📦 Building Shared Libraries..."
# We assume turbo handles dependency order, but let's be explicit if needed
# pnpm run build --filter=@super-son1k/shared-utils
# pnpm run build --filter=@super-son1k/shared-ui
# Actually, let's just build web-classic and let Turbo handle upstream deps
echo "🚀 Building Web Classic and dependencies..."
pnpm turbo run build --filter=@super-son1k/web-classic

# 3. Verify Build
if [ ! -d "apps/web-classic/dist" ]; then
  echo "❌ Error: Build failed. 'dist' directory not found."
  exit 1
fi

echo "✅ Build Successful!"

# 4. Prepare Vercel Output Structure (Filesystem API)
echo "📂 Packaging for Vercel..."
mkdir -p .vercel/output/static
cp -r apps/web-classic/dist/* .vercel/output/static/

# Configurar rutas para SPA (Single Page Application)
cat > .vercel/output/config.json <<EOF
{
  "version": 3,
  "routes": [
    { "src": "/assets/(.*)", "headers": { "cache-control": "public, max-age=31536000, immutable" } },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
EOF

echo "📦 Artifact packaged correctly."

# 5. Deploy to Vercel (Production)
echo "🚀 Uploading to Vercel Production..."
# We use --prebuilt to tell Vercel "Dont build, just serve"
vercel deploy --prebuilt --prod

echo "✅ DEPLOYMENT COMPLETE"
