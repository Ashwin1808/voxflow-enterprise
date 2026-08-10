import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { AppBar, Box, IconButton, InputAdornment, TextField, Toolbar, Tooltip } from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import useAuth from "../../hooks/useAuth";
import { NAV_SECTIONS } from "../sidebar/MenuItems";
import type { NavItem } from "../sidebar/MenuItems";
import type { NotificationItem } from "../../types";
import UserMenu from "./UserMenu";
import NotificationsMenu from "./NotificationsMenu";

export default function Header() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [userAnchor, setUserAnchor] = useState<HTMLElement | null>(null);
  const [notifAnchor, setNotifAnchor] = useState<HTMLElement | null>(null);

  const current = useMemo(() => {
    for (const section of NAV_SECTIONS) {
      const item = section.items.find(
        (i: NavItem) => i.path === pathname || pathname.startsWith(`${i.path}/`)
      );
      if (item) return item;
    }
    return null;
  }, [pathname]);

  const notifications: NotificationItem[] = useMemo(
    () => [
      {
        id: "n1",
        title: "Fraud campaign started",
        message: "July Fraud Verification is now dialing. 1,000 sessions queued.",
        time: "2 min ago",
        severity: "info",
      },
      {
        id: "n2",
        title: "Card block requested",
        message: "Session #F-88142 declined a transaction — card block case raised.",
        time: "14 min ago",
        severity: "danger",
      },
      {
        id: "n3",
        title: "Provider degraded",
        message: "Twilio call latency above 1.5s on the voice cluster.",
        time: "32 min ago",
        severity: "warning",
      },
    ],
    []
  );

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: "rgba(10, 11, 15, 0.75)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        zIndex: (theme) => theme.zIndex.drawer - 1,
      }}
    >
      <Toolbar sx={{ gap: 2, minHeight: 64 }}>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ fontSize: "0.875rem", fontWeight: 700, color: "text.primary", lineHeight: 1.2 }}>
            {current?.label ?? "VoxFlow"}
          </Box>
          <Box sx={{ fontSize: "0.6875rem", color: "text.muted", lineHeight: 1.2 }}>
            {user?.username ? `Signed in as ${user.username}` : "Contact Center Platform"}
          </Box>
        </Box>

        <Box sx={{ flex: 1 }} />

        <TextField
          size="small"
          placeholder="Search campaigns, sessions, customers…"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon fontSize="small" sx={{ color: "text.muted" }} />
                </InputAdornment>
              ),
              sx: {
                width: 260,
                borderRadius: 2,
                bgcolor: "rgba(255,255,255,0.04)",
                fontSize: "0.8125rem",
                "& fieldset": { border: "none" },
                "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
              },
            },
          }}
          sx={{ display: { xs: "none", md: "inline-flex" } }}
        />

        <Tooltip title="Notifications">
          <IconButton size="small" sx={{ color: "text.secondary" }} onClick={(e) => setNotifAnchor(e.currentTarget)}>
            <Box sx={{ position: "relative", display: "grid", placeItems: "center" }}>
              <NotificationsNoneOutlinedIcon fontSize="small" />
              <Box
                sx={{
                  position: "absolute",
                  top: -3,
                  right: -4,
                  width: 8,
                  height: 8,
                  borderRadius: 99,
                  background: "linear-gradient(135deg, #F87171, #EF4444)",
                  border: "1.5px solid #0D0F14",
                }}
              />
            </Box>
          </IconButton>
        </Tooltip>

        <Tooltip title="Account">
          <IconButton size="small" sx={{ color: "text.secondary" }} onClick={(e) => setUserAnchor(e.currentTarget)}>
            <AccountCircleOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Toolbar>

      <UserMenu anchorEl={userAnchor} onClose={() => setUserAnchor(null)} />
      <NotificationsMenu anchorEl={notifAnchor} onClose={() => setNotifAnchor(null)} notifications={notifications} />
    </AppBar>
  );
}
