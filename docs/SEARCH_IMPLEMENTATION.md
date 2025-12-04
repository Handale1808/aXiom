# Search Implementation

## Approach

We implemented full-text search using **MongoDB text indexes** on the `text` and `analysis.summary` fields.

## Implementation Details

- Text index created on two fields:
  - `text` (feedback content) - weighted 2x
  - `analysis.summary` (AI-generated summary) - weighted 1x
- Uses MongoDB's `$text` operator with `$search`
- Results sorted by relevance score (`textScore`) when searching
- Falls back to chronological sorting when no search term provided

## Usage

```
GET /api/feedback?search=shipping
GET /api/feedback?search=bug&sentiment=negative
```

## Trade-offs

### Pros:

- Fast performance for our scale (hundreds of feedbacks)
- Built into MongoDB, no external services needed
- Works seamlessly with existing filters (sentiment, priority)
- Relevance scoring ensures best matches appear first
- Supports stemming (searches "ship" finds "shipping")

### Cons:

- Whole-word matching only (doesn't support partial words mid-string)
- Limited to English language stemming by default
- Less flexible than regex for complex patterns
- Index takes up additional storage space

## Alternative Approaches Considered

1. **Regex Search** - More flexible but much slower, no relevance scoring
2. **Atlas Search** - Most powerful but overkill for hundreds of records
3. **Elasticsearch** - Best for millions of records but adds infrastructure complexity

## Future Improvements

If the dataset grows to 10,000+ feedbacks or we need more advanced features:

- Migrate to MongoDB Atlas Search for fuzzy matching
- Add language-specific analyzers for non-English feedback
- Implement search highlighting
- Add autocomplete suggestions
