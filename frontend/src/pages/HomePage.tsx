import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Microscope, 
  Cpu, 
  UploadCloud, 
  Sparkles, 
  ArrowRight, 
  Shield, 
  Brain, 
  LineChart 
} from 'lucide-react';

import HeroSection from '../components/home/HeroSection';

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>DermaSense | AI Skin Cancer Detection</title>
        <meta 
          name="description" 
          content="DermaSense uses advanced AI to analyze skin conditions and detect potential signs of skin cancer. Upload a photo for instant analysis."
        />
      </Helmet>
      
      <HeroSection />
      
      {/* Process Section */}
      <section className="py-24 bg-slate-900">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-secondary-400 font-medium"
            >
              A Simple, Secure Process
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-white"
            >
              Privacy-First Analysis
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-slate-300"
            >
              Your data never leaves your device. Our AI runs entirely in your browser.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="glass-panel p-8 rounded-xl"
            >
              <div className="w-16 h-16 rounded-full bg-primary-900/50 flex items-center justify-center text-secondary-400 mb-6">
                <UploadCloud className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">1. Upload Securely</h3>
              <p className="text-slate-300">
                Your image is processed in your browser and is never sent to a server.
              </p>
            </motion.div>
            
            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="glass-panel p-8 rounded-xl"
            >
              <div className="w-16 h-16 rounded-full bg-primary-900/50 flex items-center justify-center text-secondary-400 mb-6">
                <Cpu className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">2. On-Device AI Analysis</h3>
              <p className="text-slate-300">
                Our state-of-the-art model analyzes the image instantly on your computer.
              </p>
            </motion.div>
            
            {/* Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="glass-panel p-8 rounded-xl"
            >
              <div className="w-16 h-16 rounded-full bg-primary-900/50 flex items-center justify-center text-secondary-400 mb-6">
                <Sparkles className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">3. Receive Instant Insight</h3>
              <p className="text-slate-300">
                Get a clear, understandable analysis and explanation in seconds.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Technology Section */}
      <section className="py-24 bg-slate-800">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-secondary-400 font-medium"
            >
              Advanced Technology
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-white"
            >
              Powered by State-of-the-Art Technology
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-slate-300"
            >
              Our platform combines multiple cutting-edge AI technologies to deliver accurate, explainable results.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tech Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="glass-panel p-6 rounded-xl"
            >
              <h3 className="text-lg font-semibold mb-3 text-white">EfficientNet-B3 SOTA Model</h3>
              <p className="text-slate-300 text-sm">
                Our core clinical model achieves 97% Top-2 accuracy, competitive with published research.
              </p>
            </motion.div>
            
            {/* Tech Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="glass-panel p-6 rounded-xl"
            >
              <h3 className="text-lg font-semibold mb-3 text-white">Grad-CAM XAI</h3>
              <p className="text-slate-300 text-sm">
                We provide visual heatmaps to show exactly what the AI is 'looking at', ensuring transparency and trust.
              </p>
            </motion.div>
            
            {/* Tech Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              className="glass-panel p-6 rounded-xl"
            >
              <h3 className="text-lg font-semibold mb-3 text-white">GPT-4 Clinical Explainer</h3>
              <p className="text-slate-300 text-sm">
                Results are translated into clear, empathetic language to empower users with real understanding.
              </p>
            </motion.div>
            
            {/* Tech Card 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              className="glass-panel p-6 rounded-xl"
            >
              <h3 className="text-lg font-semibold mb-3 text-white">Multi-Modal AI Agents</h3>
              <p className="text-slate-300 text-sm">
                Integrated voice (ElevenLabs) and video (Tavus) create a more human and accessible experience.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-24 bg-slate-900">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-secondary-400 font-medium"
            >
              Why DermaSense
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-white"
            >
              Benefits That Matter
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-slate-300"
            >
              Our platform is designed with your health and privacy in mind.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Benefit 1 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex gap-6"
            >
              <div className="w-14 h-14 rounded-lg bg-primary-900/50 flex items-center justify-center text-secondary-400 flex-shrink-0">
                <Shield className="w-7 h-7" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">Complete Privacy</h3>
                <p className="text-slate-300">
                  Your images never leave your device. All processing happens locally in your browser, ensuring your sensitive medical data stays private.
                </p>
              </div>
            </motion.div>
            
            {/* Benefit 2 */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex gap-6"
            >
              <div className="w-14 h-14 rounded-lg bg-primary-900/50 flex items-center justify-center text-secondary-400 flex-shrink-0">
                <Brain className="w-7 h-7" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">Clinical-Grade AI</h3>
                <p className="text-slate-300">
                  Our models are trained on extensive datasets and validated against dermatologist diagnoses for reliable results.
                </p>
              </div>
            </motion.div>
            
            {/* Benefit 3 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex gap-6"
            >
              <div className="w-14 h-14 rounded-lg bg-primary-900/50 flex items-center justify-center text-secondary-400 flex-shrink-0">
                <Sparkles className="w-7 h-7" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">Instant Results</h3>
                <p className="text-slate-300">
                  Get analysis in seconds, not days. No waiting for appointments or lab results.
                </p>
              </div>
            </motion.div>
            
            {/* Benefit 4 */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex gap-6"
            >
              <div className="w-14 h-14 rounded-lg bg-primary-900/50 flex items-center justify-center text-secondary-400 flex-shrink-0">
                <LineChart className="w-7 h-7" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">Explainable Results</h3>
                <p className="text-slate-300">
                  We don't just tell you what we found - we show you why with visual heatmaps and clear explanations.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-900 to-primary-950 relative overflow-hidden">
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
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-panel p-12 rounded-2xl max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Begin?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Take the first step toward better understanding your skin health with AI-powered analysis.
            </p>
            <Link
              to="/scan"
              className="inline-flex items-center justify-center px-10 py-5 text-xl font-medium rounded-xl bg-white text-primary-700 hover:bg-primary-50 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <Microscope className="w-6 h-6 mr-3" strokeWidth={1.5} />
              Analyze Clinical Image
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}