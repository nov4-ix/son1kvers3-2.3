# Ghost Studio - Supabase Configuration Guide

## 🌐 Domains Configuration

### Development (Local)
- **URL**: `http://localhost:3001`
- **CORS**: Allow localhost:3001

### Production
- **URL**: `https://ghost-studio.son1kvers3.com`
- **CORS**: Allow ghost-studio.son1kvers3.com

## 🗄️ Supabase Storage Setup

### 1. Create Bucket
```sql
-- Create bucket for audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('ghost-audio', 'ghost-audio', true);
```

### 2. Storage Policies
```sql
-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'ghost-audio');

-- Allow authenticated uploads
CREATE POLICY "Authenticated upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'ghost-audio' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own files
CREATE POLICY "Users can update own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'ghost-audio' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. CORS Configuration
In Supabase Dashboard → Storage → Settings → CORS:

```json
{
  "allowedOrigins": [
    "http://localhost:3001",
    "https://ghost-studio.son1kvers3.com",
    "https://son1kvers3.com"
  ],
  "allowedMethods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  "allowedHeaders": ["*"],
  "maxAge": 3600
}
```

## 🔑 Environment Variables

### Development (.env.local)
```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Suno API
VITE_SUNO_API_KEY=your_suno_key

# Development
VITE_APP_URL=http://localhost:3001
VITE_ENVIRONMENT=development
```

### Production (.env.production)
```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Suno API
VITE_SUNO_API_KEY=your_suno_key

# Production
VITE_APP_URL=https://ghost-studio.son1kvers3.com
VITE_ENVIRONMENT=production
```

## 📁 File Structure for Storage

```
ghost-audio/
├── audio/
│   ├── {user_id}/
│   │   ├── uploads/
│   │   ├── recordings/
│   │   └── exports/
│   └── temp/
└── covers/
    └── {task_id}/
```

## 🚀 Deployment Checklist

- [ ] Create Supabase project
- [ ] Configure storage bucket
- [ ] Set up CORS policies
- [ ] Add domain to allowed origins
- [ ] Test file upload/download
- [ ] Configure DNS for ghost-studio.son1kvers3.com
- [ ] Set up SSL certificate
- [ ] Deploy to production
- [ ] Test end-to-end workflow

## 🔐 Security Considerations

1. **API Keys**: Never expose Suno API key in frontend
2. **File Size Limits**: Set reasonable limits (50MB max)
3. **File Types**: Only allow audio formats
4. **Rate Limiting**: Implement rate limiting for API calls
5. **User Authentication**: Consider adding auth for production

## 📊 Monitoring

- Track storage usage
- Monitor API call limits
- Log generation requests
- Track user engagement
- Monitor error rates
