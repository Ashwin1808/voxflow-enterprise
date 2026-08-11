import type { ReactNode } from "react";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";

export type NavItem = {
  label: string;
  path: string;
  icon: ReactNode;
  roles?: string[];
  hidden?: boolean;
  badge?: "active";
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Operations",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: <DashboardOutlinedIcon fontSize="small" /> },
      { label: "Campaigns", path: "/campaigns", icon: <CampaignOutlinedIcon fontSize="small" /> },
      { label: "Call Sessions", path: "/sessions", icon: <PhoneOutlinedIcon fontSize="small" /> },
      { label: "Providers", path: "/providers", icon: <HubOutlinedIcon fontSize="small" /> },
      {
        label: "Simulator",
        path: "/simulator",
        icon: <AutoAwesomeOutlinedIcon fontSize="small" />,
        roles: ["ADMIN"],
        hidden: import.meta.env.VITE_SIMULATOR_ENABLED !== "true",
      },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "Analytics", path: "/analytics", icon: <InsightsOutlinedIcon fontSize="small" /> },
    ],
  },
  {
    label: "Administration",
    items: [{ label: "Settings", path: "/settings", icon: <SettingsOutlinedIcon fontSize="small" /> }],
  },
];

export const NOTIFICATION_LINK = "/notifications";
export const NOTIFICATION_ICON = <NotificationsOutlinedIcon fontSize="small" />;

export function visibleSections(hasAnyRole: (roles: string[]) => boolean): NavSection[] {
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) => !item.hidden && (!item.roles || hasAnyRole(item.roles))
    ),
  })).filter((section) => section.items.length > 0);
}