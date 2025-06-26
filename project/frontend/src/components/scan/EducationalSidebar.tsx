import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { cn } from "../../lib/utils";

interface FaqItem {
  question: string;
  answer: string;
}

const skinLesions = [
  {
    name: 'Melanoma',
    description: 'A serious form of skin cancer that begins in melanocytes (cells that make the pigment melanin).',
    image: 'https://images.pexels.com/photos/4225880/pexels-photo-4225880.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    name: 'Basal Cell Carcinoma',
    description: 'The most common type of skin cancer that rarely spreads beyond the original site.',
    image: 'https://images.pexels.com/photos/5726706/pexels-photo-5726706.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    name: 'Squamous Cell Carcinoma',
    description: 'The second most common form of skin cancer that develops in the squamous cells.',
    image: 'https://images.pexels.com/photos/5726794/pexels-photo-5726794.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    name: 'Actinic Keratosis',
    description: 'A precancerous skin growth that may develop into squamous cell carcinoma if left untreated.',
    image: 'https://images.pexels.com/photos/5726799/pexels-photo-5726799.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  }
];

const faqItems: FaqItem[] = [
  {
    question: 'How accurate is AI skin cancer detection?',
    answer: 'AI skin cancer detection can achieve high accuracy rates, often over 90% in controlled studies. However, it should be used as a screening tool rather than a definitive diagnosis. Always consult a dermatologist for proper evaluation.'
  },
  {
    question: 'What types of skin cancer can be detected?',
    answer: 'AI systems can help identify various types of skin cancer, including melanoma, basal cell carcinoma, and squamous cell carcinoma. They can also detect precancerous conditions like actinic keratosis.'
  },
  {
    question: 'Are my images stored securely?',
    answer: 'Your privacy is our priority. All uploaded images are processed with strict privacy protocols, and you can choose whether images are stored for analysis improvement. We follow industry-standard encryption and data protection practices.'
  },
  {
    question: 'How should I prepare my skin for a photo?',
    answer: 'For best results, take photos in good lighting, preferably natural daylight. Ensure the area is clean and visible. Include some surrounding skin for context, and take photos from multiple angles if possible.'
  }
];

export default function EducationalSidebar() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  
  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };
  
  return (
    <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Educational Resources</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Common Skin Lesion Types */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Common Skin Lesion Types</h3>
            <div className="space-y-4">
              {skinLesions.map((lesion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-3 items-start group"
                >
                  <img
                    src={lesion.image}
                    alt={lesion.name}
                    className="w-16 h-16 rounded-md object-cover border border-slate-700 shadow-md group-hover:border-primary-500 transition-colors"
                  />
                  <div>
                    <h4 className="font-medium text-slate-100 group-hover:text-primary-400 transition-colors">{lesion.name}</h4>
                    <p className="text-sm text-slate-300">{lesion.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* FAQ Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Frequently Asked Questions</h3>
            <div className="space-y-3">
              {faqItems.map((item, index) => (
                <div key={index} className="border border-slate-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleFaq(index)}
                    className={cn(
                      "w-full px-4 py-3 text-left flex items-center justify-between",
                      expandedFaq === index
                        ? "bg-primary-900/30 text-primary-300"
                        : "hover:bg-slate-800 text-slate-100"
                    )}
                  >
                    <span className="font-medium">{item.question}</span>
                    {expandedFaq === index ? (
                      <ChevronUp className="w-5 h-5 flex-shrink-0 text-primary-400" strokeWidth={1.5} />
                    ) : (
                      <ChevronDown className="w-5 h-5 flex-shrink-0 text-slate-400" strokeWidth={1.5} />
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {expandedFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 py-3 text-sm text-slate-300 border-t border-slate-700 bg-slate-800/50">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Early Detection Notice */}
        <div className="mt-8 bg-primary-900/20 border border-primary-800 rounded-lg p-4 flex items-start">
          <Info className="w-5 h-5 text-primary-400 mr-3 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
          <div>
            <h3 className="font-medium text-primary-300">Early Detection Matters</h3>
            <p className="text-sm text-primary-400 mt-1">
              Regular skin checks are crucial for early detection. Make it a habit to examine your skin monthly and consult a dermatologist annually.
            </p>
          </div>
        </div>
        
        {/* Find a Dermatologist */}
        <div className="mt-6">
          <motion.a
            href="#"
            className="flex items-center justify-center w-full btn btn-primary py-3 px-4"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ExternalLink className="w-5 h-5 mr-2" strokeWidth={1.5} />
            Find a Dermatologist Near You
          </motion.a>
        </div>
      </div>
    </div>
  );
}