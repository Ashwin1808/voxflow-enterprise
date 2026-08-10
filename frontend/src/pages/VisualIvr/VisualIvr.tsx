import { useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, CircularProgress } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import { useQuery } from "@tanstack/react-query";
import { getVisualIvrSummary, submitVisualIvrDecision } from "../../api/visualIvr/visualIvrApi";
import Logo from "../../components/common/Logo";
import type { VisualIvrDecisionResponse, VisualIvrPublicDecision, VisualIvrSummary } from "../../types/visualIvr";

type Phase = "loading" | "error" | "ready" | "submitting" | "done";

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function VisualIvr() {
  const { token = "" } = useParams();
  const [phase, setPhase] = useState<Phase>("submitting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<VisualIvrDecisionResponse | null>(null);

  const { data: summary, isError, error } = useQuery<VisualIvrSummary, Error>({
    queryKey: ["visual-ivr", token],
    queryFn: () => getVisualIvrSummary(token),
    retry: false,
  });

  const loadError = error?.message ?? null;
  const loadPhase: "loading" | "error" | "ready" = isError
    ? "error"
    : summary
      ? "ready"
      : "loading";

  const decide = async (decision: VisualIvrPublicDecision) => {
    setPhase("submitting");
    try {
      const response = await submitVisualIvrDecision(token, decision);
      setResult(response);
      setPhase("done");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
      setPhase("error");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0B0D11 0%, #0A0B0F 60%, #0D0F14 100%)",
        display: "grid",
        placeItems: { xs: "start", sm: "center" },
        p: { xs: 2, sm: 3 },
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 460, pt: { xs: 2, sm: 0 } }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Logo size={40} />
        </Box>

        {loadPhase === "loading" && (
          <Box sx={{ display: "grid", placeItems: "center", py: 12 }}>
            <CircularProgress size={32} thickness={4} />
          </Box>
        )}

        {(phase === "error" || loadPhase === "error") && (
          <Box
            sx={{
              textAlign: "center",
              py: 6,
              px: 3,
              borderRadius: 3,
              border: "1px solid rgba(248,113,113,0.25)",
              background: "rgba(248,113,113,0.05)",
            }}
          >
            <SecurityOutlinedIcon sx={{ fontSize: 48, color: "error.main", mb: 2 }} />
            <Box sx={{ fontSize: "1.0625rem", fontWeight: 700, color: "text.primary", mb: 1 }}>
              Verification link unavailable
            </Box>
            <Box sx={{ fontSize: "0.875rem", color: "text.secondary", mb: 3, lineHeight: 1.6 }}>
              {errorMessage ?? loadError ?? "This link is invalid, expired, or has already been used."}
            </Box>
            <Box sx={{ fontSize: "0.75rem", color: "text.muted" }}>
              Contact your bank's customer care for assistance.
            </Box>
          </Box>
        )}

        {phase === "done" && result && (
          <Box sx={{ textAlign: "center", py: 5, px: 3, borderRadius: 3, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(17,19,24,0.9)" }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                mx: "auto",
                mb: 2.5,
                display: "grid",
                placeItems: "center",
                background:
                  result.outcome === "APPROVED"
                    ? "radial-gradient(circle, rgba(52,211,153,0.25), transparent)"
                    : "radial-gradient(circle, rgba(248,113,113,0.25), transparent)",
                color: result.outcome === "APPROVED" ? "success.main" : "error.main",
              }}
            >
              {result.outcome === "APPROVED" ? (
                <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 44 }} />
              ) : (
                <BlockOutlinedIcon sx={{ fontSize: 44 }} />
              )}
            </Box>
            <Box sx={{ fontSize: "1.25rem", fontWeight: 700, color: "text.primary", mb: 1 }}>
              {result.outcome === "APPROVED" ? "Transaction confirmed" : "Transaction declined"}
            </Box>
            <Box sx={{ fontSize: "0.875rem", color: "text.secondary", mb: 2.5, lineHeight: 1.6 }}>
              {result.message}
            </Box>
            {result.outcome === "DECLINED" && (
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: "rgba(248,113,113,0.08)",
                  border: "1px solid rgba(248,113,113,0.2)",
                  fontSize: "0.75rem",
                  color: "text.secondary",
                }}
              >
                Card status: <b style={{ color: "#F87171" }}>{result.cardStatus}</b> · A fraud case has been raised automatically.
              </Box>
            )}
          </Box>
        )}

        {(phase === "ready" || loadPhase === "ready") && summary && (
          <>
            <Box
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(17,19,24,0.95)",
                boxShadow: "0 24px 80px -24px rgba(0,0,0,0.8)",
              }}
            >
              <Box
                sx={{
                  px: 3,
                  py: 2.5,
                  background: "linear-gradient(135deg, rgba(124,92,255,0.22), rgba(56,189,248,0.08))",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                }}
              >
                <VerifiedUserOutlinedIcon sx={{ color: "primary.light" }} />
                <Box>
                  <Box sx={{ fontSize: "0.9375rem", fontWeight: 700, color: "text.primary" }}>
                    Transaction verification
                  </Box>
                  <Box sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                    We detected an unusual transaction on your card
                  </Box>
                </Box>
              </Box>

              <Box sx={{ px: 3, py: 3 }}>
                <Box sx={{ textAlign: "center", mb: 3 }}>
                  <Box sx={{ fontSize: "0.75rem", color: "text.muted", mb: 0.5 }}>
                    {summary.merchant}
                  </Box>
                  <Box sx={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em", color: "text.primary" }}>
                    {formatINR(summary.amount)}
                  </Box>
                  <Box sx={{ fontSize: "0.75rem", color: "text.muted", mt: 0.5 }}>
                    {new Date(summary.transactionTime).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </Box>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                  {[
                    { label: "Card", value: `···· ···· ···· ${summary.cardLastFour}` },
                    { label: "Registered number", value: summary.maskedPhone },
                  ].map((row) => (
                    <Box
                      key={row.label}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        px: 1.75,
                        py: 1.5,
                        borderRadius: 1.75,
                        bgcolor: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <Box sx={{ fontSize: "0.75rem", color: "text.muted" }}>{row.label}</Box>
                      <Box sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "text.primary", fontVariantNumeric: "tabular-nums" }}>
                        {row.value}
                      </Box>
                    </Box>
                  ))}
                </Box>

                <Box
                  sx={{
                    mt: 2.5,
                    px: 1.75,
                    py: 1.5,
                    borderRadius: 2,
                    bgcolor: "rgba(251,191,36,0.07)",
                    border: "1px solid rgba(251,191,36,0.18)",
                    display: "flex",
                    gap: 1.25,
                    alignItems: "flex-start",
                  }}
                >
                  <LockOutlinedIcon sx={{ fontSize: 16, color: "#FBBF24", mt: 0.25 }} />
                  <Box sx={{ fontSize: "0.75rem", color: "text.secondary", lineHeight: 1.55 }}>
                    This is a secure one-time verification link. We will never ask for your OTP,
                    PIN or full card number.
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, mt: 2.5 }}>
              <Button
                fullWidth
                size="large"
                variant="contained"
                sx={{ bgcolor: "#34D399", color: "#052E1C", "&:hover": { bgcolor: "#4ADE9C" }, fontWeight: 700 }}
                onClick={() => decide("APPROVE")}
              >
                Yes, it was me
              </Button>
              <Button
                fullWidth
                size="large"
                variant="contained"
                sx={{ bgcolor: "#F87171", color: "#3B0A0A", "&:hover": { bgcolor: "#FC8181" }, fontWeight: 700 }}
                onClick={() => decide("DECLINE")}
              >
                No, I didn't make this transaction
              </Button>
            </Box>

            <Box sx={{ textAlign: "center", mt: 3, fontSize: "0.6875rem", color: "text.muted" }}>
              Powered by <b>VoxFlow Enterprise</b> · Protected by VoxFlow Security
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
