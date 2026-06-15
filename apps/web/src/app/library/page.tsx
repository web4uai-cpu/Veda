'use client';

import { motion } from 'framer-motion';
import { ScrollReveal, TextReveal } from '@/components/animations';

const TABS = [
  { label: 'Bookmarks', icon: '🔖' },
  { label: 'Notes', icon: '📝' },
  { label: 'Collections', icon: '📂' },
  { label: 'Uploads', icon: '📤' },
  { label: 'Reports', icon: '📊' },
];

export default function LibraryPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <div className="mb-10">
        <ScrollReveal animation="fade-up">
          <h1 className="scripture-title mb-2 text-3xl font-bold text-[hsl(var(--foreground))]">
            <TextReveal text="Library" />
          </h1>
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={0.2}>
          <p className="text-lg text-[hsl(var(--muted-foreground))]">
            Your personal knowledge collection
          </p>
        </ScrollReveal>
      </div>

      {/* Library Tabs */}
      <ScrollReveal animation="scale-up" delay={0.3}>
        <div className="mb-8 flex gap-1 rounded-xl p-1 glass">
          {TABS.map((tab, i) => (
            <motion.button
              key={tab.label}
              id={`library-tab-${tab.label.toLowerCase()}`}
              className={`relative flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                i === 0
                  ? 'text-white'
                  : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {i === 0 && (
                <motion.div
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(32,80%,55%)]"
                  layoutId="library-tab-active"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
              </span>
            </motion.button>
          ))}
        </div>
      </ScrollReveal>

      {/* Empty State */}
      <ScrollReveal animation="fade-up" delay={0.5}>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <motion.div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl glass"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-3xl">🔖</span>
          </motion.div>
          <motion.h2
            className="mb-2 text-xl font-semibold text-[hsl(var(--foreground))]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            No Bookmarks Yet
          </motion.h2>
          <motion.p
            className="mb-6 max-w-md text-sm text-[hsl(var(--muted-foreground))]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            Bookmark verses, concepts, and research findings as you explore.
            Your library will grow alongside your knowledge journey.
          </motion.p>
          <motion.a
            href="/explore"
            className="shimmer-btn rounded-xl bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(32,80%,55%)] px-6 py-2.5 text-sm font-semibold text-white"
            whileHover={{
              scale: 1.05,
              boxShadow: '0 0 25px rgba(201, 122, 36, 0.3)',
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            Start Exploring
          </motion.a>
        </div>
      </ScrollReveal>
    </div>
  );
}
