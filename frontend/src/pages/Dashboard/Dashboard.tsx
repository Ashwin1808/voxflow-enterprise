import { useMemo } from "react";
import { Box } from "@mui/material";
import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import PageHeader from "../../components/common/PageHeader";
import KpiCard from "../../components/common/KpiCard";
import StatusChip from "../../components/common/StatusChip";
import { useLiveSessions } from "../../hooks/useLiveSessions";
import { useSessionsList } from "../../hooks/useSessionActions";
import { useFraudCampaigns } from "../../hooks/useFraudCampaigns";
import { timeAgo, formatAmount, formatPhone } from "../../utils/format";
import type { FraudStatus } from "../../types/fraud";

const IN_FLIGHT: FraudStatus[] = ["QUEUED", "DIALING", "RINGING", "ANSWERED"];

const DONUT_COLORS: Record<FraudStatus, string> = {
  PENDING: "#6B7280",
  QUEUED: "#38BDF8",
  DIALING: "#FBBF24",
  RINGING: "#FBBF24",
  ANSWERED: "#38BDF8",
  APPROVED: "#34D399",
  BLOCKED: "#F87171",
  VISUAL_IVR_SENT: "#8F74FF",
  NO_ANSWER: "#6B7280",
};

export default function Dashboard() {
  useLiveSessions(true);
  const sessions = useSessionsList();
  const { data: campaigns, isLoading } = useFraudCampaigns();

  const inFlight = sessions.filter((s) => IN_FLIGHT.includes(s.status)).length;
  const approved = sessions.filter((s) => s.status === "APPROVED").length;
  const blocked = sessions.filter((s) => s.status === "BLOCKED").length;
  const visualIvr = sessions.filter((s) => s.status === "VISUAL_IVR_SENT").length;
  const decided = approved + blocked;
  const approvalRate = decided > 0 ? Math.round((approved / decided) * 100) : 0;

  const statusDistribution = useMemo(() => {
    const counts = new Map<FraudStatus, number>();
    for (const s of sessions) counts.set(s.status, (counts.get(s.status) ?? 0) + 1);
    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [sessions]);

  const recentActivity = useMemo(
    () => sessions.slice(0, 8),
    [sessions]
  );

  return (
    <>
      <PageHeader
        title="Operations Dashboard"
        subtitle="Real-time view of fraud verification across all active campaigns."
      />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", xl: "repeat(5, 1fr)" }, gap: 2, mb: 3 }}>
        <KpiCard label="Sessions in flight" value={inFlight} icon={<PhoneInTalkOutlinedIcon sx={{ fontSize: 16 }} />} accent="#38BDF8" />
        <KpiCard label="Approved" value={approved} icon={<VerifiedOutlinedIcon sx={{ fontSize: 16 }} />} accent="#34D399" />
        <KpiCard label="Blocked" value={blocked} icon={<BlockOutlinedIcon sx={{ fontSize: 16 }} />} accent="#F87171" />
        <KpiCard label="Visual IVR sent" value={visualIvr} icon={<LinkOutlinedIcon sx={{ fontSize: 16 }} />} accent="#8F74FF" />
        <KpiCard label="Approval rate" value={`${approvalRate}%`} icon={<TrendingUpOutlinedIcon sx={{ fontSize: 16 }} />} accent="#FBBF24" />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "5fr 7fr" }, gap: 2.5, mb: 2.5 }}>
        <Box sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(255,255,255,0.07)", background: "linear-gradient(165deg, #13151B, #0F1116)" }}>
          <Box sx={{ fontSize: "0.9375rem", fontWeight: 700, color: "text.primary", mb: 0.25 }}>
            Session status distribution
          </Box>
          <Box sx={{ fontSize: "0.75rem", color: "text.muted", mb: 2 }}>
            Live snapshot across all campaigns
          </Box>
          {statusDistribution.length === 0 ? (
            <Box sx={{ height: 260, display: "grid", placeItems: "center", color: "text.muted", fontSize: "0.8125rem" }}>
              No session data yet
            </Box>
          ) : (
            <Box sx={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={95}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {statusDistribution.map((entry) => (
                      <Cell key={entry.name} fill={DONUT_COLORS[entry.name as FraudStatus]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#171A21",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 10,
                      fontSize: "0.75rem",
                    }}
                    formatter={(value, name) => [`${value ?? 0}`, String(name).replace(/_/g, " ")]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          )}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
            {statusDistribution.map((entry) => (
              <Box key={entry.name} sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: "0.6875rem", color: "text.secondary" }}>
                <Box sx={{ width: 8, height: 8, borderRadius: 99, bgcolor: DONUT_COLORS[entry.name as FraudStatus] }} />
                {entry.name.replace(/_/g, " ")} · {entry.value}
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(255,255,255,0.07)", background: "linear-gradient(165deg, #13151B, #0F1116)" }}>
          <Box sx={{ fontSize: "0.9375rem", fontWeight: 700, color: "text.primary", mb: 0.25 }}>
            Recent activity
          </Box>
          <Box sx={{ fontSize: "0.75rem", color: "text.muted", mb: 2 }}>
            Latest session updates across the platform
          </Box>
          {recentActivity.length === 0 ? (
            <Box sx={{ py: 8, textAlign: "center", color: "text.muted", fontSize: "0.8125rem" }}>
              {isLoading ? "Loading campaign data…" : "No activity yet — start a campaign to see live updates"}
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {recentActivity.map((s) => (
                <Box
                  key={s.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 1.5,
                    py: 1.25,
                    borderRadius: 2,
                    "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: 99,
                      bgcolor: DONUT_COLORS[s.status],
                      flexShrink: 0,
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "text.primary", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {formatPhone(s.customerPhone)} · {s.merchant}
                    </Box>
                    <Box sx={{ fontSize: "0.6875rem", color: "text.muted" }}>
                      {formatAmount(s.amount)} · {timeAgo(s.updatedAt)}
                    </Box>
                  </Box>
                  <StatusChip status={s.status} pulse={IN_FLIGHT.includes(s.status)} />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {campaigns && campaigns.length > 0 && (
        <Box sx={{ borderRadius: 3, border: "1px solid rgba(255,255,255,0.07)", background: "linear-gradient(165deg, #13151B, #0F1116)", p: 2.5 }}>
          <Box sx={{ fontSize: "0.9375rem", fontWeight: 700, color: "text.primary", mb: 2 }}>
            Campaigns
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {campaigns.slice(0, 5).map((c) => {
              const done = c.contacts.filter((s) => s.status === "APPROVED" || s.status === "BLOCKED").length;
              const ratio = c.totalContacts > 0 ? done / c.totalContacts : 0;
              const running = c.status === "RUNNING";
              return (
                <Box key={c.id} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ width: 200, flexShrink: 0, fontSize: "0.8125rem", fontWeight: 600, color: "text.primary", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {c.name}
                  </Box>
                  <Box sx={{ flex: 1, position: "relative", height: 6, borderRadius: 99, bgcolor: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        width: `${Math.round(ratio * 100)}%`,
                        borderRadius: 99,
                        background: running ? "linear-gradient(90deg, #7C5CFF, #38BDF8)" : "rgba(124,92,255,0.4)",
                        transition: "width 400ms ease",
                      }}
                    />
                  </Box>
                  <Box sx={{ width: 90, textAlign: "right", fontSize: "0.75rem", color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>
                    {done}/{c.totalContacts}
                  </Box>
                  <StatusChip status={c.status} pulse={running} />
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </>
  );
}
