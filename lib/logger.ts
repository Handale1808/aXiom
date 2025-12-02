interface LogData {
  method: string;
  path: string;
  status: number;
  latency: number;
  requestId: string;
  error?: string;
}

export function logRequest(data: LogData): void {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${data.method} ${data.path} ${data.status} ${data.latency}ms [${data.requestId}]`;
  
  if (data.error) {
    console.error(logMessage, data.error);
  } else {
    console.log(logMessage);
  }
}

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}