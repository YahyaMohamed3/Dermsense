import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUploader from '../components/scan/ImageUploader';
import ResultPanel, { ScanResult } from '../components/scan/ResultPanel';
import EducationalSidebar from '../components/scan/EducationalSidebar';
import PrivacyNotice from '../components/scan/PrivacyNotice';

export default function ScanPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [activeModel, setActiveModel] = useState<'clinical' | 'consumer'>('clinical');
  const [explanation, setExplanation] = useState<string | null>(null);
  
  const handleImageUpload = async (file: File) => {
    setResult(null);
    setExplanation(null);
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