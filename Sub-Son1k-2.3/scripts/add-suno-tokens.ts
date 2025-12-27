import { TokenManager } from '../packages/backend/src/services/tokenManager.ts';

const prisma = new PrismaClient();
const sunoTokens = (process.env.SUNO_TOKENS?.split(',').filter(t => t.trim())) ?? [];

async function main() {
    if (sunoTokens.length === 0) {
        console.error('⚠️  SUNO_TOKENS no está configurado en el entorno');
        process.exit(1);
    }
    const manager = new TokenManager(prisma);
    console.log(`🔧 Añadiendo ${sunoTokens.length} token(s) a la base de datos…`);
    for (const token of sunoTokens) {
        await manager.addToken(token);
        console.log('✅ Token añadido');
    }
    await prisma.$disconnect();
    console.log('🎉 Todos los tokens fueron insertados');
}

main().catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
});
