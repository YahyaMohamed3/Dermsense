import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ScanResult {
  confidence: number;
  condition: string;
  riskLevel: 'low' | 'medium' | 'high';
  description: string;
  recommendation: string;
}

interface ResultPanelProps {
  result: ScanResult;
}

export default function ResultPanel({ result }: ResultPanelProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const riskColors = {
    low: {
      bg: 'bg-success-50 dark:bg-success-900/20',
      text: 'text-success-900 dark:text-success-500',
      border: 'border-success-500'
    },
    medium: {
      bg: 'bg-warning-50 dark:bg-warning-900/20',
      text: 'text-warning-900 dark:text-warning-500',
      border: 'border-warning-500'
    },
    high: {
      bg: 'bg-error-50 dark:bg-error-900/20',
      text: 'text-error-900 dark:text-error-500',
      border: 'border-error-500'
    }
  };

  const riskColor = riskColors[result.riskLevel];
  
  const toggleDetails = () => {
    setIsDetailsOpen(!isDetailsOpen);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h3 className="card-title">Analysis Results</h3>
          <span 
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              riskColor.bg,
              riskColor.text
            )}
          >
            {result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1)} Risk
          </span>
        </div>
        <p className="card-description">Based on the image you provided</p>
      </div>
      
      <div className="card-content">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Confidence Level</span>
            <span className="text-sm font-medium">{result.confidence}%</span>
          </div>
          <div className="h-4 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${result.confidence}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full",
                result.confidence > 80 ? "bg-success-500" :
                result.confidence > 50 ? "bg-warning-500" : "bg-error-500"
              )}
            />
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="font-medium text-lg mb-2">Detected Condition</h4>
          <p className="text-xl font-bold text-primary-700 dark:text-primary-400">
            {result.condition}
          </p>
        </div>
        
        <div className={cn(
          "border rounded-lg p-4 mb-4",
          riskColor.border,
          riskColor.bg
        )}>
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium">Important Note</h4>
              <p className="text-sm">
                This is an AI analysis and should not replace professional medical advice. 
                Please consult with a healthcare provider for proper diagnosis.
              </p>
            </div>
          </div>
        </div>
        
        <button
          onClick={toggleDetails}
          className="flex items-center justify-between w-full py-2 px-4 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <span className="font-medium flex items-center">
            <Info className="w-4 h-4 mr-2" />
            {isDetailsOpen ? 'Hide Details' : 'View Details'}
          </span>
          {isDetailsOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        
        {isDetailsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 space-y-4"
          >
            <div>
              <h4 className="font-medium mb-1">Description</h4>
              <p className="text-gray-600 dark:text-gray-300">{result.description}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Recommendation</h4>
              <p className="text-gray-600 dark:text-gray-300">{result.recommendation}</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}