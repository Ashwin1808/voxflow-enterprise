export type Summary = {
  merchant: string;
  amount: number;
  cardLastFour: string;
  maskedPhone: string;
  transactionTime: string;
  sessionStatus: string;
};

export type DecisionResponse = {
  outcome: "APPROVED" | "DECLINED";
  message: string;
  cardStatus: string;
};

export type OtpResponse = {
  maskedPhone: string;
  expiresAt: string;
  verified: boolean;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/public/visual-ivr/${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export function getSummary(token: string): Promise<Summary> {
  return request<{ data: Summary }>(`${token}`).then((r) => r.data);
}

export function recordActivity(token: string, event: string): void {
  request(`/public/visual-ivr/${token}/activity`, {
    method: "POST",
    body: JSON.stringify({ event }),
  }).catch(() => {
    // best-effort analytics — never block the customer journey
  });
}

export function requestOtp(token: string): Promise<OtpResponse> {
  return request<{ data: OtpResponse }>(`${token}/otp/request`, { method: "POST" }).then((r) => r.data);
}

export function validateOtp(token: string, code: string): Promise<OtpResponse> {
  return request<{ data: OtpResponse }>(`${token}/otp/validate`, {
    method: "POST",
    body: JSON.stringify({ code }),
  }).then((r) => r.data);
}

export function submitDecision(token: string, decision: "APPROVE" | "DECLINE"): Promise<DecisionResponse> {
  return request<{ data: DecisionResponse }>(`${token}/decision`, {
    method: "POST",
    body: JSON.stringify({ decision }),
  }).then((r) => r.data);
}

export async function downloadReceipt(token: string): Promise<void> {
  const res = await fetch(`/public/visual-ivr/${token}/receipt`);
  if (!res.ok) throw new Error("Receipt unavailable");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "visual-ivr-receipt.pdf";
  a.click();
  URL.revokeObjectURL(url);
  recordActivity(token, "RECEIPT_DOWNLOADED");
}
