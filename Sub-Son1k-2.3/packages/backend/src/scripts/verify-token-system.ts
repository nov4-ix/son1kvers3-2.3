
import { PrismaClient } from '@prisma/client';
import { TokenManager } from '../services/tokenManager';
import { env } from '../lib/config';

async function verifyTokenSystem() {
    console.log('🚀 Starting Token System Verification (Silent Harvester Protocol)...');

    const prisma = new PrismaClient();
    const tokenManager = new TokenManager(prisma);

    try {
        // 1. Simulate "Silent Harvest" (Extension adding a token)
        console.log('\n🌾 Step 1: Simulating Silent Harvest...');
        const dummyToken = `eyJh...dummy-token-${Date.now()}`;
        const dummyEmail = `test-harvester-${Date.now()}@neural-engine.com`;

        // We use a try-catch here because in a real scenario, we might not have a valid token
        // But for this test, we just want to see if the logic holds up to the point of validation
        // Since we can't easily mock the external API validation without more complex setup,
        // we might hit a validation error if the TokenManager enforces it strictly.
        // Let's see if we can bypass validation or if we need to mock it.

        // Looking at TokenManager, addToken calls validateTokenWithGenerationAPI.
        // If that fails, addToken fails.
        // We might need to mock validateTokenWithGenerationAPI or use a flag if available.
        // Or, we can just try to acquire an EXISTING token if any.

        // For this test, let's try to add it. If it fails due to validation, we'll know the flow reached validation.
        // To make this a true "success" test, we would need to mock the validation.
        // However, since I can't easily mock the internal method of the instance I just created without a library like sinon,
        // I will monkey-patch it for this test script.

        tokenManager.validateTokenWithGenerationAPI = async () => ({ isValid: true, credits: 100 });
        console.log('   (Mocked Neural Engine Validation for test)');

        const tokenId = await tokenManager.addToken(
            dummyToken,
            undefined, // No userId for extension
            dummyEmail,
            'FREE',
            { source: 'verification-script', label: 'test-token' }
        );
        console.log(`✅ Token Harvested & Stored! ID: ${tokenId}`);

        // 2. Simulate Frontend Acquisition (Locking)
        console.log('\n🔐 Step 2: Simulating Frontend Acquisition...');
        const userId = 'test-user-id'; // specific user

        const acquired = await tokenManager.acquireToken(userId, 'FREE');

        if (acquired) {
            console.log(`✅ Token Acquired! ID: ${acquired.tokenId}`);
            console.log(`   Token Content: ${acquired.token.substring(0, 10)}...`);

            // 3. Verify Lock (Try to acquire again - should ideally get a DIFFERENT token or fail if only 1 exists)
            console.log('\n🔒 Step 3: Verifying Lock (Attempting re-acquisition)...');
            const acquiredAgain = await tokenManager.acquireToken('another-user', 'FREE');

            if (acquiredAgain && acquiredAgain.tokenId === acquired.tokenId) {
                console.error('❌ CRITICAL: Got the SAME token! Redis locking failed.');
            } else {
                console.log('✅ Lock Verified! (Did not get the same token immediately)');
            }

            // 4. Release Lock
            console.log('\n🔓 Step 4: Releasing Token...');
            await tokenManager.releaseToken(acquired.tokenId);
            console.log('✅ Token Released.');

        } else {
            console.error('❌ Failed to acquire token.');
        }

        // Cleanup
        console.log('\n🧹 Cleanup...');
        await tokenManager.removeToken(tokenId);
        console.log('✅ Test Token Removed.');

    } catch (error) {
        console.error('❌ Verification Failed:', error);
    } finally {
        await tokenManager.close();
        await prisma.$disconnect();
    }
}

verifyTokenSystem();
