@echo off
echo 🚀 Super-Son1k Windows Setup Script
echo ===================================

echo 📦 Installing dependencies...
call pnpm install

echo 🔧 Setting up FFmpeg...
echo Download FFmpeg from: https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip
echo Extract to: C:\ffmpeg\
echo Add C:\ffmpeg\bin\ to PATH environment variable

echo 🗄️ Setting up database...
echo Make sure PostgreSQL/Supabase is running and DATABASE_URL is configured

echo 🎵 Testing FFmpeg...
where ffmpeg >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ FFmpeg not found in PATH
    echo Please install FFmpeg and add to PATH
) else (
    echo ✅ FFmpeg found
)

echo 🎯 Setup complete!
echo Run 'pnpm dev' to start the application
pause