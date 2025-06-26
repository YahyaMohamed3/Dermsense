import { useState } from 'react';
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
        <title>Skin Analysis | DermaSense</title>
        <meta 
          name="description" 
          content="Upload your skin image for AI-powered analysis and detection of potential skin conditions."
        />
      </Helmet>
      
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
          
          {/* Part 1: Visual Core - Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Image Uploader */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ImageUploader 
                onImageUpload={handleImageUpload} 
                isProcessing={isProcessing} 
              />
            </motion.div>
            
            {/* Visual Analysis Panel */}
            <AnimatePresence mode="wait">
              {result && (
                <VisualAnalysisPanel 
                  result={result}
                  activeModel={activeModel}
                />
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