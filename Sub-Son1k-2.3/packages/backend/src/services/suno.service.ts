import { SunoToken } from './token-pool-manager';

export interface SunoClip {
    id: string;
    video_url: string;
    audio_url: string;
    image_url: string;
    image_large_url: string;
    major_model_version: string;
    model_name: string;
    metadata: {
        tags: string;
        prompt: string;
        gpt_description_prompt?: string;
        audio_prompt_id?: string;
        history?: any;
        concat_history?: any;
        type: string;
        duration?: number;
        refund_credits?: boolean;
        stream: boolean;
        error_type?: string;
        error_message?: string;
    };
    is_liked: boolean;
    user_id: string;
    display_name: string;
    handle: string;
    is_handle_updated: boolean;
    avatar_image_url: string;
    is_trashed: boolean;
    reaction: any;
    created_at: string;
    status: string;
    title: string;
    play_count: number;
    upvote_count: number;
    is_public: boolean;
}

export class SunoService {
    private readonly BASE_URL = 'https://studio-api.suno.ai';
    // private readonly CLERK_URL = 'https://clerk.suno.ai'; // Not used directly here

    /**
     * Generación simple (modo descripción)
     */
    async generate(params: {
        gpt_description_prompt: string;
        make_instrumental?: boolean;
        wait_audio?: boolean;
    }, token: SunoToken): Promise<SunoClip[]> {

        console.log(`🎵 Generating with token ${token.sessionId}...`);

        const response = await fetch(`${this.BASE_URL}/api/generate/v2/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': token.cookie,
                'Authorization': `Bearer ${token.jwt}`,
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            body: JSON.stringify({
                gpt_description_prompt: params.gpt_description_prompt,
                make_instrumental: params.make_instrumental ?? false,
                mv: 'chirp-v3-5', // Modelo actual de Suno
                prompt: ''
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Suno API error (${response.status}): ${errorText}`);
        }

        const data: any = await response.json();

        // Si wait_audio es true, esperar a que se complete
        if (params.wait_audio) {
            console.log('⏳ Waiting for audio completion...');
            return await this.waitForCompletion(data.clips, token);
        }

        return data.clips;
    }

    /**
     * Generación personalizada (custom mode)
     */
    async customGenerate(params: {
        prompt: string;
        tags: string;
        title: string;
        make_instrumental?: boolean;
        continue_clip_id?: string;
        continue_at?: number;
    }, token: SunoToken): Promise<SunoClip[]> {

        console.log(`🎵 Custom generating with token ${token.sessionId}...`);

        const response = await fetch(`${this.BASE_URL}/api/generate/v2/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': token.cookie,
                'Authorization': `Bearer ${token.jwt}`,
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            body: JSON.stringify({
                prompt: params.prompt,
                tags: params.tags,
                title: params.title,
                make_instrumental: params.make_instrumental ?? false,
                continue_clip_id: params.continue_clip_id,
                continue_at: params.continue_at,
                mv: 'chirp-v3-5'
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Suno API error (${response.status}): ${errorText}`);
        }

        const data: any = await response.json();
        const clips: SunoClip[] = data.clips;
        return clips;
    }

    /**
     * Obtener clip por ID
     */
    async getClip(clipId: string, token: SunoToken): Promise<SunoClip> {
        const response: Response = await fetch(`${this.BASE_URL}/api/feed/?ids=${clipId}`, {
            headers: {
                'Cookie': token.cookie,
                'Authorization': `Bearer ${token.jwt}`,
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch clip: ${response.statusText}`);
        }

        const data: any = await response.json();
        return data[0];
    }

    /**
     * Obtener todos los clips del usuario
     */
    async getAllClips(token: SunoToken): Promise<SunoClip[]> {
        const response = await fetch(`${this.BASE_URL}/api/feed/`, {
            headers: {
                'Cookie': token.cookie,
                'Authorization': `Bearer ${token.jwt}`,
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch clips: ${response.statusText}`);
        }

        return await response.json() as any;
    }

    /**
     * Obtener créditos disponibles
     */
    async getCredits(token: SunoToken): Promise<{
        remaining: number;
        limit: number;
        usage: number;
        period: string;
    }> {
        const response = await fetch(`${this.BASE_URL}/api/billing/info/`, {
            headers: {
                'Cookie': token.cookie,
                'Authorization': `Bearer ${token.jwt}`,
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch credits: ${response.statusText}`);
        }

        const data: any = await response.json();
        return {
            remaining: data.total_credits_left,
            limit: data.monthly_limit,
            usage: data.monthly_usage,
            period: data.period
        };
    }

    /**
     * Generar letras con AI
     */
    async generateLyrics(prompt: string, token: SunoToken): Promise<{
        text: string;
        title: string;
    }> {
        const response = await fetch(`${this.BASE_URL}/api/generate/lyrics/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': token.cookie,
                'Authorization': `Bearer ${token.jwt}`,
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            throw new Error(`Lyrics generation failed: ${response.statusText}`);
        }

        return await response.json() as any;
    }

    /**
     * Esperar a que se complete la generación
     */
    private async waitForCompletion(
        clips: SunoClip[],
        token: SunoToken,
        maxWaitTime: number = 180000 // 3 minutos
    ): Promise<SunoClip[]> {
        const startTime = Date.now();
        const clipIds = clips.map(c => c.id);

        while (Date.now() - startTime < maxWaitTime) {
            const updatedClips = await Promise.all(
                clipIds.map(id => this.getClip(id, token))
            );

            // Verificar si todos están completos
            const allComplete = updatedClips.every(
                clip => clip.status === 'complete' || clip.status === 'error'
            );

            if (allComplete) {
                return updatedClips;
            }

            // Esperar 3 segundos antes de volver a consultar
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        throw new Error('Timeout waiting for clips to complete');
    }
}
