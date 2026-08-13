import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { recordActivity } from "../api";
import { useLang } from "../lang";

export default function ErrorScreen() {
  const { token = "" } = useParams();
  const { t, toggle } = useLang();

  useEffect(() => {
    if (token) recordActivity(token, "ERROR_PAGE");
  }, [token]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <div className="brand-badge">VX</div>
          {t.appName}
        </div>
        <button className="lang-toggle" onClick={toggle}>
          {t.langLabel}
        </button>
      </header>
      <div className="tagline">{t.tagline}</div>

      <div className="card">
        <div className="card-body" style={{ textAlign: "center", paddingBottom: 30 }}>
          <div className="success-icon" style={{ background: "radial-gradient(circle, rgba(248,113,113,0.2), transparent)", color: "#F87171" }}>
            !
          </div>
          <div className="screen-title">{t.errorTitle}</div>
          <p className="screen-sub">{t.errorSub}</p>
          <div className="hint">{t.errorContact}</div>
        </div>
      </div>

      <footer className="footer">{t.poweredBy}</footer>
    </div>
  );
}