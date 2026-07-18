'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat, useRecentChats } from '@/stores/chat';

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d < 7 ? `${d}d ago` : new Date(ts).toLocaleDateString();
}

/**
 * The sidebar's conversation list. Renders nothing until the store rehydrates
 * from localStorage, so the server and first client paint agree.
 */
export function RecentChats({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const chats = useRecentChats();
  const activeId = useChat((s) => s.activeId);
  const selectChat = useChat((s) => s.selectChat);
  const deleteChat = useChat((s) => s.deleteChat);
  const renameChat = useChat((s) => s.renameChat);

  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: string; value: string } | null>(null);

  if (chats.length === 0) return null;

  function open(id: string) {
    selectChat(id);
    router.push('/ask');
    onNavigate?.();
  }

  function commitRename() {
    if (editing?.value.trim()) renameChat(editing.id, editing.value);
    setEditing(null);
  }

  return (
    <div className="mt-4 border-t border-[hsl(var(--border))] pt-4">
      <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
        Recent
      </p>

      <div className="space-y-0.5">
        <AnimatePresence initial={false}>
          {chats.map((chat) => {
            const isActive = chat.id === activeId;

            if (editing?.id === chat.id) {
              return (
                <div key={chat.id} className="px-3 py-1.5">
                  <input
                    autoFocus
                    value={editing.value}
                    onChange={(e) => setEditing({ id: chat.id, value: e.target.value })}
                    onBlur={commitRename}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename();
                      if (e.key === 'Escape') setEditing(null);
                    }}
                    className="w-full rounded-lg border border-[hsl(var(--primary))]/40 bg-transparent px-2 py-1 text-sm text-[hsl(var(--foreground))] outline-none"
                  />
                </div>
              );
            }

            return (
              <motion.div
                key={chat.id}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="group relative"
              >
                <button
                  type="button"
                  onClick={() => open(chat.id)}
                  className={`relative flex w-full items-center gap-2 rounded-xl px-3 py-2 pr-8 text-left text-sm transition-colors ${
                    isActive
                      ? 'text-[hsl(var(--primary))]'
                      : 'text-[hsl(var(--muted-foreground))] hover:bg-white/5 hover:text-[hsl(var(--foreground))]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[hsl(var(--primary))]"
                      layoutId="sidebar-chat-active"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="min-w-0 flex-1 truncate">{chat.title}</span>
                  <span className="shrink-0 text-[10px] text-[hsl(var(--muted-foreground))]">
                    {timeAgo(chat.updatedAt)}
                  </span>
                </button>

                <button
                  type="button"
                  aria-label="Chat options"
                  onClick={() => setMenuFor(menuFor === chat.id ? null : chat.id)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-[hsl(var(--muted-foreground))] opacity-0 transition-opacity hover:text-[hsl(var(--foreground))] group-hover:opacity-100"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="5" cy="12" r="1.6" />
                    <circle cx="12" cy="12" r="1.6" />
                    <circle cx="19" cy="12" r="1.6" />
                  </svg>
                </button>

                {menuFor === chat.id && (
                  <div className="absolute right-2 top-9 z-40 w-32 overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing({ id: chat.id, value: chat.title });
                        setMenuFor(null);
                      }}
                      className="block w-full px-3 py-2 text-left text-xs text-[hsl(var(--foreground))] hover:bg-white/5"
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteChat(chat.id);
                        setMenuFor(null);
                      }}
                      className="block w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Saffron "New Chat" button that always lands on /ask with an empty thread. */
export function NewChatButton({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const newChat = useChat((s) => s.newChat);

  return (
    <motion.button
      type="button"
      onClick={() => {
        newChat();
        router.push('/ask');
        onNavigate?.();
      }}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-[hsl(var(--primary))]/40 bg-[hsl(var(--primary))]/10 px-3 py-2.5 text-sm font-medium text-[hsl(var(--primary))] transition-colors hover:bg-[hsl(var(--primary))]/15"
      whileTap={{ scale: 0.97 }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
      New Chat
    </motion.button>
  );
}
