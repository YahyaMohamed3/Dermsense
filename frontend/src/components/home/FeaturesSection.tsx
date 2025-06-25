import { motion } from 'framer-motion';
import { Scan, Shield, Brain, LineChart, Clock, Smartphone } from 'lucide-react';

const features = [
  {
    icon: <Scan className="w-6 h-6" strokeWidth={1.5} />,
    title: 'Easy Scanning',
    description: 'Upload a photo of your skin concern and get instant analysis using our intuitive interface.'
  },
  {
    icon: <Brain className="w-6 h-6" strokeWidth={1.5} />,
    title: 'AI-Powered Analysis',
    description: 'Our advanced AI algorithms analyze your skin with precision to detect potential issues.'
  },
  {
    icon: <Clock className="w-6 h-6" strokeWidth={1.5} />,
    title: 'Quick Results',
    description: 'Receive detailed results in seconds, allowing for immediate understanding of your skin condition.'
  },
  {
    icon: <Shield className="w-6 h-6" strokeWidth={1.5} />,
    title: 'Privacy Focused',
    description: 'Your data remains private and secure. Images are processed with strict privacy protocols.'
  },
  {
    icon: <LineChart className="w-6 h-6" strokeWidth={1.5} />,
    title: 'Detailed Insights',
    description: 'Get comprehensive information about detected skin conditions and recommended next steps.'
  },
  {
    icon: <Smartphone className="w-6 h-6" strokeWidth={1.5} />,
    title: 'Accessible Anywhere',
    description: 'Access DermaSense from any device with a responsive design that works on desktop and mobile.'
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-primary-600 dark:text-secondary-400 font-medium"
          >
            Features
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold mt-2 mb-4"
          >
            Powerful Tools for Skin Health
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-slate-600 dark:text-slate-300"
          >
            DermaSense offers a comprehensive set of features designed to provide accurate skin analysis and peace of mind.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-slate-100 dark:border-slate-700 group"
            >
              <div className="w-14 h-14 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-6 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/50 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}