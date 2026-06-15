'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/animations';

const GraphUniverse = dynamic(() => import('@/components/three/GraphUniverse'), { ssr: false });

const LEGEND = [
  { label: 'Concept', color: '#e8a23c' },
  { label: 'Scripture', color: '#5478AE' },
  { label: 'School', color: '#a78bfa' },
  { label: 'Person', color: '#34d399' },
];

export default function GraphPage() {
  return (
    <div className="flex h-[calc(100vh-64px)] flex-col lg:h-screen">
      {/* Toolbar */}
      <motion.div
        className="flex items-center justify-between border-b border-[hsl(var(--border))] px-4 py-3 lg:px-6 glass"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-lg font-semibold text-[hsl(var(--foreground))]">Knowledge Map</h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Interactive 3D graph · Drag to rotate · Scroll to zoom
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.select
            id="graph-filter"
            className="rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-1.5 text-sm text-[hsl(var(--foreground))] glass"
            whileHover={{ borderColor: 'rgba(201, 122, 36, 0.3)' }}
          >
            <option value="all">All Nodes</option>
            <option value="concepts">Concepts</option>
            <option value="scriptures">Scriptures</option>
            <option value="people">People</option>
            <option value="schools">Schools</option>
          </motion.select>
          <motion.button
            className="rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-sm text-[hsl(var(--foreground))] glass"
            whileHover={{
              borderColor: 'rgba(201, 122, 36, 0.3)',
              backgroundColor: 'rgba(201, 122, 36, 0.05)',
            }}
            whileTap={{ scale: 0.95 }}
          >
            Reset View
          </motion.button>
        </div>
      </motion.div>

      {/* 3D Graph Canvas */}
      <div className="relative flex-1" style={{ backgroundColor: 'hsl(0, 0%, 3%)' }}>
        <motion.div
          className="h-full w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <GraphUniverse className="h-full w-full" />
        </motion.div>

        {/* Legend Overlay */}
        <motion.div
          className="absolute bottom-6 left-6 flex gap-4 rounded-xl p-3 text-xs glass"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          {LEGEND.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 text-[hsl(var(--muted-foreground))]">
              <motion.span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
                animate={{
                  boxShadow: [
                    `0 0 4px ${item.color}40`,
                    `0 0 8px ${item.color}60`,
                    `0 0 4px ${item.color}40`,
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              {item.label}
            </div>
          ))}
        </motion.div>

        {/* Instructions overlay */}
        <motion.div
          className="absolute top-6 right-6 rounded-xl p-3 text-xs text-[hsl(var(--muted-foreground))] glass"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 1.5 }}
          whileHover={{ opacity: 1 }}
        >
          <p>🖱️ Drag to rotate · Scroll to zoom</p>
          <p className="mt-1">Hover nodes to highlight</p>
        </motion.div>
      </div>
    </div>
  );
}
