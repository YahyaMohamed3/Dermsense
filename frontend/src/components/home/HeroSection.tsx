import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import NeuralNetworkModel from '../three/NeuralNetworkModel';
import ParticleField from '../three/ParticleField';

export default function HeroSection() {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
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
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-slate-900">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        {isMounted && (
          <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <NeuralNetworkModel count={2000} />
            <ParticleField count={500} size={30} />
            <OrbitControls 
              enableZoom={false} 
              enablePan={false} 
              enableRotate={false} 
            />
          </Canvas>
        )}
      </div>
      
      {/* Content */}
      <div className="container relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-cyan-500/20 text-cyan-500 mb-6">
              <Shield className="w-4 h-4 mr-1" strokeWidth={1.5} />
              AI-Powered Skin Analysis
            </span>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-100 mb-4"
          >
            DermaSense: AI-Powered Dermatological Insight
          </motion.h1>
          
          <motion.p
            variants={itemVariants}
            className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto"
          >
            Private, state-of-the-art skin analysis. Your data never leaves your device.
          </motion.p>
          
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/scan"
              className="btn bg-cyan-500 text-black hover:bg-cyan-400 glow-hover min-w-[240px]"
            >
              Analyze Clinical Image (Dermatoscopy)
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
            </Link>
            
            <div className="relative">
              <button
                className="btn btn-outline border-cyan-500 text-cyan-500 hover:bg-cyan-500/10 min-w-[240px]"
                disabled
              >
                Analyze Personal Photo (Phone Camera)
              </button>
              <span className="pulse-badge absolute -top-2 -right-2">
                Coming Soon
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-900 to-transparent z-10"></div>
    </section>
  );
}