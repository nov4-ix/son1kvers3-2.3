import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Music,
  Play,
  Pause,
  Download,
  Share2,
  Settings,
  Wand2,
  Volume2,
  Clock,
  Heart,
  User,
  LogOut,
  History
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { MusicTrack } from '@super-son1k/shared-types'
import { useAuth } from './providers/AuthProvider'
import { AuthModal } from './components/AuthModal'
import { NeuralEngineConnect } from './components/NeuralEngineConnect'
import { translateToEnglish } from './lib/translate'
import GenerationHistory from './components/GenerationHistory'
import { config } from './lib/config/env'
import { useAudioStore } from './store/audioStore'

const generationSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(1000, 'Prompt too long'),
  duration: z.number().min(30).max(600).optional(),
  tempo: z.number().min(60).max(200).optional(),
  key: z.string().optional(),
  genre: z.string().optional(),
  mood: z.string().optional(),
  style: z.string().optional(),
  complexity: z.number().min(0).max(1).optional(),
})

type GenerationForm = z.infer<typeof generationSchema>

const genres = [
  'pop', 'rock', 'electronic', 'classical', 'jazz', 'hip-hop', 'ambient',
  'country', 'blues', 'folk', 'reggae', 'funk', 'soul', 'r&b'
]

const moods = [
  'happy', 'sad', 'energetic', 'calm', 'aggressive', 'peaceful', 'romantic',
  'melancholic', 'uplifting', 'dark', 'bright', 'mysterious', 'nostalgic'
]

const keys = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
]

const styles = [
  'modern', 'classical', 'electronic', 'acoustic', 'orchestral', 'minimalist',
  'maximalist', 'ambient', 'cinematic', 'experimental', 'fusion'
]

export function TheGenerator() {
  const { user, userTier, session, isAuthenticated, isLoading, signOut, showAuthModal, setShowAuthModal } = useAuth()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedTrack, setGeneratedTrack] = useState<MusicTrack | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [pollingInterval, setPollingInterval] = useState<ReturnType<typeof setInterval> | null>(null)

  // Use global audio store to prevent multiple audios playing
  const { currentTrackId, isPlaying, play, pause } = useAudioStore()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<GenerationForm>({
    resolver: zodResolver(generationSchema),
    defaultValues: {
      duration: 60,
      tempo: 120,
      key: 'C',
      genre: 'pop',
      mood: 'happy',
      style: 'modern',
      complexity: 0.7
    }
  })

  const onSubmit = async (data: GenerationForm) => {
    // Validate authentication
    if (!isAuthenticated || !session) {
      setShowAuthModal(true)
      toast.error('Please sign in to generate music')
      return
    }

    setIsGenerating(true)
    setError(null) // Limpiar errores anteriores

    try {
      // Translate prompt to English before sending
      const translatedPrompt = await translateToEnglish(data.prompt)

      // Call backend API with Supabase session token
      const backendUrl = config.backendUrl
      const response = await fetch(`${backendUrl}/api/generation/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          prompt: translatedPrompt,
          style: data.style || 'pop',
          duration: data.duration || 60,
          quality: 'standard'
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Failed to generate track' } }))
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (!result.data?.generationId) {
        throw new Error('No generation ID received from server')
      }

      const track: MusicTrack = {
        id: result.data.generationId,
        prompt: data.prompt,
        audioUrl: result.data.audioUrl || '',
        duration: data.duration || 60,
        status: result.data.status || 'pending',
        createdAt: new Date().toISOString(),
        generationId: result.data.generationId,
        taskId: result.data.generationTaskId || result.data.taskId,
        style: data.style
      }

      setGeneratedTrack(track)

      // Guardar en historial local
      const history = JSON.parse(localStorage.getItem('generation_history') || '[]');
      history.unshift(track);
      localStorage.setItem('generation_history', JSON.stringify(history.slice(0, 50))); // Máximo 50

      // Iniciar polling para actualizar estado
      startPolling(track.generationId!, track.taskId!);

      toast.success('Track generation started!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate track. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Error generating track:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const startPolling = (generationId: string, taskId: string) => {
    // Limpiar polling anterior si existe
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    console.log(`[Polling] Starting for generation ${generationId}...`);

    const interval = setInterval(async () => {
      try {
        const backendUrl = config.backendUrl;
        const response = await fetch(`${backendUrl}/api/generation/${generationId}/status`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token || ''}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            // ✅ LEGACY BEHAVIOR: Usar campos normalizados del backend
            const { running, statusNormalized, tracks, audioUrl, status } = data.data;

            // ✅ Priorizar tracks válidos sobre el estado
            const hasValidTracks = tracks && Array.isArray(tracks) && tracks.length > 0;
            const hasAudioUrl = !!audioUrl;

            // Actualizar track con los datos recibidos
            const updatedTrack: MusicTrack = {
              ...generatedTrack!,
              status: status as any, // Mantener el status de DB (COMPLETED, PROCESSING, etc.)
              audioUrl: audioUrl || generatedTrack?.audioUrl || '',
            };

            setGeneratedTrack(updatedTrack);

            // ✅ LEGACY BEHAVIOR: Determinar si debemos detener el polling
            // Solo detenemos si:
            // 1. Tenemos tracks o audioUrl válidos (éxito)
            // 2. El estado es explícitamente 'failed' (error)
            const shouldStopPolling = hasValidTracks || hasAudioUrl || statusNormalized === 'failed';

            if (shouldStopPolling) {
              console.log(`[Polling] Stopping for generation ${generationId}. Status: ${statusNormalized}, hasAudioUrl: ${hasAudioUrl}, tracks: ${tracks?.length || 0}`);
              clearInterval(interval);
              setPollingInterval(null);

              if (hasValidTracks || hasAudioUrl) {
                toast.success('Track generation completed!');
              } else if (statusNormalized === 'failed') {
                toast.error('Track generation failed');
              }
            } else {
              // ✅ LEGACY BEHAVIOR: Continuar polling si running=true o statusNormalized='running'
              console.log(`[Polling] Continuing... running=${running}, status=${statusNormalized}`);
            }
          }
        } else {
          // ⚠️ LEGACY BEHAVIOR: No abortar por error HTTP temporal
          console.warn(`[Polling] HTTP ${response.status}, will retry...`);
        }
      } catch (error) {
        // ⚠️ LEGACY BEHAVIOR: No abortar por error de red temporal
        console.warn('[Polling] Network error, will retry...', error);
      }
    }, 5000); // Poll cada 5 segundos (LEGACY BEHAVIOR)

    setPollingInterval(interval);
  }

  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const handlePlay = async () => {
    if (!generatedTrack?.audioUrl) {
      toast.error('Audio not ready yet')
      return
    }

    const trackId = generatedTrack.id || generatedTrack.generationId || 'current'

    // Si es la misma canción, toggle play/pause
    if (currentTrackId === trackId && isPlaying) {
      pause()
      toast.success('Paused')
    } else {
      // Reproducir nueva canción (el store detendrá cualquier audio anterior)
      await play(trackId, generatedTrack.audioUrl)
      toast.success('Playing')
    }
  }

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      const { cleanup } = useAudioStore.getState()
      cleanup()
    }
  }, [])

  const handleDownload = () => {
    if (generatedTrack?.audioUrl) {
      const link = document.createElement('a');
      link.href = generatedTrack.audioUrl;
      link.download = `track-${generatedTrack.id}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started!');
    } else {
      toast.error('Audio not ready yet');
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0b0d] via-[#0f121a] to-[#0b0b0d] text-white p-6 relative overflow-hidden">
      {/* Cyberpunk grid background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(0, 191, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 191, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1"></div>
            <div className="flex-1">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-[#00bfff] via-[#ff49c3] to-[#44ff44] bg-clip-text text-transparent flex items-center justify-center gap-3">
                <Wand2 size={40} className="text-[#00bfff]" />
                THE GENERATOR
              </h1>
              <p className="text-[#b9b9c2] text-lg mt-2">
                Creating AI-powered music with advanced controls
              </p>
            </div>
            <div className="flex-1 flex justify-end items-center gap-2">
              {isAuthenticated && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowHistory(!showHistory)}
                  className="bg-[#0f121a] border border-[#00bfff]/30 rounded-lg px-3 py-2 text-[#00bfff] hover:bg-[#0f121a]/80 transition-all flex items-center gap-2"
                  title="View history"
                >
                  <History size={18} />
                </motion.button>
              )}
              {isAuthenticated ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 bg-[#0f121a] border border-[#00bfff]/30 rounded-lg px-4 py-2"
                >
                  <div className="flex items-center gap-2">
                    <User size={20} className="text-[#00bfff]" />
                    <span className="text-sm text-gray-300">{user?.email}</span>
                  </div>
                  <button
                    onClick={signOut}
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Sign out"
                  >
                    <LogOut size={18} />
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-[#00bfff] to-[#ff49c3] text-white font-semibold px-4 py-2 rounded-lg hover:from-[#00a8e6] hover:to-[#ff3dba] transition-all flex items-center gap-2"
                >
                  <User size={18} />
                  Sign In
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Neural Engine Connection (Stealth) */}
        {isAuthenticated && user && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <NeuralEngineConnect userId={user.id} userTier={userTier?.tier || 'FREE'} />
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generation Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-[#0f121a] to-[#1b1b21] border-2 border-[#00bfff]/30 rounded-xl p-6 shadow-lg shadow-[#00bfff]/10"
          >
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-[#00bfff] to-[#ff49c3] bg-clip-text text-transparent">
              GENERATION PARAMETERS
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Prompt *
                </label>
                <textarea
                  {...register('prompt')}
                  className="w-full h-32 px-4 py-3 bg-[#0b0b0d] border-2 border-[#1b1b21] rounded-lg text-[#e7e7ea] placeholder-[#7a8a9a] focus:outline-none focus:border-[#00bfff] focus:ring-2 focus:ring-[#00bfff]/50 resize-none transition-all"
                  placeholder="Describe the music you want to create..."
                />
                {errors.prompt && (
                  <p className="text-red-400 text-sm mt-1">{errors.prompt.message}</p>
                )}
              </div>

              {/* Duration and Tempo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    {...register('duration', { valueAsNumber: true })}
                    className="w-full px-3 py-2 bg-[#333] border border-[#555] rounded-lg text-white focus:outline-none focus:border-[#00FFE7] focus:ring-1 focus:ring-[#00FFE7]"
                    min="30"
                    max="600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tempo (BPM)
                  </label>
                  <input
                    type="number"
                    {...register('tempo', { valueAsNumber: true })}
                    className="w-full px-3 py-2 bg-[#333] border border-[#555] rounded-lg text-white focus:outline-none focus:border-[#00FFE7] focus:ring-1 focus:ring-[#00FFE7]"
                    min="60"
                    max="200"
                  />
                </div>
              </div>

              {/* Genre and Mood */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Genre
                  </label>
                  <select
                    {...register('genre')}
                    className="w-full px-3 py-2 bg-[#333] border border-[#555] rounded-lg text-white focus:outline-none focus:border-[#00FFE7] focus:ring-1 focus:ring-[#00FFE7]"
                  >
                    {genres.map(genre => (
                      <option key={genre} value={genre}>
                        {genre.charAt(0).toUpperCase() + genre.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mood
                  </label>
                  <select
                    {...register('mood')}
                    className="w-full px-3 py-2 bg-[#333] border border-[#555] rounded-lg text-white focus:outline-none focus:border-[#00FFE7] focus:ring-1 focus:ring-[#00FFE7]"
                  >
                    {moods.map(mood => (
                      <option key={mood} value={mood}>
                        {mood.charAt(0).toUpperCase() + mood.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Key and Style */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Key
                  </label>
                  <select
                    {...register('key')}
                    className="w-full px-3 py-2 bg-[#333] border border-[#555] rounded-lg text-white focus:outline-none focus:border-[#00FFE7] focus:ring-1 focus:ring-[#00FFE7]"
                  >
                    {keys.map(key => (
                      <option key={key} value={key}>{key}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Style
                  </label>
                  <select
                    {...register('style')}
                    className="w-full px-3 py-2 bg-[#333] border border-[#555] rounded-lg text-white focus:outline-none focus:border-[#00FFE7] focus:ring-1 focus:ring-[#00FFE7]"
                  >
                    {styles.map(style => (
                      <option key={style} value={style}>
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Complexity */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Complexity: {watch('complexity') || 0.7}
                </label>
                <input
                  type="range"
                  {...register('complexity', { valueAsNumber: true })}
                  className="w-full h-2 bg-[#333] rounded-lg appearance-none cursor-pointer slider"
                  min="0"
                  max="1"
                  step="0.1"
                />
              </div>

              {/* Generate Button */}
              {/* Error Display */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-[#00bfff] to-[#ff49c3] text-white font-bold py-4 px-6 rounded-lg hover:from-[#00a8e6] hover:to-[#ff3dba] transition-all transform hover:scale-105 shadow-lg shadow-[#00bfff]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Music size={20} />
                    Generate Music
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Generated Track */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold mb-4 text-[#00FFE7]">
              Generated Track
            </h2>

            {generatedTrack ? (
              <div className="space-y-4">
                {/* Track Cover */}
                <div className="aspect-square bg-[#333] rounded-lg flex items-center justify-center">
                  <Music size={48} className="text-gray-400" />
                </div>

                {/* Track Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {generatedTrack.prompt}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {generatedTrack.duration}s
                    </div>
                    <div className="flex items-center gap-1">
                      <Volume2 size={14} />
                      {watch('tempo')} BPM
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePlay}
                    className="bg-[#00FFE7] text-black p-2 rounded-lg hover:bg-[#00FFE7]/90 transition-colors"
                    aria-label={isPlaying && currentTrackId === (generatedTrack.id || generatedTrack.generationId || 'current') ? `Pause ${generatedTrack.prompt}` : `Play ${generatedTrack.prompt}`}
                    aria-pressed={isPlaying && currentTrackId === (generatedTrack.id || generatedTrack.generationId || 'current')}
                  >
                    {isPlaying && currentTrackId === (generatedTrack.id || generatedTrack.generationId || 'current') ? <Pause size={20} /> : <Play size={20} />}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownload}
                    className="bg-[#333] text-white p-2 rounded-lg hover:bg-[#444] transition-colors"
                    aria-label={`Download ${generatedTrack.prompt}`}
                  >
                    <Download size={20} />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShare}
                    className="bg-[#333] text-white p-2 rounded-lg hover:bg-[#444] transition-colors"
                  >
                    <Share2 size={20} />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-[#333] text-white p-2 rounded-lg hover:bg-[#444] transition-colors ml-auto"
                  >
                    <Heart size={20} />
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <div className="text-center">
                  <Music size={48} className="mx-auto mb-4" />
                  <p>Generate a track to see it here</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* History Modal */}
      {showHistory && isAuthenticated && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowHistory(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0f121a] border-2 border-[#00bfff]/30 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#00bfff] to-[#ff49c3] bg-clip-text text-transparent">
                Generation History
              </h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <GenerationHistory
              userId={user?.id}
              onSelectTrack={(track) => {
                setGeneratedTrack(track);
                setShowHistory(false);
              }}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  )
}

export default TheGenerator
