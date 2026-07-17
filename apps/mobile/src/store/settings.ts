import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LastRead {
  slug: string;
  scriptureName: string;
  chapterNumber: number;
}

interface SettingsState {
  fontScale: number; // 0.85 – 1.4
  showTransliteration: boolean;
  showTranslation: boolean;
  lastRead: LastRead | null;
  setFontScale: (v: number) => void;
  toggleTransliteration: () => void;
  toggleTranslation: () => void;
  setLastRead: (v: LastRead) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      fontScale: 1,
      showTransliteration: true,
      showTranslation: true,
      lastRead: null,
      setFontScale: (fontScale) => set({ fontScale }),
      toggleTransliteration: () => set((s) => ({ showTransliteration: !s.showTransliteration })),
      toggleTranslation: () => set((s) => ({ showTranslation: !s.showTranslation })),
      setLastRead: (lastRead) => set({ lastRead }),
    }),
    {
      name: 'veda-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
