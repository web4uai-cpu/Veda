'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ScrollReveal, ScrollRevealItem, FloatingCard, TextReveal } from '@/components/animations';

const ParticleField = dynamic(() => import('@/components/three/ParticleField'), { ssr: false });

const categories = [
  {
    title: 'Core Concepts',
    icon: '💡',
    items: [
      { name: 'Atman', desc: 'The eternal Self', slug: 'atman' },
      { name: 'Brahman', desc: 'The ultimate reality', slug: 'brahman' },
      { name: 'Dharma', desc: 'Cosmic law and duty', slug: 'dharma' },
      { name: 'Karma', desc: 'Action and consequence', slug: 'karma' },
      { name: 'Moksha', desc: 'Liberation from samsara', slug: 'moksha' },
      { name: 'Maya', desc: 'Cosmic illusion', slug: 'maya' },
    ],
  },
  {
    title: 'Yoga Paths',
    icon: '🧘',
    items: [
      { name: 'Karma Yoga', desc: 'Path of selfless action', slug: 'karma-yoga' },
      { name: 'Jnana Yoga', desc: 'Path of knowledge', slug: 'jnana-yoga' },
      { name: 'Bhakti Yoga', desc: 'Path of devotion', slug: 'bhakti-yoga' },
      { name: 'Raja Yoga', desc: 'Path of meditation', slug: 'raja-yoga' },
    ],
  },
  {
    title: 'Philosophical Schools',
    icon: '🏛️',
    items: [
      { name: 'Advaita', desc: 'Non-dualism (Shankara)', slug: 'advaita' },
      { name: 'Vishishtadvaita', desc: 'Qualified non-dualism (Ramanuja)', slug: 'vishishtadvaita' },
      { name: 'Dvaita', desc: 'Dualism (Madhva)', slug: 'dvaita' },
      { name: 'Sankhya', desc: 'Enumeration philosophy', slug: 'sankhya' },
      { name: 'Nyaya', desc: 'Logic and epistemology', slug: 'nyaya' },
      { name: 'Vaisheshika', desc: 'Atomistic naturalism', slug: 'vaisheshika' },
    ],
  },
];

export default function ExplorePage() {
  return (
    <div className="relative mx-auto max-w-5xl px-4 py-8 lg:px-8">
      {/* Header */}
      <div className="mb-10">
        <ScrollReveal animation="fade-up">
          <h1 className="scripture-title mb-2 text-3xl font-bold text-[hsl(var(--foreground))]">
            <TextReveal text="Explore" />
          </h1>
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={0.2}>
          <p className="text-lg text-[hsl(var(--muted-foreground))]">
            Discover the interconnected wisdom of Sanatan Dharma
          </p>
        </ScrollReveal>
      </div>

      {/* Search */}
      <ScrollReveal animation="scale-up" delay={0.3}>
        <div className="mb-12">
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[hsl(var(--muted-foreground))]">
              🔍
            </span>
            <input
              id="explore-search"
              type="text"
              placeholder="Search concepts, scriptures, people, places..."
              className="glow-input w-full rounded-2xl border border-[hsl(var(--border))] py-3.5 pl-12 pr-4 text-base text-[hsl(var(--foreground))] outline-none glass transition-all focus:border-[hsl(var(--primary))]/40 focus:shadow-[0_0_30px_rgba(201,122,36,0.08)] placeholder:text-[hsl(var(--muted-foreground))]"
            />
          </div>
        </div>
      </ScrollReveal>

      {/* Category Sections */}
      {categories.map((category, catIndex) => (
        <section key={category.title} className="mb-12">
          <ScrollReveal animation="slide-right" delay={catIndex * 0.1}>
            <div className="mb-4 flex items-center gap-2">
              <motion.span
                className="text-xl"
                whileHover={{ scale: 1.2, rotate: 10 }}
              >
                {category.icon}
              </motion.span>
              <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
                {category.title}
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal stagger staggerDelay={0.06} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {category.items.map((item) => (
              <ScrollRevealItem key={item.slug} animation="fade-up">
                <FloatingCard tiltMax={5}>
                  <a
                    href={`/concepts/${item.slug}`}
                    id={`explore-${item.slug}`}
                    className="knowledge-card group block border border-transparent transition-all hover:border-[hsl(var(--primary))]/20"
                  >
                    <h3 className="text-base font-semibold text-[hsl(var(--foreground))] transition-colors group-hover:text-[hsl(var(--primary))]">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{item.desc}</p>
                  </a>
                </FloatingCard>
              </ScrollRevealItem>
            ))}
          </ScrollReveal>
        </section>
      ))}

      {/* Ambient Particles */}
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-20">
        <ParticleField count={60} />
      </div>
    </div>
  );
}
