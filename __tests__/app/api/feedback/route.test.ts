import { NextRequest } from "next/server";
import { POST, GET, DELETE } from "@/app/api/feedback/route";
import * as aiAnalysis from "@/lib/services/aiAnalysis";

jest.mock("@/lib/services/aiAnalysis");

jest.mock("@/lib/logger", () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  sanitizeEmail: jest.fn((email) => email),
  generateRequestId: jest.fn(() => "test-request-id"),
}));

jest.mock("@/lib/databaseLogger", () => ({
  withDatabaseLogging: jest.fn((fn) => fn()),
}));

jest.mock("@/lib/mongodb", () => {
  const mockCollection = {
    insertOne: jest.fn(),
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn(),
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

const { mockCollection } = require("@/lib/mongodb");
const mockAnalyzeFeedback = jest.mocked(aiAnalysis.analyzeFeedback);

describe("Feedback API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/feedback", () => {
    it("should create feedback successfully with valid data", async () => {
      const mockAnalysis = {
        summary: "User loves the product",
        sentiment: "positive" as const,
        tags: ["praise", "product"],
        priority: "P2" as const,
        nextAction: "Thank the user",
      };

      mockAnalyzeFeedback.mockResolvedValueOnce(mockAnalysis);

      mockCollection.insertOne.mockResolvedValueOnce({
        insertedId: "507f1f77bcf86cd799439011",
      });

      const request = new NextRequest("http://localhost:3000/api/feedback", {
        method: "POST",
        body: JSON.stringify({
          text: "I love this product!",
          email: "user@example.com",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.text).toBe("I love this product!");
      expect(data.data.email).toBe("user@example.com");
      expect(data.data.analysis).toEqual(mockAnalysis);
      expect(data.data._id).toBe("507f1f77bcf86cd799439011");

      expect(mockAnalyzeFeedback).toHaveBeenCalledWith(
        "I love this product!",
        expect.any(String)
      );
      expect(mockAnalyzeFeedback).toHaveBeenCalledTimes(1);

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
      const request = new NextRequest("http://localhost:3000/api/feedback", {
        method: "POST",
        body: JSON.stringify({
          email: "user@example.com",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toBe("Text is required");
      expect(data.error.fields.text).toBe("Text is required");

      expect(mockAnalyzeFeedback).not.toHaveBeenCalled();
      expect(mockCollection.insertOne).not.toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      mockAnalyzeFeedback.mockResolvedValueOnce({
        summary: "Test",
        sentiment: "neutral" as const,
        tags: ["test"],
        priority: "P2" as const,
        nextAction: "Review",
      });

      mockCollection.insertOne.mockRejectedValueOnce(
        new Error("Database connection failed")
      );

      const request = new NextRequest("http://localhost:3000/api/feedback", {
        method: "POST",
        body: JSON.stringify({
          text: "Test feedback",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe("DATABASE_ERROR");
      expect(data.error.message).toBe("Failed to create feedback");

      expect(mockAnalyzeFeedback).toHaveBeenCalledTimes(1);
    });
  });

  describe("GET /api/feedback", () => {
    it("should fetch all feedback successfully", async () => {
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

      const request = new NextRequest("http://localhost:3000/api/feedback");

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.data[0].text).toBe("Great product!");
      expect(data.pagination.total).toBe(2);
      expect(data.pagination.limit).toBe(50);
      expect(data.pagination.skip).toBe(0);
    });

    it("should filter feedback by sentiment", async () => {
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

      const request = new NextRequest(
        "http://localhost:3000/api/feedback?sentiment=positive"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);

      expect(mockCollection.find).toHaveBeenCalledWith(
        expect.objectContaining({
          "analysis.sentiment": "positive",
        })
      );
    });

    it("should filter feedback by priority", async () => {
      const mockFeedbacks = [
        {
          _id: "1",
          text: "Urgent issue",
          analysis: {
            sentiment: "negative",
            summary: "Bug report",
            tags: ["bug"],
            priority: "P0",
            nextAction: "Fix immediately",
          },
        },
      ];

      mockCollection.toArray.mockResolvedValueOnce(mockFeedbacks);
      mockCollection.countDocuments.mockResolvedValueOnce(1);

      const request = new NextRequest(
        "http://localhost:3000/api/feedback?priority=P0"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(mockCollection.find).toHaveBeenCalledWith(
        expect.objectContaining({
          "analysis.priority": "P0",
        })
      );
    });

    it("should filter feedback by tag", async () => {
      mockCollection.toArray.mockResolvedValueOnce([]);
      mockCollection.countDocuments.mockResolvedValueOnce(0);

      const request = new NextRequest(
        "http://localhost:3000/api/feedback?tag=bug"
      );

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockCollection.find).toHaveBeenCalledWith(
        expect.objectContaining({
          "analysis.tags": "bug",
        })
      );
    });

    it("should support text search", async () => {
      mockCollection.toArray.mockResolvedValueOnce([]);
      mockCollection.countDocuments.mockResolvedValueOnce(0);

      const request = new NextRequest(
        "http://localhost:3000/api/feedback?search=product"
      );

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockCollection.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $text: { $search: "product" },
        })
      );
    });

    it("should support page-based pagination", async () => {
      mockCollection.toArray.mockResolvedValueOnce([]);
      mockCollection.countDocuments.mockResolvedValueOnce(100);

      const request = new NextRequest(
        "http://localhost:3000/api/feedback?page=3&pageSize=10"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination.page).toBe(3);
      expect(data.pagination.pageSize).toBe(10);
      expect(mockCollection.skip).toHaveBeenCalledWith(20);
      expect(mockCollection.limit).toHaveBeenCalledWith(10);
    });

    it("should apply pagination parameters", async () => {
      mockCollection.toArray.mockResolvedValueOnce([]);
      mockCollection.countDocuments.mockResolvedValueOnce(100);

      const request = new NextRequest(
        "http://localhost:3000/api/feedback?limit=10&skip=20"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination.limit).toBe(10);
      expect(data.pagination.skip).toBe(20);
      expect(data.pagination.total).toBe(100);
      expect(data.pagination.hasMore).toBe(true);

      expect(mockCollection.limit).toHaveBeenCalledWith(10);
      expect(mockCollection.skip).toHaveBeenCalledWith(20);
    });

    it("should combine multiple filters", async () => {
      mockCollection.toArray.mockResolvedValueOnce([]);
      mockCollection.countDocuments.mockResolvedValueOnce(0);

      const request = new NextRequest(
        "http://localhost:3000/api/feedback?sentiment=negative&priority=P0&tag=bug"
      );

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockCollection.find).toHaveBeenCalledWith(
        expect.objectContaining({
          "analysis.sentiment": "negative",
          "analysis.priority": "P0",
          "analysis.tags": "bug",
        })
      );
    });

    it("should handle database errors in GET", async () => {
      mockCollection.toArray.mockRejectedValueOnce(
        new Error("Database query failed")
      );

      const request = new NextRequest("http://localhost:3000/api/feedback");

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe("DATABASE_ERROR");
    });
  });

  describe("DELETE /api/feedback", () => {
    it("should delete multiple feedbacks successfully", async () => {
      mockCollection.deleteMany.mockResolvedValueOnce({
        deletedCount: 2,
      });

      const request = new NextRequest("http://localhost:3000/api/feedback", {
        method: "DELETE",
        body: JSON.stringify({
          ids: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
        }),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.deletedCount).toBe(2);
      expect(data.deletedIds).toHaveLength(2);
    });

    it("should delete a single feedback successfully", async () => {
      mockCollection.deleteMany.mockResolvedValueOnce({
        deletedCount: 1,
      });

      const request = new NextRequest("http://localhost:3000/api/feedback", {
        method: "DELETE",
        body: JSON.stringify({
          ids: ["507f1f77bcf86cd799439011"],
        }),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.deletedCount).toBe(1);
      expect(data.deletedIds).toEqual(["507f1f77bcf86cd799439011"]);
    });

    it("should return 400 when ids is not an array", async () => {
      const request = new NextRequest("http://localhost:3000/api/feedback", {
        method: "DELETE",
        body: JSON.stringify({
          ids: "not-an-array",
        }),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toBe("ids must be an array");
      expect(mockCollection.deleteMany).not.toHaveBeenCalled();
    });

    it("should return 400 when ids array is empty", async () => {
      const request = new NextRequest("http://localhost:3000/api/feedback", {
        method: "DELETE",
        body: JSON.stringify({
          ids: [],
        }),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toBe("ids array cannot be empty");
      expect(mockCollection.deleteMany).not.toHaveBeenCalled();
    });

    it("should return 400 for invalid ObjectId format", async () => {
      const request = new NextRequest("http://localhost:3000/api/feedback", {
        method: "DELETE",
        body: JSON.stringify({
          ids: ["invalid-id"],
        }),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toBe(
        "All ids must be valid MongoDB ObjectId strings"
      );
      expect(mockCollection.deleteMany).not.toHaveBeenCalled();
    });

    it("should return 400 when one id in array is invalid", async () => {
      const request = new NextRequest("http://localhost:3000/api/feedback", {
        method: "DELETE",
        body: JSON.stringify({
          ids: ["507f1f77bcf86cd799439011", "bad-id"],
        }),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(mockCollection.deleteMany).not.toHaveBeenCalled();
    });

    it("should return 400 when ids is missing", async () => {
      const request = new NextRequest("http://localhost:3000/api/feedback", {
        method: "DELETE",
        body: JSON.stringify({}),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(mockCollection.deleteMany).not.toHaveBeenCalled();
    });

    it("should handle database errors in DELETE", async () => {
      mockCollection.deleteMany.mockRejectedValueOnce(
        new Error("Database error")
      );

      const request = new NextRequest("http://localhost:3000/api/feedback", {
        method: "DELETE",
        body: JSON.stringify({
          ids: ["507f1f77bcf86cd799439011"],
        }),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe("DATABASE_ERROR");
      expect(data.error.message).toBe("Failed to delete feedbacks");
    });

    it("should return correct count when some ids not found", async () => {
      mockCollection.deleteMany.mockResolvedValueOnce({
        deletedCount: 1,
      });

      const request = new NextRequest("http://localhost:3000/api/feedback", {
        method: "DELETE",
        body: JSON.stringify({
          ids: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
        }),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.deletedCount).toBe(1);
      expect(data.deletedIds).toHaveLength(2);
    });
  });
});