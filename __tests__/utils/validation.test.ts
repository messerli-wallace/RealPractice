import {
  validateDescription,
  validateDuration,
  validateTags,
  validateName,
  validateLogEntry,
  validateDateTimeString,
} from "../../lib/utils/validation";

describe("Validation Utilities", () => {
  describe("validateDescription", () => {
    it("returns true for valid description", () => {
      const result = validateDescription("Practiced scales");
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe("Practiced scales");
    });

    it("returns false for empty description", () => {
      const result = validateDescription("");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("at least");
    });

    it("returns false for description that is too long", () => {
      const result = validateDescription("a".repeat(1001));
      expect(result.valid).toBe(false);
      expect(result.error).toContain("exceed");
    });
  });

  describe("validateDuration", () => {
    it("returns true for valid duration", () => {
      const result = validateDuration("30");
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe("30");
    });

    it("returns false for empty duration", () => {
      const result = validateDuration("");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Duration is required");
    });

    it("returns false for duration that is too low", () => {
      const result = validateDuration("0");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("at least");
    });

    it("returns false for duration that is too high", () => {
      const result = validateDuration("1500");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("exceed");
    });
  });

  describe("validateTags", () => {
    it("returns true for valid tags", () => {
      const result = validateTags(["guitar", "scales"]);
      expect(result.valid).toBe(true);
      expect(result.sanitized).toEqual(["guitar", "scales"]);
    });

    it("returns false for empty tags array", () => {
      const result = validateTags([]);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("At least one tag is required");
    });

    it("returns false for too many tags", () => {
      const result = validateTags(["a", "b", "c", "d", "e", "f"]);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("more than");
    });
  });

  describe("validateName", () => {
    it("returns true for valid name", () => {
      const result = validateName("testuser");
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe("testuser");
    });

    it("returns false for empty name", () => {
      const result = validateName("");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("at least");
    });

    it("returns false for name that is too long", () => {
      const result = validateName("a".repeat(51));
      expect(result.valid).toBe(false);
      expect(result.error).toContain("exceed");
    });
  });

  describe("validateLogEntry", () => {
    it("returns true for valid log entry", () => {
      const validLog = {
        dateTimeStr: "01-15-2026-10-30-GMT+0",
        duration: "30",
        description: "Practiced scales",
        tags: ["guitar", "scales"],
      };
      const result = validateLogEntry(validLog);
      expect(result.valid).toBe(true);
    });

    it("returns false for log entry with missing datetime", () => {
      const invalidLog = {
        dateTimeStr: "",
        duration: "30",
        description: "Practiced scales",
        tags: ["guitar"],
      };
      const result = validateLogEntry(invalidLog);
      expect(result.valid).toBe(false);
      expect(result.errors.dateTimeStr).toBeDefined();
    });

    it("returns false for log entry with invalid duration", () => {
      const invalidLog = {
        dateTimeStr: "01-15-2026-10-30-GMT+0",
        duration: "0",
        description: "Practiced scales",
        tags: ["guitar"],
      };
      const result = validateLogEntry(invalidLog);
      expect(result.valid).toBe(false);
      expect(result.errors.duration).toBeDefined();
    });

    it("returns false for log entry with empty description", () => {
      const invalidLog = {
        dateTimeStr: "01-15-2026-10-30-GMT+0",
        duration: "30",
        description: "",
        tags: ["guitar"],
      };
      const result = validateLogEntry(invalidLog);
      expect(result.valid).toBe(false);
      expect(result.errors.description).toBeDefined();
    });

    it("returns false for log entry with empty tags", () => {
      const invalidLog = {
        dateTimeStr: "01-15-2026-10-30-GMT+0",
        duration: "30",
        description: "Practiced scales",
        tags: [],
      };
      const result = validateLogEntry(invalidLog);
      expect(result.valid).toBe(false);
      expect(result.errors.tags).toBeDefined();
    });
  });

  describe("validateDateTimeString", () => {
    it("returns true for valid datetime string", () => {
      const result = validateDateTimeString("01-15-2026-10-30-GMT+0");
      expect(result).toBe(true);
    });

    it("returns false for invalid datetime string", () => {
      const result = validateDateTimeString("invalid-datetime");
      expect(result).toBe(false);
    });
  });
});
