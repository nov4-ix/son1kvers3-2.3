const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateToken() {
    try {
        // Eliminar tokens antiguos
        await prisma.token.deleteMany({});
        console.log('✅ Tokens antiguos eliminados');

        // Agregar token nuevo
        const token = await prisma.token.create({
            data: {
                hash: 'suno-token-nov4ix-fresh',
                email: 'nov4.ix@gmail.com',
                isActive: true,
                isValid: true,
                usageCount: 0,
                rateLimit: 50,
                tier: 'PRO',
                metadata: JSON.stringify({
                    addedAt: new Date().toISOString(),
                    source: 'manual-refresh',
                    expiry: new Date(1768047788 * 1000).toISOString()
                }),
                encryptedToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdW5vLmNvbS9jbGFpbXMvdXNlcl9pZCI6IjRmMGI2NzBjLTNiMmMtNGI3YS05NDM5LTVlZGNjMmI3ZTJjMyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJyVzQ4bGVFU1FIUFJ6Z3FkMzNzNHJSNzVReCIsInN1bm8uY29tL2NsYWltcy90b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY4MDQ3Nzg4LCJhdWQiOiJzdW5vLWFwaSIsInN1YiI6InVzZXJfMnJXNDhsZUVTUUhQUnpncWQzM3M0clI3NVF4IiwiYXpwIjoiaHR0cHM6Ly9zdW5vLmNvbSIsImZ2YSI6WzAsLTFdLCJpYXQiOjE3NjgwNDQxODgsImlzcyI6Imh0dHBzOi8vYXV0aC5zdW5vLmNvbSIsImppdCI6IjU5OGY4NTc1LWQ5YmItNGQ2NS1hZWJiLTdlODdlOGUxNDgzYSIsInZpeiI6ZmFsc2UsInNpZCI6InNlc3Npb25fNjM2MjY5ODU2MGIxYTYzZjg3NjA2NSIsInN1bm8uY29tL2NsYWltcy9lbWFpbCI6Im5vdjQuaXhAZ21haWwuY29tIiwiaHR0cHM6Ly9zdW5vLmFpL2NsYWltcy9lbWFpbCI6Im5vdjQuaXhAZ21haWwuY29tIn0.E4y2cREctBwuiF9e-4Wytao1IrbeLBV-VkN7pra87kZgedYMD6OSnDLWOTS_YqY853TZBcFqSAVBjna2EuqDBnutVKg8W0AIUsxbLs4ql2z844JNJuS7QwrsJrjEpvxsJyWLlkdsMeLVF5Uc8dLvDPWEOsgPpxQLhhW7kY-y4wK1GSO1dJ47FXD6Utwxi7a0laStnj_ukV6DaT-LBLCZyMMQ9DEhSzcoLDmdmJWHbrTVer7ggmVc-KG1QSQiemDPVmeEDARr2FiDHmfZ6qbTGBokd6zGzkmaPd6dHroa8k8ccXedUJKVPYeZ-aNk8rm-rXXIDSJCSMVKMC4fNUFYjg'
            }
        });

        console.log('✅ Token nuevo agregado exitosamente!');
        console.log('ID:', token.id);
        console.log('Email:', token.email);
        console.log('Hash:', token.hash);
        console.log('Expira:', new Date(1768047788 * 1000).toISOString());
        console.log('Token válido hasta:', new Date(1768047788 * 1000).toLocaleString());

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

updateToken();
