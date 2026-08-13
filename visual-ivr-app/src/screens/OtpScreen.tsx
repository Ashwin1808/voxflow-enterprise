import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { recordActivity, requestOtp, validateOtp, type OtpResponse } from "../api";
import { useLang } from "../lang";

export default function OtpScreen() {
  const { token = "" } = useParams();
  const { t, toggle } = useLang();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [otpInfo, setOtpInfo] = useState<OtpResponse | null>(null);
  const requestedRef = useRef(false);

  useEffect(() => {
    if (requestedRef.current) return;
    requestedRef.current = true;
    recordActivity(token, "OTP_SCREEN_VIEWED");
    requestOtp(token)
      .then(setOtpInfo)
      .catch(() => recordActivity(token, "OTP_REQUEST_FAILED"));
  }, [token]);

  const submit = async () => {
    if (code.length !== 6) return;
    setStatus("loading");
    setErrorText(null);
    try {
      await validateOtp(token, code);
      recordActivity(token, "OTP_VERIFIED");
      navigate(`/${token}/decision`);
    } catch (e) {
      recordActivity(token, "OTP_FAILED");
      setErrorText(e instanceof Error ? e.message : t.otpError);
      setStatus("error");
    }
  };

  const resend = async () => {
    setCode("");
    setErrorText(null);
    await requestOtp(token).then(setOtpInfo).catch(() => undefined);
  };

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
        <div className="card-body">
          <div className="screen-title">{t.otpTitle}</div>
          <p className="screen-sub">{otpInfo ? `${t.otpSub} · ${otpInfo.maskedPhone}` : t.otpSub}</p>

          <input
            className="field"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={code}
            disabled={status === "loading"}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            autoFocus
          />

          {errorText && <div className="error-text">{errorText}</div>}

          <button className="btn btn-primary" disabled={code.length !== 6 || status === "loading"} onClick={submit}>
            {status === "loading" ? "…" : t.otpSubmit}
          </button>
          <button className="btn btn-ghost" onClick={resend}>
            {t.otpResend}
          </button>
          <div className="hint">{t.otpHint}</div>
        </div>
      </div>

      <Link to={`/${token}`} style={{ textDecoration: "none" }}>
        <button className="btn btn-outline">{t.backToDetails}</button>
      </Link>

      <footer className="footer">{t.poweredBy}</footer>
    </div>
  );
}
