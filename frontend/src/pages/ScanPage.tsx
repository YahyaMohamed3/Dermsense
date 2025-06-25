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
  const [activeModel, setActiveModel] = useState<'standard' | 'advanced'>('standard');
  
  const handleImageUpload = async (file: File) => {
    setResult(null);
    setIsProcessing(true);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('model', activeModel);

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
  
  const toggleModel = () => {
    setActiveModel(activeModel === 'standard' ? 'advanced' : 'standard');
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
          
          <div className="flex justify-center mb-10">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => setActiveModel('standard')}
                className={`px-6 py-3 text-base font-medium rounded-l-lg border-2 ${
                  activeModel === 'standard'
                    ? 'bg-primary-700 text-white border-primary-700'
                    : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
                }`}
              >
                Standard Model
              </button>
              <button
                onClick={() => setActiveModel('advanced')}
                className={`px-6 py-3 text-base font-medium rounded-r-lg border-2 ${
                  activeModel === 'advanced'
                    ? 'bg-primary-700 text-white border-primary-700'
                    : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
                }`}
              >
                Advanced Model
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Educational Sidebar - 3 columns */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="lg:col-span-3"
            >
              <EducationalSidebar />
            </motion.div>
            
            {/* Main Content Area - 9 columns */}
            <div className="lg:col-span-9">
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
                      <ResultPanel result={result} />
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <PrivacyNotice />
    </>
  );
}