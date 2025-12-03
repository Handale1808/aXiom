import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import type { IFeedback } from "@/models/Feedback";
import { withMiddleware } from "@/lib/middleware";
import { ValidationError, DatabaseError, ApiError } from "@/lib/errors";
import { debug, info } from "@/lib/logger";
import { withDatabaseLogging } from "@/lib/databaseLogger";

async function getHandler(
  request: NextRequest,
  context: { requestId: string }
) {
  const { requestId } = context;
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();

  debug("Processing single feedback request", {
    requestId,
    feedbackId: id,
  });

  if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
    throw new ValidationError("Invalid feedback ID format", undefined, requestId);
  }

  try {
    const client = await clientPromise;
    const db = client.db("axiom");
    const collection = db.collection<IFeedback>("feedbacks");

    debug("Querying feedback by ID", {
      requestId,
      feedbackId: id,
    });

    const feedback = await withDatabaseLogging(
      () => collection.findOne({ _id: new ObjectId(id) }),
      {
        operation: "findOne",
        collection: "feedbacks",
        requestId,
        filter: { _id: id },
      }
    );

    if (!feedback) {
      info("Feedback not found", {
        requestId,
        feedbackId: id,
      });
      throw new ApiError(404, "Feedback not found", "NOT_FOUND", requestId);
    }

    info("Feedback retrieved successfully", {
      requestId,
      feedbackId: id,
    });

    return NextResponse.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new DatabaseError("Failed to fetch feedback", requestId);
  }
}

export const GET = withMiddleware(getHandler);