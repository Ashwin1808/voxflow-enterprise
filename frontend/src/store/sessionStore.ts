import { create } from "zustand";
import type { FraudSession } from "../types/fraud";

type SessionStoreState = {
  sessions: Record<string, FraudSession>;
  lastSyncedAt: number | null;
  syncing: boolean;
  setSyncing: (syncing: boolean) => void;
  upsertMany: (sessions: FraudSession[]) => void;
  markSynced: () => void;
};

export const useSessionStore = create<SessionStoreState>((set) => ({
  sessions: {},
  lastSyncedAt: null,
  syncing: false,

  setSyncing: (syncing) => set({ syncing }),

  upsertMany: (incoming) =>
    set((state) => {
      const next = { ...state.sessions };
      for (const session of incoming) {
        const existing = next[session.id];
        if (!existing || existing.updatedAt < session.updatedAt) {
          next[session.id] = session;
        }
      }
      return { sessions: next };
    }),

  markSynced: () => set({ lastSyncedAt: Date.now() }),
}));

export function useSessionsList(): FraudSession[] {
  const sessions = useSessionStore((state) => state.sessions);
  return Object.values(sessions).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}
