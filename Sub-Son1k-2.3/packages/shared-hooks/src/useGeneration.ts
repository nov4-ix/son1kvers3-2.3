import { useState, useEffect } from 'react';
import { TierService, UsageLimits } from '@son1k/tiers';

interface UseGenerationOptions {
    userId: string;
    onLimitReached?: (limits: UsageLimits) => void;
    onGenerationComplete?: (generationId: string) => void;
}

interface GenerationState {
    isGenerating: boolean;
    error: string | null;
    limits: UsageLimits | null;
    generationId: string | null;
}

export function useGeneration({
    userId,
    onLimitReached,
    onGenerationComplete
}: UseGenerationOptions) {
    const [state, setState] = useState<GenerationState>({
        isGenerating: false,
        error: null,
        limits: null,
        generationId: null
    });

    const tierService = new TierService(
        import.meta.env.VITE_API_URL || 'http://localhost:8000'
    );

    // Fetch limits on mount and when generation completes
    useEffect(() => {
        fetchLimits();
    }, [userId]);

    const fetchLimits = async () => {
        try {
            const limits = await tierService.getUserLimits(userId);
            setState(prev => ({ ...prev, limits, error: null }));
        } catch (error) {
            console.error('Error fetching limits:', error);
            setState(prev => ({
                ...prev,
                error: 'Failed to fetch generation limits'
            }));
        }
    };

    const checkLimitsBeforeGeneration = async (): Promise<boolean> => {
        await fetchLimits();

        if (!state.limits) {
            setState(prev => ({ ...prev, error: 'Unable to verify limits' }));
            return false;
        }

        if (!state.limits.canGenerate) {
            const reason = state.limits.reason || 'limit_reached';

            if (reason === 'daily_limit_reached') {
                setState(prev => ({
                    ...prev,
                    error: `Daily limit reached (${state.limits!.remaining}/3). Resets at ${new Date(state.limits!.resetAt).toLocaleString()}`
                }));
            } else if (reason === 'monthly_limit_reached') {
                setState(prev => ({
                    ...prev,
                    error: `Monthly limit reached. Upgrade for more generations!`
                }));
            } else if (reason.includes('quality_')) {
                const quality = reason.split('_')[1];
                setState(prev => ({
                    ...prev,
                    error: `${quality} quality not available in your tier. Upgrade to unlock!`
                }));
            }

            onLimitReached?.(state.limits);
            return false;
        }

        return true;
    };

    const generate = async (
        prompt: string,
        options: {
            quality?: 'standard' | 'high' | 'ultra';
            genre?: string;
            [key: string]: any;
        } = {}
    ): Promise<string | null> => {
        // 1. Check limits BEFORE generating
        const canGenerate = await checkLimitsBeforeGeneration();

        if (!canGenerate) {
            return null;
        }

        setState(prev => ({
            ...prev,
            isGenerating: true,
            error: null,
            generationId: null
        }));

        try {
            // 2. Call your generation API
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    quality: options.quality || 'standard',
                    genre: options.genre,
                    user_id: userId,
                    ...options
                })
            });

            if (!response.ok) {
                throw new Error('Generation failed');
            }

            const data = await response.json();
            const generationId = data.generation_id || data.id;

            // 3. Record the generation in backend (updates limits automatically)
            await recordGeneration(generationId, options.quality || 'standard');

            // 4. Update state
            setState(prev => ({
                ...prev,
                isGenerating: false,
                generationId
            }));

            // 5. Refresh limits
            await fetchLimits();

            // 6. Callback
            onGenerationComplete?.(generationId);

            return generationId;

        } catch (error: any) {
            setState(prev => ({
                ...prev,
                isGenerating: false,
                error: error.message || 'Generation failed'
            }));
            return null;
        }
    };

    const recordGeneration = async (generationId: string, quality: string) => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/tiers/record-generation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    generation_id: generationId,
                    quality
                })
            });

            // Also try to contribute to pool (automatic for paid tiers)
            await fetch(`${import.meta.env.VITE_API_URL}/api/community/contribute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    generation_id: generationId,
                    quality
                })
            }).catch(() => {
                // Silently fail if contribution fails
                console.log('Community contribution skipped');
            });

        } catch (error) {
            console.error('Error recording generation:', error);
            // Don't fail the whole process if recording fails
        }
    };

    const clearError = () => {
        setState(prev => ({ ...prev, error: null }));
    };

    return {
        // State
        isGenerating: state.isGenerating,
        error: state.error,
        limits: state.limits,
        generationId: state.generationId,

        // Actions
        generate,
        fetchLimits,
        clearError,

        // Helpers
        canGenerate: state.limits?.canGenerate ?? true,
        remaining: state.limits?.remaining ?? 0,
        tier: state.limits?.tier ?? 'FREE'
    };
}
