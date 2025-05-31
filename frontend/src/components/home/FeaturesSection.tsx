import { motion } from 'framer-motion';
import { Scan, Shield, Brain, LineChart, Clock, Smartphone } from 'lucide-react';

const features = [
  {
    icon: <Scan className="w-6 h-6" />,
    title: 'Easy Scanning',
    description: 'Upload a photo of your skin concern and get instant analysis using our intuitive interface.'
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: 'AI-Powered Analysis',
    description: 'Our advanced AI algorithms analyze your skin with precision to detect potential issues.'
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: 'Quick Results',
    description: 'Receive detailed results in seconds, allowing for immediate understanding of your skin condition.'
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Privacy Focused',
    description: 'Your data remains private and secure. Images are processed with strict privacy protocols.'
  },
  {
    icon: <LineChart className="w-6 h-6" />,
    title: 'Detailed Insights',
    description: 'Get comprehensive information about detected skin conditions and recommended next steps.'
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: 'Accessible Anywhere',
    description: 'Access DermaSense from any device with a responsive design that works on desktop and mobile.'
  }
];

export default function FeaturesSection() {
  return (
    <section id="features\" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-primary-600 dark:text-primary-400 font-medium"
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
            className="text-lg text-gray-600 dark:text-gray-300"
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
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700"
            >
              <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}