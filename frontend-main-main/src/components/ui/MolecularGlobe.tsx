import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const MolecularGlobe = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const angleRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 140;

    // Advanced molecular structure with AI neural pathways
    const molecules = [
      // Outer neural ring
      ...Array.from({ length: 16 }, (_, i) => ({
        angle: (i * Math.PI * 2) / 16,
        radius: radius,
        size: 3,
        color: '#3b82f6',
        speed: 0.004,
        offset: 0,
        type: 'neural'
      })),
      // AI processing layer
      ...Array.from({ length: 12 }, (_, i) => ({
        angle: (i * Math.PI * 2) / 12,
        radius: radius * 0.8,
        size: 4,
        color: '#60a5fa',
        speed: -0.006,
        offset: Math.PI / 12,
        type: 'processor'
      })),
      // Data flow ring
      ...Array.from({ length: 10 }, (_, i) => ({
        angle: (i * Math.PI * 2) / 10,
        radius: radius * 0.6,
        size: 5,
        color: '#06b6d4',
        speed: 0.008,
        offset: Math.PI / 10,
        type: 'data'
      })),
      // Core intelligence
      ...Array.from({ length: 8 }, (_, i) => ({
        angle: (i * Math.PI * 2) / 8,
        radius: radius * 0.35,
        size: 6,
        color: '#0ea5e9',
        speed: -0.01,
        offset: Math.PI / 8,
        type: 'core'
      }))
    ];

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      angleRef.current += 0.008;

      // Draw AI neural connections - enhanced visibility
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.25)';
      ctx.lineWidth = 1;
      molecules.forEach((mol1, i) => {
        const currentAngle1 = mol1.angle + angleRef.current * mol1.speed + mol1.offset;
        const x1 = centerX + Math.cos(currentAngle1) * mol1.radius;
        const y1 = centerY + Math.sin(currentAngle1) * mol1.radius;

        molecules.slice(i + 1).forEach((mol2) => {
          const currentAngle2 = mol2.angle + angleRef.current * mol2.speed + mol2.offset;
          const x2 = centerX + Math.cos(currentAngle2) * mol2.radius;
          const y2 = centerY + Math.sin(currentAngle2) * mol2.radius;

          const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
          if (distance < 100) {
            const opacity = 0.5 - (distance / 100) * 0.5;
            ctx.globalAlpha = opacity;
            
            // Create gradient connection
            const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
            gradient.addColorStop(0, mol1.color + '80');
            gradient.addColorStop(1, mol2.color + '80');
            ctx.strokeStyle = gradient;
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        });
      });

      // Draw advanced molecular nodes
      molecules.forEach((molecule) => {
        const currentAngle = molecule.angle + angleRef.current * molecule.speed + molecule.offset;
        const x = centerX + Math.cos(currentAngle) * molecule.radius;
        const y = centerY + Math.sin(currentAngle) * molecule.radius;

        // Enhanced glowing effect based on type
        const glowSize = molecule.size * 3;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
        
        gradient.addColorStop(0, molecule.color + 'DD');
        gradient.addColorStop(0.4, molecule.color + '88');
        gradient.addColorStop(1, molecule.color + '00');

        ctx.globalAlpha = 0.9;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Draw core molecule
        ctx.globalAlpha = 1;
        ctx.fillStyle = molecule.color;
        ctx.beginPath();
        ctx.arc(x, y, molecule.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw AI Brain Core - Neural Network Pattern (REMOVED FLOWER)
      ctx.globalAlpha = 1;
      
      // Brain outline with pulsing effect
      const brainPulse = 0.8 + Math.sin(angleRef.current * 3) * 0.2;
      const brainSize = 35 * brainPulse;
      
      // Brain core gradient
      const brainGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, brainSize);
      brainGradient.addColorStop(0, '#ffffff');
      brainGradient.addColorStop(0.3, '#60a5fa');
      brainGradient.addColorStop(0.7, '#3b82f6');
      brainGradient.addColorStop(1, '#1d4ed8');
      
      ctx.fillStyle = brainGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, brainSize, 0, Math.PI * 2);
      ctx.fill();

      // Neural network pattern inside brain
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.8;
      
      // Create neural pathways
      const neuralNodes = [
        { x: centerX - 15, y: centerY - 10 },
        { x: centerX + 15, y: centerY - 10 },
        { x: centerX - 10, y: centerY + 5 },
        { x: centerX + 10, y: centerY + 5 },
        { x: centerX, y: centerY - 15 },
        { x: centerX, y: centerY + 15 },
        { x: centerX - 20, y: centerY },
        { x: centerX + 20, y: centerY }
      ];

      // Draw neural connections
      neuralNodes.forEach((node1, i) => {
        neuralNodes.slice(i + 1).forEach((node2) => {
          const distance = Math.sqrt((node2.x - node1.x) ** 2 + (node2.y - node1.y) ** 2);
          if (distance < 30) {
            ctx.beginPath();
            ctx.moveTo(node1.x, node1.y);
            ctx.lineTo(node2.x, node2.y);
            ctx.stroke();
          }
        });
      });

      // Draw neural nodes
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 1;
      neuralNodes.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Central processing core
      const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 8);
      coreGradient.addColorStop(0, '#ffffff');
      coreGradient.addColorStop(0.5, '#60a5fa');
      coreGradient.addColorStop(1, '#3b82f6');
      
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing energy rings around brain
      for (let ring = 0; ring < 3; ring++) {
        const ringRadius = brainSize + (ring * 8) + Math.sin(angleRef.current * 2 + ring) * 3;
        const ringOpacity = 0.3 - (ring * 0.1);
        
        ctx.strokeStyle = `rgba(96, 165, 250, ${ringOpacity})`;
        ctx.lineWidth = 2;
        ctx.globalAlpha = ringOpacity;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Advanced DNA helix with AI data streams
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = 0.6;
      
      for (let i = 0; i < 720; i += 8) {
        const angle1 = (i * Math.PI) / 180;
        const angle2 = angle1 + angleRef.current * 1.5;
        
        const helixRadius = 25 + Math.sin(angle1 * 6) * 8;
        const x1 = centerX + Math.cos(angle2) * helixRadius;
        const y1 = centerY + Math.sin(angle2) * helixRadius;
        
        const x2 = centerX + Math.cos(angle2 + Math.PI) * helixRadius;
        const y2 = centerY + Math.sin(angle2 + Math.PI) * helixRadius;
        
        // Data connection bridges
        if (i % 40 === 0) {
          const bridgeGradient = ctx.createLinearGradient(x1, y1, x2, y2);
          bridgeGradient.addColorStop(0, '#06b6d4');
          bridgeGradient.addColorStop(0.5, '#0ea5e9');
          bridgeGradient.addColorStop(1, '#06b6d4');
          ctx.strokeStyle = bridgeGradient;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        
        // Helix strands
        if (i > 0) {
          const prevAngle = ((i - 8) * Math.PI) / 180;
          const prevAngle2 = prevAngle + angleRef.current * 1.5;
          const prevHelixRadius = 25 + Math.sin(prevAngle * 6) * 8;
          
          const prevX1 = centerX + Math.cos(prevAngle2) * prevHelixRadius;
          const prevY1 = centerY + Math.sin(prevAngle2) * prevHelixRadius;
          
          ctx.strokeStyle = '#0ea5e9';
          ctx.beginPath();
          ctx.moveTo(prevX1, prevY1);
          ctx.lineTo(x1, y1);
          ctx.stroke();
        }
      }

      // AI processing waves
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.3)';
      ctx.lineWidth = 1;
      for (let wave = 0; wave < 3; wave++) {
        ctx.beginPath();
        for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
          const waveRadius = radius * 0.9 + Math.sin(angle * 4 + angleRef.current * 2 + wave) * 15;
          const x = centerX + Math.cos(angle) * waveRadius;
          const y = centerY + Math.sin(angle) * waveRadius;
          
          if (angle === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <motion.div 
      className="relative"
      animate={{ rotate: 360 }}
      transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
    >
      <canvas
        ref={canvasRef}
        width={450}
        height={450}
        className="max-w-full h-auto drop-shadow-2xl"
      />
      
      {/* Advanced orbital rings */}
      <motion.div
        className="absolute inset-0 border border-blue-400/20 rounded-full"
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-4 border border-blue-500/15 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-8 border border-cyan-400/20 rounded-full"
        animate={{ rotate: -360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-12 border border-blue-300/15 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Enhanced energy pulses */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10"
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.1, 0.4]
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <motion.div
        className="absolute inset-4 rounded-full bg-gradient-to-r from-blue-400/15 to-blue-600/15"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.05, 0.3]
        }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
      />
    </motion.div>
  );
};

export default MolecularGlobe;