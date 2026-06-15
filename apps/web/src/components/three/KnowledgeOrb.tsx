'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function Orb({ pulse = false }: { pulse?: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.3;
      meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
      const s = pulse ? 1 + Math.sin(t * 2) * 0.05 : 1;
      meshRef.current.scale.setScalar(s);
    }
    if (glowRef.current) {
      const gs = 1.3 + Math.sin(t * 1.5) * 0.1;
      glowRef.current.scale.setScalar(gs);
    }
  });

  return (
    <group>
      {/* Outer glow sphere */}
      <Sphere ref={glowRef} args={[1, 32, 32]}>
        <meshBasicMaterial
          color="#c97a24"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Main orb */}
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <MeshDistortMaterial
          color="#1a0d00"
          emissive="#c97a24"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.8}
          distort={0.3}
          speed={2}
          transparent
          opacity={0.9}
        />
      </Sphere>

      {/* Inner core glow */}
      <Sphere args={[0.4, 32, 32]}>
        <meshBasicMaterial
          color="#ffbc6b"
          transparent
          opacity={0.3}
        />
      </Sphere>

      {/* Point light from orb */}
      <pointLight color="#c97a24" intensity={2} distance={8} decay={2} />
    </group>
  );
}

interface KnowledgeOrbProps {
  className?: string;
  pulse?: boolean;
}

export default function KnowledgeOrb({ className = '', pulse = false }: KnowledgeOrbProps) {
  return (
    <div className={`${className}`} style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 40 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.1} />
        <directionalLight position={[5, 5, 5]} intensity={0.3} color="#fff5e6" />
        <Orb pulse={pulse} />
      </Canvas>
    </div>
  );
}
