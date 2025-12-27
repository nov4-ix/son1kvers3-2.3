
const BACKEND_URL = 'https://sub-son1k-2-2.fly.dev';
const SECRET = 'son1k-backend-secret-2024-prod';

console.log('🚀 Iniciando Prueba de Generación (JS Nativo)...');
console.log(`📡 URL: ${BACKEND_URL}`);

async function run() {
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
                prompt: "Epic orchestral soundtrack for a sci-fi movie",
                style: "cinematic",
                instrumental: true
            })
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Error HTTP: ${response.status} - ${text}`);
        }

        const data = await response.json();
        console.log('✅ Solicitud aceptada:', data);

        const jobId = data.jobId || data.id;
        if (jobId) {
            console.log(`✨ ID del trabajo: ${jobId}`);
            console.log('⏳ Esperando 5 segundos para verificar estado...');
            await new Promise(r => setTimeout(r, 5000));

            const statusRes = await fetch(`${BACKEND_URL}/api/generation/status/${jobId}`, {
                headers: { 'x-backend-secret': SECRET }
            });
            const statusData = await statusRes.json();
            console.log('📊 Estado:', statusData);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

run();
