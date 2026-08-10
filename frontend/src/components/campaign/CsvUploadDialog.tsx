import { useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { parseFraudCsv } from "../../utils/csv";
import { useUploadFraudContacts } from "../../hooks/useFraudCampaigns";
import type { FraudContactInput } from "../../types/fraud";

const CSV_SAMPLE = `customerPhone,cardLastFour,merchant,amount
919876543210,1234,Amazon,18500
919876543211,5678,Flipkart,3200`;

type CsvUploadDialogProps = {
  campaignId: string;
  campaignName: string;
  open: boolean;
  onClose: () => void;
};

export default function CsvUploadDialog({ campaignId, campaignName, open, onClose }: CsvUploadDialogProps) {
  const upload = useUploadFraudContacts(campaignId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<FraudContactInput[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const reset = () => {
    setFileName(null);
    setRows([]);
    setErrors([]);
    setSubmitError(null);
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    const content = await file.text();
    const result = parseFraudCsv(content);
    setRows(result.rows);
    setErrors(result.errors);
  };

  const submit = async () => {
    if (rows.length === 0) return;
    setSubmitError(null);
    try {
      await upload.mutateAsync(rows);
      reset();
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
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
      <DialogTitle sx={{ pb: 0.5, fontSize: "1.125rem", fontWeight: 700 }}>
        Upload contacts — {campaignName}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box
          sx={{
            border: "1.5px dashed rgba(124,92,255,0.35)",
            borderRadius: 2.5,
            p: 4,
            textAlign: "center",
            cursor: "pointer",
            bgcolor: "rgba(124,92,255,0.04)",
            transition: "border-color 160ms ease, background 160ms ease",
            "&:hover": { borderColor: "primary.main", bgcolor: "rgba(124,92,255,0.08)" },
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            hidden
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <CloudUploadOutlinedIcon sx={{ fontSize: 40, color: "primary.light", mb: 1 }} />
          <Typography variant="subtitle1">Drop a CSV file or click to browse</Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Columns: customerPhone, cardLastFour, merchant, amount
          </Typography>
        </Box>

        <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {fileName && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: "0.8125rem", color: "text.secondary" }}>
              <DescriptionOutlinedIcon fontSize="small" sx={{ color: "primary.light" }} />
              {fileName} — {rows.length} valid contact(s)
            </Box>
          )}
          <Box sx={{ fontSize: "0.75rem", color: "text.muted", cursor: "pointer", textDecoration: "underline" }}>
            <a
              download="voxflow-contacts-sample.csv"
              href={`data:text/csv;charset=utf-8,${encodeURIComponent(CSV_SAMPLE)}`}
              style={{ color: "inherit" }}
            >
              Download sample CSV
            </a>
          </Box>
        </Box>

        {errors.length > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {errors.length} row(s) skipped:
            <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
              {errors.slice(0, 5).map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </Alert>
        )}

        {rows.length > 0 && (
          <TableContainer sx={{ mt: 2, maxHeight: 300 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Phone</TableCell>
                  <TableCell>Card ····</TableCell>
                  <TableCell>Merchant</TableCell>
                  <TableCell align="right">Amount (₹)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.slice(0, 8).map((r) => (
                  <TableRow key={`${r.customerPhone}-${r.cardLastFour}`}>
                    <TableCell sx={{ fontVariantNumeric: "tabular-nums" }}>+{r.customerPhone}</TableCell>
                    <TableCell>{r.cardLastFour}</TableCell>
                    <TableCell>{r.merchant}</TableCell>
                    <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                      {r.amount.toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {submitError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {submitError}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={rows.length === 0}
          onClick={submit}
        >
          {upload.isPending ? `Uploading ${rows.length}…` : `Upload ${rows.length} contact(s)`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
