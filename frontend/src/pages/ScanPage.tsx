import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import ImageUploader from '../components/scan/ImageUploader';
import ResultPanel, { ScanResult } from '../components/scan/ResultPanel';
import EducationalSidebar from '../components/scan/EducationalSidebar';
import PrivacyNotice from '../components/scan/PrivacyNotice';

// Simulated analysis result for demo purposes
const simulatedResult: ScanResult = {
  confidence: 85,
  condition: 'Suspected Melanoma',
  riskLevel: 'medium',
  description: 'The uploaded image shows characteristics consistent with early-stage melanoma, including irregular borders and color variations. Further evaluation by a dermatologist is strongly recommended.',
  recommendation: 'Please consult with a dermatologist as soon as possible for a professional evaluation. Early detection and treatment of melanoma significantly improves outcomes.'
};

export default function ScanPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  
  const handleImageUpload = (file: File) => {
    // Reset any previous results
    setResult(null);
    
    // Simulate processing
    setIsProcessing(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsProcessing(false);
      setResult(simulatedResult);
    }, 3000);
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
      
      <div className="container pt-24 pb-12">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Skin Analysis Scanner</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Upload a clear image of your skin concern for instant AI-powered analysis. 
              Get insights and recommendations in seconds.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <ImageUploader 
                  onImageUpload={handleImageUpload} 
                  isProcessing={isProcessing} 
                />
              </motion.div>
              
              {result && <ResultPanel result={result} />}
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
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