"use client";

import React, {
  useContext,
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { subscribeToFriendsLogs } from "../_db/realtimeService";
import { OrganizedLogEntry } from "../../types/index";
import { logError } from "../../lib/utils/errorLogger";
import { UserAuth } from "./AuthContext";

interface Log {
  user: string;
  dateTimeStr: string;
  duration: string;
  tags: string[];
  description: string | null;
}

interface LogsContextType {
  logs: Log[];
  allLogs: Log[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  page: number;
  refreshLogs: () => Promise<void>;
  addLog: (log: Log) => void;
  loadMoreLogs: () => Promise<void>;
  tagFilter: string;
  setTagFilter: (value: string) => void;
  userFilter: string;
  setUserFilter: (value: string) => void;
  showOnlyMine: boolean;
  setShowOnlyMine: (value: boolean) => void;
  clearFilters: () => void;
  currentUserName: string;
  userId: string | null;
}

const LogsContext = createContext<LogsContextType | undefined>(undefined);

interface LogsContextProviderProps {
  children: ReactNode;
  enableRealtime?: boolean;
}

export const LogsContextProvider = ({
  children,
  enableRealtime = true,
}: LogsContextProviderProps) => {
  const { user: authUser } = UserAuth();
  const [allLogs, setAllLogs] = useState<Log[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [_pageSize] = useState(10);
  const [tagFilter, setTagFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [showOnlyMine, setShowOnlyMine] = useState(false);

  const userId = authUser?.uid || "";
  const currentUserName = authUser?.displayName || "";

  if (!userId && enableRealtime) {
    console.warn("No authenticated user found - logs will not load");
  }

  const clearFilters = () => {
    setTagFilter("");
    setUserFilter("");
    setShowOnlyMine(false);
  };

  const filterLogs = useCallback(() => {
    const filteredLogs = allLogs.filter((log) => {
      const matchesTagFilter = tagFilter
        ? tagFilter
            .split(",")
            .map((tag) => tag.trim().toLowerCase())
            .some((tag) =>
              log.tags.some((logTag) => logTag.toLowerCase().includes(tag))
            )
        : true;

      const matchesUserFilter = userFilter
        ? log.user.toLowerCase().includes(userFilter.toLowerCase())
        : true;

      const matchesShowOnlyMine = showOnlyMine
        ? log.user === currentUserName
        : true;

      return matchesTagFilter && matchesUserFilter && matchesShowOnlyMine;
    });

    const paginatedFilteredLogs = filteredLogs.slice(0, page * _pageSize);
    setLogs(paginatedFilteredLogs);
    setHasMore(filteredLogs.length > paginatedFilteredLogs.length);
  }, [
    allLogs,
    tagFilter,
    userFilter,
    showOnlyMine,
    currentUserName,
    page,
    _pageSize,
  ]);

  // Set up real-time subscription if enabled
  useEffect(() => {
    if (!enableRealtime || !userId) {
      setAllLogs([]);
      setLogs([]);
      setLoading(false);
      return;
    }

    let unsubscribe: () => void = () => {};

    const setupRealtimeSubscription = async () => {
      try {
        unsubscribe = subscribeToFriendsLogs(
          userId,
          (updatedLogs: OrganizedLogEntry[]) => {
            setLoading(false);
            setAllLogs(updatedLogs);
            const startIndex = 0;
            const endIndex = _pageSize;
            const paginatedLogs = updatedLogs.slice(startIndex, endIndex);

            setLogs(paginatedLogs);
            setHasMore(endIndex < updatedLogs.length);
            setPage(1);
          },
          (error: Error) => {
            setLoading(false);
            logError("Realtime subscription error", error, {
              component: "LogsContext",
              function: "realtimeSubscription",
            });
            setError(error);
          }
        );
      } catch (error) {
        setLoading(false);
        if (error instanceof Error) {
          logError("Failed to set up realtime subscription", error, {
            component: "LogsContext",
            function: "setupRealtimeSubscription",
          });
          setError(error);
        }
      }
    };

    setupRealtimeSubscription();

    return () => {
      unsubscribe();
    };
  }, [userId, enableRealtime, _pageSize]);

  const refreshLogs = async () => {
    setLoading(true);
  };

  const loadMoreLogs = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      // Increment page to load more logs
      const nextPage = page + 1;
      setPage(nextPage);

      // filterLogs will be called via useEffect when page changes
      // The filtering and pagination logic in filterLogs handles the rest
    } catch (err) {
      logError(
        "Failed to load more logs",
        err instanceof Error ? err : new Error(String(err)),
        {
          component: "LogsContext",
          function: "loadMoreLogs",
        }
      );
      setError(
        err instanceof Error ? err : new Error("Failed to load more logs")
      );
    } finally {
      setLoading(false);
    }
  };

  const addLog = (log: Log) => {
    setAllLogs((prevLogs) => [log, ...prevLogs]);
  };

  useEffect(() => {
    filterLogs();
  }, [filterLogs]);

  return (
    <LogsContext.Provider
      value={{
        logs,
        allLogs,
        loading,
        error,
        hasMore,
        page,
        refreshLogs,
        addLog,
        loadMoreLogs,
        tagFilter,
        setTagFilter,
        userFilter,
        setUserFilter,
        showOnlyMine,
        setShowOnlyMine,
        clearFilters,
        currentUserName,
        userId,
      }}
    >
      {children}
    </LogsContext.Provider>
  );
};

export const useLogs = (): LogsContextType => {
  const context = useContext(LogsContext);
  if (context === undefined) {
    throw new Error("useLogs must be used within a LogsProvider");
  }
  return context;
};
