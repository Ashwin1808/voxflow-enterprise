import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Campaigns from "../pages/Campaigns/Campaigns";
import Sessions from "../pages/Sessions/Sessions";
import Providers from "../pages/Providers/Providers";
import Analytics from "../pages/Analytics/Analytics";
import Workflow from "../pages/Workflow/Workflow";
import Settings from "../pages/Settings/Settings";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/campaigns" element={<Campaigns />} />
      <Route path="/sessions" element={<Sessions />} />
      <Route path="/providers" element={<Providers />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/workflow" element={<Workflow />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}
