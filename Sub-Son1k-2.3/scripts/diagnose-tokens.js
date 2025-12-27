
const fetch = require('node-fetch'); // Intentaremos usar node-fetch si está, si no, nativo

const BACKEND_URL = 'https://sub-son1k-2-2.fly.dev';
const SECRET = 'son1k-backend-secret-2024-prod';

async function diagnoseTokens() {
    console.log('🕵️‍♂️ Iniciando Diagnóstico Profundo de Tokens...');

    try {
        // 1. Obtener estado general
        console.log('📊 Consultando estado del pool...');
        const statusRes = await fetch(`${BACKEND_URL}/api/tokens/pool/status`);
        const statusData = await statusRes.json();
        console.log('Status Response:', JSON.stringify(statusData, null, 2));

        // 2. Intentar forzar health check (si existe endpoint admin, si no, simular uso)
        // No tenemos endpoint público para forzar health check, pero podemos intentar usar endpoints protegidos
        // para ver logs del servidor si tuvieramos acceso, pero aquí solo somos cliente.

        // Si dice que hay healthy tokens pero falla la generación, es sospechoso.
        if (statusData.data?.healthyTokens > 0) {
            console.log('⚠️ El sistema reporta tokens sanos. Intentaremos validación manual uno por uno si fuera posible (no lo es sin acceso a DB directa).');
        } else {
            console.error('❌ El sistema reporta 0 tokens sanos. ¡Se requiere re-harvesrting!');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

// Fallback para fetch nativo en Node 18+
if (!globalThis.fetch) {
    globalThis.fetch = fetch;
}

diagnoseTokens();
