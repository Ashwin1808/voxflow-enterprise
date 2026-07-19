import { useState, useEffect } from "https://esm.sh/react@18.2.0";
import { AnalyticsService } from "../services/AnalyticsService.js";

export function useMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await AnalyticsService.getMetrics();
      setMetrics(res);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return { metrics, loading, error, refetch: fetchMetrics };
}
