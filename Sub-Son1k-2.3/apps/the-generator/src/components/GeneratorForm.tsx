import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGeneration } from '@son1k/shared-hooks';

interface GeneratorFormProps {
    userId: string;
    onGenerationComplete?: (generationId: string) => void;
}

export function GeneratorForm({ userId, onGenerationComplete }: GeneratorFormProps) {
    const [prompt, setPrompt] = useState('');
    const [quality, setQuality] = useState<'standard' | 'high' | 'ultra'>('standard');
    const [genre, setGenre] = useState('');
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const {
        isGenerating,
        error,
        limits,
        generate,
        clearError,
        canGenerate,
        remaining,
        tier
    } = useGeneration({
        userId,
        onLimitReached: (limits) => {
            setShowUpgradeModal(true);
        },
        onGenerationComplete
    });

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            alert('Please enter a prompt');
            return;
        }

        const generationId = await generate(prompt, { quality, genre });

        if (generationId) {
            // Success! Generation started
            setPrompt('');
        }
        // Error handling is automatic via the hook
    };

    const qualityOptions = [
        { value: 'standard', label: 'Standard', tier: 'FREE', icon: '🎵' },
        { value: 'high', label: 'High Quality', tier: 'CREATOR', icon: '✨' },
        { value: 'ultra', label: 'Ultra HD', tier: 'PRO', icon: '💎' }
    ];

    const genreOptions = [
        'Pop', 'Rock', 'Electronic', 'Hip Hop', 'Jazz', 'Classical', 'Latin', 'Country'
    ];

    const isQualityAvailable = (qualityTier: string) => {
        const tierHierarchy = { FREE: 0, CREATOR: 1, PRO: 2, STUDIO: 3 };
        const requiredLevel = tierHierarchy[qualityTier as keyof typeof tierHierarchy] || 0;
        const currentLevel = tierHierarchy[tier] || 0;
        return currentLevel >= requiredLevel;
    };

    return (
        <div className="generator-form max-w-2xl mx-auto">
            {/* Limits Indicator */}
            {limits && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-carbón-dark border border-cian/20 rounded-lg"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cian to-magenta flex items-center justify-center text-white font-bold text-xl">
                                {remaining}
                            </div>
                            <div>
                                <p className="text-white font-semibold">
                                    {remaining} generation{remaining !== 1 ? 's' : ''} remaining
                                </p>
                                <p className="text-xs text-gray-400">
                                    {tier} tier • Resets {new Date(limits.resetAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {tier === 'FREE' && (
                            <button
                                onClick={() => window.location.href = '/pricing'}
                                className="px-4 py-2 bg-gradient-to-r from-cian to-magenta text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all"
                            >
                                Upgrade for More
                            </button>
                        )}
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 h-2 bg-carbón rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-cian to-magenta transition-all duration-300"
                            style={{
                                width: limits.tier === 'FREE'
                                    ? `${(remaining / 3) * 100}%`
                                    : `${(remaining / (limits.tier === 'CREATOR' ? 50 : limits.tier === 'PRO' ? 200 : 1000)) * 100}%`
                            }}
                        />
                    </div>
                </motion.div>
            )}

            {/* Main Form */}
            <div className="bg-carbón-dark border border-cian/20 rounded-xl p-8">
                <h2 className="text-3xl font-bold mb-6">
                    <span className="bg-gradient-to-r from-cian to-magenta bg-clip-text text-transparent">
                        Generate Your Music
                    </span>
                </h2>

                {/* Prompt Input */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-white mb-2">
                        Describe your music
                    </label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., Upbeat electronic dance with tropical vibes and energetic beats"
                        className="w-full px-4 py-3 bg-carbón border border-cian/20 rounded-lg text-white placeholder-gray-500 focus:border-cian focus:outline-none resize-none"
                        rows={4}
                        disabled={isGenerating}
                    />
                </div>

                {/* Quality Selector */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-white mb-2">
                        Quality
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {qualityOptions.map((option) => {
                            const available = isQualityAvailable(option.tier);

                            return (
                                <button
                                    key={option.value}
                                    onClick={() => available && setQuality(option.value as any)}
                                    disabled={!available || isGenerating}
                                    className={`
                    p-4 rounded-lg border-2 transition-all
                    ${quality === option.value && available
                                            ? 'border-cian bg-cian/10'
                                            : available
                                                ? 'border-cian/20 hover:border-cian/50'
                                                : 'border-gray-700 opacity-50 cursor-not-allowed'
                                        }
                  `}
                                >
                                    <div className="text-2xl mb-1">{option.icon}</div>
                                    <div className="text-sm font-semibold text-white">{option.label}</div>
                                    {!available && (
                                        <div className="text-xs text-gray-400 mt-1">
                                            {option.tier}+ only
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Genre Selector */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-white mb-2">
                        Genre (optional)
                    </label>
                    <select
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        disabled={isGenerating}
                        className="w-full px-4 py-3 bg-carbón border border-cian/20 rounded-lg text-white focus:border-cian focus:outline-none"
                    >
                        <option value="">Auto-detect</option>
                        {genreOptions.map((g) => (
                            <option key={g} value={g.toLowerCase()}>
                                {g}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Error Display */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-red-400 text-xl">⚠️</span>
                                <div className="flex-1">
                                    <p className="text-red-400 font-semibold mb-1">
                                        {error.includes('limit') ? 'Generation Limit Reached' : 'Error'}
                                    </p>
                                    <p className="text-sm text-red-300">{error}</p>
                                </div>
                                <button
                                    onClick={clearError}
                                    className="text-red-400 hover:text-red-300"
                                >
                                    ✕
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Generate Button */}
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !canGenerate || !prompt.trim()}
                    className={`
            w-full py-4 rounded-lg font-bold text-lg transition-all
            ${isGenerating || !canGenerate
                            ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                            : 'bg-gradient-to-r from-cian to-magenta text-white hover:shadow-xl hover:shadow-cian/50'
                        }
          `}
                >
                    {isGenerating ? (
                        <>
                            <span className="inline-block animate-spin mr-2">⏳</span>
                            Generating...
                        </>
                    ) : !canGenerate ? (
                        'Limit Reached - Upgrade or Wait'
                    ) : (
                        '🎵 Generate Music'
                    )}
                </button>

                {/* Info */}
                <p className="text-center text-xs text-gray-400 mt-4">
                    By generating, you agree to our Terms of Service.
                    {tier !== 'FREE' && (
                        <span className="text-cian"> 5% auto-contribute to Community Pool.</span>
                    )}
                </p>
            </div>

            {/* Upgrade Modal */}
            <AnimatePresence>
                {showUpgradeModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowUpgradeModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-carbón-dark border-2 border-cian rounded-xl p-8 max-w-md w-full"
                        >
                            <div className="text-center">
                                <div className="text-6xl mb-4">🚀</div>
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    Upgrade to Continue Creating
                                </h3>
                                <p className="text-gray-400 mb-6">
                                    {tier === 'FREE'
                                        ? 'You\'ve used all 3 daily generations. Upgrade to CREATOR for 50/month or claim from Community Pool!'
                                        : 'You\'ve reached your monthly limit. Upgrade to a higher tier for more generations!'
                                    }
                                </p>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => window.location.href = '/pricing'}
                                        className="w-full py-3 bg-gradient-to-r from-cian to-magenta text-white rounded-lg font-bold hover:shadow-xl transition-all"
                                    >
                                        View Pricing →
                                    </button>

                                    {tier === 'FREE' && (
                                        <button
                                            onClick={() => window.location.href = '/community-pool'}
                                            className="w-full py-3 bg-carbón border border-cian text-cian rounded-lg font-bold hover:bg-cian/10 transition-all"
                                        >
                                            🎁 Claim from Community Pool
                                        </button>
                                    )}

                                    <button
                                        onClick={() => setShowUpgradeModal(false)}
                                        className="w-full py-3 text-gray-400 hover:text-white transition-colors"
                                    >
                                        Maybe Later
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
