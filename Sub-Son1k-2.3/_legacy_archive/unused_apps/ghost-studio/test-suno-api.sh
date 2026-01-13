#!/bin/bash
# Ghost Studio - Suno API Test Script

echo "🎵 Testing Suno API Configuration..."

# Check if API key is set
if [ -z "$VITE_SUNO_API_KEY" ]; then
    echo "❌ VITE_SUNO_API_KEY not set"
    echo "Set it with: export VITE_SUNO_API_KEY=sk_a9e71b7ed3b94f6cbea11df0c8963e21"
    exit 1
fi

echo "✅ API Key found: ${VITE_SUNO_API_KEY:0:10}..."

# Test API endpoint
echo "🔍 Testing Suno API endpoint..."

response=$(curl -s -w "%{http_code}" -X POST "https://api.sunoapi.com/suno/cover" \
  -H "Authorization: Bearer $VITE_SUNO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "uploadUrl": "https://example.com/test.mp3",
    "customMode": true,
    "instrumental": false,
    "model": "V4_5PLUS",
    "prompt": "test prompt",
    "style": "pop",
    "title": "Test Song"
  }')

http_code="${response: -3}"
response_body="${response%???}"

echo "📊 Response Code: $http_code"

if [ "$http_code" = "200" ] || [ "$http_code" = "400" ]; then
    echo "✅ Suno API is accessible"
    echo "📝 Response: $response_body"
else
    echo "❌ Suno API test failed"
    echo "📝 Response: $response_body"
fi

echo ""
echo "🌐 Domain Configuration:"
echo "   Development: http://localhost:3001"
echo "   Production:  https://ghost-studio.son1kvers3.com"
echo ""
echo "📋 Next Steps:"
echo "   1. Configure Supabase project"
echo "   2. Run supabase-setup.sql"
echo "   3. Set up CORS for both domains"
echo "   4. Test audio upload"
echo "   5. Deploy to production"
