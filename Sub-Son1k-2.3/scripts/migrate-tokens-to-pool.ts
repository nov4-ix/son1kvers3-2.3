
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../packages/backend/.env') });

const prisma = new PrismaClient();

async function migrateTokens() {
    console.log('🔄 Starting migration from Token to TokenPool...');

    try {
        const tokens = await prisma.token.findMany({
            where: { isValid: true }
        });

        console.log(`Found ${tokens.length} valid tokens in legacy table.`);

        for (const token of tokens) {
            console.log(`Migrating token ${token.id.substring(0, 8)}...`);

            // Check if exists in pool
            const existing = await prisma.tokenPool.findFirst({
                where: { token: token.hash } // Using hash as unique identifier surrogate
            });

            if (!existing) {
                await prisma.tokenPool.create({
                    data: {
                        token: token.hash, // Storing hash as display token identifier? Or should we store actual token?
                        // Actually TokenPool.token is unique string. Token.hash is unique string.
                        // But TokenPool.encryptedToken is what we need.
                        encryptedToken: token.encryptedToken || '',
                        source: 'migration',
                        isActive: token.isActive,
                        healthScore: token.isValid ? 100 : 0,
                        tier: token.tier.toLowerCase(),
                        priority: token.tier === 'ENTERPRISE' ? 10 : (token.tier === 'PREMIUM' ? 5 : 0),
                        dailyLimit: token.rateLimit * 10, // heuristic
                        resetAt: new Date(new Date().setHours(24, 0, 0, 0)), // Next midnight
                        // Map other fields
                    }
                });
                console.log(`✅ Migrated ${token.id}`);
            } else {
                console.log(`⏭️ Skipped (already in pool) ${token.id}`);
            }
        }

        console.log('✨ Migration complete.');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

migrateTokens();
