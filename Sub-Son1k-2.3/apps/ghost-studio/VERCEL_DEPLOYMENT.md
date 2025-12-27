# Ghost Studio - Vercel Deployment Guide

## 🚀 **Deployment Steps**

### 1. **Install Vercel CLI**
```bash
npm i -g vercel
```

### 2. **Login to Vercel**
```bash
vercel login
```

### 3. **Deploy from Ghost Studio Directory**
```bash
cd apps/ghost-studio
vercel --prod
```

### 4. **Configure Environment Variables in Vercel Dashboard**
Go to: https://vercel.com/dashboard → Ghost Studio → Settings → Environment Variables

Add these variables:
```
VITE_SUPABASE_URL = your_supabase_url
VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
VITE_SUNO_API_KEY = sk_a9e71b7ed3b94f6cbea11df0c8963e21
VITE_APP_URL = https://ghost-studio.son1kvers3.com
VITE_ENVIRONMENT = production
```

### 5. **Configure Custom Domain**
In Vercel Dashboard → Ghost Studio → Settings → Domains:
- Add: `ghost-studio.son1kvers3.com`
- Configure DNS records as instructed

## 🔧 **Supabase CORS Configuration**

### **Current CORS Settings** (from your message):
✅ Bucket created and marked as public
✅ CORS saved with specified origins and methods

### **Recommended CORS Update**:
```json
{
  "allowedOrigins": [
    "http://localhost:3001",
    "https://ghost-studio.son1kvers3.com",
    "https://ghost-studio.vercel.app"
  ],
  "allowedMethods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  "allowedHeaders": ["*"],
  "maxAge": 3600,
  "allowCredentials": false
}
```

### **Answer to Supabase Questions**:

1. **allow_credentials = true?** 
   - **NO** - We don't need credentials for public audio uploads
   - Keep it `false` for security

2. **Size/MIME validation policies?**
   - **YES** - Add these policies for security:

```sql
-- Size limit policy (50MB max)
CREATE POLICY "File size limit" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'ghost-audio' 
  AND octet_length(decode(data, 'base64')) <= 52428800
);

-- MIME type policy (audio only)
CREATE POLICY "Audio files only" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'ghost-audio' 
  AND (storage.extension(name) IN ('mp3', 'wav', 'm4a', 'ogg'))
);
```

## 📋 **Deployment Checklist**

- [ ] Install Vercel CLI
- [ ] Login to Vercel
- [ ] Deploy to production
- [ ] Configure environment variables
- [ ] Set up custom domain
- [ ] Update Supabase CORS
- [ ] Add file size/MIME policies
- [ ] Test upload from production
- [ ] Test full workflow

## 🧪 **Testing Production**

### **Test URLs**:
- **Production**: https://ghost-studio.son1kvers3.com
- **Vercel Default**: https://ghost-studio.vercel.app

### **Test Checklist**:
- [ ] Audio upload works
- [ ] Audio analysis completes
- [ ] Knobs affect prompt generation
- [ ] Suno API responds
- [ ] Generated audio plays
- [ ] A/B comparison works
- [ ] Looper functionality works
- [ ] Mobile responsive

## 🔐 **Security Notes**

1. **File Upload Security**:
   - Size limit: 50MB
   - MIME types: audio only
   - No credentials needed

2. **API Key Security**:
   - Suno API key is exposed in frontend
   - Consider backend proxy for production
   - Monitor usage and costs

3. **CORS Security**:
   - Only allow specific origins
   - No credentials for public uploads
   - Proper headers validation

## 🎵 **Expected Production URL**

**https://ghost-studio.son1kvers3.com**

This will be your production URL once DNS is configured.
