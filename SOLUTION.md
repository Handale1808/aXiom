aXiom solution

Architecture Overview:

aXiom is a full-stack feedback analysis application built with a three tier architecture. The concerns are seperated into distinct layers.
PRESENTATION LAYER:
* Next.js
* React
* Tailwind

BUSINESS LOGIC LAYER:
* API routes
* Middleware
* Services
* Validation

DATA ACCESS LAYER:
* MongoDB 
* Database Helpers
* Indexing

Module Organisation:
    1. PRESENTATION LAYER:
        * / - Landing page with project overview
        * /submit - Feedback submission form
        * /feedbacks - Paginated feedback list with filters
        * /about - Business information

        * Header - Navigation bar
        * TextSubmit - Reusable textarea with validation
        * AnalysisResult - Displays AI analysis with editable nextAction
        * FeedbackList - Table with sorting, filtering, search, bulk actions
        * FeedbackDetailModal - Full feedback view with edit/delete
        * Badge - Reusable component for tags and priorities
        * Modal, ConfirmationDialog - UI utilities
        * ErrorBoundary - Error handling boundary

        * useFeedbackData - Data fetching with filters/pagination
        * useFeedbackFilters - Filter state management with localStorage
        * useFeedbackActions - Bulk delete, selection, update logic

    2. BUSINESS LOGIC LAYER:
        * POST /api/feedback - Create feedback + AI analysis
        * GET /api/feedback - List with filters (sentiment, priority, tag, search) + pagination
        * GET /api/feedback/[id] - Single feedback detail
        * DELETE /api/feedback/[id] - Delete single feedback
        * PATCH /api/feedback/[id] - Update nextAction
        * DELETE /api/feedback - Bulk delete

        * Middleware
            - Request ID generation and propagation
            - Structured logging (entry/exit)
            - Error handling with standardized responses
            - Request timing
        * aiAnalysis.ts - Anthropic API integration with retry logic
        * Error Handling
            - ApiError, ValidationError, DatabaseError classes
            - Standardized error response formatting
        * Logging System
            - Structured JSON logging (production) / human-readable (dev)
            - Request ID correlation across layers
            - PII sanitization utilities
            - Database operation wrapper with auto-timing
    3. DATA ACCESS LAYER:
            - MongoDB connection and configuration
            - Database helpers for common operations
            - Indexing utilities
            - Connection pooling (min 2, max 10 connections)
            - Environment-specific singleton pattern
            - Automatic reconnection handling
            - Database client
            - Database model

Data Flow:
1. Feedback Submission Flow
    User submits form
        ↓
    TextSubmit validates input
        ↓
    POST /api/feedback
        ↓
    Middleware generates requestId
        ↓
    Validate text (required)
        ↓
    Call Anthropic API (with retries)
        ↓
    Parse & validate JSON response
        ↓
    Insert to MongoDB (with logging)
        ↓
    Return feedback + analysis to user
        ↓
    Display AnalysisResult component

2. Feedback List Flow
    User visits /feedbacks
        ↓
    useFeedbackData hook fetches data
        ↓
    GET /api/feedback?page=1&pageSize=15&sentiment=...
        ↓
    Middleware logs request
        ↓
    Build MongoDB filter from query params
        ↓
    Execute query with sort/limit/skip
        ↓
    Count total documents for pagination
        ↓
    Return paginated data + metadata
        ↓
    FeedbackList renders with filters/sorting

Tech Stack Choices:

FRAMEWORK & CORE TECH
    Next.js 16
    * Provides seamless integration between frontend and backend with colocated API routes, eliminating the need for a   separate Express server which I did not think I had enough time to implement
    * Server-side rendering, file-based routing, and React Server Components in a single framework
    * Easiest way to add pages and routes without complex setup

    React 19
    * Latest stable version with newest features and performance improvements
    * React is my primary framework in professional work and personal projects

    TypeScript
    * Type safety catches errors at compile time rather than runtime
    * Build errors can be frustrating, but the benefits of controlled data types outweigh the inconvenience
    * Reduces bugs and improves code maintainability in team environments

DATABASE & DATA LAYER
    MongoDB (Native Driver)
    * OfferZen uses MongoDB in production, making this an opportunity to demonstrate learning new technology quickly
    * Document-based structure aligns well with feedback storage (no complex relations needed)
    * Fast for the project scope without ORM overhead
    * I would explore Mongoose for schema validation and middleware in larger projects
    
    MongoDB (Atlas)
    * Cloud-hosted database with automatic backups, scaling, and monitoring
    * Seamless integration with Vercel for production hosting
    * Used .env.local for secure credential management

AI INTEGRATION
    Anthropic SDK
    * Claude excels at cutting through fluff and delivering concise, structured outputs
    * My preferred AI for coding-related prompts due to its directness
    * Consistently produces clean JSON responses without unnecessary conversational filler
    * Strong at following strict formatting instructions for structured data
    * Retry logic:
        - Implemented retries over caching
        - Each feedback submission is unique (low cache hit rate)
        - Retries handle transient failures (network blips, temporary rate limits)
        - Exponential backoff (1s, 2s, 4s) balances resilience with user experience
        - Simpler implementation without cache management overhead
    
FRONTEND STYLING & UI
    Tailwind CSS
    * Fastest way to add styling with utility-first approach
    * More than capable for project requirements without the overhead of component libraries
    * Rapid prototyping with consistent design tokens

    Custom Reusable Components
    * Chosen as primary reusable component demonstration
    * Portal implementation:
        - React Portals render outside parent DOM hierarchy to avoid size/position constraints
        - Always centered with blurred background for professional appearance
        - Shows deeper understanding than simple Badge components

TESTING INFRASTRUCTURE
    Jest
    * Industry-standard testing framework with extensive documentation
    * It was my first experience with unit testing; Jest offered easiest implementation path
    * Thoroughly enjoyed writing tests and plan to integrate into all future professional work
    * Achieved 80%+ test coverage demonstrating commitment to quality

    Custom Test Setup
    * I implemented a mocking strategy by providing module-level mocks for Anthropic SDK and MongoDB
    * Each test suite runs independently without external dependencies

STATE MANAGEMENT & DATA PERSISTENCE
    Custom hooks
    * Project scope doesn't justify complex state management libraries
    * Fast, simple, and sufficient for current requirements
    
    localStorage for filters
    * Persists user preferences across tabs and browser sessions
    * Prevents frustration of losing filter selections on page refresh (I can't stand this)
    * sessionStorage would lose data between sessions; URL params would clutter URLs

LOGGING & OBSERVABILITY
    Custom Logging Solution
    * Wanted full control to understand requirements before committing to a library
    * My current implementation contains a few hundred lines of structured logging with request ID correlation
    * Would adopt Winston or Pino for production scale with advanced features (log rotation, transports, sampling)
    * Custom solution demonstrates architectural understanding but lacks enterprise features

DEVELOPMENT TOOLS
    Windsurf
    * AI-powered IDE features (code completion, refactoring, navigation, etc.)
    * Cascade is a wonderful addition that makes finding where you put what really easy
    * Has all the plugins I need

    ESLint
    * Enforces code structure and consistency
    * Catches common errors and maintains code quality standards

    Prettier
    * Automated code formatting for perfect structure
    * Code must be PERFECTly structured for readability and maintainability (I cannot work otherwise)
    * Eliminates formatting debates in collaborative environments

    tsx (TypeScript Execution)
    * Super fast and easy execution of TypeScript files directly

DEPLOYMENT & VERSION CONTROL
    Vercel
    * Free tier, seamless GitHub integration, automatic deployments
    * Zero-configuration deployment for Next.js applications
    * Automatic preview URLs for every pull request

    GitHub
    * Industry standard for version control and collaboration
    * Direct pipeline to Vercel for CI/CD

Feature Implementation Decisions:

Filter Logic (AND for Tags, OR for Priorities)
* Tags (AND) - Assumption that users want feedback containing ALL selected tags
* Priorities (OR) -  Logical constraint - feedback can only have one priority level (P0, P1, P2, or P3)
* This choice caused great distress during implementation and I'm still not certain I made the best choice
* I think in future I would make this toggleable to allow users to choose AND/OR logic

Sort & Filter Features
* Easy identification of critical feedback for prioritization
* Sorting is faster to implement than custom report views
* As mentioned before, localStorage persistence prevents filter loss on refresh

Error Boundary
* Graceful error handling at the component level
* Prevents entire application crashes when individual components fail
* Shows meaningful error messages with retry options
* Catches React component errors and provides fallback UI

Data Model Choices:

MongoDB (NoSQL) vs Relational Database
* I chose MongoDB because it demonstrates adaptability—learning new technology quickly
* No complex relationships needed - feedback is self-contained
* Schema flexibility allows easy evolution without migrations
* Fast document retrieval without joins

Document Structure
{
  _id: ObjectId,    // MongoDB default for uniqueness + timestamp
  text: string,
  email?: string,   // Optional; future: separate users table
  createdAt: Date,
  analysis: {       // Embedded for atomic retrieval
    summary: string,
    sentiment: "positive" | "neutral" | "negative",
    tags: string[], // Array for simplicity; future: tag metadata table
    priority: "P0" | "P1" | "P2" | "P3",    // Strings for readability; future: priority table with descriptions
    nextAction: string
  }
}

Key Design Decisions
* Analysis always retrieved with feedback; embedding avoids joins
* 1:1 relationship makes tight coupling acceptable
* email stored directly (future: users collection with admin/customer roles)
* tags as array (future: tag categorization and metadata)
* priority as strings (future: priority table with SLA rules)
* createdAt as Date (simple; could optimize to timestamps later)
* Hard deletes sufficient for assessment scope
* In future I would add status field and deletedAt timestamp
* Editing nextAction overwrites (assumes correction of AI mistakes)
* Indexing strategy:
    - Text search: {text: "text", "analysis.summary": "text"} with 2:1 weighting (feedback more important than summary)
    - Filter indexes: sentiment, priority, tags, createdAt (descending for newest-first)
    - 5 indexes = write overhead, but acceptable for small dataset (<100k documents)
    - Single collection sufficient for project scope
    - Future: compound indexes, sharding, or archiving at 1M+ documents

