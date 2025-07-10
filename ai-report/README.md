# AI Report

A Drudge Report-style news aggregator for artificial intelligence news, built with Next.js 15, TypeScript, and optimized for GitHub Pages hosting. Features an automated Go-based news aggregator that updates content hourly.

## Features

- **Static Site Generation**: Fully static site optimized for SEO and fast loading
- **Minimal JavaScript**: Server-side rendered for optimal performance
- **Responsive Design**: Works on all devices
- **GitHub Pages Ready**: Configured for seamless deployment
- **Automated News Aggregation**: Go-based aggregator fetches from multiple sources hourly
- **JSON-Driven Content**: Easy to update via automated GitHub Actions
- **Image Support**: Select headlines can include images with full accessibility
- **Date-Based Image Organization**: Images stored in date folders for easy cleanup
- **Historical Archives**: Keeps 7 days of news history

## Project Structure

```
ai-report/
├── app/                      # Next.js App Router directory
│   ├── page.tsx             # Main page component with image support
│   ├── layout.tsx           # Layout with SEO metadata and accessibility
│   ├── globals.css          # Global styles import
│   ├── styles.css           # All custom CSS styles including image styling
│   └── sitemap.ts           # Sitemap generator
├── public/                   # Static assets
│   ├── news-data.json       # Current news content (auto-generated)
│   ├── archive/             # Historical news data (7 days)
│   ├── images/              # Date-organized images
│   │   └── YYYY-MM-DD/      # Daily folders for cleanup
│   ├── robots.txt           # SEO configuration
│   └── .nojekyll            # GitHub Pages config
├── cmd/aggregator/          # Go news aggregator
│   └── main.go              # Aggregator entry point
├── internal/                # Go internal packages
│   ├── aggregator/          # Core aggregation logic
│   └── sources/             # News source implementations
├── .github/                 # GitHub Actions
│   └── workflows/           
│       ├── deploy.yml       # Site deployment
│       └── aggregate-news.yml # Hourly news updates
├── go.mod                   # Go dependencies
├── next.config.ts           # Next.js configuration
├── package.json             # Node dependencies and scripts
├── tsconfig.json            # TypeScript config
├── SPEC.md                  # Project specification
├── TASKS.md                 # Development task tracking
├── AGGREGATOR.md            # News aggregator documentation
└── README.md                # This file
```

## News Aggregator

The project includes a Go-based news aggregator that automatically fetches AI news from multiple sources:

### Sources
- **RSS Feeds**: OpenAI, Google AI, DeepMind, Anthropic, MIT Tech Review, and more
- **Hacker News**: Filters for AI-related stories
- **Ready to extend**: Reddit, Twitter/X, and web scraping stubs included

### Features
- Runs hourly via GitHub Actions
- Intelligent ranking based on relevance and recency
- Duplicate detection across sources
- Automatic archiving with 7-day retention
- Drudge-style headline formatting

See [AGGREGATOR.md](AGGREGATOR.md) for detailed documentation.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- Go 1.21+ (for local aggregator development)

### Installation

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd ai-report

# Install dependencies
npm install

# For aggregator development
go mod download
```

## Local Development with Live Monitoring

### 1. Start Development Server

```bash
npm run dev
```

This will start the development server at [http://localhost:3000](http://localhost:3000) with:
- **Hot Module Replacement (HMR)**: Changes to your code will automatically reflect in the browser
- **Fast Refresh**: React components will update without losing state
- **Error Overlay**: Build and runtime errors displayed in the browser

### 2. Run News Aggregator Locally

```bash
# Run the Go aggregator
go run cmd/aggregator/main.go

# Or build and run
go build -o aggregator cmd/aggregator/main.go
./aggregator
```

### 3. Live Editing Workflow

1. **Open your browser** to [http://localhost:3000](http://localhost:3000)
2. **Open your code editor** side-by-side with the browser
3. **Make changes** to any file:
   - Edit `app/styles.css` to see style changes instantly
   - Run aggregator to update `public/news-data.json`
   - Update `app/page.tsx` for layout changes
   - Add images to `public/images/YYYY-MM-DD/` folders
4. **Save the file** - the browser will automatically update

### 4. Useful Development Commands

```bash
# Run in separate terminal windows for full monitoring:

# Terminal 1: Development server with live reload
npm run dev

# Terminal 2: Run news aggregator
go run cmd/aggregator/main.go

# Terminal 3: Check for TypeScript errors
npx tsc --watch --noEmit

# Terminal 4: Monitor for linting issues
npx eslint . --watch
```

### 5. Testing Content Updates

To test how content updates will look:

```bash
# Run the aggregator manually
go run cmd/aggregator/main.go

# The page will update when you refresh the browser
```

## Content Management

### Automated Updates

The news aggregator runs hourly via GitHub Actions:
- Fetches from all configured sources
- Ranks by relevance and recency
- Updates `public/news-data.json`
- Archives previous versions
- Commits changes automatically

### JSON Structure with Images

The site content is driven by `/public/news-data.json`. Headlines can optionally include images:

```json
{
  "mainHeadline": {
    "text": "MAIN HEADLINE TEXT",
    "url": "https://example.com/article",
    "image": {
      "src": "/images/2024-01-15/headline-image.jpg",
      "alt": "Descriptive alt text for accessibility",
      "width": 600,
      "height": 400
    }
  },
  "topStories": [
    {
      "text": "TOP STORY HEADLINE",
      "url": "https://example.com/story",
      "image": {
        "src": "/images/2024-01-15/story-image.jpg",
        "alt": "Alt text describing the image content",
        "width": 400,
        "height": 300
      }
    }
  ],
  "leftColumn": [...],
  "centerColumn": [...],
  "rightColumn": [...],
  "lastUpdated": "2024-01-15T12:00:00Z"
}
```

### Image Guidelines

1. **Directory Structure**: Store images in `/public/images/YYYY-MM-DD/` folders based on article date
2. **Naming Convention**: Use descriptive, SEO-friendly filenames (e.g., `ai-breakthrough-2024.jpg`)
3. **Formats**: Use `.jpg` for photos, `.png` for graphics with transparency
4. **Sizes**: 
   - Main headline: 600x400px max
   - Top stories: 400x300px max
   - Column images: 300x200px max
5. **Alt Text**: Always provide descriptive alt text for accessibility
6. **Optimization**: Compress images before adding (use tools like TinyPNG)

### Accessibility Features

- **Alt Text**: Every image must have descriptive alt text
- **ARIA Labels**: Proper labeling for screen readers
- **Skip to Content**: Keyboard navigation support
- **Focus Indicators**: Clear focus states for keyboard users
- **Semantic HTML**: Proper heading hierarchy and landmarks

## Building for Production

```bash
# Create optimized production build
npm run build

# Test the production build locally
npx serve out
# This will serve the static files at http://localhost:3000
```

## GitHub Pages Deployment

### Initial Setup

1. **Update Configuration Files**

   Edit `next.config.ts`:
   ```typescript
   const nextConfig: NextConfig = {
     output: 'export',
     basePath: process.env.NODE_ENV === 'production' ? '/your-repo-name' : '',
     images: {
       unoptimized: true,
     },
     // ... rest of config
   };
   ```
   Replace `your-repo-name` with your actual GitHub repository name.

2. **Update URLs**

   In `app/layout.tsx`, update the URLs:
   ```typescript
   openGraph: {
     url: "https://your-username.github.io/your-repo-name",
     images: [
       {
         url: "/your-repo-name/og-image.jpg",
         // ...
       }
     ],
     // ...
   }
   ```

   In `app/sitemap.ts`:
   ```typescript
   url: 'https://your-username.github.io/your-repo-name',
   ```

### Manual Deployment

1. **Build the Static Site**
   ```bash
   npm run build
   ```

2. **Create gh-pages Branch** (first time only)
   ```bash
   git checkout --orphan gh-pages
   git rm -rf .
   touch .nojekyll
   git add .nojekyll
   git commit -m "Initial gh-pages commit"
   git push origin gh-pages
   git checkout main
   ```

3. **Deploy to GitHub Pages**
   ```bash
   # Make sure you're on main branch
   git checkout main

   # Build and deploy
   npm run build
   
   # Copy the .nojekyll file to the output
   cp public/.nojekyll out/
   
   # Deploy to gh-pages branch
   npx gh-pages -d out -t true
   ```

### Automated Deployment with GitHub Actions

The project includes two GitHub Actions:

1. **News Aggregation** (`aggregate-news.yml`):
   - Runs hourly to fetch latest AI news
   - Updates `news-data.json` automatically
   - Archives previous versions

2. **Site Deployment** (`deploy.yml`):
   - Triggered after news updates
   - Builds and deploys to GitHub Pages

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          NODE_ENV: production
      
      - name: Add .nojekyll
        run: touch out/.nojekyll
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
```

### Configure GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **Deploy from a branch**
4. Choose **gh-pages** branch and **/ (root)** folder
5. Click **Save**
6. Your site will be available at `https://your-username.github.io/your-repo-name`

### Verify Deployment

After deployment, check:
- [ ] Site loads at `https://your-username.github.io/your-repo-name`
- [ ] All links work correctly
- [ ] CSS styles are applied
- [ ] Images load properly with correct paths
- [ ] Content from `news-data.json` displays properly
- [ ] News updates hourly via GitHub Actions

## Troubleshooting

### Common Issues

1. **404 Error on GitHub Pages**
   - Ensure `basePath` in `next.config.ts` matches your repository name
   - Check that `.nojekyll` file exists in the output
   - Verify image paths include the base path in production

2. **Images Not Loading**
   - Check that image paths are relative (start with `/`)
   - Ensure images are in the correct date folder
   - Verify the `basePath` is set correctly for production

3. **Styles Not Loading**
   - Verify the `basePath` is correctly set
   - Check browser console for 404 errors on CSS files

4. **Build Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check for TypeScript errors: `npx tsc --noEmit`
   - Ensure all images referenced in JSON actually exist

5. **Content Not Updating**
   - Check GitHub Actions logs for aggregator runs
   - Verify RSS feeds are accessible
   - Clear browser cache
   - Check that `news-data.json` is valid JSON

6. **News Aggregator Issues**
   - Check GitHub Actions logs
   - Run aggregator locally to debug
   - Verify Go dependencies: `go mod verify`

## Performance Tips

- Keep `news-data.json` under 100KB for optimal load times
- Limit news items to 50-100 per page
- Use descriptive but concise headlines
- Optimize images before uploading (aim for < 200KB per image)
- Use appropriate image dimensions to avoid layout shift

## SEO Best Practices

- Always include descriptive alt text for images
- Use semantic HTML structure
- Keep headlines concise and keyword-rich
- Ensure all links have descriptive text
- Maintain consistent URL structure
- Update content regularly (automated hourly)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

MIT
