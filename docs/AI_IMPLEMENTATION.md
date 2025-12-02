# AI Analysis Implementation

## Approach

We implemented AI-powered feedback analysis using **Anthropic's Claude API** with exponential backoff retries and structured JSON output validation.

## Provider Choice

I selected the **Anthropic API** because Claude consistently provides concise, direct, and context-aware outputs. For this project, I prioritised a model that minimises unnecessary verbosity and delivers clear, no-nonsense responses, which aligns closely with my workflow and the requirements of the system.

**Model**: `claude-sonnet-4-20250514`
- Balances speed and intelligence
- Excellent at following strict JSON formatting instructions
- Strong at sentiment analysis and prioritisation tasks

## Implementation Details

### Core Features
- Structured prompt engineering for consistent JSON output
- Response validation with type checking
- Mock mode fallback when no API key provided
- Exponential backoff retry logic (3 attempts)
- Comprehensive error handling and logging

### Output Schema
```typescript
{
  summary: string;        // 1-2 sentence summary
  sentiment: "positive" | "neutral" | "negative";
  tags: string[];         // 1-5 descriptive nouns
  priority: "P0" | "P1" | "P2" | "P3";
  nextAction: string;     // Recommended action
}
```

### Priority Levels
- **P0**: Critical issues affecting core functionality or user safety
- **P1**: Important issues affecting user experience significantly
- **P2**: Moderate issues or feature requests
- **P3**: Minor issues or nice-to-have improvements

## Resilience: Retries Over Caching

I chose **exponential backoff retries** rather than caching because:

1. **Uniqueness**: User feedback is almost always unique, making cache hits rare
2. **Cost-Benefit**: The overhead of maintaining a cache (hashing, storage, lookups) outweighs benefits for low cache-hit scenarios
3. **Freshness**: Each analysis reflects current AI model capabilities without stale cached results
4. **Simplicity**: 3 retries with backoff (1s, 2s, 4s) handles transient failures without added infrastructure

### Retry Strategy
```typescript
retryWithBackoff(fn, maxRetries: 3)
- Attempt 1: immediate
- Attempt 2: 1s delay
- Attempt 3: 2s delay
- Attempt 4: 4s delay
```

Most API failures are transient (rate limits, network blips), so 3 retries provides good reliability without excessive delays.

## Safety Measures

1. **PII Protection**: Prompt explicitly instructs model not to echo personally identifiable information
2. **Output Validation**: Strict type checking on all response fields before storing
3. **Length Limits**: Summary and nextAction kept concise to prevent verbosity
4. **Professional Tone**: Prompt enforces professional, actionable language
5. **No Raw Logging**: User content and full prompts never logged, only metadata

## Current Architecture (Synchronous)
```
User submits → POST /api/feedback → AI analysis → Store in DB → Return result
```

**Flow:**
1. Validate input
2. Call Anthropic API (with retries)
3. Validate and parse JSON response
4. Store feedback + analysis in MongoDB
5. Return complete record to user

**Drawback**: User waits 2-5 seconds for AI response, poor UX if API is slow.

## Production Evolution (Async Background Processing)

### Recommended Approach: Vercel Background Functions

**New Flow:**
```
User submits → Store immediately → Return success → Background job analyzes → Update DB
```

### Implementation Plan

1. **Immediate Response**
```typescript
// POST /api/feedback
const feedback = {
  text,
  email,
  createdAt: new Date(),
  analysis: null,
  analysisStatus: 'pending'  // new field
};
await collection.insertOne(feedback);

// Trigger background function
await fetch('/api/analyze-background', {
  method: 'POST',
  body: JSON.stringify({ feedbackId: feedback._id })
});

return NextResponse.json({ 
  success: true, 
  data: feedback 
}, { status: 201 });
```

2. **Background Worker**
```typescript
// app/api/analyze-background/route.ts
export const maxDuration = 60; // Vercel background function config

async function POST(request: NextRequest) {
  const { feedbackId } = await request.json();
  
  // Fetch feedback
  const feedback = await collection.findOne({ _id: feedbackId });
  
  // Perform AI analysis (with retries)
  const analysis = await analyzeFeedback(feedback.text);
  
  // Update DB
  await collection.updateOne(
    { _id: feedbackId },
    { 
      $set: { 
        analysis,
        analysisStatus: 'completed',
        analyzedAt: new Date()
      }
    }
  );
}
```

3. **Frontend Polling**
```typescript
// Poll for analysis completion
const pollForAnalysis = async (feedbackId: string) => {
  const interval = setInterval(async () => {
    const response = await fetch(`/api/feedback/${feedbackId}`);
    const data = await response.json();
    
    if (data.data.analysisStatus === 'completed') {
      clearInterval(interval);
      // Update UI with analysis
    }
  }, 2000); // Poll every 2 seconds
};
```

### Benefits of Async Approach

**User Experience:**
- Instant feedback submission (< 100ms response)
- No waiting for AI processing
- Can continue browsing while analysis runs
- Progressive enhancement: show "Analyzing..." status

**Reliability:**
- API timeouts don't affect user submission
- Background jobs can be retried independently
- Failed analyses don't block user workflow

**Scalability:**
- Handles traffic spikes without blocking requests
- Can rate-limit background jobs separately
- Easier to add job queuing/prioritization later

**Monitoring:**
- Separate metrics for submission vs. analysis success
- Easier to identify AI API issues
- Can track analysis queue depth and processing time

### Alternative: WebSockets for Real-Time Updates

Instead of polling, use WebSocket connection:
```typescript
// Server pushes update when analysis completes
socket.emit('analysisComplete', { feedbackId, analysis });
```

**Trade-off**: More complex but better UX (instant updates vs. 2s polling delay).

## Logging and Observability

We log AI request metadata without exposing sensitive data:
```typescript
console.log(`AI analysis completed in ${duration}ms using claude-sonnet-4-20250514`);
```

**What we log:**
- Request duration
- Model used
- Success/failure status
- Retry attempts

**What we DON'T log:**
- User feedback text
- Email addresses
- Full prompts
- Complete AI responses (only validation errors)

## Trade-offs

### Pros:
- High-quality, consistent analysis from Claude
- Resilient to transient API failures
- Simple architecture (no queue infrastructure needed currently)
- Strong safety guardrails against PII leakage

### Cons:
- Synchronous processing blocks user experience
- Single point of failure (Anthropic API)
- No fallback to alternative AI provider
- Costs scale linearly with feedback volume

## Future Improvements

1. **Async Processing**: Migrate to Vercel background functions (detailed above)
2. **Caching Layer**: Add Redis cache for identical feedback text (hash-based lookup)
3. **Batch Processing**: Process multiple feedbacks in single API call for efficiency
4. **Multi-Provider Fallback**: Add OpenAI as backup if Anthropic fails
5. **Analysis Versioning**: Track which model version generated each analysis
6. **A/B Testing**: Compare analysis quality across different prompts/models