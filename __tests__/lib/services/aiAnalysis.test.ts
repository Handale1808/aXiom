import { analyzeFeedback } from "@/lib/services/aiAnalysis";

jest.mock("@/lib/logger", () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

jest.mock("@anthropic-ai/sdk", () => {
  const mockCreateFn = jest.fn();
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      messages: {
        create: mockCreateFn,
      },
    })),
    getMockCreate: () => mockCreateFn,
  };
});

const Anthropic = require("@anthropic-ai/sdk");
const mockCreateFn = Anthropic.getMockCreate();

function createMockResponse(data: object) {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data),
      },
    ],
  };
}

function createValidAnalysis(overrides = {}) {
  return {
    summary: "User feedback summary",
    sentiment: "neutral" as const,
    tags: ["feedback"],
    priority: "P2" as const,
    nextAction: "Review and respond",
    ...overrides,
  };
}

describe("analyzeFeedback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(async () => {
    await jest.runAllTimersAsync();
    jest.useRealTimers();
  });

  describe("successful analysis", () => {
    it("should analyze feedback successfully with valid API response", async () => {
      const mockAnalysis = createValidAnalysis({
        summary: "User loves the product",
        sentiment: "positive",
        tags: ["praise", "product"],
        nextAction: "Thank the user",
      });

      mockCreateFn.mockResolvedValue(createMockResponse(mockAnalysis));

      const result = await analyzeFeedback("I love this product!");

      expect(result).toEqual(mockAnalysis);
      expect(mockCreateFn).toHaveBeenCalledTimes(1);
      expect(mockCreateFn).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
        })
      );
    });

    it("should pass requestId to logger calls", async () => {
      const mockAnalysis = createValidAnalysis();
      mockCreateFn.mockResolvedValue(createMockResponse(mockAnalysis));

      await analyzeFeedback("Test feedback", "req-123");

      const { info } = require("@/lib/logger");
      expect(info).toHaveBeenCalledWith(
        "Starting feedback analysis",
        expect.objectContaining({ requestId: "req-123" })
      );
    });

    it("should include feedback text in API prompt", async () => {
      const mockAnalysis = createValidAnalysis();
      mockCreateFn.mockResolvedValue(createMockResponse(mockAnalysis));

      await analyzeFeedback("My cat is glowing green");

      expect(mockCreateFn).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: expect.stringContaining("My cat is glowing green"),
            }),
          ]),
        })
      );
    });
  });

  describe("response parsing", () => {
    it("should strip markdown json code blocks from response", async () => {
      const mockAnalysis = createValidAnalysis({ summary: "Parsed correctly" });

      mockCreateFn.mockResolvedValue({
        content: [
          {
            type: "text",
            text: "```json\n" + JSON.stringify(mockAnalysis) + "\n```",
          },
        ],
      });

      const result = await analyzeFeedback("Some feedback");

      expect(result.summary).toBe("Parsed correctly");
    });

    it("should strip plain code blocks from response", async () => {
      const mockAnalysis = createValidAnalysis({ summary: "Also parsed" });

      mockCreateFn.mockResolvedValue({
        content: [
          {
            type: "text",
            text: "```\n" + JSON.stringify(mockAnalysis) + "\n```",
          },
        ],
      });

      const result = await analyzeFeedback("Some feedback");

      expect(result.summary).toBe("Also parsed");
    });

    it("should handle response with extra whitespace", async () => {
      const mockAnalysis = createValidAnalysis();

      mockCreateFn.mockResolvedValue({
        content: [
          {
            type: "text",
            text: "   \n" + JSON.stringify(mockAnalysis) + "\n   ",
          },
        ],
      });

      const result = await analyzeFeedback("Some feedback");

      expect(result).toEqual(mockAnalysis);
    });

    it("should throw error for non-text response type", async () => {
      mockCreateFn.mockResolvedValue({
        content: [
          {
            type: "image",
            data: "base64data",
          },
        ],
      });

      await expect(analyzeFeedback("Some feedback")).rejects.toThrow(
        "Unexpected response type from API"
      );
    });

    it("should throw error for invalid JSON response", async () => {
      mockCreateFn.mockResolvedValue({
        content: [
          {
            type: "text",
            text: "This is not valid JSON",
          },
        ],
      });

      await expect(analyzeFeedback("Some feedback")).rejects.toThrow();
    });
  });

  describe("validation - sentiment", () => {
    it("should accept positive sentiment", async () => {
      const mockAnalysis = createValidAnalysis({ sentiment: "positive" });
      mockCreateFn.mockResolvedValue(createMockResponse(mockAnalysis));

      const result = await analyzeFeedback("Great product!");

      expect(result.sentiment).toBe("positive");
    });

    it("should accept neutral sentiment", async () => {
      const mockAnalysis = createValidAnalysis({ sentiment: "neutral" });
      mockCreateFn.mockResolvedValue(createMockResponse(mockAnalysis));

      const result = await analyzeFeedback("It works.");

      expect(result.sentiment).toBe("neutral");
    });

    it("should accept negative sentiment", async () => {
      const mockAnalysis = createValidAnalysis({ sentiment: "negative" });
      mockCreateFn.mockResolvedValue(createMockResponse(mockAnalysis));

      const result = await analyzeFeedback("Terrible experience.");

      expect(result.sentiment).toBe("negative");
    });

    it("should throw error for invalid sentiment value", async () => {
      const mockAnalysis = createValidAnalysis({ sentiment: "happy" });
      mockCreateFn.mockResolvedValue(createMockResponse(mockAnalysis));

      await expect(analyzeFeedback("Some feedback")).rejects.toThrow(
        "Invalid analysis: sentiment must be positive, neutral, or negative"
      );
    });

    it("should throw error for missing sentiment", async () => {
      const mockAnalysis = createValidAnalysis();
      delete (mockAnalysis as any).sentiment;
      mockCreateFn.mockResolvedValue(createMockResponse(mockAnalysis));

      await expect(analyzeFeedback("Some feedback")).rejects.toThrow(
        "Invalid analysis: sentiment must be positive, neutral, or negative"
      );
    });
  });

  describe("validation - priority", () => {
    it.each(["P0", "P1", "P2", "P3"])(
      "should accept priority %s",
      async (priority) => {
        const mockAnalysis = createValidAnalysis({ priority });
        mockCreateFn.mockResolvedValue(createMockResponse(mockAnalysis));

        const result = await analyzeFeedback("Some feedback");

        expect(result.priority).toBe(priority);
      }
    );

    it("should throw error for invalid priority P4", async () => {
      const mockAnalysis = createValidAnalysis({ priority: "P4" });
      mockCreateFn.mockResolvedValue(createMockResponse(mockAnalysis));

      await expect(analyzeFeedback("Some feedback")).rejects.toThrow(
        "Invalid analysis: priority must be P0, P1, P2, or P3"
      );
    });

    it("should throw error for invalid priority P5", async () => {
      const mockAnalysis = createValidAnalysis({ priority: "P5" });
      mockCreateFn.mockResolvedValue(createMockResponse(mockAnalysis));

      await expect(analyzeFeedback("Some feedback")).rejects.toThrow(
        "Invalid analysis: priority must be P0, P1, P2, or P3"
      );
    });

    it("should throw error for lowercase priority", async () => {
      const mockAnalysis = createValidAnalysis({ priority: "p2" });
      mockCreateFn.mockResolvedValue(createMockResponse(mockAnalysis));

      await expect(analyzeFeedback("Some feedback")).rejects.toThrow(
        "Invalid analysis: priority must be P0, P1, P2, or P3"
      );
    });

    it("should throw error for missing priority", async () => {
      const mockAnalysis = createValidAnalysis();
      delete (mockAnalysis as any).priority;
      mockCreateFn.mockResolvedValue(createMockResponse(mockAnalysis));

      await expect(analyzeFeedback("Some feedback")).rejects.toThrow(
        "Invalid analysis: priority must be P0, P1, P2, or P3"
      );
    });
  });

  describe("validation - tags", () => {
    it("should accept 1 tag", async () => {
      const mockAnalysis = createValidAnalysis({ tags: ["single"] });
      mockCreateFn.mockResolvedValue(createMockResponse(mockAnalysis));

      const result = await analyzeFeedback("Some feedback");

      expect(result.tags).toEqual(["single"]);
    });

    it("should accept 5 tags (maximum)", async () => {
      const tags = ["tag1", "tag2", "tag3", "tag4", "tag5"];
      const mockAnalysis = createValidAnalysis({ tags });
      mockCreateFn.mockResolvedValue(createMockResponse(mockAnalysis));

      const result = await analyzeFeedback("Some feedback");

      expect(result.tags).toHaveLength(5);
    });

    it("should throw error for 6 tags (exceeds maximum)", async () => {
      const tags = ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"];
      const mockAnalysis = createValidAnalysis({ tags });
      mockCreateFn.mockResolvedValue(createMockResponse(mockAnalysis));

      await expect(analyzeFeedback("Some feedback")).rejects.toThrow(
        "Invalid analysis: tags must be an array of 1-5 items"
      );
    });

    it("should throw error for empty tags array", async () => {
      const mockAnalysis = createValidAnalysis({ tags: [] });
      mockCreateFn.mockResolvedValue(createMockResponse(mockAnalysis));

      await expect(analyzeFeedback("Some feedback")).rejects.toThrow(
        "Invalid analysis: tags must be an array of 1-5 items"
      );
    });

    it("should throw error when tags is not an array", async () => {
      const mockAnalysis = createValidAnalysis({ tags: "not-an-array" });
      mockCreateFn.mockResolvedValue(createMockResponse(mockAnalysis));

      await expect(analyzeFeedback("Some feedback")).rejects.toThrow(
        "Invalid analysis: tags must be an array of 1-5 items"
      );
    });

    it("should throw error when tags is null", async () => {
      const mockAnalysis = createValidAnalysis({ tags: null });
      mockCreateFn.mockResolvedValue(createMockResponse(mockAnalysis));

      await expect(analyzeFeedback("Some feedback")).rejects.toThrow(
        "Invalid analysis: tags must be an array of 1-5 items"
      );
    });
  });

  describe("validation - summary", () => {
    it("should accept valid string summary", async () => {
      const mockAnalysis = createValidAnalysis({ summary: "Valid summary" });
      mockCreateFn.mockResolvedValue(createMockResponse(mockAnalysis));

      const result = await analyzeFeedback("Some feedback");

      expect(result.summary).toBe("Valid summary");
    });

    it("should throw error when summary is not a string", async () => {
      const mockAnalysis = createValidAnalysis({ summary: 123 });
      mockCreateFn.mockResolvedValue(createMockResponse(mockAnalysis));

      await expect(analyzeFeedback("Some feedback")).rejects.toThrow(
        "Invalid analysis: summary must be a string"
      );
    });

    it("should throw error when summary is missing", async () => {
      const mockAnalysis = createValidAnalysis();
      delete (mockAnalysis as any).summary;
      mockCreateFn.mockResolvedValue(createMockResponse(mockAnalysis));

      await expect(analyzeFeedback("Some feedback")).rejects.toThrow(
        "Invalid analysis: summary must be a string"
      );
    });
  });

  describe("validation - nextAction", () => {
    it("should accept valid string nextAction", async () => {
      const mockAnalysis = createValidAnalysis({
        nextAction: "Follow up with customer",
      });
      mockCreateFn.mockResolvedValue(createMockResponse(mockAnalysis));

      const result = await analyzeFeedback("Some feedback");

      expect(result.nextAction).toBe("Follow up with customer");
    });

    it("should throw error when nextAction is not a string", async () => {
      const mockAnalysis = createValidAnalysis({
        nextAction: ["action1", "action2"],
      });
      mockCreateFn.mockResolvedValue(createMockResponse(mockAnalysis));

      await expect(analyzeFeedback("Some feedback")).rejects.toThrow(
        "Invalid analysis: nextAction must be a string"
      );
    });

    it("should throw error when nextAction is missing", async () => {
      const mockAnalysis = createValidAnalysis();
      delete (mockAnalysis as any).nextAction;
      mockCreateFn.mockResolvedValue(createMockResponse(mockAnalysis));

      await expect(analyzeFeedback("Some feedback")).rejects.toThrow(
        "Invalid analysis: nextAction must be a string"
      );
    });
  });

  describe("validation - object structure", () => {
    it("should throw error when response is null", async () => {
      mockCreateFn.mockResolvedValue({
        content: [{ type: "text", text: "null" }],
      });

      await expect(analyzeFeedback("Some feedback")).rejects.toThrow(
        "Invalid analysis: not an object"
      );
    });

    it("should throw error when response is an array", async () => {
      mockCreateFn.mockResolvedValue({
        content: [{ type: "text", text: "[]" }],
      });

      await expect(analyzeFeedback("Some feedback")).rejects.toThrow(
        "Invalid analysis: not an object"
      );
    });

    it("should throw error when response is a primitive", async () => {
      mockCreateFn.mockResolvedValue({
        content: [{ type: "text", text: '"just a string"' }],
      });

      await expect(analyzeFeedback("Some feedback")).rejects.toThrow(
        "Invalid analysis: not an object"
      );
    });
  });

  describe("retry logic", () => {
    it("should retry on API failure and succeed on second attempt", async () => {
      const mockAnalysis = createValidAnalysis({
        summary: "Success after retry",
      });

      mockCreateFn
        .mockRejectedValueOnce(new Error("API Error"))
        .mockResolvedValueOnce(createMockResponse(mockAnalysis));

      const resultPromise = analyzeFeedback("Test feedback");

      await jest.advanceTimersByTimeAsync(1000);

      const result = await resultPromise;

      expect(result.summary).toBe("Success after retry");
      expect(mockCreateFn).toHaveBeenCalledTimes(2);
    });

    it("should retry on API failure and succeed on third attempt", async () => {
      const mockAnalysis = createValidAnalysis({
        summary: "Success after retries",
      });

      mockCreateFn
        .mockRejectedValueOnce(new Error("Error 1"))
        .mockRejectedValueOnce(new Error("Error 2"))
        .mockResolvedValueOnce(createMockResponse(mockAnalysis));

      const resultPromise = analyzeFeedback("Test feedback");

      await jest.advanceTimersByTimeAsync(1000);
      await jest.advanceTimersByTimeAsync(2000);

      const result = await resultPromise;

      expect(result.summary).toBe("Success after retries");
      expect(mockCreateFn).toHaveBeenCalledTimes(3);
    });

    it("should use exponential backoff timing", async () => {
      const mockAnalysis = createValidAnalysis();

      mockCreateFn
        .mockRejectedValueOnce(new Error("Error 1"))
        .mockRejectedValueOnce(new Error("Error 2"))
        .mockResolvedValueOnce(createMockResponse(mockAnalysis));

      const resultPromise = analyzeFeedback("Test feedback");

      expect(mockCreateFn).toHaveBeenCalledTimes(1);

      await jest.advanceTimersByTimeAsync(999);
      expect(mockCreateFn).toHaveBeenCalledTimes(1);

      await jest.advanceTimersByTimeAsync(1);
      expect(mockCreateFn).toHaveBeenCalledTimes(2);

      await jest.advanceTimersByTimeAsync(1999);
      expect(mockCreateFn).toHaveBeenCalledTimes(2);

      await jest.advanceTimersByTimeAsync(1);
      expect(mockCreateFn).toHaveBeenCalledTimes(3);

      await resultPromise;
    });

    it("should not retry on validation errors", async () => {
      const invalidAnalysis = createValidAnalysis({ sentiment: "invalid" });
      mockCreateFn.mockResolvedValue(createMockResponse(invalidAnalysis));

      await expect(analyzeFeedback("Test feedback")).rejects.toThrow(
        "Invalid analysis: sentiment must be positive, neutral, or negative"
      );

      expect(mockCreateFn).toHaveBeenCalledTimes(1);
    });
  });

  describe("mock analysis (no API key)", () => {
    let originalEnv: string | undefined;

    beforeEach(() => {
      originalEnv = process.env.ANTHROPIC_API_KEY;
    });

    afterEach(() => {
      if (originalEnv !== undefined) {
        process.env.ANTHROPIC_API_KEY = originalEnv;
      } else {
        delete process.env.ANTHROPIC_API_KEY;
      }
      jest.resetModules();
    });

    it("should use mock analysis when no API key is available", async () => {
      delete process.env.ANTHROPIC_API_KEY;
      jest.resetModules();

      jest.doMock("@/lib/logger", () => ({
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      }));

      const {
        analyzeFeedback: analyzeFeedbackNoKey,
      } = require("@/lib/services/aiAnalysis");

      const result = await analyzeFeedbackNoKey("Test feedback");

      expect(result.tags).toContain("mock");
      expect(result.priority).toBe("P2");
    });

    it("should detect positive sentiment in mock mode", async () => {
      delete process.env.ANTHROPIC_API_KEY;
      jest.resetModules();

      jest.doMock("@/lib/logger", () => ({
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      }));

      const {
        analyzeFeedback: analyzeFeedbackNoKey,
      } = require("@/lib/services/aiAnalysis");

      const resultLove = await analyzeFeedbackNoKey("I love this product!");
      expect(resultLove.sentiment).toBe("positive");

      const resultGreat = await analyzeFeedbackNoKey("This is great!");
      expect(resultGreat.sentiment).toBe("positive");

      const resultExcellent = await analyzeFeedbackNoKey("Excellent service!");
      expect(resultExcellent.sentiment).toBe("positive");
    });

    it("should detect negative sentiment in mock mode", async () => {
      delete process.env.ANTHROPIC_API_KEY;
      jest.resetModules();

      jest.doMock("@/lib/logger", () => ({
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      }));

      const {
        analyzeFeedback: analyzeFeedbackNoKey,
      } = require("@/lib/services/aiAnalysis");

      const resultBad = await analyzeFeedbackNoKey("This is bad");
      expect(resultBad.sentiment).toBe("negative");

      const resultHate = await analyzeFeedbackNoKey("I hate this");
      expect(resultHate.sentiment).toBe("negative");

      const resultTerrible = await analyzeFeedbackNoKey("Terrible experience");
      expect(resultTerrible.sentiment).toBe("negative");
    });

    it("should default to neutral sentiment in mock mode", async () => {
      delete process.env.ANTHROPIC_API_KEY;
      jest.resetModules();

      jest.doMock("@/lib/logger", () => ({
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      }));

      const {
        analyzeFeedback: analyzeFeedbackNoKey,
      } = require("@/lib/services/aiAnalysis");

      const result = await analyzeFeedbackNoKey("The product arrived on time");

      expect(result.sentiment).toBe("neutral");
    });

    it("should truncate long text in mock summary", async () => {
      delete process.env.ANTHROPIC_API_KEY;
      jest.resetModules();

      jest.doMock("@/lib/logger", () => ({
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      }));

      const {
        analyzeFeedback: analyzeFeedbackNoKey,
      } = require("@/lib/services/aiAnalysis");

      const longText = "A".repeat(100);
      const result = await analyzeFeedbackNoKey(longText);

      expect(result.summary).toContain("...");
      expect(result.summary.length).toBeLessThan(100);
    });

    it("should not truncate short text in mock summary", async () => {
      delete process.env.ANTHROPIC_API_KEY;
      jest.resetModules();

      jest.doMock("@/lib/logger", () => ({
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      }));

      const {
        analyzeFeedback: analyzeFeedbackNoKey,
      } = require("@/lib/services/aiAnalysis");

      const shortText = "Short feedback";
      const result = await analyzeFeedbackNoKey(shortText);

      expect(result.summary).not.toContain("...");
      expect(result.summary).toContain(shortText);
    });
  });

  describe("edge cases", () => {
    it("should handle empty feedback text", async () => {
      const mockAnalysis = createValidAnalysis();
      mockCreateFn.mockResolvedValue(createMockResponse(mockAnalysis));

      const result = await analyzeFeedback("");

      expect(result).toEqual(mockAnalysis);
    });

    it("should handle very long feedback text", async () => {
      const mockAnalysis = createValidAnalysis();
      mockCreateFn.mockResolvedValue(createMockResponse(mockAnalysis));

      const longText = "A".repeat(10000);
      const result = await analyzeFeedback(longText);

      expect(result).toEqual(mockAnalysis);
      expect(mockCreateFn).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: expect.stringContaining(longText),
            }),
          ]),
        })
      );
    });

    it("should handle feedback with special characters", async () => {
      const mockAnalysis = createValidAnalysis();
      mockCreateFn.mockResolvedValue(createMockResponse(mockAnalysis));

      const specialText =
        "Test with \"quotes\" and 'apostrophes' and \n newlines";
      const result = await analyzeFeedback(specialText);

      expect(result).toEqual(mockAnalysis);
    });

    it("should handle feedback with unicode characters", async () => {
      const mockAnalysis = createValidAnalysis();
      mockCreateFn.mockResolvedValue(createMockResponse(mockAnalysis));

      const unicodeText = "Test with emoji and unicode chars";
      const result = await analyzeFeedback(unicodeText);

      expect(result).toEqual(mockAnalysis);
    });

    it("should preserve extra fields from API response", async () => {
      const mockAnalysis = {
        ...createValidAnalysis(),
        urgencyIndicators: ["emergency"],
        customerSatisfied: false,
        safetyThreat: true,
      };
      mockCreateFn.mockResolvedValue(createMockResponse(mockAnalysis));

      const result = await analyzeFeedback("Emergency situation");

      expect(result).toEqual(mockAnalysis);
    });
  });
});
