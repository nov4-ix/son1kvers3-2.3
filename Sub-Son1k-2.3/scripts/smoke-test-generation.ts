
import fetch from 'node-fetch';

const BACKEND_URL = 'https://sub-son1k-2-2.fly.dev';
const SECRET = 'son1k-backend-secret-2024-prod'; // Recuperado de .env.production.local

async function testGeneration() {
    console.log('🚀 Iniciando Prueba de Generación (Smoke Test)...');
    console.log(`📡 URL: ${BACKEND_URL}`);

    try {
        // 1. Solicitar Generación
        console.log('🎵 Solicitando nueva canción...');
        const response = await fetch(`${BACKEND_URL}/api/generation/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-backend-secret': SECRET
            },
            body: JSON.stringify({
                prompt: "A cyberpunk synthwave track with deep bass and neon vibes",
                style: "synthwave",
                instrumental: true
            })
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} - ${await response.text()}`);
        }

        const data = await response.json();
        console.log('✅ Solicitud aceptada:', data);

        const jobId = data.jobId || data.id;
        if (!jobId) throw new Error('No se recibió jobId');

        // 2. Polling (Simulado corto)
        console.log(`⏳ Verificando estado del trabajo ${jobId}...`);

        // Esperar 5 segundos
        await new Promise(r => setTimeout(r, 5000));

        const statusResponse = await fetch(`${BACKEND_URL}/api/generation/status/${jobId}`, {
            headers: { 'x-backend-secret': SECRET }
        });

        const statusData = await statusResponse.json();
        console.log('📊 Estado actual:', statusData);

        if (statusData.status === 'failed') {
            console.error('❌ La generación falló:', statusData.error);
        } else {
            console.log('✨ El sistema está procesando correctamente (o en cola).');
        }

    } catch (error) {
        console.error('❌ FALLÓ LA PRUEBA:', error);
    }
}

testGeneration();
