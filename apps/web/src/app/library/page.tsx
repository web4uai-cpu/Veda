'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ScrollReveal, TextReveal } from '@/components/animations';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Tab config
// ---------------------------------------------------------------------------

const TABS = [
  { label: 'Bookmarks', icon: '🔖' },
  { label: 'Notes', icon: '📝' },
  { label: 'Collections', icon: '📂' },
  { label: 'Uploads', icon: '📤' },
  { label: 'Reports', icon: '📊' },
];

const TARGET_STYLES: Record<string, string> = {
  verse: 'bg-amber-500/15 text-amber-400',
  concept: 'bg-blue-500/15 text-blue-400',
  scripture: 'bg-emerald-500/15 text-emerald-400',
};

const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-emerald-500/15 text-emerald-400',
  processing: 'bg-amber-500/15 text-amber-400',
  pending: 'bg-amber-500/15 text-amber-400',
  error: 'bg-red-500/15 text-red-400',
  failed: 'bg-red-500/15 text-red-400',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function TabSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="h-20 animate-pulse rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/10"
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function LibraryPage() {
  const { user, loading: authLoading } = useAuthContext();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);

  // Note form
  const [noteForm, setNoteForm] = useState<{
    open: boolean;
    editId: string | null;
    title: string;
    content: string;
    tags: string;
  }>({ open: false, editId: null, title: '', content: '', tags: '' });

  // Collection form
  const [colForm, setColForm] = useState<{
    open: boolean;
    editId: string | null;
    name: string;
    description: string;
  }>({ open: false, editId: null, name: '', description: '' });

  // Expanded collection
  const [expandedCol, setExpandedCol] = useState<string | null>(null);

  // Note search
  const [noteSearch, setNoteSearch] = useState('');

  // Per-tab server state — cached by TanStack Query, refetched on
  // invalidation after mutations. Only the active tab's query runs.
  const signedIn = !!user;
  const bookmarksQ = useQuery({
    queryKey: ['library', 'bookmarks'],
    queryFn: () => api.getBookmarks(),
    enabled: signedIn && activeTab === 0,
  });
  const notesQ = useQuery({
    queryKey: ['library', 'notes', noteSearch],
    queryFn: () => api.getNotes(noteSearch || undefined),
    enabled: signedIn && activeTab === 1,
  });
  const collectionsQ = useQuery({
    queryKey: ['library', 'collections'],
    queryFn: () => api.getCollections(),
    enabled: signedIn && activeTab === 2,
  });
  const uploadsQ = useQuery({
    queryKey: ['library', 'uploads'],
    queryFn: () => api.getMyUploads(),
    enabled: signedIn && activeTab === 3,
  });
  const reportsQ = useQuery({
    queryKey: ['library', 'reports'],
    queryFn: () => api.getMyReports(),
    enabled: signedIn && activeTab === 4,
  });

  const bookmarks = bookmarksQ.data?.bookmarks ?? [];
  const notes = notesQ.data?.notes ?? [];
  const collections = collectionsQ.data?.collections ?? [];
  const uploads = uploadsQ.data?.uploads ?? [];
  const reports = reportsQ.data?.reports ?? [];

  const tabQueries = [bookmarksQ, notesQ, collectionsQ, uploadsQ, reportsQ] as const;
  const activeQuery = tabQueries[activeTab] ?? bookmarksQ;
  const tabLoading = activeQuery.isLoading;
  const tabError = activeQuery.error
    ? activeQuery.error instanceof Error
      ? activeQuery.error.message
      : 'Failed to load data'
    : null;

  const invalidate = (key: string) =>
    queryClient.invalidateQueries({ queryKey: ['library', key] });

  // --- Auth gate ---
  if (authLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
        <div className="h-10 w-40 animate-pulse rounded bg-[hsl(var(--muted))]/40 mb-8" />
        <TabSkeleton count={4} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl glass">
            <span className="text-4xl">📚</span>
          </div>
          <h1 className="scripture-title mb-3 text-3xl font-bold text-[hsl(var(--foreground))]">
            Your Library
          </h1>
          <p className="mb-8 max-w-md text-[hsl(var(--muted-foreground))]">
            Sign in to access your bookmarks, notes, collections, and research reports.
          </p>
          <a
            href="/login"
            className="shimmer-btn rounded-xl bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(32,80%,55%)] px-8 py-3 text-sm font-semibold text-white"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // --- Action handlers ---

  async function handleDeleteBookmark(id: string) {
    await api.deleteBookmark(id);
    await invalidate('bookmarks');
  }

  async function handleSaveNote() {
    if (!noteForm.title.trim() || !noteForm.content.trim()) return;
    const tags = noteForm.tags.split(',').map((t) => t.trim()).filter(Boolean);
    if (noteForm.editId) {
      await api.updateNote(noteForm.editId, {
        title: noteForm.title,
        content: noteForm.content,
        tags,
      });
    } else {
      await api.createNote({ title: noteForm.title, content: noteForm.content, tags });
    }
    await invalidate('notes');
    setNoteForm({ open: false, editId: null, title: '', content: '', tags: '' });
  }

  async function handleDeleteNote(id: string) {
    await api.deleteNote(id);
    await invalidate('notes');
  }

  async function handleSaveCollection() {
    if (!colForm.name.trim()) return;
    if (colForm.editId) {
      await api.updateCollection(colForm.editId, {
        name: colForm.name,
        description: colForm.description || undefined,
      });
    } else {
      await api.createCollection({
        name: colForm.name,
        description: colForm.description || undefined,
      });
    }
    await invalidate('collections');
    setColForm({ open: false, editId: null, name: '', description: '' });
  }

  async function handleDeleteCollection(id: string) {
    await api.deleteCollection(id);
    await invalidate('collections');
    if (expandedCol === id) setExpandedCol(null);
  }

  async function handleRemoveCollectionItem(colId: string, itemId: string) {
    await api.removeCollectionItem(colId, itemId);
    await invalidate('collections');
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      {/* Header */}
      <div className="mb-8">
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

      {/* Tab Bar */}
      <ScrollReveal animation="scale-up" delay={0.3}>
        <div className="mb-8 flex gap-1 rounded-xl p-1 glass">
          {TABS.map((tab, i) => (
            <motion.button
              key={tab.label}
              type="button"
              onClick={() => setActiveTab(i)}
              className={`relative flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                i === activeTab
                  ? 'text-white'
                  : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {i === activeTab && (
                <motion.div
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(32,80%,55%)]"
                  layoutId="library-tab-active"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">
                <span className="mr-1.5">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </span>
            </motion.button>
          ))}
        </div>
      </ScrollReveal>

      {/* Error */}
      {tabError && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-200">
          {tabError}
          <button onClick={() => activeQuery.refetch()} className="ml-3 text-[hsl(var(--primary))] hover:underline">
            Retry
          </button>
        </div>
      )}

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {tabLoading ? (
            <TabSkeleton />
          ) : (
            <>
              {/* ============================== BOOKMARKS ============================== */}
              {activeTab === 0 && (
                bookmarks.length === 0 ? (
                  <EmptyState
                    icon="🔖"
                    title="No Bookmarks Yet"
                    desc="Bookmark verses, concepts, and scriptures as you explore."
                    actionLabel="Start Exploring"
                    actionHref="/explore"
                  />
                ) : (
                  <div className="space-y-2">
                    {bookmarks.map((bm) => (
                      <div key={bm.id} className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] px-4 py-3 glass">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${TARGET_STYLES[bm.target_type] ?? 'bg-slate-500/15 text-slate-400'}`}>
                          {bm.target_type}
                        </span>
                        <span className="flex-1 truncate text-sm text-[hsl(var(--foreground))]">{bm.target_id}</span>
                        <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{formatDate(bm.created_at)}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteBookmark(bm.id)}
                          className="shrink-0 rounded p-1 text-[hsl(var(--muted-foreground))] hover:text-red-400 transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* ============================== NOTES ============================== */}
              {activeTab === 1 && (
                <div className="space-y-4">
                  {/* Search + New */}
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        value={noteSearch}
                        onChange={(e) => setNoteSearch(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') notesQ.refetch(); }}
                        placeholder="Search notes..."
                        className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent py-2 pl-9 pr-3 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--primary))]/40 focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setNoteForm({ open: true, editId: null, title: '', content: '', tags: '' })}
                      className="shrink-0 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                    >
                      New Note
                    </button>
                  </div>

                  {/* Note Form */}
                  <AnimatePresence>
                    {noteForm.open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-xl border border-[hsl(var(--primary))]/20 bg-[hsl(var(--primary))]/5 p-4 space-y-3">
                          <input
                            type="text"
                            value={noteForm.title}
                            onChange={(e) => setNoteForm((f) => ({ ...f, title: e.target.value }))}
                            placeholder="Note title"
                            className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary))]/40"
                          />
                          <textarea
                            value={noteForm.content}
                            onChange={(e) => setNoteForm((f) => ({ ...f, content: e.target.value }))}
                            placeholder="Write your note..."
                            rows={4}
                            className="w-full resize-none rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary))]/40"
                          />
                          <input
                            type="text"
                            value={noteForm.tags}
                            onChange={(e) => setNoteForm((f) => ({ ...f, tags: e.target.value }))}
                            placeholder="Tags (comma-separated)"
                            className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary))]/40"
                          />
                          <div className="flex gap-2">
                            <button type="button" onClick={handleSaveNote} className="rounded-lg bg-[hsl(var(--primary))] px-4 py-1.5 text-sm font-medium text-white">
                              {noteForm.editId ? 'Update' : 'Save'}
                            </button>
                            <button type="button" onClick={() => setNoteForm({ open: false, editId: null, title: '', content: '', tags: '' })} className="rounded-lg border border-[hsl(var(--border))] px-4 py-1.5 text-sm text-[hsl(var(--muted-foreground))]">
                              Cancel
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Notes List */}
                  {notes.length === 0 && !noteForm.open ? (
                    <EmptyState
                      icon="📝"
                      title="No Notes Yet"
                      desc="Create notes to capture your insights and reflections."
                      actionLabel="Create First Note"
                      onAction={() => setNoteForm({ open: true, editId: null, title: '', content: '', tags: '' })}
                    />
                  ) : (
                    notes.map((note) => (
                      <div key={note.id} className="rounded-xl border border-[hsl(var(--border))] p-4 glass">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">{note.title}</h3>
                            <p className="mt-1 text-sm leading-relaxed text-[hsl(var(--muted-foreground))] line-clamp-2">{note.content}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              {note.tags.map((tag) => (
                                <span key={tag} className="rounded-full bg-[hsl(var(--primary))]/10 px-2 py-0.5 text-[10px] text-[hsl(var(--primary))]">
                                  {tag}
                                </span>
                              ))}
                              <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{formatDate(note.updated_at)}</span>
                            </div>
                          </div>
                          <div className="flex shrink-0 gap-1">
                            <button
                              type="button"
                              onClick={() => setNoteForm({
                                open: true, editId: note.id,
                                title: note.title, content: note.content,
                                tags: note.tags.join(', '),
                              })}
                              className="rounded p-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteNote(note.id)}
                              className="rounded p-1 text-[hsl(var(--muted-foreground))] hover:text-red-400 transition-colors"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ============================== COLLECTIONS ============================== */}
              {activeTab === 2 && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setColForm({ open: true, editId: null, name: '', description: '' })}
                      className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                    >
                      New Collection
                    </button>
                  </div>

                  {/* Collection Form */}
                  <AnimatePresence>
                    {colForm.open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-xl border border-[hsl(var(--primary))]/20 bg-[hsl(var(--primary))]/5 p-4 space-y-3">
                          <input
                            type="text"
                            value={colForm.name}
                            onChange={(e) => setColForm((f) => ({ ...f, name: e.target.value }))}
                            placeholder="Collection name"
                            className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary))]/40"
                          />
                          <input
                            type="text"
                            value={colForm.description}
                            onChange={(e) => setColForm((f) => ({ ...f, description: e.target.value }))}
                            placeholder="Description (optional)"
                            className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary))]/40"
                          />
                          <div className="flex gap-2">
                            <button type="button" onClick={handleSaveCollection} className="rounded-lg bg-[hsl(var(--primary))] px-4 py-1.5 text-sm font-medium text-white">
                              {colForm.editId ? 'Update' : 'Create'}
                            </button>
                            <button type="button" onClick={() => setColForm({ open: false, editId: null, name: '', description: '' })} className="rounded-lg border border-[hsl(var(--border))] px-4 py-1.5 text-sm text-[hsl(var(--muted-foreground))]">
                              Cancel
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {collections.length === 0 && !colForm.open ? (
                    <EmptyState
                      icon="📂"
                      title="No Collections Yet"
                      desc="Organize your research into themed collections."
                      actionLabel="Create First Collection"
                      onAction={() => setColForm({ open: true, editId: null, name: '', description: '' })}
                    />
                  ) : (
                    collections.map((col) => (
                      <div key={col.id} className="rounded-xl border border-[hsl(var(--border))] glass">
                        <button
                          type="button"
                          onClick={() => setExpandedCol(expandedCol === col.id ? null : col.id)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left"
                        >
                          <svg
                            className={`h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))] transition-transform ${expandedCol === col.id ? 'rotate-90' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">{col.name}</h3>
                            {col.description && (
                              <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{col.description}</p>
                            )}
                          </div>
                          <span className="shrink-0 rounded-full bg-[hsl(var(--muted))]/30 px-2 py-0.5 text-[10px] text-[hsl(var(--muted-foreground))]">
                            {col.item_count} items
                          </span>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setColForm({ open: true, editId: col.id, name: col.name, description: col.description ?? '' }); }}
                            className="shrink-0 rounded p-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDeleteCollection(col.id); }}
                            className="shrink-0 rounded p-1 text-[hsl(var(--muted-foreground))] hover:text-red-400 transition-colors"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </button>
                        <AnimatePresence>
                          {expandedCol === col.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-[hsl(var(--border))]/30 px-4 py-3">
                                {col.items.length === 0 ? (
                                  <p className="text-xs text-[hsl(var(--muted-foreground))]">No items in this collection yet.</p>
                                ) : (
                                  <div className="space-y-1.5">
                                    {col.items.map((item) => (
                                      <div key={item.id} className="flex items-center gap-2 text-sm">
                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${TARGET_STYLES[item.item_type] ?? 'bg-slate-500/15 text-slate-400'}`}>
                                          {item.item_type}
                                        </span>
                                        <span className="flex-1 truncate text-[hsl(var(--foreground))]">{item.item_id}</span>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveCollectionItem(col.id, item.id)}
                                          className="text-[hsl(var(--muted-foreground))] hover:text-red-400"
                                        >
                                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ============================== UPLOADS ============================== */}
              {activeTab === 3 && (
                uploads.length === 0 ? (
                  <EmptyState
                    icon="📤"
                    title="No Uploads Yet"
                    desc="Upload PDFs and documents to build your personal knowledge base."
                    actionLabel="Learn More"
                    actionHref="/explore"
                  />
                ) : (
                  <div className="space-y-2">
                    {uploads.map((upl) => (
                      <div key={upl.id} className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] px-4 py-3 glass">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                          <span className="text-lg">📄</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">
                            {upl.title ?? upl.filename}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-[hsl(var(--muted-foreground))]">
                            <span>{upl.file_type.toUpperCase()}</span>
                            {upl.size_bytes && <span>{formatBytes(upl.size_bytes)}</span>}
                            <span>{upl.chunk_count} chunks</span>
                          </div>
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${STATUS_STYLES[upl.status] ?? 'bg-slate-500/15 text-slate-400'}`}>
                          {upl.status}
                        </span>
                        <span className="shrink-0 text-[10px] text-[hsl(var(--muted-foreground))]">{formatDate(upl.uploaded_at)}</span>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* ============================== REPORTS ============================== */}
              {activeTab === 4 && (
                reports.length === 0 ? (
                  <EmptyState
                    icon="📊"
                    title="No Research Reports Yet"
                    desc="Your research reports will appear here after using the Research page."
                    actionLabel="Start Researching"
                    actionHref="/research"
                  />
                ) : (
                  <div className="space-y-3">
                    {reports.map((rpt) => (
                      <div key={rpt.id} className="rounded-xl border border-[hsl(var(--border))] p-4 glass">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">{rpt.title}</h3>
                            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))] line-clamp-1">{rpt.query}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${STATUS_STYLES[rpt.status] ?? 'bg-slate-500/15 text-slate-400'}`}>
                                {rpt.status}
                              </span>
                              {rpt.evidence_count > 0 && (
                                <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                                  {rpt.evidence_count} sources
                                </span>
                              )}
                              <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{formatDate(rpt.created_at)}</span>
                            </div>
                          </div>
                          <span className="shrink-0 rounded-full bg-[hsl(var(--muted))]/30 px-2 py-0.5 text-[10px] capitalize text-[hsl(var(--muted-foreground))]">
                            {rpt.mode}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared Empty State
// ---------------------------------------------------------------------------

function EmptyState({
  icon,
  title,
  desc,
  actionLabel,
  actionHref,
  onAction,
}: {
  icon: string;
  title: string;
  desc: string;
  actionLabel: string;
  actionHref?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <motion.div
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl glass"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="text-3xl">{icon}</span>
      </motion.div>
      <h2 className="mb-2 text-xl font-semibold text-[hsl(var(--foreground))]">{title}</h2>
      <p className="mb-6 max-w-md text-sm text-[hsl(var(--muted-foreground))]">{desc}</p>
      {actionHref ? (
        <a
          href={actionHref}
          className="shimmer-btn rounded-xl bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(32,80%,55%)] px-6 py-2.5 text-sm font-semibold text-white"
        >
          {actionLabel}
        </a>
      ) : onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="shimmer-btn rounded-xl bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(32,80%,55%)] px-6 py-2.5 text-sm font-semibold text-white"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
