import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Volume2, Play, Download, ExternalLink } from 'lucide-react';
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
  explanation?: string | null;
  recommendation?: string | null;
}

export default function ResultPanel({ result, explanation, recommendation }: ResultPanelProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [counterValue, setCounterValue] = useState(0);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [expanded, setExpanded] = useState(false);

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
    setTimeout(() => {
      setIsGeneratingAudio(false);
      alert("Audio explanation would play here in production");
    }, 2000);
  };

  const handlePlayVideo = () => {
    setIsPlayingVideo(true);
    setTimeout(() => {
      setIsPlayingVideo(false);
      alert("Video summary would play here in production");
    }, 2000);
  };

  const handleDownloadReport = () => {
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

  // Show More/Show Less logic
  const MAX_LINES = 5;
  const MAX_CHAR = 450;
  const lineCount = explanation ? explanation.split('\n').length : 0;
  const isLongExplanation =
    explanation && (lineCount > MAX_LINES || explanation.length > MAX_CHAR);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="bg-slate-800/60 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-lg overflow-hidden"
      variants={containerVariants}
    >
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Column 1: Diagnosis */}
          <div className="flex-1">
            <motion.div variants={itemVariants} className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">{result.top1.label}</h2>
              <div className="flex items-center">
                <span className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium mr-3',
                  riskColor.badge
                )}>
                  {result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1)} Risk
                </span>
                <span className="text-slate-400 text-sm">
                  Confidence: <span className="font-mono text-white bg-slate-700 px-2 py-0.5 rounded ml-1">
                    {counterValue.toFixed(1)}%
                  </span>
                </span>
              </div>
              <div className="h-2 mt-4 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.top1.confidence}%` }}
                  transition={{ duration: 1 }}
                  className={cn(
                    "h-full rounded-full",
                    result.riskLevel === 'low' ? 'bg-success-500' :
                      result.riskLevel === 'medium' ? 'bg-warning-500' :
                        result.riskLevel === 'high' ? 'bg-error-500' : 'bg-slate-500'
                  )}
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="mb-6">
              <h3 className="text-lg font-medium text-slate-200 mb-2">Secondary Possibility</h3>
              <div className="flex items-center">
                <span className="text-slate-300">{result.top2.label}</span>
                <span className="ml-2 text-white bg-slate-700 px-2 py-0.5 rounded text-sm">
                  {result.top2.confidence}%
                </span>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className={cn(
                'border rounded-lg p-4 mt-6',
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

          {/* Column 2: AI Explanation */}
          <div className="flex-1">
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-slate-200">AI-Generated Explanation</h3>
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
              <div
                className={cn(
                  "bg-slate-800/80 p-4 rounded-lg min-h-[150px] border border-slate-700 relative",
                  isLongExplanation && !expanded && "max-h-36 overflow-hidden"
                )}
                style={{ whiteSpace: "pre-line" }}
              >
                <p className="text-slate-300 border-l-2 border-secondary-400 pl-3">
                  {displayedText || "Generating explanation..."}
                  {!displayedText && (
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      ⏳
                    </motion.span>
                  )}
                </p>
                {isLongExplanation && !expanded && (
                  <div
                    className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-slate-800/90 to-transparent pt-4 pb-1 flex justify-center"
                  >
                    <button
                      className="text-primary-600 underline text-sm"
                      onClick={() => setExpanded(true)}
                    >
                      Show more
                    </button>
                  </div>
                )}
              </div>
              {isLongExplanation && expanded && (
                <button
                  className="text-primary-600 underline text-sm mt-2"
                  onClick={() => setExpanded(false)}
                >
                  Show less
                </button>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="mt-6">
              <h3 className="text-lg font-medium text-slate-200 mb-2">Recommendation</h3>
              <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700">
                <p className="text-slate-300">{recommendation || result.recommendation}</p>
              </div>
            </motion.div>
          </div>

          {/* Column 3: Actions */}
          <div className="md:w-64">
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-medium text-slate-200 mb-4">Actions</h3>
              <div className="space-y-3">
                <motion.button
                  className="btn btn-outline w-full text-sm px-4 py-2 justify-start"
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
                  className="btn btn-outline w-full text-sm px-4 py-2 justify-start"
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
                  className="btn btn-primary w-full text-sm px-4 py-2 justify-start"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownloadReport}
                >
                  <Download className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Download Report
                </motion.button>

                <motion.a
                  href="#"
                  className="btn btn-outline w-full text-sm px-4 py-2 justify-start"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Find a Dermatologist
                </motion.a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
