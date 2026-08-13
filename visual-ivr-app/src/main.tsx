import "./styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { LangProvider } from "./lang";
import Welcome from "./screens/Welcome";
import OtpScreen from "./screens/OtpScreen";
import DecisionScreen from "./screens/DecisionScreen";
import SuccessScreen from "./screens/SuccessScreen";
import ErrorScreen from "./screens/ErrorScreen";

function App() {
  return (
    <LangProvider>
      <HashRouter>
        <Routes>
          <Route path="/:token" element={<Welcome />} />
          <Route path="/:token/otp" element={<OtpScreen />} />
          <Route path="/:token/decision" element={<DecisionScreen />} />
          <Route path="/:token/success" element={<SuccessScreen />} />
          <Route path="/" element={<Navigate to="/invalid" replace />} />
          <Route path="*" element={<ErrorScreen />} />
        </Routes>
      </HashRouter>
    </LangProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
