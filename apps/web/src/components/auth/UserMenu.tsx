'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { displayNameFor } from '@/lib/user';

export function UserMenu({ compact = false }: { compact?: boolean }) {
  const { user, loading, signOut } = useAuthContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (loading) return null;

  if (!user) {
    return (
      <a
        href="/login"
        className={`flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(32,80%,55%)] font-semibold text-white transition-all hover:shadow-[0_0_16px_rgba(201,122,36,0.3)] ${
          compact ? 'h-9 w-9 text-sm' : 'px-4 py-2.5 text-sm'
        }`}
      >
        {compact ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        ) : (
          'Sign In'
        )}
      </a>
    );
  }

  const displayName = displayNameFor(user);
  const initial = displayName[0]!.toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-3 rounded-xl transition-colors hover:bg-[hsl(var(--accent))] ${
          compact ? 'p-1' : 'w-full px-3 py-2.5'
        }`}
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={displayName}
            className="h-8 w-8 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(32,80%,55%)] text-sm font-bold text-white">
            {initial}
          </div>
        )}
        {!compact && (
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">{displayName}</p>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))] truncate">{user.email}</p>
          </div>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className={`absolute z-50 w-48 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1 shadow-xl ${
              compact ? 'bottom-full right-0 mb-2' : 'bottom-full left-0 mb-2'
            }`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
          >
            <div className="px-3 py-2 border-b border-[hsl(var(--border))]">
              <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">{displayName}</p>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))] truncate">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={async () => { await signOut(); setOpen(false); }}
              className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
