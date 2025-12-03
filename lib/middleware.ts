import { NextRequest, NextResponse } from 'next/server';
import { generateRequestId, info, debug, error as logError } from './logger';
import { formatErrorResponse, ApiError } from './errors';

type RouteHandler = (
  request: NextRequest,
  context: { requestId: string }
) => Promise<NextResponse>;

export function withMiddleware(handler: RouteHandler) {
  return async (request: NextRequest, context?: { params: Promise<{}> }) => {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const method = request.method;
    const path = new URL(request.url).pathname;

    info('Incoming request', {
      requestId,
      method,
      path,
      userAgent: request.headers.get('user-agent'),
    });

    debug('Calling route handler', { requestId, method, path });

    try {
      const response = await handler(request, { requestId });
      const latency = Date.now() - startTime;
      const status = response.status;

      debug('Handler completed successfully', { requestId, status });

      info('Request completed', {
        requestId,
        method,
        path,
        status,
        latency,
      });

      response.headers.set('X-Request-Id', requestId);
      return response;
    } catch (error) {
      const latency = Date.now() - startTime;
      
      debug('Handler threw error', {
        requestId,
        errorType: (error as Error).name,
        errorMessage: (error as Error).message,
      });

      const errorResponse = formatErrorResponse(
        error as Error,
        requestId
      );
      
      const status = error instanceof ApiError ? error.statusCode : 500;

      info('Request completed with error', {
        requestId,
        method,
        path,
        status,
        latency,
        error: (error as Error).message,
      });

      const response = NextResponse.json(errorResponse, { status });
      response.headers.set('X-Request-Id', requestId);
      return response;
    }
  };
}