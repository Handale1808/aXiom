import { NextRequest } from "next/server";
import { GET, DELETE, PATCH } from "@/app/api/feedback/[id]/route";

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
    findOne: jest.fn(),
    deleteOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
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

describe("[id] Feedback API Routes", () => {
  const validId = "507f1f77bcf86cd799439011";
  const invalidId = "invalid-id";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/feedback/[id]", () => {
    it("should get feedback by id successfully", async () => {
      const mockFeedback = {
        _id: validId,
        text: "Great product!",
        email: "user@example.com",
        createdAt: new Date("2024-01-01"),
        analysis: {
          summary: "Positive feedback",
          sentiment: "positive",
          tags: ["praise"],
          priority: "P2",
          nextAction: "Thank the user",
        },
      };

      mockCollection.findOne.mockResolvedValueOnce(mockFeedback);

      const request = new NextRequest(
        `http://localhost:3000/api/feedback/${validId}`
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.text).toBe("Great product!");
      expect(data.data._id).toBe(validId);
    });

    it("should return 400 for invalid id format", async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/feedback/${invalidId}`
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toBe("Invalid feedback ID format");
      expect(mockCollection.findOne).not.toHaveBeenCalled();
    });

    it("should return 404 when feedback not found", async () => {
      mockCollection.findOne.mockResolvedValueOnce(null);

      const request = new NextRequest(
        `http://localhost:3000/api/feedback/${validId}`
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe("NOT_FOUND");
      expect(data.error.message).toBe("Feedback not found");
    });

    it("should handle database errors", async () => {
      mockCollection.findOne.mockRejectedValueOnce(new Error("Database error"));

      const request = new NextRequest(
        `http://localhost:3000/api/feedback/${validId}`
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe("DATABASE_ERROR");
      expect(data.error.message).toBe("Failed to fetch feedback");
    });
  });

  describe("DELETE /api/feedback/[id]", () => {
    it("should delete feedback by id successfully", async () => {
      mockCollection.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });

      const request = new NextRequest(
        `http://localhost:3000/api/feedback/${validId}`,
        { method: "DELETE" }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.deletedId).toBe(validId);
    });

    it("should return 400 for invalid id format", async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/feedback/${invalidId}`,
        { method: "DELETE" }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toBe("Invalid feedback ID format");
      expect(mockCollection.deleteOne).not.toHaveBeenCalled();
    });

    it("should return 404 when feedback not found", async () => {
      mockCollection.deleteOne.mockResolvedValueOnce({ deletedCount: 0 });

      const request = new NextRequest(
        `http://localhost:3000/api/feedback/${validId}`,
        { method: "DELETE" }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe("NOT_FOUND");
      expect(data.error.message).toBe("Feedback not found");
    });

    it("should handle database errors", async () => {
      mockCollection.deleteOne.mockRejectedValueOnce(
        new Error("Database error")
      );

      const request = new NextRequest(
        `http://localhost:3000/api/feedback/${validId}`,
        { method: "DELETE" }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe("DATABASE_ERROR");
      expect(data.error.message).toBe("Failed to delete feedback");
    });
  });

  describe("PATCH /api/feedback/[id]", () => {
    const validNextAction = "Follow up with the customer about their feedback";

    it("should update nextAction successfully", async () => {
      const mockUpdatedFeedback = {
        _id: validId,
        text: "Great product!",
        analysis: {
          summary: "Positive feedback",
          sentiment: "positive",
          tags: ["praise"],
          priority: "P2",
          nextAction: validNextAction,
        },
      };

      mockCollection.findOneAndUpdate.mockResolvedValueOnce(mockUpdatedFeedback);

      const request = new NextRequest(
        `http://localhost:3000/api/feedback/${validId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ nextAction: validNextAction }),
        }
      );

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.analysis.nextAction).toBe(validNextAction);
    });

    it("should return 400 for invalid id format", async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/feedback/${invalidId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ nextAction: validNextAction }),
        }
      );

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toBe("Invalid feedback ID format");
      expect(mockCollection.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it("should return 400 when nextAction is missing", async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/feedback/${validId}`,
        {
          method: "PATCH",
          body: JSON.stringify({}),
        }
      );

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toBe(
        "nextAction is required and must be a string"
      );
      expect(mockCollection.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it("should return 400 when nextAction is not a string", async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/feedback/${validId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ nextAction: 12345 }),
        }
      );

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toBe(
        "nextAction is required and must be a string"
      );
    });

    it("should return 400 when nextAction is too short", async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/feedback/${validId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ nextAction: "Short" }),
        }
      );

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toBe(
        "nextAction must be at least 10 characters"
      );
      expect(mockCollection.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it("should return 400 when nextAction exceeds 500 characters", async () => {
      const longNextAction = "a".repeat(501);

      const request = new NextRequest(
        `http://localhost:3000/api/feedback/${validId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ nextAction: longNextAction }),
        }
      );

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toBe(
        "nextAction must not exceed 500 characters"
      );
      expect(mockCollection.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it("should trim whitespace from nextAction", async () => {
      const nextActionWithSpaces = "   Follow up with the customer   ";
      const mockUpdatedFeedback = {
        _id: validId,
        text: "Great product!",
        analysis: {
          nextAction: nextActionWithSpaces.trim(),
        },
      };

      mockCollection.findOneAndUpdate.mockResolvedValueOnce(mockUpdatedFeedback);

      const request = new NextRequest(
        `http://localhost:3000/api/feedback/${validId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ nextAction: nextActionWithSpaces }),
        }
      );

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("should return 404 when feedback not found", async () => {
      mockCollection.findOneAndUpdate.mockResolvedValueOnce(null);

      const request = new NextRequest(
        `http://localhost:3000/api/feedback/${validId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ nextAction: validNextAction }),
        }
      );

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe("NOT_FOUND");
      expect(data.error.message).toBe("Feedback not found");
    });

    it("should handle database errors", async () => {
      mockCollection.findOneAndUpdate.mockRejectedValueOnce(
        new Error("Database error")
      );

      const request = new NextRequest(
        `http://localhost:3000/api/feedback/${validId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ nextAction: validNextAction }),
        }
      );

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe("DATABASE_ERROR");
      expect(data.error.message).toBe("Failed to update feedback");
    });

    it("should accept nextAction at exactly 10 characters", async () => {
      const exactMinLength = "1234567890";
      const mockUpdatedFeedback = {
        _id: validId,
        analysis: { nextAction: exactMinLength },
      };

      mockCollection.findOneAndUpdate.mockResolvedValueOnce(mockUpdatedFeedback);

      const request = new NextRequest(
        `http://localhost:3000/api/feedback/${validId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ nextAction: exactMinLength }),
        }
      );

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("should accept nextAction at exactly 500 characters", async () => {
      const exactMaxLength = "a".repeat(500);
      const mockUpdatedFeedback = {
        _id: validId,
        analysis: { nextAction: exactMaxLength },
      };

      mockCollection.findOneAndUpdate.mockResolvedValueOnce(mockUpdatedFeedback);

      const request = new NextRequest(
        `http://localhost:3000/api/feedback/${validId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ nextAction: exactMaxLength }),
        }
      );

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});