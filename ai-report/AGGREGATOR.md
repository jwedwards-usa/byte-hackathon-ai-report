# AI Report News Aggregator

A Go-based news aggregator that collects AI-related news from multiple sources and generates the `news-data.json` file for the AI Report website.

## Features

- **Multi-source aggregation**: RSS feeds, Hacker News, Reddit, Twitter/X, and web scraping
- **Intelligent ranking**: Scores articles based on relevance, recency, and source authority
- **Duplicate detection**: Removes duplicate stories across sources
- **Automatic archiving**: Keeps historical news data for up to 7 days
- **Concurrent fetching**: Fast, parallel processing of all sources
- **Drudge-style formatting**: Automatic headline capitalization for major news

## Sources

### Currently Implemented
- **RSS Feeds**: 
  - MIT Technology Review AI
  - The Verge AI
  - VentureBeat AI
  - AI News
  - OpenAI Blog
  - Google AI Blog
  - DeepMind Blog
  - Anthropic News
  - Hugging Face Blog

- **Hacker News**: Filters top stories for AI-related keywords

### Stub Implementations (Ready for Extension)
- **Reddit**: r/MachineLearning, r/artificial, r/singularity, etc.
- **Twitter/X**: Major AI accounts via Nitter RSS
- **Web Scraping**: TechCrunch, Ars Technica, Wired AI sections

## Installation

### Local Development

```bash
# Install dependencies
go mod download

# Run the aggregator
go run cmd/aggregator/main.go

# Build binary
go build -o aggregator cmd/aggregator/main.go
```

### Docker

```bash
# Build image
docker build -f Dockerfile.aggregator -t ai-report-aggregator .

# Run container
docker run -v $(pwd)/public:/root/public ai-report-aggregator
```

## GitHub Action

The aggregator runs automatically every hour via GitHub Actions:

```yaml
on:
  schedule:
    - cron: '0 * * * *'  # Every hour
```

You can also trigger it manually from the Actions tab.

## Configuration

### Adding New RSS Feeds

Edit `cmd/aggregator/main.go`:

```go
rssFeeds := []sources.RSSFeed{
    {Name: "New Source", URL: "https://example.com/rss", Category: "AI"},
    // ... existing feeds
}
```

### Adjusting Keywords

The aggregator scores articles based on AI-related keywords. Update the list in `internal/aggregator/aggregator.go`:

```go
keywords := []string{
    "GPT", "ChatGPT", "Claude", "Gemini", // ... etc
}
```

### Modifying Scoring Algorithm

The scoring algorithm considers:
- Keyword matches (2 points for title, 1 for description)
- Recency (5 points for < 1 hour, 3 for < 6 hours, 1 for < 24 hours)
- Trusted sources (2 points for OpenAI, Google, etc.)

## Output Format

The aggregator generates:

1. **`public/news-data.json`**: Current news in the required format
2. **`public/archive/news-data-YYYY-MM-DD-HH-MM-SS.json`**: Historical archives

### JSON Structure

```json
{
  "mainHeadline": {
    "text": "MAJOR AI BREAKTHROUGH",
    "url": "https://example.com/article",
    "image": {
      "src": "https://example.com/image.jpg",
      "alt": "Description",
      "width": 600,
      "height": 400
    }
  },
  "topStories": [...],
  "leftColumn": [...],
  "centerColumn": [...],
  "rightColumn": [...],
  "lastUpdated": "2024-01-15T12:00:00Z"
}
```

## Extending Sources

To add a new source type:

1. Create a new file in `internal/sources/`
2. Implement the `Source` interface:

```go
type Source interface {
    FetchNews() ([]RawNewsItem, error)
    GetName() string
}
```

3. Add the source in `cmd/aggregator/main.go`

### Example: Adding Reddit Support

```go
// internal/sources/reddit.go
func (r *RedditSource) FetchNews() ([]aggregator.RawNewsItem, error) {
    // Use Reddit API or RSS feeds
    // Parse posts
    // Filter by keywords
    // Return items
}
```

## Monitoring

- Check GitHub Actions for run history
- Review logs for fetch errors
- Monitor `public/archive/` for successful updates

## Troubleshooting

### No News Updates
1. Check GitHub Actions logs
2. Verify RSS feeds are accessible
3. Ensure keywords match current content

### Duplicate Stories
- Adjust `normalizeTitle()` function in aggregator
- Add more source-specific suffixes to remove

### Performance Issues
- Reduce number of concurrent fetches
- Implement caching for frequently accessed sources
- Use connection pooling for HTTP requests

## Future Enhancements

1. **Image Processing**
   - Download and optimize images
   - Generate thumbnails
   - Store in date-based folders

2. **Advanced Filtering**
   - ML-based relevance scoring
   - Sentiment analysis
   - Topic clustering

3. **Additional Sources**
   - Academic papers (arXiv)
   - YouTube channels
   - Podcasts
   - Press releases

4. **Analytics**
   - Track click-through rates
   - Monitor source reliability
   - Analyze trending topics 