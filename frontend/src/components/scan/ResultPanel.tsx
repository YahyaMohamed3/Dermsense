import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../lib/utils';

export interface ScanResult {
  top1: {
    label: string;
    confidence: number;
  };
  top2: {
    label: string;
    confidence: number;
  };
  riskLevel: 'unknown' | 'low' | 'medium' | 'high';
  description: string;
  recommendation: string;
  heatmapImage?: string; // ✅ Add this
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
      border: 'border-success-500',
    },
    medium: {
      bg: 'bg-warning-50 dark:bg-warning-900/20',
      text: 'text-warning-900 dark:text-warning-500',
      border: 'border-warning-500',
    },
    high: {
      bg: 'bg-error-50 dark:bg-error-900/20',
      text: 'text-error-900 dark:text-error-500',
      border: 'border-error-500',
    },
    unknown: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-600 dark:text-gray-300',
      border: 'border-gray-400',
    },
  };

  const riskColor = riskColors[result.riskLevel];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden rounded-2xl shadow-xl border dark:border-gray-700 bg-white dark:bg-gray-900 transition-all duration-300"
    >
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h3 className="card-title">Analysis Results</h3>
          <span
            className={cn(
              'px-3 py-1 rounded-full text-sm font-medium',
              riskColor.bg,
              riskColor.text
            )}
          >
            {result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1)} Risk
          </span>
        </div>
        <p className="card-description">Based on the image you provided</p>
      </div>

      <div className="card-content space-y-6">
        {/* Top 1 */}
        <div>
          <h4 className="text-lg font-medium mb-1">Top Condition</h4>
          <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">
            {result.top1.label}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Confidence: {result.top1.confidence}%
          </p>
          <div className="h-2 mt-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${result.top1.confidence}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-success-500 rounded-full"
            />
          </div>
        </div>

        {/* Top 2 */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Second Most Likely
          </h4>
          <p className="text-md font-semibold text-gray-800 dark:text-gray-200">
            {result.top2.label} ({result.top2.confidence}%)
          </p>
        </div>

        {/* Important Note */}
        <div
          className={cn(
            'border rounded-lg p-4',
            riskColor.border,
            riskColor.bg
          )}
        >
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium">Important Note</h4>
              <p className="text-sm">
                This is an AI-powered analysis. It is not a substitute for medical advice. 
                Please consult a licensed dermatologist for further evaluation.
              </p>
            </div>
          </div>
        </div>

        {/* Expand Details */}
        <button
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
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
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 space-y-4"
          >
            {/* Description */}
            <div>
              <h4 className="font-medium mb-1">Description</h4>
              <p className="text-gray-600 dark:text-gray-300">{result.description}</p>
            </div>

            {/* Recommendation */}
            <div>
              <h4 className="font-medium mb-1">Recommendation</h4>
              <p className="text-gray-600 dark:text-gray-300">{result.recommendation}</p>
            </div>

            {/* Grad-CAM Image */}
            {result.heatmapImage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="border rounded-xl p-4 bg-gray-50 dark:bg-gray-800 shadow-inner"
              >
                <h4 className="font-semibold text-lg mb-2">Visual Explanation (Grad-CAM)</h4>
                <img
                  src={result.heatmapImage}
                  alt="Grad-CAM Heatmap"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 shadow-md"
                />
                <p className="text-sm mt-2 text-gray-600 dark:text-gray-400 leading-snug">
                  Highlighted areas show where the AI focused during classification.
                  Use this visualization as supportive insight.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}