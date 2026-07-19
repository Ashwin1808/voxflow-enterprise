import { useState, useEffect } from "https://esm.sh/react@18.2.0";
import { RabbitMQService } from "../services/RabbitMQService.js";

export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await RabbitMQService.getExchangeStatus().catch(() => null);
      if (res && res.events) {
        setEvents(res.events);
      }
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // Poll every 5 seconds for real-time events simulation
    const interval = setInterval(fetchEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  return { events, loading, error, refetch: fetchEvents };
}
