import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Info, ChevronDown, ChevronUp, Volume2 } from 'lucide-react';
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
}

export default function ResultPanel({ result }: ResultPanelProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [counterValue, setCounterValue] = useState(0);
  const [showHeatmap, setShowHeatmap] = useState(false);
  
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
  
  // Typewriter effect for description
  useEffect(() => {
    if (result) {
      const cleanup = typewriterEffect(
        result.description,
        (text) => setDisplayedText(text),
        30
      );
      
      return cleanup;
    }
  }, [result]);

  const riskColors = {
    low: {
      bg: 'bg-success-50 dark:bg-success-900/20',
      text: 'text-success-900 dark:text-success-500',
      border: 'border-success-500',
      badge: 'bg-success-500 text-white',
    },
    medium: {
      bg: 'bg-warning-50 dark:bg-warning-900/20',
      text: 'text-warning-900 dark:text-warning-500',
      border: 'border-warning-500',
      badge: 'bg-warning-500 text-white',
    },
    high: {
      bg: 'bg-error-50 dark:bg-error-900/20',
      text: 'text-error-900 dark:text-error-500',
      border: 'border-error-500',
      badge: 'bg-error-500 text-white',
    },
    unknown: {
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-600 dark:text-slate-300',
      border: 'border-slate-400',
      badge: 'bg-slate-500 text-white',
    },
  };

  const riskColor = riskColors[result.riskLevel];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="card overflow-hidden rounded-2xl shadow-md border dark:border-slate-700 transition-all duration-300 h-full"
    >
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h3 className="card-title text-slate-900 dark:text-white">Analysis Results</h3>
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
      </div>

      <div className="card-content space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Top 1 */}
          <div>
            <h4 className="text-lg font-medium mb-1 text-slate-900 dark:text-white">Primary Condition</h4>
            <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">
              {result.top1.label}
            </p>
            <div className="flex items-center mt-2">
              <p className="text-sm text-slate-500 dark:text-slate-400 mr-3">
                Confidence: 
              </p>
              <span className="font-mono text-white dark:text-white bg-primary-600 dark:bg-primary-700 px-2 py-0.5 rounded">
                {counterValue.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 mt-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${result.top1.confidence}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-success-500 rounded-full"
              />
            </div>
          </div>

          {/* Top 2 */}
          <div>
            <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              Secondary Possibility
            </h4>
            <p className="text-md font-semibold text-slate-800 dark:text-slate-200 flex items-center">
              {result.top2.label} 
              <span className="ml-2 text-white dark:text-white bg-slate-600 dark:bg-slate-700 px-2 py-0.5 rounded text-sm">
                {result.top2.confidence}%
              </span>
            </p>
          </div>

          {/* Heatmap Image */}
          <AnimatePresence>
            {showHeatmap && result.heatmapImage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="border rounded-xl p-4 bg-slate-50 dark:bg-slate-800 shadow-inner"
              >
                <h4 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">AI Focus Area</h4>
                <img
                  src={result.heatmapImage}
                  alt="Grad-CAM Heatmap"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 shadow-md"
                />
                <p className="text-sm mt-2 text-slate-600 dark:text-slate-400 leading-snug">
                  Highlighted areas show where the AI focused during classification.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Important Note */}
          <div
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
          </div>
        </div>

        {/* Expand Details */}
        <button
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          className="flex items-center justify-between w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <span className="font-medium flex items-center">
            <Info className="w-4 h-4 mr-2" strokeWidth={1.5} />
            {isDetailsOpen ? 'Hide Details' : 'View Details'}
          </span>
          {isDetailsOpen ? 
            <ChevronUp className="w-5 h-5" strokeWidth={1.5} /> : 
            <ChevronDown className="w-5 h-5" strokeWidth={1.5} />
          }
        </button>

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
                  <h4 className="font-medium mb-1 text-slate-900 dark:text-white">Description</h4>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-primary-600 dark:text-secondary-400 hover:text-primary-700 dark:hover:text-secondary-300 p-2"
                  >
                    <Volume2 className="w-5 h-5" strokeWidth={1.5} />
                  </motion.button>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <p className="text-slate-600 dark:text-slate-300 min-h-[3rem] border-l-2 border-primary-500 dark:border-secondary-400 pl-3">
                    {displayedText}
                    <motion.span 
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="inline-block w-2 h-4 bg-primary-500 dark:bg-secondary-400 ml-1"
                    />
                  </p>
                </div>
              </div>

              {/* Recommendation */}
              <div>
                <h4 className="font-medium mb-1 text-slate-900 dark:text-white">Recommendation</h4>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <p className="text-slate-600 dark:text-slate-300">{result.recommendation}</p>
                </div>
              </div>
              
              {/* Optional actions */}
              <div className="flex flex-wrap gap-3 mt-6">
                <button className="btn btn-outline text-sm px-4 py-2">
                  <Volume2 className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Listen to Explanation
                </button>
                
                <button className="btn btn-outline text-sm px-4 py-2">
                  Play Video Summary
                </button>
                
                <button className="btn btn-primary text-sm px-4 py-2 ml-auto">
                  Download Report
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}