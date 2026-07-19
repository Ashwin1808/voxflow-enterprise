import { useState, useEffect } from "https://esm.sh/react@18.2.0";
import { WorkflowService } from "../services/WorkflowService.js";

export function useWorkflow(sessionId = null) {
  const [definitions, setDefinitions] = useState([]);
  const [execution, setExecution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkflowData = async () => {
    try {
      setLoading(true);
      const defs = await WorkflowService.getWorkflowDefinitions();
      setDefinitions(defs);

      if (sessionId) {
        const exec = await WorkflowService.getWorkflowExecution(sessionId);
        setExecution(exec);
      }
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load workflow data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflowData();
    const interval = setInterval(fetchWorkflowData, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  return { definitions, execution, loading, error, refetch: fetchWorkflowData };
}
