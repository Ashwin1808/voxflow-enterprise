import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import { useKeycloak } from "@react-keycloak/web";
import Logo from "../../components/common/Logo";

const HIGHLIGHTS = [
  {
    icon: <BoltOutlinedIcon fontSize="small" />,
    title: "Omnichannel orchestration",
    text: "Voice, Visual IVR, SMS and WhatsApp under one workflow engine.",
  },
  {
    icon: <SecurityOutlinedIcon fontSize="small" />,
    title: "Fraud-grade security",
    text: "JWT, PKCE, RBAC and full audit trails on every interaction.",
  },
  {
    icon: <AccountTreeOutlinedIcon fontSize="small" />,
    title: "Visual workflow builder",
    text: "Design, deploy and monitor customer journeys in minutes.",
  },
];

export default function Login() {
  const { keycloak, initialized } = useKeycloak();
  const navigate = useNavigate();

  const authenticated = keycloak.authenticated ?? false;

  useEffect(() => {
    if (authenticated) navigate("/dashboard", { replace: true });
  }, [authenticated, navigate]);

  const signIn = () => keycloak.login();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        p: 3,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -240,
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(124,92,255,0.18), rgba(124,92,255,0.05) 45%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          width: "100%",
          maxWidth: 1080,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.15fr 1fr" },
          gap: { xs: 4, md: 8 },
          alignItems: "center",
        }}
      >
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <Logo size={44} />
          <Typography variant="h1" sx={{ mt: 4, mb: 1.5, maxWidth: 420 }}>
            The enterprise communication orchestration platform
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", mb: 4, maxWidth: 430 }}>
            Automate fraud verification, insurance renewal and customer journeys across voice,
            visual IVR and messaging — with one visual workflow engine.
          </Typography>
          {HIGHLIGHTS.map((h) => (
            <Box key={h.title} sx={{ display: "flex", gap: 1.75, mb: 2.25 }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 1.75,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "rgba(124,92,255,0.12)",
                  color: "primary.light",
                  flexShrink: 0,
                }}
              >
                {h.icon}
              </Box>
              <Box>
                <Box sx={{ fontSize: "0.875rem", fontWeight: 600, color: "text.primary" }}>{h.title}</Box>
                <Box sx={{ fontSize: "0.8125rem", color: "text.secondary", mt: 0.25 }}>{h.text}</Box>
              </Box>
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            width: "100%",
            maxWidth: 400,
            justifySelf: { md: "end" },
            p: 3.5,
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(17,19,24,0.85)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 24px 80px -24px rgba(0,0,0,0.8)",
          }}
        >
          <Box sx={{ display: { md: "none" }, mb: 3 }}>
            <Logo size={38} />
          </Box>
          <Typography variant="h2" sx={{ mb: 0.5 }}>
            Welcome back
          </Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>
            Sign in with your organization account to access the VoxFlow console.
          </Typography>

          {!initialized ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} thickness={4} />
            </Box>
          ) : (
            <Button
              fullWidth
              size="large"
              variant="contained"
              onClick={signIn}
              sx={{ mb: 2 }}
            >
              Sign in with Keycloak
            </Button>
          )}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 1,
              borderRadius: 2,
              bgcolor: "rgba(52,211,153,0.07)",
              border: "1px solid rgba(52,211,153,0.18)",
              fontSize: "0.75rem",
              color: "success.main",
            }}
          >
            <Box sx={{ width: 6, height: 6, borderRadius: 99, bgcolor: "success.main", flexShrink: 0 }} />
            All systems operational · v0.1.0
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
