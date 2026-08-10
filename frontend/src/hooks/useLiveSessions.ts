import { useEffect } from "react";
import { useFraudCampaigns } from "./useFraudCampaigns";
import { useSessionStore } from "../store/sessionStore";

const POLL_INTERVAL_MS = 5_000;

export function useLiveSessions(enabled = true) {
  const { data: campaigns, isError } = useFraudCampaigns();
  const setSyncing = useSessionStore((s) => s.setSyncing);
  const upsertMany = useSessionStore((s) => s.upsertMany);
  const markSynced = useSessionStore((s) => s.markSynced);

  useEffect(() => {
    if (!enabled || !campaigns) return;

    setSyncing(true);
    const sessions = campaigns.flatMap((c) => c.contacts);
    upsertMany(sessions);
    markSynced();
    setSyncing(false);

    const interval = setInterval(() => {
      setSyncing(true);
      const latest = campaigns.flatMap((c) => c.contacts);
      upsertMany(latest);
      markSynced();
      setSyncing(false);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [enabled, campaigns, setSyncing, upsertMany, markSynced]);

  return { isError };
}
