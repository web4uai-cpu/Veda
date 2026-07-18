/**
 * Conversation store — the ChatGPT-style thread model.
 *
 * Local-only by design: history lives in localStorage, never on the server.
 * Deliberately mirrors apps/mobile/src/store/chat.ts action-for-action so the
 * two surfaces behave identically and a backend can slot in behind either.
 */
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import {
  api,
  VedaApiRequestError,
  type Citation,
  type EvidencePacket,
  type SearchMode,
} from '@/lib/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'error';
  text: string;
  citations?: Citation[];
  evidence?: EvidencePacket[];
  confidence?: number;
  model?: string;
  queryTimeMs?: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

/** Oldest conversations are evicted past this. */
const MAX_CONVERSATIONS = 50;
const TITLE_MAX = 48;

interface ChatState {
  conversations: Record<string, Conversation>;
  order: string[];
  activeId: string | null;
  thinking: boolean;
  /** False until localStorage has rehydrated; gates SSR-unsafe rendering. */
  hydrated: boolean;
  markHydrated: () => void;
  newChat: () => void;
  send: (query: string, mode?: SearchMode) => Promise<void>;
  selectChat: (id: string) => void;
  deleteChat: (id: string) => void;
  renameChat: (id: string, title: string) => void;
  clearAll: () => void;
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function titleFrom(query: string): string {
  const clean = query.trim().replace(/\s+/g, ' ');
  return clean.length > TITLE_MAX ? `${clean.slice(0, TITLE_MAX - 1)}…` : clean;
}

export const useChat = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: {},
      order: [],
      activeId: null,
      thinking: false,
      hydrated: false,
      markHydrated: () => set({ hydrated: true }),

      // No record is created here. An empty conversation would litter the
      // sidebar, so the thread only materialises once a message is actually sent.
      newChat: () => set({ activeId: null }),

      selectChat: (id) => set({ activeId: id }),

      renameChat: (id, title) =>
        set((s) => {
          const conv = s.conversations[id];
          if (!conv) return s;
          return {
            conversations: { ...s.conversations, [id]: { ...conv, title: titleFrom(title) } },
          };
        }),

      deleteChat: (id) =>
        set((s) => {
          const conversations = { ...s.conversations };
          delete conversations[id];
          return {
            conversations,
            order: s.order.filter((x) => x !== id),
            // Deleting the open thread drops us onto a fresh chat rather than
            // leaving the UI pointed at a conversation that no longer exists.
            activeId: s.activeId === id ? null : s.activeId,
          };
        }),

      clearAll: () => set({ conversations: {}, order: [], activeId: null }),

      send: async (query, mode = 'quick') => {
        const q = query.trim();
        if (!q || get().thinking) return;

        const now = Date.now();
        let id = get().activeId;

        // First message of a new thread creates (and titles) the conversation.
        if (!id || !get().conversations[id]) {
          id = newId('cnv');
          set((s) => {
            const order = [id!, ...s.order].slice(0, MAX_CONVERSATIONS);
            const conversations = { ...s.conversations };
            conversations[id!] = {
              id: id!,
              title: titleFrom(q),
              messages: [],
              createdAt: now,
              updatedAt: now,
            };
            // Drop any conversation evicted by the cap.
            for (const key of Object.keys(conversations)) {
              if (!order.includes(key)) delete conversations[key];
            }
            return { conversations, order, activeId: id };
          });
        }

        const convId = id;
        const append = (msg: ChatMessage) =>
          set((s) => {
            const conv = s.conversations[convId];
            if (!conv) return s;
            return {
              conversations: {
                ...s.conversations,
                [convId]: { ...conv, messages: [...conv.messages, msg], updatedAt: Date.now() },
              },
              // Touching a thread floats it to the top of Recent.
              order: [convId, ...s.order.filter((x) => x !== convId)],
            };
          });

        append({ id: newId('u'), role: 'user', text: q });
        set({ thinking: true });

        try {
          const res = await api.ask({ query: q, mode, include_evidence: true });
          append({
            id: newId('a'),
            role: 'assistant',
            text: res.answer,
            citations: res.citations,
            evidence: res.evidence,
            confidence: res.confidence,
            model: res.model_used,
            queryTimeMs: res.query_time_ms,
          });
        } catch (e) {
          const message =
            e instanceof VedaApiRequestError && e.status === 429
              ? 'You are asking a little too fast — VEDA allows 10 questions per minute. Take a breath and try again.'
              : 'VEDA could not answer right now. Please try again.';
          append({ id: newId('e'), role: 'error', text: message });
        } finally {
          set({ thinking: false });
        }
      },
    }),
    {
      name: 'veda-chat',
      storage: createJSONStorage(() => localStorage),
      // activeId and thinking are session state — a cold start should open a
      // fresh composer, not drop the user back mid-thread.
      partialize: (s) => ({ conversations: s.conversations, order: s.order }),
      // The sidebar must not render persisted rows during SSR/first paint or
      // React will flag a hydration mismatch; components gate on `hydrated`.
      onRehydrateStorage: () => (state) => state?.markHydrated(),
    },
  ),
);

// Stable references. zustand v5 compares selector output with Object.is, so a
// fresh [] or a fresh .map() result on every call re-renders forever.
const NO_MESSAGES: ChatMessage[] = [];
const NO_CHATS: Conversation[] = [];

/** Messages of the open thread, or [] when composing a new one. */
export function useActiveMessages(): ChatMessage[] {
  return useChat((s) =>
    s.activeId ? (s.conversations[s.activeId]?.messages ?? NO_MESSAGES) : NO_MESSAGES,
  );
}

/** Conversations in most-recent-first order, ready for the sidebar list. */
export function useRecentChats(): Conversation[] {
  return useChat(
    useShallow((s) =>
      s.hydrated
        ? (s.order.map((id) => s.conversations[id]).filter(Boolean) as Conversation[])
        : NO_CHATS,
    ),
  );
}
