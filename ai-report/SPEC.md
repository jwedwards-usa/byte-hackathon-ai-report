# AI Report - Project Specification

## Overview

AI Report is a Drudge Report-style news aggregator specifically focused on artificial intelligence news. Built with Next.js 15, it generates a fully static site optimized for GitHub Pages hosting with minimal JavaScript and maximum SEO performance. The project includes an automated Go-based news aggregator that fetches content from multiple sources hourly.

## Architecture

### Technology Stack
- **Frontend**: Next.js 15 (App Router), TypeScript
- **Backend**: Go 1.21+ (news aggregator)
- **Styling**: Pure CSS (no frameworks)
- **Deployment**: GitHub Pages (static export)
- **Content Management**: JSON-based with automated updates
- **Automation**: GitHub Actions

### Key Design Principles
1. **Static First**: Everything is pre-rendered at build time
2. **Minimal JavaScript**: Server-side rendering for optimal performance
3. **SEO Optimized**: Semantic HTML, meta tags, sitemap generation
4. **Accessibility First**: WCAG 2.1 AA compliant
5. **Performance**: Sub-second load times, minimal bundle size
6. **Automated Content**: Hourly updates via Go aggregator

## Project Structure

```
ai-report/
├── app/                      # Next.js App Router directory
│   ├── page.tsx             # Main page component (server component)
│   ├── layout.tsx           # Root layout with metadata
│   ├── globals.css          # CSS imports only
│   ├── styles.css           # All custom styles
│   ├── sitemap.ts           # Dynamic sitemap generation
│   └── page.test.tsx        # Component tests
├── public/                   # Static assets
│   ├── news-data.json       # Current news (auto-generated)
│   ├── archive/             # Historical news data (7 days)
│   ├── images/              # Date-organized images
│   │   └── YYYY-MM-DD/      # Daily folders for cleanup
│   ├── robots.txt           # SEO configuration
│   └── .nojekyll            # GitHub Pages config
├── cmd/aggregator/          # Go news aggregator
│   └── main.go              # Entry point with source configuration
├── internal/                # Go internal packages
│   ├── aggregator/          # Core aggregation logic
│   │   └── aggregator.go    # Ranking, deduplication, processing
│   └── sources/             # News source implementations
│       ├── rss.go           # RSS feed parser
│       ├── hackernews.go    # Hacker News API
│       └── stubs.go         # Reddit, Twitter, scraper stubs
├── .github/                 # GitHub Actions
│   └── workflows/           
│       ├── aggregate-news.yml # Hourly news updates
│       └── deploy.yml       # Site deployment
├── go.mod                   # Go dependencies
├── Dockerfile.aggregator    # Container for aggregator
├── next.config.ts           # Next.js configuration
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript config
└── README.md                # User documentation
```

## News Aggregator Architecture

### Source Interface
```go
type Source interface {
    FetchNews() ([]RawNewsItem, error)
    GetName() string
}
```

### Data Flow
1. **Fetching**: Concurrent retrieval from all sources
2. **Scoring**: Relevance ranking based on keywords, recency, source
3. **Deduplication**: Title normalization and similarity detection
4. **Categorization**: Distribution across main headline, top stories, columns
5. **Archiving**: Previous versions saved with timestamps
6. **Publishing**: Updated news-data.json committed to repository

### Implemented Sources
- **RSS Feeds**: 9 AI-focused feeds (OpenAI, Google AI, DeepMind, etc.)
- **Hacker News**: Top stories filtered by AI keywords
- **Extensible**: Stubs for Reddit, Twitter/X, web scraping

### Scoring Algorithm
- Keyword matches: 2 points (title), 1 point (description)
- Recency: 5 points (<1hr), 3 points (<6hr), 1 point (<24hr)
- Trusted sources: 2 points (OpenAI, Google, MIT, etc.)
- Headline formatting: Auto-capitalization for major news

## Data Model

### NewsItem Interface
```typescript
interface ImageData {
  src: string;      // Path relative to public dir
  alt: string;      // Descriptive alt text (required)
  width: number;    // Image width in pixels
  height: number;   // Image height in pixels
}

interface NewsItem {
  text: string;     // Headline text
  url: string;      // External link
  image?: ImageData; // Optional image
}

interface NewsData {
  mainHeadline: NewsItem;
  topStories: NewsItem[];
  leftColumn: NewsItem[];
  centerColumn: NewsItem[];
  rightColumn: NewsItem[];
  lastUpdated: string; // ISO 8601 date
}
```

## Features

### Core Features
1. **Three-column layout** mimicking Drudge Report
2. **Automated news aggregation** running hourly
3. **Date-based image organization** for automated cleanup
4. **JSON-driven content** for easy updates
5. **Responsive design** with mobile-first approach
6. **Full accessibility** support with ARIA labels
7. **Print-friendly** styles
8. **Historical archives** with 7-day retention

### Performance Targets
- **Lighthouse Score**: 95+ on all metrics
- **First Contentful Paint**: < 1s
- **Time to Interactive**: < 1.5s
- **Bundle Size**: < 100KB (excluding images)
- **Aggregator Runtime**: < 30s for all sources

### SEO Features
- Server-side rendered HTML
- Comprehensive meta tags
- Open Graph support
- Twitter Card support
- Dynamic sitemap generation
- Semantic HTML structure
- Schema.org structured data (future)

## Content Management

### Automated Update Workflow
1. GitHub Action triggers hourly (cron: `0 * * * *`)
2. Go aggregator fetches from all sources
3. Content is scored, deduplicated, and ranked
4. news-data.json is generated
5. Previous version archived with timestamp
6. Changes committed and pushed
7. Site rebuild triggered automatically

### Manual Override
1. Edit source configuration in `cmd/aggregator/main.go`
2. Run aggregator locally: `go run cmd/aggregator/main.go`
3. Commit changes to trigger deployment

### Image Guidelines
- **Formats**: JPEG for photos, PNG for graphics, SVG for icons
- **Optimization**: Compress before uploading
- **Naming**: Use descriptive, SEO-friendly names
- **Organization**: Store in date-based folders
- **Cleanup**: Automatic removal after 7 days

### Content Guidelines
- **Headlines**: Concise, keyword-rich, ALL CAPS for major stories
- **URLs**: Always use HTTPS external links
- **Alt Text**: Descriptive, informative, unique
- **Updates**: Hourly via GitHub Actions (automated)

## Development Workflow

### Local Development
```bash
npm run dev      # Start dev server with HMR
npm run build    # Build static site
npm run test     # Run tests in watch mode
npm run lint     # Check code quality
go run cmd/aggregator/main.go # Run aggregator
```

### Deployment
```bash
npm run deploy   # Build and deploy to gh-pages
```

### Code Standards
- **Components**: Functional components only
- **State**: Minimal client-side state
- **Types**: Strict TypeScript, no `any`
- **Styling**: BEM-like class naming
- **Testing**: Focus on critical paths
- **Comments**: Explain why, not what
- **Go**: Follow standard Go conventions

## Configuration

### Environment Variables
- `NODE_ENV`: Development/production mode
- `NEXT_PUBLIC_BASE_PATH`: GitHub Pages base path

### Build Configuration
- **Output**: Static export
- **Images**: Unoptimized for GitHub Pages
- **Trailing Slash**: Enabled for proper routing
- **Base Path**: Repository name in production

### Aggregator Configuration
- **Sources**: Defined in `cmd/aggregator/main.go`
- **Keywords**: Listed in `internal/aggregator/aggregator.go`
- **Archive Retention**: 7 days (configurable)
- **Concurrent Fetches**: Unlimited (configurable)

## Future Enhancements

### Phase 1 (Complete) ✅
- ✅ Basic Drudge Report layout
- ✅ JSON-driven content
- ✅ Image support
- ✅ GitHub Pages deployment
- ✅ Go news aggregator
- ✅ Automated hourly updates

### Phase 2 (In Progress)
- [ ] Complete source implementations (Reddit, Twitter, scrapers)
- [ ] RSS feed generation
- [ ] Content categories/filtering
- [ ] Search functionality
- [ ] Dark mode support
- [ ] PWA capabilities
- [ ] Historical browsing

### Phase 3 (Future)
- [ ] AI-powered content analysis
- [ ] Real-time updates via API
- [ ] User preferences
- [ ] Analytics integration
- [ ] Multi-language support
- [ ] Advanced caching strategies

## Constraints

### Technical Constraints
- Must work without JavaScript enabled
- No external API calls at runtime
- All content pre-rendered at build time
- Images must be self-hosted
- No database dependencies
- Aggregator must complete in < 5 minutes

### Design Constraints
- Maintain Drudge Report aesthetic
- Minimal visual elements
- Focus on text content
- Fast loading times
- Mobile-responsive
- No animations or transitions

## Success Metrics
- Page load time < 2s on 3G
- 100% accessibility score
- Zero runtime errors
- SEO visibility increase
- Consistent hourly updates
- < 1% duplicate story rate 