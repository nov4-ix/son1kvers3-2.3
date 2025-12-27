
import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';
import axios from 'axios';
import { TokenPoolService } from '../services/tokenPoolService';
import { TokenManager } from '../services/tokenManager';
import { withRetry } from '@super-son1k/shared-utils';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null
});

const prisma = new PrismaClient();
const tokenManager = new TokenManager(prisma);
const tokenPoolService = new TokenPoolService(prisma, tokenManager);

// Configuration for Suno API
const BASE_URL = process.env.GENERATION_API_URL || 'https://ai.imgkits.com/suno';
const MAX_RETRIES = 2; // Automatic retries for job

let worker: Worker;

export function startGenerationWorker() {
    if (worker) return worker;

    console.log('🚀 Generation Worker Starting...');

    worker = new Worker('music-generation', async (job: Job) => {
        const { userId, prompt, style, duration, quality, queueId } = job.data;

        console.log(`[Job ${job.id}] Processing generation for user ${userId}`);

        try {
            // 1. Get User Tier
            const user = await prisma.user.findUnique({ where: { id: userId } });
            const userTier = (user?.tier || 'free').toLowerCase() as 'free' | 'pro' | 'enterprise';

            // 2. Select Optimal Token
            const selection = await tokenPoolService.selectOptimalToken(userTier, userId);
            const token = selection.token;
            const tokenId = selection.tokenId;

            // 3. Update Status to Processing
            await prisma.generationQueue.update({
                where: { id: queueId },
                data: {
                    status: 'processing',
                    startedAt: new Date(),
                    tokenId: 'dynamic-pool-selection' //Ideally we would map back to ID
                }
            });

            // 4. Call Suno API
            const startTime = Date.now();
            const headers = {
                'authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'channel': 'node-api',
                'origin': 'https://www.livepolls.app',
                'referer': 'https://www.livepolls.app/',
                'User-Agent': 'Super-Son1k-2.2-Network',
            };

            const payload = {
                prompt,
                lyrics: '',
                title: '',
                style,
                customMode: false,
                instrumental: false
            };

            const response = await withRetry(async () => {
                return await axios.post(`${BASE_URL}/generate`, payload, {
                    headers,
                    timeout: 45000
                });
            }, {
                maxRetries: MAX_RETRIES,
                initialDelay: 2000
            });

            const responseTime = Date.now() - startTime;
            const success = response.status === 200;

            // 5. Update Token Health
            // Update token health based on success/failure and response time
            await tokenPoolService.updateTokenHealth(tokenId, success, responseTime);

            if (success && response.data) {
                const result = response.data;
                const taskId = result.taskId || result.id || result.task_id;

                console.log(`[Job ${job.id}] Generation started successfully: ${taskId}`);

                // Update Job with Result
                await prisma.generationQueue.update({
                    where: { id: queueId },
                    data: {
                        status: 'completed', // Or 'monitoring' if we want the worker to poll
                        completedAt: new Date(),
                        result: result,
                        creditsUsed: 10 // Example cost
                    }
                });

                return { success: true, taskId, ...result };
            } else {
                throw new Error('API Error: ' + response.status);
            }

        } catch (error: any) {
            console.error(`[Job ${job.id}] Failed:`, error.message);

            // Update Failure Status
            await prisma.generationQueue.update({
                where: { id: queueId },
                data: {
                    status: 'failed',
                    error: error.message
                }
            });

            throw error;
        }
    }, {
        connection,
        concurrency: 5 // Process 5 jobs in parallel
    });

    worker.on('completed', job => {
        console.log(`[Job ${job.id}] Completed!`);
    });

    worker.on('failed', (job, err) => {
        console.log(`[Job ${job?.id}] Failed with ${err.message}`);
    });

    return worker;
}
