import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Vector3 } from 'three';

// Generate random points in a 3D space that form a neural network-like structure
function generateNeuralNetworkPoints(count: number, layers = 5, radius = 4) {
  const points = [];
  const layerSize = Math.floor(count / layers);
  const layerSpacing = 2;
  
  for (let l = 0; l < layers; l++) {
    const z = (l - layers / 2) * layerSpacing;
    const layerRadius = radius * (1 - 0.2 * Math.abs(l - layers / 2) / (layers / 2));
    const nodesInLayer = l === 0 || l === layers - 1 ? layerSize / 2 : layerSize;
    
    for (let i = 0; i < nodesInLayer; i++) {
      const angle = (i / nodesInLayer) * Math.PI * 2;
      const r = layerRadius * (0.7 + Math.random() * 0.3);
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      
      points.push(new Vector3(x, y, z));
    }
  }
  
  // Add some random connections between layers
  for (let i = 0; i < count * 0.5; i++) {
    const t = Math.random();
    const z = (Math.random() * layers - layers / 2) * layerSpacing;
    const angle = Math.random() * Math.PI * 2;
    const r = radius * (0.2 + Math.random() * 0.8);
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    
    points.push(new Vector3(x, y, z));
  }
  
  return points;
}

export default function NeuralNetworkModel({ count = 2000 }) {
  const ref = useRef<THREE.Points>(null);
  const { mouse, viewport } = useThree();
  
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
  
  // Animation and mouse interaction
  useFrame((state) => {
    if (!ref.current) return;
    
    // Slow rotation
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    
    // Subtle mouse tracking
    ref.current.rotation.x = THREE.MathUtils.lerp(
      ref.current.rotation.x,
      mouse.y * 0.2,
      0.05
    );
    ref.current.rotation.z = THREE.MathUtils.lerp(
      ref.current.rotation.z,
      -mouse.x * 0.2,
      0.05
    );
  });
  
  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#00f6ff"
        size={0.15}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}