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

    mockCreateFromModule.mockResolvedValueOnce(mockResponse);

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

    mockCreateFromModule.mockResolvedValueOnce(mockResponse);

    // Act
    const result = await analyzeFeedback("Some feedback");

    // Assert: Should parse correctly despite markdown
    expect(result.summary).toBe("Test");
    expect(result.sentiment).toBe("neutral");
  });
});