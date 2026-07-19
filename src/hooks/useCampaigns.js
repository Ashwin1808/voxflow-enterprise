import { useState, useEffect } from "https://esm.sh/react@18.2.0";
import { CampaignService } from "../services/CampaignService.js";

export function useCampaigns() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const fraud = await CampaignService.getFraudCampaigns().catch(() => []);
      const insurance = await CampaignService.getInsuranceCampaigns().catch(() => []);
      
      // Combine results cleanly
      const combined = [
        ...fraud.map(c => ({ ...c, serviceType: "Fraud" })),
        ...insurance.map(c => ({ ...c, serviceType: "Insurance" }))
      ];
      
      setData(combined);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    const interval = setInterval(fetchCampaigns, 5000);
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error, refetch: fetchCampaigns };
}
