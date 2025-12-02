import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import type { IFeedback } from "@/models/Feedback";
import { withMiddleware } from "@/lib/middleware";
import { ValidationError, DatabaseError } from "@/lib/errors";

async function postHandler(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("axiom");
    const collection = db.collection<IFeedback>("feedbacks");

    const body = await request.json();
    const { text, email, analysis } = body;

    if (!text || !analysis) {
      throw new ValidationError("Text and analysis are required", {
        ...(!text ? { text: "Text is required" } : {}),
        ...(!analysis ? { analysis: "Analysis is required" } : {}),
      });
    }

    const feedback: IFeedback = {
      text,
      email,
      createdAt: new Date(),
      analysis,
    };

    const result = await collection.insertOne(feedback);

    return NextResponse.json(
      { success: true, data: { ...feedback, _id: result.insertedId } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new DatabaseError("Failed to create feedback");
  }
}

export const POST = withMiddleware(postHandler);

async function getHandler(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("axiom");
    const collection = db.collection<IFeedback>("feedbacks");

    const { searchParams } = new URL(request.url);
    const sentiment = searchParams.get("sentiment");
    const priority = searchParams.get("priority");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = parseInt(searchParams.get("skip") || "0");

    const filter: any = {};
    if (sentiment) filter["analysis.sentiment"] = sentiment;
    if (priority) filter["analysis.priority"] = priority;

    const feedbacks = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();

    const total = await collection.countDocuments(filter);

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
    throw new DatabaseError("Failed to fetch feedback");
  }
}

export const GET = withMiddleware(getHandler);
