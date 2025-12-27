'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Music, Sparkles, Copy, Check, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface LyricGeneratorProps {
  onLyricsGenerated?: (lyrics: string) => void;
  analysis?: any;
  knobs?: any;
}

export default function LyricGenerator({
  onLyricsGenerated,
  analysis,
  knobs
}: LyricGeneratorProps) {
  const [lyricsInput, setLyricsInput] = useState('');
  const [generatedLyrics, setGeneratedLyrics] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateLyrics = async () => {
    if (!lyricsInput.trim()) {
      toast.error('Escribe algunas palabras o ideas primero');
      return;
    }

    setIsGenerating(true);
    try {
      // ✅ Usar Groq API directamente para generación inteligente
      const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

      // Construir prompt inteligente basado en contexto del audio y knobs
      let contextDescription = '';

      // Agregar contexto del análisis de audio
      if (analysis) {
        if (analysis.genre && analysis.genre !== 'unknown') {
          contextDescription += `Género musical: ${analysis.genre}. `;
        }
        if (analysis.bpm) {
          contextDescription += `Tempo: ${analysis.bpm} BPM. `;
        }
        if (analysis.mood) {
          contextDescription += `Mood: ${analysis.mood}. `;
        }
      }

      // Agregar contexto de knobs (expresividad, claridad, etc.)
      if (knobs) {
        const exp = knobs.expressivity || 50;
        if (exp <= 20) contextDescription += 'Estilo emocional: Triste y melancólico. ';
        else if (exp <= 40) contextDescription += 'Estilo emocional: Calmado y reflexivo. ';
        else if (exp <= 60) contextDescription += 'Estilo emocional: Equilibrado. ';
        else if (exp <= 80) contextDescription += 'Estilo emocional: Alegre y energético. ';
        else contextDescription += 'Estilo emocional: Eufórico e intenso. ';
      }

      const fullPrompt = `Crea letra de canción completa basada en: "${lyricsInput}"

${contextDescription}

REGLAS OBLIGATORIAS:
1. EMPIEZA DIRECTO con [Verse 1] - NO escribas título
2. Usa SOLO estas etiquetas: [Verse 1], [Chorus], [Verse 2], [Bridge], [Outro]
3. NO uses markdown (**), NO uses títulos, NO uses paréntesis ()
4. Solo letra pura cantable
5. LÍNEAS CORTAS (máximo 6-8 palabras por línea)
6. Cada línea debe ser cantable en 2-3 segundos

ESTRUCTURA:
[Verse 1]
4 líneas cortas

[Chorus]
3 líneas pegajosas

[Verse 2]
4 líneas cortas

[Chorus]

[Bridge]
2-3 líneas cortas

[Chorus]

[Outro]
1-2 líneas finales

EMPIEZA DIRECTAMENTE CON [Verse 1].`;

      if (GROQ_API_KEY) {
        // Usar Groq API
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: fullPrompt }],
            max_tokens: 1200,
            temperature: 0.9
          })
        });

        if (response.ok) {
          const data = await response.json();
          let lyrics = data.choices[0].message.content.trim();

          // Limpiar formato
          const verse1Index = lyrics.indexOf('[Verse 1]');
          if (verse1Index > 0) {
            lyrics = lyrics.substring(verse1Index);
          }

          lyrics = lyrics.replace(/^\*\*.*?\*\*\s*/gm, '');
          lyrics = lyrics.replace(/^#.*$/gm, '');
          lyrics = lyrics.replace(/\(.*?\)/g, '');

          setGeneratedLyrics(lyrics.trim());
          onLyricsGenerated?.(lyrics.trim());
          toast.success('Letra generada con Groq AI!');
          return;
        }
      }

      // Fallback: Generación básica local
      const basicLyrics = generateBasicLyrics(lyricsInput, analysis, knobs);
      setGeneratedLyrics(basicLyrics);
      onLyricsGenerated?.(basicLyrics);
      toast.success('Letra generada (modo básico)');

    } catch (error) {
      console.error('Error generating lyrics:', error);
      // Fallback: Generación básica local
      const basicLyrics = generateBasicLyrics(lyricsInput, analysis, knobs);
      setGeneratedLyrics(basicLyrics);
      onLyricsGenerated?.(basicLyrics);
      toast.success('Letra generada (modo básico)');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateBasicLyrics = (input: string, analysis?: any, knobs?: any): string => {
    // Generación básica de estructura de letra
    const mood = knobs?.expressivity <= 30 ? 'triste' : knobs?.expressivity >= 70 ? 'alegre' : 'neutral';

    return `[Verse 1]
${input}
Reflexionando sobre el tiempo
Buscando un nuevo camino
Encontrando mi destino

[Chorus]
Esta es mi canción
Mi voz, mi emoción
Cantando con el corazón
Esta es mi canción

[Verse 2]
${input}
Caminando hacia adelante
Sin mirar atrás
Construyendo mi futuro
Sin temor ni más

[Chorus]
Esta es mi canción
Mi voz, mi emoción
Cantando con el corazón
Esta es mi canción

[Bridge]
Un momento de paz
Un instante de verdad
Donde todo cobra sentido
Y puedo ser yo

[Chorus]
Esta es mi canción
Mi voz, mi emoción
Cantando con el corazón
Esta es mi canción`;
  };

  const copyLyrics = async () => {
    if (!generatedLyrics) return;

    try {
      await navigator.clipboard.writeText(generatedLyrics);
      setCopied(true);
      toast.success('Letra copiada');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Error al copiar');
    }
  };

  return (
    <div className="glass-panel rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple to-mint rounded-lg flex items-center justify-center">
          <Music className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-lavender">Generador de Letras</h3>
          <p className="text-xs text-gray-400">Escribe ideas o genera letra completa</p>
        </div>
      </div>

      <textarea
        placeholder="Escribe palabras, ideas, emociones, temas... La IA generará una letra completa basada en esto."
        className="input-glass min-h-[120px]"
        value={lyricsInput}
        onChange={(e) => setLyricsInput(e.target.value)}
      />

      <button
        onClick={generateLyrics}
        disabled={isGenerating || !lyricsInput.trim()}
        className="btn-neon purple w-full py-3 rounded-lg flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Generando...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generar Letra
          </>
        )}
      </button>

      {generatedLyrics && (
        <div className="p-4 bg-bg-card rounded-lg border border-teal-dark space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-400 mb-2">Letra Generada:</p>
              <pre className="text-sm text-mint font-mono whitespace-pre-wrap">
                {generatedLyrics}
              </pre>
            </div>
            <button
              onClick={copyLyrics}
              className="ml-2 p-1.5 rounded-lg bg-bg-secondary hover:bg-bg-secondary/80 transition-colors"
              title="Copiar letra"
            >
              {copied ? (
                <Check className="w-4 h-4 text-mint" />
              ) : (
                <Copy className="w-4 h-4 text-lavender" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

