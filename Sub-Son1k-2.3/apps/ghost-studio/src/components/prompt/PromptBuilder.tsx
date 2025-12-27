// apps/ghost-studio/src/components/prompt/PromptBuilder.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Send, Copy, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { buildPromptData } from '../../lib/prompt/prompt-builder';
import type { PromptData, AudioAnalysis, KnobSettings } from '@super-son1k/shared-types';

interface Props {
  analysis: AudioAnalysis;
  knobs: KnobSettings;
  userDescription: string;
  onDescriptionChange: (description: string) => void;
  onGenerate: () => void;
}

export function PromptBuilder({ 
  analysis, 
  knobs, 
  userDescription, 
  onDescriptionChange, 
  onGenerate 
}: Props) {
  const [promptData, setPromptData] = useState<PromptData | null>(null);
  const [copied, setCopied] = useState(false);

  const buildPrompt = () => {
    const data = buildPromptData(knobs, analysis, userDescription);
    setPromptData(data);
  };

  const copyPrompt = async () => {
    if (promptData?.prompt) {
      await navigator.clipboard.writeText(promptData.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };


  return (
    <Card
      header={
        <div className="flex items-center">
          <FileText className="w-5 h-5 mr-2 text-accent" />
          <h2 className="text-lg font-semibold text-white">Prompt Builder</h2>
        </div>
      }
    >
      <div className="space-y-6">
        {/* User Description Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/90">
            Describe your vision (optional)
          </label>
          <textarea
            value={userDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="e.g., 'Make it sound like a dreamy synthwave version with ethereal vocals'"
            className="w-full h-24 px-3 py-2 bg-carbon/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20 resize-none"
          />
        </div>

        {/* Build Prompt Button */}
        <div className="flex justify-center">
          <Button
            variant="primary"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={buildPrompt}
          >
            Build Prompt
          </Button>
        </div>

        {/* Generated Prompt */}
        {promptData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-carbon/50 rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white/90">Generated Prompt</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Copy className="w-4 h-4" />}
                  onClick={copyPrompt}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">
                {promptData.prompt}
              </p>
            </div>

            {/* Prompt Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-carbon/30 rounded-lg p-3 border border-white/5">
                <div className="text-white/70 mb-2">Style</div>
                <div className="text-accent">{promptData.style}</div>
              </div>
              <div className="bg-carbon/30 rounded-lg p-3 border border-white/5">
                <div className="text-white/70 mb-2">Title</div>
                <div className="text-cyan">{promptData.title}</div>
              </div>
            </div>

            {promptData.negativePrompt && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <div className="text-red-400 text-xs font-medium mb-1">Avoid</div>
                <div className="text-red-300 text-xs">{promptData.negativePrompt}</div>
              </div>
            )}

            {/* Generate Button */}
            <div className="flex justify-center">
              <Button
                variant="primary"
                size="lg"
                icon={<Send className="w-5 h-5" />}
                onClick={onGenerate}
              >
                Generate Cover
              </Button>
            </div>
          </motion.div>
        )}

        {/* Analysis Summary */}
        <div className="bg-carbon/30 rounded-lg p-4 border border-white/5">
          <h3 className="text-sm font-medium text-white/90 mb-3">Analysis Summary</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-white/70">BPM:</span>
              <span className="text-cyan ml-2 font-mono">{analysis.bpm}</span>
            </div>
            <div>
              <span className="text-white/70">Key:</span>
              <span className="text-magenta ml-2 font-mono">{analysis.key} {analysis.scale}</span>
            </div>
            <div>
              <span className="text-white/70">Genre:</span>
              <span className="text-accent ml-2">{analysis.genre}</span>
            </div>
            <div>
              <span className="text-white/70">Energy:</span>
              <span className="text-yellow-400 ml-2 font-mono">{(analysis.energy ? (analysis.energy * 100).toFixed(0) : 0)}%</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}