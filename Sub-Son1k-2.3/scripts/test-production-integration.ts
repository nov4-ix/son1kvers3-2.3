// Using native fetch


const BACKEND_URL = 'https://sub-son1k-2-2.fly.dev';

async function runTests() {
    console.log('🚀 Starting Production Integration Tests...');
    console.log(`Target: ${BACKEND_URL}`);

    // 1. Health Check
    try {
        const healthRes = await fetch(`${BACKEND_URL}/health`);
        const healthData = await healthRes.json();
        console.log('✅ Health Check:', healthRes.status === 200 ? 'PASSED' : 'FAILED');
        console.log('   Details:', JSON.stringify(healthData));
    } catch (e) {
        console.error('❌ Health Check Failed:', e);
    }

    // 2. Pixel AI Check
    try {
        // Expecting 401 because we don't have a token, but checking if endpoint exists
        const pixelRes = await fetch(`${BACKEND_URL}/api/pixel-memory`);
        console.log('✅ Pixel AI Endpoint Exists:', pixelRes.status !== 404 ? 'PASSED' : 'FAILED');

        if (pixelRes.status === 401) {
            console.log('   Auth check working correctly (401 received)');
        }
    } catch (e) {
        console.error('❌ Pixel AI Check Failed:', e);
    }

    // 3. Music Generation Endpoint Check
    try {
        const genRes = await fetch(`${BACKEND_URL}/api/generation/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        // Should fail with auth or validation error, but not 404
        console.log('✅ Generation Endpoint Exists:', genRes.status !== 404 ? 'PASSED' : 'FAILED');
    } catch (e) {
        console.error('❌ Generation Check Failed:', e);
    }

    console.log('🏁 Tests Completed');
}

runTests();
