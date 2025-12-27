import { tokenManager } from './TokenManager';

interface GenerationParams {
    gpt_description_prompt: string;
    tags?: string;
    title?: string;
    make_instrumental?: boolean;
    mv?: string;
}

interface GenerationResponse {
    id: string;
    status: 'pending' | 'running' | 'complete' | 'error';
    audio_url?: string;
    video_url?: string;
    image_url?: string;
    title?: string;
    tags?: string;
}

class SunoService {
    private readonly SUNO_API_URL: string;
    private readonly MAX_POLL_ATTEMPTS = 60;
    private readonly POLL_INTERVAL = 5000;

    constructor() {
        this.SUNO_API_URL = process.env.NEXT_PUBLIC_SUNO_API_URL || 'https://studio-api.suno.ai/api';
        console.log('[Suno] Initialized with API URL:', this.SUNO_API_URL);
    }

    async generate(params: GenerationParams): Promise<string> {
        console.log('[Suno] Starting generation...');

        const token = tokenManager.getNextToken();
        if (!token) {
            throw new Error('No valid tokens available. Please install the Chrome Extension and visit suno.com');
        }

        try {
            console.log('[Suno] Starting REAL generation...');
            console.log('[Suno Complement] Attempt 1 with token:', token.substring(0, 20) + '...');

            const response = await fetch(`${this.SUNO_API_URL}/generate/v2/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...params,
                    mv: params.mv || 'chirp-v3-5'
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[Suno] Generation failed:', response.status, errorText);

                if (response.status === 401 || response.status === 403) {
                    tokenManager.markTokenFailure(token);
                }

                throw new Error(`Generation failed: ${response.status}`);
            }

            const data = await response.json();
            const taskId = data.id || data[0]?.id;

            if (!taskId) {
                throw new Error('No task ID returned');
            }

            console.log('[Suno] ✅ Generated with taskId:', taskId);
            tokenManager.markTokenSuccess(token);

            return taskId;

        } catch (error) {
            console.error('[Suno] Generation error:', error);
            throw error;
        }
    }

    async pollUntilComplete(taskId: string): Promise<GenerationResponse> {
        console.log('[Suno Polling] Starting polling for taskId:', taskId);

        for (let attempt = 1; attempt <= this.MAX_POLL_ATTEMPTS; attempt++) {
            try {
                console.log(`[Suno Polling] Attempt ${attempt}/${this.MAX_POLL_ATTEMPTS}`);

                const results = await this.getStatus(taskId);

                if (!results || results.length === 0) {
                    console.warn('[Suno Polling] No results returned');
                    await this.sleep(this.POLL_INTERVAL);
                    continue;
                }

                const track = results[0];
                console.log('[Suno Polling] Status:', track.status);

                if (track.status === 'complete' && track.audio_url) {
                    console.log('[Suno Polling] ✅ Complete!');
                    return track;
                }

                if (track.status === 'error') {
                    throw new Error('Generation failed');
                }

                console.log(`[Suno Polling] Still ${track.status}, waiting ${this.POLL_INTERVAL}ms...`);
                await this.sleep(this.POLL_INTERVAL);

            } catch (error) {
                console.error('[Suno Polling] Error on attempt', attempt, error);

                if (attempt === this.MAX_POLL_ATTEMPTS) {
                    throw error;
                }

                await this.sleep(this.POLL_INTERVAL);
            }
        }

        throw new Error('Timeout: Generation took too long');
    }

    private async getStatus(taskId: string): Promise<GenerationResponse[]> {
        const token = tokenManager.getNextToken();
        if (!token) throw new Error('No tokens available');

        const response = await fetch(`${this.SUNO_API_URL}/feed/?ids=${taskId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error(`Status check failed: ${response.status}`);
        return await response.json();
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async validateToken(token: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.SUNO_API_URL}/billing/info/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.ok;
        } catch {
            return false;
        }
    }
}

export default SunoService;
export const sunoService = new SunoService();
