import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Volume2, Download, StopCircle, Send, CheckCircle, Loader, Save } from 'lucide-react';
import { cn, typewriterEffect } from "../../lib/utils";
import { toast } from 'react-hot-toast';
import { getAuthToken } from '../../services/api';

interface Prediction {
    label: string;
    confidence: number;
}

export interface Explanation {
    explanation_text?: string;
    recommendation?: string;
    technical_summary?: string;
    clinical_recommendation?: string;
}

interface ResultPanelProps {
  predictions: Prediction[];
  riskLevel: 'unknown' | 'low' | 'medium' | 'high';
  explanation: Explanation;
  onSubmitForReview: () => void;
  caseSubmissionStatus: 'idle' | 'submitting' | 'submitted' | 'error';
  isLoggedIn: boolean;
  lesionId?: number | null;
  originalImageBase64?: string;
  heatmapImage?: string;
}

export default function ResultPanel({
    predictions,
    riskLevel,
    explanation,
    onSubmitForReview,
    caseSubmissionStatus,
    isLoggedIn,
    lesionId,
    originalImageBase64,
    heatmapImage
}: ResultPanelProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [counterValue, setCounterValue] = useState(0);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [expandedExp, setExpandedExp] = useState(false);
  const [expandedRec, setExpandedRec] = useState(false);
  const [saveScanStatus, setSaveScanStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const topPrediction = predictions?.[0] || { label: 'N/A', confidence: 0 };
  const secondaryPrediction = predictions?.[1] || { label: 'N/A', confidence: 0 };

  const fullExplanationText = explanation.explanation_text || explanation.technical_summary || "No explanation available.";
  const recommendationText = explanation.recommendation || explanation.clinical_recommendation || "Consult a dermatologist.";

  useEffect(() => {
    if (topPrediction) {
      const targetValue = topPrediction.confidence;
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
  }, [topPrediction]);

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
        const endpoint = `http://localhost:8000/api/v2/speak?risk_level=${riskLevel}`;
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
        toast.error("Sorry, the audio explanation could not be generated.");
        setIsGeneratingAudio(false);
    }
  };


  const handleDownloadReport = () => {
    toast.error("PDF report download is not yet implemented.");
  };

  const handleSaveScan = async () => {
    if (saveScanStatus === 'saving' || saveScanStatus === 'saved') return;
    setSaveScanStatus('saving');
    try {
        const payload = {
            image_base64: originalImageBase64 || '',
            heatmap_image_base64: heatmapImage || '',
            predictions: predictions,
            risk_level: riskLevel,
            ai_explanation: explanation.explanation_text || explanation.technical_summary || "N/A",
            lesion_id: lesionId || null
        };
        const response = await fetch('http://localhost:8000/api/scan/save_to_history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error('Failed to save scan to history');
        }
        toast.success("Scan saved to your history successfully!");
        setSaveScanStatus('saved');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast.error(errorMessage);
        setSaveScanStatus('error');
    }
  };

  const riskColors = {
    low: { bg: 'bg-green-900/20', text: 'text-green-400', border: 'border-green-500/50', badge: 'bg-green-500 text-white' },
    medium: { bg: 'bg-yellow-900/20', text: 'text-yellow-400', border: 'border-yellow-500/50', badge: 'bg-yellow-500 text-white' },
    high: { bg: 'bg-red-900/20', text: 'text-red-500', border: 'border-red-500/50', badge: 'bg-red-500 text-white' },
    unknown: { bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-600', badge: 'bg-slate-500 text-white' },
  };
  const riskColor = riskColors[riskLevel] || riskColors.unknown;

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
  const isLongRecommendation = recommendationText && recommendationText.length > MAX_CHAR;

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
              <h2 className="text-3xl font-bold text-white mb-2">{topPrediction.label}</h2>
              <div className="flex items-center">
                <span className={cn('px-3 py-1 rounded-full text-sm font-medium mr-3', riskColor.badge)}>
                  {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
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
                  animate={{ width: `${topPrediction.confidence}%` }}
                  transition={{ duration: 1 }}
                  className={cn("h-full rounded-full", riskColor.badge.replace('text-white', ''))}
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="mb-6">
              <h3 className="text-lg font-medium text-slate-200 mb-2">Secondary Possibility</h3>
              <div className="flex items-center">
                <span className="text-slate-300">{secondaryPrediction.label}</span>
                <span className="ml-2 text-white bg-slate-700 px-2 py-0.5 rounded text-sm">
                  {secondaryPrediction.confidence}%
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

          {/* Column 2: AI Explanation and Recommendation */}
          <div className="flex-1">
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-slate-200">AI-Generated Explanation</h3>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="text-blue-400 hover:text-blue-300 p-2" onClick={handleGenerateAudio}>
                  {isGeneratingAudio ? <StopCircle className="w-5 h-5 text-red-500" strokeWidth={1.5} /> : <Volume2 className="w-5 h-5" strokeWidth={1.5} />}
                </motion.button>
              </div>
              <div
                className={cn(
                  "bg-slate-800/80 p-4 rounded-lg min-h-[150px] border border-slate-700 relative",
                  isLongExplanation && !expandedExp ? "max-h-36 overflow-hidden pb-16" : "pb-4"
                )}
                style={{ whiteSpace: "pre-line" }}
              >
                <p className="text-slate-300 border-l-2 border-blue-400 pl-3">
                  {expandedExp ? fullExplanationText : (fullExplanationText.slice(0, MAX_CHAR) + (isLongExplanation ? "…" : ""))}
                  {!displayedText && <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>⏳</motion.span>}
                </p>
                {isLongExplanation && !expandedExp && (
                  <div className="absolute bottom-2 left-0 w-full flex justify-center pointer-events-auto">
                    <button className="text-blue-600 underline text-sm bg-slate-900/80 px-3 py-1 rounded shadow" style={{ marginBottom: 4 }} onClick={() => setExpandedExp(true)}>Show more</button>
                  </div>
                )}
                {isLongExplanation && expandedExp && (
                  <div className="pt-2 flex justify-center">
                    <button className="text-blue-600 underline text-sm" onClick={() => setExpandedExp(false)}>Show less</button>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-6">
              <h3 className="text-lg font-medium text-slate-200 mb-2">Recommendation</h3>
              <div
                className={cn(
                  "bg-slate-800/80 p-4 rounded-lg border border-slate-700 relative",
                  isLongRecommendation && !expandedRec ? "max-h-36 overflow-hidden pb-16" : "pb-4"
                )}
              >
                <p className="text-slate-300">{expandedRec ? recommendationText : (recommendationText.slice(0, MAX_CHAR) + (isLongRecommendation ? "…" : ""))}</p>
                {isLongRecommendation && !expandedRec && (
                  <div className="absolute bottom-2 left-0 w-full flex justify-center pointer-events-auto">
                    <button className="text-blue-600 underline text-sm bg-slate-900/80 px-3 py-1 rounded shadow" style={{ marginBottom: 4 }} onClick={() => setExpandedRec(true)}>Show more</button>
                  </div>
                )}
                {isLongRecommendation && expandedRec && (
                  <div className="pt-2 flex justify-center">
                    <button className="text-blue-600 underline text-sm" onClick={() => setExpandedRec(false)}>Show less</button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Column 3: Actions */}
          <div className="md:w-64">
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-medium text-slate-200 mb-4">Actions</h3>
              <div className="space-y-3">
                <motion.button className="btn btn-outline w-full text-sm px-4 py-2 justify-start" whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.1)' }} whileTap={{ scale: 0.98 }} onClick={handleGenerateAudio}>
                  {isGeneratingAudio ? <><StopCircle className="w-4 h-4 mr-2 text-red-500" />Stop Audio</> : <><Volume2 className="w-4 h-4 mr-2" />Listen to Explanation</>}
                </motion.button>
                <motion.button className="btn btn-outline w-full text-sm px-4 py-2 justify-start" whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.1)' }} whileTap={{ scale: 0.98 }} onClick={handleDownloadReport}>
                  <Download className="w-4 h-4 mr-2" />Download Report
                </motion.button>
                {isLoggedIn && (
                  <motion.button 
                      className={cn(
                          "btn w-full text-sm px-4 py-2 justify-start",
                          saveScanStatus === 'saved' 
                              ? "btn-success" 
                              : "btn-outline"
                      )}
                      whileHover={{ scale: saveScanStatus === 'idle' ? 1.02 : 1, backgroundColor: saveScanStatus === 'idle' ? 'rgba(59, 130, 246, 0.1)' : undefined }} 
                      whileTap={{ scale: saveScanStatus === 'idle' ? 0.98 : 1 }} 
                      onClick={handleSaveScan}
                      disabled={saveScanStatus !== 'idle'}
                  >
                      {saveScanStatus === 'idle' && <><Save className="w-4 h-4 mr-2" />Save Scan</>}
                      {saveScanStatus === 'saving' && <><Loader className="w-4 h-4 mr-2 animate-spin" />Saving...</>}
                      {saveScanStatus === 'saved' && <><CheckCircle className="w-4 h-4 mr-2" />Saved</>}
                      {saveScanStatus === 'error' && <><AlertCircle className="w-4 h-4 mr-2" />Save Failed</>}
                  </motion.button>
                )}
                {isLoggedIn && (
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
                      {caseSubmissionStatus === 'idle' && <><Send className="w-4 h-4 mr-2" />{lesionId ? 'Add to Lesion History' : 'Request Professional Review'}</>}
                      {caseSubmissionStatus === 'submitting' && <><Loader className="w-4 h-4 mr-2 animate-spin" />Submitting...</>}
                      {caseSubmissionStatus === 'submitted' && <><CheckCircle className="w-4 h-4 mr-2" />Submitted</>}
                      {caseSubmissionStatus === 'error' && <><AlertCircle className="w-4 h-4 mr-2" />Submission Failed</>}
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
