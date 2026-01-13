// apps/ghost-studio/src/components/CoverGenerator.tsx
import { useState } from 'react';
import { useSunoCover } from '../hooks/useSunoCover';

export function CoverGenerator() {
  const { 
    generateCover, 
    isGenerating, 
    taskId, 
    result, 
    error,
    generatorData,
    reset
  } = useSunoCover();
  
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');

  const handleGenerateCover = async () => {
    if (!audioFile) {
      alert('Por favor selecciona un archivo de audio');
      return;
    }
    
    await generateCover(audioFile, prompt);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Datos de The Generator */}
      {generatorData && (
        <div className="bg-cyan/10 border border-cyan/30 rounded-xl p-4">
          <h3 className="text-cyan font-semibold mb-2">📝 Datos de The Generator</h3>
          <div className="text-white/70 text-sm space-y-1">
            <p><strong>Letra:</strong> {typeof generatorData.lyrics === 'string' ? generatorData.lyrics.substring(0, 100) : 'N/A'}...</p>
            <p><strong>Estilo:</strong> {generatorData.style}</p>
            {generatorData.generatedAudio && (
              <p><strong>Audio generado:</strong> Disponible</p>
            )}
          </div>
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">🎤 Generar Cover</h3>
        
        <div className="space-y-4">
          {/* Upload de archivo de audio */}
          <div>
            <label className="block text-white/70 text-sm mb-2">
              Archivo de Audio Original:
            </label>
            <input 
              type="file" 
              accept="audio/*"
              onChange={handleFileChange}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan file:text-black hover:file:bg-cyan/80"
            />
            {audioFile && (
              <p className="text-white/50 text-xs mt-1">
                Archivo seleccionado: {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
          
          {/* Prompt para el cover */}
          <div>
            <label className="block text-white/70 text-sm mb-2">
              Prompt para el Cover:
            </label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe el estilo del cover que quieres generar... (ej: 'rock version', 'acoustic cover', 'electronic remix')"
              className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/50 focus:border-cyan focus:outline-none resize-none"
            />
            {generatorData?.style && (
              <p className="text-white/50 text-xs mt-1">
                Sugerencia basada en The Generator: "{generatorData.style}"
              </p>
            )}
          </div>
          
          {/* Botones de acción */}
          <div className="flex space-x-3">
            <button 
              onClick={handleGenerateCover}
              disabled={isGenerating || !audioFile}
              className="flex-1 px-6 py-3 bg-magenta text-white rounded-lg hover:bg-magenta/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Generando Cover...</span>
                </div>
              ) : (
                '🎤 Generar Cover'
              )}
            </button>
            
            {(result || error) && (
              <button 
                onClick={reset}
                className="px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                🔄 Reset
              </button>
            )}
          </div>
          
          {/* Estado de generación */}
          {isGenerating && taskId && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin w-5 h-5 border-2 border-cyan border-t-transparent rounded-full"></div>
                <div>
                  <p className="text-white font-medium">Generando cover...</p>
                  <p className="text-white/50 text-sm">Task ID: {taskId}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Error */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 text-sm">❌ {error}</p>
            </div>
          )}
          
          {/* Resultado */}
          {result && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">🎵 Cover Generado</h3>
              
              <div className="space-y-4">
                {/* Reproductor de audio */}
                {result.audio_url && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Reproducir Cover:</h4>
                    <audio controls className="w-full">
                      <source src={result.audio_url} type="audio/mpeg" />
                      Tu navegador no soporta el elemento de audio.
                    </audio>
                  </div>
                )}
                
                {/* Información del resultado */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Información:</h4>
                  <div className="text-white/70 text-sm space-y-1">
                    <p><strong>Estado:</strong> {result.status}</p>
                    {result.taskId && <p><strong>Task ID:</strong> {result.taskId}</p>}
                  </div>
                </div>
                
                {/* Botones de acción */}
                <div className="flex space-x-3">
                  {result.audio_url && (
                    <a 
                      href={result.audio_url}
                      download="cover-generated.mp3"
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-center"
                    >
                      💾 Descargar Cover
                    </a>
                  )}
                  
                  <button 
                    onClick={() => sendResultToGenerator()}
                    className="px-4 py-2 bg-cyan text-black rounded-lg hover:bg-cyan/80 transition-colors"
                  >
                    📤 Enviar a The Generator
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function sendResultToGenerator() {
    if (!result?.audio_url) return;
    
    const resultData = {
      coverUrl: result.audio_url,
      originalAudio: generatorData?.generatedAudio,
      prompt: prompt || generatorData?.style || 'Generated cover',
      taskId: result.taskId,
      timestamp: Date.now(),
      source: 'ghost-studio'
    };
    
    localStorage.setItem('son1kverse_ghost_result', JSON.stringify(resultData));
    
    // Abrir The Generator en nueva pestaña
    window.open('/the-generator', '_blank');
  }
}
