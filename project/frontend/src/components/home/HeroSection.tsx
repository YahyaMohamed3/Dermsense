import { useEffect, useRef } from 'react';
import { motion} from 'framer-motion';
import { Microscope, Smartphone, Zap, Shield, Brain } from 'lucide-react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import { Engine } from 'tsparticles-engine';
import MolecularGlobe from '../ui/MolecularGlobe';
import FloatingElements from '../ui/FloatingElements';

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesInit = async (engine: Engine) => {
    await loadSlim(engine);
  };

  const textRef = useRef<HTMLSpanElement>(null);

  // Clean/simple smooth typing effect
  useEffect(() => {
    const textElement = textRef.current;
    if (!textElement) return;

    const phrases = [
      'Precision',
      'Clarity',
      'Intelligence',
      'Innovation',
      'Discovery'
    ];

    let currentPhraseIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const type = () => {
      const currentPhrase = phrases[currentPhraseIndex];
      textElement.textContent = currentPhrase.substring(0, currentCharIndex);

      if (!isDeleting && currentCharIndex < currentPhrase.length) {
        currentCharIndex++;
        timeoutId = setTimeout(type, 85); // Typing speed
      } else if (isDeleting && currentCharIndex > 0) {
        currentCharIndex--;
        timeoutId = setTimeout(type, 45); // Deleting speed
      } else {
        if (!isDeleting) {
          isDeleting = true;
          timeoutId = setTimeout(type, 1200); // Pause before deleting
        } else {
          isDeleting = false;
          currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
          timeoutId = setTimeout(type, 500); // Pause before typing next
        }
      }
    };

    timeoutId = setTimeout(type, 800); // Initial delay

    return () => clearTimeout(timeoutId);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0},
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.25, 0.46, 0.45, 0.94] 
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.section
      ref={containerRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-grey-900"
    >
      {/* Background gradients - LOWER z-index than particles */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-blue-800/10 -z-20"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-950/80 -z-20"></div>
      {/* Enhanced Particles Background -z-10 so it sits above gradients but below content */}
      <div className="absolute inset-0 -z-9.9">
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{
            background: {
              color: { value: "transparent" }
            },
            fpsLimit: 120,
            particles: {
              color: { value: ["#60a5fa", "#38bdf8", "#a5f3fc", "#0ea5e9"] },
              links: {
                color: "#4066c0",
                distance: 150,
                enable: true,
                opacity: 0.08,
                width: 1.2,
              },
              move: {
                direction: "none",
                enable: true,
                outModes: { default: "bounce" },
                random: true,
                speed: 0.35,
                straight: false,
              },
              number: {
                density: { enable: true, area: 900 },
                value: 70,
              },
              opacity: {
                value: { min: 0.25, max: 0.3 },
                animation: { enable: true, speed: 1, minimumValue: 0.25 }
              },
              shape: { type: "circle" },
              size: {
                value: { min: 1, max: 1.5 },
                animation: { enable: true, speed: 2, minimumValue: 1 }
              }
            },
            detectRetina: true,
          }}
        />
      </div>
      <FloatingElements />
      <div className="container relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <motion.div
            className="space-y-8 lg:pr-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <motion.span 
                className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-full bg-gradient-to-r from-blue-600/20 to-blue-800/20 text-blue-300 mb-8 border border-blue-500/30 backdrop-blur-sm shadow-lg"
                whileHover={{ scale: 1.05, borderColor: "#60a5fa" }}
                transition={{ duration: 0.2 }}
              >
                <motion.div 
                  className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mr-3"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                AI-Powered Dermatological Analysis
              </motion.span>
            </motion.div>
            <motion.div variants={itemVariants}>
              <h1 className="text-5xl md:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight">
                <span className="block text-white mb-2">
                  Redefining
                </span>
                <span className="block text-white mb-2">
                  Medical 
                </span>
                <span className="relative inline-block">
                  <span 
                    ref={textRef}
                    className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent transition-opacity duration-300"
                  >
                    Precision
                  </span>
                </span>
              </h1>
            </motion.div>
            <motion.p 
              variants={itemVariants} 
              className="text-xl md:text-2xl text-slate-300 mb-10 leading-relaxed max-w-2xl"
            >
              Harness the power of advanced AI for{' '}
              <span className="text-blue-400 font-semibold">instant dermatological insights</span>.
              <span className="block mt-3 text-lg text-slate-400">
                Completely private. Entirely on your device. Absolutely revolutionary.
              </span>
            </motion.p>
            <motion.div 
              variants={itemVariants} 
              className="flex flex-col sm:flex-row gap-6"
            >
              <motion.button
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-blue-500/25 min-w-[280px]"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center justify-center">
                  <Microscope className="w-5 h-5 mr-3" strokeWidth={1.5} />
                  Analyze Clinical Image
                </div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </div>
              </motion.button>
              <div className="relative">
                <motion.button
                  className="group px-8 py-4 border-2 border-slate-600 text-slate-300 font-semibold rounded-xl backdrop-blur-sm hover:border-blue-400 hover:text-blue-300 transition-all duration-300 min-w-[280px] relative overflow-hidden"
                  whileHover={{ y: -2, borderColor: "#60a5fa" }}
                  whileTap={{ scale: 0.98 }}
                  disabled
                >
                  <div className="relative z-10 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 mr-3" strokeWidth={1.5} />
                    Analyze Personal Photo
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-blue-800/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.button>
                <motion.span 
                  className="absolute -top-3 -right-3 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-bold rounded-full shadow-lg"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  Coming Soon
                </motion.span>
              </div>
            </motion.div>
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-slate-700/50"
            >
              {[
                { icon: Zap, label: "Instant Analysis", color: "text-blue-400" },
                { icon: Shield, label: "100% Private", color: "text-cyan-400" },
                { icon: Brain, label: "AI Powered", color: "text-blue-300" }
              ].map((feature, index) => (
                <motion.div
                  key={feature.label}
                  className="flex flex-col items-center text-center group cursor-pointer"
                  variants={floatingVariants}
                  animate="animate"
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className={`p-3 rounded-full bg-slate-800/50 border border-slate-700/50 group-hover:border-slate-600 transition-colors duration-300 mb-3`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} strokeWidth={1.5} />
                  </div>
                  <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-300 font-medium">
                    {feature.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
          {/* Right Column - Advanced AI Molecular Globe */}
          <motion.div
            className="relative flex items-center justify-center lg:justify-end"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <div className="relative">
              <MolecularGlobe />
              {/* AI Neural Network Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* AI Processing Indicators */}
                <motion.div
                  className="absolute top-4 left-4 flex items-center space-x-2 bg-blue-900/30 backdrop-blur-sm rounded-full px-3 py-1 border border-blue-400/30"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-blue-300 font-medium">AI Processing</span>
                </motion.div>
                <motion.div
                  className="absolute bottom-4 right-4 flex items-center space-x-2 bg-cyan-900/30 backdrop-blur-sm rounded-full px-3 py-1 border border-cyan-400/30"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}
                >
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-cyan-300 font-medium">Neural Analysis</span>
                </motion.div>
                {/* Data Flow Lines */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
                  <motion.path
                    d="M50,200 Q200,50 350,200"
                    stroke="url(#dataFlow1)"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="5,5"
                    animate={{ strokeDashoffset: [0, -20] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  />
                  <motion.path
                    d="M200,50 Q350,200 200,350"
                    stroke="url(#dataFlow2)"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="5,5"
                    animate={{ strokeDashoffset: [0, -20] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "linear", delay: 0.5 }}
                  />
                  <defs>
                    <linearGradient id="dataFlow1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity="0" />
                      <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="dataFlow2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
                      <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              {/* Enhanced glow effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl scale-150 -z-10"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-blue-400/10 to-blue-600/10 rounded-full blur-2xl scale-125 -z-10"></div>
            </div>
          </motion.div>
        </div>
      </div>
      {/* Enhanced Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        <div className="flex flex-col items-center group cursor-pointer">
          <motion.span 
            className="text-sm text-slate-400 mb-4 group-hover:text-slate-300 transition-colors duration-300"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            Discover More
          </motion.span>
          <motion.div 
            className="w-6 h-10 border-2 border-slate-500 group-hover:border-blue-400 rounded-full flex justify-center p-1 transition-colors duration-300"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <motion.div 
              className="w-1.5 h-3 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full"
              animate={{ 
                y: [0, 8, 0],
                opacity: [1, 0.3, 1]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  );
}
