import { NextRequest, NextResponse } from 'next/server';
import { logRequest, generateRequestId } from './logger';
import { formatErrorResponse, ApiError } from './errors';

type RouteHandler = (
  request: NextRequest,
  context?: any
) => Promise<NextResponse>;

export function withMiddleware(handler: RouteHandler): RouteHandler {
  return async (request: NextRequest, context?: any) => {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const method = request.method;
    const path = new URL(request.url).pathname;

    try {
      const response = await handler(request, context);
      const latency = Date.now() - startTime;
      const status = response.status;

      logRequest({ method, path, status, latency, requestId });

      response.headers.set('X-Request-Id', requestId);
      return response;
    } catch (error) {
      const latency = Date.now() - startTime;
      const errorResponse = formatErrorResponse(
        error as Error,
        requestId
      );
      
      const status = error instanceof ApiError ? error.statusCode : 500;

      logRequest({
        method,
        path,
        status,
        latency,
        requestId,
        error: (error as Error).message
      });

      const response = NextResponse.json(errorResponse, { status });
      response.headers.set('X-Request-Id', requestId);
      return response;
    }
  };
}