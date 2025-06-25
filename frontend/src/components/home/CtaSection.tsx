import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function CtaSection() {
  return (
    <section className="py-24 bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-900 dark:to-primary-950 relative overflow-hidden">
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
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-bold text-white mb-6"
          >
            Take Control of Your Skin Health Today
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto"
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
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-lg bg-white text-primary-700 hover:bg-primary-50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              Start Your Scan Now
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 flex flex-col md:flex-row items-center justify-center gap-8 text-white/80"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mr-4">
                <span className="text-2xl font-bold">1M+</span>
              </div>
              <p className="text-left">Scans Performed</p>
            </div>
            
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mr-4">
                <span className="text-2xl font-bold">95%</span>
              </div>
              <p className="text-left">Accuracy Rate</p>
            </div>
            
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mr-4">
                <span className="text-2xl font-bold">24/7</span>
              </div>
              <p className="text-left">Availability</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}