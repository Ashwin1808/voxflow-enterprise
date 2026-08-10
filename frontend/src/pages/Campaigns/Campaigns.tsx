import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Skeleton,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import PauseOutlinedIcon from "@mui/icons-material/PauseOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import UploadOutlinedIcon from "@mui/icons-material/UploadOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import PageHeader from "../../components/common/PageHeader";
import KpiCard from "../../components/common/KpiCard";
import StatusChip from "../../components/common/StatusChip";
import CreateCampaignDialog from "../../components/campaign/CreateCampaignDialog";
import CsvUploadDialog from "../../components/campaign/CsvUploadDialog";
import { useCampaignCommand, useFraudCampaigns } from "../../hooks/useFraudCampaigns";
import useAuth from "../../hooks/useAuth";
import type { FraudCampaign } from "../../types/fraud";

const WORKFLOW_LABELS: Record<string, string> = {
  "fraud_verification:1.0": "Fraud Verification V1",
  "fraud_verification:2.0": "Fraud Verification V2",
  "insurance_renewal:1.0": "Insurance Renewal V1",
};

function workflowLabel(name: string) {
  return WORKFLOW_LABELS[name] ?? name;
}

function campaignProgress(campaign: FraudCampaign) {
  const completed = campaign.contacts.filter(
    (s) => s.status === "APPROVED" || s.status === "BLOCKED"
  ).length;
  const total = campaign.totalContacts;
  return { completed, total, ratio: total > 0 ? completed / total : 0 };
}

type CampaignCardProps = {
  campaign: FraudCampaign;
  onUpload: (campaign: FraudCampaign) => void;
};

function CampaignCard({ campaign, onUpload }: CampaignCardProps) {
  const command = useCampaignCommand(campaign.id);
  const { hasRole } = useAuth();
  const isAdmin = hasRole("ADMIN");
  const { completed, total, ratio } = campaignProgress(campaign);
  const running = campaign.status === "RUNNING";

  const run = (cmd: "start" | "pause" | "resume") =>
    command.mutate(cmd, {
      onError: (err) => alert(err instanceof Error ? err.message : "Command failed"),
    });

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        background: "linear-gradient(165deg, #13151B, #0F1116)",
        border: "1px solid rgba(255,255,255,0.07)",
        transition: "border-color 160ms ease, transform 160ms ease",
        "&:hover": {
          borderColor: running ? "rgba(124,92,255,0.4)" : "rgba(255,255,255,0.14)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1.5 }}>
        <Box sx={{ minWidth: 0 }}>
          <Box
            sx={{
              fontSize: "0.9375rem",
              fontWeight: 700,
              color: "text.primary",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              mb: 0.75,
            }}
          >
            {campaign.name}
          </Box>
          <Chip
            icon={<AccountTreeOutlinedIcon sx={{ fontSize: 14 }} />}
            label={workflowLabel(campaign.workflowName)}
            size="small"
            variant="outlined"
            sx={{ fontSize: "0.6875rem", borderColor: "rgba(255,255,255,0.14)", color: "text.secondary", mb: 1.25 }}
          />
        </Box>
        <StatusChip status={campaign.status} pulse={running} />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
        <Box sx={{ flex: 1, position: "relative", height: 6, borderRadius: 99, bgcolor: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              width: `${Math.round(ratio * 100)}%`,
              borderRadius: 99,
              background: running
                ? "linear-gradient(90deg, #7C5CFF, #38BDF8)"
                : "rgba(124,92,255,0.4)",
              transition: "width 400ms ease",
            }}
          />
        </Box>
        <Box sx={{ fontSize: "0.6875rem", fontWeight: 600, color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>
          {completed}/{total}
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ fontSize: "0.75rem", color: "text.muted" }}>
          {total} contact(s) · created{" "}
          {new Date(campaign.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </Box>
        {running && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: "0.6875rem", fontWeight: 600, color: "primary.light" }}>
            <Box sx={{ width: 6, height: 6, borderRadius: 99, bgcolor: "primary.main", animation: "statusPulse 1.6s ease-in-out infinite" }} />
            Live
          </Box>
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 1 }}>
        {isAdmin && (
          <>
            {running ? (
              <Button
                size="small"
                startIcon={<PauseOutlinedIcon fontSize="small" />}
                onClick={() => run("pause")}
                disabled={command.isPending}
                color="inherit"
              >
                Pause
              </Button>
            ) : (
              <Button
                size="small"
                variant="contained"
                startIcon={<PlayArrowOutlinedIcon fontSize="small" />}
                onClick={() => run("start")}
                disabled={command.isPending || total === 0}
              >
                {campaign.status === "PAUSED" ? "Resume" : "Start"}
              </Button>
            )}
            <Button
              size="small"
              startIcon={<UploadOutlinedIcon fontSize="small" />}
              onClick={() => onUpload(campaign)}
              disabled={running}
              color="inherit"
            >
              Upload CSV
            </Button>
          </>
        )}
        {!isAdmin && (
          <Box sx={{ fontSize: "0.75rem", color: "text.muted" }}>Viewing only — admin actions disabled</Box>
        )}
      </Box>
    </Box>
  );
}

export default function Campaigns() {
  const { data, isLoading, isError, refetch } = useFraudCampaigns();
  const { hasRole } = useAuth();
  const isAdmin = hasRole("ADMIN");
  const [createOpen, setCreateOpen] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<FraudCampaign | null>(null);

  const campaigns = data ?? [];
  const runningCount = campaigns.filter((c) => c.status === "RUNNING").length;
  const totalContacts = campaigns.reduce((acc, c) => acc + c.totalContacts, 0);
  const approved = campaigns.reduce(
    (acc, c) => acc + c.contacts.filter((s) => s.status === "APPROVED").length,
    0
  );

  return (
    <>
      <PageHeader
        title="Campaigns"
        subtitle="Create, schedule and monitor fraud verification campaigns across providers."
        actions={
          isAdmin && (
            <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={() => setCreateOpen(true)}>
              New campaign
            </Button>
          )
        }
      />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
        <KpiCard label="Total campaigns" value={campaigns.length} icon={<CampaignOutlinedIcon sx={{ fontSize: 16 }} />} />
        <KpiCard label="Running now" value={runningCount} icon={<PhoneOutlinedIcon sx={{ fontSize: 16 }} />} accent="#38BDF8" />
        <KpiCard label="Contacts scheduled" value={totalContacts.toLocaleString("en-IN")} icon={<UploadOutlinedIcon sx={{ fontSize: 16 }} />} accent="#FBBF24" />
        <KpiCard label="Transactions approved" value={approved.toLocaleString("en-IN")} icon={<VerifiedOutlinedIcon sx={{ fontSize: 16 }} />} accent="#34D399" />
      </Box>

      {isLoading && (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", xl: "repeat(3, 1fr)" }, gap: 2.5 }}>
          {[0, 1, 2].map((i) => (
            <Box key={i} sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(255,255,255,0.07)" }}>
              <Skeleton width="60%" height={22} />
              <Skeleton width="40%" height={18} sx={{ mt: 1 }} />
              <Skeleton height={6} sx={{ mt: 2 }} />
              <Skeleton width="50%" height={30} sx={{ mt: 2 }} />
            </Box>
          ))}
        </Box>
      )}

      {isError && (
        <Alert severity="error" sx={{ borderRadius: 2 }} action={
          <Button color="inherit" size="small" onClick={() => refetch()}>
            Retry
          </Button>
        }>
          Failed to load campaigns. Is <code>fraud-service</code> running on port 8082?
        </Alert>
      )}

      {!isLoading && !isError && campaigns.length === 0 && (
        <Box
          sx={{
            py: 10,
            textAlign: "center",
            borderRadius: 3,
            border: "1.5px dashed rgba(255,255,255,0.1)",
          }}
        >
          <CampaignOutlinedIcon sx={{ fontSize: 44, color: "text.muted", mb: 1.5 }} />
          <Box sx={{ fontSize: "1.0625rem", fontWeight: 700, color: "text.primary", mb: 0.5 }}>
            No campaigns yet
          </Box>
          <Box sx={{ fontSize: "0.875rem", color: "text.secondary", mb: 2.5 }}>
            Create your first fraud verification campaign to get started.
          </Box>
          {isAdmin && (
            <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={() => setCreateOpen(true)}>
              Create campaign
            </Button>
          )}
        </Box>
      )}

      {!isLoading && !isError && campaigns.length > 0 && (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", xl: "repeat(3, 1fr)" }, gap: 2.5 }}>
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} onUpload={setUploadTarget} />
          ))}
        </Box>
      )}

      <CreateCampaignDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <CsvUploadDialog
        open={Boolean(uploadTarget)}
        campaignId={uploadTarget?.id ?? ""}
        campaignName={uploadTarget?.name ?? ""}
        onClose={() => setUploadTarget(null)}
      />
    </>
  );
}
