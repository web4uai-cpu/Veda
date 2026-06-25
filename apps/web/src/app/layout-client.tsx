'use client';

import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { SplashScreen } from '@/components/splash/SplashScreen';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { UserMenu } from '@/components/auth/UserMenu';

const NAV_ITEMS = [
  { icon: '🔍', label: 'Explore', href: '/explore' },
  { icon: '💬', label: 'Ask VEDA', href: '/ask' },
  { icon: '📖', label: 'Scriptures', href: '/scriptures' },
  { icon: '🕸️', label: 'Knowledge Map', href: '/graph' },
  { icon: '🔬', label: 'Research', href: '/research' },
  { icon: '📚', label: 'Library', href: '/library' },
];

const MOBILE_NAV = [
  { icon: '🏠', label: 'Home', href: '/' },
  { icon: '🔍', label: 'Explore', href: '/explore' },
  { icon: '💬', label: 'Ask', href: '/ask' },
  { icon: '📚', label: 'Library', href: '/library' },
  { icon: '🕸️', label: 'Graph', href: '/graph' },
];

export function LayoutClient({ children }: { children: ReactNode }) {
  const [splashDone, setSplashDone] = useState(false);
  const pathname = usePathname();

  return (
    <AuthProvider>
      {/* Splash Screen */}
      {!splashDone && (
        <SplashScreen onComplete={() => setSplashDone(true)} duration={3500} />
      )}

      {/* Main App */}
      <motion.div
        className="flex min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: splashDone ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Sidebar Navigation */}
        <aside className="hidden lg:flex lg:w-[280px] lg:flex-col lg:border-r lg:border-[hsl(var(--border))] lg:bg-[hsl(var(--card))]/50 lg:backdrop-blur-xl">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-[hsl(var(--border))] px-6">
            <motion.div
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(32,90%,60%)]"
              animate={{
                boxShadow: [
                  '0 0 12px rgba(201, 122, 36, 0.2)',
                  '0 0 20px rgba(201, 122, 36, 0.4)',
                  '0 0 12px rgba(201, 122, 36, 0.2)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="sanskrit text-lg font-bold text-white">व</span>
            </motion.div>
            <div>
              <h1 className="scripture-title text-xl font-bold text-[hsl(var(--foreground))]">
                VEDA
              </h1>
              <p className="text-[10px] tracking-widest text-[hsl(var(--muted-foreground))] uppercase">
                Knowledge System
              </p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 space-y-1 px-3 py-4" role="navigation">
            {NAV_ITEMS.map((item, i) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <motion.a
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-[hsl(var(--primary))]'
                      : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i + 0.5, duration: 0.4 }}
                  whileHover={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    x: 4,
                    transition: { duration: 0.2 },
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-[hsl(var(--primary))]"
                      layoutId="sidebar-active"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <motion.span
                    className="text-lg"
                    whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.3 }}
                  >
                    {item.icon}
                  </motion.span>
                  {item.label}
                </motion.a>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="border-t border-[hsl(var(--border))] px-3 py-3">
            <UserMenu />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Mobile Header */}
          <header className="sticky top-0 z-20 flex h-16 items-center border-b border-[hsl(var(--border))] px-4 backdrop-blur-xl lg:hidden"
            style={{ backgroundColor: 'rgba(8, 8, 8, 0.8)' }}
          >
            <div className="flex items-center gap-2">
              <motion.div
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(32,90%,60%)]"
                animate={{
                  boxShadow: [
                    '0 0 8px rgba(201, 122, 36, 0.2)',
                    '0 0 16px rgba(201, 122, 36, 0.4)',
                    '0 0 8px rgba(201, 122, 36, 0.2)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <span className="sanskrit text-base font-bold text-white">व</span>
              </motion.div>
              <span className="scripture-title text-lg font-bold">VEDA</span>
            </div>
            <div className="ml-auto">
              <UserMenu compact />
            </div>
          </header>

          {/* Page Transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.25, 0.8, 0.25, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-[hsl(var(--border))] backdrop-blur-xl lg:hidden"
        style={{ backgroundColor: 'rgba(8, 8, 8, 0.9)' }}
      >
        {MOBILE_NAV.map((item) => {
          const isActive = pathname === item.href;
          return (
            <motion.a
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 transition-colors ${
                isActive
                  ? 'text-[hsl(var(--primary))]'
                  : 'text-[hsl(var(--muted-foreground))]'
              }`}
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.1 }}
            >
              <motion.span
                className="text-xl"
                animate={isActive ? { y: [0, -3, 0] } : {}}
                transition={{ duration: 0.3 }}
              >
                {item.icon}
              </motion.span>
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  className="absolute bottom-1 h-[2px] w-6 rounded-full bg-[hsl(var(--primary))]"
                  layoutId="mobile-active"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.a>
          );
        })}
      </nav>
    </AuthProvider>
  );
}
