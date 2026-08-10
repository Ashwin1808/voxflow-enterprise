import { Avatar, Box, Divider, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import useAuth from "../../hooks/useAuth";

type UserMenuProps = {
  anchorEl: HTMLElement | null;
  onClose: () => void;
};

export default function UserMenu({ anchorEl, onClose }: UserMenuProps) {
  const { user, logout } = useAuth();

  const initials =
    user?.username
      .split(/[._-]/)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

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
            minWidth: 240,
            borderRadius: 2,
            background: "#13151B",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 16px 48px -12px rgba(0,0,0,0.7)",
          },
        },
      }}
    >
      <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar
          sx={{
            width: 36,
            height: 36,
            fontSize: "0.8125rem",
            fontWeight: 700,
            bgcolor: "rgba(124,92,255,0.2)",
            color: "primary.light",
          }}
        >
          {initials}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ fontSize: "0.875rem", fontWeight: 600, color: "text.primary", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {user?.username}
          </Box>
          <Box sx={{ fontSize: "0.75rem", color: "text.muted", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {user?.email ?? "No email"}
          </Box>
        </Box>
      </Box>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
      <MenuItem onClick={onClose} sx={{ gap: 1.5, py: 1, mt: 0.5 }}>
        <ListItemIcon sx={{ minWidth: 0, color: "text.secondary" }}>
          <PersonOutlineOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText
          primary="Profile"
          slotProps={{ primary: { sx: { fontSize: "0.875rem" } } }}
        />
      </MenuItem>
      <MenuItem onClick={onClose} sx={{ gap: 1.5, py: 1 }}>
        <ListItemIcon sx={{ minWidth: 0, color: "text.secondary" }}>
          <AdminPanelSettingsOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText
          primary={user?.roles.length ? user.roles.join(", ") : "No roles"}
          secondary="Realm roles"
          slotProps={{
            primary: { sx: { fontSize: "0.875rem" } },
            secondary: { sx: { fontSize: "0.6875rem" } },
          }}
        />
      </MenuItem>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
      <MenuItem onClick={logout} sx={{ gap: 1.5, py: 1, mb: 0.5, color: "error.main" }}>
        <ListItemIcon sx={{ minWidth: 0, color: "error.main" }}>
          <LogoutOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText
          primary="Sign out"
          slotProps={{ primary: { sx: { fontSize: "0.875rem" } } }}
        />
      </MenuItem>
    </Menu>
  );
}
