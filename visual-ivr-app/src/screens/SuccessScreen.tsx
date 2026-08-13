import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { downloadReceipt, recordActivity, type DecisionResponse } from "../api";
import { useLang } from "../lang";

export default function SuccessScreen() {
  const { token = "" } = useParams();
  const { t } = useLang();
  const location = useLocation();
  const result = (location.state as { result?: DecisionResponse } | null)?.result;
  const [receiptError, setReceiptError] = useState(false);

  useEffect(() => {
    recordActivity(token, "SUCCESS_SCREEN_VIEWED");
  }, [token]);

  const approved = result?.outcome !== "DECLINED";

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <div className="brand-badge">VX</div>
          {t.appName}
        </div>
      </header>
      <div className="tagline">{t.tagline}</div>

      <div className="card">
        <div className="card-body" style={{ textAlign: "center" }}>
          <div
            className="success-icon"
            style={{
              background: approved
                ? "radial-gradient(circle, rgba(52,211,153,0.25), transparent)"
                : "radial-gradient(circle, rgba(248,113,113,0.25), transparent)",
              color: approved ? "#34D399" : "#F87171",
            }}
          >
            {approved ? "✓" : "✕"}
          </div>
          <div className="screen-title">{t.successTitle}</div>
          <p className="screen-sub">{t.successSub}</p>

          <div className="txn-row">
            <span className="label">{approved ? t.outcomeApproved : t.outcomeDeclined}</span>
            <span className="value" style={{ color: approved ? "#34D399" : "#F87171" }}>
              {result?.cardStatus ?? "—"}
            </span>
          </div>
          <div className="txn-row">
            <span className="label">{t.reference}</span>
            <span className="value">VX-{token.slice(0, 8).toUpperCase()}</span>
          </div>

          <button
            className="btn btn-outline"
            onClick={async () => {
              try {
                setReceiptError(false);
                await downloadReceipt(token);
              } catch {
                setReceiptError(true);
              }
            }}
          >
            {t.receipt} ⬇
          </button>
          {receiptError && <div className="error-text">{t.otpError}</div>}

          <div className="secure-note" style={{ marginTop: 16 }}>
            <span>🛡️</span>
            <span>{t.nextBanner}</span>
          </div>
        </div>
      </div>

      <footer className="footer">{t.poweredBy}</footer>
    </div>
  );
}