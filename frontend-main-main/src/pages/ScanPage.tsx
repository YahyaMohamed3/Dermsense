import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Microscope, Smartphone, RotateCcw } from 'lucide-react';
import ImageUploader from '../components/scan/ImageUploader';
import ResultPanel, { ScanResult } from '../components/scan/ResultPanel';
import EducationalSidebar from '../components/scan/EducationalSidebar';
import PrivacyNotice from '../components/scan/PrivacyNotice';

export default function ScanPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [activeModel, setActiveModel] = useState<'clinical' | 'consumer'>('clinical');
  const [explanation, setExplanation] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [showSideBySide, setShowSideBySide] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isProcessing) setShowSideBySide(false);
  }, [isProcessing]);

  const handleNewAnalysis = () => {
    setResult(null);
    setExplanation(null);
    setRecommendation(null);
    setShowSideBySide(false);
    setOriginalImageUrl(null);
  };

  const handleImageUpload = async (file: File) => {
    setResult(null);
    setExplanation(null);
    setRecommendation(null);
    setShowSideBySide(false);
    setIsProcessing(true);
    setOriginalImageUrl(URL.createObjectURL(file));

    try {
      const endpoint =
        activeModel === "clinical"
          ? "http://localhost:8000/api/predict/clinical"
          : "http://localhost:8000/api/predict/consumer";

      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to get prediction from backend.");

      const data = await res.json();

      let llmExplanation = "";
      let llmRecommendation = "";
      try {
        const mode = activeModel === 'clinical' ? 'clinical' : 'consumer';
        const explanationRes = await fetch(
          `http://localhost:8000/api/explain?mode=${mode}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lesion_name: data.top1.label,
              secondary_lesion_name: data.top2.label
            }),
          }
        );
        if (explanationRes.ok) {
          const { text, recommendation } = await explanationRes.json();
          llmExplanation = text;
          llmRecommendation = recommendation || "";
          setExplanation(text);
          setRecommendation(recommendation || "");
        } else {
          setExplanation("");
          setRecommendation("");
        }
      } catch (err) {
        setExplanation("");
        setRecommendation("");
      }

      setResult({
        top1: data.top1,
        top2: data.top2,
        riskLevel: data.riskLevel,
        heatmapImage: data.heatmapImage ?? data.gradCamImage,
        description: llmExplanation,
        recommendation: llmRecommendation,
      });

      setTimeout(() => setShowSideBySide(true), 500);
    } catch (error) {
      console.error("Error processing image:", error);
      setResult({
        top1: { label: "Error", confidence: 0 },
        top2: { label: "N/A", confidence: 0 },
        riskLevel: "unknown",
        description: "An error occurred while processing the image. Please try again.",
        recommendation: "If the problem persists, please contact support.",
        heatmapImage: "",
      });
    } finally {
      setIsProcessing(false);
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
          {/* Header Section */}
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
              Get insights and recommendations in seconds.
            </p>
          </motion.div>

          {/* Model Selector - Sliding Tab Design */}
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
                transition={{ type: "spring", duration: 0.5 }}
                style={{
                  width: '50%',
                  height: '100%',
                  left: activeModel === 'clinical' ? '0%' : '50%'
                }}
              >
                <div className="w-full h-full bg-primary-700/80 rounded-md" />
              </motion.div>
            </div>
          </div>

          {/* Part 1: Visual Core - Responsive Layout */}
          <div className="mb-12">
            <AnimatePresence mode="wait">
              {!showSideBySide ? (
                <motion.div
                  key="full-width"
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40 }}
                  transition={{ duration: 0.17 }}
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
                  {/* Start New Analysis button */}
                  <div className="w-full flex justify-center md:justify-end mb-8">
                    <button
                      onClick={handleNewAnalysis}
                      className="flex items-center gap-3 px-7 py-3 rounded-full bg-primary-700 hover:bg-primary-600 active:scale-95 text-white font-bold text-lg shadow-lg transition-all duration-150 border-none outline-none focus:ring-2 focus:ring-primary-400"
                      style={{ minWidth: 210, marginBottom: 8 }}
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Start New Analysis
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Original Image */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-slate-800/60 backdrop-blur-lg border border-slate-700 rounded-xl shadow-lg overflow-hidden h-[400px]"
                    >
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Original Image</h3>
                        <div className="relative rounded-lg overflow-hidden h-[300px] flex items-center justify-center">
                          <img
                            src={originalImageUrl ?? ""}
                            alt="Original skin image"
                            className="h-full w-full object-contain rounded-lg border border-slate-700"
                          />
                        </div>
                      </div>
                    </motion.div>
                    {/* Grad-CAM Visual Explanation */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-slate-800/60 backdrop-blur-lg border border-slate-700 rounded-xl shadow-lg overflow-hidden h-[400px]"
                    >
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">AI Visual Explanation</h3>
                        <div className="relative rounded-lg overflow-hidden h-[300px] flex items-center justify-center">
                          <img
                            src={result?.heatmapImage ?? ""}
                            alt="AI Grad-CAM Heatmap"
                            className="h-full w-full object-contain rounded-lg border border-slate-700"
                          />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Part 2: Detailed Analysis Panel */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <ResultPanel
                  result={result}
                  explanation={explanation}
                  recommendation={recommendation}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Educational Resources */}
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
