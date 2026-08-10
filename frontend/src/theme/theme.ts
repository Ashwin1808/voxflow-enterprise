import { createTheme } from "@mui/material/styles";

export const designTokens = {
  colors: {
    background: "#0A0B0F",
    surface: "#111318",
    surfaceElevated: "#171A21",
    surfaceHover: "#1C2028",
    border: "rgba(255, 255, 255, 0.08)",
    borderStrong: "rgba(255, 255, 255, 0.14)",
    primary: "#7C5CFF",
    primarySoft: "rgba(124, 92, 255, 0.14)",
    primaryHover: "#8F74FF",
    textPrimary: "#E6E8EC",
    textSecondary: "#9CA3AF",
    textMuted: "#6B7280",
    success: "#34D399",
    warning: "#FBBF24",
    error: "#F87171",
    info: "#38BDF8",
  },
  spacing: {
    page: 24,
    section: 32,
  },
  radii: {
    card: 12,
    control: 10,
    pill: 999,
  },
} as const;

export default function createAppTheme() {
  const { colors, radii } = designTokens;

  return createTheme({
    cssVariables: true,
    colorSchemes: {
      dark: {
        palette: {
          mode: "dark",
          primary: { main: colors.primary, light: colors.primaryHover },
          success: { main: colors.success },
          warning: { main: colors.warning },
          error: { main: colors.error },
          info: { main: colors.info },
          background: {
            default: colors.background,
            paper: colors.surface,
          },
          text: {
            primary: colors.textPrimary,
            secondary: colors.textSecondary,
          },
          divider: colors.border,
        },
      },
    },
    shape: { borderRadius: radii.card },
    typography: {
      fontFamily: "'Inter', 'system-ui', sans-serif",
      h1: { fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" },
      h2: { fontSize: "1.375rem", fontWeight: 700, letterSpacing: "-0.01em" },
      h3: { fontSize: "1.125rem", fontWeight: 600, letterSpacing: "-0.01em" },
      h4: { fontSize: "1rem", fontWeight: 600 },
      h5: { fontSize: "0.9375rem", fontWeight: 600 },
      h6: { fontSize: "0.875rem", fontWeight: 600 },
      subtitle1: { fontSize: "0.9375rem", fontWeight: 500 },
      subtitle2: { fontSize: "0.8125rem", fontWeight: 500, color: colors.textSecondary },
      body1: { fontSize: "0.9375rem", lineHeight: 1.6 },
      body2: { fontSize: "0.875rem", lineHeight: 1.55, color: colors.textSecondary },
      caption: { fontSize: "0.75rem", color: colors.textMuted },
      button: { textTransform: "none", fontWeight: 600, letterSpacing: "0.01em" },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: colors.background,
            backgroundImage:
              "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124, 92, 255, 0.08), transparent)",
            backgroundAttachment: "fixed",
          },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border: `1px solid ${colors.border}`,
            borderRadius: radii.card,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.card,
            transition: "border-color 160ms ease",
            "&:hover": { borderColor: colors.borderStrong },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: radii.control,
            padding: "8px 16px",
            "&.MuiButton-containedPrimary": {
              background: `linear-gradient(135deg, ${colors.primary}, #6A45FF)`,
              boxShadow: "0 8px 24px -8px rgba(124, 92, 255, 0.5)",
              "&:hover": {
                background: `linear-gradient(135deg, ${colors.primaryHover}, ${colors.primary})`,
                boxShadow: "0 8px 28px -8px rgba(124, 92, 255, 0.65)",
              },
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: { borderRadius: radii.control },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: { borderRadius: radii.control },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            background: colors.surfaceElevated,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
            fontSize: "0.75rem",
            padding: "6px 10px",
          },
          arrow: { color: colors.surfaceElevated },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: radii.control,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: radii.pill, fontWeight: 600 },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: "rgba(255, 255, 255, 0.06)" },
          head: { fontWeight: 600, color: colors.textMuted },
        },
      },
    },
  });
}
