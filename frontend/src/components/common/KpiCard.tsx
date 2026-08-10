import type { ReactNode } from "react";
import { Box } from "@mui/material";

type KpiCardProps = {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  accent?: string;
  sub?: string;
};

export default function KpiCard({ label, value, icon, accent = "#8F74FF", sub }: KpiCardProps) {
  return (
    <Box
      sx={{
        p: 2.25,
        borderRadius: 2.5,
        background: "linear-gradient(160deg, #13151B, #101218)",
        border: "1px solid rgba(255,255,255,0.07)",
        transition: "border-color 160ms ease, transform 160ms ease",
        "&:hover": { borderColor: "rgba(255,255,255,0.14)", transform: "translateY(-1px)" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.25 }}>
        <Box sx={{ fontSize: "0.75rem", fontWeight: 600, color: "text.secondary", letterSpacing: "0.02em" }}>
          {label}
        </Box>
        {icon && (
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              bgcolor: `${accent}1f`,
              color: accent,
            }}
          >
            {icon}
          </Box>
        )}
      </Box>
      <Box sx={{ fontSize: "1.625rem", fontWeight: 700, letterSpacing: "-0.02em", color: "text.primary", lineHeight: 1.1 }}>
        {value}
      </Box>
      {sub && <Box sx={{ fontSize: "0.75rem", color: "text.muted", mt: 0.75 }}>{sub}</Box>}
    </Box>
  );
}
