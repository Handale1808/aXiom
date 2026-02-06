import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";
import { withMiddleware } from "@/lib/utils/middleware";

async function handler(
  request: NextRequest,
  context: { requestId: string }
): Promise<NextResponse> {
  const { requestId } = context;

  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      {
        error: {
          message: "Not authenticated",
          code: "NOT_AUTHENTICATED",
          statusCode: 401,
          requestId,
        },
      },
      { status: 401 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: "Logout successful",
    },
    { status: 200 }
  );
}

export const POST = withMiddleware(handler);