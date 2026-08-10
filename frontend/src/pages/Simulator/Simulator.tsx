import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Skeleton,
  Typography,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import { useFraudCampaigns, useCreateFraudSession, useTransitionSession, useSessionDecision } from "../../hooks/useFraudCampaigns";
import { useLiveSessions } from "../../hooks/useLiveSessions";
import { useSessionStore, useSessionsList } from "../../store/sessionStore";
import PageHeader from "../../components/common/PageHeader";
import StatusChip from "../../components/common/StatusChip";
import StateMachine from "../../components/simulator/StateMachine";
import EventLog, { type SimEvent } from "../../components/simulator/EventLog";
import { formatAmount, formatPhone, timeAgo } from "../../utils/format";
import type { FraudStatus } from "../../types/fraud";

const MERCHANTS = ["Amazon", "Flipkart", "Netflix", "Uber", "BigBasket", "Swiggy", "MakeMyTrip", "Apple"];

function randomPhone(): string {
  return `9198${String(Math.floor(10000000 + Math.random() * 89999999))}`;
}

function randomSessionInput() {
  return {
    customerPhone: randomPhone(),
    cardLastFour: String(Math.floor(1000 + Math.random() * 9000)),
    merchant: MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)],
    amount: Math.round((1000 + Math.random() * 98000) / 100) * 100,
  };
}

const clock = () =>
  new Date().toLocaleTimeString("en-IN", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });

export default function Simulator() {
  useLiveSessions(true);
  const sessions = useSessionsList();
  const { isLoading } = useFraudCampaigns();

  const createSession = useCreateFraudSession();
  const transition = useTransitionSession();
  const decide = useSessionDecision();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [events, setEvents] = useState<SimEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  const upsert = useSessionStore((s) => s.upsertMany);

  const selected = useMemo(
    () => sessions.find((s) => s.id === selectedId) ?? null,
    [sessions, selectedId]
  );

  const pushEvent = useCallback((kind: SimEvent["kind"], message: string, detail: string) => {
    setEvents((prev) => [
      ...prev.slice(-199),
      { id: Date.now(), time: clock(), kind, message, detail },
    ]);
  }, []);

  const handleCreate = async () => {
    setError(null);
    try {
      const session = await createSession.mutateAsync(randomSessionInput());
      upsert([session]);
      setSelectedId(session.id);
      pushEvent("create", `Session created — ${formatPhone(session.customerPhone)}`, "POST /api/v1/fraud/sessions → status PENDING");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
      pushEvent("error", "Session creation failed", err instanceof Error ? err.message : "unknown error");
    }
  };

  const handleTransition = async (status: FraudStatus) => {
    if (!selected) return;
    setError(null);
    try {
      const updated = await transition.mutateAsync({ sessionId: selected.id, status });
      upsert([updated]);
      pushEvent("transition", `Simulated call → ${status}`, `POST /api/v1/fraud/sessions/${selected.id.slice(0, 8)}/transition → call.status ${status} published`);
      if (updated.status !== status) {
        pushEvent("transition", `Session resolved to ${updated.status}`, `GET campaign state → terminal`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transition failed");
      pushEvent("error", `Transition to ${status} failed`, err instanceof Error ? err.message : "unknown error");
    }
  };

  const handleDecision = async (decision: "APPROVE" | "BLOCK" | "SEND_VISUAL_IVR") => {
    if (!selected) return;
    setError(null);
    try {
      const updated = await decide.mutateAsync({ sessionId: selected.id, decision });
      upsert([updated]);
      const label = decision === "SEND_VISUAL_IVR" ? "Visual IVR link issued" : `Customer ${decision.toLowerCase()}d`;
      pushEvent("decision", label, `POST /api/v1/fraud/sessions/${selected.id.slice(0, 8)}/decision → status ${updated.status}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Decision failed");
      pushEvent("error", `Decision ${decision} failed`, err instanceof Error ? err.message : "unknown error");
    }
  };

  const busy = transition.isPending || decide.isPending || createSession.isPending;

  return (
    <>
      <PageHeader
        title="Simulator"
        subtitle="Development-only tool: drives real sessions through the fraud workflow without making real calls."
        actions={
          <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={handleCreate} disabled={busy}>
            New demo session
          </Button>
        }
      />

      <Alert severity="info" sx={{ borderRadius: 2, mb: 2.5 }} icon={<SmartToyOutlinedIcon fontSize="small" />}>
        Every action hits the <b>real</b> fraud-service API and publishes the same RabbitMQ events a production call would. Disabled in production builds (<code>VITE_SIMULATOR_ENABLED=false</code>).
      </Alert>

      {error && (
        <Alert severity="error" sx={{ borderRadius: 2, mb: 2.5 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "5fr 7fr" }, gap: 2.5, alignItems: "start" }}>
        <Box sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(255,255,255,0.07)", background: "linear-gradient(165deg, #13151B, #0F1116)" }}>
          <Box sx={{ fontSize: "0.9375rem", fontWeight: 700, color: "text.primary", mb: 0.25 }}>
            Sessions
          </Box>
          <Box sx={{ fontSize: "0.75rem", color: "text.muted", mb: 2 }}>
            Pick a session to drive, or create a new one
          </Box>

          {isLoading && sessions.length === 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Skeleton height={52} />
              <Skeleton height={52} />
              <Skeleton height={52} />
            </Box>
          ) : sessions.length === 0 ? (
            <Box sx={{ py: 8, textAlign: "center", color: "text.muted" }}>
              <PhoneOutlinedIcon sx={{ fontSize: 36, mb: 1, opacity: 0.6 }} />
              <Typography variant="body2">No sessions yet</Typography>
              <Button size="small" sx={{ mt: 1.5 }} onClick={handleCreate} disabled={busy}>
                Create one
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, maxHeight: 520, overflowY: "auto", pr: 0.5 }}>
              {sessions.map((s) => {
                const active = s.id === selectedId;
                const terminal = s.status === "APPROVED" || s.status === "BLOCKED";
                return (
                  <Box
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      px: 1.5,
                      py: 1.25,
                      borderRadius: 2,
                      cursor: "pointer",
                      border: `1px solid ${active ? "rgba(124,92,255,0.35)" : "rgba(255,255,255,0.05)"}`,
                      bgcolor: active ? "rgba(124,92,255,0.08)" : "rgba(255,255,255,0.02)",
                      "&:hover": { borderColor: "rgba(124,92,255,0.25)" },
                    }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Box sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "text.primary" }}>
                        {formatPhone(s.customerPhone)}
                      </Box>
                      <Box sx={{ fontSize: "0.6875rem", color: "text.muted" }}>
                        {s.merchant} · {formatAmount(s.amount)} · ···· {s.cardLastFour}
                      </Box>
                    </Box>
                    <StatusChip status={s.status} pulse={!terminal} />
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {selected ? (
            <>
              <Box sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(255,255,255,0.07)", background: "linear-gradient(165deg, #13151B, #0F1116)" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                  <Box sx={{ fontSize: "0.9375rem", fontWeight: 700, color: "text.primary" }}>
                    {formatPhone(selected.customerPhone)}
                  </Box>
                  <Chip label={selected.id.slice(0, 8)} size="small" sx={{ fontSize: "0.625rem", fontFamily: "monospace" }} />
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, fontSize: "0.8125rem", color: "text.secondary" }}>
                  <Box><b style={{ color: "text.primary" }}>{selected.merchant}</b> · {formatAmount(selected.amount)}</Box>
                  <Box>···· {selected.cardLastFour}</Box>
                  <Box>updated {timeAgo(selected.updatedAt)}</Box>
                </Box>
              </Box>
              <StateMachine
                session={selected}
                busy={busy}
                onTransition={handleTransition}
                onDecision={handleDecision}
                onOpenLink={(url) => window.open(url, "_blank", "noopener,noreferrer")}
                onCopyLink={(url) => navigator.clipboard?.writeText(url)}
              />
            </>
          ) : (
            <Box sx={{ py: 12, textAlign: "center", color: "text.muted", borderRadius: 3, border: "1.5px dashed rgba(255,255,255,0.1)" }}>
              <SmartToyOutlinedIcon sx={{ fontSize: 44, mb: 1.5, opacity: 0.6 }} />
              <Typography variant="subtitle1">Select a session to simulate</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                or create a new demo session with random customer data
              </Typography>
            </Box>
          )}
          <EventLog events={events} onClear={() => setEvents([])} />
        </Box>
      </Box>
    </>
  );
}
