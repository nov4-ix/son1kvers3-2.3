// dsp.ts - Digital Signal Processing utilities

export interface TempoResult {
  bpm: number
  confidence: number
}

export interface AudioFeatures {
  rmsMean: number
  rmsVar: number
  centroidMean: number
  centroidVar: number
  rolloffMean: number
  zcrMean: number
}

export interface FeaturesSummary {
  energy: number
  density: number
  spectralCentroid: number
  spectralRolloff: number
  zeroCrossingRate: number
}

// Convert stereo to mono
export function downmixToMono(channels: Float32Array[]): Float32Array {
  if (channels.length === 1) return channels[0]
  
  const length = channels[0].length
  const mono = new Float32Array(length)
  
  for (let i = 0; i < length; i++) {
    let sum = 0
    for (let j = 0; j < channels.length; j++) {
      sum += channels[j][i]
    }
    mono[i] = sum / channels.length
  }
  
  return mono
}

// Normalize audio signal
export function normalize(signal: Float32Array): Float32Array {
  const normalized = new Float32Array(signal.length)
  let max = 0
  
  // Find maximum absolute value
  for (let i = 0; i < signal.length; i++) {
    const abs = Math.abs(signal[i])
    if (abs > max) max = abs
  }
  
  // Avoid division by zero
  if (max === 0) return normalized
  
  // Normalize
  for (let i = 0; i < signal.length; i++) {
    normalized[i] = signal[i] / max
  }
  
  return normalized
}

// Calculate onset strength using spectral flux
export function onsetStrength(signal: Float32Array, sampleRate: number): Float32Array {
  const frameSize = 1024
  const hopSize = 512
  const frames = Math.floor((signal.length - frameSize) / hopSize) + 1
  const onsetStrength = new Float32Array(frames)
  
  let prevSpectrum: Float32Array | null = null
  
  for (let i = 0; i < frames; i++) {
    const start = i * hopSize
    const frame = signal.slice(start, start + frameSize)
    
    // Simple FFT approximation using windowed signal
    const windowed = new Float32Array(frameSize)
    for (let j = 0; j < frameSize; j++) {
      const window = 0.5 * (1 - Math.cos(2 * Math.PI * j / (frameSize - 1))) // Hann window
      windowed[j] = frame[j] * window
    }
    
    // Calculate magnitude spectrum
    const spectrum = new Float32Array(frameSize / 2)
    for (let j = 0; j < frameSize / 2; j++) {
      const real = windowed[j]
      const imag = j < frameSize / 2 ? windowed[j + frameSize / 2] : 0
      spectrum[j] = Math.sqrt(real * real + imag * imag)
    }
    
    // Calculate spectral flux
    if (prevSpectrum) {
      let flux = 0
      for (let j = 0; j < spectrum.length; j++) {
        const diff = spectrum[j] - prevSpectrum[j]
        if (diff > 0) flux += diff
      }
      onsetStrength[i] = flux
    }
    
    prevSpectrum = spectrum
  }
  
  return onsetStrength
}

// Calculate tempo histogram from onset strength
export function tempoHistogram(onsetStrength: Float32Array, sampleRate: number): TempoResult {
  const hopSize = 512
  const timePerFrame = hopSize / sampleRate
  
  // Find peaks in onset strength
  const peaks: number[] = []
  for (let i = 1; i < onsetStrength.length - 1; i++) {
    if (onsetStrength[i] > onsetStrength[i - 1] && onsetStrength[i] > onsetStrength[i + 1]) {
      peaks.push(i)
    }
  }
  
  if (peaks.length < 2) {
    return { bpm: 120, confidence: 0.1 }
  }
  
  // Calculate intervals between peaks
  const intervals: number[] = []
  for (let i = 1; i < peaks.length; i++) {
    intervals.push(peaks[i] - peaks[i - 1])
  }
  
  // Create histogram of intervals
  const histogram = new Map<number, number>()
  intervals.forEach(interval => {
    histogram.set(interval, (histogram.get(interval) || 0) + 1)
  })
  
  // Find most common interval
  let maxCount = 0
  let mostCommonInterval = intervals[0]
  histogram.forEach((count, interval) => {
    if (count > maxCount) {
      maxCount = count
      mostCommonInterval = interval
    }
  })
  
  // Convert interval to BPM
  const intervalTime = mostCommonInterval * timePerFrame
  const bpm = 60 / intervalTime
  
  // Clamp to reasonable range
  const clampedBpm = Math.max(60, Math.min(200, bpm))
  const confidence = Math.min(0.9, maxCount / peaks.length)
  
  return { bpm: Math.round(clampedBpm), confidence }
}

// Calculate audio features
export function features(signal: Float32Array, sampleRate: number): AudioFeatures {
  const frameSize = 1024
  const hopSize = 512
  const frames = Math.floor((signal.length - frameSize) / hopSize) + 1
  
  const rmsValues: number[] = []
  const centroidValues: number[] = []
  const rolloffValues: number[] = []
  const zcrValues: number[] = []
  
  for (let i = 0; i < frames; i++) {
    const start = i * hopSize
    const frame = signal.slice(start, start + frameSize)
    
    // RMS
    let rms = 0
    for (let j = 0; j < frame.length; j++) {
      rms += frame[j] * frame[j]
    }
    rmsValues.push(Math.sqrt(rms / frame.length))
    
    // Spectral centroid
    let weightedSum = 0
    let magnitudeSum = 0
    for (let j = 0; j < frame.length; j++) {
      const magnitude = Math.abs(frame[j])
      const frequency = (j * sampleRate) / frame.length
      weightedSum += frequency * magnitude
      magnitudeSum += magnitude
    }
    centroidValues.push(magnitudeSum > 0 ? weightedSum / magnitudeSum : 0)
    
    // Spectral rolloff (85% energy)
    const magnitudes = new Float32Array(frame.length)
    for (let j = 0; j < frame.length; j++) {
      magnitudes[j] = Math.abs(frame[j])
    }
    
    let totalEnergy = 0
    for (let j = 0; j < magnitudes.length; j++) {
      totalEnergy += magnitudes[j] * magnitudes[j]
    }
    
    const targetEnergy = 0.85 * totalEnergy
    let cumulativeEnergy = 0
    let rolloff = sampleRate / 2
    
    for (let j = 0; j < magnitudes.length; j++) {
      cumulativeEnergy += magnitudes[j] * magnitudes[j]
      if (cumulativeEnergy >= targetEnergy) {
        rolloff = (j * sampleRate) / frame.length
        break
      }
    }
    rolloffValues.push(rolloff)
    
    // Zero crossing rate
    let crossings = 0
    for (let j = 1; j < frame.length; j++) {
      if ((frame[j] >= 0) !== (frame[j - 1] >= 0)) {
        crossings++
      }
    }
    zcrValues.push(crossings / (frame.length - 1))
  }
  
  // Calculate statistics
  const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
  const variance = (arr: number[], mean: number) => 
    arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length
  
  const rmsMean = mean(rmsValues)
  const centroidMean = mean(centroidValues)
  const rolloffMean = mean(rolloffValues)
  const zcrMean = mean(zcrValues)
  
  return {
    rmsMean,
    rmsVar: variance(rmsValues, rmsMean),
    centroidMean,
    centroidVar: variance(centroidValues, centroidMean),
    rolloffMean,
    zcrMean
  }
}

// Create features summary
export function createFeaturesSummary(features: AudioFeatures): FeaturesSummary {
  return {
    energy: Math.min(1, features.rmsMean * 10), // Normalize to 0-1
    density: Math.min(1, features.zcrMean * 2), // Normalize to 0-1
    spectralCentroid: features.centroidMean,
    spectralRolloff: features.rolloffMean,
    zeroCrossingRate: features.zcrMean
  }
}
