"use client";

import React, {
  useContext,
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { getRecentLogs } from "../_db/log_feed";
import { subscribeToFriendsLogs } from "../_db/realtimeService";
import { OrganizedLogEntry } from "../../types/index";
import { logError } from "../../lib/utils/errorLogger";

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
  initialUserId: string;
}

const LogsContext = createContext<LogsContextType | undefined>(undefined);

interface LogsContextProviderProps {
  children: ReactNode;
  initialUserId?: string;
  enableRealtime?: boolean;
}

export const LogsContextProvider = ({
  children,
  initialUserId = "Jack M",
  enableRealtime = true,
}: LogsContextProviderProps) => {
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
        ? log.user === initialUserId
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
    initialUserId,
    page,
    _pageSize,
  ]);

  const fetchLogs = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const recentLogs = await getRecentLogs(initialUserId);

      setAllLogs(recentLogs);

      if (append) {
        setAllLogs((prevLogs) => [...prevLogs, ...recentLogs]);
      }

      const startIndex = (pageNum - 1) * _pageSize;
      const endIndex = startIndex + _pageSize;
      const paginatedLogs = recentLogs.slice(startIndex, endIndex);

      if (append) {
        setLogs((prevLogs) => [...prevLogs, ...paginatedLogs]);
      } else {
        setLogs(paginatedLogs);
      }

      setHasMore(endIndex < recentLogs.length);
      setPage(pageNum);
    } catch (err) {
      if (err instanceof Error) {
        logError("Error fetching logs", err, {
          component: "LogsContext",
          function: "fetchLogs",
        });
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription if enabled
  useEffect(() => {
    if (!enableRealtime) return;

    let unsubscribe: () => void = () => {};

    const setupRealtimeSubscription = async () => {
      try {
        unsubscribe = subscribeToFriendsLogs(
          initialUserId,
          (updatedLogs: OrganizedLogEntry[]) => {
            // Convert to pagination format
            const startIndex = 0;
            const endIndex = _pageSize;
            const paginatedLogs = updatedLogs.slice(startIndex, endIndex);

            setLogs(paginatedLogs);
            setHasMore(endIndex < updatedLogs.length);
            setPage(1);
          },
          (error: Error) => {
            logError("Realtime subscription error", error, {
              component: "LogsContext",
              function: "realtimeSubscription",
            });
            setError(error);
          }
        );
      } catch (error) {
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
  }, [initialUserId, enableRealtime, _pageSize]);

  const refreshLogs = async () => {
    await fetchLogs(1, false);
  };

  const loadMoreLogs = async () => {
    if (loading || !hasMore) return;
    await fetchLogs(page + 1, true);
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
        initialUserId,
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
