import {
  createData,
  readData,
  updateData,
  deleteData,
  addLog,
  removeLog,
  docExists,
  followUser,
  unfollowUser,
} from "../../app/_db/db";
import { setDoc, getDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { validateUserData, validateLogItem } from "../../types/index";
import { logError } from "../../lib/utils/errorLogger";
import { isNetworkError } from "../../lib/utils/networkUtils";

// Mock Firebase Firestore
jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  arrayUnion: jest.fn((item) => ({ __op: "arrayUnion", item })),
  arrayRemove: jest.fn((item) => ({ __op: "arrayRemove", item })),
}));

// Mock the firebase module
jest.mock("../../app/firebase", () => ({
  db: {},
}));

// Mock error logger
jest.mock("../../lib/utils/errorLogger", () => ({
  logError: jest.fn(),
}));

// Mock network utils
jest.mock("../../lib/utils/networkUtils", () => ({
  isNetworkError: jest.fn(),
}));

// Mock types validation
jest.mock("../../types/index", () => ({
  ...jest.requireActual("../../types/index"),
  validateUserData: jest.fn(),
  validateLogItem: jest.fn(),
}));

describe("Database Operations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createData", () => {
    const mockDocPath = "user123";
    const mockData = {
      name: "Test User",
      email: "test@example.com",
      logs: [],
    };

    it("creates a document with merge option", async () => {
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      await createData(mockDocPath, mockData);

      expect(doc).toHaveBeenCalledWith(expect.anything(), "users", mockDocPath);
      expect(setDoc).toHaveBeenCalledWith(undefined, mockData, { merge: true });
    });

    it("retries on network error and succeeds", async () => {
      (isNetworkError as jest.Mock).mockReturnValue(true);
      (setDoc as jest.Mock)
        .mockRejectedValueOnce(new Error("network error"))
        .mockResolvedValueOnce(undefined);

      await createData(mockDocPath, mockData);

      expect(setDoc).toHaveBeenCalledTimes(2);
    });

    it("throws after max retries and logs error", async () => {
      (isNetworkError as jest.Mock).mockReturnValue(true);
      const networkError = new Error("network error");
      (setDoc as jest.Mock).mockRejectedValue(networkError);

      // Should make 4 attempts (initial + 3 retries)
      await expect(createData(mockDocPath, mockData)).rejects.toThrow(
        "network error"
      );
      expect(setDoc).toHaveBeenCalledTimes(4);
      expect(logError).toHaveBeenCalled();
    }, 15000);

    it("throws non-network errors immediately", async () => {
      (isNetworkError as jest.Mock).mockReturnValue(false);
      const authError = new Error("permission denied");
      (setDoc as jest.Mock).mockRejectedValue(authError);

      await expect(createData(mockDocPath, mockData)).rejects.toThrow(
        "permission denied"
      );
      expect(setDoc).toHaveBeenCalledTimes(1);
      expect(logError).toHaveBeenCalled();
    });
  });

  describe("readData", () => {
    const mockDocPath = "user123";
    const mockUserData = {
      name: "Test User",
      email: "test@example.com",
      logs: [],
    };

    it("returns data when document exists and is valid", async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        data: () => mockUserData,
      });
      (validateUserData as jest.Mock).mockReturnValue(mockUserData);

      const result = await readData(mockDocPath);

      expect(result).toEqual(mockUserData);
      expect(doc).toHaveBeenCalledWith(expect.anything(), "users", mockDocPath);
    });

    it("returns undefined when validation fails", async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        data: () => ({ invalid: "data" }),
      });
      (validateUserData as jest.Mock).mockReturnValue(null);

      const result = await readData(mockDocPath);

      expect(result).toBeUndefined();
    });

    it("retries on network error", async () => {
      (isNetworkError as jest.Mock).mockReturnValue(true);
      (getDoc as jest.Mock)
        .mockRejectedValueOnce(new Error("network timeout"))
        .mockResolvedValueOnce({
          data: () => mockUserData,
        });
      (validateUserData as jest.Mock).mockReturnValue(mockUserData);

      const result = await readData(mockDocPath);

      expect(getDoc).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockUserData);
    });

    it("throws after max retries", async () => {
      (isNetworkError as jest.Mock).mockReturnValue(true);
      (getDoc as jest.Mock).mockRejectedValue(new Error("network error"));

      await expect(readData(mockDocPath)).rejects.toThrow("network error");
      expect(getDoc).toHaveBeenCalledTimes(4);
    }, 15000);
  });

  describe("updateData", () => {
    const mockDocPath = "user123";
    const mockUpdateData = {
      name: "Updated User",
    };

    it("updates document successfully", async () => {
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await updateData(mockDocPath, mockUpdateData);

      expect(doc).toHaveBeenCalledWith(expect.anything(), "users", mockDocPath);
      expect(updateDoc).toHaveBeenCalledWith(undefined, mockUpdateData);
    });

    it("retries on network error", async () => {
      (isNetworkError as jest.Mock).mockReturnValue(true);
      (updateDoc as jest.Mock)
        .mockRejectedValueOnce(new Error("network error"))
        .mockResolvedValueOnce(undefined);

      await updateData(mockDocPath, mockUpdateData);

      expect(updateDoc).toHaveBeenCalledTimes(2);
    });

    it("throws after max retries", async () => {
      (isNetworkError as jest.Mock).mockReturnValue(true);
      (updateDoc as jest.Mock).mockRejectedValue(new Error("network error"));

      await expect(updateData(mockDocPath, mockUpdateData)).rejects.toThrow(
        "network error"
      );
      expect(updateDoc).toHaveBeenCalledTimes(4);
    }, 15000);
  });

  describe("deleteData", () => {
    const mockDocPath = "user123";

    it("deletes document successfully", async () => {
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      await deleteData(mockDocPath);

      expect(doc).toHaveBeenCalledWith(expect.anything(), "users", mockDocPath);
      expect(deleteDoc).toHaveBeenCalledWith(undefined);
    });

    it("retries on network error", async () => {
      (isNetworkError as jest.Mock).mockReturnValue(true);
      (deleteDoc as jest.Mock)
        .mockRejectedValueOnce(new Error("network error"))
        .mockResolvedValueOnce(undefined);

      await deleteData(mockDocPath);

      expect(deleteDoc).toHaveBeenCalledTimes(2);
    });

    it("throws after max retries", async () => {
      (isNetworkError as jest.Mock).mockReturnValue(true);
      (deleteDoc as jest.Mock).mockRejectedValue(new Error("network error"));

      await expect(deleteData(mockDocPath)).rejects.toThrow("network error");
      expect(deleteDoc).toHaveBeenCalledTimes(4);
    }, 15000);
  });

  describe("addLog", () => {
    const mockDocPath = "user123";
    const mockLog = {
      createdAt: "2026-01-15T10:30:00.000Z",
      duration: "30",
      description: "Practiced guitar",
      tags: ["guitar"],
    };

    it("adds log when validation passes", async () => {
      (validateLogItem as jest.Mock).mockReturnValue(true);
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await addLog(mockDocPath, mockLog);

      expect(validateLogItem).toHaveBeenCalledWith(mockLog);
      expect(updateDoc).toHaveBeenCalled();
    });

    it("throws error when validation fails", async () => {
      (validateLogItem as jest.Mock).mockReturnValue(false);

      await expect(addLog(mockDocPath, mockLog)).rejects.toThrow(
        "Invalid log item data"
      );
      expect(updateDoc).not.toHaveBeenCalled();
    });

    it("retries on network error", async () => {
      (validateLogItem as jest.Mock).mockReturnValue(true);
      (isNetworkError as jest.Mock).mockReturnValue(true);
      (updateDoc as jest.Mock)
        .mockRejectedValueOnce(new Error("network error"))
        .mockResolvedValueOnce(undefined);

      await addLog(mockDocPath, mockLog);

      expect(updateDoc).toHaveBeenCalledTimes(2);
    });
  });

  describe("removeLog", () => {
    const mockDocPath = "user123";
    const mockLog = {
      createdAt: "2026-01-15T10:30:00.000Z",
      duration: "30",
      description: "Practiced guitar",
      tags: ["guitar"],
    };

    it("removes log successfully", async () => {
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await removeLog(mockDocPath, mockLog);

      expect(doc).toHaveBeenCalledWith(expect.anything(), "users", mockDocPath);
      expect(updateDoc).toHaveBeenCalled();
    });

    it("retries on network error", async () => {
      (isNetworkError as jest.Mock).mockReturnValue(true);
      (updateDoc as jest.Mock)
        .mockRejectedValueOnce(new Error("network error"))
        .mockResolvedValueOnce(undefined);

      await removeLog(mockDocPath, mockLog);

      expect(updateDoc).toHaveBeenCalledTimes(2);
    });
  });

  describe("docExists", () => {
    const mockDocName = "user123";
    const mockUser = {
      uid: "user123",
      displayName: "Test User",
      email: "test@example.com",
      emailVerified: true,
      phoneNumber: null,
      photoURL: null,
      isAnonymous: false,
      providerData: [],
    };

    it("returns true when document exists", async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
      });

      const result = await docExists(mockDocName, mockUser);

      expect(result).toBe(true);
    });

    it("creates document and returns false when document does not exist", async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      const result = await docExists(mockDocName, mockUser);

      expect(result).toBe(false);
      expect(setDoc).toHaveBeenCalled();
    });

    it("retries on network error", async () => {
      (isNetworkError as jest.Mock).mockReturnValue(true);
      (getDoc as jest.Mock)
        .mockRejectedValueOnce(new Error("network error"))
        .mockResolvedValueOnce({
          exists: () => true,
        });

      const result = await docExists(mockDocName, mockUser);

      expect(getDoc).toHaveBeenCalledTimes(2);
      expect(result).toBe(true);
    });
  });

  describe("followUser", () => {
    const currentUserId = "user123";
    const targetUserId = "user456";

    it("adds user to friends array", async () => {
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await followUser(currentUserId, targetUserId);

      expect(updateDoc).toHaveBeenCalledWith(undefined, {
        friends: { __op: "arrayUnion", item: targetUserId },
      });
    });

    it("retries on network error", async () => {
      (isNetworkError as jest.Mock).mockReturnValue(true);
      (updateDoc as jest.Mock)
        .mockRejectedValueOnce(new Error("network error"))
        .mockResolvedValueOnce(undefined);

      await followUser(currentUserId, targetUserId);

      expect(updateDoc).toHaveBeenCalledTimes(2);
    });

    it("throws after max retries and logs error", async () => {
      (isNetworkError as jest.Mock).mockReturnValue(true);
      const networkError = new Error("network error");
      (updateDoc as jest.Mock).mockRejectedValue(networkError);

      await expect(followUser(currentUserId, targetUserId)).rejects.toThrow(
        "network error"
      );
      expect(updateDoc).toHaveBeenCalledTimes(4);
      expect(logError).toHaveBeenCalled();
    }, 15000);
  });

  describe("unfollowUser", () => {
    const currentUserId = "user123";
    const targetUserId = "user456";

    it("removes user from friends array", async () => {
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await unfollowUser(currentUserId, targetUserId);

      expect(updateDoc).toHaveBeenCalledWith(undefined, {
        friends: { __op: "arrayRemove", item: targetUserId },
      });
    });

    it("retries on network error", async () => {
      (isNetworkError as jest.Mock).mockReturnValue(true);
      (updateDoc as jest.Mock)
        .mockRejectedValueOnce(new Error("network error"))
        .mockResolvedValueOnce(undefined);

      await unfollowUser(currentUserId, targetUserId);

      expect(updateDoc).toHaveBeenCalledTimes(2);
    });

    it("throws after max retries and logs error", async () => {
      (isNetworkError as jest.Mock).mockReturnValue(true);
      const networkError = new Error("network error");
      (updateDoc as jest.Mock).mockRejectedValue(networkError);

      await expect(unfollowUser(currentUserId, targetUserId)).rejects.toThrow(
        "network error"
      );
      expect(updateDoc).toHaveBeenCalledTimes(4);
      expect(logError).toHaveBeenCalled();
    }, 15000);
  });
});
