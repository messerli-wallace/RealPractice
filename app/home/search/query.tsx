import { collection, getDocs, query, where } from "firebase/firestore";
import { db, isConfigured } from "../../firebase";
import {
  SearchResultItem,
  validateSearchResultItem,
} from "../../../types/index";
import { logError } from "../../../lib/utils/errorLogger";

function getDb() {
  if (!isConfigured || !db) {
    throw new Error(
      "Firebase is not configured. Please set up your Firebase credentials."
    );
  }
  return db;
}

/**
 * Helper function to check if an error is network-related
 */
function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("network") ||
      error.message.includes("timeout") ||
      error.message.includes("failed to fetch") ||
      error.message.includes("offline")
    );
  }
  return false;
}

// Function to perform a query
export const queryUserByName = async (
  search: string,
  retryCount = 0
): Promise<SearchResultItem[]> => {
  if (!isConfigured) {
    return [];
  }

  try {
    const db = getDb();
    const coll = collection(db, "users");
    const q = query(coll, where("name", "==", search));

    const targetAccounts = await getDocs(q);

    const returnData: SearchResultItem[] = [];
    targetAccounts.forEach((doc) => {
      const data = doc.data();
      const searchItem: SearchResultItem = {
        id: doc.id,
        name: data.name || doc.id,
        type: "user" as const,
      };

      // Validate the search result item before adding to results
      if (validateSearchResultItem(searchItem)) {
        returnData.push(searchItem);
      } else {
        logError("Invalid search result item", new Error("Validation failed"), {
          component: "search",
          function: "queryUserByName",
          metadata: { searchItem },
        });
      }
    });
    // console.log(returnData);
    return returnData;
  } catch (error) {
    // Log the error with context
    if (error instanceof Error) {
      logError("Failed to perform search", error, {
        component: "search",
        function: "queryUserByName",
        metadata: { search, retryCount },
      });
    }

    // Implement retry logic for network errors
    if (retryCount < 3 && isNetworkError(error)) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, retryCount))
      );
      return queryUserByName(search, retryCount + 1);
    }

    throw error;
  }
};
