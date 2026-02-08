import {
  updateTagAnalytics,
  decrementTagAnalytics,
  calculateTagAnalyticsFromLogs,
} from "../app/_db/tagAnalytics";

interface TestLog {
  tags: string[];
  createdAt: string;
}

describe("Tag Analytics Utilities", () => {
  describe("updateTagAnalytics", () => {
    it("should create new analytics object for undefined input", () => {
      const result = updateTagAnalytics(undefined, ["music", "piano"]);
      expect(result).toEqual({ music: 1, piano: 1 });
    });

    it("should increment existing tags", () => {
      const currentAnalytics = { music: 3, piano: 2 };
      const result = updateTagAnalytics(currentAnalytics, [
        "music",
        "meditation",
      ]);
      expect(result).toEqual({ music: 4, piano: 2, meditation: 1 });
    });

    it("should handle empty tags array", () => {
      const currentAnalytics = { music: 1 };
      const result = updateTagAnalytics(currentAnalytics, []);
      expect(result).toEqual({ music: 1 });
    });

    it("should normalize tags to lowercase", () => {
      const result = updateTagAnalytics(undefined, ["Music", "MUSIC", "music"]);
      expect(result).toEqual({ music: 3 });
    });
  });

  describe("decrementTagAnalytics", () => {
    it("should return empty object for undefined input", () => {
      const result = decrementTagAnalytics(undefined, ["music"]);
      expect(result).toEqual({});
    });

    it("should decrement existing tags", () => {
      const currentAnalytics = { music: 3, piano: 2 };
      const result = decrementTagAnalytics(currentAnalytics, [
        "music",
        "meditation",
      ]);
      expect(result).toEqual({ music: 2, piano: 2 });
    });

    it("should not decrement below 0", () => {
      const currentAnalytics = { music: 1 };
      const result = decrementTagAnalytics(currentAnalytics, [
        "music",
        "piano",
      ]);
      expect(result).toEqual({ music: 0 });
    });
  });

  describe("calculateTagAnalyticsFromLogs", () => {
    it("should calculate analytics from logs", () => {
      const logs: TestLog[] = [
        { tags: ["music", "piano"], createdAt: "2024-01-01" },
        { tags: ["music", "meditation"], createdAt: "2024-01-02" },
        { tags: ["piano"], createdAt: "2024-01-03" },
      ];
      const result = calculateTagAnalyticsFromLogs(logs as any);
      expect(result).toEqual({ music: 2, piano: 2, meditation: 1 });
    });

    it("should handle empty logs array", () => {
      const result = calculateTagAnalyticsFromLogs([]);
      expect(result).toEqual({});
    });

    it("should normalize tags to lowercase", () => {
      const logs: TestLog[] = [
        { tags: ["Music", "MUSIC"], createdAt: "2024-01-01" },
      ];
      const result = calculateTagAnalyticsFromLogs(logs as any);
      expect(result).toEqual({ music: 2 });
    });
  });
});
