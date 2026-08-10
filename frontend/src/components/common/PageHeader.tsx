import type { ReactNode } from "react";
import { Box } from "@mui/material";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: { xs: "flex-start", md: "center" },
        flexDirection: { xs: "column", md: "row" },
        gap: 2,
        mb: 3,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em", color: "text.primary", lineHeight: 1.2 }}>
          {title}
        </Box>
        {subtitle && (
          <Box sx={{ fontSize: "0.875rem", color: "text.secondary", mt: 0.5 }}>{subtitle}</Box>
        )}
      </Box>
      <Box sx={{ flex: 1 }} />
      {actions && <Box sx={{ display: "flex", gap: 1.25, alignItems: "center" }}>{actions}</Box>}
    </Box>
  );
}
