// 🚀 Generation Worker con Groq Songwriter Integration
import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';
import axios from 'axios';
import { TokenPoolService } from '../services/tokenPoolService';
import { TokenManager } from '../services/tokenManager';
import { withRetry } from '@super-son1k/shared-utils';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
// DISABLED FOR LOCAL DEV - This was blocking server startup
// const connection = new Redis(REDIS_URL, {
//     maxRetriesPerRequest: null
// });
const connection: any = null; // Placeholder when Redis is not available

const prisma = new PrismaClient();
const tokenManager = new TokenManager(prisma);
const tokenPoolService = new TokenPoolService(prisma, tokenManager);

// Configuration
const BASE_URL = process.env.GENERATION_API_URL || 'https://ai.imgkits.com/suno';
const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY; // Support both
const MAX_RETRIES = 2;

let worker: Worker;

// 🧠 Groq Songwriter Service
async function generateSongStructure(prompt: string, userStyle: string): Promise<{ title: string; lyrics: string; style: string }> {
    if (!GROQ_API_KEY) {
        console.warn('⚠️ GROQ_API_KEY missing, skipping AI Songwriter mode.');
        return {
            title: '',
            lyrics: '',
            style: userStyle
        };
    }

    console.log('🧠 Invoking Groq AI Songwriter...');
    try {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama3-70b-8192", // Powerful & fast
            messages: [
                {
                    role: "system",
                    content: `You are a world-class Songwriter and Music Producer AI. Your goal is to turn a simple user prompt into a hit song structure.
                    
                    OUTPUT FORMAT (JSON ONLY):
                    {
                        "title": "Creative Song Title",
                        "style": "Enhanced Music Style (e.g., 'Uplifting Pop, 120bpm, Female Vocals, Synthesizer')",
                        "lyrics": "Complete song lyrics with structure tags [Verse], [Chorus], [Bridge], etc."
                    }
                    
                    RULES:
                    1. Lyrics MUST be structured with [Verse], [Chorus], [Bridge], [Outro].
                    2. Use metatags like [Instrumental Solo], [Drop], [Slow Down] if appropriate.
                    3. Determine the best style if user's style is vague.
                    4. Lyrics should be creative, rhyming, and fit the mood.
                    5. Return ONLY valid JSON.`
                },
                {
                    role: "user",
                    content: `User Prompt: "${prompt}". User Style Preference: "${userStyle}". 
                    Create a full song structure.`
                }
            ],
            response_format: { type: "json_object" }
        }, {
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const content = response.data.choices[0].message.content;
        const result = JSON.parse(content);

        console.log(`🧠 Groq generated: "${result.title}" (${result.style})`);
        return result;

    } catch (error: any) {
        console.error('❌ Groq Songwriter failed:', error.message);
        // Fallback to basic mode
        return {
            title: '',
            lyrics: '',
            style: userStyle
        };
    }
}

export function startGenerationWorker() {
    if (worker) return worker;

    // Skip worker if no Redis connection
    if (!connection) {
        console.log('⚠️  Generation Worker: Skipping BullMQ worker (Redis not available)');
        return null;
    }

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

            // 3. Update Status to Processing (Songwriting Phase)
            await prisma.generationQueue.update({
                where: { id: queueId },
                data: {
                    status: 'processing',
                    startedAt: new Date(),
                    tokenId: 'dynamic-pool-selection'
                }
            });

            // 4. GENERATE LYRICS & STRUCTURE (Groq)
            // Solo si el usuario no proveyó letras explícitas (asumimos prompt es descripción)
            // Si el prompt es muy corto, Groq lo expandirá.
            const songData = await generateSongStructure(prompt, style);

            // 5. Call Suno API
            const startTime = Date.now();
            const headers = {
                'authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'channel': 'node-api',
                'origin': 'https://www.livepolls.app',
                'referer': 'https://www.livepolls.app/',
                'User-Agent': 'Super-Son1k-2.2-Network',
            };

            // Usamos Custom Mode si Groq generó letras, sino Default Mode
            const isCustomMode = songData.lyrics.length > 0;

            const payload = isCustomMode ? {
                // CUSTOM MODE (Lyrics + Style)
                prompt: songData.lyrics, // En custom mode, prompt es la letra
                tags: songData.style,    // En custom mode, tags es el estilo
                title: songData.title,
                make_instrumental: false,
                mv: "chirp-v3-5" // Modelo v3.5
            } : {
                // DEFAULT MODE (Description only)
                gpt_description_prompt: `${prompt} ${style}`,
                mv: "chirp-v3-5",
                make_instrumental: false
            };

            // Endpoint cambia ligeramente dependiendo de la API wrapper, pero usualmente /generate maneja ambos
            // Ajustamos según la API que usas:
            // Si es la API de imgkits/node-api, el payload es unico.
            // Voy a usar el payload genérico que se adapta.

            const finalPayload = {
                prompt: isCustomMode ? songData.lyrics : prompt,
                tags: isCustomMode ? songData.style : style,
                title: songData.title || '',
                make_instrumental: false,
                mv: "chirp-v3-5",
                continue_clip_id: null,
                continue_at: null
            };

            const response = await withRetry(async () => {
                // Logica dual: endpoint suele ser /generate/v2/ para custom y /generate/description-mode para description
                // Pero tu wrapper usa /generate unificado. Enviamos el payload enriquecido.
                // IMPORTANTE: Si es custom mode, Suno espera 'prompt' con letras y 'tags' con estilo.

                return await axios.post(`${BASE_URL}/generate`, finalPayload, {
                    headers,
                    timeout: 60000 // Aumentamos timeout para Suno
                });
            }, {
                maxRetries: MAX_RETRIES,
                initialDelay: 2000
            });

            const responseTime = Date.now() - startTime;
            const success = response.status === 200;

            // 6. Update Token Health
            await tokenPoolService.updateTokenHealth(tokenId, success, responseTime);

            if (success && response.data) {
                const result = response.data;
                const taskId = result.taskId || result.id || result.task_id;

                console.log(`[Job ${job.id}] Generation started successfully: ${taskId}`);

                // Update Job with Result
                await prisma.generationQueue.update({
                    where: { id: queueId },
                    data: {
                        status: 'completed',
                        completedAt: new Date(),
                        result: result,
                        creditsUsed: 10
                    }
                });

                return { success: true, taskId, ...result };
            } else {
                throw new Error('API Error: ' + response.status);
            }

        } catch (error: any) {
            console.error(`[Job ${job.id}] Failed:`, error.message);

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
        concurrency: 5
    });

    worker.on('completed', job => {
        console.log(`[Job ${job.id}] Completed!`);
    });

    worker.on('failed', (job, err) => {
        console.log(`[Job ${job?.id}] Failed with ${err.message}`);
    });

    return worker;
}
