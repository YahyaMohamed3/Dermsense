import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield } from 'lucide-react';

export default function HeroSection() {
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const textElement = textRef.current;
    if (!textElement) return;

    const phrases = [
      'Early Detection',
      'Peace of Mind',
      'Smart Analysis',
      'Skin Health'
    ];
    
    let currentPhraseIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    let pauseDuration = 2000;

    const type = () => {
      const currentPhrase = phrases[currentPhraseIndex];
      
      if (isDeleting) {
        currentCharIndex--;
        typingSpeed = 50;
      } else {
        currentCharIndex++;
        typingSpeed = 100;
      }
      
      if (textElement) {
        textElement.textContent = currentPhrase.substring(0, currentCharIndex);
      }
      
      if (!isDeleting && currentCharIndex === currentPhrase.length) {
        isDeleting = true;
        typingSpeed = pauseDuration;
      } else if (isDeleting && currentCharIndex === 0) {
        isDeleting = false;
        currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
      }
      
      setTimeout(type, typingSpeed);
    };
    
    const typingTimeout = setTimeout(type, 1000);
    
    return () => clearTimeout(typingTimeout);
  }, []);

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-900 -z-10" />
      
      {/* Animated background dots */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-300/20 dark:bg-primary-700/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-secondary-300/20 dark:bg-secondary-700/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-300 mb-6">
              <Shield className="w-4 h-4 mr-1" />
              AI-Powered Skin Analysis
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Advanced Skin Cancer Detection for{' '}
            <span className="relative">
              <span 
                ref={textRef} 
                className="text-primary-600 dark:text-primary-400"
              >
                Early Detection
              </span>
              <span className="absolute bottom-0 left-0 w-full h-1 bg-primary-600 dark:bg-primary-400 opacity-30"></span>
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            DermaSense uses advanced AI to analyze skin conditions and detect potential signs of skin cancer. Upload a photo for instant analysis and take control of your skin health today.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/scan"
              className="btn btn-primary btn-lg group min-w-[180px]"
            >
              Start Scanning
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#how-it-works"
              className="btn btn-outline btn-lg min-w-[180px]"
            >
              Learn More
            </a>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mt-16 relative mx-auto max-w-5xl"
        >
          <div className="glassmorphism rounded-2xl shadow-xl p-1 relative z-10">
            <img
              src="https://images.pexels.com/photos/7089401/pexels-photo-7089401.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              alt="DermaSense application interface showing skin analysis"
              className="rounded-xl w-full h-auto object-cover"
            />
          </div>
          
          <div className="absolute -bottom-5 -right-5 -z-10 w-64 h-64 bg-secondary-400/20 dark:bg-secondary-700/10 rounded-full blur-3xl" />
          <div className="absolute -top-5 -left-5 -z-10 w-64 h-64 bg-primary-400/20 dark:bg-primary-700/10 rounded-full blur-3xl" />
        </motion.div>
      </div>
    </section>
  );
}