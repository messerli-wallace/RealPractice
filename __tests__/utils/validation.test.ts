import { validateLogData, validateUserData } from "../../lib/utils/validation";

describe("Validation Utilities", () => {
  describe("validateLogData", () => {
    it("returns true for valid log data", () => {
      const validData = {
        description: "Practiced scales",
        duration: 30,
        tags: ["guitar", "scales"],
        userId: "test-user-id",
        username: "testuser",
        timestamp: new Date(),
      };

      expect(validateLogData(validData)).toBe(true);
    });

    it("returns false for invalid log data with missing required fields", () => {
      const invalidData = {
        description: "",
        duration: 0,
        tags: [],
        userId: "",
        username: "",
        timestamp: new Date(),
      };

      expect(validateLogData(invalidData)).toBe(false);
    });

    it("returns false for invalid log data with negative duration", () => {
      const invalidData = {
        description: "Practiced scales",
        duration: -10,
        tags: ["guitar"],
        userId: "test-user-id",
        username: "testuser",
        timestamp: new Date(),
      };

      expect(validateLogData(invalidData)).toBe(false);
    });
  });

  describe("validateUserData", () => {
    it("returns true for valid user data", () => {
      const validData = {
        userId: "test-user-id",
        username: "testuser",
        email: "test@example.com",
        bio: "Test bio",
        profilePicture: "test.jpg",
      };

      expect(validateUserData(validData)).toBe(true);
    });

    it("returns false for invalid user data with missing required fields", () => {
      const invalidData = {
        userId: "",
        username: "",
        email: "invalid-email",
        bio: "",
        profilePicture: "",
      };

      expect(validateUserData(invalidData)).toBe(false);
    });

    it("returns false for invalid user data with invalid email", () => {
      const invalidData = {
        userId: "test-user-id",
        username: "testuser",
        email: "invalid-email",
        bio: "Test bio",
        profilePicture: "test.jpg",
      };

      expect(validateUserData(invalidData)).toBe(false);
    });
  });
});
