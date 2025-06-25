import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, Image, X, Loader2 } from 'lucide-react';
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
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
          isDragActive 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
            : 'border-gray-300 dark:border-gray-700 hover:border-primary-400 hover:bg-gray-50 dark:hover:border-gray-600 dark:hover:bg-gray-800/50',
          isProcessing && 'opacity-70 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        
        {isProcessing ? (
          <div className="py-8 flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
            <p className="text-lg font-medium">Processing your image...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we analyze your skin.</p>
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
              className="absolute top-2 right-2 bg-gray-800/70 text-white p-1 rounded-full hover:bg-gray-900/80 transition-colors"
              aria-label="Remove image"
            >
              <X className="w-5 h-5" />
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
              className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-4"
            >
              {isDragActive ? <Image className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
            </motion.div>
            <p className="text-lg font-medium mb-1">
              {isDragActive ? 'Drop your image here' : 'Upload a skin image'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Drag and drop, or click to select a file
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              PNG, JPG or GIF (max. 10MB)
            </p>
          </motion.div>
        )}
      </div>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-error-500 dark:text-error-400"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}