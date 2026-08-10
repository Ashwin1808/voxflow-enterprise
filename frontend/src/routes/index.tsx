import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import DashboardLayout from "../layouts/DashboardLayout";
import useAuth from "../hooks/useAuth";

const Login = lazy(() => import("../pages/Login/Login"));
const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));
const Campaigns = lazy(() => import("../pages/Campaigns/Campaigns"));
const Sessions = lazy(() => import("../pages/Sessions/Sessions"));
const Providers = lazy(() => import("../pages/Providers/Providers"));
const Analytics = lazy(() => import("../pages/Analytics/Analytics"));
const Workflow = lazy(() => import("../pages/Workflow/Workflow"));
const Settings = lazy(() => import("../pages/Settings/Settings"));

function PageLoader() {
  return (
    <Box sx={{ display: "grid", placeItems: "center", py: 12 }}>
      <CircularProgress size={32} thickness={4} />
    </Box>
  );
}

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<PageLoader />}>{node}</Suspense>;
}

function FullScreenLoader() {
  return (
    <Box sx={{ height: "100vh", display: "grid", placeItems: "center", bgcolor: "background.default" }}>
      <CircularProgress size={36} thickness={4} />
    </Box>
  );
}

function RequireAuth() {
  const { initialized, authenticated } = useAuth();
  if (!initialized) return <FullScreenLoader />;
  if (!authenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

type RequireRoleProps = {
  roles: string[];
  children: ReactNode;
};

function RequireRole({ roles, children }: RequireRoleProps) {
  const { hasAnyRole } = useAuth();
  if (!hasAnyRole(roles)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={withSuspense(<Login />)} />
      <Route element={<RequireAuth />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={withSuspense(<Dashboard />)} />
          <Route path="/campaigns" element={withSuspense(<Campaigns />)} />
          <Route path="/sessions" element={withSuspense(<Sessions />)} />
          <Route path="/providers" element={withSuspense(<Providers />)} />
          <Route path="/analytics" element={withSuspense(<Analytics />)} />
          <Route
            path="/workflow"
            element={
              <RequireRole roles={["ADMIN", "DEVELOPER"]}>
                {withSuspense(<Workflow />)}
              </RequireRole>
            }
          />
          <Route path="/settings" element={withSuspense(<Settings />)} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
