'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Volume2, Radio, Zap } from 'lucide-react';

export interface KnobSettings {
  expressivity: number; // 0-100: tristeza → euforia
  trash: number;        // 0-100: saturación de mezcla
  garage: number;       // 0-100: distorsión y calidad
  rareza: number;      // 0-100: desapego del arreglo original
}

interface CreativeKnobsProps {
  values: KnobSettings;
  onChange: (values: KnobSettings) => void;
}

export default function CreativeKnobs({ values, onChange }: CreativeKnobsProps) {
  const updateKnob = (key: keyof KnobSettings, value: number) => {
    onChange({ ...values, [key]: value });
  };

  const getExpressivityMood = (v: number): string => {
    if (v <= 10) return '😢 Profundamente triste';
    if (v <= 20) return '😔 Melancólico';
    if (v <= 30) return '😌 Sombrío y reflexivo';
    if (v <= 40) return '😐 Calmado';
    if (v <= 50) return '🙂 Equilibrado';
    if (v <= 60) return '😊 Esperanzado';
    if (v <= 70) return '😄 Alegre';
    if (v <= 80) return '😁 Energético';
    if (v <= 90) return '🤩 Euforico';
    return '🤯 Explosivo y extático';
  };

  const getTrashDescription = (v: number): string => {
    if (v <= 20) return '🎹 Limpio y pulido';
    if (v <= 40) return '🎸 Ligeramente agresivo';
    if (v <= 60) return '⚡ Distorsión moderada';
    if (v <= 80) return '💥 Agresivo y saturado';
    return '🔥 Saturación extrema';
  };

  const getGarageDescription = (v: number): string => {
    if (v <= 20) return '✨ Producción digital pristina';
    if (v <= 40) return '🎚️ Calidez analógica';
    if (v <= 60) return '📼 Saturación vintage';
    if (v <= 80) return '📻 Estética lo-fi pesada';
    return '🔊 Distorsión y ruido extremo';
  };

  const getRarezaDescription = (v: number): string => {
    if (v <= 20) return '📋 Arreglo tradicional, cercano al original';
    if (v <= 40) return '🎵 Variaciones creativas sutiles';
    if (v <= 60) return '🎨 Experimentación moderada';
    if (v <= 80) return '🌀 Altamente experimental';
    return '🚀 Transformación radical y creativa';
  };

  const KnobControl = ({ 
    label, 
    value, 
    onChange, 
    color, 
    icon: Icon,
    description 
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    color: string;
    icon: any;
    description: (v: number) => string;
  }) => {
    const [isDragging, setIsDragging] = useState(false);

    const updateValue = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      onChange(Math.round(percentage));
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
      setIsDragging(true);
      updateValue(e);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      updateValue(e);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4" style={{ color }} />
            <label className="text-sm font-semibold text-lavender">{label}</label>
          </div>
          <span className="text-sm font-mono text-mint">{value}</span>
        </div>
        
        <div 
          className="relative h-2 bg-bg-card rounded-full cursor-pointer"
          onMouseDown={handleMouseDown}
          onMouseMove={isDragging ? handleMouseMove : undefined}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div 
            className="absolute top-0 left-0 h-full rounded-full transition-all"
            style={{ 
              width: `${value}%`,
              background: `linear-gradient(90deg, ${color}80, ${color})`,
              boxShadow: `0 0 10px ${color}40`
            }}
          />
          <div 
            className="absolute top-1/2 w-4 h-4 rounded-full border-2 border-white transform -translate-y-1/2 transition-all"
            style={{ 
              left: `${value}%`,
              background: color,
              boxShadow: `0 0 8px ${color}`
            }}
          />
        </div>

        <p className="text-xs text-gray-400 min-h-[32px]">
          {description(value)}
        </p>
      </div>
    );
  };

  return (
    <div className="glass-panel rounded-xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple to-mint rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-lavender">Knobs Creativos</h3>
          <p className="text-xs text-gray-400">Ajusta la interpretación del cover</p>
        </div>
      </div>

      <div className="space-y-6">
        <KnobControl
          label="EXPRESIVIDAD"
          value={values.expressivity}
          onChange={(v) => updateKnob('expressivity', v)}
          color="#40FDAE"
          icon={Volume2}
          description={getExpressivityMood}
        />

        <KnobControl
          label="TRASH"
          value={values.trash}
          onChange={(v) => updateKnob('trash', v)}
          color="#B858FF"
          icon={Zap}
          description={getTrashDescription}
        />

        <KnobControl
          label="GARAGE"
          value={values.garage}
          onChange={(v) => updateKnob('garage', v)}
          color="#047AF6"
          icon={Radio}
          description={getGarageDescription}
        />

        <KnobControl
          label="RAREZA"
          value={values.rareza}
          onChange={(v) => updateKnob('rareza', v)}
          color="#BCAACD"
          icon={Sparkles}
          description={getRarezaDescription}
        />
      </div>

      {/* Presets */}
      <div className="pt-4 border-t border-teal-dark">
        <p className="text-xs text-gray-400 mb-3">Presets rápidos:</p>
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange({ expressivity: 20, trash: 10, garage: 10, rareza: 20 })}
            className="btn-ghost px-3 py-2 rounded-lg text-xs"
          >
            😔 Triste
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange({ expressivity: 50, trash: 30, garage: 30, rareza: 50 })}
            className="btn-ghost px-3 py-2 rounded-lg text-xs"
          >
            😐 Neutral
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange({ expressivity: 80, trash: 40, garage: 50, rareza: 60 })}
            className="btn-ghost px-3 py-2 rounded-lg text-xs"
          >
            😄 Alegre
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange({ expressivity: 90, trash: 80, garage: 70, rareza: 80 })}
            className="btn-ghost px-3 py-2 rounded-lg text-xs"
          >
            🤘 Agresivo
          </motion.button>
        </div>
      </div>
    </div>
  );
}

