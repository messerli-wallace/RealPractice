/**
 * React hook for accessing offline sync status and queue information
 */

import { useEffect, useState, useCallback } from "react";
import {
  getOfflineQueue,
  isOnline as checkOnline,
  OfflineQueuedError,
} from "../../lib/utils/offlineQueue";

interface OfflineSyncState {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncTime: number | null;
  lastError: Error | null;
}

/**
 * Hook that provides offline sync status for the current user
 * Must be used within an AuthContext provider
 */
export function useOfflineSync(userId: string | undefined): OfflineSyncState & {
  forceSync: () => Promise<void>;
  clearQueue: () => void;
} {
  const [state, setState] = useState<OfflineSyncState>({
    isOnline: checkOnline(),
    pendingCount: 0,
    isSyncing: false,
    lastSyncTime: null,
    lastError: null,
  });

  const updateState = useCallback((updates: Partial<OfflineSyncState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  /**
   * Force sync all pending operations
   */
  const forceSync = useCallback(async () => {
    if (!userId) return;

    updateState({ isSyncing: true, lastError: null });

    try {
      await queueProcess(userId);
      updateState({
        isSyncing: false,
        lastSyncTime: Date.now(),
        pendingCount: 0,
      });
    } catch (error) {
      updateState({
        isSyncing: false,
        lastError: error as Error,
      });
    }
  }, [userId]);

  // Listen for online/offline/force-sync events
  useEffect(() => {
    const handleOnline = () => updateState({ isOnline: true });
    const handleOffline = () => updateState({ isOnline: false });
    const handleForceSync = async () => {
      await forceSync();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("force-sync", handleForceSync);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("force-sync", handleForceSync);
    };
  }, [updateState, forceSync]);

  // Sync queue status when userId changes
  useEffect(() => {
    if (!userId) {
      updateState({ pendingCount: 0, isOnline: checkOnline() });
      return;
    }

    const queue = getOfflineQueue(userId);

    const updateQueueStatus = () => {
      const pendingCount = queue.getPendingCount();
      updateState({ pendingCount, isOnline: queue.getOnlineStatus() });
    };

    // Initial update
    updateQueueStatus();

    // Poll for changes (since queue modifications don't emit events)
    // Alternative: could add custom event emitter to OfflineQueue
    const interval = setInterval(updateQueueStatus, 2000);

    return () => clearInterval(interval);
  }, [userId, updateState]);

  /**
   * Clear all pending operations (use with caution)
   */
  const clearQueue = useCallback(() => {
    if (!userId) return;
    const queue = getOfflineQueue(userId);
    queue.clearAll();
    updateState({ pendingCount: 0 });
  }, [userId]);

  return {
    ...state,
    forceSync,
    clearQueue,
  };
}

// Helper to process queue and update state during sync
async function queueProcess(userId: string): Promise<void> {
  const queue = getOfflineQueue(userId);
  await queue.processQueue();
}

/**
 * Utility function to check if an error is an OfflineQueuedError
 */
export function isOfflineQueuedError(error: unknown): boolean {
  return error instanceof OfflineQueuedError;
}
