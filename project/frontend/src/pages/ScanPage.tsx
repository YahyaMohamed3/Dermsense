import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Microscope, Smartphone } from 'lucide-react';
import ImageUploader from '../components/scan/ImageUploader';
import ResultPanel, { ScanResult } from '../components/scan/ResultPanel';
import VisualAnalysisPanel from '../components/scan/VisualAnalysisPanel';
import EducationalSidebar from '../components/scan/EducationalSidebar';
import PrivacyNotice from '../components/scan/PrivacyNotice';

export default function ScanPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [activeModel, setActiveModel] = useState<'clinical' | 'consumer'>('clinical');
  const [explanation, setExplanation] = useState<string | null>(null);
  const [showSideBySide, setShowSideBySide] = useState(false);
  
  // Reset side-by-side view when starting a new analysis
  useEffect(() => {
    if (isProcessing) {
      setShowSideBySide(false);
    }
  }, [isProcessing]);
  
  const handleImageUpload = async (file: File) => {
    setResult(null);
    setExplanation(null);
    setShowSideBySide(false);
    setIsProcessing(true);

    try {
      // Simulate API delay for demo purposes
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo, create a mock result based on the active model
      const mockResult: ScanResult = activeModel === 'clinical' 
        ? {
            top1: { label: 'Benign Mole', confidence: 96.5 },
            top2: { label: 'Melanoma', confidence: 3.2 },
            riskLevel: 'low',
            description: 'This appears to be a benign mole with regular borders and consistent coloration.',
            recommendation: 'While this analysis suggests a benign condition, we recommend regular self-examinations and consulting with a dermatologist for any changes in appearance.',
            heatmapImage: 'https://images.pexels.com/photos/5726706/pexels-photo-5726706.jpeg?auto=compress&cs=tinysrgb&w=300'
          }
        : {
            top1: { label: 'Actinic Keratosis', confidence: 87.3 },
            top2: { label: 'Basal Cell Carcinoma', confidence: 10.5 },
            riskLevel: 'medium',
            description: 'This appears to be an actinic keratosis with slightly irregular borders and some color variation.',
            recommendation: 'We recommend consulting with a dermatologist for further evaluation as actinic keratosis can sometimes develop into squamous cell carcinoma.',
            heatmapImage: 'https://images.pexels.com/photos/5726799/pexels-photo-5726799.jpeg?auto=compress&cs=tinysrgb&w=300'
          };
      
      setResult(mockResult);
      
      // Simulate explanation generation with a slight delay
      setTimeout(() => {
        const explanationText = `This appears to be a ${mockResult.top1.label.toLowerCase()} with ${
          mockResult.riskLevel === 'low' ? 'regular borders and consistent coloration. The symmetrical shape and uniform pigmentation are typical characteristics of non-cancerous skin lesions.' : 
          mockResult.riskLevel === 'medium' ? 'slightly irregular borders and some color variation. These features can sometimes be associated with precancerous conditions that require medical attention.' :
          'irregular borders and uneven coloration which are concerning features. These characteristics are often associated with malignant skin conditions.'
        } The AI model has identified specific visual patterns that are ${
          mockResult.top1.confidence > 90 ? 'strongly' : 'moderately'
        } associated with this condition.`;
        
        setExplanation(explanationText);
        
        // Animate to side-by-side view after results are ready
        setTimeout(() => {
          setShowSideBySide(true);
        }, 500);
      }, 1000);
      
    } catch (error) {
      console.error('Error processing image:', error);
      setResult({
        top1: { label: 'Error', confidence: 0 },
        top2: { label: 'N/A', confidence: 0 },
        riskLevel: 'unknown',
        description: 'An error occurred while processing the image. Please try again.',
        recommendation: 'If the problem persists, please contact support.'
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
      
      {/* Subtle background effects */}
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
                className={`relative z-10 px-8 py-3 text-base font-medium rounded-md transition-colors duration-200 flex items-center ${
                  activeModel === 'clinical' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Microscope className="w-5 h-5 mr-2" strokeWidth={1.5} />
                Clinical Model
              </button>
              <button
                onClick={() => setActiveModel('consumer')}
                className={`relative z-10 px-8 py-3 text-base font-medium rounded-md transition-colors duration-200 flex items-center ${
                  activeModel === 'consumer' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
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
                // Full-width uploader when no result or during processing
                <motion.div
                  key="full-width"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <ImageUploader 
                    onImageUpload={handleImageUpload} 
                    isProcessing={isProcessing} 
                  />
                </motion.div>
              ) : (
                // Side-by-side view after processing is complete
                <motion.div
                  key="side-by-side"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
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
                          src={result?.heatmapImage} // Using the same image for demo
                          alt="Original skin image"
                          className="h-full w-full object-contain rounded-lg border border-slate-700"
                        />
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Visual Analysis Panel */}
                  {result && (
                    <VisualAnalysisPanel 
                      result={result}
                      activeModel={activeModel}
                    />
                  )}
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