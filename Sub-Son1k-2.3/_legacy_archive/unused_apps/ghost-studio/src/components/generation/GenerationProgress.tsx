// apps/ghost-studio/src/components/generation/GenerationProgress.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle, Music } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { SunoTaskStatus } from '../../types/suno';

interface Props {
  status: SunoTaskStatus | null;
  error: string | null;
  onComplete: () => void;
}

export function GenerationProgress({ status, error, onComplete }: Props) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (status?.status === 'completed' && status.audioUrl) {
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  }, [status, onComplete]);

  const getStatusIcon = () => {
    if (error) return <AlertCircle className="w-8 h-8 text-red-400" />;
    if (status?.status === 'completed') return <CheckCircle className="w-8 h-8 text-green-400" />;
    return <Loader2 className="w-8 h-8 text-cyan animate-spin" />;
  };

  const getStatusText = () => {
    if (error) return 'Generation Failed';
    if (status?.status === 'completed') return 'Generation Complete!';
    if (status?.status === 'processing') return 'Generating your cover';
    if (status?.status === 'pending' || !status?.status) return 'Queued for generation';
    return 'Starting generation';
  };

  const getStatusDescription = () => {
    if (error) return error;
    if (status?.status === 'completed') return 'Your AI-generated cover is ready!';
    if (status?.status === 'processing') return `Creating your musical masterpiece${dots}`;
    if (status?.status === 'pending' || !status?.status) return 'Your request is in the queue';
    return 'Preparing to generate your cover';
  };

  return (
    <Card
      header={
        <div className="flex items-center">
          <Music className="w-5 h-5 mr-2 text-magenta" />
          <h2 className="text-lg font-semibold text-white">Generation Progress</h2>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Status Icon and Text */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {getStatusIcon()}
          </motion.div>
          
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {getStatusText()}
            </h3>
            <p className="text-white/70">
              {getStatusDescription()}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {status?.status !== 'completed' && !error && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Progress</span>
              <span className="text-cyan font-mono">
                {status?.progress ? `${status.progress}%` : 'Processing...'}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-cyan to-magenta h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: status?.progress ? `${status.progress}%` : '60%' 
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* Task ID */}
        {status?.taskId && (
          <div className="bg-carbon/50 rounded-lg p-3 border border-white/10">
            <div className="text-xs text-white/70 mb-1">Task ID</div>
            <div className="text-xs text-cyan font-mono break-all">
              {status.taskId}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
          >
            <div className="text-red-400 text-sm">
              {error}
            </div>
            <div className="mt-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </motion.div>
        )}

        {/* Success State */}
        {status?.status === 'completed' && status.audioUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 border border-green-500/20 rounded-lg p-4"
          >
            <div className="text-green-400 text-sm mb-3">
              Your cover has been generated successfully!
            </div>
            <div className="text-xs text-white/70 space-y-1">
              {status.duration && (
                <div>Duration: {status.duration}s</div>
              )}
              {status.createdAt && (
              <div>Generated: {new Date(status.createdAt).toLocaleString()}</div>
              )}
            </div>
          </motion.div>
        )}

        {/* Generation Steps */}
        <div className="space-y-2">
          {[
            { name: 'Upload Audio', completed: true },
            { name: 'Process Request', completed: status?.status !== 'pending' },
            { name: 'Generate Cover', completed: status?.status === 'completed' },
            { name: 'Finalize', completed: status?.status === 'completed' }
          ].map((step, index) => (
            <motion.div
              key={step.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                step.completed 
                  ? 'bg-green-500/10 border border-green-500/20' 
                  : 'bg-gray-700/50'
              }`}
            >
              {step.completed ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-gray-500" />
              )}
              <span className={`text-sm ${
                step.completed ? 'text-green-400' : 'text-gray-400'
              }`}>
                {step.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
}