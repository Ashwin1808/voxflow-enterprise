import { Box } from "@mui/material";

export type SimEvent = {
  id: number;
  time: string;
  message: string;
  detail: string;
  kind: "create" | "transition" | "decision" | "error";
};

const KIND_COLORS: Record<SimEvent["kind"], string> = {
  create: "#8F74FF",
  transition: "#38BDF8",
  decision: "#34D399",
  error: "#F87171",
};

type EventLogProps = {
  events: SimEvent[];
  onClear: () => void;
};

export default function EventLog({ events, onClear }: EventLogProps) {
  return (
    <Box sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(255,255,255,0.07)", background: "linear-gradient(165deg, #13151B, #0F1116)" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
        <Box>
          <Box sx={{ fontSize: "0.9375rem", fontWeight: 700, color: "text.primary" }}>Event stream</Box>
          <Box sx={{ fontSize: "0.75rem", color: "text.muted" }}>
            What the simulator sent to the real fraud-service API
          </Box>
        </Box>
        {events.length > 0 && (
          <Box
            component="button"
            onClick={onClear}
            style={{ all: "unset", cursor: "pointer" }}
            className="sim-clear"
            sx={{ fontSize: "0.75rem", color: "text.muted", "&:hover": { color: "text.primary" } }}
          >
            Clear
          </Box>
        )}
      </Box>

      {events.length === 0 ? (
        <Box sx={{ py: 6, textAlign: "center", color: "text.muted", fontSize: "0.8125rem" }}>
          No events yet — pick a session and simulate a call
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, maxHeight: 320, overflowY: "auto", pr: 0.5 }}>
          {events.map((event) => (
            <Box
              key={event.id}
              sx={{
                display: "flex",
                gap: 1.25,
                px: 1.5,
                py: 1.25,
                borderRadius: 1.75,
                bgcolor: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <Box sx={{ width: 8, height: 8, borderRadius: 99, bgcolor: KIND_COLORS[event.kind], mt: 0.6, flexShrink: 0 }} />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Box sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "text.primary" }}>{event.message}</Box>
                <Box sx={{ fontSize: "0.6875rem", color: "text.muted", fontFamily: "monospace", mt: 0.25, wordBreak: "break-word" }}>
                  {event.detail}
                </Box>
              </Box>
              <Box sx={{ fontSize: "0.6875rem", color: "text.muted", flexShrink: 0 }}>{event.time}</Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
