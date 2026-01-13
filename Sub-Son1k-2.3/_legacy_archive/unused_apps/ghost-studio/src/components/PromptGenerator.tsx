'use client';

import { useState } from 'react';
import { Sparkles, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import type { AnalysisResult } from '../types/studio';
import type { KnobSettings } from './CreativeKnobs';

interface PromptGeneratorProps {
  onPromptGenerated?: (prompt: string) => void;
  analysis?: AnalysisResult | null;
  knobs?: KnobSettings;
  useAnalysis?: boolean;
  lyrics?: string | null;
}

export default function PromptGenerator({ 
  onPromptGenerated,
  analysis,
  knobs,
  useAnalysis = true,
  lyrics
}: PromptGeneratorProps) {
  const [notes, setNotes] = useState('');
  const [prompt, setPrompt] = useState('');
  const [copied, setCopied] = useState(false);

  const generatePrompt = () => {
    // Permitir generar prompt si hay al menos: notas, análisis, o letras
    if (!notes.trim() && (!analysis || !useAnalysis) && !lyrics) {
      toast.error('Escribe notas, activa el analizador o genera letras');
      return;
    }

    const notesLower = notes.toLowerCase();
    
    // === PARTE 1: INSTRUMENTACIÓN ===
    let instruments: string[] = [];
    
    if (useAnalysis && analysis) {
      // Usar instrumentación detectada del análisis
      const detectedInstruments = analysis.probableInstruments || analysis.instruments || [];
      if (detectedInstruments.length > 0) {
        instruments = detectedInstruments.slice(0, 4); // Máximo 4 instrumentos
      }
    }
    
    // Si no hay análisis o está desactivado, detectar de las notas
    if (instruments.length === 0) {
      const hasVoz = notesLower.includes('voz') || notesLower.includes('vocal') || notesLower.includes('cantar');
      const hasGuitarra = notesLower.includes('guitarra') || notesLower.includes('guitar');
      const hasTeclado = notesLower.includes('teclado') || notesLower.includes('piano') || notesLower.includes('keyboard');
      const hasBajo = notesLower.includes('bajo') || notesLower.includes('bass');
      const hasDrums = notesLower.includes('batería') || notesLower.includes('drums') || notesLower.includes('percusión');
      
      if (hasVoz) instruments.push('voz');
      if (hasGuitarra) instruments.push('guitarra acústica');
      if (hasTeclado) instruments.push('teclado');
      if (hasBajo) instruments.push('bajo');
      if (hasDrums) instruments.push('batería');
    }
    
    if (instruments.length === 0) {
      instruments = ['voz', 'instrumentos'];
    }
    
    // === PARTE 2: MOOD BASADO EN EXPRESIVIDAD ===
    let mood = 'melancólico';
    if (knobs) {
      const exp = knobs.expressivity;
      if (exp <= 10) mood = 'profundamente triste y melancólico';
      else if (exp <= 20) mood = 'melancólico y nostálgico';
      else if (exp <= 30) mood = 'sombrío y reflexivo';
      else if (exp <= 40) mood = 'calmado y sereno';
      else if (exp <= 50) mood = 'equilibrado y neutral';
      else if (exp <= 60) mood = 'esperanzado y optimista';
      else if (exp <= 70) mood = 'alegre y energético';
      else if (exp <= 80) mood = 'euforico y intenso';
      else if (exp <= 90) mood = 'explosivo y extático';
      else mood = 'radicalmente extático';
    } else {
      // Fallback a detección en notas
      const moods = ['melancólico', 'feliz', 'energético', 'triste', 'oscuro', 'brillante', 'nostálgico', 'futurista'];
      const detectedMood = moods.find(m => notesLower.includes(m));
      if (detectedMood) mood = detectedMood;
    }
    
    // === PARTE 3: TEMPO/BPM ===
    let tempo = '~85 BPM';
    if (useAnalysis && analysis && analysis.bpm) {
      tempo = `~${analysis.bpm} BPM`;
    } else {
      const tempoMatch = notes.match(/(\d+)\s*bpm/i);
      if (tempoMatch) {
        tempo = `~${tempoMatch[1]} BPM`;
      }
    }
    
    // === PARTE 4: GÉNERO ===
    let genre = '';
    if (useAnalysis && analysis && analysis.genre && analysis.genre !== 'unknown') {
      genre = analysis.genre;
    }
    
    // === PARTE 5: KNOBS CREATIVOS ===
    const effects: string[] = [];
    
    if (knobs) {
      // TRASH: Saturación de mezcla
      if (knobs.trash >= 60) {
        effects.push('saturación agresiva');
      } else if (knobs.trash >= 40) {
        effects.push('saturación moderada');
      } else if (knobs.trash >= 20) {
        effects.push('saturación sutil');
      }
      
      // GARAGE: Distorsión y calidad
      if (knobs.garage >= 70) {
        effects.push('distorsión extrema', 'estética lo-fi pesada');
      } else if (knobs.garage >= 50) {
        effects.push('saturación vintage', 'calidez analógica');
      } else if (knobs.garage >= 30) {
        effects.push('calidez sutil');
      }
      
      // RAREZA: Desapego del arreglo
      if (knobs.rareza >= 70) {
        effects.push('arreglo radicalmente experimental');
      } else if (knobs.rareza >= 50) {
        effects.push('variaciones creativas significativas');
      } else if (knobs.rareza >= 30) {
        effects.push('variaciones sutiles');
      }
    }
    
    // === CONSTRUIR PROMPT FINAL SINTETIZADO ===
    // Estructura: [INSTRUMENTACIÓN] + [MOOD/STYLE] + [TEMPO] + [EFECTOS] + [LETRAS] + [NOTAS]
    
    let generated = '';
    
    // PARTE 1: INSTRUMENTACIÓN
    generated += `Demo track with ${instruments.join(', ')}`;
    
    // PARTE 2: MOOD Y ESTILO
    generated += `. Mood: ${mood}`;
    if (genre) {
      generated += `, ${genre} style`;
    }
    
    // PARTE 3: TEMPO
    generated += `. Tempo: ${tempo}`;
    
    // PARTE 4: ELEMENTOS DE PRODUCCIÓN BASE
    generated += `. Add ethereal pads, deep bass, wide vocal reverb`;
    
    // PARTE 5: EFECTOS DE KNOBS
    if (effects.length > 0) {
      generated += `. ${effects.join(', ')}`;
    }
    
    // PARTE 6: REFERENCIAS (si hay en notas)
    const references = notes.match(/(?:inspirado|estilo|como|similar|referencia)[\s:]+([A-Za-z\s]+)/i);
    if (references) {
      generated += `. Inspired by ${references[1].trim()}`;
    }
    
    // PARTE 7: ESTRUCTURA (drop/clímax)
    if (notesLower.includes('drop') || notesLower.includes('cambio') || notesLower.includes('clímax')) {
      generated += `. Include a subtle drop at minute 2`;
    }
    
    // PARTE 8: MASTERIZACIÓN
    generated += `. Master warm and balanced.`;
    
    // PARTE 9: LETRAS (si están disponibles)
    if (lyrics && lyrics.trim()) {
      // Las letras se incluyen como parte del prompt para el motor de generación
      generated += `\n\nLyrics:\n${lyrics.trim()}`;
    }
    
    // PARTE 10: NOTAS ADICIONALES (si son relevantes y no muy largas)
    if (notes.length > 0) {
      const cleanNotes = notes.trim();
      if (cleanNotes.length <= 150) {
        generated += `\n\nAdditional notes: ${cleanNotes}`;
      } else {
        generated += `\n\nAdditional notes: ${cleanNotes.slice(0, 150)}...`;
      }
    }
    
    setPrompt(generated);
    onPromptGenerated?.(generated);
    toast.success('Prompt generado con análisis, knobs y letras');
  };

  const copyPrompt = async () => {
    if (!prompt) return;
    
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      toast.success('Prompt copiado');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Error al copiar');
    }
  };

  return (
    <div className="glass-panel rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-lavender">Preparación de Maqueta</h3>
        <Sparkles className="w-5 h-5 text-purple" />
      </div>

      <textarea
        placeholder="Escribe tus notas sobre la canción, el mood, referencias, instrumentos, tempo..."
        className="input-glass min-h-[150px]"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <button onClick={generatePrompt} className="btn-neon purple w-full py-3 rounded-lg">
        <Sparkles className="w-4 h-4 mr-2 inline" /> Generar Prompt para IA
      </button>

      {prompt && (
        <div className="p-4 bg-bg-card rounded-lg border border-teal-dark space-y-2">
          <div className="flex items-start justify-between">
            <p className="text-sm text-mint font-mono flex-1">{prompt}</p>
            <button
              onClick={copyPrompt}
              className="ml-2 p-1.5 rounded-lg bg-bg-secondary hover:bg-bg-secondary/80 transition-colors"
              title="Copiar prompt"
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


