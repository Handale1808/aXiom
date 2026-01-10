import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import type { IFeedback } from "@/models/Feedback";
import { withMiddleware } from "@/lib/utils/middleware";
import { ValidationError, DatabaseError } from "@/lib/errors";
import { analyzeFeedback } from "@/lib/services/aiAnalysis";
import {
  debug,
  info,
  warn,
  sanitizeEmail,
  error as logError,
} from "@/lib/logger";
import { withDatabaseLogging } from "@/lib/databaseLogger";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function postHandler(
  request: NextRequest,
  context: { requestId: string }
) {
  const { requestId } = context;

  try {
    debug("Processing feedback submission", {
      requestId,
    });

    const client = await clientPromise;
    const db = client.db("axiom");
    const collection = db.collection<IFeedback>("feedbacks");

    const body = await request.json();
    const { text, email, catId } = body;

    // Get userId from session
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Validate catId if provided
    if (catId) {
      debug("Validating catId", {
        requestId,
        catId,
        userId,
      });

      if (!/^[0-9a-fA-F]{24}$/.test(catId)) {
        warn("Invalid catId format", { requestId, catId });
        throw new ValidationError(
          "Invalid cat ID format",
          { catId: "Invalid cat ID format" },
          requestId
        );
      }

      // Verify user owns this cat
      if (userId) {
        const purchase = await db.collection("purchases").findOne({
          userId: new ObjectId(userId),
          catId: new ObjectId(catId),
        });

        if (!purchase) {
          warn("User does not own cat", { requestId, userId, catId });
          throw new ValidationError(
            "You do not own this cat",
            { catId: "You do not own this cat" },
            requestId
          );
        }

        info("Cat ownership verified", { requestId, userId, catId });
      }
    }

    debug("Validating input", {
      requestId,
      hasText: !!text,
      hasEmail: !!email,
      textLength: text?.length,
    });

    if (!text) {
      warn("Validation failed: missing text", { requestId });
      throw new ValidationError(
        "Text is required",
        {
          text: "Text is required",
        },
        requestId
      );
    }

    info("Input validated", {
      requestId,
      email: sanitizeEmail(email),
      textLength: text.length,
    });

    info("Starting AI analysis", {
      requestId,
      textLength: text.length,
    });

    const aiStartTime = Date.now();
    const analysis = await analyzeFeedback(text, requestId);
    const aiDuration = Date.now() - aiStartTime;

    info("AI analysis completed", {
      requestId,
      duration: aiDuration,
      sentiment: analysis.sentiment,
      priority: analysis.priority,
    });

    const feedback: IFeedback = {
      text,
      email,
      catId: catId ? new ObjectId(catId) : undefined,
      userId: userId ? new ObjectId(userId) : undefined,
      createdAt: new Date(),
      analysis,
    };

    debug("Inserting feedback to database", {
      requestId,
      collection: "feedbacks",
    });

    const result = await withDatabaseLogging(
      () => collection.insertOne(feedback),
      {
        operation: "insertOne",
        collection: "feedbacks",
        requestId,
      }
    );

    info("Feedback stored successfully", {
      requestId,
      feedbackId: result.insertedId.toString(),
    });

    return NextResponse.json(
      { success: true, data: { ...feedback, _id: result.insertedId } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new DatabaseError("Failed to create feedback", requestId);
  }
}

export const POST = withMiddleware(postHandler);

async function getHandler(
  request: NextRequest,
  context: { requestId: string }
) {
  const { requestId } = context;

  try {
    const client = await clientPromise;
    debug("MongoDB client obtained", { requestId });
    const db = client.db("axiom");
    debug("Database selected", { requestId });
    const collection = db.collection<IFeedback>("feedbacks");
    debug("Collection obtained", { requestId });

    const { searchParams } = new URL(request.url);
    const sentiment = searchParams.get("sentiment");
    const priority = searchParams.get("priority");
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");
    const limitParam = searchParams.get("limit");
    const skipParam = searchParams.get("skip");
    const limit = limitParam ? parseInt(limitParam) : pageSize;
    const skip = skipParam
      ? parseInt(skipParam)
      : Math.max(0, (page - 1) * pageSize);

    debug("Processing feedback list request", {
      requestId,
      filters: {
        sentiment,
        priority,
        tag,
        search,
      },
      pagination: {
        page,
        pageSize,
        limit,
        skip,
      },
    });

    const filter: any = {};
    if (search) {
      filter.$or = [
        { text: { $regex: search, $options: "i" } },
        { "analysis.tags": { $regex: search, $options: "i" } },
      ];
    }

    // Add hasCat filter
    const hasCat = searchParams.get("hasCat");
    if (hasCat === "true") {
      filter.catId = { $exists: true, $ne: null };
    } else if (hasCat === "false") {
      filter.catId = { $exists: false };
    }
    if (sentiment) {
      const sentiments = searchParams.getAll("sentiment");
      if (sentiments.length === 1) {
        filter["analysis.sentiment"] = {
          $regex: new RegExp(`^${sentiments[0]}$`, "i"),
        };
      } else {
        filter["analysis.sentiment"] = {
          $in: sentiments.map((s) => new RegExp(`^${s}$`, "i")),
        };
      }
    }
    if (priority) {
      const priorities = searchParams.getAll("priority");
      filter["analysis.priority"] =
        priorities.length === 1 ? priorities[0] : { $in: priorities };
    }
    if (tag) {
      const tags = searchParams.getAll("tag");
      filter["analysis.tags"] = tags.length === 1 ? tags[0] : { $in: tags };
    }

    debug("Querying feedbacks", {
      requestId,
      filter: Object.keys(filter).length > 0 ? filter : "none",
      limit,
      skip,
    });

    const queryStartTime = Date.now();

    const feedbacks = await withDatabaseLogging(
      () =>
        collection
          .aggregate([
            { $match: filter },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "cats",
                localField: "catId",
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
        filter,
      }
    );

    const total = await withDatabaseLogging(
      () => collection.countDocuments(filter),
      {
        operation: "countDocuments",
        collection: "feedbacks",
        requestId,
        filter,
      }
    );

    const queryDuration = Date.now() - queryStartTime;

    info("Feedbacks retrieved", {
      requestId,
      count: feedbacks.length,
      total,
      duration: queryDuration,
      hasMore: skip + feedbacks.length < total,
    });

    return NextResponse.json({
      success: true,
      data: feedbacks,
      pagination: {
        total,
        page,
        pageSize,
        limit,
        skip,
        hasMore: skip + feedbacks.length < total,
      },
    });
  } catch (error) {
    throw new DatabaseError("Failed to fetch feedback", requestId);
  }
}

export const GET = withMiddleware(getHandler);

async function deleteHandler(
  request: NextRequest,
  context: { requestId: string }
) {
  const { requestId } = context;

  try {
    debug("Processing bulk delete feedback request", {
      requestId,
    });

    const client = await clientPromise;
    const db = client.db("axiom");
    const collection = db.collection<IFeedback>("feedbacks");

    const body = await request.json();
    const { ids } = body;

    debug("Validating bulk delete input", {
      requestId,
      hasIds: !!ids,
      idsType: Array.isArray(ids) ? "array" : typeof ids,
      idsLength: Array.isArray(ids) ? ids.length : undefined,
    });

    if (!Array.isArray(ids)) {
      throw new ValidationError(
        "ids must be an array",
        { ids: "ids must be an array" },
        requestId
      );
    }

    if (ids.length === 0) {
      throw new ValidationError(
        "ids array cannot be empty",
        { ids: "ids array cannot be empty" },
        requestId
      );
    }

    for (const id of ids) {
      if (typeof id !== "string" || !/^[0-9a-fA-F]{24}$/.test(id)) {
        warn("Invalid ID format in bulk delete", {
          requestId,
          invalidId: id,
        });
        throw new ValidationError(
          "All ids must be valid MongoDB ObjectId strings",
          { ids: "Invalid ID format" },
          requestId
        );
      }
    }

    info("Performing bulk delete", {
      requestId,
      count: ids.length,
    });

    const objectIds = ids.map((id) => new ObjectId(id));

    let result;
    try {
      result = await withDatabaseLogging(
        () => collection.deleteMany({ _id: { $in: objectIds } }),
        {
          operation: "deleteMany",
          collection: "feedbacks",
          requestId,
          filter: { _id: { $in: ids } },
        }
      );
    } catch (dbError) {
      logError("MongoDB deleteMany operation failed", {
        requestId,
        error: dbError instanceof Error ? dbError.message : "Unknown error",
        stack: dbError instanceof Error ? dbError.stack : undefined,
      });
      throw dbError;
    }

    info("Bulk delete completed", {
      requestId,
      requestedCount: ids.length,
      deletedCount: result.deletedCount,
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      deletedIds: ids,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new DatabaseError("Failed to delete feedbacks", requestId);
  }
}

export const DELETE = withMiddleware(deleteHandler);
