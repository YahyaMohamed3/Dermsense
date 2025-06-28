import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Volume2, Play, Download, StopCircle, Send, CheckCircle, Loader } from 'lucide-react';
import { cn, typewriterEffect } from "../../lib/utils";

export interface ScanResult {
  top1: { label: string; confidence: number; };
  top2: { label: string; confidence: number; };
  riskLevel: 'unknown' | 'low' | 'medium' | 'high';
}

export interface Explanation {
    explanation_text?: string;
    recommendation?: string;
    technical_summary?: string;
    clinical_recommendation?: string;
}

interface ResultPanelProps {
  result: ScanResult;
  explanation: Explanation;
  onSubmitForReview: () => void;
  caseSubmissionStatus: 'idle' | 'submitting' | 'submitted' | 'error';
}

export default function ResultPanel({ result, explanation, onSubmitForReview, caseSubmissionStatus }: ResultPanelProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [counterValue, setCounterValue] = useState(0);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fullExplanationText = explanation.explanation_text || explanation.technical_summary || "No explanation available.";
  const recommendationText = explanation.recommendation || explanation.clinical_recommendation || "Consult a dermatologist.";


  useEffect(() => {
    if (result) {
      let startValue = 0;
      const targetValue = result.top1.confidence;
      const duration = 1500;
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

  useEffect(() => {
    const cleanup = typewriterEffect(
        fullExplanationText,
        (text) => setDisplayedText(text),
        30
    );
    return cleanup;
  }, [fullExplanationText]);
  
  useEffect(() => {
    return () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
    }
  }, []);

  const handleGenerateAudio = async () => {
    if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsGeneratingAudio(false);
        return;
    }
    
    if (!fullExplanationText) return;

    setIsGeneratingAudio(true);
    
    try {
        const endpoint = `http://localhost:8000/api/v2/speak?risk_level=${result.riskLevel}`;
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text_to_speak: fullExplanationText }),
        });

        if (!response.ok) throw new Error(`Backend error: ${response.statusText}`);

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.play();
        audio.onended = () => {
            setIsGeneratingAudio(false);
            URL.revokeObjectURL(audioUrl);
            audioRef.current = null;
        };
        audio.onerror = () => {
            setIsGeneratingAudio(false);
            URL.revokeObjectURL(audioUrl);
            audioRef.current = null;
        };

    } catch (error) {
        console.error("Failed to generate or play audio:", error);
        alert("Sorry, the audio explanation could not be generated.");
        setIsGeneratingAudio(false);
    }
  };

  const handlePlayVideo = async () => {
    if (!fullExplanationText) return;
    setIsPlayingVideo(true);
    try {
        const res = await fetch("http://localhost:8000/api/video-report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ script: fullExplanationText + " " + recommendationText })
        });
        if (!res.ok) throw new Error("Could not generate video report.");
        const data = await res.json();
        if (data.videoUrl) {
            window.open(data.videoUrl, '_blank');
        }
    } catch(error) {
        console.error("Video report error:", error);
        alert("Sorry, the video summary could not be generated at this time.");
    } finally {
        setIsPlayingVideo(false);
    }
  };

  const handleDownloadReport = () => {
    alert("PDF report would download here in production");
  };

  const riskColors = {
    low: { bg: 'bg-success-900/20', text: 'text-success-500', border: 'border-success-500', badge: 'bg-success-500 text-white' },
    medium: { bg: 'bg-warning-900/20', text: 'text-warning-500', border: 'border-warning-500', badge: 'bg-warning-500 text-white' },
    high: { bg: 'bg-error-900/20', text: 'text-error-500', border: 'border-error-500', badge: 'bg-error-500 text-white' },
    unknown: { bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-400', badge: 'bg-slate-500 text-white' },
  };
  const riskColor = riskColors[result.riskLevel];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const MAX_CHAR = 450;
  const isLongExplanation = fullExplanationText && fullExplanationText.length > MAX_CHAR;

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
                <span className={cn('px-3 py-1 rounded-full text-sm font-medium mr-3', riskColor.badge)}>
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
                  className={cn("h-full rounded-full", riskColor.badge.replace('text-white', ''))}
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

            <motion.div variants={itemVariants} className={cn('border rounded-lg p-4 mt-6', riskColor.border, riskColor.bg)}>
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
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="text-secondary-400 hover:text-secondary-300 p-2" onClick={handleGenerateAudio}>
                  {isGeneratingAudio ? <StopCircle className="w-5 h-5 text-error-500" strokeWidth={1.5} /> : <Volume2 className="w-5 h-5" strokeWidth={1.5} />}
                </motion.button>
              </div>
              <div className={cn("bg-slate-800/80 p-4 rounded-lg min-h-[150px] border border-slate-700 relative", isLongExplanation && !expanded && "max-h-36 overflow-hidden")} style={{ whiteSpace: "pre-line" }}>
                <p className="text-slate-300 border-l-2 border-secondary-400 pl-3">
                  {displayedText || "Generating explanation..."}
                  {!displayedText && <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>⏳</motion.span>}
                </p>
                {isLongExplanation && !expanded && (
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-slate-800/90 to-transparent pt-4 pb-1 flex justify-center">
                    <button className="text-primary-600 underline text-sm" onClick={() => setExpanded(true)}>Show more</button>
                  </div>
                )}
              </div>
              {isLongExplanation && expanded && <button className="text-primary-600 underline text-sm mt-2" onClick={() => setExpanded(false)}>Show less</button>}
            </motion.div>

            <motion.div variants={itemVariants} className="mt-6">
              <h3 className="text-lg font-medium text-slate-200 mb-2">Recommendation</h3>
              <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700">
                <p className="text-slate-300">{recommendationText}</p>
              </div>
            </motion.div>
          </div>

          {/* Column 3: Actions */}
          <div className="md:w-64">
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-medium text-slate-200 mb-4">Actions</h3>
              <div className="space-y-3">
                <motion.button className="btn btn-outline w-full text-sm px-4 py-2 justify-start" whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.1)' }} whileTap={{ scale: 0.98 }} onClick={handleGenerateAudio}>
                  {isGeneratingAudio ? <><StopCircle className="w-4 h-4 mr-2 text-error-500" />Stop Audio</> : <><Volume2 className="w-4 h-4 mr-2" />Listen to Explanation</>}
                </motion.button>

                <motion.button className="btn btn-outline w-full text-sm px-4 py-2 justify-start" whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.1)' }} whileTap={{ scale: 0.98 }} onClick={handlePlayVideo} disabled={isPlayingVideo}>
                  {isPlayingVideo ? <><Loader className="w-4 h-4 mr-2 animate-spin" />Generating Video...</> : <><Play className="w-4 h-4 mr-2" />Play Video Summary</>}
                </motion.button>

                <motion.button className="btn btn-outline w-full text-sm px-4 py-2 justify-start" whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.1)' }} whileTap={{ scale: 0.98 }} onClick={handleDownloadReport}>
                  <Download className="w-4 h-4 mr-2" />Download Report
                </motion.button>
                
                {/* === NEW SUBMISSION BUTTON === */}
                <motion.button 
                    className={cn(
                        "btn w-full text-sm px-4 py-2 justify-start",
                        caseSubmissionStatus === 'submitted' 
                            ? "btn-success" 
                            : "btn-primary"
                    )}
                    whileHover={{ scale: caseSubmissionStatus === 'idle' ? 1.02 : 1 }} 
                    whileTap={{ scale: caseSubmissionStatus === 'idle' ? 0.98 : 1 }} 
                    onClick={onSubmitForReview}
                    disabled={caseSubmissionStatus !== 'idle'}
                >
                    {caseSubmissionStatus === 'idle' && <><Send className="w-4 h-4 mr-2" />Request Professional Review</>}
                    {caseSubmissionStatus === 'submitting' && <><Loader className="w-4 h-4 mr-2 animate-spin" />Submitting to Clinic...</>}
                    {caseSubmissionStatus === 'submitted' && <><CheckCircle className="w-4 h-4 mr-2" />Submitted to Clinic</>}
                    {caseSubmissionStatus === 'error' && <><AlertCircle className="w-4 h-4 mr-2" />Submission Failed</>}
                </motion.button>

              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}