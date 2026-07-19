import { useState, useEffect } from "https://esm.sh/react@18.2.0";
import { CampaignService } from "../services/CampaignService.js";

export function useSessions() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSessions = async () => {
    try {
      const fraudCampaigns = await CampaignService.getFraudCampaigns().catch(() => []);
      const fraudSessions = Array.isArray(fraudCampaigns) ? fraudCampaigns.flatMap(c => c.contacts || []) : [];
      setData(fraudSessions);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error, refetch: fetchSessions };
}
