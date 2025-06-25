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
  
  const handleImageUpload = async (file: File) => {
    setResult(null);
    setIsProcessing(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      // Simulate API delay for demo purposes
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo, create a mock result
      // In production, this would be an actual API call
      const mockResult: ScanResult = {
        top1: { label: 'Benign Mole', confidence: 96.5 },
        top2: { label: 'Melanoma', confidence: 3.2 },
        riskLevel: 'low',
        description: 'This appears to be a benign mole with regular borders and consistent coloration. The symmetrical shape and uniform pigmentation are typical characteristics of non-cancerous skin lesions.',
        recommendation: 'While this analysis suggests a benign condition, we recommend regular self-examinations and consulting with a dermatologist for any changes in appearance.',
        heatmapImage: 'https://images.pexels.com/photos/5726706/pexels-photo-5726706.jpeg?auto=compress&cs=tinysrgb&w=300'
      };
      
      setResult(mockResult);
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
      
      <div className="container pt-24 pb-12">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-slate-100">Skin Analysis Scanner</h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Upload a clear image of your skin concern for instant AI-powered analysis. 
              Get insights and recommendations in seconds.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <ImageUploader 
                onImageUpload={handleImageUpload} 
                isProcessing={isProcessing} 
              />
              
              <AnimatePresence mode="wait">
                {result && (
                  <ResultPanel result={result} />
                )}
              </AnimatePresence>
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
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