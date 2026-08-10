import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import { useCreateFraudCampaign } from "../../hooks/useFraudCampaigns";
import type { FraudCampaignInput } from "../../types/fraud";

const KNOWN_WORKFLOWS = [
  { name: "fraud_verification:1.0", label: "Fraud Verification V1" },
  { name: "fraud_verification:2.0", label: "Fraud Verification V2" },
  { name: "insurance_renewal:1.0", label: "Insurance Renewal V1" },
];

type CreateCampaignDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function CreateCampaignDialog({ open, onClose }: CreateCampaignDialogProps) {
  const createCampaign = useCreateFraudCampaign();
  const [form, setForm] = useState<FraudCampaignInput>({
    name: "",
    workflowName: "fraud_verification:1.0",
  });
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!form.name.trim()) {
      setError("Campaign name is required");
      return;
    }
    setError(null);
    try {
      await createCampaign.mutateAsync({ name: form.name.trim(), workflowName: form.workflowName });
      setForm({ name: "", workflowName: "fraud_verification:1.0" });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create campaign");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            background: "#13151B",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 24px 80px -24px rgba(0,0,0,0.8)",
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 0.5, fontSize: "1.125rem", fontWeight: 700 }}>New fraud campaign</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <TextField
            label="Campaign name"
            placeholder="e.g. July Fraud Verification"
            fullWidth
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={Boolean(error) && !form.name.trim()}
          />
          <TextField
            select
            label="Workflow"
            fullWidth
            value={form.workflowName}
            onChange={(e) => setForm({ ...form, workflowName: e.target.value })}
            slotProps={{
              select: {
                startAdornment: (
                  <AccountTreeOutlinedIcon fontSize="small" sx={{ mr: 1, color: "text.muted" }} />
                ),
              },
            }}
          >
            {KNOWN_WORKFLOWS.map((w) => (
              <MenuItem key={w.name} value={w.name}>
                {w.label}
              </MenuItem>
            ))}
          </TextField>
          <Box
            sx={{
              px: 1.5,
              py: 1.25,
              borderRadius: 2,
              bgcolor: "rgba(124,92,255,0.07)",
              border: "1px solid rgba(124,92,255,0.18)",
              fontSize: "0.75rem",
              color: "text.secondary",
              lineHeight: 1.6,
            }}
          >
            <b style={{ color: "primary" }}>Next:</b> after creating, upload a CSV of customers to
            schedule fraud verification calls. Campaigns start in <b>DRAFT</b> status.
          </Box>
          {error && (
            <Box sx={{ fontSize: "0.8125rem", color: "error.main" }}>{error}</Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={submit}
          disabled={createCampaign.isPending}
        >
          {createCampaign.isPending ? "Creating…" : "Create campaign"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
