import { useState, useEffect } from "react";
import { getTagAnalytics } from "../_db/db";
import { logError } from "../../lib/utils/errorLogger";

interface UseTagAnalyticsReturn {
  tagAnalytics: Record<string, number> | undefined;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useTagAnalytics(userId: string | null): UseTagAnalyticsReturn {
  const [tagAnalytics, setTagAnalytics] = useState<
    Record<string, number> | undefined
  >();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchTagAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const analytics = await getTagAnalytics(userId);
        setTagAnalytics(analytics);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        logError("Failed to fetch tag analytics", error, {
          component: "useTagAnalytics",
          function: "fetchTagAnalytics",
          metadata: { userId },
        });
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTagAnalytics();
  }, [userId]);

  const refresh = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const analytics = await getTagAnalytics(userId);
      setTagAnalytics(analytics);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      logError("Failed to refresh tag analytics", error, {
        component: "useTagAnalytics",
        function: "refresh",
        metadata: { userId },
      });
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    tagAnalytics,
    loading,
    error,
    refresh,
  };
}

export default useTagAnalytics;
