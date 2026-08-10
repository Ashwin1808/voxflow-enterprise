import { Box, Button, Divider, Menu, MenuItem } from "@mui/material";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import type { NotificationItem } from "../../types";

type NotificationsMenuProps = {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  notifications: NotificationItem[];
};

export default function NotificationsMenu({ anchorEl, onClose, notifications }: NotificationsMenuProps) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      slotProps={{
        paper: {
          sx: {
            mt: 1,
            width: 340,
            maxHeight: 420,
            borderRadius: 2,
            background: "#13151B",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 16px 48px -12px rgba(0,0,0,0.7)",
          },
        },
      }}
    >
      <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ fontSize: "0.875rem", fontWeight: 700, color: "text.primary" }}>Notifications</Box>
        <Box
          sx={{
            fontSize: "0.6875rem",
            fontWeight: 700,
            px: 1,
            py: 0.25,
            borderRadius: 99,
            bgcolor: "rgba(124,92,255,0.16)",
            color: "primary.light",
          }}
        >
          {notifications.length} new
        </Box>
      </Box>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
      {notifications.length === 0 ? (
        <Box sx={{ px: 2, py: 4, textAlign: "center", fontSize: "0.8125rem", color: "text.muted" }}>
          You're all caught up
        </Box>
      ) : (
        notifications.map((n) => (
          <MenuItem key={n.id} onClick={onClose} sx={{ gap: 1.5, py: 1.25, alignItems: "flex-start" }}>
            <Box sx={{ pt: 0.5 }}>
              <FiberManualRecordIcon sx={{ fontSize: 8, color: n.severity === "danger" ? "error.main" : "primary.main" }} />
            </Box>
            <Box>
              <Box sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "text.primary", mb: 0.25 }}>{n.title}</Box>
              <Box sx={{ fontSize: "0.75rem", color: "text.secondary", lineHeight: 1.45 }}>{n.message}</Box>
              <Box sx={{ fontSize: "0.6875rem", color: "text.muted", mt: 0.5 }}>{n.time}</Box>
            </Box>
          </MenuItem>
        ))
      )}
      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
      <Box sx={{ p: 1 }}>
        <Button fullWidth size="small" onClick={onClose} startIcon={<NotificationsActiveOutlinedIcon fontSize="small" />}>
          View all notifications
        </Button>
      </Box>
    </Menu>
  );
}
