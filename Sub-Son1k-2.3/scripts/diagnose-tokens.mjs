
// Diagnose Tokens Script (ESM)
// Run with: node scripts/diagnose-tokens.mjs

const BACKEND_URL = 'https://sub-son1k-2-2.fly.dev';
const SECRET = 'son1k-backend-secret-2024-prod'; // Confirmado del ENV

async function diagnose() {
    console.log('🕵️‍♂️ Diagnostics Start ->', BACKEND_URL);

    try {
        // 1. Check Pool Status
        console.log('\n1️⃣  Checking Token Pool Status...');
        const statusRes = await fetch(`${BACKEND_URL}/api/tokens/pool/status`, {
            headers: {
                'Authorization': `Bearer ${SECRET}`
            }
        });

        if (!statusRes.ok) {
            console.error('❌ Status check failed:', statusRes.status, await statusRes.text());
        } else {
            const statusData = await statusRes.json();
            console.log('✅ Pool Status:', JSON.stringify(statusData, null, 2));

            if (statusData.data?.healthyTokens === 0) {
                console.error('❌ CRITICAL: 0 Healthy Tokens reported by backend!');
            }
        }

        // 2. Try to Generate (Smoke Test)
        console.log('\n2️⃣  Attempting Real Generation...');
        const genRes = await fetch(`${BACKEND_URL}/api/generation/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SECRET}`
            },
            body: JSON.stringify({
                prompt: "Test song minimal diagnostics",
                style: "minimal",
                duration: 10,
                custom_mode: false
            })
        });

        if (!genRes.ok) {
            const errText = await genRes.text();
            console.error('❌ Generation Failed:', genRes.status, errText);
        } else {
            const genData = await genRes.json();
            console.log('✅ Generation STARTED Successfully!');
            console.log('   ID:', genData.data?.generationId);
            console.log('   SunoID:', genData.data?.sunoId);
        }

    } catch (err) {
        console.error('💥 Fatal Error:', err);
    }
}

diagnose();
