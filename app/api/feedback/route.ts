import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import type { IFeedback } from '@/models/Feedback';

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('axiom');
    const collection = db.collection<IFeedback>('feedbacks');
    
    const body = await request.json();
    const { text, email, analysis } = body;

    if (!text || !analysis) {
      return NextResponse.json(
        { error: 'Text and analysis are required' },
        { status: 400 }
      );
    }

    const feedback: IFeedback = {
      text,
      email,
      analysis,
      createdAt: new Date()
    };

    const result = await collection.insertOne(feedback);

    return NextResponse.json(
      { success: true, data: { ...feedback, _id: result.insertedId } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating feedback:', error);
    return NextResponse.json(
      { error: 'Failed to create feedback' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('axiom');
    const collection = db.collection<IFeedback>('feedbacks');
    
    const { searchParams } = new URL(request.url);
    const sentiment = searchParams.get('sentiment');
    const priority = searchParams.get('priority');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    const filter: any = {};
    if (sentiment) filter['analysis.sentiment'] = sentiment;
    if (priority) filter['analysis.priority'] = priority;

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
        hasMore: skip + feedbacks.length < total
      }
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}