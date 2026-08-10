import { Box, Button, Chip } from "@mui/material";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import StatusChip from "../common/StatusChip";
import type { FraudSession, FraudStatus } from "../../types/fraud";

const JOURNEY: FraudStatus[] = ["PENDING", "QUEUED", "DIALING", "RINGING", "ANSWERED"];

type StateMachineProps = {
  session: FraudSession;
  busy: boolean;
  onTransition: (status: FraudStatus) => void;
  onDecision: (decision: "APPROVE" | "BLOCK" | "SEND_VISUAL_IVR") => void;
  onOpenLink: (url: string) => void;
  onCopyLink: (url: string) => void;
};

export default function StateMachine({ session, busy, onTransition, onDecision, onOpenLink, onCopyLink }: StateMachineProps) {
  const currentIndex = JOURNEY.indexOf(session.status);
  const terminal = session.status === "APPROVED" || session.status === "BLOCKED";
  const visualSent = session.status === "VISUAL_IVR_SENT";

  const canTransition = (step: FraudStatus) =>
    !busy && currentIndex !== -1 && JOURNEY.indexOf(step) === currentIndex + 1;

  return (
    <Box sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(255,255,255,0.07)", background: "linear-gradient(165deg, #13151B, #0F1116)" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
        <Box>
          <Box sx={{ fontSize: "0.9375rem", fontWeight: 700, color: "text.primary" }}>Call state machine</Box>
          <Box sx={{ fontSize: "0.75rem", color: "text.muted" }}>Drive this session through its lifecycle</Box>
        </Box>
        <StatusChip status={session.status} pulse={!terminal && !visualSent && session.status !== "PENDING"} />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
        {JOURNEY.map((step, index) => {
          const done = currentIndex >= index;
          const current = currentIndex === index;
          const actionable = canTransition(step);

          return (
            <Box key={step} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: 99,
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  bgcolor: done ? "rgba(52,211,153,0.14)" : "rgba(255,255,255,0.05)",
                  color: done ? "#34D399" : "text.muted",
                  border: `1px solid ${done ? "rgba(52,211,153,0.35)" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                {done && currentIndex !== index ? (
                  <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 14 }} />
                ) : (
                  <FiberManualRecordIcon sx={{ fontSize: 9, color: current ? "#8F74FF" : "inherit" }} />
                )}
              </Box>
              <Box
                sx={{
                  flex: 1,
                  px: 1.5,
                  py: 1.25,
                  borderRadius: 1.75,
                  fontSize: "0.8125rem",
                  fontWeight: current ? 700 : 500,
                  color: current ? "text.primary" : done ? "text.secondary" : "text.muted",
                  bgcolor: current ? "rgba(124,92,255,0.1)" : done ? "rgba(52,211,153,0.05)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${current ? "rgba(124,92,255,0.3)" : done ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.05)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {step.replace(/_/g, " ")}
                {done && currentIndex !== index && <Chip size="small" label="done" sx={{ height: 20, fontSize: "0.625rem" }} />}
              </Box>
              {actionable ? (
                <Button
                  size="small"
                  variant="contained"
                  disabled={busy}
                  onClick={() => onTransition(step)}
                  sx={{ flexShrink: 0 }}
                >
                  Simulate
                </Button>
              ) : (
                <Box sx={{ width: 92, flexShrink: 0 }} />
              )}
            </Box>
          );
        })}
      </Box>

      {terminal && (
        <Box sx={{ mt: 2, fontSize: "0.8125rem", color: "text.secondary" }}>
          Session reached its terminal state (<b>{session.status}</b>). Create a new session to simulate another call.
        </Box>
      )}

      {currentIndex === JOURNEY.length - 1 && !terminal && (
        <Box sx={{ mt: 2.5 }}>
          <Box sx={{ fontSize: "0.75rem", fontWeight: 700, color: "text.secondary", mb: 1 }}>
            CUSTOMER ANSWERED — CHOOSE DECISION
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button size="small" variant="contained" disabled={busy} onClick={() => onDecision("APPROVE")} sx={{ flex: 1, bgcolor: "#34D399", color: "#052E1C", "&:hover": { bgcolor: "#4ADE9C" } }}>
              Approve
            </Button>
            <Button size="small" variant="contained" disabled={busy} onClick={() => onDecision("BLOCK")} sx={{ flex: 1, bgcolor: "#F87171", color: "#3B0A0A", "&:hover": { bgcolor: "#FC8181" } }}>
              Block
            </Button>
            <Button size="small" variant="contained" disabled={busy} onClick={() => onDecision("SEND_VISUAL_IVR")} sx={{ flex: 1 }}>
              Send Visual IVR
            </Button>
          </Box>
        </Box>
      )}

      {visualSent && session.visualIvrUrl && (
        <Box sx={{ mt: 2.5, p: 1.75, borderRadius: 2, bgcolor: "rgba(124,92,255,0.07)", border: "1px solid rgba(124,92,255,0.2)" }}>
          <Box sx={{ fontSize: "0.75rem", fontWeight: 700, color: "text.secondary", mb: 0.75 }}>
            VISUAL IVR LINK — ONE TIME USE
          </Box>
          <Box
            sx={{
              px: 1.25,
              py: 1,
              borderRadius: 1.5,
              bgcolor: "rgba(0,0,0,0.3)",
              fontFamily: "monospace",
              fontSize: "0.75rem",
              color: "primary.light",
              wordBreak: "break-all",
              mb: 1.25,
            }}
          >
            {session.visualIvrUrl}
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button size="small" variant="outlined" startIcon={<ArrowForwardOutlinedIcon fontSize="small" />} onClick={() => onOpenLink(session.visualIvrUrl!)} sx={{ flex: 1 }}>
              Open customer page
            </Button>
            <Button size="small" color="inherit" onClick={() => onCopyLink(session.visualIvrUrl!)} sx={{ flex: 1 }}>
              Copy link
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
