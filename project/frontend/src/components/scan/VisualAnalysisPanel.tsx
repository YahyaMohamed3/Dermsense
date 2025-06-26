import { motion } from 'framer-motion';
import { ScanResult } from './ResultPanel';

interface VisualAnalysisPanelProps {
  result: ScanResult;
  activeModel: 'clinical' | 'consumer';
}

export default function VisualAnalysisPanel({ result, activeModel }: VisualAnalysisPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="bg-slate-800/60 backdrop-blur-lg border border-slate-700 rounded-xl shadow-lg overflow-hidden h-[400px]"
    >
      <div className="p-6">
        <h3 className="text-xl font-semibold text-white mb-4">AI Focus Area</h3>
        
        <div className="relative rounded-lg overflow-hidden h-[300px] flex items-center justify-center">
          {result.heatmapImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-full w-full"
            >
              <img
                src={result.heatmapImage}
                alt="Grad-CAM Heatmap"
                className="h-full w-full object-contain rounded-lg border border-slate-700 shadow-md"
              />
              
              {/* Glowing corners */}
              <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-secondary-400/50 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-secondary-400/50 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-secondary-400/50 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-secondary-400/50 rounded-br-lg"></div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}