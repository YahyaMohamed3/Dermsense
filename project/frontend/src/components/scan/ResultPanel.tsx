import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Info, ChevronDown, ChevronUp, Volume2, Download, Play } from 'lucide-react';
import { cn, typewriterEffect } from "../../lib/utils";

export interface ScanResult {
  top1: {
    label: string;
    confidence: number;
  };
  top2: {
    label: string;
    confidence: number;
  };
  riskLevel: 'unknown' | 'low' | 'medium' | 'high';
  description: string;
  recommendation: string;
  heatmapImage?: string;
}

interface ResultPanelProps {
  result: ScanResult;
  explanation: string | null;
}

export default function ResultPanel({ result, explanation }: ResultPanelProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [counterValue, setCounterValue] = useState(0);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  
  // Digital counter effect for confidence score
  useEffect(() => {
    if (result) {
      let startValue = 0;
      const targetValue = result.top1.confidence;
      const duration = 1500; // ms
      const steps = 30;
      const stepTime = duration / steps;
      
      const increment = targetValue / steps;
      let currentStep = 0;
      
      const timer = setInterval(() => {
        currentStep++;
        const newValue = Math.min(increment * currentStep, targetValue);
        setCounterValue(newValue);
        
        if (currentStep >= steps) {
          clearInterval(timer);
          setCounterValue(targetValue);
          
          // Show heatmap after confidence score animation completes
          setTimeout(() => {
            setShowHeatmap(true);
          }, 500);
        }
      }, stepTime);
      
      return () => clearInterval(timer);
    }
  }, [result]);
  
  // Typewriter effect for explanation
  useEffect(() => {
    if (explanation) {
      const cleanup = typewriterEffect(
        explanation,
        (text) => setDisplayedText(text),
        30
      );
      
      return cleanup;
    }
  }, [explanation]);

  const handleGenerateAudio = () => {
    setIsGeneratingAudio(true);
    // Simulate API call
    setTimeout(() => {
      setIsGeneratingAudio(false);
      // In a real implementation, you would play the audio here
      alert("Audio explanation would play here in production");
    }, 2000);
  };

  const handlePlayVideo = () => {
    setIsPlayingVideo(true);
    // Simulate API call
    setTimeout(() => {
      setIsPlayingVideo(false);
      // In a real implementation, you would show a video modal here
      alert("Video summary would play here in production");
    }, 2000);
  };

  const handleDownloadReport = () => {
    // In a real implementation, you would generate a PDF report here
    alert("PDF report would download here in production");
  };

  const riskColors = {
    low: {
      bg: 'bg-success-900/20',
      text: 'text-success-500',
      border: 'border-success-500',
      badge: 'bg-success-500 text-white',
    },
    medium: {
      bg: 'bg-warning-900/20',
      text: 'text-warning-500',
      border: 'border-warning-500',
      badge: 'bg-warning-500 text-white',
    },
    high: {
      bg: 'bg-error-900/20',
      text: 'text-error-500',
      border: 'border-error-500',
      badge: 'bg-error-500 text-white',
    },
    unknown: {
      bg: 'bg-slate-800',
      text: 'text-slate-300',
      border: 'border-slate-400',
      badge: 'bg-slate-500 text-white',
    },
  };

  const riskColor = riskColors[result.riskLevel];

  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="card overflow-hidden rounded-2xl shadow-md border border-slate-700 transition-all duration-300 h-full"
      variants={containerVariants}
    >
      <motion.div className="card-header" variants={itemVariants}>
        <div className="flex items-center justify-between">
          <h3 className="card-title text-white">Analysis Results</h3>
          <span
            className={cn(
              'px-3 py-1 rounded-full text-sm font-medium',
              riskColor.badge
            )}
          >
            {result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1)} Risk
          </span>
        </div>
        <p className="card-description">Based on the image you provided</p>
      </motion.div>

      <div className="card-content space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Top 1 */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-medium mb-1 text-white">Primary Condition</h4>
            <p className="text-2xl font-bold text-primary-400">
              {result.top1.label}
            </p>
            <div className="flex items-center mt-2">
              <p className="text-sm text-slate-400 mr-3">
                Confidence: 
              </p>
              <span className="font-mono text-white bg-primary-700 px-2 py-0.5 rounded">
                {counterValue.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 mt-3 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${result.top1.confidence}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-success-500 rounded-full"
              />
            </div>
          </motion.div>

          {/* Top 2 */}
          <motion.div variants={itemVariants}>
            <h4 className="text-sm font-medium text-slate-400 mb-1">
              Secondary Possibility
            </h4>
            <p className="text-md font-semibold text-slate-200 flex items-center">
              {result.top2.label} 
              <span className="ml-2 text-white bg-slate-700 px-2 py-0.5 rounded text-sm">
                {result.top2.confidence}%
              </span>
            </p>
          </motion.div>

          {/* Heatmap Image */}
          <AnimatePresence>
            {showHeatmap && result.heatmapImage && (
              <motion.div
                variants={itemVariants}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="border border-slate-700 rounded-xl p-4 bg-slate-800/80 shadow-inner"
              >
                <h4 className="font-semibold text-lg mb-2 text-white">AI Focus Area</h4>
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={result.heatmapImage}
                    alt="Grad-CAM Heatmap"
                    className="w-full rounded-lg border border-slate-700 shadow-md"
                  />
                  
                  {/* Glowing corners */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-secondary-400/50 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-secondary-400/50 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-secondary-400/50 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-secondary-400/50 rounded-br-lg"></div>
                </div>
                <p className="text-sm mt-2 text-slate-400 leading-snug">
                  Highlighted areas show where the AI focused during classification.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Important Note */}
          <motion.div
            variants={itemVariants}
            className={cn(
              'border rounded-lg p-4',
              riskColor.border,
              riskColor.bg
            )}
          >
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
              <div>
                <h4 className="font-medium">Important Note</h4>
                <p className="text-sm">
                  This is an AI-powered analysis. It is not a substitute for medical advice. 
                  Please consult a licensed dermatologist for further evaluation.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Expand Details */}
        <motion.button
          variants={itemVariants}
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          className="flex items-center justify-between w-full py-3 px-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <span className="font-medium flex items-center">
            <Info className="w-4 h-4 mr-2" strokeWidth={1.5} />
            {isDetailsOpen ? 'Hide Details' : 'View Details'}
          </span>
          {isDetailsOpen ? 
            <ChevronUp className="w-5 h-5" strokeWidth={1.5} /> : 
            <ChevronDown className="w-5 h-5" strokeWidth={1.5} />
          }
        </motion.button>

        <AnimatePresence>
          {isDetailsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 space-y-4"
            >
              {/* Description with typewriter effect */}
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-medium mb-1 text-white">AI Explanation</h4>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-secondary-400 hover:text-secondary-300 p-2"
                    onClick={handleGenerateAudio}
                    disabled={isGeneratingAudio}
                  >
                    {isGeneratingAudio ? (
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Volume2 className="w-5 h-5" strokeWidth={1.5} />
                      </motion.div>
                    ) : (
                      <Volume2 className="w-5 h-5" strokeWidth={1.5} />
                    )}
                  </motion.button>
                </div>
                <div className="bg-slate-800/80 p-4 rounded-lg">
                  <p className="text-slate-300 min-h-[3rem] border-l-2 border-secondary-400 pl-3">
                    {displayedText || "Generating explanation..."}
                    {!displayedText && (
                      <motion.span 
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        ⏳
                      </motion.span>
                    )}
                    {displayedText && (
                      <motion.span 
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="inline-block w-2 h-4 bg-secondary-400 ml-1"
                      />
                    )}
                  </p>
                </div>
              </div>

              {/* Recommendation */}
              <div>
                <h4 className="font-medium mb-1 text-white">Recommendation</h4>
                <div className="bg-slate-800/80 p-4 rounded-lg">
                  <p className="text-slate-300">{result.recommendation}</p>
                </div>
              </div>
              
              {/* Optional actions */}
              <div className="flex flex-wrap gap-3 mt-6">
                <motion.button 
                  className="btn btn-outline text-sm px-4 py-2"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerateAudio}
                  disabled={isGeneratingAudio}
                >
                  {isGeneratingAudio ? (
                    <>
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2"
                      >
                        <Volume2 className="w-4 h-4" strokeWidth={1.5} />
                      </motion.div>
                      Generating Audio...
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Listen to Explanation
                    </>
                  )}
                </motion.button>
                
                <motion.button 
                  className="btn btn-outline text-sm px-4 py-2"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePlayVideo}
                  disabled={isPlayingVideo}
                >
                  {isPlayingVideo ? (
                    <>
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2"
                      >
                        <Play className="w-4 h-4" strokeWidth={1.5} />
                      </motion.div>
                      Loading Video...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Play Video Summary
                    </>
                  )}
                </motion.button>
                
                <motion.button 
                  className="btn btn-primary text-sm px-4 py-2 ml-auto"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownloadReport}
                >
                  <Download className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Download Report
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}