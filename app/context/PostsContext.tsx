import React, {
  useContext,
  createContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getRecentPosts } from "../_db/post_feed.tsx";
import { subscribeToFriendsPosts } from "../_db/realtimeService";
import { logError } from "../../lib/utils/errorLogger";

interface Post {
  user: string;
  dateTimeStr: string;
  duration: string;
  tags: string[];
  description: string | null;
}

interface PostsContextType {
  posts: Post[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  page: number;
  refreshPosts: () => Promise<void>;
  addPost: (post: Post) => void;
  loadMorePosts: () => Promise<void>;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

interface PostsContextProviderProps {
  children: ReactNode;
  initialUserId?: string;
  enableRealtime?: boolean;
}

export const PostsContextProvider = ({
  children,
  initialUserId = "Jack M",
  enableRealtime = true,
}: PostsContextProviderProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [_pageSize] = useState(10);

  const fetchPosts = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const recentPosts = await getRecentPosts(initialUserId);

      // Simulate pagination - in a real app, this would come from the API
      const startIndex = (pageNum - 1) * _pageSize;
      const endIndex = startIndex + _pageSize;
      const paginatedPosts = recentPosts.slice(startIndex, endIndex);

      if (append) {
        setPosts((prevPosts) => [...prevPosts, ...paginatedPosts]);
      } else {
        setPosts(paginatedPosts);
      }

      // Check if there are more posts to load
      setHasMore(endIndex < recentPosts.length);
      setPage(pageNum);
    } catch (err) {
      if (err instanceof Error) {
        logError("Error fetching posts", err, {
          component: "PostsContext",
          function: "fetchPosts",
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
        unsubscribe = subscribeToFriendsPosts(
          initialUserId,
          (updatedPosts) => {
            // Convert to pagination format
            const startIndex = 0;
            const endIndex = _pageSize;
            const paginatedPosts = updatedPosts.slice(startIndex, endIndex);

            setPosts(paginatedPosts);
            setHasMore(endIndex < updatedPosts.length);
            setPage(1);
          },
          (error) => {
            logError("Realtime subscription error", error, {
              component: "PostsContext",
              function: "realtimeSubscription",
            });
            setError(error);
          }
        );
      } catch (error) {
        if (error instanceof Error) {
          logError("Failed to set up realtime subscription", error, {
            component: "PostsContext",
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

  const refreshPosts = async () => {
    await fetchPosts(1, false);
  };

  const loadMorePosts = async () => {
    if (loading || !hasMore) return;
    await fetchPosts(page + 1, true);
  };

  const addPost = (post: Post) => {
    setPosts((prevPosts) => [post, ...prevPosts]);
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUserId]);

  return (
    <PostsContext.Provider
      value={{
        posts,
        loading,
        error,
        hasMore,
        page,
        refreshPosts,
        addPost,
        loadMorePosts,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
};

export const usePosts = (): PostsContextType => {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error("usePosts must be used within a PostsProvider");
  }
  return context;
};
