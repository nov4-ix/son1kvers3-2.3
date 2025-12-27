// AnalyzerPanel.tsx - Audio analysis results panel

import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { useAnalyzer } from '../hooks/useAnalyzer'
import { useStudioStore } from '../store/studioStore'
import { Music, Zap, Target, Mic, Activity, BarChart3 } from 'lucide-react'

export function AnalyzerPanel() {
  const { isLoading, error, result, runAnalysis, clearAnalysis } = useAnalyzer()
  const { audioBuffer } = useStudioStore()
  
  const handleAnalyze = async () => {
    if (audioBuffer) {
      // Convert AudioBuffer to Blob for analysis
      const sampleRate = audioBuffer.sampleRate
      const length = audioBuffer.length
      const channels = audioBuffer.numberOfChannels
      
      // Create a WAV file header
      const buffer = new ArrayBuffer(44 + length * channels * 2)
      const view = new DataView(buffer)
      
      // WAV header
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i))
        }
      }
      
      writeString(0, 'RIFF')
      view.setUint32(4, 36 + length * channels * 2, true)
      writeString(8, 'WAVE')
      writeString(12, 'fmt ')
      view.setUint32(16, 16, true)
      view.setUint16(20, 1, true)
      view.setUint16(22, channels, true)
      view.setUint32(24, sampleRate, true)
      view.setUint32(28, sampleRate * channels * 2, true)
      view.setUint16(32, channels * 2, true)
      view.setUint16(34, 16, true)
      writeString(36, 'data')
      view.setUint32(40, length * channels * 2, true)
      
      // Convert audio data to 16-bit PCM
      let offset = 44
      for (let i = 0; i < length; i++) {
        for (let channel = 0; channel < channels; channel++) {
          const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]))
          view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
          offset += 2
        }
      }
      
      const blob = new Blob([buffer], { type: 'audio/wav' })
      await runAnalysis(blob)
    }
  }
  
  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-cyan flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Audio Analysis
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={handleAnalyze}
            disabled={!audioBuffer || isLoading}
            variant="primary"
            size="sm"
          >
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </Button>
          {result && (
            <Button
              onClick={clearAnalysis}
              variant="secondary"
              size="sm"
            >
              Clear
            </Button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      
      {isLoading && (
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-phantom/50 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-phantom/50 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-phantom/50 rounded w-2/3"></div>
          </div>
          <div className="text-center text-accent">
            <Activity className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>Analyzing audio...</p>
          </div>
        </div>
      )}
      
      {result && (
        <div className="space-y-6">
          {/* BPM and Confidence */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-ghost/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Music className="w-4 h-4 text-cyan" />
                <span className="text-sm text-accent">BPM</span>
              </div>
              <div className="text-2xl font-bold text-cyan">{result.bpm}</div>
              {result.confidence && (
              <div className="text-xs text-accent">
                Confidence: {Math.round(result.confidence * 100)}%
              </div>
              )}
            </div>
            
            <div className="p-4 bg-ghost/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-magenta" />
                <span className="text-sm text-accent">Energy</span>
              </div>
              <div className="text-2xl font-bold text-magenta">
                {Math.round(result.energy * 100)}%
              </div>
              {result.density && (
              <div className="text-xs text-accent">
                Density: {Math.round(result.density * 100)}%
              </div>
              )}
            </div>
          </div>
          
          {/* Style Tags */}
          <div>
            <h3 className="text-lg font-semibold text-cyan mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Style Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.styleTags?.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-cyan/10 border border-cyan/20 rounded-full text-cyan text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
            {result.genreDescription && (
              <p className="text-sm text-accent mt-2 italic">
                {result.genreDescription}
              </p>
            )}
          </div>
          
          {/* Probable Instruments */}
          <div>
            <h3 className="text-lg font-semibold text-magenta mb-3 flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Probable Instruments
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.probableInstruments?.map((instrument: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-magenta/10 border border-magenta/20 rounded-full text-magenta text-sm"
                >
                  {instrument}
                </span>
              ))}
            </div>
            {result.instrumentDescription && (
              <p className="text-sm text-accent mt-2 italic">
                {result.instrumentDescription}
              </p>
            )}
          </div>
          
          {/* Analysis Summary */}
          <div className="p-4 bg-ghost/30 rounded-lg">
            <h3 className="text-lg font-semibold text-accent mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analysis Summary
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-accent">BPM:</span>
                <span className="text-cyan ml-2">{result.bpm}</span>
              </div>
              {result.confidence && (
              <div>
                <span className="text-accent">Confidence:</span>
                <span className="text-cyan ml-2">{Math.round(result.confidence * 100)}%</span>
              </div>
              )}
              <div>
                <span className="text-accent">Energy:</span>
                <span className="text-magenta ml-2">{Math.round(result.energy * 100)}%</span>
              </div>
              {result.density && (
              <div>
                <span className="text-accent">Density:</span>
                <span className="text-magenta ml-2">{Math.round(result.density * 100)}%</span>
              </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {!result && !isLoading && !error && (
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-phantom mx-auto mb-4" />
          <p className="text-phantom mb-2">No analysis available</p>
          <p className="text-sm text-accent">
            Upload an audio file and click "Analyze" to get started
          </p>
        </div>
      )}
    </Card>
  )
}
