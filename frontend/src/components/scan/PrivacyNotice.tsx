import { motion } from 'framer-motion';
import { Shield, X } from 'lucide-react';
import { useState } from 'react';

export default function PrivacyNotice() {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!isVisible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
    >
      <div className="glass-panel rounded-lg shadow-lg p-4 pr-10 relative">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-slate-700/50 text-slate-400 hover:text-slate-200"
          aria-label="Close privacy notice"
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>
        
        <div className="flex items-start">
          <div className="bg-cyan-500/20 rounded-full p-2 mr-3">
            <Shield className="w-5 h-5 text-cyan-500" strokeWidth={1.5} />
          </div>
          
          <div>
            <h4 className="font-medium text-sm text-slate-100">Privacy First Processing</h4>
            <p className="text-xs text-slate-300 mt-1">
              Your images are processed securely and never shared with third parties.
              All analysis is done with privacy-preserving techniques.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}