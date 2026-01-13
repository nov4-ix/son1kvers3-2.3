'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Music,
  Upload,
  Send,
  Download,
  Play,
  Pause,
  Settings,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import AudioRecorder from './components/AudioRecorder';
import Waveform from './components/Waveform';
import PromptGenerator from './components/PromptGenerator';
import TimelineSequencer from './components/TimelineSequencer';
import TrackAnalyzer from './components/TrackAnalyzer';
import CreativeKnobs, { KnobSettings } from './components/CreativeKnobs';
import LyricGenerator from './components/LyricGenerator';
import DAWInterface from './components/DAWInterface';
import { useSunoCover } from './hooks/useSunoCover';
import { supabaseStorage } from './lib/api/supabase-storage';
import { InvocationPortal } from './components/InvocationPortal';
import type { AnalysisResult } from './types/studio';

export function GhostStudio() {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analysisEnabled, setAnalysisEnabled] = useState(true);
  const [knobs, setKnobs] = useState<KnobSettings>({
    expressivity: 50,
    trash: 30,
    garage: 30,
    rareza: 50
  });
  const [lyrics, setLyrics] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    generateCover,
    isGenerating,
    taskId,
    result,
    error,
    reset
  } = useSunoCover();

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
    const url = URL.createObjectURL(blob);
    setAudioURL(url);
    // Convertir blob a File para compatibilidad
    const file = new File([blob], `recording-${Date.now()}.webm`, { type: blob.type });
    setUploadedFile(file);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar que sea audio
    if (!file.type.startsWith('audio/')) {
      toast.error('Por favor, selecciona un archivo de audio');
      return;
    }

    setUploadedFile(file);
    const url = URL.createObjectURL(file);
    setAudioURL(url);
    toast.success('Archivo cargado correctamente');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSendToAI = async () => {
    if (!uploadedFile && !audioBlob) {
      toast.error('Por favor, graba o sube un archivo de audio primero');
      return;
    }

    if (!prompt.trim()) {
      toast.error('Por favor, genera un prompt primero');
      return;
    }

    try {
      const fileToSend = uploadedFile || (audioBlob ? new File([audioBlob], `recording-${Date.now()}.webm`, { type: audioBlob.type }) : null);

      if (!fileToSend) {
        toast.error('Error: No hay archivo para enviar');
        return;
      }

      await generateCover(fileToSend, prompt);
      toast.success('Generación iniciada. Esto puede tomar unos minutos...');
    } catch (err: any) {
      toast.error(err.message || 'Error al enviar a IA');
    }
  };

  const handleDownload = () => {
    if (result?.audio_url) {
      const link = document.createElement('a');
      link.href = result.audio_url;
      link.download = `ghost-studio-cover-${Date.now()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Descargando...');
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary relative">
      <InvocationPortal />
      {/* Header */}
      <header className="border-b border-teal-dark bg-bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-mint to-purple rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-mint via-blue to-purple bg-clip-text text-transparent">
                  GHOST STUDIO
                </h1>
                <p className="text-xs text-lavender font-mono">El portal de creación ritual</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleUploadClick}
                className="btn-ghost px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Upload size={18} />
                Subir Audio
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button className="btn-ghost px-4 py-2 rounded-lg">
                <Settings size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Códice Quote */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-xl p-4 border-l-4 border-mint"
          >
            <p className="text-sm italic text-gray-400">
              "El Estudio Fantasma es el portal de creación ritual. Donde el sonido se invoca, no se fabrica."
            </p>
            <p className="text-xs text-mint mt-1 font-semibold">— CÓDEX Son1kVers3</p>
          </motion.div>

          {/* Timeline Sequencer */}
          <TimelineSequencer
            duration={120}
            onTimeChange={(time) => {
              // Handle time change if needed
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Main Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - Audio Input */}
            <div className="xl:col-span-2 space-y-6">
              <AudioRecorder onRecordingComplete={handleRecordingComplete} />

              {audioURL && (
                <Waveform
                  url={audioURL}
                  isPlaying={isPlaying}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              )}

              {/* Uploaded File Info */}
              {uploadedFile && (
                <div className="glass-panel rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-mint">{uploadedFile.name}</p>
                      <p className="text-xs text-gray-400">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setUploadedFile(null);
                        setAudioURL('');
                        setAudioBlob(null);
                        if (audioURL) URL.revokeObjectURL(audioURL);
                      }}
                      className="btn-ghost px-3 py-1.5 rounded-lg text-xs"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}

              {/* Generation Status */}
              {isGenerating && (
                <div className="glass-panel rounded-xl p-6 border-l-4 border-blue">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-blue border-t-transparent rounded-full animate-spin" />
                    <div>
                      <p className="text-sm font-semibold text-blue">Generando cover...</p>
                      <p className="text-xs text-gray-400">Task ID: {taskId}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="glass-panel rounded-xl p-4 border-l-4 border-red-500 bg-red-500/10">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Result Display */}
              {result?.audio_url && (
                <div className="glass-panel rounded-xl p-6 space-y-4 border-l-4 border-mint">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-mint">Cover Generado</h3>
                    <button
                      onClick={handleDownload}
                      className="btn-neon mint px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Download size={18} />
                      Descargar
                    </button>
                  </div>
                  {uploadedFile && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Archivo:</span>
                      <span className="text-lavender font-mono text-xs">
                        {uploadedFile.name.slice(0, 20)}...
                      </span>
                    </div>
                  )}
                  {prompt && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Prompt:</span>
                      <span className="text-blue font-mono text-xs">
                        {prompt.length} chars
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default GhostStudio;
