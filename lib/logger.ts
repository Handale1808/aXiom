interface LogData {
  method: string;
  path: string;
  status: number;
  latency: number;
  requestId: string;
  error?: string;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface BaseLogData {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  [key: string]: any;
}

export interface RequestLogData extends BaseLogData {
  method?: string;
  path?: string;
  status?: number;
  latency?: number;
}

export interface DatabaseLogData extends BaseLogData {
  operation?: string;
  collection?: string;
  duration?: number;
  recordCount?: number;
  filter?: any;
}

export interface AILogData extends BaseLogData {
  provider?: string;
  model?: string;
  operation?: string;
  duration?: number;
  attempt?: number;
  textLength?: number;
  error?: string;
}

function formatLogData(data: BaseLogData): string {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    return JSON.stringify(data);
  }
  
  const { timestamp, level, message, requestId, ...rest } = data;
  const levelStr = level.toUpperCase().padEnd(5);
  const reqIdStr = requestId ? `[${requestId}]` : '';
  const restStr = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : '';
  
  return `[${timestamp}] ${levelStr} ${reqIdStr} ${message}${restStr}`;
}

function log(level: LogLevel, message: string, data?: Partial<BaseLogData>): void {
  const logData: BaseLogData = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data,
  };

  const formatted = formatLogData(logData);

  switch (level) {
    case 'error':
      console.error(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'info':
      console.info(formatted);
      break;
    case 'debug':
      console.debug(formatted);
      break;
  }
}

export function debug(message: string, data?: Partial<BaseLogData>): void {
  log('debug', message, data);
}

export function info(message: string, data?: Partial<BaseLogData>): void {
  log('info', message, data);
}

export function warn(message: string, data?: Partial<BaseLogData>): void {
  log('warn', message, data);
}

export function error(message: string, data?: Partial<BaseLogData>): void {
  log('error', message, data);
}

export function logRequest(data: RequestLogData): void {
  const { method, path, status, latency, requestId, error: errorMsg } = data;
  
  if (errorMsg) {
    error('Request failed', {
      method,
      path,
      status,
      latency,
      requestId,
      error: errorMsg,
    });
  } else {
    info('Request completed', {
      method,
      path,
      status,
      latency,
      requestId,
    });
  }
}

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function sanitizeEmail(email?: string): string {
  return email ? '[email present]' : '[no email]';
}

export function sanitizeFilter(filter: any): any {
  if (!filter || typeof filter !== 'object') {
    return filter;
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(filter)) {
    if (typeof value === 'string' && value.length > 100) {
      sanitized[key] = value.substring(0, 100) + '...';
    } else if (key.toLowerCase().includes('email')) {
      sanitized[key] = '[redacted]';
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}