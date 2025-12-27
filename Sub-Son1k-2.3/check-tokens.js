const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');

async function fetchTokensFromClerk(sessionId) {
  try {
    const url = `https://clerk.suno.com/v1/client/sessions/${sessionId}/tokens?__clerk_api_version=2025-04-10&_clerk_js_version=5.102.1`;

    console.log(`🔗 Intentando obtener tokens de Clerk: ${url}`);

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': 'https://www.livepolls.app/',
        'Origin': 'https://www.livepolls.app'
      },
      timeout: 10000
    });

    console.log('✅ Response from Clerk:', response.data);
    return response.data;

  } catch (error) {
    console.error('❌ Error fetching tokens from Clerk:', error.message);
    return null;
  }
}

async function main() {
  try {
    console.log('🎯 SISTEMA DE SINCRONIZACIÓN DE TOKENS SON1KVERS3');

    // 1. Verificar tokens en DB actuales
    console.log('\n📊 Verificando base de datos...');
    const prisma = new PrismaClient();

    const currentTokens = await prisma.token.findMany();
    console.log(`📈 Tokens actuales en DB: ${currentTokens.length}`);

    // 2. Intentar obtener tokens desde Clerk API
    console.log('\n🔑 Intentando sincronizar tokens desde Clerk...');
    const sessionId = 'sess_34hF1cJNQvzy37extSbO3ZdAHGV'; // Session ID del usuario
    const clerkTokens = await fetchTokensFromClerk(sessionId);

    if (clerkTokens) {
      console.log('🎉 Tokens obtenidos exitosamente desde Clerk!');

      // TODO: Procesar y guardar nuevos tokens JWT
      // Aquí se implementaríamos la lógica para:
      // - Validar JWT tokens
      // - Guardar en base de datos
      // - Verificar expiración
      // - Actualizar pool de tokens
    }

    // 3. Mostrar resumen de tokens
    console.log('\n📋 ---- RESUMEN DE TOKENS ----');
<file_content>

    const tokens = await prisma.token.findMany();
    console.log(`Encontrados ${tokens.length} tokens:`);

    tokens.forEach((token, index) => {
      console.log(`\n--- Token ${index + 1} ---`);
      console.log(`ID: ${token.id}`);
      console.log(`Hash: ${token.hash}`);
      console.log(`Email: ${token.email || 'N/A'}`);
      console.log(`isActive: ${token.isActive}`);
      console.log(`isValid: ${token.isValid}`);
      console.log(`UsageCount: ${token.usageCount}`);
      console.log(`Tier: ${token.tier}`);
      console.log(`expiresAt: ${token.expiresAt}`);
      console.log(`lastUsed: ${token.lastUsed}`);
      console.log(`metadata:`, token.metadata);
      console.log(`encryptedToken (length): ${token.encryptedToken?.length || 0}`);

      if (token.encryptedToken) {
        try {
          const decrypted = Buffer.from(token.encryptedToken, 'base64').toString('utf-8');
          console.log(`Decrypted token (first 100 chars): ${decrypted.substring(0, 100)}...`);
        } catch (error) {
          console.log('Error al decodificar token:', error.message);
        }
      }
      console.log();
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
