import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { cn } from "../../lib/utils";

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  isProcessing: boolean;
}

export default function ImageUploader({ onImageUpload, isProcessing }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, etc.)');
      return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum size is 10MB.');
      return;
    }
    
    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    
    // Pass file to parent component
    onImageUpload(file);
    
    // Free memory when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  }, [onImageUpload]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    disabled: isProcessing
  });
  
  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setError(null);
  };
  
  return (
    <motion.div 
      className="w-full"
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div
        {...getRootProps()}
        className={cn(
          'glass-panel p-6 text-center cursor-pointer transition-colors h-80 flex flex-col items-center justify-center',
          isDragActive 
            ? 'border-cyan-500 bg-cyan-500/10' 
            : 'hover:border-cyan-400 hover:bg-slate-800/80',
          isProcessing && 'opacity-70 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        
        {isProcessing ? (
          <div className="py-8 flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mb-4" strokeWidth={1.5} />
            <p className="text-lg font-medium text-slate-100">Processing your image...</p>
            <p className="text-sm text-slate-400">Please wait while we analyze your skin.</p>
            
            {/* Scanner line animation */}
            {preview && (
              <div className="relative mt-4 rounded-lg overflow-hidden w-64 h-64">
                <img
                  src={preview}
                  alt="Processing"
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="scanner-line"></div>
              </div>
            )}
          </div>
        ) : preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Uploaded skin image"
              className="max-h-64 mx-auto rounded-lg"
            />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 bg-slate-800/70 text-slate-100 p-1 rounded-full hover:bg-slate-900/80 transition-colors"
              aria-label="Remove image"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-cyan-500/20 text-cyan-500 mb-4"
            >
              {isDragActive ? 
                <ImageIcon className="w-8 h-8" strokeWidth={1.5} /> : 
                <Upload className="w-8 h-8" strokeWidth={1.5} />
              }
            </motion.div>
            <p className="text-lg font-medium mb-1 text-slate-100">
              {isDragActive ? 'Drop your image here' : 'Upload a skin image'}
            </p>
            <p className="text-sm text-slate-400">
              Drag and drop, or click to select a file
            </p>
            <p className="text-xs text-slate-500 mt-2">
              PNG, JPG or GIF (max. 10MB)
            </p>
          </motion.div>
        )}
      </div>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-error-500"
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  );
}