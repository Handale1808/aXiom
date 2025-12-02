import { analyzeFeedback } from "@/lib/services/aiAnalysis";

// Mock the entire module - create mockCreate inside the factory
const mockCreate = jest.fn();

jest.mock("@anthropic-ai/sdk", () => {
  const mockCreateFn = jest.fn();

  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      messages: {
        create: mockCreateFn,
      },
    })),
    // Export the mock so we can access it in tests
    mockCreateFn,
  };
});

// Import the mock function we exported
const Anthropic = require("@anthropic-ai/sdk");
const mockCreateFromModule = Anthropic.mockCreateFn;

describe("analyzeFeedback", () => {
  // Before each test, clear any previous mock data
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should analyze feedback successfully with valid API response", async () => {
    // Arrange: Set up the mock to return valid data
    const mockResponse = {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            summary: "User loves the product",
            sentiment: "positive",
            tags: ["praise", "product"],
            priority: "P2",
            nextAction: "Thank the user",
          }),
        },
      ],
    };

    mockCreateFromModule.mockResolvedValue(mockResponse);

    // Act: Call the function we're testing
    const result = await analyzeFeedback("I love this product!");

    // Assert: Check the results
    expect(result).toEqual({
      summary: "User loves the product",
      sentiment: "positive",
      tags: ["praise", "product"],
      priority: "P2",
      nextAction: "Thank the user",
    });

    // Verify the API was called correctly
    expect(mockCreateFromModule).toHaveBeenCalledTimes(1);
    expect(mockCreateFromModule).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
      })
    );
  });

  it("should strip markdown code blocks from API response", async () => {
    // Arrange: Mock response with markdown formatting
    const mockResponse = {
      content: [
        {
          type: "text",
          text: '```json\n{"summary":"Test","sentiment":"neutral","tags":["test"],"priority":"P2","nextAction":"Review"}\n```',
        },
      ],
    };

    mockCreateFromModule.mockResolvedValue(mockResponse);

    // Act
    const result = await analyzeFeedback("Some feedback");

    // Assert: Should parse correctly despite markdown
    expect(result.summary).toBe("Test");
    expect(result.sentiment).toBe("neutral");
  });

  it("should throw error when sentiment is invalid", async () => {
    // Arrange: Mock response with invalid sentiment
    const mockResponse = {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            summary: "Test",
            sentiment: "happy", // Invalid! Should be positive/neutral/negative
            tags: ["test"],
            priority: "P2",
            nextAction: "Review",
          }),
        },
      ],
    };

    mockCreateFromModule.mockResolvedValue(mockResponse);

    // Act & Assert: Should throw an error
    await expect(analyzeFeedback("Some feedback")).rejects.toThrow(
      "Invalid analysis: sentiment must be positive, neutral, or negative"
    );
  });

  it("should throw error when priority is invalid", async () => {
    // Arrange: Mock response with invalid priority
    const mockResponse = {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            summary: "Test",
            sentiment: "neutral",
            tags: ["test"],
            priority: "P5", // Invalid! Should be P0-P3
            nextAction: "Review",
          }),
        },
      ],
    };

    mockCreateFromModule.mockResolvedValue(mockResponse);

    // Act & Assert: Should throw an error
    await expect(analyzeFeedback("Some feedback")).rejects.toThrow(
      "Invalid analysis: priority must be P0, P1, P2, or P3"
    );
  });

  it("should throw error when tags array is too long", async () => {
    // Arrange: Mock response with too many tags
    const mockResponse = {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            summary: "Test",
            sentiment: "neutral",
            tags: ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"], // Too many! Max is 5
            priority: "P2",
            nextAction: "Review",
          }),
        },
      ],
    };

    mockCreateFromModule.mockResolvedValue(mockResponse);

    // Act & Assert: Should throw an error
    await expect(analyzeFeedback("Some feedback")).rejects.toThrow(
      "Invalid analysis: tags must be an array of 1-5 items"
    );
  });

  it("should retry on API failure and eventually succeed", async () => {
    // Arrange: Fail twice, then succeed on third attempt
    mockCreateFromModule
      .mockRejectedValueOnce(new Error("API Error 1"))
      .mockRejectedValueOnce(new Error("API Error 2"))
      .mockResolvedValueOnce({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              summary: "Success after retries",
              sentiment: "positive",
              tags: ["retry", "success"],
              priority: "P2",
              nextAction: "Celebrate",
            }),
          },
        ],
      });

    // Act
    const result = await analyzeFeedback("Test feedback");

    // Assert: Should eventually succeed
    expect(result.summary).toBe("Success after retries");
    expect(mockCreateFromModule).toHaveBeenCalledTimes(3); // Called 3 times total
  });

  it("should throw error after max retries are exhausted", async () => {
    // Arrange: Always fail
    mockCreateFromModule.mockRejectedValue(new Error("Persistent API Error"));

    // Act & Assert: Should throw after 3 attempts
    await expect(analyzeFeedback("Test feedback")).rejects.toThrow(
      "Persistent API Error"
    );

    // Verify it tried 3 times
    expect(mockCreateFromModule).toHaveBeenCalledTimes(3);
  });

  it("should use mock analysis when no API key is available", async () => {
    // Arrange: Temporarily remove API key
    const originalKey = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;

    // Need to reimport to get the new instance without API key
    jest.resetModules();
    const {
      analyzeFeedback: analyzeFeedbackNoKey,
    } = require("@/lib/services/aiAnalysis");

    // Act
    const result = await analyzeFeedbackNoKey("I love this product!");

    // Assert: Should use mock analysis
    expect(result.sentiment).toBe("positive"); // Mock detects "love"
    expect(result.tags).toContain("mock");
    expect(mockCreateFromModule).not.toHaveBeenCalled(); // API not called

    // Cleanup: Restore API key
    process.env.ANTHROPIC_API_KEY = originalKey;
  });
});
