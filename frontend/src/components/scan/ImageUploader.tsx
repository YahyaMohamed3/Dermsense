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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div
        {...getRootProps()}
        className={cn(
          'border-3 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors min-h-[400px] flex flex-col items-center justify-center',
          isDragActive 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
            : 'border-slate-300 dark:border-slate-700 hover:border-primary-400 hover:bg-slate-50 dark:hover:border-slate-600 dark:hover:bg-slate-800/50',
          isProcessing && 'opacity-70 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        
        {isProcessing ? (
          <div className="py-8 flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-primary-600 dark:text-secondary-400 animate-spin mb-6" strokeWidth={1.5} />
            <p className="text-xl font-medium mb-2">Processing your image...</p>
            <p className="text-base text-slate-500 dark:text-slate-400">Please wait while we analyze your skin.</p>
            
            {/* Processing preview */}
            {preview && (
              <div className="relative mt-8 rounded-lg overflow-hidden w-full max-w-md mx-auto">
                <img
                  src={preview}
                  alt="Processing"
                  className="w-full object-contain rounded-lg shadow-lg max-h-[300px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
            )}
          </div>
        ) : preview ? (
          <div className="relative w-full">
            <img
              src={preview}
              alt="Uploaded skin image"
              className="max-h-[350px] mx-auto rounded-lg shadow-md object-contain"
            />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 bg-slate-800/70 text-white p-2 rounded-full hover:bg-slate-900/80 transition-colors"
              aria-label="Remove image"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8 w-full"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-6"
            >
              {isDragActive ? 
                <ImageIcon className="w-12 h-12" strokeWidth={1.5} /> : 
                <Upload className="w-12 h-12" strokeWidth={1.5} />
              }
            </motion.div>
            <p className="text-2xl font-medium mb-3">
              {isDragActive ? 'Drop your image here' : 'Upload a skin image'}
            </p>
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-4">
              Drag and drop, or click to select a file
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
              PNG, JPG or GIF (max. 10MB)
            </p>
          </motion.div>
        )}
      </div>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-sm text-error-600 dark:text-error-400 bg-error-50 dark:bg-error-900/20 p-3 rounded-lg"
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  );
}