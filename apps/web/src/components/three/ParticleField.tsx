'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Particles({ count = 200 }: { count?: number }) {
  const meshRef = useRef<THREE.Points>(null);

  const { positions, velocities, opacities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const opa = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Spread particles in a wide volume
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;

      // Slow drift velocities
      vel[i * 3] = (Math.random() - 0.5) * 0.003;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.002;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.001;

      opa[i] = Math.random() * 0.5 + 0.1;
    }

    return { positions: pos, velocities: vel, opacities: opa };
  }, [count]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const geo = meshRef.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const t = clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      arr[i * 3] += velocities[i * 3] + Math.sin(t * 0.3 + i) * 0.0005;
      arr[i * 3 + 1] += velocities[i * 3 + 1] + Math.cos(t * 0.2 + i * 0.5) * 0.0005;
      arr[i * 3 + 2] += velocities[i * 3 + 2];

      // Wrap around bounds
      if (arr[i * 3] > 10) arr[i * 3] = -10;
      if (arr[i * 3] < -10) arr[i * 3] = 10;
      if (arr[i * 3 + 1] > 6) arr[i * 3 + 1] = -6;
      if (arr[i * 3 + 1] < -6) arr[i * 3 + 1] = 6;
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#e8a23c"
        size={0.04}
        transparent
        opacity={0.4}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/** Thin connecting lines between nearby particles */
function Connections({ count = 200 }: { count?: number }) {
  const linesRef = useRef<THREE.LineSegments>(null);

  const linePositions = useMemo(() => {
    // Allocate max possible connections
    return new Float32Array(count * 6);
  }, [count]);

  return null; // Connections are expensive; skipping for perf
}

interface ParticleFieldProps {
  className?: string;
  count?: number;
}

export default function ParticleField({ className = '', count = 150 }: ParticleFieldProps) {
  return (
    <div className={`three-canvas-container ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: false }}
        style={{ background: 'transparent' }}
      >
        <Particles count={count} />
      </Canvas>
    </div>
  );
}
