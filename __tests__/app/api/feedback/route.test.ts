import { NextRequest } from "next/server";
import { POST, GET } from "@/app/api/feedback/route";
import * as aiAnalysis from "@/lib/services/aiAnalysis";

// Mock the AI analysis service
jest.mock("@/lib/services/aiAnalysis");

// Mock MongoDB - must be before importing
jest.mock("@/lib/mongodb", () => {
  const mockCollection = {
    insertOne: jest.fn(),
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    countDocuments: jest.fn(),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    toArray: jest.fn(),
  };

  const mockDb = {
    collection: jest.fn().mockReturnValue(mockCollection),
  };

  const mockClient = {
    db: jest.fn().mockReturnValue(mockDb),
  };

  return {
    __esModule: true,
    default: Promise.resolve(mockClient),
    mockCollection,
  };
});

// Import after mocking
const { mockCollection } = require("@/lib/mongodb");
const mockAnalyzeFeedback = jest.mocked(aiAnalysis.analyzeFeedback);

describe("Feedback API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

      // Assert: Check error response structure
      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toBe("Text is required");
      expect(data.error.fields.text).toBe("Text is required");

      // Verify AI analysis was NOT called (validation failed before it)
      expect(mockAnalyzeFeedback).not.toHaveBeenCalled();

      // Verify MongoDB was NOT called
      expect(mockCollection.insertOne).not.toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      // Arrange: Mock AI analysis to succeed
      mockAnalyzeFeedback.mockResolvedValueOnce({
        summary: "Test",
        sentiment: "neutral" as const,
        tags: ["test"],
        priority: "P2" as const,
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

      // Assert: Check error response structure
      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe("DATABASE_ERROR");
      expect(data.error.message).toBe("Failed to create feedback");

      // Verify AI analysis WAS called (error happened after analysis)
      expect(mockAnalyzeFeedback).toHaveBeenCalledTimes(1);
    });
  });

  describe("GET /api/feedback", () => {
    it("should fetch all feedback successfully", async () => {
      // Arrange: Mock feedback data
      const mockFeedbacks = [
        {
          _id: "1",
          text: "Great product!",
          email: "user1@example.com",
          createdAt: new Date("2024-01-01"),
          analysis: {
            summary: "Positive feedback",
            sentiment: "positive",
            tags: ["praise"],
            priority: "P2",
            nextAction: "Thank user",
          },
        },
        {
          _id: "2",
          text: "Needs improvement",
          email: "user2@example.com",
          createdAt: new Date("2024-01-02"),
          analysis: {
            summary: "Constructive feedback",
            sentiment: "neutral",
            tags: ["suggestion"],
            priority: "P2",
            nextAction: "Review",
          },
        },
      ];

      mockCollection.toArray.mockResolvedValueOnce(mockFeedbacks);
      mockCollection.countDocuments.mockResolvedValueOnce(2);

      // Create a mock GET request
      const request = new NextRequest("http://localhost:3000/api/feedback");

      // Act: Call the GET handler
      const response = await GET(request);
      const data = await response.json();

      // Assert: Check response
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.data[0].text).toBe("Great product!");
      expect(data.pagination.total).toBe(2);
      expect(data.pagination.limit).toBe(50);
      expect(data.pagination.skip).toBe(0);
    });

    it("should filter feedback by sentiment", async () => {
      // Arrange: Mock filtered data
      const mockFeedbacks = [
        {
          _id: "1",
          text: "Love it!",
          analysis: {
            sentiment: "positive",
            summary: "Positive",
            tags: ["praise"],
            priority: "P2",
            nextAction: "Thank",
          },
        },
      ];

      mockCollection.toArray.mockResolvedValueOnce(mockFeedbacks);
      mockCollection.countDocuments.mockResolvedValueOnce(1);

      // Create request with sentiment filter
      const request = new NextRequest(
        "http://localhost:3000/api/feedback?sentiment=positive"
      );

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);

      // Verify the filter was applied to MongoDB query
      expect(mockCollection.find).toHaveBeenCalledWith(
        expect.objectContaining({
          "analysis.sentiment": "positive",
        })
      );
    });

    it("should apply pagination parameters", async () => {
      // Arrange
      mockCollection.toArray.mockResolvedValueOnce([]);
      mockCollection.countDocuments.mockResolvedValueOnce(100);

      // Create request with pagination
      const request = new NextRequest(
        "http://localhost:3000/api/feedback?limit=10&skip=20"
      );

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.pagination.limit).toBe(10);
      expect(data.pagination.skip).toBe(20);
      expect(data.pagination.total).toBe(100);
      expect(data.pagination.hasMore).toBe(true);

      // Verify limit and skip were called
      expect(mockCollection.limit).toHaveBeenCalledWith(10);
      expect(mockCollection.skip).toHaveBeenCalledWith(20);
    });

    it("should handle database errors in GET", async () => {
      // Arrange: Mock database error
      mockCollection.toArray.mockRejectedValueOnce(
        new Error("Database query failed")
      );

      // Create request
      const request = new NextRequest("http://localhost:3000/api/feedback");

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert: Check error response
      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe("DATABASE_ERROR");
    });
  });
});
