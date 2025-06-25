import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Generate random points in a 3D space that form a neural network-like structure
function generateNeuralNetworkPoints(count: number) {
  const points = [];
  const layers = 5;
  const layerSize = Math.floor(count / layers);
  const layerSpacing = 2;
  
  // Create layers of nodes
  for (let l = 0; l < layers; l++) {
    const z = (l - layers / 2) * layerSpacing;
    const layerRadius = 4 * (1 - 0.2 * Math.abs(l - layers / 2) / (layers / 2));
    const nodesInLayer = l === 0 || l === layers - 1 ? layerSize / 2 : layerSize;
    
    for (let i = 0; i < nodesInLayer; i++) {
      const angle = (i / nodesInLayer) * Math.PI * 2;
      const r = layerRadius * (0.7 + Math.random() * 0.3);
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      
      points.push(new THREE.Vector3(x, y, z));
    }
  }
  
  // Add some random connections between layers
  for (let i = 0; i < count * 0.5; i++) {
    const z = (Math.random() * layers - layers / 2) * layerSpacing;
    const angle = Math.random() * Math.PI * 2;
    const r = 4 * (0.2 + Math.random() * 0.8);
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    
    points.push(new THREE.Vector3(x, y, z));
  }
  
  return points;
}

export default function NeuralNetworkModel({ count = 2000 }) {
  const ref = useRef<THREE.Points>(null);
  
  // Generate points only once
  const points = useMemo(() => {
    return generateNeuralNetworkPoints(count);
  }, [count]);
  
  // Convert points to Float32Array for Three.js
  const positions = useMemo(() => {
    const positions = new Float32Array(points.length * 3);
    points.forEach((point, i) => {
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
    });
    return positions;
  }, [points]);
  
  // Animation
  useFrame((state) => {
    if (!ref.current) return;
    
    // Slow rotation
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    
    // Subtle breathing effect
    const s = 1 + Math.sin(state.clock.getElapsedTime() * 0.3) * 0.03;
    ref.current.scale.set(s, s, s);
  });
  
  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#3b82f6" // primary-600
        size={0.12}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}