import { motion } from 'framer-motion';
import { Atom, Dna, Zap, Shield, Brain, Microscope } from 'lucide-react';

const FloatingElements = () => {
  const elements = [
    { Icon: Atom, color: 'text-blue-400', position: { top: '10%', left: '10%' }, delay: 0 },
    { Icon: Dna, color: 'text-cyan-400', position: { top: '20%', right: '15%' }, delay: 0.5 },
    { Icon: Zap, color: 'text-blue-300', position: { bottom: '30%', left: '8%' }, delay: 1 },
    { Icon: Shield, color: 'text-blue-500', position: { bottom: '20%', right: '10%' }, delay: 1.5 },
    { Icon: Brain, color: 'text-cyan-300', position: { top: '40%', left: '5%' }, delay: 2 },
    { Icon: Microscope, color: 'text-blue-400', position: { top: '60%', right: '5%' }, delay: 2.5 },
  ];

  return (
    <>
      {elements.map((element, index) => (
        <motion.div
          key={index}
          className={`absolute z-0 ${element.color}`}
          style={element.position}
          // 1. Initial state: Start invisible and small
          initial={{ opacity: 0, scale: 0.5 }}
          
          // 2. Animate To: Become visible and start a gentle floating animation
          animate={{ 
            opacity: 0.2, // Animate to a constant, low opacity
            scale: 1,     // Animate to full size
            y: [-8, 8, -8], // Add a continuous up-and-down motion
          }}
          
          // 3. Transition: Define how the animations behave
          transition={{
            // Transition for the initial fade-in (opacity and scale)
            duration: 2, 
            delay: element.delay,
            
            // Transition for the 'y' floating animation to make it loop
            y: {
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }
          }}
        >
          <element.Icon size={32} strokeWidth={1} />
        </motion.div>
      ))}
      
      {/* The little particles are fine, but we can give them a slightly more random feel */}
      {Array.from({ length: 25 }).map((_, index) => (
        <motion.div
          key={`particle-${index}`}
          className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.6, 0], // This pulsing works well for tiny particles
            scale: [1, 1.5, 1],
            y: [0, -Math.random() * 40 - 20, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 6,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
        />
      ))}
    </>
  );
};

export default FloatingElements;