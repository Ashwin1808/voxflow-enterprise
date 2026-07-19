import { useState, useEffect } from "https://esm.sh/react@18.2.0";
import { ProviderService } from "../services/ProviderService.js";

export function useProviders() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const res = await ProviderService.getProviders();
      setData(res);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load providers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  return { data, loading, error, refetch: fetchProviders };
}
