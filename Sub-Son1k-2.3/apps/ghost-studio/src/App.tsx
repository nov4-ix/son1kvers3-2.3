import React from 'react'
import { motion } from 'framer-motion'
import { Logo } from '@super-son1k/shared-ui'
import {
  Music,
  Mic,
  Headphones,
  Volume2,
  Play,
  Pause,
  Square,
  Scissors,
  Copy,
  Save,
  Upload,
  Download,
  Settings,
  Zap
} from 'lucide-react'

const GhostStudio: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0b0d] via-[#0f121a] to-[#0b0b0d] text-white">
      {/* Cyberpunk grid background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(0, 191, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 191, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-[#00bfff]/20 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo size={45} showText={false} />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00bfff] to-[#ff49c3] bg-clip-text text-transparent">
                  Ghost Studio
                </h1>
                <p className="text-sm text-gray-400">
                  Professional Audio Editing & Production
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">v2.1</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* DAW Interface */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-[#0f121a] border-2 border-[#00bfff]/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#00bfff]">Audio Workstation</h2>
                <div className="flex items-center gap-2">
                  <button className="p-2 bg-[#00bfff]/20 rounded-lg text-[#00bfff] hover:bg-[#00bfff]/30 transition-colors">
                    <Play size={18} />
                  </button>
                  <button className="p-2 bg-[#00bfff]/20 rounded-lg text-[#00bfff] hover:bg-[#00bfff]/30 transition-colors">
                    <Pause size={18} />
                  </button>
                  <button className="p-2 bg-[#00bfff]/20 rounded-lg text-[#00bfff] hover:bg-[#00bfff]/30 transition-colors">
                    <Square size={18} />
                  </button>
                </div>
              </div>

              {/* Waveform Area */}
              <div className="bg-[#0b0b0d] border border-[#1b1b21] rounded-lg p-8 mb-6">
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <Music size={48} className="text-[#00bfff] mx-auto mb-4" />
                    <p className="text-gray-400">Load an audio file to start editing</p>
                    <button className="mt-4 px-6 py-3 bg-gradient-to-r from-[#00bfff] to-[#ff49c3] text-white rounded-lg font-medium hover:from-[#00a8e6] hover:to-[#ff3dba] transition-all">
                      <Upload size={18} className="inline mr-2" />
                      Import Audio
                    </button>
                  </div>
                </div>
              </div>

              {/* Transport Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className="px-4 py-2 bg-[#0b0b0d] border border-[#1b1b21] rounded-lg text-gray-400 hover:text-white hover:border-[#00bfff]/50 transition-colors">
                    <Scissors size={18} className="inline mr-2" />
                    Cut
                  </button>
                  <button className="px-4 py-2 bg-[#0b0b0d] border border-[#1b1b21] rounded-lg text-gray-400 hover:text-white hover:border-[#00bfff]/50 transition-colors">
                    <Copy size={18} className="inline mr-2" />
                    Copy
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  00:00:00 / 00:00:00
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tools Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="space-y-6">
              {/* Effects Panel */}
              <div className="bg-[#0f121a] border-2 border-[#00bfff]/30 rounded-xl p-6">
                <h3 className="text-lg font-bold text-[#00bfff] mb-4 flex items-center gap-2">
                  <Zap size={20} />
                  Audio Effects
                </h3>
                <div className="space-y-4">
                  {[
                    { name: 'Reverb', value: 30 },
                    { name: 'Delay', value: 20 },
                    { name: 'EQ High', value: 15 },
                    { name: 'EQ Low', value: 25 },
                    { name: 'Compression', value: 40 }
                  ].map((effect) => (
                    <div key={effect.name} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{effect.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1 bg-[#1b1b21] rounded">
                          <div
                            className="h-full bg-[#00bfff] rounded"
                            style={{ width: `${effect.value}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 w-8">{effect.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export Panel */}
              <div className="bg-[#0f121a] border-2 border-[#00bfff]/30 rounded-xl p-6">
                <h3 className="text-lg font-bold text-[#00bfff] mb-4 flex items-center gap-2">
                  <Download size={20} />
                  Export
                </h3>
                <div className="space-y-3">
                  <button className="w-full px-4 py-3 bg-gradient-to-r from-[#00bfff] to-[#ff49c3] text-white rounded-lg font-medium hover:from-[#00a8e6] hover:to-[#ff3dba] transition-all">
                    <Save size={18} className="inline mr-2" />
                    Export WAV
                  </button>
                  <button className="w-full px-4 py-3 bg-[#0b0b0d] border border-[#1b1b21] rounded-lg text-gray-400 hover:text-white hover:border-[#00bfff]/50 transition-colors">
                    <Download size={18} className="inline mr-2" />
                    Export MP3
                  </button>
                </div>
              </div>

              {/* Features List */}
              <div className="bg-[#0f121a] border-2 border-[#00bfff]/30 rounded-xl p-6">
                <h3 className="text-lg font-bold text-[#00bfff] mb-4">Features</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#00bfff] rounded-full"></div>
                    Multi-track editing
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#00bfff] rounded-full"></div>
                    Professional effects
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#00bfff] rounded-full"></div>
                    Real-time preview
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#44ff44] rounded-full"></div>
                    AI-powered enhancement
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Coming Soon Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="bg-[#0f121a] border-2 border-[#44ff44]/30 rounded-xl p-8 max-w-2xl mx-auto">
            <div className="text-4xl mb-4">🚧</div>
            <h3 className="text-xl font-bold text-[#44ff44] mb-2">Ghost Studio v2.1</h3>
            <p className="text-gray-300 mb-4">
              La interfaz completa de edición de audio profesional estará disponible próximamente.
              Por ahora, puedes usar las funcionalidades básicas desde el backend.
            </p>
            <div className="flex justify-center gap-4">
              <span className="px-3 py-1 bg-[#44ff44]/20 border border-[#44ff44]/50 rounded text-[#44ff44] text-sm">
                Multi-track editing
              </span>
              <span className="px-3 py-1 bg-[#44ff44]/20 border border-[#44ff44]/50 rounded text-[#44ff44] text-sm">
                AI Enhancement
              </span>
              <span className="px-3 py-1 bg-[#44ff44]/20 border border-[#44ff44]/50 rounded text-[#44ff44] text-sm">
                Cloud Sync
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default GhostStudio