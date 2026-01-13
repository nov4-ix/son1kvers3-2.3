// heuristics.ts - Genre and instrument classification heuristics

export interface StyleTags {
  styleTags: string[]
  probableInstruments: string[]
}

export interface AnalysisData {
  bpm: number
  featuresSummary: {
    energy: number
    density: number
    spectralCentroid: number
    spectralRolloff: number
    zeroCrossingRate: number
  }
}

// Classify style based on BPM and features
export function classifyStyle(data: AnalysisData): StyleTags {
  const { bpm, featuresSummary } = data
  const { energy, density, spectralCentroid, spectralRolloff, zeroCrossingRate } = featuresSummary
  
  const styleTags: string[] = []
  const probableInstruments: string[] = []
  
  // BPM-based classification
  if (bpm >= 60 && bpm <= 85) {
    if (spectralCentroid < 1000) {
      styleTags.push('ballad', 'lofi')
      probableInstruments.push('piano', 'acoustic guitar', 'soft vocals')
    } else if (energy > 0.7) {
      styleTags.push('r&b', 'soul')
      probableInstruments.push('bass', 'drums', 'electric guitar', 'vocals')
    } else {
      styleTags.push('ambient', 'chill')
      probableInstruments.push('synth', 'pad', 'soft percussion')
    }
  } else if (bpm >= 85 && bpm <= 110) {
    if (zeroCrossingRate > 0.1) {
      styleTags.push('hip-hop', 'trap')
      probableInstruments.push('kick', 'snare', 'bass', 'hi-hat', 'vocals')
    } else if (spectralCentroid > 2000) {
      styleTags.push('pop', 'indie')
      probableInstruments.push('electric guitar', 'bass', 'drums', 'vocals')
    } else {
      styleTags.push('pop', 'alternative')
      probableInstruments.push('acoustic guitar', 'bass', 'drums', 'vocals')
    }
  } else if (bpm >= 110 && bpm <= 130) {
    if (spectralRolloff > 5000) {
      styleTags.push('house', 'electronic')
      probableInstruments.push('kick', 'bass', 'synth', 'hi-hat')
    } else {
      styleTags.push('synthpop', 'new wave')
      probableInstruments.push('synth', 'bass', 'drums', 'vocals')
    }
  } else if (bpm >= 130 && bpm <= 160) {
    if (density > 0.7) {
      styleTags.push('dnb', 'drum and bass')
      probableInstruments.push('kick', 'snare', 'bass', 'hi-hat', 'breakbeat')
    } else if (zeroCrossingRate > 0.15) {
      styleTags.push('techno', 'industrial')
      probableInstruments.push('kick', 'bass', 'synth', 'percussion')
    } else {
      styleTags.push('punk', 'rock')
      probableInstruments.push('electric guitar', 'bass', 'drums', 'vocals')
    }
  } else if (bpm > 160) {
    styleTags.push('hardcore', 'speed')
    probableInstruments.push('kick', 'snare', 'bass', 'electric guitar', 'vocals')
  }
  
  // Feature-based refinements
  if (energy > 0.8) {
    if (!styleTags.includes('energetic')) styleTags.push('energetic')
    if (!probableInstruments.includes('drums')) probableInstruments.push('drums')
  }
  
  if (spectralCentroid > 3000) {
    if (!styleTags.includes('bright')) styleTags.push('bright')
    if (!probableInstruments.includes('electric guitar')) probableInstruments.push('electric guitar')
  }
  
  if (spectralCentroid < 500) {
    if (!styleTags.includes('dark')) styleTags.push('dark')
    if (!probableInstruments.includes('bass')) probableInstruments.push('bass')
  }
  
  if (density > 0.6) {
    if (!styleTags.includes('dense')) styleTags.push('dense')
    if (!probableInstruments.includes('percussion')) probableInstruments.push('percussion')
  }
  
  if (zeroCrossingRate > 0.2) {
    if (!styleTags.includes('percussive')) styleTags.push('percussive')
    if (!probableInstruments.includes('hi-hat')) probableInstruments.push('hi-hat')
  }
  
  // Remove duplicates and limit results
  return {
    styleTags: [...new Set(styleTags)].slice(0, 5),
    probableInstruments: [...new Set(probableInstruments)].slice(0, 6)
  }
}

// Additional genre-specific rules
export function getGenreDescription(styleTags: string[]): string {
  const descriptions: Record<string, string> = {
    'ballad': 'Slow, emotional song with emphasis on melody',
    'lofi': 'Low-fidelity, relaxed sound with vintage character',
    'r&b': 'Rhythm and blues with soulful vocals and groove',
    'soul': 'Emotional, expressive music with gospel influences',
    'ambient': 'Atmospheric, textural music for relaxation',
    'chill': 'Relaxed, downtempo electronic music',
    'hip-hop': 'Rhythmic music with spoken or rapped vocals',
    'trap': 'Subgenre of hip-hop with heavy bass and hi-hats',
    'pop': 'Popular music with catchy melodies and hooks',
    'indie': 'Independent music with alternative sensibilities',
    'alternative': 'Non-mainstream music with experimental elements',
    'house': 'Electronic dance music with four-on-the-floor beat',
    'electronic': 'Music created using electronic instruments',
    'synthpop': 'Pop music featuring synthesizers prominently',
    'new wave': 'Post-punk music with electronic elements',
    'dnb': 'Fast breakbeat music with heavy basslines',
    'drum and bass': 'High-energy electronic music with complex rhythms',
    'techno': 'Electronic dance music with repetitive beats',
    'industrial': 'Harsh electronic music with mechanical sounds',
    'punk': 'Fast, aggressive rock music with simple structures',
    'rock': 'Guitar-driven music with strong rhythm section',
    'hardcore': 'Extreme, aggressive music with fast tempos',
    'speed': 'Very fast tempo music, often metal or punk',
    'energetic': 'High-energy, upbeat music',
    'bright': 'Music with high-frequency content and clarity',
    'dark': 'Music with low-frequency emphasis and mood',
    'dense': 'Music with many simultaneous elements',
    'percussive': 'Music emphasizing rhythm and percussion'
  }
  
  return styleTags.map(tag => descriptions[tag] || tag).join(', ')
}

// Get instrument descriptions
export function getInstrumentDescription(instruments: string[]): string {
  const descriptions: Record<string, string> = {
    'piano': 'Acoustic or electric piano',
    'acoustic guitar': 'Traditional guitar with steel strings',
    'electric guitar': 'Guitar with electromagnetic pickups',
    'bass': 'Low-frequency instrument, electric or acoustic',
    'drums': 'Percussion instrument with multiple components',
    'kick': 'Bass drum, low-frequency percussion',
    'snare': 'Snare drum with sharp, crackling sound',
    'hi-hat': 'Cymbal pair played with foot pedal',
    'vocals': 'Human voice, lead or backing',
    'soft vocals': 'Gentle, intimate vocal performance',
    'synth': 'Synthesizer, electronic keyboard instrument',
    'pad': 'Sustained synthesizer sound for atmosphere',
    'soft percussion': 'Gentle, subtle percussion elements',
    'breakbeat': 'Complex drum pattern with syncopation',
    'percussion': 'Various rhythmic instruments'
  }
  
  return instruments.map(instrument => descriptions[instrument] || instrument).join(', ')
}
