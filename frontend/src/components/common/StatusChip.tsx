import { Box } from "@mui/material";
import type { CampaignStatus, FraudStatus } from "../../types/fraud";

type StatusTone = "muted" | "info" | "warning" | "success" | "error" | "primary";

const CAMPAIGN_TONES: Record<CampaignStatus, StatusTone> = {
  DRAFT: "muted",
  READY: "info",
  RUNNING: "primary",
  PAUSED: "warning",
  COMPLETED: "success",
};

const FRAUD_TONES: Record<FraudStatus, StatusTone> = {
  PENDING: "muted",
  QUEUED: "info",
  DIALING: "warning",
  RINGING: "warning",
  ANSWERED: "info",
  APPROVED: "success",
  BLOCKED: "error",
  VISUAL_IVR_SENT: "info",
  NO_ANSWER: "muted",
};

const TONE_COLORS: Record<StatusTone, { bg: string; fg: string; dot?: string }> = {
  muted: { bg: "rgba(255,255,255,0.05)", fg: "#9CA3AF" },
  info: { bg: "rgba(56,189,248,0.1)", fg: "#38BDF8", dot: "#38BDF8" },
  warning: { bg: "rgba(251,191,36,0.1)", fg: "#FBBF24", dot: "#FBBF24" },
  success: { bg: "rgba(52,211,153,0.1)", fg: "#34D399", dot: "#34D399" },
  error: { bg: "rgba(248,113,113,0.1)", fg: "#F87171", dot: "#F87171" },
  primary: { bg: "rgba(124,92,255,0.12)", fg: "#8F74FF", dot: "#8F74FF" },
};

function toneFor(status: CampaignStatus | FraudStatus): StatusTone {
  if (status in CAMPAIGN_TONES) return CAMPAIGN_TONES[status as CampaignStatus];
  return FRAUD_TONES[status as FraudStatus];
}

type StatusChipProps = {
  status: CampaignStatus | FraudStatus;
  pulse?: boolean;
};

export default function StatusChip({ status, pulse = false }: StatusChipProps) {
  const tone = toneFor(status);
  const palette = TONE_COLORS[tone];

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        px: 1.25,
        py: 0.375,
        borderRadius: 99,
        fontSize: "0.6875rem",
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: palette.fg,
        bgcolor: palette.bg,
        border: `1px solid ${palette.bg}`,
        whiteSpace: "nowrap",
      }}
    >
      {palette.dot && (
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: 99,
            bgcolor: palette.dot,
            animation: pulse ? "statusPulse 1.6s ease-in-out infinite" : undefined,
            "@keyframes statusPulse": {
              "0%, 100%": { opacity: 1, boxShadow: `0 0 0 0 ${palette.dot}55` },
              "50%": { opacity: 0.6, boxShadow: `0 0 0 4px ${palette.dot}22` },
            },
          }}
        />
      )}
      {status.replace(/_/g, " ")}
    </Box>
  );
}
