import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { KnobSettings } from '../types/suno';

interface KnobProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  color: string;
  description: string | ((value: number) => string);
}

function KnobControl({ label, value, onChange, color, description }: KnobProps) {
  const [isDragging, setIsDragging] = useState(false);
  const rotation = (value / 100) * 270 - 135; // -135° to +135°

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateValue(e);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    updateValue(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateValue = (e: MouseEvent | React.MouseEvent) => {
    // Calculate based on vertical drag
    const deltaY = e.movementY || 0;
    const newValue = Math.max(0, Math.min(100, value - deltaY));
    onChange(Math.round(newValue));
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, value]);

  const descriptionText = typeof description === 'function' 
    ? description(value) 
    : description;

  return (
    <div className="knob-control flex flex-col items-center gap-4">
      <label className="text-ghost font-mono text-sm tracking-wider">
        {label}
      </label>

      <div 
        className="knob relative w-32 h-32 rounded-full cursor-pointer select-none"
        style={{
          background: `conic-gradient(${color} ${value * 3.6}deg, #1a1a1a ${value * 3.6}deg)`,
          boxShadow: `0 0 20px ${color}40`
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Inner circle */}
        <div className="absolute inset-2 rounded-full bg-carbon border border-white/10" />
        
        {/* Indicator */}
        <div 
          className="absolute top-1/2 left-1/2 w-1 h-12 origin-bottom"
          style={{
            transform: `translate(-50%, -100%) rotate(${rotation}deg)`,
            background: color
          }}
        />

        {/* Center dot */}
        <div 
          className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{ background: color }}
        />
      </div>

      {/* Value display */}
      <div className="text-2xl font-mono text-ghost">
        {value}
      </div>

      {/* Description */}
      <p className="text-white/60 text-center text-sm max-w-xs">
        {descriptionText}
      </p>
    </div>
  );
}

interface Props {
  values: KnobSettings;
  onChange: (values: KnobSettings) => void;
}

export function KnobsPanel({ values, onChange }: Props) {
  const updateKnob = (key: keyof KnobSettings, value: number) => {
    onChange({ ...values, [key]: value });
  };

  const getMoodDescription = (v: number): string => {
    if (v <= 12) return '😢 Deeply depressive and dark';
    if (v <= 25) return '😔 Melancholic and sad';
    if (v <= 37) return '😌 Somber and reflective';
    if (v <= 50) return '😐 Calm and balanced';
    if (v <= 62) return '🙂 Hopeful and uplifting';
    if (v <= 75) return '😄 Happy and energetic';
    if (v <= 87) return '😁 Euphoric and intense';
    return '🤯 Ecstatic and explosive';
  };

  const getRarezaDescription = (v: number): string => {
    if (v <= 20) return '📋 Traditional arrangement, close to original';
    if (v <= 40) return '🎵 Slight creative variations';
    if (v <= 60) return '🎨 Moderate experimentation';
    if (v <= 80) return '🌀 Highly experimental';
    return '🚀 Wildly creative, radical transformation';
  };

  const getGarageDescription = (v: number): string => {
    if (v <= 20) return '✨ Pristine digital production';
    if (v <= 40) return '🎚️ Warm analog feel';
    if (v <= 60) return '📼 Vintage tape saturation';
    if (v <= 80) return '📻 Heavy lo-fi aesthetics';
    return '🔊 Extreme saturation and noise';
  };

  const getTrashDescription = (v: number): string => {
    if (v <= 20) return '🎹 Clean and polished';
    if (v <= 40) return '🎸 Slightly edgy';
    if (v <= 60) return '⚡ Gritty distortion';
    if (v <= 80) return '💥 Aggressive and harsh';
    return '🔥 Extreme industrial brutality';
  };

  return (
    <div className="knob-panel glass p-8 rounded-2xl">
      <h2 className="text-2xl font-bold text-ghost mb-8">
        Creative Controls
      </h2>

      <div className="grid grid-cols-4 gap-8">
        <KnobControl
          value={values.expressivity}
          onChange={(v) => updateKnob('expressivity', v)}
          label="EXPRESSIVITY"
          color="#00FFE7"
          description={getMoodDescription}
        />
        
        <KnobControl
          value={values.rareza}
          onChange={(v) => updateKnob('rareza', v)}
          label="RAREZA"
          color="#B84DFF"
          description={getRarezaDescription}
        />
        
        <KnobControl
          value={values.garage}
          onChange={(v) => updateKnob('garage', v)}
          label="GARAGE"
          color="#9AF7EE"
          description={getGarageDescription}
        />
        
        <KnobControl
          value={values.trash}
          onChange={(v) => updateKnob('trash', v)}
          label="TRASH"
          color="#FF4444"
          description={getTrashDescription}
        />
      </div>

      {/* Preset buttons */}
      <div className="mt-8 flex gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange({ expressivity: 20, rareza: 20, garage: 10, trash: 10 })}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-ghost transition"
        >
          😔 Sad Ballad
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange({ expressivity: 50, rareza: 50, garage: 30, trash: 30 })}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-ghost transition"
        >
          😐 Neutral
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange({ expressivity: 80, rareza: 60, garage: 50, trash: 40 })}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-ghost transition"
        >
          😄 Upbeat Pop
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange({ expressivity: 90, rareza: 80, garage: 70, trash: 80 })}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-ghost transition"
        >
          🤘 Aggressive Rock
        </motion.button>
      </div>
    </div>
  );
}
