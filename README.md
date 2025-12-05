# aXiom - AI-Powered Feedback Triage System

**Live Demo**: [https://axiom-amber-five.vercel.app/](https://axiom-amber-five.vercel.app/)  
**Repository**: [https://github.com/Handale1808/aXiom.git](https://github.com/Handale1808/aXiom.git)

An intelligent feedback analysis application that uses AI to automatically triage, categorize, and prioritize customer feedback. Built for a fictional bioengineering company specializing in alien-cat hybrids.

## Features

- **AI-Powered Analysis** - Automatic sentiment detection, priority classification, and tagging using Anthropic Claude
- **Advanced Filtering** - Search, filter by sentiment/priority/tags, with localStorage persistence
- **Real-time Updates** - Edit AI-generated recommendations, bulk delete operations
- **Responsive Design** - Modern UI with Tailwind CSS and custom theming
- **Comprehensive Testing** - 80%+ test coverage with Jest
- **Structured Logging** - Request ID correlation for debugging
- **Type Safety** - Full TypeScript implementation

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4
- **Backend**: Next.js API Routes, TypeScript
- **Database**: MongoDB Atlas
- **AI**: Anthropic Claude (claude-sonnet-4-20250514)
- **Testing**: Jest, @testing-library/react
- **Deployment**: Vercel

## Prerequisites

- **Node.js**: v18.14.0 or higher (tested on v11.5.2)
- **MongoDB**: Atlas account or local MongoDB instance
- **Anthropic API Key**: For AI analysis ([get one here](https://console.anthropic.com/))

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Handale1808/aXiom.git
cd aXiom
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:
```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# Anthropic AI
ANTHROPIC_API_KEY=your_anthropic_api_key

# Next.js
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NODE_ENV=development
```

**Getting your MongoDB URI:**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/axiom`)

**Getting your Anthropic API Key:**
1. Sign up at [Anthropic Console](https://console.anthropic.com/)
2. Generate an API key from your dashboard

### 4. Database Setup (Optional)

If you modify the index structure, run:
```bash
npm run setup-db
```

This creates optimized indexes for:
- Text search across feedback and summaries
- Filters (sentiment, priority, tags)
- Sorting (createdAt descending)

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build production bundle |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint for code quality |
| `npm run setup-db` | Create MongoDB indexes (optional) |
| `npm test` | Run Jest test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate coverage report |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run typecheck` | Type-check without building |

## Project Structure
```
aXiom/
├── app/                          # Next.js app router
│   ├── api/feedback/            # API endpoints
│   ├── submit/                  # Feedback submission page
│   ├── feedbacks/               # Feedback list page
│   └── about/                   # About page
├── lib/
│   ├── components/              # React components
│   ├── hooks/                   # Custom hooks
│   ├── services/                # Business logic (AI analysis)
│   ├── types/                   # TypeScript interfaces
│   ├── utils/                   # Utility functions
│   ├── errors.ts                # Error classes
│   ├── logger.ts                # Logging system
│   ├── middleware.ts            # Request middleware
│   └── mongodb.ts               # Database client
├── models/                      # Data models
├── __tests__/                   # Test suites
├── docs/                        # Documentation
└── scripts/                     # Setup scripts
```

## Usage

### Submitting Feedback

1. Navigate to **Submit Feedback** (`/submit`)
2. Enter feedback text (required) and optional email
3. Click **INITIATE_SCAN**
4. View AI-generated analysis with:
   - Summary
   - Sentiment (positive/neutral/negative)
   - Priority (P0-P3)
   - Tags
   - Recommended next action

### Viewing Feedback Archive

1. Navigate to **Feedback List** (`/feedbacks`)
2. Use filters:
   - **Search**: Full-text search across feedback and summaries
   - **Sentiment**: Filter by positive/neutral/negative
   - **Priority**: Filter by P0/P1/P2/P3
   - **Tags**: Filter by specific tags (AND logic)
3. Sort by clicking column headers
4. Click any row to view full details
5. Bulk delete with checkboxes

## API Endpoints

### `POST /api/feedback`
Create new feedback with AI analysis

**Request:**
```json
{
  "text": "Feedback text here",
  "email": "user@example.com" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "text": "...",
    "email": "...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "analysis": {
      "summary": "...",
      "sentiment": "positive",
      "tags": ["tag1", "tag2"],
      "priority": "P2",
      "nextAction": "..."
    }
  }
}
```

### `GET /api/feedback`
List feedback with filters and pagination

**Query Parameters:**
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 50)
- `sentiment` - Filter by sentiment
- `priority` - Filter by priority
- `tag` - Filter by tag
- `search` - Full-text search

### `GET /api/feedback/:id`
Get single feedback by ID

### `PATCH /api/feedback/:id`
Update nextAction field

**Request:**
```json
{
  "nextAction": "Updated action text"
}
```

### `DELETE /api/feedback/:id`
Delete single feedback

### `DELETE /api/feedback`
Bulk delete feedback

**Request:**
```json
{
  "ids": ["id1", "id2", "id3"]
}
```

## Testing

Run the test suite:
```bash
npm test
```

Generate coverage report:
```bash
npm run test:coverage
```

**Test Coverage**: 80.23%
- AI Analysis Service: 88.88%
- API Routes: 95.55%
- Error Handling: 92.3%

See `docs/TESTING.md` for detailed testing documentation.

## Logging & Debugging

The application includes structured logging with request ID correlation:

**Log Levels:**
- `debug` - Detailed diagnostic info
- `info` - General informational messages
- `warn` - Unexpected but recoverable issues
- `error` - Failures requiring attention

**Finding Logs by Request:**
Every API response includes an `X-Request-Id` header. Use this to filter logs:
```bash
# Example request ID: req_1234567890_abc123
# All logs for this request will include [req_1234567890_abc123]
```

See `docs/LOGGING_IMPLEMENTATION.md` for detailed logging documentation.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com)
3. Add environment variables:
   - `MONGODB_URI`
   - `ANTHROPIC_API_KEY`
   - `NODE_ENV=production`
4. Deploy

The app will automatically deploy on every push to `main`.

## Documentation

- **SOLUTION.md** - Architecture and design decisions
- **docs/TESTING.md** - Testing strategy and coverage
- **docs/LOGGING_IMPLEMENTATION.md** - Logging system details
- **docs/AI_IMPLEMENTATION.md** - AI integration approach

## License

This project was created as a technical assessment.

## Contact

Created by [Handale1808](https://github.com/Handale1808)