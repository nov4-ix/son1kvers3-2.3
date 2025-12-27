/**
 * Translation utility for prompts
 * Translates Spanish prompts to English before sending to generation API
 */

export async function translateToEnglish(text: string): Promise<string> {
  // If text is already mostly English (simple heuristic), return as is
  if (isMostlyEnglish(text)) {
    return text;
  }

  try {
    // Try using a free translation API (Google Translate via proxy or similar)
    // For now, we'll use a simple approach with common musical terms
    
    // If we have a translation API key, use it
    const translationApiUrl = import.meta.env.VITE_TRANSLATION_API_URL;
    
    if (translationApiUrl) {
      const response = await fetch(translationApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          source: 'es',
          target: 'en'
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.translatedText || text;
      }
    }

    // Fallback: Translate common musical terms and phrases
    return translateCommonTerms(text);
  } catch (error) {
    console.warn('Translation failed, using original text:', error);
    // If translation fails, try to translate at least common terms
    return translateCommonTerms(text);
  }
}

function isMostlyEnglish(text: string): boolean {
  // Simple heuristic: if text has mostly English words, assume it's English
  const englishWords = text.match(/\b(the|and|or|but|in|on|at|to|for|of|with|by|from|as|is|was|are|were|be|been|being|have|has|had|do|does|did|will|would|could|should|may|might|must|can|this|that|these|those|a|an)\b/gi);
  const totalWords = text.split(/\s+/).length;
  return englishWords ? englishWords.length / totalWords > 0.3 : false;
}

function translateCommonTerms(text: string): string {
  // Translate common Spanish musical terms to English
  const translations: Record<string, string> = {
    'maqueta': 'demo track',
    'canción': 'song',
    'música': 'music',
    'melodía': 'melody',
    'ritmo': 'rhythm',
    'batería': 'drums',
    'guitarra': 'guitar',
    'bajo': 'bass',
    'teclado': 'keyboard',
    'piano': 'piano',
    'voz': 'vocals',
    'vocal': 'vocal',
    'coro': 'chorus',
    'verso': 'verse',
    'puente': 'bridge',
    'intro': 'intro',
    'outro': 'outro',
    'drop': 'drop',
    'clímax': 'climax',
    'cambio': 'change',
    'triste': 'sad',
    'feliz': 'happy',
    'alegre': 'joyful',
    'energético': 'energetic',
    'calmado': 'calm',
    'melancólico': 'melancholic',
    'nostálgico': 'nostalgic',
    'futurista': 'futuristic',
    'oscuro': 'dark',
    'brillante': 'bright',
    'tempo': 'tempo',
    'bpm': 'bpm',
    'género': 'genre',
    'estilo': 'style',
    'inspirado': 'inspired',
    'referencia': 'reference',
    'masterizar': 'master',
    'mezcla': 'mix',
    'saturación': 'saturation',
    'distorsión': 'distortion',
    'reverb': 'reverb',
    'delay': 'delay',
    'ecualización': 'equalization',
    'compresión': 'compression',
    'pads': 'pads',
    'etéreo': 'ethereal',
    'profundo': 'deep',
    'amplio': 'wide',
    'cálido': 'warm',
    'equilibrado': 'balanced',
    'experimental': 'experimental',
    'variaciones': 'variations',
    'arreglo': 'arrangement',
    'sutil': 'subtle',
    'agresivo': 'aggressive',
    'moderado': 'moderate',
    'vintage': 'vintage',
    'analógico': 'analog',
    'lo-fi': 'lo-fi',
    'calidez': 'warmth',
  };

  let translated = text;
  
  // Replace common terms (case-insensitive)
  Object.entries(translations).forEach(([spanish, english]) => {
    const regex = new RegExp(`\\b${spanish}\\b`, 'gi');
    translated = translated.replace(regex, english);
  });

  return translated;
}
