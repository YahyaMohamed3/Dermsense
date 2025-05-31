import { motion } from 'framer-motion';
import { Upload, Search, Activity, FileText } from 'lucide-react';

const steps = [
  {
    icon: <Upload className="w-6 h-6" />,
    title: 'Upload Your Photo',
    description: 'Take a clear photo of your skin concern or upload an existing image from your device.',
    color: 'bg-primary-600'
  },
  {
    icon: <Search className="w-6 h-6" />,
    title: 'AI Analysis',
    description: 'Our advanced algorithms analyze the image to identify potential skin concerns.',
    color: 'bg-secondary-600'
  },
  {
    icon: <Activity className="w-6 h-6" />,
    title: 'Get Results',
    description: 'Receive a detailed analysis of your skin with confidence levels and explanations.',
    color: 'bg-accent-600'
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: 'Next Steps',
    description: 'Based on the analysis, get recommendations for potential next steps and medical advice.',
    color: 'bg-primary-800'
  }
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works\" className="py-20">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-primary-600 dark:text-primary-400 font-medium"
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
            className="text-lg text-gray-600 dark:text-gray-300"
          >
            DermaSense makes it easy to get insights about your skin health in just a few simple steps.
          </motion.p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-gray-200 dark:bg-gray-700 hidden lg:block" />
          
          <div className="space-y-16">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className={`flex flex-col lg:flex-row ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''} items-center gap-8`}
              >
                <div className="flex-1">
                  <div className={`w-16 h-16 rounded-full ${step.color} text-white flex items-center justify-center relative z-10 mx-auto lg:mx-0`}>
                    {step.icon}
                    <div className="absolute -inset-1 rounded-full border-2 border-dashed border-gray-200 dark:border-gray-700 animate-spin-slow" style={{ animationDuration: '20s' }} />
                  </div>
                  <h3 className="text-2xl font-bold mt-4 mb-2 text-center lg:text-left">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-center lg:text-left">{step.description}</p>
                </div>
                
                <div className="flex-1 hidden lg:block">
                  {/* Placeholder for images or illustrations */}
                  <div className="glassmorphism rounded-xl p-4 shadow-lg h-48 flex items-center justify-center">
                    <span className="text-gray-400 dark:text-gray-500 text-xl font-medium">Step {index + 1}</span>
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