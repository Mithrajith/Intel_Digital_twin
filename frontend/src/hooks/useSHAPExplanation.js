import { useCallback, useState } from 'react';

export function useSHAPExplanation() {
  const [shap, setShap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSHAP = useCallback(async (features) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/explain/failure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(features),
      });
      if (!response.ok) throw new Error('Failed to fetch SHAP explanation');
      const data = await response.json();
      setShap(data);
    } catch (e) {
      setError(e.message);
      setShap(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { shap, loading, error, fetchSHAP };
}
