import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  Skeleton,
  TextField,
} from "@mui/material";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import LocalFireDepartmentOutlinedIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import PageHeader from "../../components/common/PageHeader";
import StatusChip from "../../components/common/StatusChip";
import {
  getOutboundConfig,
  listOutboundCalls,
  placeTestCall,
  type OutboundCall,
} from "../../api/outbound/outboundApi";
import useAuth from "../../hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const PROVIDER_LABELS: Record<string, string> = {
  EMULATOR: "Emulator dialer (free, local)",
  TWILIO: "Twilio (real PSTN)",
};

const OUTBOUND_STATUS_MAP: Record<string, string> = {
  CALL_REQUESTED: "QUEUED",
  VISUAL_IVR_REQUESTED: "VISUAL_IVR_SENT",
  DEFERRED: "QUEUED",
};

export default function Providers() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("ADMIN");
  const queryClient = useQueryClient();
  const [phone, setPhone] = useState("");

  const config = useQuery({ queryKey: ["outbound", "config"], queryFn: getOutboundConfig });
  const calls = useQuery({
    queryKey: ["outbound", "calls"],
    queryFn: listOutboundCalls,
    refetchInterval: 5_000,
  });

  const testCall = useMutation({
    mutationFn: () => placeTestCall(phone.trim()),
    onSuccess: () => {
      setPhone("");
      queryClient.invalidateQueries({ queryKey: ["outbound", "calls"] });
    },
  });

  const provider = config.data?.provider ?? "EMULATOR";

  return (
    <>
      <PageHeader
        title="Call providers"
        subtitle="The outbound dialer that places and tracks every call in the platform."
        actions={
          <Button
            variant="outlined"
            startIcon={<RefreshOutlinedIcon fontSize="small" />}
            onClick={() => {
              config.refetch();
              calls.refetch();
            }}
          >
            Refresh
          </Button>
        }
      />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "4fr 8fr" }, gap: 2.5, alignItems: "start" }}>
        <Box sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(255,255,255,0.07)", background: "linear-gradient(165deg, #13151B, #0F1116)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1.5 }}>
            <LocalFireDepartmentOutlinedIcon sx={{ color: "primary.light", fontSize: 20 }} />
            <Box sx={{ fontSize: "0.9375rem", fontWeight: 700, color: "text.primary" }}>Active dialer</Box>
          </Box>

          {config.isLoading ? (
            <Skeleton height={30} width="70%" />
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
              <Chip
                icon={<HubOutlinedIcon sx={{ fontSize: 14 }} />}
                label={PROVIDER_LABELS[provider] ?? provider}
                sx={{ fontSize: "0.75rem", color: "primary.light", borderColor: "rgba(124,92,255,0.35)" }}
                variant="outlined"
              />
              <Box sx={{ fontSize: "0.6875rem", color: "text.muted" }}>
                outbound-service :8087
              </Box>
            </Box>
          )}

          <Box sx={{ fontSize: "0.8125rem", color: "text.secondary", lineHeight: 1.7, mb: 2 }}>
            {provider === "TWILIO" ? (
              <>
                Every queued fraud session is dialed on the <b>real phone network</b> via Twilio.
                Status events (ringing, answered, missed) drive the session state machine in real time.
              </>
            ) : (
              <>
                The <b>emulator</b> is a free, local progressive dialer: up to 7 concurrent lines,
                realistic ring/answer behaviour, ~75% answer rate. No phone network required. Set{" "}
                <code>CALL_PROVIDER=twilio</code> to dial real phones.
              </>
            )}
          </Box>

          <Box sx={{ fontSize: "0.75rem", fontWeight: 700, color: "text.secondary", mb: 1 }}>
            PLACE A TEST CALL {isAdmin ? "" : "(ADMIN ONLY)"}
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              size="small"
              placeholder="e.g. 919812345678"
              fullWidth
              disabled={!isAdmin}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneOutlinedIcon fontSize="small" sx={{ color: "text.muted" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              variant="contained"
              onClick={() => testCall.mutate()}
              disabled={!isAdmin || phone.trim().length < 10 || testCall.isPending}
              sx={{ flexShrink: 0 }}
            >
              {testCall.isPending ? <CircularProgress size={16} /> : "Dial"}
            </Button>
          </Box>
          {testCall.error && (
            <Alert severity="error" sx={{ mt: 1.5, borderRadius: 2, fontSize: "0.75rem" }}>
              {testCall.error instanceof Error ? testCall.error.message : "Dial failed"}
            </Alert>
          )}
        </Box>

        <Box sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(255,255,255,0.07)", background: "linear-gradient(165deg, #13151B, #0F1116)" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box>
              <Box sx={{ fontSize: "0.9375rem", fontWeight: 700, color: "text.primary" }}>Dialer activity</Box>
              <Box sx={{ fontSize: "0.75rem", color: "text.muted" }}>Recent calls placed by the outbound service</Box>
            </Box>
          </Box>

          {calls.isLoading ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Skeleton height={44} />
              <Skeleton height={44} />
              <Skeleton height={44} />
            </Box>
          ) : calls.isError ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              outbound-service isn't running on port 8087 — start it to list calls.
            </Alert>
          ) : (calls.data ?? []).length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center", color: "text.muted", fontSize: "0.8125rem" }}>
              No calls yet. Start a campaign or place a test call.
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, maxHeight: 380, overflowY: "auto", pr: 0.5 }}>
              {(calls.data ?? []).slice(0, 40).map((call: OutboundCall) => (
                <Box
                  key={call.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 1.5,
                    py: 1.25,
                    borderRadius: 2,
                    border: "1px solid rgba(255,255,255,0.05)",
                    bgcolor: "rgba(255,255,255,0.02)",
                  }}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Box sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "text.primary" }}>
                      {call.phone}
                    </Box>
                    <Box sx={{ fontSize: "0.6875rem", color: "text.muted" }}>
                      {call.workflowName} · {call.provider} · {call.id.slice(0, 8)}
                    </Box>
                  </Box>
                  <StatusChip status={(OUTBOUND_STATUS_MAP[call.status] ?? call.status) as "APPROVED" | "BLOCKED" | "NO_ANSWER" | "PENDING" | "QUEUED" | "DIALING" | "RINGING" | "ANSWERED" | "VISUAL_IVR_SENT"} />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}