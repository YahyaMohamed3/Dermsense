import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Generate random points for the particle field
function generateParticles(count: number, size: number) {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * size;
    positions[i3 + 1] = (Math.random() - 0.5) * size;
    positions[i3 + 2] = (Math.random() - 0.5) * size * 0.5; // Flatter on z-axis
  }
  
  return positions;
}

export default function ParticleField({ count = 1000, size = 20 }) {
  const ref = useRef<THREE.Points>(null);
  const positions = generateParticles(count, size);
  
  useFrame((state) => {
    if (!ref.current) return;
    
    // Very slow rotation for ambient movement
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.02;
    ref.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.01) * 0.1;
  });
  
  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#38bdf8" // secondary-400
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.2}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}