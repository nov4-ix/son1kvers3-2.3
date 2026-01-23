# Windows Compatibility Fixes

## 1. FFmpeg Installation (Required for fluent-ffmpeg)
```powershell
# Download FFmpeg from: https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip
# Extract to: C:\ffmpeg\
# Add to PATH: C:\ffmpeg\bin\
```

## 2. Puppeteer Configuration
```powershell
# Puppeteer needs Chrome/Chromium
# Install via: npm install puppeteer --save-dev
```

## 3. File Paths Fix
```typescript
// Replace all __dirname with proper Windows paths
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// For uploads directory
const uploadsDir = join(process.cwd(), 'uploads');
```

## 4. Environment Variables
```bash
# Windows specific paths
FFMPEG_PATH=C:\ffmpeg\bin\ffmpeg.exe
FFPROBE_PATH=C:\ffmpeg\bin\ffprobe.exe
```

## 5. Sharp Binary
```powershell
# Sharp should work, but if issues:
npm rebuild sharp
# or
npm install sharp --platform=win32 --arch=x64
```

## 6. Database Connection
```bash
# Ensure PostgreSQL connection string uses proper escaping
DATABASE_URL="postgresql://user:password@host:5432/db?sslmode=require"
```