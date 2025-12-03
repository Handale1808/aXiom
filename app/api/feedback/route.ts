import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import type { IFeedback } from "@/models/Feedback";
import { withMiddleware } from "@/lib/middleware";
import { ValidationError, DatabaseError } from "@/lib/errors";
import { analyzeFeedback } from "@/lib/services/aiAnalysis";
import { debug, info, warn, sanitizeEmail } from "@/lib/logger";
import { withDatabaseLogging } from "@/lib/databaseLogger";

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
    const { text, email } = body;

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
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = parseInt(searchParams.get("skip") || "0");

    debug("Processing feedback list request", {
      requestId,
      filters: {
        sentiment,
        priority,
        tag,
        search,
      },
      pagination: {
        limit,
        skip,
      },
    });

    const filter: any = {};
    if (search) {
      filter.$text = { $search: search };
    }
    if (sentiment) filter["analysis.sentiment"] = sentiment;
    if (priority) filter["analysis.priority"] = priority;
    if (tag) filter["analysis.tags"] = tag;

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
          .find(filter)
          .sort(
            search
              ? { score: { $meta: "textScore" }, createdAt: -1 }
              : { createdAt: -1 }
          )
          .limit(limit)
          .skip(skip)
          .toArray(),
      {
        operation: "find",
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
