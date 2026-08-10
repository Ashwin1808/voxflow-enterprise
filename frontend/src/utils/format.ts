export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";

  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatAmount(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatPhone(phone: string): string {
  if (phone.length >= 12) {
    return `+${phone.slice(0, -10)} ${phone.slice(-10, -5)} ${phone.slice(-5)}`;
  }
  return phone;
}
