import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, CheckCircle } from 'lucide-react';

export default function CtaSection() {
  return (
    <section className="py-32 bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-900 dark:to-primary-950 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight"
          >
            Take Control of Your Skin Health Today
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-white/90 mb-12 max-w-3xl mx-auto"
          >
            Early detection is key to successful treatment. Upload a photo of your skin concern and get an instant AI-powered analysis.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link
              to="/scan"
              className="inline-flex items-center justify-center px-10 py-5 text-xl font-medium rounded-xl bg-white text-primary-700 hover:bg-primary-50 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
            >
              Start Your Scan Now
              <ArrowRight className="w-6 h-6 ml-2 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-white"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Clinically Validated</h3>
              <p className="text-white/80">
                Our AI models are trained on extensive datasets and validated by dermatologists.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Privacy Protected</h3>
              <p className="text-white/80">
                All processing happens on your device. Your images never leave your browser.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Results</h3>
              <p className="text-white/80">
                Get analysis in seconds, not days. No waiting for appointments or lab results.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}