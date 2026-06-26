'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { Text, Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

export interface GraphNode {
  id: string;
  name: string;
  type: 'concept' | 'scripture' | 'school' | 'person';
  sanskrit_name?: string | null;
  summary?: string | null;
  category?: string | null;
  connection_count?: number;
  position?: [number, number, number];
}

export interface GraphEdge {
  from: string;
  to: string;
  relationship?: string;
  weight?: number;
}

const TYPE_COLORS: Record<string, string> = {
  concept: '#e8a23c',
  scripture: '#5478AE',
  school: '#a78bfa',
  person: '#34d399',
};

const TYPE_OFFSETS: Record<string, number> = {
  concept: 0,
  scripture: Math.PI * 0.5,
  school: Math.PI,
  person: Math.PI * 1.5,
};

function computePositions(nodes: GraphNode[]): Map<string, [number, number, number]> {
  const positions = new Map<string, [number, number, number]>();
  const byType: Record<string, GraphNode[]> = {};

  for (const node of nodes) {
    const t = node.type || 'concept';
    (byType[t] ??= []).push(node);
  }

  for (const [type, group] of Object.entries(byType)) {
    const baseAngle = TYPE_OFFSETS[type] ?? 0;
    const radius = 2.5 + group.length * 0.08;
    group.forEach((node, i) => {
      const angle = baseAngle + (i / group.length) * Math.PI * 0.45 - Math.PI * 0.15;
      const y = (i / Math.max(group.length - 1, 1) - 0.5) * 3;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      positions.set(node.id, [x, y, z]);
    });
  }

  return positions;
}

function GraphNodeMesh({
  node,
  index,
  position,
  highlighted,
  selected,
  onHover,
  onClick,
}: {
  node: GraphNode;
  index: number;
  position: [number, number, number];
  highlighted: boolean;
  selected: boolean;
  onHover: (id: string | null) => void;
  onClick: (node: GraphNode) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const color = TYPE_COLORS[node.type] || '#888';
  const baseSize = node.type === 'concept' ? 0.2 : 0.15;
  const isActive = hovered || highlighted || selected;

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.position.x = position[0] + Math.sin(t * 0.3 + index) * 0.05;
    meshRef.current.position.y = position[1] + Math.cos(t * 0.2 + index * 0.7) * 0.04;
    meshRef.current.position.z = position[2] + Math.sin(t * 0.15 + index * 1.3) * 0.03;
    const scale = isActive ? baseSize * 1.6 : baseSize + Math.sin(t * 1.5 + index) * 0.015;
    meshRef.current.scale.setScalar(scale);
  });

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    onHover(node.id);
    document.body.style.cursor = 'pointer';
  }, [node.id, onHover]);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    onHover(null);
    document.body.style.cursor = 'auto';
  }, [onHover]);

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick(node);
  }, [node, onClick]);

  return (
    <Float speed={0.5} floatIntensity={0.08}>
      <mesh
        ref={meshRef}
        position={position}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 0.9 : 0.3}
          roughness={0.3}
          metalness={0.5}
          transparent={!isActive && !highlighted}
          opacity={isActive ? 1 : 0.7}
        />
      </mesh>
      <Text
        position={[position[0], position[1] - 0.35, position[2]]}
        fontSize={0.13}
        color={isActive ? '#fff' : 'rgba(255,255,255,0.55)'}
        anchorX="center"
        anchorY="top"
      >
        {node.name}
      </Text>
    </Float>
  );
}

function GraphEdgeLine({
  from,
  to,
  highlighted,
}: {
  from: [number, number, number];
  to: [number, number, number];
  highlighted: boolean;
}) {
  const lineObj = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute([...from, ...to], 3),
    );
    const material = new THREE.LineBasicMaterial({
      color: highlighted ? '#e8a23c' : '#c97a24',
      transparent: true,
      opacity: highlighted ? 0.5 : 0.1,
    });
    return new THREE.Line(geometry, material);
  }, [from, to, highlighted]);

  return <primitive object={lineObj} />;
}

interface GraphUniverseProps {
  className?: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  filter?: string;
  highlightIds?: Set<string>;
  selectedId?: string | null;
  onNodeClick?: (node: GraphNode) => void;
}

export default function GraphUniverse({
  className = '',
  nodes,
  edges,
  filter = 'all',
  highlightIds,
  selectedId,
  onNodeClick,
}: GraphUniverseProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const positions = useMemo(() => computePositions(nodes), [nodes]);

  const filteredNodes = useMemo(() => {
    if (filter === 'all') return nodes;
    const typeMap: Record<string, string> = {
      concepts: 'concept',
      scriptures: 'scripture',
      schools: 'school',
      people: 'person',
    };
    const t = typeMap[filter];
    return t ? nodes.filter((n) => n.type === t) : nodes;
  }, [nodes, filter]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  const connectedIds = useMemo(() => {
    if (!hoveredId) return new Set<string>();
    const ids = new Set<string>();
    for (const e of edges) {
      if (e.from === hoveredId) ids.add(e.to);
      if (e.to === hoveredId) ids.add(e.from);
    }
    return ids;
  }, [hoveredId, edges]);

  const visibleEdges = useMemo(
    () => edges.filter((e) => filteredNodeIds.has(e.from) && filteredNodeIds.has(e.to)),
    [edges, filteredNodeIds],
  );

  const handleNodeClick = useCallback(
    (node: GraphNode) => onNodeClick?.(node),
    [onNodeClick],
  );

  if (nodes.length === 0) {
    return (
      <div className={`${className} flex items-center justify-center`}>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">No graph data available</p>
      </div>
    );
  }

  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.3} />
        <pointLight position={[0, 0, 0]} color="#c97a24" intensity={1} distance={15} />

        {filteredNodes.map((node, i) => {
          const pos = positions.get(node.id) || [0, 0, 0];
          const isHighlighted =
            connectedIds.has(node.id) || (highlightIds?.has(node.id) ?? false);
          return (
            <GraphNodeMesh
              key={node.id}
              node={node}
              index={i}
              position={pos as [number, number, number]}
              highlighted={isHighlighted}
              selected={selectedId === node.id}
              onHover={setHoveredId}
              onClick={handleNodeClick}
            />
          );
        })}

        {visibleEdges.map((edge, i) => {
          const fromPos = positions.get(edge.from);
          const toPos = positions.get(edge.to);
          if (!fromPos || !toPos) return null;
          const isHighlighted =
            hoveredId === edge.from || hoveredId === edge.to;
          return (
            <GraphEdgeLine
              key={`e-${i}`}
              from={fromPos}
              to={toPos}
              highlighted={isHighlighted}
            />
          );
        })}

        <OrbitControls
          enableZoom
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          minDistance={3}
          maxDistance={16}
        />
      </Canvas>
    </div>
  );
}
