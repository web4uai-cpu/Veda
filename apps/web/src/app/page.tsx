'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ScrollReveal, ScrollRevealItem, FloatingCard, AnimatedCounter, TextReveal } from '@/components/animations';

const SacredGeometry = dynamic(() => import('@/components/three/SacredGeometry'), { ssr: false });
const ParticleField = dynamic(() => import('@/components/three/ParticleField'), { ssr: false });

const SCRIPTURES = [
  {
    name: 'Bhagavad Gita',
    sanskrit: 'भगवद्गीता',
    desc: '18 Chapters · 700 Verses',
    gradient: 'from-amber-500/10 to-orange-500/10',
    border: 'border-amber-500/20',
    glow: 'rgba(245, 158, 11, 0.1)',
  },
  {
    name: 'Upanishads',
    sanskrit: 'उपनिषद्',
    desc: '10 Principal Texts',
    gradient: 'from-blue-500/10 to-indigo-500/10',
    border: 'border-blue-500/20',
    glow: 'rgba(59, 130, 246, 0.1)',
  },
  {
    name: 'Vedas',
    sanskrit: 'वेद',
    desc: 'Rig · Yajur · Sama · Atharva',
    gradient: 'from-emerald-500/10 to-teal-500/10',
    border: 'border-emerald-500/20',
    glow: 'rgba(16, 185, 129, 0.1)',
  },
  {
    name: 'Ramayana',
    sanskrit: 'रामायण',
    desc: '7 Kandas · 24,000 Verses',
    gradient: 'from-rose-500/10 to-pink-500/10',
    border: 'border-rose-500/20',
    glow: 'rgba(244, 63, 94, 0.1)',
  },
  {
    name: 'Mahabharata',
    sanskrit: 'महाभारत',
    desc: '18 Parvas · 100,000 Verses',
    gradient: 'from-purple-500/10 to-violet-500/10',
    border: 'border-purple-500/20',
    glow: 'rgba(139, 92, 246, 0.1)',
  },
  {
    name: 'Puranas',
    sanskrit: 'पुराण',
    desc: '18 Mahapuranas',
    gradient: 'from-cyan-500/10 to-sky-500/10',
    border: 'border-cyan-500/20',
    glow: 'rgba(6, 182, 212, 0.1)',
  },
];

const CONCEPTS = [
  'Atman', 'Brahman', 'Dharma', 'Karma', 'Moksha', 'Maya',
  'Yoga', 'Bhakti', 'Jnana', 'Samsara', 'Ahimsa', 'Satya',
];

const FEATURES = [
  {
    icon: '📖',
    title: 'Scripture Explorer',
    desc: 'Browse Vedas, Upanishads, Gita, Puranas with Sanskrit, transliteration, and translations.',
  },
  {
    icon: '🕸️',
    title: 'Knowledge Graph',
    desc: 'Interactive visualization of concepts, relationships, and cross-references across scriptures.',
  },
  {
    icon: '🔬',
    title: 'Research Mode',
    desc: 'Deep comparative analysis with multi-agent reasoning and evidence-based reports.',
  },
  {
    icon: '📝',
    title: 'Citations',
    desc: 'Every answer traced to its source. Confidence scores. No hallucinations.',
  },
  {
    icon: '📤',
    title: 'Upload & Connect',
    desc: 'Upload PDFs and research papers. AI automatically links them to the knowledge graph.',
  },
  {
    icon: '🧘',
    title: 'Daily Verse',
    desc: 'Personalized daily scripture recommendations with context and commentary.',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/ask?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="relative mx-auto max-w-5xl px-4 py-8 lg:px-8 lg:py-16">
      {/* Hero Section */}
      <section className="relative mb-20 text-center">
        {/* 3D Sacred Geometry Background */}
        <div className="absolute -top-20 left-1/2 h-[500px] w-[500px] -translate-x-1/2 opacity-60">
          <SacredGeometry />
        </div>

        <div className="content-above-3d">
          {/* Badge */}
          <ScrollReveal animation="scale-up" delay={0.2}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] px-4 py-1.5 text-sm text-[hsl(var(--muted-foreground))] glass">
              <motion.span
                className="inline-block h-2 w-2 rounded-full bg-emerald-500"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              Knowledge Operating System
            </div>
          </ScrollReveal>

          {/* Title */}
          <h1 className="scripture-title mb-4 text-4xl font-bold leading-tight text-[hsl(var(--foreground))] lg:text-6xl">
            <TextReveal text="Explore the Wisdom of" delay={0.3} />
            <br />
            <span className="gradient-text-animated">
              <TextReveal text="Sanatan Dharma" delay={0.6} />
            </span>
          </h1>

          {/* Subtitle */}
          <ScrollReveal animation="fade-up" delay={0.8}>
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[hsl(var(--muted-foreground))]">
              Search scriptures, explore knowledge graphs, compare philosophies, and research with
              AI-powered citations. Every answer is traceable to its source.
            </p>
          </ScrollReveal>

          {/* Search Bar */}
          <ScrollReveal animation="scale-up" delay={1}>
            <div className="mx-auto max-w-2xl">
              <div className="group relative">
                <motion.div
                  className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[hsl(var(--primary))]/20 via-[hsl(var(--secondary))]/10 to-[hsl(var(--primary))]/20 opacity-0 blur-xl transition-opacity duration-500 group-focus-within:opacity-100"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <div className="relative flex items-center overflow-hidden rounded-2xl border border-[hsl(var(--border))] glass transition-all duration-300 focus-within:border-[hsl(var(--primary))]/40 focus-within:shadow-[0_0_30px_rgba(201,122,36,0.1)]">
                  <span className="pl-5 text-xl text-[hsl(var(--muted-foreground))]">🔍</span>
                  <input
                    id="search-home"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                    placeholder="Ask about Dharma, Karma, Moksha, Atman..."
                    className="glow-input flex-1 bg-transparent px-4 py-4 text-base text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground))]"
                  />
                  <button
                    id="search-submit"
                    onClick={handleSearch}
                    className="shimmer-btn mr-2 rounded-xl bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(32,80%,55%)] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-[0_0_20px_rgba(201,122,36,0.3)]"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Quick Access Grid */}
      <section className="mb-20">
        <ScrollReveal animation="slide-right">
          <h2 className="mb-6 text-xl font-semibold text-[hsl(var(--foreground))]">
            Explore Scriptures
          </h2>
        </ScrollReveal>

        <ScrollReveal stagger staggerDelay={0.08} className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {SCRIPTURES.map((scripture) => (
            <ScrollRevealItem key={scripture.name} animation="fade-up">
              <FloatingCard
                className={`knowledge-card group border ${scripture.border} bg-gradient-to-br ${scripture.gradient}`}
                tiltMax={6}
              >
                <a
                  href={`/scriptures/${scripture.name.toLowerCase().replace(/\s/g, '-')}`}
                  id={`scripture-${scripture.name.toLowerCase().replace(/\s/g, '-')}`}
                  className="block"
                >
                  <p className="sanskrit mb-1 text-lg text-[hsl(var(--muted-foreground))]">
                    {scripture.sanskrit}
                  </p>
                  <h3 className="scripture-title text-lg font-semibold text-[hsl(var(--foreground))] transition-colors group-hover:text-[hsl(var(--primary))]">
                    {scripture.name}
                  </h3>
                  <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{scripture.desc}</p>
                </a>
              </FloatingCard>
            </ScrollRevealItem>
          ))}
        </ScrollReveal>
      </section>

      {/* Core Concepts */}
      <section className="mb-20">
        <ScrollReveal animation="slide-right">
          <h2 className="mb-6 text-xl font-semibold text-[hsl(var(--foreground))]">
            Core Concepts
          </h2>
        </ScrollReveal>

        <ScrollReveal stagger staggerDelay={0.05} className="flex flex-wrap gap-3">
          {CONCEPTS.map((concept) => (
            <ScrollRevealItem key={concept} animation="scale-up">
              <motion.a
                href={`/concepts/${concept.toLowerCase()}`}
                id={`concept-${concept.toLowerCase()}`}
                className="rounded-full border border-[hsl(var(--border))] px-4 py-2 text-sm font-medium text-[hsl(var(--foreground))] glass transition-all duration-200"
                whileHover={{
                  borderColor: 'hsl(32, 76%, 52%)',
                  backgroundColor: 'rgba(201, 122, 36, 0.08)',
                  scale: 1.05,
                  y: -2,
                }}
                whileTap={{ scale: 0.95 }}
              >
                {concept}
              </motion.a>
            </ScrollRevealItem>
          ))}
        </ScrollReveal>
      </section>

      {/* Features Grid */}
      <section className="mb-20">
        <ScrollReveal animation="slide-right">
          <h2 className="mb-6 text-xl font-semibold text-[hsl(var(--foreground))]">
            Platform Capabilities
          </h2>
        </ScrollReveal>

        <ScrollReveal stagger staggerDelay={0.1} className="grid gap-4 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <ScrollRevealItem key={feature.title} animation="fade-up">
              <FloatingCard className="knowledge-card" tiltMax={5}>
                <motion.span
                  className="mb-3 block text-2xl"
                  whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  {feature.icon}
                </motion.span>
                <h3 className="mb-1 text-base font-semibold text-[hsl(var(--foreground))]">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                  {feature.desc}
                </p>
              </FloatingCard>
            </ScrollRevealItem>
          ))}
        </ScrollReveal>
      </section>

      {/* Stats Bar */}
      <ScrollReveal animation="fade-up">
        <section className="mb-20 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Verses', value: 100000, suffix: '+' },
            { label: 'Scriptures', value: 28, suffix: '' },
            { label: 'Concepts', value: 150, suffix: '+' },
            { label: 'Connections', value: 5000, suffix: '+' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl p-6 text-center glass">
              <div className="scripture-title text-3xl font-bold text-[hsl(var(--primary))]">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} duration={2.5} />
              </div>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{stat.label}</p>
            </div>
          ))}
        </section>
      </ScrollReveal>

      {/* Philosophy Banner */}
      <ScrollReveal animation="scale-up">
        <section className="relative overflow-hidden rounded-[20px] p-8 text-center lg:p-12">
          {/* Animated gradient background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--secondary))] via-[hsl(var(--primary))]/80 to-[hsl(var(--secondary))]"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            style={{ backgroundSize: '200% 200%' }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          <div className="relative z-10 text-white">
            <motion.p
              className="sanskrit mb-2 text-lg opacity-80"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.8 }}
              transition={{ delay: 0.2 }}
            >
              ज्ञानं परमं बलम्
            </motion.p>
            <p className="mb-2 text-sm italic opacity-60">Jñānaṁ Paramaṁ Balam</p>
            <p className="text-xl font-semibold">&ldquo;Knowledge is the Supreme Power&rdquo;</p>
            <p className="mt-4 text-sm opacity-60">
              Explore Knowledge · Understand Context · Follow Sources · Discover Dharma
            </p>
          </div>
        </section>
      </ScrollReveal>

      {/* Ambient Particles (behind content) */}
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-30">
        <ParticleField count={80} />
      </div>
    </div>
  );
}
