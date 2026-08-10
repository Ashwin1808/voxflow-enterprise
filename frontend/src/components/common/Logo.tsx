import { Box } from "@mui/material";

type LogoProps = {
  size?: number;
  showWordmark?: boolean;
};

export default function Logo({ size = 34, showWordmark = true }: LogoProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: 2.5,
          display: "grid",
          placeItems: "center",
          background:
            "linear-gradient(135deg, #863bff 0%, #7C5CFF 55%, #38BDF8 130%)",
          boxShadow: "0 8px 24px -8px rgba(124, 92, 255, 0.7)",
          flexShrink: 0,
        }}
      >
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            fill="#fff"
          />
        </svg>
      </Box>
      {showWordmark && (
        <Box sx={{ lineHeight: 1.1 }}>
          <Box
            component="span"
            sx={{
              display: "block",
              fontWeight: 700,
              fontSize: "1.0625rem",
              letterSpacing: "-0.02em",
              color: "text.primary",
            }}
          >
            VoxFlow
          </Box>
          <Box
            component="span"
            sx={{
              display: "block",
              fontSize: "0.6875rem",
              fontWeight: 500,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "text.muted",
            }}
          >
            Enterprise
          </Box>
        </Box>
      )}
    </Box>
  );
}
