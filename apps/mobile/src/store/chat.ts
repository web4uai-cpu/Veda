/**
 * Conversation store — the ChatGPT-style thread model.
 *
 * Local-only by design: history lives in AsyncStorage, never on the server.
 * The action surface (newChat/send/selectChat/…) is deliberately the same shape
 * as the web store so a backend can slot in behind it later without the UI
 * changing.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, ApiError, type Citation, type EvidencePacket } from '@/lib/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'error';
  text: string;
  citations?: Citation[];
  // Kept alongside the citations so the citation sheet has something to show
  // when a reference has no verse row behind it (uploads, commentaries, 404s).
  evidence?: EvidencePacket[];
  confidence?: number;
  queryTimeMs?: number;
  model?: string;
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
  newChat: () => void;
  send: (query: string) => Promise<void>;
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

      // No record is created here. An empty conversation would litter the
      // drawer, so the thread only materialises once a message is actually sent.
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

      send: async (query) => {
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
          const res = await api.ask({ query: q, include_evidence: true });
          append({
            id: newId('a'),
            role: 'assistant',
            text: res.answer,
            citations: res.citations,
            evidence: res.evidence,
            confidence: res.confidence,
            queryTimeMs: res.query_time_ms,
            model: res.model_used,
          });
        } catch (e) {
          const message =
            e instanceof ApiError && e.status === 429
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
      storage: createJSONStorage(() => AsyncStorage),
      // v1 added evidence/confidence/queryTimeMs to ChatMessage. The fields are
      // optional and purely additive, so pre-v1 messages rehydrate as-is and
      // simply fall back to their citation chips in the citation sheet.
      version: 1,
      migrate: (persisted) => persisted as { conversations: ChatState['conversations']; order: string[] },
      // activeId and thinking are session state — a cold start should open a
      // fresh composer, not drop the user back mid-thread.
      partialize: (s) => ({ conversations: s.conversations, order: s.order }),
    },
  ),
);

// Stable references. zustand v5 compares selector output with Object.is, so a
// fresh [] or a fresh .map() result on every call re-renders forever.
const NO_MESSAGES: ChatMessage[] = [];

/** Messages of the open thread, or [] when composing a new one. */
export function useActiveMessages(): ChatMessage[] {
  return useChat((s) =>
    s.activeId ? (s.conversations[s.activeId]?.messages ?? NO_MESSAGES) : NO_MESSAGES,
  );
}

/** Conversations in most-recent-first order, ready for the drawer list. */
export function useRecentChats(): Conversation[] {
  return useChat(
    useShallow(
      (s) => s.order.map((id) => s.conversations[id]).filter(Boolean) as Conversation[],
    ),
  );
}
