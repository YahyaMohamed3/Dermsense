import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Microscope, Smartphone } from 'lucide-react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import { Engine } from 'tsparticles-engine';

export default function HeroSection() {
  const particlesInit = async (engine: Engine) => {
    await loadSlim(engine);
  };

  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const textElement = textRef.current;
    if (!textElement) return;

    const phrases = [
      'Clarity',
      'Confidence',
      'Precision',
      'Insight'
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
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Interactive Neural Pathways Background */}
      <div className="absolute inset-0 -z-10">
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{
            background: {
              color: {
                value: "transparent",
              },
            },
            fpsLimit: 60,
            particles: {
              color: {
                value: "#ffffff",
              },
              links: {
                color: "#374151",
                distance: 150,
                enable: true,
                opacity: 0.2,
                width: 1,
              },
              collisions: {
                enable: false,
              },
              move: {
                direction: "none",
                enable: true,
                outModes: {
                  default: "bounce",
                },
                random: true,
                speed: 0.5,
                straight: false,
              },
              number: {
                density: {
                  enable: true,
                  area: 800,
                },
                value: 80,
              },
              opacity: {
                value: 0.3,
              },
              shape: {
                type: "circle",
              },
              size: {
                value: { min: 1, max: 3 },
              },
            },
            detectRetina: true,
          }}
        />
      </div>
      
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 to-slate-900/95 -z-5"></div>
      
      <div className="container relative z-10 py-20">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-full bg-primary-900/50 text-primary-300 mb-6">
              AI-Powered Dermatological Analysis
            </span>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants} 
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight tracking-tight"
          >
            <span className="block mb-4">Clarity for Your Skin.</span>
            <span className="block mb-4">Confidence for Your Life.</span>
            <span className="relative inline-block">
              <span 
                ref={textRef} 
                className="text-secondary-400"
              >
                Insight
              </span>
              <span className="absolute bottom-0 left-0 w-full h-2 bg-secondary-400 opacity-30"></span>
            </span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants} 
            className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            State-of-the-art dermatological analysis, powered by AI. 
            Completely private, entirely on your device.
          </motion.p>
          
          <motion.div 
            variants={itemVariants} 
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link
              to="/scan"
              className="btn btn-primary btn-lg group min-w-[280px] px-8 py-4 text-lg shadow-lg hover:shadow-primary-500/20 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
            >
              <Microscope className="w-5 h-5 mr-2" strokeWidth={1.5} />
              Analyze Clinical Image
            </Link>
            
            <div className="relative">
              <button
                className="btn btn-outline btn-lg min-w-[280px] px-8 py-4 text-lg border-2 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
                disabled
              >
                <Smartphone className="w-5 h-5 mr-2" strokeWidth={1.5} />
                Analyze Personal Photo
              </button>
              <span className="absolute -top-2 -right-2 coming-soon-badge">Coming Soon</span>
            </div>
          </motion.div>
          
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="mt-20 relative mx-auto max-w-6xl"
          >
            <div className="glass-panel rounded-2xl shadow-xl p-1 relative z-10 overflow-hidden">
              <img
                src="https://images.pexels.com/photos/7089401/pexels-photo-7089401.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="DermaSense application interface showing skin analysis"
                className="rounded-xl w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-transparent"></div>
            </div>
            
            <div className="absolute -bottom-5 -right-5 -z-10 w-64 h-64 bg-secondary-400/20 rounded-full blur-3xl" />
            <div className="absolute -top-5 -left-5 -z-10 w-64 h-64 bg-primary-400/20 rounded-full blur-3xl" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}