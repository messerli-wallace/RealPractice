import { createLog, getUserData, getUserLogs } from "../../app/_db/db";

// Mock Firebase
jest.mock("../../app/firebase", () => ({
  db: {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    set: jest.fn().mockResolvedValue({}),
    get: jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({ username: "testuser" }),
    }),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({
      docs: [
        {
          id: "log1",
          data: () => ({
            description: "Test log",
            duration: 30,
            tags: ["test"],
            userId: "test-user-id",
            username: "testuser",
            timestamp: new Date(),
          }),
        },
      ],
    }),
  },
}));

describe("Database Functions", () => {
  describe("createLog", () => {
    it("creates a log successfully", async () => {
      const logData = {
        description: "Test log",
        duration: 30,
        tags: ["test"],
        userId: "test-user-id",
        username: "testuser",
        timestamp: new Date(),
      };

      const result = await createLog(logData);
      expect(result).toHaveProperty("id");
    });

    it("handles errors when creating a log", async () => {
      // Mock the database to reject
      jest.mock("../../app/firebase", () => ({
        db: {
          collection: jest.fn().mockReturnThis(),
          doc: jest.fn().mockReturnThis(),
          set: jest.fn().mockRejectedValue(new Error("Database error")),
        },
      }));

      const logData = {
        description: "Test log",
        duration: 30,
        tags: ["test"],
        userId: "test-user-id",
        username: "testuser",
        timestamp: new Date(),
      };

      await expect(createLog(logData)).rejects.toThrow("Database error");
    });
  });

  describe("getUserData", () => {
    it("retrieves user data successfully", async () => {
      const result = await getUserData("test-user-id");
      expect(result).toEqual({ username: "testuser" });
    });

    it("handles errors when retrieving user data", async () => {
      // Mock the database to reject
      jest.mock("../../app/firebase", () => ({
        db: {
          collection: jest.fn().mockReturnThis(),
          doc: jest.fn().mockReturnThis(),
          get: jest.fn().mockRejectedValue(new Error("Database error")),
        },
      }));

      await expect(getUserData("test-user-id")).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("getUserLogs", () => {
    it("retrieves user logs successfully", async () => {
      const result = await getUserLogs("test-user-id");
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("id", "log1");
    });

    it("handles errors when retrieving user logs", async () => {
      // Mock the database to reject
      jest.mock("../../app/firebase", () => ({
        db: {
          collection: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          get: jest.fn().mockRejectedValue(new Error("Database error")),
        },
      }));

      await expect(getUserLogs("test-user-id")).rejects.toThrow(
        "Database error"
      );
    });
  });
});
