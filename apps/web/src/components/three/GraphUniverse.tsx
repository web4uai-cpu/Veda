'use client';

import { useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface GraphNode {
  name: string;
  type: 'concept' | 'scripture' | 'school' | 'person';
  position: [number, number, number];
}

interface GraphEdge {
  from: number;
  to: number;
}

const GRAPH_NODES: GraphNode[] = [
  // Concepts
  { name: 'Brahman', type: 'concept', position: [0, 0.5, 0] },
  { name: 'Atman', type: 'concept', position: [1.5, 1.2, -0.5] },
  { name: 'Moksha', type: 'concept', position: [-1.2, 1.8, 0.3] },
  { name: 'Karma', type: 'concept', position: [2, -0.5, 0.8] },
  { name: 'Dharma', type: 'concept', position: [-2, -0.3, -0.5] },
  { name: 'Maya', type: 'concept', position: [0.5, -1.5, -0.8] },
  { name: 'Samsara', type: 'concept', position: [-0.8, -1.2, 1] },
  // Scriptures
  { name: 'Gita', type: 'scripture', position: [2.5, 0.5, -1] },
  { name: 'Upanishads', type: 'scripture', position: [-2.5, 1, 0.5] },
  // Schools
  { name: 'Advaita', type: 'school', position: [1, 2.2, 0.5] },
  { name: 'Dvaita', type: 'school', position: [-1.5, -2, -0.3] },
  // Persons
  { name: 'Shankara', type: 'person', position: [2.2, 2, 0] },
];

const GRAPH_EDGES: GraphEdge[] = [
  { from: 0, to: 1 },  // Brahman ↔ Atman
  { from: 0, to: 5 },  // Brahman ↔ Maya
  { from: 1, to: 2 },  // Atman ↔ Moksha
  { from: 3, to: 6 },  // Karma ↔ Samsara
  { from: 4, to: 3 },  // Dharma ↔ Karma
  { from: 2, to: 6 },  // Moksha ↔ Samsara
  { from: 5, to: 6 },  // Maya ↔ Samsara
  { from: 0, to: 9 },  // Brahman ↔ Advaita
  { from: 9, to: 11 }, // Advaita ↔ Shankara
  { from: 1, to: 7 },  // Atman ↔ Gita
  { from: 0, to: 8 },  // Brahman ↔ Upanishads
  { from: 4, to: 7 },  // Dharma ↔ Gita
  { from: 10, to: 4 }, // Dvaita ↔ Dharma
];

const TYPE_COLORS: Record<string, string> = {
  concept: '#e8a23c',
  scripture: '#5478AE',
  school: '#a78bfa',
  person: '#34d399',
};

function GraphNodeMesh({ node, index }: { node: GraphNode; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const color = TYPE_COLORS[node.type];
  const baseSize = node.type === 'concept' ? 0.18 : 0.14;

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    // Gentle orbit
    meshRef.current.position.x = node.position[0] + Math.sin(t * 0.3 + index) * 0.08;
    meshRef.current.position.y = node.position[1] + Math.cos(t * 0.2 + index * 0.7) * 0.06;
    meshRef.current.position.z = node.position[2] + Math.sin(t * 0.15 + index * 1.3) * 0.05;
    // Pulse
    const scale = hovered ? baseSize * 1.5 : baseSize + Math.sin(t * 1.5 + index) * 0.02;
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <Float speed={0.5} floatIntensity={0.1}>
      <mesh
        ref={meshRef}
        position={node.position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.3}
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>
      {/* Label */}
      <Text
        position={[node.position[0], node.position[1] - 0.3, node.position[2]]}
        fontSize={0.12}
        color={hovered ? '#fff' : 'rgba(255,255,255,0.6)'}
        anchorX="center"
        anchorY="top"
        font="/fonts/Inter-Regular.woff"
        outlineWidth={0}
      >
        {node.name}
      </Text>
    </Float>
  );
}

function GraphEdgeLine({ edge }: { edge: GraphEdge }) {
  const fromNode = GRAPH_NODES[edge.from];
  const toNode = GRAPH_NODES[edge.to];
  if (!fromNode || !toNode) return null;
  const from = fromNode.position;
  const to = toNode.position;

  const lineObj = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([
      ...from, ...to,
    ], 3));
    const material = new THREE.LineBasicMaterial({ color: '#c97a24', transparent: true, opacity: 0.12 });
    return new THREE.Line(geometry, material);
  }, [from, to]);

  return <primitive object={lineObj} />;
}

interface GraphUniverseProps {
  className?: string;
}

export default function GraphUniverse({ className = '' }: GraphUniverseProps) {
  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.3} />
        <pointLight position={[0, 0, 0]} color="#c97a24" intensity={1} distance={10} />

        {/* Nodes */}
        {GRAPH_NODES.map((node, i) => (
          <GraphNodeMesh key={node.name} node={node} index={i} />
        ))}

        {/* Edges */}
        {GRAPH_EDGES.map((edge, i) => (
          <GraphEdgeLine key={`edge-${i}`} edge={edge} />
        ))}

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          minDistance={3}
          maxDistance={12}
        />
      </Canvas>
    </div>
  );
}
