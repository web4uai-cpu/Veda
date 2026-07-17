'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api, type GraphStats, type ConceptDetail } from '@/lib/api';
import type { GraphNode, GraphEdge } from '@/components/three/GraphUniverse';

const GraphUniverse = dynamic(() => import('@/components/three/GraphUniverse'), { ssr: false });

const LEGEND = [
  { label: 'Concept', color: '#e8a23c' },
  { label: 'Scripture', color: '#5478AE' },
  { label: 'School', color: '#a78bfa' },
  { label: 'Person', color: '#34d399' },
];

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: GraphStats | null;
}

async function fetchGraphData(): Promise<GraphData> {
  const [conceptsRes, schoolsRes, personsRes, statsRes] = await Promise.all([
    api.getConcepts(undefined, 100).catch(() => ({ concepts: [], total: 0 })),
    api.getSchools().catch(() => ({ schools: [], total: 0 })),
    api.getPersons().catch(() => ({ persons: [], total: 0 })),
    api.getGraphStats().catch(() => null),
  ]);

  const graphNodes: GraphNode[] = [];
  const graphEdges: GraphEdge[] = [];
  const nodeIds = new Set<string>();

  for (const c of conceptsRes.concepts) {
    graphNodes.push({
      id: c.slug,
      name: c.name,
      type: 'concept',
      sanskrit_name: c.sanskrit_name,
      summary: c.summary,
      category: c.category,
      connection_count: c.connection_count,
    });
    nodeIds.add(c.slug);
  }

  for (const s of schoolsRes.schools) {
    graphNodes.push({
      id: s.slug,
      name: s.name,
      type: 'school',
      sanskrit_name: s.sanskrit_name,
      summary: s.summary,
    });
    nodeIds.add(s.slug);
  }

  for (const p of personsRes.persons) {
    const slug = p.name.toLowerCase().replace(/\s+/g, '-');
    graphNodes.push({
      id: slug,
      name: p.name,
      type: 'person',
      sanskrit_name: p.sanskrit_name,
      summary: p.description,
      category: p.type,
    });
    nodeIds.add(slug);

    if (p.schools) {
      for (const schoolName of p.schools) {
        const schoolSlug = schoolName.toLowerCase().replace(/\s+/g, '-');
        if (nodeIds.has(schoolSlug)) {
          graphEdges.push({ from: slug, to: schoolSlug, relationship: 'TEACHES' });
        }
      }
    }
  }

  const edgeSet = new Set<string>();
  const addEdge = (from: string, to: string, rel: string) => {
    const key = [from, to].sort().join('::');
    if (!edgeSet.has(key) && nodeIds.has(from) && nodeIds.has(to)) {
      edgeSet.add(key);
      graphEdges.push({ from, to, relationship: rel });
    }
  };

  const topConcepts = conceptsRes.concepts
    .filter((c) => (c.connection_count ?? 0) > 0)
    .sort((a, b) => (b.connection_count ?? 0) - (a.connection_count ?? 0))
    .slice(0, 20);

  // Fetch concept relations and school details in one parallel batch
  // (the school loop was previously sequential — an N+1 waterfall).
  const [relatedResults, schoolDetails] = await Promise.all([
    Promise.all(
      topConcepts.map((c) =>
        api.getRelatedConcepts(c.slug, 1, 10).catch(() => ({ source: c.slug, related: [], depth: 1, total: 0 })),
      ),
    ),
    Promise.all(
      schoolsRes.schools.map(async (s) => {
        const detail = await api.getSchool(s.slug).catch(() => null);
        return detail ? { slug: s.slug, detail } : null;
      }),
    ),
  ]);

  for (const res of relatedResults) {
    for (const rel of res.related) {
      addEdge(res.source, rel.slug, 'RELATED_TO');
    }
  }

  for (const entry of schoolDetails) {
    if (!entry) continue;
    for (const concept of entry.detail.supported_concepts) {
      addEdge(entry.slug, concept.slug, 'SUPPORTS');
    }
  }

  return { nodes: graphNodes, edges: graphEdges, stats: statsRes };
}

export default function GraphPage() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [nodeDetail, setNodeDetail] = useState<ConceptDetail | null>(null);

  const {
    data,
    isLoading: loading,
    error: queryError,
    refetch: loadGraph,
  } = useQuery({ queryKey: ['graph', 'universe'], queryFn: fetchGraphData });

  const nodes = data?.nodes ?? [];
  const edges = data?.edges ?? [];
  const stats = data?.stats ?? null;
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : 'Failed to load graph data'
    : null;

  const handleSearch = useCallback(async () => {
    const q = searchQuery.trim();
    if (!q) {
      setHighlightIds(new Set());
      return;
    }
    try {
      const res = await api.searchGraph(q, undefined, 50);
      setHighlightIds(new Set(res.results.map((r) => r.slug)));
    } catch {
      setHighlightIds(new Set());
    }
  }, [searchQuery]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setHighlightIds(new Set());
      return;
    }
    const timer = setTimeout(handleSearch, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  const handleNodeClick = useCallback(async (node: GraphNode) => {
    setSelectedNode(node);
    setNodeDetail(null);
    if (node.type === 'concept') {
      try {
        const detail = await api.getConcept(node.id);
        setNodeDetail(detail);
      } catch {
        // detail unavailable
      }
    }
  }, []);

  const closeDetail = useCallback(() => {
    setSelectedNode(null);
    setNodeDetail(null);
  }, []);

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
            {loading
              ? 'Loading graph...'
              : `${nodes.length} nodes · ${edges.length} connections`}
            {stats && !loading && ` · ${stats.total_relationships} total relationships in database`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative hidden sm:block">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search nodes..."
              className="w-40 rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-1.5 text-sm text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--primary))]/40 glass"
            />
            {highlightIds.size > 0 && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[hsl(var(--primary))]/20 px-1.5 text-[10px] text-[hsl(var(--primary))]">
                {highlightIds.size}
              </span>
            )}
          </div>

          {/* Filter */}
          <select
            id="graph-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-1.5 text-sm text-[hsl(var(--foreground))] glass"
          >
            <option value="all">All Nodes</option>
            <option value="concepts">Concepts</option>
            <option value="schools">Schools</option>
            <option value="people">People</option>
          </select>

          {/* Reset */}
          <motion.button
            onClick={() => {
              setFilter('all');
              setSearchQuery('');
              setHighlightIds(new Set());
              setSelectedNode(null);
              setNodeDetail(null);
            }}
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
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent" />
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading Knowledge Graph from Neo4j...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={() => loadGraph()}
              className="rounded-lg border border-[hsl(var(--border))] px-4 py-2 text-sm text-[hsl(var(--foreground))] glass hover:border-[hsl(var(--primary))]/30"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <motion.div
            className="h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <GraphUniverse
              className="h-full w-full"
              nodes={nodes}
              edges={edges}
              filter={filter}
              highlightIds={highlightIds}
              selectedId={selectedNode?.id}
              onNodeClick={handleNodeClick}
            />
          </motion.div>
        )}

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
          <p>Drag to rotate · Scroll to zoom</p>
          <p className="mt-1">Click nodes to explore</p>
        </motion.div>

        {/* Node Detail Panel */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="absolute top-6 right-6 bottom-6 w-80 overflow-y-auto rounded-2xl border border-[hsl(var(--border))] p-5 glass"
              style={{ backgroundColor: 'rgba(8, 8, 8, 0.92)', backdropFilter: 'blur(20px)' }}
            >
              {/* Close */}
              <button
                onClick={closeDetail}
                className="absolute top-3 right-3 rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-white/5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>

              {/* Type badge */}
              <span
                className="mb-3 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider"
                style={{
                  backgroundColor: `${
                    selectedNode.type === 'concept' ? '#e8a23c'
                    : selectedNode.type === 'school' ? '#a78bfa'
                    : selectedNode.type === 'person' ? '#34d399'
                    : '#5478AE'
                  }20`,
                  color:
                    selectedNode.type === 'concept' ? '#e8a23c'
                    : selectedNode.type === 'school' ? '#a78bfa'
                    : selectedNode.type === 'person' ? '#34d399'
                    : '#5478AE',
                }}
              >
                {selectedNode.type}
              </span>

              {/* Name */}
              <h2 className="scripture-title text-xl font-bold text-[hsl(var(--foreground))]">
                {selectedNode.name}
              </h2>
              {selectedNode.sanskrit_name && (
                <p className="sanskrit mt-1 text-base text-[hsl(var(--muted-foreground))]">
                  {selectedNode.sanskrit_name}
                </p>
              )}

              {selectedNode.category && (
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  Category: {selectedNode.category}
                </p>
              )}

              {selectedNode.summary && (
                <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                  {selectedNode.summary}
                </p>
              )}

              {/* Concept detail — related, schools, persons */}
              {nodeDetail && (
                <div className="mt-4 space-y-4">
                  {nodeDetail.related_concepts.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                        Related Concepts ({nodeDetail.related_concepts.length})
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {nodeDetail.related_concepts.map((rc) => (
                          <button
                            key={rc.slug}
                            onClick={() => {
                              const n = nodes.find((nd) => nd.id === rc.slug);
                              if (n) handleNodeClick(n);
                            }}
                            className="rounded-full bg-[hsl(var(--primary))]/10 px-2.5 py-0.5 text-[11px] text-[hsl(var(--primary))] transition-all hover:bg-[hsl(var(--primary))]/20"
                          >
                            {rc.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {nodeDetail.schools.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                        Philosophical Schools
                      </h3>
                      <div className="space-y-1.5">
                        {nodeDetail.schools.map((s) => (
                          <button
                            key={s.slug}
                            onClick={() => {
                              const n = nodes.find((nd) => nd.id === s.slug);
                              if (n) handleNodeClick(n);
                            }}
                            className="block w-full rounded-lg border border-[hsl(var(--border))] px-3 py-2 text-left text-sm text-[hsl(var(--foreground))] transition-all hover:border-[hsl(var(--primary))]/30"
                          >
                            <span className="font-medium">{s.name}</span>
                            {s.summary && (
                              <span className="ml-1 text-xs text-[hsl(var(--muted-foreground))]">
                                — {s.summary}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {nodeDetail.persons.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                        Teachers & Rishis
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {nodeDetail.persons.map((p) => (
                          <span
                            key={p.name}
                            className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] text-emerald-400"
                          >
                            {p.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {nodeDetail.scripture_mentions.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                        Scripture Mentions
                      </h3>
                      <div className="space-y-1">
                        {nodeDetail.scripture_mentions.map((sm) => (
                          <div
                            key={sm.slug}
                            className="rounded-lg bg-blue-500/5 px-3 py-1.5 text-xs text-blue-300"
                          >
                            {sm.name}
                            {sm.mention_count > 0 && (
                              <span className="ml-1 text-blue-300/60">
                                ({sm.mention_count} mention{sm.mention_count !== 1 ? 's' : ''})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
