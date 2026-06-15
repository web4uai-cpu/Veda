'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

/** Generate Sri Yantra-inspired sacred geometry vertices */
function generateSriYantraPoints(): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];

  // Central bindu (point)
  points.push(new THREE.Vector3(0, 0, 0));

  // Inner triangles (9 interlocking triangles)
  const layers = [
    { radius: 0.3, segments: 3, rotation: 0, z: 0.05 },
    { radius: 0.3, segments: 3, rotation: Math.PI, z: -0.05 },
    { radius: 0.6, segments: 3, rotation: Math.PI / 6, z: 0.1 },
    { radius: 0.6, segments: 3, rotation: Math.PI + Math.PI / 6, z: -0.1 },
    { radius: 0.9, segments: 3, rotation: 0, z: 0.15 },
    { radius: 0.9, segments: 3, rotation: Math.PI, z: -0.15 },
    { radius: 1.2, segments: 6, rotation: 0, z: 0.05 },
    { radius: 1.5, segments: 8, rotation: Math.PI / 8, z: 0 },
    { radius: 1.8, segments: 16, rotation: 0, z: 0 },
  ];

  layers.forEach(({ radius, segments, rotation, z }) => {
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2 + rotation;
      points.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        z,
      ));
    }
  });

  // Outer lotus petals
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const r = 2.0 + Math.sin(i * 4) * 0.2;
    points.push(new THREE.Vector3(
      Math.cos(angle) * r,
      Math.sin(angle) * r,
      Math.sin(angle * 3) * 0.1,
    ));
  }

  return points;
}

function SacredGeometryMesh() {
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const { positions, linePositions } = useMemo(() => {
    const pts = generateSriYantraPoints();
    const pos = new Float32Array(pts.length * 3);
    pts.forEach((p, i) => {
      pos[i * 3] = p.x;
      pos[i * 3 + 1] = p.y;
      pos[i * 3 + 2] = p.z;
    });

    // Create edges between nearby points
    const lines: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dist = pts[i].distanceTo(pts[j]);
        if (dist < 0.8) {
          lines.push(pts[i].x, pts[i].y, pts[i].z);
          lines.push(pts[j].x, pts[j].y, pts[j].z);
        }
      }
    }

    return { positions: pos, linePositions: new Float32Array(lines) };
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = clock.getElapsedTime() * 0.05;
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.1) * 0.1;
    }
  });

  return (
    <Float speed={0.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={groupRef} scale={1.2}>
        {/* Connection lines */}
        <lineSegments ref={linesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[linePositions, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#c97a24"
            transparent
            opacity={0.15}
          />
        </lineSegments>

        {/* Vertex points */}
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[positions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            color="#e8a23c"
            size={0.06}
            transparent
            opacity={0.6}
            sizeAttenuation
          />
        </points>

        {/* Outer ring */}
        <mesh>
          <torusGeometry args={[2.2, 0.008, 16, 64]} />
          <meshBasicMaterial color="#c97a24" transparent opacity={0.2} />
        </mesh>

        {/* Inner ring */}
        <mesh>
          <torusGeometry args={[1.5, 0.005, 16, 64]} />
          <meshBasicMaterial color="#c97a24" transparent opacity={0.15} />
        </mesh>
      </group>
    </Float>
  );
}

interface SacredGeometryProps {
  className?: string;
}

export default function SacredGeometry({ className = '' }: SacredGeometryProps) {
  return (
    <div className={`three-canvas-container ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <SacredGeometryMesh />
      </Canvas>
    </div>
  );
}
