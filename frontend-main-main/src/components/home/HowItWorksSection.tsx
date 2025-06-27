import { motion } from 'framer-motion';
import { Upload, Search, Activity, FileText } from 'lucide-react';

const steps = [
  {
    icon: <Upload className="w-6 h-6" strokeWidth={1.5} />,
    title: 'Upload Your Photo',
    description: 'Take a clear photo of your skin concern or upload an existing image from your device.',
    color: 'bg-primary-600 dark:bg-primary-500'
  },
  {
    icon: <Search className="w-6 h-6" strokeWidth={1.5} />,
    title: 'AI Analysis',
    description: 'Our advanced algorithms analyze the image to identify potential skin concerns.',
    color: 'bg-secondary-600 dark:bg-secondary-500'
  },
  {
    icon: <Activity className="w-6 h-6" strokeWidth={1.5} />,
    title: 'Get Results',
    description: 'Receive a detailed analysis of your skin with confidence levels and explanations.',
    color: 'bg-primary-700 dark:bg-primary-600'
  },
  {
    icon: <FileText className="w-6 h-6" strokeWidth={1.5} />,
    title: 'Next Steps',
    description: 'Based on the analysis, get recommendations for potential next steps and medical advice.',
    color: 'bg-secondary-700 dark:bg-secondary-600'
  }
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-white dark:bg-slate-800">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-primary-600 dark:text-secondary-400 font-medium"
          >
            How It Works
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold mt-2 mb-4"
          >
            Simple Process, Powerful Results
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-slate-600 dark:text-slate-300"
          >
            DermaSense makes it easy to get insights about your skin health in just a few simple steps.
          </motion.p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connecting line */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-gradient-to-b from-primary-500 via-secondary-500 to-primary-700 hidden lg:block" />
          
          <div className="space-y-24">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.2 * index }}
                className={`flex flex-col lg:flex-row ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''} items-center gap-12`}
              >
                <div className="flex-1 text-center lg:text-left">
                  <div className={`relative z-10 mx-auto lg:mx-0 ${index % 2 !== 0 ? 'lg:ml-auto' : ''}`}>
                    <div className={`w-16 h-16 rounded-full ${step.color} text-white flex items-center justify-center relative z-10`}>
                      {step.icon}
                      <div className="absolute -inset-2 rounded-full border-2 border-dashed border-slate-200 dark:border-slate-700 animate-spin-slow" style={{ animationDuration: '20s' }} />
                    </div>
                    <div className="absolute -inset-4 bg-white dark:bg-slate-800 rounded-full -z-10 lg:hidden"></div>
                  </div>
                  <h3 className="text-2xl font-bold mt-6 mb-3">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 max-w-md mx-auto lg:mx-0">{step.description}</p>
                </div>
                
                <div className="flex-1">
                  <div className="glass-panel rounded-xl p-6 shadow-lg h-64 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                    <span className="text-5xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 text-transparent bg-clip-text">Step {index + 1}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}