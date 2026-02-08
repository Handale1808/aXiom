import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import type { IFeedback } from "@/models/Feedback";
import { withMiddleware } from "@/lib/utils/middleware";
import { ValidationError, DatabaseError, ApiError } from "@/lib/errors";
import { debug, info } from "@/lib/logger";
import { withDatabaseLogging } from "@/lib/databaseLogger";

async function getHandler(
  request: NextRequest,
  context: { requestId: string }
) {
  const { requestId } = context;
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();

  debug("Processing single feedback request", {
    requestId,
    feedbackId: id,
  });

  if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
    throw new ValidationError(
      "Invalid feedback ID format",
      undefined,
      requestId
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db("axiom");
    const collection = db.collection<IFeedback>("feedbacks");

    debug("Querying feedback by ID", {
      requestId,
      feedbackId: id,
    });

    const feedbackResult = await withDatabaseLogging(
      () =>
        collection
          .aggregate([
            { $match: { _id: new ObjectId(id) } },
            {
              $lookup: {
                from: "cats",
                localField: "catAlienId",
                foreignField: "_id",
                as: "cat",
              },
            },
            {
              $addFields: {
                catName: { $arrayElemAt: ["$cat.name", 0] },
                catSvgImage: { $arrayElemAt: ["$cat.svgImage", 0] },
              },
            },
            { $project: { cat: 0 } },
          ])
          .toArray(),
      {
        operation: "aggregate",
        collection: "feedbacks",
        requestId,
        filter: { _id: id },
      }
    );

    const feedback = feedbackResult.length > 0 ? feedbackResult[0] : null;

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

async function deleteHandler(
  request: NextRequest,
  context: { requestId: string }
) {
  const { requestId } = context;
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();

  debug("Processing delete feedback request", {
    requestId,
    feedbackId: id,
  });

  if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
    throw new ValidationError(
      "Invalid feedback ID format",
      undefined,
      requestId
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db("axiom");
    const collection = db.collection<IFeedback>("feedbacks");

    debug("Deleting feedback by ID", {
      requestId,
      feedbackId: id,
    });

    const result = await withDatabaseLogging(
      () => collection.deleteOne({ _id: new ObjectId(id) }),
      {
        operation: "deleteOne",
        collection: "feedbacks",
        requestId,
        filter: { _id: id },
      }
    );

    if (result.deletedCount === 0) {
      info("Feedback not found for deletion", {
        requestId,
        feedbackId: id,
      });
      throw new ApiError(404, "Feedback not found", "NOT_FOUND", requestId);
    }

    info("Feedback deleted successfully", {
      requestId,
      feedbackId: id,
    });

    return NextResponse.json({
      success: true,
      deletedId: id,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new DatabaseError("Failed to delete feedback", requestId);
  }
}

export const DELETE = withMiddleware(deleteHandler);

async function patchHandler(
  request: NextRequest,
  context: { requestId: string }
) {
  const { requestId } = context;
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();

  debug("Processing update feedback request", {
    requestId,
    feedbackId: id,
  });

  if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
    throw new ValidationError(
      "Invalid feedback ID format",
      undefined,
      requestId
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db("axiom");
    const collection = db.collection<IFeedback>("feedbacks");

    const body = await request.json();
    const { nextAction } = body;

    debug("Validating nextAction update", {
      requestId,
      hasNextAction: !!nextAction,
      nextActionLength: nextAction?.length,
    });

    if (!nextAction || typeof nextAction !== "string") {
      throw new ValidationError(
        "nextAction is required and must be a string",
        { nextAction: "nextAction is required" },
        requestId
      );
    }

    const trimmedNextAction = nextAction.trim();

    if (trimmedNextAction.length < 10) {
      throw new ValidationError(
        "nextAction must be at least 10 characters",
        { nextAction: "nextAction must be at least 10 characters" },
        requestId
      );
    }

    if (trimmedNextAction.length > 500) {
      throw new ValidationError(
        "nextAction must not exceed 500 characters",
        { nextAction: "nextAction must not exceed 500 characters" },
        requestId
      );
    }

    info("Updating feedback nextAction", {
      requestId,
      feedbackId: id,
      nextActionLength: trimmedNextAction.length,
    });

    const result = await withDatabaseLogging(
      () =>
        collection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: { "analysis.nextAction": trimmedNextAction } },
          { returnDocument: "after" }
        ),
      {
        operation: "findOneAndUpdate",
        collection: "feedbacks",
        requestId,
        filter: { _id: id },
      }
    );

    if (!result) {
      info("Feedback not found for update", {
        requestId,
        feedbackId: id,
      });
      throw new ApiError(404, "Feedback not found", "NOT_FOUND", requestId);
    }

    info("Feedback updated successfully", {
      requestId,
      feedbackId: id,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof ApiError) {
      throw error;
    }
    throw new DatabaseError("Failed to update feedback", requestId);
  }
}

export const PATCH = withMiddleware(patchHandler);
