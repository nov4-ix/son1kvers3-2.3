import React, { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Mic, X, FileAudio } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void
  onRecordStart: () => void
  className?: string
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onFileSelect,
  onRecordStart,
  className
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const audioFile = files.find(file => 
      file.type.startsWith('audio/') || 
      ['.wav', '.mp3', '.flac', '.m4a', '.aac'].some(ext => 
        file.name.toLowerCase().endsWith(ext)
      )
    )
    
    if (audioFile) {
      setSelectedFile(audioFile)
      onFileSelect(audioFile)
    }
  }, [onFileSelect])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      onFileSelect(file)
    }
  }, [onFileSelect])

  const removeFile = useCallback(() => {
    setSelectedFile(null)
  }, [])

  return (
    <div className={className}>
      {selectedFile ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="son1k-card"
        >
          <div className="son1k-flex justify-between items-center mb-4">
            <div className="son1k-flex">
              <FileAudio className="w-5 h-5 text-cyan mr-2" />
              <div>
                <p className="text-white font-medium">{selectedFile.name}</p>
                <p className="text-white/70 text-sm">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={<X className="w-4 h-4" />}
              onClick={removeFile}
            >
              Remove
            </Button>
          </div>
          
          <div className="son1k-grid grid-cols-2 gap-2">
            <Button variant="primary" size="sm" icon={<Upload className="w-4 h-4" />}>
              Replace File
            </Button>
            <Button variant="secondary" size="sm" icon={<Mic className="w-4 h-4" />}>
              Record New
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`son1k-card transition-all duration-300 ${
            isDragOver ? 'border-cyan son1k-glow-cyan' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-center py-8">
            <motion.div
              animate={{ 
                scale: isDragOver ? 1.1 : 1,
                rotate: isDragOver ? 5 : 0 
              }}
              transition={{ duration: 0.2 }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan/20 to-magenta/20 flex items-center justify-center"
            >
              <Upload className="w-8 h-8 text-cyan" />
            </motion.div>
            
            <h3 className="text-lg font-semibold text-white mb-2">
              {isDragOver ? 'Drop your audio file here' : 'Upload Audio File'}
            </h3>
            <p className="text-white/70 text-sm mb-6">
              Drag & drop or click to browse. Supports WAV, MP3, FLAC, M4A, AAC
            </p>
            
            <div className="son1k-grid grid-cols-2 gap-3">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="audio/*,.wav,.mp3,.flac,.m4a,.aac"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <Button variant="primary" size="sm" icon={<Upload className="w-4 h-4" />}>
                  Browse Files
                </Button>
              </label>
              
              <Button 
                variant="secondary" 
                size="sm" 
                icon={<Mic className="w-4 h-4" />}
                onClick={onRecordStart}
              >
                Record Audio
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
