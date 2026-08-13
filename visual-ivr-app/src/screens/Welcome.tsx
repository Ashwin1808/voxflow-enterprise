import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSummary, recordActivity, type Summary } from "../api";
import { useLang } from "../lang";
import { formatINR } from "../util";

export default function Welcome() {
  const { token = "" } = useParams();
  const { t, toggle } = useLang();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSummary(token)
      .then((s) => {
        if (!cancelled) {
          setSummary(s);
          recordActivity(token, "VISUAL_IVR_VIEWED");
        }
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (error) return null;

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

      {!summary && !error && <div className="spinner" />}

      {summary && (
        <>
          <div className="card">
            <div className="card-banner">
              <span style={{ fontSize: 22 }}>🛡️</span>
              <div>
                <h1>{t.bannerTitle}</h1>
                <p>{t.bannerSub}</p>
              </div>
            </div>
            <div className="card-body">
              <div className="txn-center">
                <div className="txn-merchant">{summary.merchant}</div>
                <div className="txn-amount">{formatINR(summary.amount)}</div>
                <div className="txn-time">
                  {new Date(summary.transactionTime).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
              </div>
              <div className="txn-row">
                <span className="label">{t.card}</span>
                <span className="value">•••• •••• •••• {summary.cardLastFour}</span>
              </div>
              <div className="txn-row">
                <span className="label">{t.phone}</span>
                <span className="value">{summary.maskedPhone}</span>
              </div>
              <div className="secure-note">
                <span>🔒</span>
                <span>{t.secureNote}</span>
              </div>
            </div>
          </div>

          <Link to={`/${token}/otp`} style={{ textDecoration: "none" }}>
            <button className="btn btn-primary">
              {t.verifyCta}
              <span className="btn-primary-sub">{t.verifyCtaSub}</span>
            </button>
          </Link>
        </>
      )}

      <footer className="footer">{t.poweredBy}</footer>
    </div>
  );
}
