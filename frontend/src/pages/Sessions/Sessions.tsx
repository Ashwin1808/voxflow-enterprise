import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined";
import PageHeader from "../../components/common/PageHeader";
import StatusChip from "../../components/common/StatusChip";
import { useLiveSessions } from "../../hooks/useLiveSessions";
import { useSessionDecision, useSessionStore, useSessionsList } from "../../hooks/useSessionActions";
import useAuth from "../../hooks/useAuth";
import { formatAmount, formatPhone, timeAgo } from "../../utils/format";
import type { FraudStatus } from "../../types/fraud";

const STATUS_FILTERS: Array<{ label: string; value: FraudStatus | "ALL" }> = [
  { label: "All statuses", value: "ALL" },
  { label: "Queued", value: "QUEUED" },
  { label: "Dialing", value: "DIALING" },
  { label: "Ringing", value: "RINGING" },
  { label: "Answered", value: "ANSWERED" },
  { label: "Approved", value: "APPROVED" },
  { label: "Blocked", value: "BLOCKED" },
  { label: "Visual IVR sent", value: "VISUAL_IVR_SENT" },
];

const IN_FLIGHT: FraudStatus[] = ["QUEUED", "DIALING", "RINGING", "ANSWERED"];

export default function Sessions() {
  const { isError } = useLiveSessions(true);
  const sessions = useSessionsList();
  const syncing = useSessionStore((s) => s.syncing);
  const lastSyncedAt = useSessionStore((s) => s.lastSyncedAt);
  const decide = useSessionDecision();
  const { hasRole } = useAuth();
  const canDecide = hasRole("ADMIN") || hasRole("AGENT");

  const [statusFilter, setStatusFilter] = useState<FraudStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sessions.filter((s) => {
      if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
      if (!q) return true;
      return (
        s.customerPhone.includes(q) ||
        s.merchant.toLowerCase().includes(q) ||
        s.cardLastFour.includes(q)
      );
    });
  }, [sessions, statusFilter, search]);

  const counts = useMemo(() => {
    const inFlight = sessions.filter((s) => IN_FLIGHT.includes(s.status)).length;
    const approved = sessions.filter((s) => s.status === "APPROVED").length;
    const blocked = sessions.filter((s) => s.status === "BLOCKED").length;
    const visualIvr = sessions.filter((s) => s.status === "VISUAL_IVR_SENT").length;
    return { inFlight, approved, blocked, visualIvr, total: sessions.length };
  }, [sessions]);

  return (
    <>
      <PageHeader
        title="Fraud Sessions"
        subtitle="Live fraud verification sessions across all campaigns. Updates every 5 seconds."
      />

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2.5 }}>
        <Chip icon={<PhoneInTalkOutlinedIcon sx={{ fontSize: 15 }} />} label={`${counts.inFlight} in flight`} color="primary" variant="outlined" />
        <Chip icon={<VerifiedOutlinedIcon sx={{ fontSize: 15 }} />} label={`${counts.approved} approved`} sx={{ color: "#34D399", borderColor: "rgba(52,211,153,0.4)" }} variant="outlined" />
        <Chip icon={<BlockOutlinedIcon sx={{ fontSize: 15 }} />} label={`${counts.blocked} blocked`} sx={{ color: "#F87171", borderColor: "rgba(248,113,113,0.4)" }} variant="outlined" />
        <Chip icon={<LinkOutlinedIcon sx={{ fontSize: 15 }} />} label={`${counts.visualIvr} visual IVR`} sx={{ color: "#38BDF8", borderColor: "rgba(56,189,248,0.4)" }} variant="outlined" />
        <Box sx={{ flex: 1 }} />
        <Box sx={{ fontSize: "0.75rem", color: "text.muted", alignSelf: "center" }}>
          {syncing ? "Syncing…" : lastSyncedAt ? `Synced ${timeAgo(new Date(lastSyncedAt).toISOString())}` : "Waiting for data"}
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search phone, merchant or card…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: <SearchOutlinedIcon fontSize="small" sx={{ mr: 1, color: "text.muted" }} />,
              sx: { borderRadius: 2, bgcolor: "rgba(255,255,255,0.04)", width: 260, fontSize: "0.8125rem" },
            },
          }}
        />
        <Select
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as FraudStatus | "ALL")}
          sx={{ minWidth: 180, borderRadius: 2, fontSize: "0.8125rem" }}
        >
          {STATUS_FILTERS.map((f) => (
            <MenuItem key={f.value} value={f.value}>
              {f.label}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {isError && (
        <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
          Failed to reach fraud-service. Verify it is running on port 8082.
        </Alert>
      )}

      {sessions.length === 0 && !isError ? (
        <Box sx={{ py: 10, textAlign: "center", borderRadius: 3, border: "1.5px dashed rgba(255,255,255,0.1)" }}>
          <Typography variant="subtitle1">No sessions yet</Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Upload a CSV to a campaign and start it — sessions will appear here live.
          </Typography>
        </Box>
      ) : (
        <TableContainer sx={{ borderRadius: 2.5, border: "1px solid rgba(255,255,255,0.07)", bgcolor: "transparent" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Merchant</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Card</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Updated</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: "center", py: 6, color: "text.muted" }}>
                    No sessions match the current filters.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((session) => {
                const terminal = session.status === "APPROVED" || session.status === "BLOCKED";
                const deciding = decide.isPending && decide.variables?.sessionId === session.id;
                return (
                  <TableRow key={session.id} sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.02)" } }}>
                    <TableCell>
                      <Box sx={{ fontSize: "0.875rem", fontWeight: 600, color: "text.primary" }}>
                        {formatPhone(session.customerPhone)}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8125rem" }}>{session.merchant}</TableCell>
                    <TableCell align="right" sx={{ fontSize: "0.8125rem", fontVariantNumeric: "tabular-nums" }}>
                      {formatAmount(session.amount)}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8125rem", color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>
                      ···· {session.cardLastFour}
                    </TableCell>
                    <TableCell>
                      <StatusChip status={session.status} pulse={IN_FLIGHT.includes(session.status)} />
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.75rem", color: "text.muted" }}>
                      {timeAgo(session.updatedAt)}
                    </TableCell>
                    <TableCell align="right">
                      {canDecide && !terminal ? (
                        <Box sx={{ display: "flex", gap: 0.75, justifyContent: "flex-end" }}>
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={deciding}
                            onClick={() => decide.mutate({ sessionId: session.id, decision: "APPROVE" })}
                            sx={{ color: "#34D399", borderColor: "rgba(52,211,153,0.4)", "&:hover": { borderColor: "#34D399", bgcolor: "rgba(52,211,153,0.08)" } }}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={deciding}
                            onClick={() => decide.mutate({ sessionId: session.id, decision: "BLOCK" })}
                            sx={{ color: "#F87171", borderColor: "rgba(248,113,113,0.4)", "&:hover": { borderColor: "#F87171", bgcolor: "rgba(248,113,113,0.08)" } }}
                          >
                            Block
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={deciding}
                            onClick={() => decide.mutate({ sessionId: session.id, decision: "SEND_VISUAL_IVR" })}
                            sx={{ color: "#38BDF8", borderColor: "rgba(56,189,248,0.4)", "&:hover": { borderColor: "#38BDF8", bgcolor: "rgba(56,189,248,0.08)" } }}
                          >
                            Visual IVR
                          </Button>
                        </Box>
                      ) : (
                        <Box sx={{ fontSize: "0.75rem", color: "text.muted" }}>
                          {terminal ? "Completed" : "Read only"}
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {syncing && sessions.length === 0 && (
        <Box sx={{ mt: 2 }}>
          <Skeleton height={48} />
          <Skeleton height={48} />
          <Skeleton height={48} />
        </Box>
      )}
    </>
  );
}
