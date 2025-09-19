"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface PingCountData {
  pendingReceived: number;
  recentResponses: number;
  totalUnread: number;
  hasNotifications: boolean;
}

export function usePingCount() {
  const { data: session } = useSession();
  const [pingCount, setPingCount] = useState<PingCountData>({
    pendingReceived: 0,
    recentResponses: 0,
    totalUnread: 0,
    hasNotifications: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPingCount = useCallback(async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ping/count");

      if (!response.ok) {
        throw new Error("Failed to fetch ping count");
      }

      const data = await response.json();
      setPingCount(data);
    } catch (error) {
      console.error("Error fetching ping count:", error);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Initial fetch
  useEffect(() => {
    fetchPingCount();
  }, [fetchPingCount]);


  // Listen for focus events to refresh when user returns to tab
  useEffect(() => {
    const handleFocus = () => {
      fetchPingCount();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchPingCount]);

  // Refresh function for manual updates (e.g., after ping actions)
  const refreshPingCount = () => {
    fetchPingCount();
  };

  return {
    ...pingCount,
    loading,
    error,
    refreshPingCount,
  };
}
