// useAnalyzer.ts - Audio analysis hook

import { useState, useCallback, useRef } from 'react'
import { useStudioStore } from '../store/studioStore'
import type { AnalysisResult } from '../types/studio'

interface UseAnalyzerReturn {
  isLoading: boolean
  error: string | null
  result: AnalysisResult | null
  runAnalysis: (audioBlob: Blob) => Promise<void>
  clearAnalysis: () => void
}

export function useAnalyzer(): UseAnalyzerReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const analyzerWorkerRef = useRef<Worker | null>(null)
  const genreWorkerRef = useRef<Worker | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const { setAnalysis, setIsAnalyzing } = useStudioStore()

  // Initialize workers
  const initializeWorkers = useCallback(() => {
    if (!analyzerWorkerRef.current) {
      analyzerWorkerRef.current = new Worker(
        new URL('../workers/analyzer.worker.ts', import.meta.url),
        { type: 'module' }
      )
    }

    if (!genreWorkerRef.current) {
      genreWorkerRef.current = new Worker(
        new URL('../workers/genre.worker.ts', import.meta.url),
        { type: 'module' }
      )
    }
  }, [])

  // Cleanup workers
  const cleanupWorkers = useCallback(() => {
    if (analyzerWorkerRef.current) {
      analyzerWorkerRef.current.terminate()
      analyzerWorkerRef.current = null
    }

    if (genreWorkerRef.current) {
      genreWorkerRef.current.terminate()
      genreWorkerRef.current = null
    }
  }, [])

  // Run analysis
  const runAnalysis = useCallback(async (audioBlob: Blob) => {
    try {
      setIsLoading(true)
      setIsAnalyzing(true)
      setError(null)
      setResult(null)

      // Cancel previous analysis
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      // Initialize workers
      initializeWorkers()

      // Convert blob to array buffer
      const arrayBuffer = await audioBlob.arrayBuffer()

      // Create audio context to get sample rate and decode
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0))
      const sampleRate = audioBuffer.sampleRate

      // Obtener datos PCM del canal 0 (mono)
      const pcmData = audioBuffer.getChannelData(0)

      await audioContext.close()

      // Run analysis in analyzer worker
      const analysisResult = await new Promise<{
        bpm: number
        confidence: number
        featuresSummary: {
          energy: number
          density: number
          spectralCentroid: number
          spectralRolloff: number
          zeroCrossingRate: number
        }
      }>((resolve, reject) => {
        if (!analyzerWorkerRef.current) {
          reject(new Error('Analyzer worker not initialized'))
          return
        }

        const handleMessage = (e: MessageEvent) => {
          analyzerWorkerRef.current?.removeEventListener('message', handleMessage)

          if (e.data.type === 'analysis') {
            resolve(e.data.data)
          } else if (e.data.type === 'error') {
            reject(new Error(e.data.error))
          }
        }

        analyzerWorkerRef.current.addEventListener('message', handleMessage)

        // Enviar el Float32Array directamente (transferable si fuera buffer, pero view es copia ligera)
        analyzerWorkerRef.current.postMessage({
          type: 'analyze',
          audioBuffer: pcmData, // Enviamos el Float32Array
          sampleRate
        })
      })

      // Check if analysis was aborted
      if (abortControllerRef.current.signal.aborted) {
        return
      }

      // Run genre classification
      const genreResult = await new Promise<{
        styleTags: string[]
        probableInstruments: string[]
        genreDescription: string
        instrumentDescription: string
      }>((resolve, reject) => {
        if (!genreWorkerRef.current) {
          reject(new Error('Genre worker not initialized'))
          return
        }

        const handleMessage = (e: MessageEvent) => {
          genreWorkerRef.current?.removeEventListener('message', handleMessage)

          if (e.data.type === 'style') {
            resolve(e.data.data)
          } else if (e.data.type === 'error') {
            reject(new Error(e.data.error))
          }
        }

        genreWorkerRef.current.addEventListener('message', handleMessage)
        genreWorkerRef.current.postMessage({
          type: 'tag',
          data: {
            bpm: analysisResult.bpm,
            featuresSummary: analysisResult.featuresSummary
          }
        })
      })

      // Check if analysis was aborted
      if (abortControllerRef.current.signal.aborted) {
        return
      }

      // Combine results
      const finalResult: AnalysisResult = {
        bpm: analysisResult.bpm || 120,
        key: 'C', // Default key
        genre: 'unknown', // Default genre
        tags: genreResult.styleTags || [],
        instruments: genreResult.probableInstruments || [],
        mood: 'neutral', // Default mood
        tempo: 'moderate', // Default tempo
        energy: analysisResult.featuresSummary?.energy || 0.5,
        confidence: analysisResult.confidence || 0.5,
        styleTags: genreResult.styleTags || [],
        probableInstruments: genreResult.probableInstruments || [],
        density: analysisResult.featuresSummary?.density || 0.5,
        notes: 'Analysis complete',
        genreDescription: genreResult.genreDescription,
        instrumentDescription: genreResult.instrumentDescription
      }

      setResult(finalResult)
      setAnalysis(finalResult)

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Analysis was aborted, don't set error
        return
      }

      const errorMessage = err instanceof Error ? err.message : 'Analysis failed'
      setError(errorMessage)
      console.error('Analysis error:', err)
    } finally {
      setIsLoading(false)
      setIsAnalyzing(false)
    }
  }, [initializeWorkers, setAnalysis, setIsAnalyzing])

  // Clear analysis
  const clearAnalysis = useCallback(() => {
    setResult(null)
    setError(null)
    setAnalysis(null)

    // Cancel any ongoing analysis
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [setAnalysis])

  return {
    isLoading,
    error,
    result,
    runAnalysis,
    clearAnalysis
  }
}
