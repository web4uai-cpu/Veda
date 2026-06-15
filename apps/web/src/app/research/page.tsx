'use client';

import { motion } from 'framer-motion';
import { ScrollReveal, ScrollRevealItem, FloatingCard, TextReveal } from '@/components/animations';

const TEMPLATES = [
  {
    title: 'Comparative Philosophy',
    desc: 'Compare interpretations of key concepts across Advaita, Vishishtadvaita, and Dvaita schools',
    agents: ['Vedanta Agent', 'Citation Agent'],
    icon: '⚖️',
  },
  {
    title: 'Scripture Cross-Reference',
    desc: 'Find parallel passages and shared themes between the Upanishads and the Bhagavad Gita',
    agents: ['Upanishad Agent', 'Graph Agent'],
    icon: '🔗',
  },
  {
    title: 'Concept Deep-Dive',
    desc: 'Trace the evolution of a concept (e.g. Dharma) across all scriptural sources',
    agents: ['Veda Agent', 'Purana Agent', 'Research Agent'],
    icon: '🔬',
  },
  {
    title: 'Sanskrit Analysis',
    desc: 'Analyze root meanings, grammar, and semantic evolution of Sanskrit terms',
    agents: ['Sanskrit Agent', 'Citation Agent'],
    icon: '📝',
  },
];

export default function ResearchPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <div className="mb-10">
        <ScrollReveal animation="fade-up">
          <h1 className="scripture-title mb-2 text-3xl font-bold text-[hsl(var(--foreground))]">
            <TextReveal text="Research" />
          </h1>
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={0.2}>
          <p className="text-lg text-[hsl(var(--muted-foreground))]">
            Deep comparative analysis powered by multi-agent AI reasoning
          </p>
        </ScrollReveal>
      </div>

      {/* New Research */}
      <ScrollReveal animation="scale-up" delay={0.3}>
        <div className="mb-12 rounded-[20px] p-8 glass">
          <h2 className="mb-4 text-lg font-semibold text-[hsl(var(--foreground))]">
            New Research Query
          </h2>
          <motion.textarea
            id="research-input"
            rows={3}
            placeholder="e.g. Compare the concept of Atman in Advaita Vedanta vs Vishishtadvaita, with evidence from primary sources..."
            className="glow-input mb-4 w-full resize-none rounded-xl border border-[hsl(var(--border))] bg-transparent p-4 text-base text-[hsl(var(--foreground))] outline-none transition-all focus:border-[hsl(var(--primary))]/40 placeholder:text-[hsl(var(--muted-foreground))]"
            whileFocus={{
              boxShadow: '0 0 30px rgba(201, 122, 36, 0.08)',
            }}
          />
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {[
                { label: 'Multi-Agent', color: 'var(--primary)' },
                { label: 'Citations Required', color: 'var(--secondary)' },
                { label: 'Evidence-Based', color: '155 80% 40%' },
              ].map((tag, i) => (
                <motion.span
                  key={tag.label}
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: `hsl(${typeof tag.color === 'string' && tag.color.startsWith('var') ? tag.color.replace('var(--', '').replace(')', '') : tag.color} / 0.1)`,
                    color: `hsl(${typeof tag.color === 'string' && tag.color.startsWith('var') ? tag.color.replace('var(--', '').replace(')', '') : tag.color})`,
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  {tag.label}
                </motion.span>
              ))}
            </div>
            <motion.button
              id="research-submit"
              className="shimmer-btn rounded-xl bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(32,80%,55%)] px-6 py-2.5 text-sm font-semibold text-white"
              whileHover={{
                scale: 1.03,
                boxShadow: '0 0 25px rgba(201, 122, 36, 0.3)',
              }}
              whileTap={{ scale: 0.97 }}
            >
              Start Research
            </motion.button>
          </div>
        </div>
      </ScrollReveal>

      {/* Research Templates */}
      <ScrollReveal animation="slide-right">
        <h2 className="mb-4 text-lg font-semibold text-[hsl(var(--foreground))]">
          Research Templates
        </h2>
      </ScrollReveal>

      <ScrollReveal stagger staggerDelay={0.1} className="grid gap-4 sm:grid-cols-2">
        {TEMPLATES.map((template) => (
          <ScrollRevealItem key={template.title} animation="fade-up">
            <FloatingCard className="knowledge-card group cursor-pointer" tiltMax={5}>
              <motion.span
                className="mb-2 block text-2xl"
                whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.4 }}
              >
                {template.icon}
              </motion.span>
              <h3 className="mb-1 text-base font-semibold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors">
                {template.title}
              </h3>
              <p className="mb-3 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                {template.desc}
              </p>
              <div className="flex flex-wrap gap-1">
                {template.agents.map((agent) => (
                  <motion.span
                    key={agent}
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--muted-foreground))] glass"
                    animate={{
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: Math.random() * 2 }}
                  >
                    {agent}
                  </motion.span>
                ))}
              </div>
            </FloatingCard>
          </ScrollRevealItem>
        ))}
      </ScrollReveal>
    </div>
  );
}
