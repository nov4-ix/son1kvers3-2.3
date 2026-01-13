const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addToken() {
    try {
        const token = await prisma.token.create({
            data: {
                hash: 'suno-token-nov4ix',
                email: 'nov4.ix@gmail.com',
                isActive: true,
                isValid: true,
                usageCount: 0,
                rateLimit: 50,
                tier: 'PRO',
                metadata: JSON.stringify({
                    addedAt: new Date().toISOString(),
                    source: 'manual'
                }),
                encryptedToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdW5vLmNvbS9jbGFpbXMvdXNlcl9pZCI6IjRmMGI2NzBjLTNiMmMtNGI3YS05NDM5LTVlZGNjMmI3ZTJjMyIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvY2xlcmtfaWQiOiJ1c2VyXzJyVzQ4bGVFU1FIUFJ6Z3FkMzNzNHJSNzVReCIsInN1bm8uY29tL2NsYWltcy90b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY4MDE1MzcyLCJhdWQiOiJzdW5vLWFwaSIsInN1YiI6InVzZXJfMnJXNDhsZUVTUUhQUnpncWQzM3M0clI3NVF4IiwiYXpwIjoiaHR0cHM6Ly9zdW5vLmNvbSIsImZ2YSI6WzAsLTFdLCJpYXQiOjE3NjgwMTE3NzIsImlzcyI6Imh0dHBzOi8vYXV0aC5zdW5vLmNvbSIsImppdCI6IjkxYzI5ZmM4LWZkZWMtNDZhYi1hNGIzLWZjYjg0NzlkZDZmNSIsInZpeiI6ZmFsc2UsInNpZCI6InNlc3Npb25fNjM2MjY5ODU2MGIxYTYzZjg3NjA2NSIsInN1bm8uY29tL2NsYWltcy9lbWFpbCI6Im5vdjQuaXhAZ21haWwuY29tIiwiaHR0cHM6Ly9zdW5vLmFpL2NsYWltcy9lbWFpbCI6Im5vdjQuaXhAZ21haWwuY29tIn0.kpRKSDuN4Y5xqgV3SJPHiJbaeJCBETUX8gnY3Ke5hEtNKUaNY4Nb3xGBfyPCEXvStfj5vvKWw86p1_VZrpnaAdC22Yg9h5YKFpv1i7M30Jjtban3IuiLolb8HUOLijnaW49Gb5cDrQYQg4fv-mHgNW4Dlm-Q_pu_PLIX7nplKqQx-F2AcN2IkOt-jpm1cRp4klk8J2NZwbyHMFKTj54ju7dA5tIK6WU0DpyuTEdq2pQPH5fOHdNXnDx2auj9FlN6YlrCjPdTGVd_zYci5aoWJmar1SzLg8dXAx9G8GS_TA6MiOgbfrschZ_CHD-eQCAN3rmCShw9ECtb8VveGEdUCw'
            }
        });

        console.log('✅ Token agregado exitosamente!');
        console.log('ID:', token.id);
        console.log('Hash:', token.hash);
        console.log('Email:', token.email);
        console.log('Token expira:', new Date(1768015372 * 1000).toISOString());
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 'P2002') {
            console.log('⚠️  Este token ya existe en la base de datos');
        }
    } finally {
        await prisma.$disconnect();
    }
}

addToken();
