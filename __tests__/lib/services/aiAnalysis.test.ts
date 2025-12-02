import { analyzeFeedback } from "@/lib/services/aiAnalysis";
import Anthropic from "@anthropic-ai/sdk";

// Tell Jest to use our mock instead of the real Anthropic SDK
jest.mock("@anthropic-ai/sdk");

// Get access to the mocked create function
const mockCreate = (Anthropic as jest.MockedClass<typeof Anthropic>).prototype
  .messages.create as jest.MockedFunction<any>;

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

    mockCreate.mockResolvedValueOnce(mockResponse);

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
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith(
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

    mockCreate.mockResolvedValueOnce(mockResponse);

    // Act
    const result = await analyzeFeedback("Some feedback");

    // Assert: Should parse correctly despite markdown
    expect(result.summary).toBe("Test");
    expect(result.sentiment).toBe("neutral");
  });
});
