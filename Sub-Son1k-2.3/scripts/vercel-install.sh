#!/bin/bash
echo "🚀 FORCING PNPM INSTALL ON VERCEL"
npm install -g pnpm@8.9.0
pnpm install --no-frozen-lockfile
