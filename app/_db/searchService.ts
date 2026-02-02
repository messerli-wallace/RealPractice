import {
  collection,
  getDocs,
  query,
  where,
  limit,
  doc,
  setDoc,
  arrayUnion,
  Firestore,
} from "firebase/firestore";
import { db, isConfigured } from "../firebase";
import {
  UserData,
  LogItem,
  SearchResultItem,
  validateSearchResultItem,
} from "../../types/index";
import { logError } from "../../lib/utils/errorLogger";
import { isNetworkError } from "../../lib/utils/networkUtils";

function getDb(): Firestore {
  if (!isConfigured || !db) {
    throw new Error(
      "Firebase is not configured. Please set up your Firebase credentials."
    );
  }
  return db;
}

/**
 * Fuzzy search for users by name (partial matching)
 * Uses Firestore's range queries for prefix matching
 */
export const fuzzySearchUsersByName = async (
  searchTerm: string,
  limitCount: number = 10,
  retryCount = 0
): Promise<SearchResultItem[]> => {
  if (!isConfigured || !searchTerm) {
    return [];
  }

  try {
    const db = getDb();
    const coll = collection(db, "users");

    // Create range query for prefix matching
    // This finds names that start with the search term
    const q = query(
      coll,
      where("name", ">=", searchTerm),
      where("name", "<=", searchTerm + "\uf8ff"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);

    const results: SearchResultItem[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const searchItem: SearchResultItem = {
        id: doc.id,
        name: data.name || doc.id,
        type: "user",
        description: data.bio || undefined,
      };

      if (validateSearchResultItem(searchItem)) {
        results.push(searchItem);
      }
    });

    return results;
  } catch (error) {
    if (error instanceof Error) {
      logError("Failed to perform fuzzy user search", error, {
        component: "searchService",
        function: "fuzzySearchUsersByName",
        metadata: { searchTerm, limitCount, retryCount },
      });
    }

    if (retryCount < 3 && isNetworkError(error)) {
      return fuzzySearchUsersByName(searchTerm, limitCount, retryCount + 1);
    }
    throw error;
  }
};

/**
 * Advanced fuzzy search that includes partial matching within names
 * This is more comprehensive but requires client-side filtering
 */
export const advancedFuzzySearchUsers = async (
  searchTerm: string,
  limitCount: number = 20,
  retryCount = 0
): Promise<SearchResultItem[]> => {
  if (!isConfigured) {
    console.error("Firebase not configured - cannot search users");
    throw new Error("Firebase not configured");
  }

  if (!searchTerm || searchTerm.trim().length === 0) {
    return [];
  }

  const trimmedSearchTerm = searchTerm.trim();

  try {
    const db = getDb();
    const coll = collection(db, "users");

    // Get a broader set of results (all users for now, but could be optimized)
    const q = query(coll, limit(limitCount * 2)); // Get more to filter client-side
    const querySnapshot = await getDocs(q);

    const results: SearchResultItem[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const userName = data.name || doc.id;

      // Client-side fuzzy matching
      if (
        typeof userName === "string" &&
        userName.toLowerCase().includes(trimmedSearchTerm.toLowerCase())
      ) {
        const searchItem: SearchResultItem = {
          id: doc.id,
          name: userName,
          type: "user",
          description: data.bio || undefined,
        };

        if (validateSearchResultItem(searchItem)) {
          results.push(searchItem);
        }
      }
    });

    // Sort by relevance (exact matches first, then prefix matches, then partial matches)
    return results
      .sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const searchLower = trimmedSearchTerm.toLowerCase();

        const aExact = aName === searchLower;
        const bExact = bName === searchLower;

        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        const aStartsWith = aName.startsWith(searchLower);
        const bStartsWith = bName.startsWith(searchLower);

        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;

        // If neither is exact nor starts with, sort by position of search term
        const aIndex = aName.indexOf(searchLower);
        const bIndex = bName.indexOf(searchLower);

        return aIndex - bIndex;
      })
      .slice(0, limitCount);
  } catch (error) {
    if (error instanceof Error) {
      logError("Failed to perform advanced fuzzy search", error, {
        component: "searchService",
        function: "advancedFuzzySearchUsers",
        metadata: { searchTerm: trimmedSearchTerm, limitCount, retryCount },
      });
    }

    if (retryCount < 3 && isNetworkError(error)) {
      return fuzzySearchUsersByName(searchTerm, limitCount, retryCount + 1);
    }
    throw error;
  }
};

/**
 * Search logs by multiple criteria (tags, date ranges, etc.)
 */
export const searchLogsByCriteria = async (
  criteria: {
    tags?: string[];
    startDate?: string;
    endDate?: string;
    minDuration?: number;
    maxDuration?: number;
    searchText?: string;
  },
  limitCount: number = 10,
  retryCount = 0
): Promise<SearchResultItem[]> => {
  if (!isConfigured) {
    return [];
  }

  try {
    const db = getDb();
    const coll = collection(db, "users");

    const q = query(coll);
    const querySnapshot = await getDocs(q);

    const results: SearchResultItem[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const logs = data.logs || [];

      logs.forEach((log: LogItem) => {
        // Apply all filters
        const matchesTag =
          !criteria.tags ||
          criteria.tags.length === 0 ||
          (log.tags && log.tags.some((t) => criteria.tags?.includes(t)));

        const matchesDateRange =
          !criteria.startDate ||
          !criteria.endDate ||
          (log.createdAt &&
            log.createdAt >= criteria.startDate &&
            log.createdAt <= criteria.endDate);

        const matchesDuration =
          (!criteria.minDuration && !criteria.maxDuration) ||
          (log.duration &&
            (!criteria.minDuration ||
              parseInt(log.duration) >= criteria.minDuration) &&
            (!criteria.maxDuration ||
              parseInt(log.duration) <= criteria.maxDuration));

        const matchesSearchText =
          !criteria.searchText ||
          (log.description &&
            log.description
              .toLowerCase()
              .includes(criteria.searchText.toLowerCase())) ||
          (log.tags &&
            log.tags.some((t: string) =>
              t.toLowerCase().includes(criteria.searchText?.toLowerCase() || "")
            ));

        if (
          matchesTag &&
          matchesDateRange &&
          matchesDuration &&
          matchesSearchText
        ) {
          const searchItem: SearchResultItem = {
            id: `${doc.id}_${log.id || Math.random().toString(36).substr(2, 9)}`,
            name: data.name || doc.id,
            type: "log",
            description: log.description || undefined,
            tags: log.tags || undefined,
          };

          if (validateSearchResultItem(searchItem)) {
            results.push(searchItem);
          }
        }
      });
    });

    return results
      .sort((a, b) => {
        // Sort by date (newest first) if date information is available
        return b.id.localeCompare(a.id); // Simple sort for now
      })
      .slice(0, limitCount);
  } catch (error) {
    if (error instanceof Error) {
      logError("Failed to search logs by criteria", error, {
        component: "searchService",
        function: "searchLogsByCriteria",
        metadata: { criteria, limitCount, retryCount },
      });
    }

    if (retryCount < 3 && isNetworkError(error)) {
      return searchLogsByCriteria(criteria, limitCount, retryCount + 1);
    }
    throw error;
  }
};

export const searchLogsByTag = async (
  tag: string,
  limitCount: number = 10,
  retryCount: number = 0
): Promise<SearchResultItem[]> => {
  if (!isConfigured || !tag) {
    return [];
  }

  try {
    const db = getDb();
    const coll = collection(db, "users");

    // Search for logs containing the tag (case-insensitive)
    const q = query(coll);
    const querySnapshot = await getDocs(q);

    const results: SearchResultItem[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const logs = data.logs || [];

      logs.forEach((log: LogItem) => {
        if (log.tags && Array.isArray(log.tags)) {
          const matchingTags = log.tags.filter((t) =>
            t.toLowerCase().includes(tag.toLowerCase())
          );

          if (matchingTags.length > 0) {
            const searchItem: SearchResultItem = {
              id: `${doc.id}_${log.id || Math.random().toString(36).substr(2, 9)}`,
              name: data.name || doc.id,
              type: "log",
              description: log.description || undefined,
              tags: matchingTags,
            };

            if (validateSearchResultItem(searchItem)) {
              results.push(searchItem);
            }
          }
        }
      });
    });

    return results.slice(0, limitCount);
  } catch (error) {
    if (error instanceof Error) {
      logError("Failed to search logs by tag", error, {
        component: "searchService",
        function: "searchLogsByTag",
        metadata: { tag, limitCount, retryCount },
      });
    }

    if (retryCount < 3 && isNetworkError(error)) {
      return searchLogsByTag(tag, limitCount, retryCount + 1);
    }
    throw error;
  }
};

/**
 * Combined search across users and logs
 */
export const globalSearch = async (
  searchTerm: string,
  limitCount: number = 10,
  retryCount = 0
): Promise<{ users: SearchResultItem[]; logs: SearchResultItem[] }> => {
  try {
    // Perform parallel searches
    const [users, logs] = await Promise.all([
      advancedFuzzySearchUsers(searchTerm, limitCount / 2),
      searchLogsByTag(searchTerm, limitCount / 2),
    ]);

    return { users, logs };
  } catch (error) {
    if (error instanceof Error) {
      logError("Failed to perform global search", error, {
        component: "searchService",
        function: "globalSearch",
        metadata: { searchTerm, limitCount, retryCount },
      });
    }

    if (retryCount < 3 && isNetworkError(error)) {
      return globalSearch(searchTerm, limitCount, retryCount + 1);
    }
    throw error;
  }
};

/**
 * Create search indexes for better performance
 * This would be called when new data is added
 */
export const createSearchIndexes = async (
  userId: string,
  userData: UserData
): Promise<void> => {
  try {
    const db = getDb();

    // For now, this is a placeholder for a more comprehensive indexing system
    // In a production app, you would create separate index documents
    // for names, tags, etc. to enable efficient searching

    // Example: Create name index
    if (userData.name) {
      const nameIndexRef = doc(
        db,
        "searchIndexes",
        `names_${userData.name.toLowerCase()}`
      );
      await setDoc(
        nameIndexRef,
        {
          userIds: arrayUnion(userId),
        },
        { merge: true }
      );
    }

    // Example: Create tag indexes
    if (userData.logs) {
      for (const log of userData.logs) {
        if (log.tags) {
          for (const tag of log.tags) {
            const tagIndexRef = doc(
              db,
              "searchIndexes",
              `tags_${tag.toLowerCase()}`
            );
            await setDoc(
              tagIndexRef,
              {
                logIds: arrayUnion(`${userId}_${log.id || Math.random()}`),
              },
              { merge: true }
            );
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      logError("Failed to create search indexes", error, {
        component: "searchService",
        function: "createSearchIndexes",
        metadata: { userId },
      });
    }
    throw error;
  }
};
