export type Severity = "info" | "success" | "warning" | "danger";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  severity: Severity;
  read?: boolean;
};

export type NavContext = {
  title: string;
  subtitle: string;
};
