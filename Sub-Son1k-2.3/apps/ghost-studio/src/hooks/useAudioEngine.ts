import { useState, useRef, useCallback } from 'react'
import { useStudioStore } from '@/store/studioStore'

export const useAudioEngine = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  
  const {
    audioBuffer,
    audioUrl,
    isPlaying,
    currentTime,
    duration,
    setAudioBuffer,
    setAudioUrl,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setIsLoading,
    setError,
    setAudioContext
  } = useStudioStore()

  const [isRecording, setIsRecording] = useState(false)
  const [volume, setVolume] = useState(1)

  // Load audio file with error handling and loading state
  const loadAudioFile = useCallback(async (file: File) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const arrayBuffer = await file.arrayBuffer()
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Store audio context for cleanup
      setAudioContext(audioContext)
      
      const buffer = await audioContext.decodeAudioData(arrayBuffer)
      
      setAudioBuffer(buffer)
      setDuration(buffer.duration)
      
      // Create object URL for audio element
      const url = URL.createObjectURL(file)
      setAudioUrl(url)
      
      setIsLoading(false)
      return buffer
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to load audio file'
      
      console.error('Error loading audio file:', error)
      setError(errorMessage)
      setIsLoading(false)
      throw error
    }
  }, [setAudioBuffer, setAudioUrl, setDuration, setIsLoading, setError, setAudioContext])

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' })
        const file = new File([blob], 'recording.wav', { type: 'audio/wav' })
        
        // Load the recorded audio
        await loadAudioFile(file)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      
    } catch (error) {
      console.error('Error starting recording:', error)
      throw error
    }
  }, [loadAudioFile, setIsRecording])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording, setIsRecording])

  // Play audio
  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }, [setIsPlaying])

  // Pause audio
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }, [setIsPlaying])

  // Stop audio
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
      setCurrentTime(0)
    }
  }, [setIsPlaying, setCurrentTime])

  // Seek to time
  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }, [setCurrentTime])

  // Set volume
  const setVolumeLevel = useCallback((vol: number) => {
    setVolume(vol)
    if (audioRef.current) {
      audioRef.current.volume = vol
    }
  }, [setVolume])

  // Update time
  const updateTime = useCallback((time: number) => {
    setCurrentTime(time)
  }, [setCurrentTime])

  // Get audio element ref for external use
  const getAudioRef = useCallback(() => audioRef.current, [])

  // Set audio element ref
  const setAudioRef = useCallback((ref: HTMLAudioElement | null) => {
    audioRef.current = ref
  }, [])

  return {
    // State
    audioBuffer,
    audioUrl,
    isPlaying,
    isRecording,
    currentTime,
    duration,
    volume,
    
    // Actions
    loadAudioFile,
    startRecording,
    stopRecording,
    play,
    pause,
    stop,
    seek,
    setVolumeLevel,
    updateTime,
    
    // Refs
    getAudioRef,
    setAudioRef
  }
}
