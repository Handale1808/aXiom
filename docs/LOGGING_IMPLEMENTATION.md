# Logging System Implementation

## Approach

We implemented production-ready structured logging with **custom-built utilities** using Node.js native capabilities, request ID propagation, and comprehensive coverage across all application layers.

## Technology Choice: Custom Solution vs Libraries

I chose to build a **custom logging solution** rather than using established libraries like Winston, Pino, or Bunyan.

**Why custom:**

- Zero external dependencies to manage
- Full control over log format and behavior
- ~200 lines of code vs ~500KB+ library overhead
- Demonstrates understanding of logging principles from scratch
- Perfect fit for project scope and requirements

**Libraries considered:**

- **Winston**: Most popular, but overkill for this scope
- **Pino**: Extremely fast, but we don't have high-throughput needs
- **Bunyan**: Battle-tested, but less active development

For a **production system at scale**, I would evaluate Winston or Pino based on log volume, team familiarity, and infrastructure needs. For this **assignment scope**, a custom solution demonstrates deeper architectural understanding.

## Implementation Details

### Core Features

- Multiple log levels (debug, info, warn, error)
- Structured JSON output for production
- Human-readable format for development
- Request ID propagation through all layers
- Database operation logging wrapper
- PII sanitization utilities
- Environment-aware formatting

### Log Levels

- **debug**: Detailed diagnostic information (e.g., "Parsing AI response")
- **info**: General informational messages (e.g., "Request completed in 1250ms")
- **warn**: Unexpected but recoverable issues (e.g., "Retrying API call")
- **error**: Failures requiring attention (e.g., "Database connection failed")

### Output Format

**Development:**

```
[2024-01-01T12:00:00.000Z] INFO  [req_123] Request completed {"latency": 1250}
```

**Production:**

```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "level": "info",
  "message": "Request completed",
  "latency": 1250,
  "requestId": "req_123"
}
```

## Request ID (Correlation ID) Implementation

### Format

```
req_1234567890_abc123
```

- Timestamp for uniqueness
- Random string for collision prevention

### Propagation Flow

```
Middleware (generates) → Route Handler (receives via context) → AI Service (parameter) → Database Wrapper (parameter)
```

**Benefits:**

1. **Distributed Tracing**: Track single request through entire system
2. **Production Debugging**: Filter all logs for specific request when user reports error
3. **Performance Analysis**: Calculate time spent in each layer
4. **Concurrent Request Separation**: No confusion between simultaneous requests

### Implementation

```typescript
// Middleware generates and passes to handler
const requestId = generateRequestId();
const response = await handler(request, { requestId });

// Handler receives and uses
async function postHandler(
  request: NextRequest,
  context: { requestId: string }
) {
  const { requestId } = context;
  info("Processing feedback submission", { requestId });

  // Pass to AI service
  const analysis = await analyzeFeedback(text, requestId);

  // Pass to database wrapper
  await withDatabaseLogging(() => collection.insertOne(feedback), {
    operation: "insertOne",
    collection: "feedbacks",
    requestId,
  });
}
```

## Database Logging Wrapper

### Pattern: Higher-Order Function

Instead of manual logging around every database operation:

```typescript
// Without wrapper (repetitive)
const start = Date.now();
debug("Starting database operation");
const result = await collection.insertOne(feedback);
const duration = Date.now() - start;
info("Database operation completed", { duration });
```

We use a wrapper function:

```typescript
// With wrapper (DRY)
const result = await withDatabaseLogging(() => collection.insertOne(feedback), {
  operation: "insertOne",
  collection: "feedbacks",
  requestId,
});
```

**Benefits:**

- **DRY**: No repeated logging code
- **Consistency**: Every database operation logged the same way
- **Automatic timing**: Duration calculated automatically
- **Record counting**: Detects and logs result counts automatically
- **Separation of concerns**: Business logic stays clean

## PII Sanitization

### Safety Measures

We implement utility functions to prevent logging personally identifiable information:

```typescript
sanitizeEmail(email); // Returns "[email present]" or "[no email]"
sanitizeFilter(filter); // Redacts email fields, truncates long strings
truncateText(text, 50); // Limits text length in logs
```

**Why this matters:**

1. **Privacy Compliance**: Email addresses are PII under GDPR/CCPA
2. **Security**: Logs might be accessed by many people or sent to third-party services
3. **Best Practice**: Production logs should contain metadata, not content
4. **Risk Reduction**: Reduces attack surface if logs are leaked

### Usage

```typescript
// Log presence, not values
info("Input validated", {
  requestId,
  email: sanitizeEmail(email), // "[email present]"
  textLength: text.length, // Safe metadata
  textPreview: truncateText(text, 50), // Limited exposure
});

// Sanitize database filters
debug("Querying database", {
  requestId,
  filter: sanitizeFilter(filter), // Redacts sensitive fields
});
```

## Structured Logging (JSON)

### Traditional vs Structured

**Traditional logging:**

```
POST /api/feedback 201 1250ms
```

**Structured logging:**

```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "level": "info",
  "message": "Request completed",
  "method": "POST",
  "path": "/api/feedback",
  "status": 201,
  "latency": 1250,
  "requestId": "req_123"
}
```

**Why structured:**

- **Machine Parseable**: Log aggregation services can parse automatically
- **Queryable**: Search like a database ("Show all requests where latency > 1000ms")
- **Contextual**: Rich metadata in every log entry
- **Production Operations**: Easy filtering, grouping, aggregating, alerting

### Environment-Based Formatting

**Development**: Human-readable for debugging
**Production**: JSON for log aggregation services (CloudWatch, Datadog, Elasticsearch)

```typescript
const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  return JSON.stringify(data);
} else {
  return formatHumanReadable(data);
}
```

## Logging Coverage

### Application Layers

**Middleware Layer:**

```
- Incoming request (info)
- Calling route handler (debug)
- Handler completed (debug)
- Request completed (info)
- Handler threw error (debug) [on error]
```

**Route Handler Layer:**

```
- Processing submission (debug)
- Validating input (debug)
- Input validated (info)
- Starting AI analysis (info)
- AI analysis completed (info)
- Inserting to database (debug)
- Feedback stored (info)
```

**AI Service Layer:**

```
- Starting analysis (info)
- Using mock mode (warn) [if no API key]
- Calling API (debug)
- API call successful (debug)
- Parsing response (debug)
- Parsing failed (error) [on error]
- Validation failed (error) [on error]
- Analysis validated (info)
- Analysis completed (info)
- Retrying API call (warn) [on retry]
```

**Database Layer:**

```
- Executing operation (debug)
- Operation completed (info)
```

## Observability

### What We Log

- Request/response metadata (method, path, status, latency)
- Operation durations (AI calls, database queries)
- Request IDs for correlation
- Error messages and types
- Retry attempts and delays
- Record counts and operation types

### What We DON'T Log

- Email addresses (sanitized to "[email present]")
- Full feedback text (only length)
- Complete AI prompts
- Raw AI responses (except validation errors)
- Sensitive filter values

### Metrics Captured

```typescript
{
  requestId: "req_123",
  method: "POST",
  path: "/api/feedback",
  status: 201,
  latency: 1250,           // Total request time
  aiDuration: 850,         // Time spent in AI service
  dbDuration: 45,          // Time spent in database
  sentiment: "positive",
  priority: "P2"
}
```

## Production Integration

### Log Aggregation

Our structured JSON logs integrate with:

- **AWS CloudWatch Logs**: Automatic JSON parsing
- **Google Cloud Logging**: Structured log ingestion
- **Datadog**: Log pipelines and dashboards
- **Elasticsearch/Kibana**: Full-text search and visualization
- **Splunk**: Enterprise log analysis

### Querying Examples

With structured logs, you can query like a database:

```
# Find all errors for a specific request
requestId: "req_123" AND level: "error"

# Find slow requests
latency > 2000

# Find all AI retry attempts
message: "Retrying API call"

# Calculate average AI duration
AVG(aiDuration) WHERE path: "/api/feedback"

# Alert on high error rate
COUNT(level: "error") > 10 per minute
```

## Trade-offs

### Pros:

- Zero external dependencies
- Full control and transparency
- Production-ready JSON format
- Comprehensive request tracing
- PII-safe logging
- Environment-aware output

### Cons:

- No log transports (file, HTTP, database)
- No log rotation or archiving
- No built-in log level filtering at runtime
- Manual maintenance required

### When to Use Libraries:

Consider Winston, Pino, or Bunyan when:

- Need multiple log transports
- Require log rotation and archiving
- Need advanced filtering and sampling
- High-volume logging (>1000 logs/second)
- Large team requiring standardized tooling

For this project scope, our custom solution is appropriate and sufficient.

## Future Enhancements

1. **Log Sampling**: Sample debug logs in production to reduce volume
2. **Dynamic Log Levels**: Change log level without restart via environment variable
3. **Structured Error Objects**: Include stack traces in development only
4. **Request Duration Breakdown**: Detailed timing for each operation
5. **Log Aggregation**: Integrate with CloudWatch or Datadog
6. **Alert Configuration**: Set up alerts for error rates and slow requests
