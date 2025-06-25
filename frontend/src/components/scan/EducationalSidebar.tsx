import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
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
    <div className="card h-full">
      <div className="card-header">
        <h3 className="card-title">Educational Resources</h3>
        <p className="card-description">Learn about skin conditions and cancer types</p>
      </div>
      
      <div className="card-content pb-0 max-h-[400px] overflow-y-auto scrollbar-hide">
        <div className="space-y-6">
          <section>
            <h4 className="text-lg font-medium mb-4">Common Skin Lesion Types</h4>
            <div className="space-y-4">
              {skinLesions.map((lesion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-3 items-start"
                >
                  <img
                    src={lesion.image}
                    alt={lesion.name}
                    className="w-16 h-16 rounded-md object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <h5 className="font-medium">{lesion.name}</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{lesion.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
          
          <section>
            <h4 className="text-lg font-medium mb-4">Frequently Asked Questions</h4>
            <div className="space-y-3">
              {faqItems.map((item, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleFaq(index)}
                    className={cn(
                      "w-full px-4 py-3 text-left flex items-center justify-between",
                      expandedFaq === index
                        ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    <span className="font-medium">{item.question}</span>
                    {expandedFaq === index ? (
                      <ChevronUp className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                    ) : (
                      <ChevronDown className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {expandedFaq === index && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 border-t">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </section>
          
          <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-lg p-4 flex items-start">
            <Info className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-3 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
            <div>
              <h5 className="font-medium text-primary-800 dark:text-primary-300">Early Detection Matters</h5>
              <p className="text-sm text-primary-700 dark:text-primary-400 mt-1">
                Regular skin checks are crucial for early detection. Make it a habit to examine your skin monthly and consult a dermatologist annually.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card-footer flex-col items-start border-t mt-6">
        <h4 className="font-medium mt-2">Need Professional Advice?</h4>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
          This tool is not a substitute for professional medical advice. Always consult with a dermatologist.
        </p>
        <a
          href="#"
          className="btn btn-outline btn-sm w-full"
        >
          Find a Dermatologist Near You
        </a>
      </div>
    </div>
  );
}