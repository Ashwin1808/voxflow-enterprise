import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { recordActivity, submitDecision, type DecisionResponse } from "../api";
import { useLang } from "../lang";

export default function DecisionScreen() {
  const { token = "" } = useParams();
  const { t } = useLang();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const decide = async (decision: "APPROVE" | "DECLINE") => {
    if (submitting) return;
    setSubmitting(true);
    setErrorText(null);
    try {
      const result: DecisionResponse = await submitDecision(token, decision);
      recordActivity(token, decision === "APPROVE" ? "DECISION_APPROVED" : "DECISION_DECLINED");
      navigate(`/${token}/success`, { state: { result } });
    } catch (e) {
      setErrorText(e instanceof Error ? e.message : "error");
      setSubmitting(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <div className="brand-badge">VX</div>
          {t.appName}
        </div>
        {t.langLabel}
      </header>
      <div className="tagline">{t.tagline}</div>

      <div className="card">
        <div className="card-body">
          <div className="screen-title">{t.decisionTitle}</div>
          <p className="screen-sub">{t.decisionSub}</p>

          <button className="btn btn-green" disabled={submitting} onClick={() => decide("APPROVE")}>
            {t.approve}
            <span className="btn-primary-sub">{t.approveSub}</span>
          </button>
          <button
            className="btn btn-red"
            disabled={submitting}
            style={{ marginTop: 6 }}
            onClick={() => decide("DECLINE")}
          >
            {t.decline}
            <span className="btn-primary-sub">{t.declineSub}</span>
          </button>

          {errorText && <div className="error-text">{errorText}</div>}
          {submitting && (
            <div style={{ textAlign: "center", fontSize: "0.82rem", color: "#9aa0ad", marginTop: 14 }}>
              {t.submitting}
            </div>
          )}
        </div>
      </div>

      <footer className="footer">{t.poweredBy}</footer>
    </div>
  );
}