import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Info, ChevronDown, ChevronUp, Volume2 } from 'lucide-react';
import { cn } from "../../lib/utils";
import { typewriterEffect } from '../../lib/utils';

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
      bg: 'bg-success-500/20',
      text: 'text-success-500',
      border: 'border-success-500/50',
    },
    medium: {
      bg: 'bg-warning-500/20',
      text: 'text-warning-500',
      border: 'border-warning-500/50',
    },
    high: {
      bg: 'bg-error-500/20',
      text: 'text-error-500',
      border: 'border-error-500/50',
    },
    unknown: {
      bg: 'bg-slate-700',
      text: 'text-slate-300',
      border: 'border-slate-500/50',
    },
  };

  const riskColor = riskColors[result.riskLevel];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="glass-panel overflow-hidden rounded-2xl shadow-xl transition-all duration-300"
    >
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h3 className="card-title text-slate-100">Analysis Results</h3>
          <span
            className={cn(
              'px-3 py-1 rounded-full text-sm font-medium',
              riskColor.bg,
              riskColor.text
            )}
          >
            {result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1)} Risk
          </span>
        </div>
        <p className="card-description text-slate-400">Based on the image you provided</p>
      </div>

      <div className="card-content space-y-6">
        {/* Top 1 */}
        <div>
          <h4 className="text-lg font-medium mb-1 text-slate-200">Top Condition</h4>
          <p className="text-2xl font-bold glow-text">
            {result.top1.label}
          </p>
          <p className="text-sm text-slate-400">
            Confidence: <span className="text-cyan-500 font-mono">{counterValue.toFixed(2)}%</span>
          </p>
          <div className="h-2 mt-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${result.top1.confidence}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-cyan-500 rounded-full"
            />
          </div>
        </div>

        {/* Top 2 */}
        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-1">
            Second Most Likely
          </h4>
          <p className="text-md font-semibold text-slate-300">
            {result.top2.label} ({result.top2.confidence}%)
          </p>
        </div>

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
              <h4 className="font-medium text-slate-100">Important Note</h4>
              <p className="text-sm text-slate-300">
                This is an AI-powered analysis. It is not a substitute for medical advice. 
                Please consult a licensed dermatologist for further evaluation.
              </p>
            </div>
          </div>
        </div>

        {/* Expand Details */}
        <button
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          className="flex items-center justify-between w-full py-2 px-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
        >
          <span className="font-medium flex items-center text-slate-200">
            <Info className="w-4 h-4 mr-2" strokeWidth={1.5} />
            {isDetailsOpen ? 'Hide Details' : 'View Details'}
          </span>
          {isDetailsOpen ? 
            <ChevronUp className="w-5 h-5 text-slate-300" strokeWidth={1.5} /> : 
            <ChevronDown className="w-5 h-5 text-slate-300" strokeWidth={1.5} />
          }
        </button>

        <AnimatePresence>
          {isDetailsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 space-y-4 overflow-hidden"
            >
              {/* Description with typewriter effect */}
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-medium mb-1 text-slate-200">Description</h4>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-cyan-500 hover:text-cyan-400"
                  >
                    <Volume2 className="w-5 h-5" strokeWidth={1.5} />
                  </motion.button>
                </div>
                <p className="text-slate-300 min-h-[3rem] border-l-2 border-cyan-500/50 pl-3">
                  {displayedText}
                  <motion.span 
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="inline-block w-2 h-4 bg-cyan-500 ml-1"
                  />
                </p>
              </div>

              {/* Recommendation */}
              <div>
                <h4 className="font-medium mb-1 text-slate-200">Recommendation</h4>
                <p className="text-slate-300">{result.recommendation}</p>
              </div>

              {/* Grad-CAM Image */}
              {result.heatmapImage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
                  className="glass-panel p-4 mt-4"
                >
                  <h4 className="font-semibold text-lg mb-2 text-slate-100">Visual Explanation (Grad-CAM)</h4>
                  <div className="relative">
                    <img
                      src={result.heatmapImage}
                      alt="Grad-CAM Heatmap"
                      className="w-full rounded-lg border border-slate-600 shadow-md"
                    />
                    {/* Connecting line animation */}
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      className="absolute -top-4 left-0 h-px bg-gradient-to-r from-cyan-500 to-transparent"
                    />
                  </div>
                  <p className="text-sm mt-2 text-slate-400 leading-snug">
                    Highlighted areas show where the AI focused during classification.
                    Use this visualization as supportive insight.
                  </p>
                </motion.div>
              )}
              
              {/* Avatar placeholder (would be implemented with actual video avatar) */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="flex justify-center mt-6"
              >
                <div className="relative w-16 h-16 rounded-full bg-slate-700 border-2 border-cyan-500 flex items-center justify-center overflow-hidden glow-hover cursor-pointer">
                  <span className="text-xs text-slate-300">AI Doctor</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}