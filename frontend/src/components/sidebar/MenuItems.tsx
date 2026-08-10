import type { ReactNode } from "react";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import RecordVoiceOverOutlinedIcon from "@mui/icons-material/RecordVoiceOverOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";

export type NavItem = {
  label: string;
  path: string;
  icon: ReactNode;
  roles?: string[];
  badge?: "active";
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Workspace",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: <DashboardOutlinedIcon fontSize="small" /> },
      { label: "Campaigns", path: "/campaigns", icon: <CampaignOutlinedIcon fontSize="small" /> },
      { label: "Call Sessions", path: "/sessions", icon: <PhoneOutlinedIcon fontSize="small" /> },
      {
        label: "Call Monitoring",
        path: "/monitoring",
        icon: <RecordVoiceOverOutlinedIcon fontSize="small" />,
        roles: ["ADMIN", "AGENT"],
      },
      {
        label: "Fraud Verification",
        path: "/fraud",
        icon: <ShieldOutlinedIcon fontSize="small" />,
        roles: ["ADMIN"],
      },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "Analytics", path: "/analytics", icon: <InsightsOutlinedIcon fontSize="small" /> },
      { label: "Reports", path: "/reports", icon: <AssessmentOutlinedIcon fontSize="small" /> },
      {
        label: "Workflow Builder",
        path: "/workflow",
        icon: <AccountTreeOutlinedIcon fontSize="small" />,
        roles: ["ADMIN", "DEVELOPER"],
      },
      {
        label: "AI Assist",
        path: "/ai-assist",
        icon: <AutoAwesomeOutlinedIcon fontSize="small" />,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Providers", path: "/providers", icon: <HubOutlinedIcon fontSize="small" /> },
      { label: "Insurance", path: "/insurance", icon: <EventNoteOutlinedIcon fontSize="small" /> },
      {
        label: "Virtual Agents",
        path: "/virtual-agents",
        icon: <SupportAgentOutlinedIcon fontSize="small" />,
        roles: ["ADMIN", "DEVELOPER"],
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        label: "Users",
        path: "/users",
        icon: <GroupOutlinedIcon fontSize="small" />,
        roles: ["ADMIN"],
      },
      {
        label: "Roles",
        path: "/roles",
        icon: <AdminPanelSettingsOutlinedIcon fontSize="small" />,
        roles: ["ADMIN"],
      },
      {
        label: "Audit Logs",
        path: "/audit",
        icon: <HistoryOutlinedIcon fontSize="small" />,
        roles: ["ADMIN"],
      },
      { label: "Settings", path: "/settings", icon: <SettingsOutlinedIcon fontSize="small" /> },
    ],
  },
];

export const NOTIFICATION_LINK = "/notifications";
export const NOTIFICATION_ICON = <NotificationsOutlinedIcon fontSize="small" />;

export function visibleSections(hasAnyRole: (roles: string[]) => boolean): NavSection[] {
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) => !item.roles || hasAnyRole(item.roles)
    ),
  })).filter((section) => section.items.length > 0);
}
