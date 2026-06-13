import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Knowledge Map — Explore the Dharma Graph',
  description:
    'Interactive knowledge graph visualization of concepts, scriptures, and relationships across Sanatan Dharma.',
};

export default function GraphPage() {
  return (
    <div className="flex h-[calc(100vh-64px)] flex-col lg:h-screen">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 lg:px-6">
        <div>
          <h1 className="text-lg font-semibold text-[hsl(var(--foreground))]">Knowledge Map</h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Interactive graph of Dharma concepts and relationships
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            id="graph-filter"
            className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm text-[hsl(var(--foreground))]"
          >
            <option value="all">All Nodes</option>
            <option value="concepts">Concepts</option>
            <option value="scriptures">Scriptures</option>
            <option value="people">People</option>
            <option value="schools">Schools</option>
          </select>
          <button className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]">
            Reset View
          </button>
        </div>
      </div>

      {/* Graph Canvas */}
      <div className="relative flex-1 bg-[hsl(var(--background))]">
        {/* Placeholder for React Flow — Phase 14 */}
        <div className="flex h-full flex-col items-center justify-center">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))]/10 to-[hsl(var(--secondary))]/10">
              <span className="text-4xl">🕸️</span>
            </div>
            <h2 className="scripture-title mb-2 text-2xl font-bold text-[hsl(var(--foreground))]">
              Knowledge Graph
            </h2>
            <p className="max-w-md text-sm text-[hsl(var(--muted-foreground))]">
              Interactive visualization powered by React Flow + Neo4j.
              This is a Phase 14 feature — currently showing a preview layout.
            </p>
          </div>

          {/* Preview nodes */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              { name: 'Brahman', type: 'concept', size: 'lg' },
              { name: 'Atman', type: 'concept', size: 'lg' },
              { name: 'Moksha', type: 'concept', size: 'md' },
              { name: 'Karma', type: 'concept', size: 'md' },
              { name: 'Dharma', type: 'concept', size: 'md' },
              { name: 'Gita', type: 'scripture', size: 'sm' },
              { name: 'Katha Up.', type: 'scripture', size: 'sm' },
              { name: 'Advaita', type: 'school', size: 'sm' },
            ].map((node) => (
              <div
                key={node.name}
                className={`flex items-center justify-center rounded-full border-2 font-medium transition-transform hover:scale-110 ${
                  node.type === 'concept'
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
                    : node.type === 'scripture'
                      ? 'border-[hsl(var(--secondary))] bg-[hsl(var(--secondary))]/10 text-[hsl(var(--secondary))]'
                      : 'border-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))]/50 text-[hsl(var(--muted-foreground))]'
                } ${
                  node.size === 'lg'
                    ? 'h-20 w-20 text-sm'
                    : node.size === 'md'
                      ? 'h-16 w-16 text-xs'
                      : 'h-14 w-14 text-[10px]'
                }`}
              >
                {node.name}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-8 flex gap-6 text-xs text-[hsl(var(--muted-foreground))]">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[hsl(var(--primary))]" />
              Concept
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[hsl(var(--secondary))]" />
              Scripture
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[hsl(var(--muted-foreground))]" />
              School
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
