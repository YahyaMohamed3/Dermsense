import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield } from 'lucide-react';
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import NeuralNetworkModel from "../three/NeuralNetworkModel";
import ParticleField from "../three/ParticleField";

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <NeuralNetworkModel count={2000} />
          <ParticleField count={1000} size={30} />
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            enableRotate={true}
            rotateSpeed={0.3}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </div>
      
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/90 to-white/95 dark:from-slate-900/90 dark:to-slate-900/95 -z-5"></div>
      
      <div className="container relative z-10 py-20">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-300 mb-6">
              <Shield className="w-4 h-4 mr-2" strokeWidth={1.5} />
              AI-Powered Skin Analysis
            </span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            Intelligent Dermatological{' '}
            <span className="relative">
              <span 
                ref={textRef} 
                className="text-primary-600 dark:text-secondary-400"
              >
                Insight
              </span>
              <span className="absolute bottom-0 left-0 w-full h-1 bg-primary-600 dark:bg-secondary-400 opacity-30"></span>
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Upload a clear image of your skin concern for an instant, private analysis powered by state-of-the-art AI.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              to="/scan"
              className="btn btn-primary btn-lg group min-w-[200px] px-8 py-4 text-lg shadow-lg hover:shadow-primary-500/20 hover:-translate-y-1 transition-all duration-300"
            >
              Start Scanning
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
            </Link>
            
            <div className="relative">
              <button
                className="btn btn-outline btn-lg min-w-[200px] px-8 py-4 text-lg border-2 hover:-translate-y-1 transition-all duration-300"
                disabled
              >
                Learn More
              </button>
              <span className="coming-soon-badge absolute -top-2 -right-2 px-3 py-1">
                Coming Soon
              </span>
            </div>
          </motion.div>
          
          <motion.div
            variants={itemVariants}
            className="mt-16 text-center"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Trusted by healthcare professionals</p>
            <div className="flex flex-wrap justify-center gap-8 opacity-70">
              <div className="h-8 w-24 bg-slate-300 dark:bg-slate-700 rounded-md animate-pulse"></div>
              <div className="h-8 w-32 bg-slate-300 dark:bg-slate-700 rounded-md animate-pulse"></div>
              <div className="h-8 w-28 bg-slate-300 dark:bg-slate-700 rounded-md animate-pulse"></div>
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="mt-16 relative mx-auto max-w-5xl"
        >
          <div className="glass-panel rounded-2xl shadow-xl p-1 relative z-10 overflow-hidden">
            <img
              src="https://images.pexels.com/photos/7089401/pexels-photo-7089401.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              alt="DermaSense application interface showing skin analysis"
              className="rounded-xl w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-transparent"></div>
          </div>
          
          <div className="absolute -bottom-5 -right-5 -z-10 w-64 h-64 bg-secondary-400/20 dark:bg-secondary-700/10 rounded-full blur-3xl" />
          <div className="absolute -top-5 -left-5 -z-10 w-64 h-64 bg-primary-400/20 dark:bg-primary-700/10 rounded-full blur-3xl" />
        </motion.div>
      </div>
    </section>
  );
}