import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  IconButton,
  Divider,
} from "@mui/material";
import MenuOpenOutlinedIcon from "@mui/icons-material/MenuOpenOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import Logo from "../common/Logo";
import useAuth from "../../hooks/useAuth";
import { visibleSections, type NavItem } from "./MenuItems";

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { hasAnyRole } = useAuth();

  const sections = visibleSections(hasAnyRole);
  const isActive = (path: string) =>
    pathname === path || (path !== "/dashboard" && pathname.startsWith(path));

  const renderItem = (item: NavItem) => {
    const active = isActive(item.path);
    const content = (
      <ListItemButton
        onClick={() => navigate(item.path)}
        selected={active}
        sx={{
          px: 1.5,
          py: 0.875,
          mb: 0.25,
          justifyContent: collapsed ? "center" : "flex-start",
          color: active ? "text.primary" : "text.secondary",
          background: active
            ? "linear-gradient(90deg, rgba(124,92,255,0.16), rgba(124,92,255,0.05))"
            : "transparent",
          border: "1px solid transparent",
          borderColor: active ? "rgba(124,92,255,0.28)" : "transparent",
          "&:hover": {
            background: "rgba(255,255,255,0.05)",
            color: "text.primary",
          },
          "&.Mui-selected": { background: "transparent" },
          "&.Mui-selected:hover": {
            background: "linear-gradient(90deg, rgba(124,92,255,0.2), rgba(124,92,255,0.07))",
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: collapsed ? 0 : 1.75,
            justifyContent: "center",
            color: active ? "primary.main" : "inherit",
          }}
        >
          {item.icon}
        </ListItemIcon>
        {!collapsed && (
          <ListItemText
            primary={item.label}
            slotProps={{ primary: { sx: { fontSize: "0.875rem", fontWeight: active ? 600 : 500 } } }}
          />
        )}
      </ListItemButton>
    );

    return collapsed ? (
      <Tooltip title={item.label} placement="right" key={item.path}>
        <Box>{content}</Box>
      </Tooltip>
    ) : (
      <Box key={item.path}>{content}</Box>
    );
  };

  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        width: collapsed ? 84 : 260,
        flexShrink: 0,
        whiteSpace: "nowrap",
        transition: "width 200ms cubic-bezier(0.4, 0, 0.2, 1)",
        "& .MuiDrawer-paper": {
          width: collapsed ? 84 : 260,
          transition: "width 200ms cubic-bezier(0.4, 0, 0.2, 1)",
          boxSizing: "border-box",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          background: "#0D0F14",
          overflowX: "hidden",
          px: 1.5,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1, py: 2.5 }}>
        {!collapsed && <Logo />}
        {collapsed && (
          <Box sx={{ mx: "auto" }}>
            <Logo size={30} showWordmark={false} />
          </Box>
        )}
      </Box>

      <IconButton
        onClick={onToggle}
        size="small"
        sx={{ alignSelf: "center", mb: 1, color: "text.muted" }}
      >
        {collapsed ? <MenuOutlinedIcon fontSize="small" /> : <MenuOpenOutlinedIcon fontSize="small" />}
      </IconButton>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 1.5 }} />

      <List sx={{ px: collapsed ? 0.5 : 0, overflowY: "auto", flex: 1 }}>
        {sections.map((section) => (
          <Box key={section.label} sx={{ mb: 1.5 }}>
            {!collapsed && (
              <Box
                sx={{
                  px: 1.5,
                  pt: 1.5,
                  pb: 0.75,
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "text.muted",
                }}
              >
                {section.label}
              </Box>
            )}
            {collapsed && <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 1 }} />}
            {section.items.map(renderItem)}
          </Box>
        ))}
      </List>

      {!collapsed && (
        <Box
          sx={{
            m: 1,
            p: 1.75,
            borderRadius: 2,
            background: "linear-gradient(135deg, rgba(124,92,255,0.14), rgba(56,189,248,0.06))",
            border: "1px solid rgba(124,92,255,0.22)",
          }}
        >
          <Box sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "text.primary", mb: 0.25 }}>
            Platform Status
          </Box>
          <Box sx={{ fontSize: "0.75rem", color: "text.secondary", lineHeight: 1.5 }}>
            6 services healthy
            <br />
            <Box component="span" sx={{ color: "success.main", fontWeight: 600 }}>
              ● All systems operational
            </Box>
          </Box>
        </Box>
      )}
    </Drawer>
  );
}
