# Ghost Studio - Production Configuration

## 🔑 API Keys Configuration

### Suno API Key
```bash
VITE_SUNO_API_KEY=sk_a9e71b7ed3b94f6cbea11df0c8963e21
```

### Supabase Configuration (Needed)
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🌐 Domain Configuration

### Development
- **URL**: `http://localhost:3001`
- **Port**: 3001

### Production
- **URL**: `https://ghost-studio.son1kvers3.com`
- **SSL**: Required for production

## 🚀 Deployment Steps

### 1. Create .env.local file
```bash
# Copy the example file
cp env.local.example .env.local

# Edit with your actual values
nano .env.local
```

### 2. Configure Supabase
1. Create new Supabase project
2. Run the SQL script: `supabase-setup.sql`
3. Configure CORS for:
   - `http://localhost:3001` (development)
   - `https://ghost-studio.son1kvers3.com` (production)

### 3. Test Suno API
```bash
# Test the API key
curl -X POST "https://api.sunoapi.com/v1/suno/upload-and-cover" \
  -H "Authorization: Bearer sk_a9e71b7ed3b94f6cbea11df0c8963e21" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### 4. Build for Production
```bash
npm run build
```

### 5. Deploy to ghost-studio.son1kvers3.com
- Upload `dist/` folder to your hosting provider
- Configure SSL certificate
- Set up domain DNS

## 🔐 Security Notes

⚠️ **IMPORTANT**: The Suno API key is exposed in the frontend bundle. For production, consider:

1. **Backend Proxy**: Create a backend service to hide the API key
2. **Rate Limiting**: Implement rate limiting on your backend
3. **User Authentication**: Add user auth to prevent abuse
4. **Monitoring**: Track API usage and costs

## 📊 Expected Costs

- **Suno API**: ~$0.10-0.50 per generation
- **Supabase Storage**: ~$0.02 per GB
- **Bandwidth**: Depends on usage

## 🧪 Testing Checklist

- [ ] Audio upload works
- [ ] Audio analysis completes
- [ ] Knobs affect prompt generation
- [ ] Suno API responds correctly
- [ ] Generated audio plays
- [ ] A/B comparison works
- [ ] Looper functionality works
- [ ] Mobile responsive design
- [ ] Error handling works
- [ ] Loading states display

## 🐛 Common Issues

1. **CORS Errors**: Check Supabase CORS configuration
2. **API Key Invalid**: Verify Suno API key is active
3. **File Upload Fails**: Check Supabase bucket permissions
4. **Audio Analysis Fails**: Ensure Web Audio API support
5. **Generation Timeout**: Suno API can take 2-5 minutes

## 📞 Support

- **Suno API Docs**: https://docs.sunoapi.com
- **Supabase Docs**: https://supabase.com/docs
- **Ghost Studio Issues**: Check console for detailed errors
