import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Microscope, Smartphone, RotateCcw } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import ImageUploader from '../components/scan/ImageUploader';
import ResultPanel, { Explanation } from '../components/scan/ResultPanel';
import EducationalSidebar from '../components/scan/EducationalSidebar';
import PrivacyNotice from '../components/scan/PrivacyNotice';
import { api } from '../services/api';

interface Prediction {
    label: string;
    confidence: number;
}

export interface AnalysisResult {
  predictions: Prediction[];
  riskLevel: 'low' | 'medium' | 'high' | 'unknown';
  explanation: Explanation;
  heatmapImage: string;
  originalImageBase64: string;
}

export default function ScanPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [activeModel, setActiveModel] = useState<'clinical' | 'consumer'>('consumer');
  const [showSideBySide, setShowSideBySide] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [caseSubmissionStatus, setCaseSubmissionStatus] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');

  const navigate = useNavigate();
  const location = useLocation();
  const lesionId = location.state?.lesionId;

  useEffect(() => {
    if (isProcessing) {
      setShowSideBySide(false);
      setCaseSubmissionStatus('idle');
    }
  }, [isProcessing]);

  const handleNewAnalysis = () => {
    setAnalysisResult(null);
    setShowSideBySide(false);
    setOriginalImageUrl(null);
    setCaseSubmissionStatus('idle');
    navigate('/scan', { state: {}, replace: true });
  };

  const handleImageUpload = async (file: File) => {
    setAnalysisResult(null);
    setShowSideBySide(false);
    setIsProcessing(true);
    setOriginalImageUrl(URL.createObjectURL(file));

    try {
      const endpoint = `http://localhost:8000/api/v2/analyze?mode=${activeModel}`;
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to get analysis from backend.");
      }
      
      const responseData = await res.json();

      const formattedResult: AnalysisResult = {
        predictions: [
          ...(responseData.prediction?.top1 ? [responseData.prediction.top1] : []),
          ...(responseData.prediction?.top2 ? [responseData.prediction.top2] : [])
        ],
        riskLevel: responseData.prediction?.riskLevel,
        explanation: responseData.explanation,
        heatmapImage: responseData.heatmapImage,
        originalImageBase64: responseData.originalImageBase64,
      };
      
      setAnalysisResult(formattedResult);
      setTimeout(() => setShowSideBySide(true), 500);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error(errorMessage);
      setAnalysisResult({
        predictions: [{ label: "Analysis Error", confidence: 0 }],
        riskLevel: "unknown",
        explanation: {
            explanation_text: `An error occurred while processing the image: ${errorMessage}`,
            recommendation: "Please try again. If the problem persists, check the console or contact support."
        },
        heatmapImage: "",
        originalImageBase64: ""
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!analysisResult || caseSubmissionStatus === 'submitting' || caseSubmissionStatus === 'submitted') return;

    setCaseSubmissionStatus('submitting');
    try {
        const { predictions, riskLevel, explanation, originalImageBase64, heatmapImage } = analysisResult;
        
        // FIX: Add the 'is_private' flag to the payload.
        // It's true if a lesionId exists, ensuring it's treated as a private tracking scan.
        const payload = {
            image_base64: originalImageBase64,
            heatmap_image_base64: heatmapImage,
            predictions: predictions,
            risk_level: riskLevel,
            ai_explanation: explanation.explanation_text || explanation.technical_summary || "N/A",
            lesion_id: lesionId || null,
            is_private: !!lesionId, // This will be true if lesionId is present, false otherwise
        };

        await api.submitCase(payload);

        toast.success("Scan saved successfully! Returning to your dashboard...");
        setCaseSubmissionStatus('submitted');

        setTimeout(() => {
            navigate('/mylesion');
        }, 1500);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast.error(errorMessage);
        setCaseSubmissionStatus('error');
    }
  };


  return (
    <>
      <Helmet>
        <title>Skin Analysis | DermaSense</title>
        <meta
          name="description"
          content="Upload your skin image for AI-powered analysis and detection of potential skin conditions."
        />
      </Helmet>

      <div className="fixed inset-0 -z-10 bg-slate-950">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-cyan-900/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container pt-28 pb-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary-500 to-secondary-400 text-transparent bg-clip-text">
              AI Skin Analysis
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Upload a clear image of your skin concern for instant AI-powered analysis.
            </p>
          </motion.div>

          <div className="flex justify-center mb-12">
            <div className="relative inline-flex rounded-lg bg-slate-800/80 p-1 shadow-inner">
              <button
                onClick={() => setActiveModel('clinical')}
                className={`relative z-10 px-8 py-3 text-base font-medium rounded-md transition-colors duration-200 flex items-center ${activeModel === 'clinical' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Microscope className="w-5 h-5 mr-2" strokeWidth={1.5} />
                Clinical Model
              </button>
              <button
                onClick={() => setActiveModel('consumer')}
                className={`relative z-10 px-8 py-3 text-base font-medium rounded-md transition-colors duration-200 flex items-center ${activeModel === 'consumer' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Smartphone className="w-5 h-5 mr-2" strokeWidth={1.5} />
                Consumer Model
              </button>
              <motion.div
                className="absolute inset-0 z-0 rounded-md"
                layoutId="modelSwitchBackground"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{
                  width: '50%',
                  height: '100%',
                  left: activeModel === 'clinical' ? '0%' : '50%'
                }}
              >
                <div className="w-full h-full bg-blue-600/80 rounded-md" />
              </motion.div>
            </div>
          </div>

          <div className="mb-12">
            <AnimatePresence mode="wait">
              {!showSideBySide ? (
                <motion.div
                  key="full-width"
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                >
                  <ImageUploader
                    onImageUpload={handleImageUpload}
                    isProcessing={isProcessing}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="side-by-side"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <div className="w-full flex justify-center md:justify-end mb-8">
                    <button
                      onClick={handleNewAnalysis}
                      className="flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-semibold shadow-lg transition-all duration-150"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Analyze Another Image
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-slate-800/60 backdrop-blur-lg border border-slate-700 rounded-xl shadow-lg overflow-hidden h-full"
                    >
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Original Image</h3>
                        <div className="relative rounded-lg overflow-hidden aspect-square flex items-center justify-center bg-slate-900">
                          {originalImageUrl && <img
                            src={originalImageUrl}
                            alt="Original skin image"
                            className="h-full w-full object-contain"
                          />}
                        </div>
                      </div>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-slate-800/60 backdrop-blur-lg border border-slate-700 rounded-xl shadow-lg overflow-hidden h-full"
                    >
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">AI Visual Explanation</h3>
                        <div className="relative rounded-lg overflow-hidden aspect-square flex items-center justify-center bg-slate-900">
                           {analysisResult?.heatmapImage && <img
                            src={analysisResult.heatmapImage}
                            alt="AI Grad-CAM Heatmap"
                            className="h-full w-full object-contain"
                          />}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {analysisResult && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <ResultPanel
                  predictions={analysisResult.predictions}
                  riskLevel={analysisResult.riskLevel}
                  explanation={analysisResult.explanation}
                  onSubmitForReview={handleSubmitForReview}
                  caseSubmissionStatus={caseSubmissionStatus}
                  isLoggedIn={!!api.getAuthToken()}
                  lesionId={lesionId}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12"
          >
            <EducationalSidebar />
          </motion.div>
        </div>
      </div>
      <PrivacyNotice />
    </>
  );
}