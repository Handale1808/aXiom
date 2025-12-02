import { NextRequest } from "next/server";
import { POST, GET } from "@/app/api/feedback/route";
import * as aiAnalysis from "@/lib/services/aiAnalysis";

// Mock the MongoDB client
jest.mock("@/lib/mongodb");

// Mock the AI analysis service
jest.mock("@/lib/services/aiAnalysis");

// Get the mocked MongoDB collection
const mockCollection = require("@/lib/mongodb").mockCollection;

// Get the mocked AI analysis function
const mockAnalyzeFeedback = jest.mocked(aiAnalysis.analyzeFeedback);

describe("POST /api/feedback", () => {
  it("should create feedback successfully with valid data", async () => {
    // Arrange: Mock AI analysis response
    const mockAnalysis = {
      summary: "User loves the product",
      sentiment: "positive" as const,
      tags: ["praise", "product"],
      priority: "P2" as const,
      nextAction: "Thank the user",
    };

    mockAnalyzeFeedback.mockResolvedValueOnce(mockAnalysis);

    // Mock MongoDB insertOne to return a fake ID
    mockCollection.insertOne.mockResolvedValueOnce({
      insertedId: "507f1f77bcf86cd799439011",
    });

    // Create a mock request
    const request = new NextRequest("http://localhost:3000/api/feedback", {
      method: "POST",
      body: JSON.stringify({
        text: "I love this product!",
        email: "user@example.com",
      }),
    });

    // Act: Call the POST handler
    const response = await POST(request);
    const data = await response.json();

    // Assert: Check response
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.text).toBe("I love this product!");
    expect(data.data.email).toBe("user@example.com");
    expect(data.data.analysis).toEqual(mockAnalysis);
    expect(data.data._id).toBe("507f1f77bcf86cd799439011");

    // Verify AI analysis was called
    expect(mockAnalyzeFeedback).toHaveBeenCalledWith("I love this product!");
    expect(mockAnalyzeFeedback).toHaveBeenCalledTimes(1);

    // Verify MongoDB insertOne was called
    expect(mockCollection.insertOne).toHaveBeenCalledTimes(1);
    expect(mockCollection.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        text: "I love this product!",
        email: "user@example.com",
        analysis: mockAnalysis,
      })
    );
  });

  it("should return 400 error when text is missing", async () => {
    // Arrange: Create request without text
    const request = new NextRequest("http://localhost:3000/api/feedback", {
      method: "POST",
      body: JSON.stringify({
        email: "user@example.com",
      }),
    });

    // Act: Call the POST handler
    const response = await POST(request);
    const data = await response.json();

    // Assert: Check error response
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Validation error");

    // Verify AI analysis was NOT called (validation failed before it)
    expect(mockAnalyzeFeedback).not.toHaveBeenCalled();

    // Verify MongoDB was NOT called
    expect(mockCollection.insertOne).not.toHaveBeenCalled();
  });

  it("should handle database errors gracefully", async () => {
    // Arrange: Mock AI analysis to succeed
    mockAnalyzeFeedback.mockResolvedValueOnce({
      summary: "Test",
      sentiment: "neutral",
      tags: ["test"],
      priority: "P2",
      nextAction: "Review",
    });

    // Mock MongoDB to throw an error
    mockCollection.insertOne.mockRejectedValueOnce(
      new Error("Database connection failed")
    );

    // Create request
    const request = new NextRequest("http://localhost:3000/api/feedback", {
      method: "POST",
      body: JSON.stringify({
        text: "Test feedback",
      }),
    });

    // Act: Call the POST handler
    const response = await POST(request);
    const data = await response.json();

    // Assert: Check error response
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Database error");
  });
});
