import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ImageUploader from '../components/scan/ImageUploader';
import ResultPanel, { ScanResult } from '../components/scan/ResultPanel';
import EducationalSidebar from '../components/scan/EducationalSidebar';
import PrivacyNotice from '../components/scan/PrivacyNotice';

export default function ScanPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [activeModel, setActiveModel] = useState<'consumer' | 'clinical'>('clinical');
  const [explanation, setExplanation] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleImageUpload = async (file: File) => {
    setResult(null);
    setExplanation(null);
    setAudioUrl(null);
    setError(null);
    setIsProcessing(true);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('model', activeModel);

    try {
      // First API call to get prediction
      const response = await axios.post('/api/uploadImage', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const resultData = response.data as ScanResult;
      setResult(resultData);
      
      // For demo purposes, we'll simulate the explanation API call
      // In production, this would be a real API call to an explanation service
      setTimeout(() => {
        const explanationText = `This appears to be a ${resultData.top1.label.toLowerCase()} with ${
          resultData.riskLevel === 'low' ? 'regular borders and consistent coloration' : 
          resultData.riskLevel === 'medium' ? 'slightly irregular borders and some color variation' :
          'irregular borders and uneven coloration which are concerning features'
        }. The AI model has identified specific visual patterns that are ${
          resultData.top1.confidence > 90 ? 'strongly' : 'moderately'
        } associated with this condition.`;
        
        setExplanation(explanationText);
      }, 1000);
      
    } catch (error) {
      console.error('Error processing image:', error);
      setError('An error occurred while processing your image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Skin Scan | DermaSense</title>
        <meta 
          name="description" 
          content="Upload your skin image for AI-powered analysis and detection of potential skin conditions."
        />
      </Helmet>
      
      <div className="container pt-32 pb-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary-500 to-secondary-400 text-transparent bg-clip-text">
              Skin Analysis Scanner
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Upload a clear image of your skin concern for instant AI-powered analysis. 
              Get insights and recommendations in seconds.
            </p>
          </motion.div>
          
          {/* Model Selector - Sliding Tab Design */}
          <div className="flex justify-center mb-10">
            <div className="relative inline-flex rounded-lg bg-slate-800 p-1 shadow-inner">
              <button
                onClick={() => setActiveModel('clinical')}
                className={`relative z-10 px-6 py-3 text-base font-medium rounded-md transition-colors duration-200 ${
                  activeModel === 'clinical' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Clinical Model
              </button>
              <button
                onClick={() => setActiveModel('consumer')}
                className={`relative z-10 px-6 py-3 text-base font-medium rounded-md transition-colors duration-200 ${
                  activeModel === 'consumer' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
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
                <div className="w-full h-full bg-primary-700 rounded-md" />
              </motion.div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content Area - 9 columns */}
            <div className="lg:col-span-9 order-2 lg:order-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image Uploader */}
                <div className="space-y-8">
                  <ImageUploader 
                    onImageUpload={handleImageUpload} 
                    isProcessing={isProcessing} 
                  />
                  
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-error-900/20 border border-error-800 rounded-lg text-error-400"
                    >
                      {error}
                    </motion.div>
                  )}
                </div>
                
                {/* Results Panel */}
                <div>
                  <AnimatePresence mode="wait">
                    {result && (
                      <ResultPanel 
                        result={result} 
                        explanation={explanation}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            
            {/* Educational Sidebar - 3 columns, now on the right */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="lg:col-span-3 order-1 lg:order-2"
            >
              <EducationalSidebar />
            </motion.div>
          </div>
        </div>
      </div>
      
      <PrivacyNotice />
    </>
  );
}