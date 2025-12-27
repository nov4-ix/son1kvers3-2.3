// apps/ghost-studio/src/components/upload/AudioUploader.tsx
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, FileAudio, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { AudioFile } from '../../types/audio';

interface Props {
  onFileSelect: (file: AudioFile) => void;
}

export function AudioUploader({ onFileSelect }: Props) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      alert('Please select an audio file');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB');
      return;
    }

    // Create AudioFile object
    const audioFile: AudioFile = {
      id: Math.random().toString(36).substr(2, 9),
      file,
      url: URL.createObjectURL(file),
      duration: 0, // Will be set after loading
      format: file.type.includes('mp3') ? 'mp3' : 'wav',
      size: file.size,
      metadata: {
        duration: 0,
        sampleRate: 44100,
        channels: 2
      }
    };

    // Load audio to get duration
    const audio = new Audio();
    audio.onloadedmetadata = () => {
      audioFile.duration = audio.duration;
      onFileSelect(audioFile);
    };
    audio.src = audioFile.url;
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.ogg']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  return (
    <Card
      header={
        <div className="flex items-center">
          <Upload className="w-5 h-5 mr-2 text-cyan" />
          <h2 className="text-lg font-semibold text-white">Upload Audio</h2>
        </div>
      }
    >
      <div className="space-y-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragActive 
              ? 'border-cyan bg-cyan/10' 
              : 'border-gray-600 hover:border-cyan/50 hover:bg-white/5'
          }`}
        >
          <input {...getInputProps()} />
          <FileAudio className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          {isDragActive ? (
            <p className="text-cyan">Drop the audio file here...</p>
          ) : (
            <div>
              <p className="text-white mb-2">Drag & drop an audio file here, or click to select</p>
              <p className="text-gray-400 text-sm">Supports MP3, WAV, M4A, OGG (max 50MB)</p>
            </div>
          )}
        </div>

        {fileRejections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3"
          >
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">
              {fileRejections[0].errors[0].message}
            </span>
          </motion.div>
        )}

        <div className="text-center">
          <Button variant="secondary" size="sm">
            Browse Files
          </Button>
        </div>
      </div>
    </Card>
  );
}