package sources

import (
	"compress/gzip"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/ai-report/aggregator/internal/aggregator"
	"golang.org/x/net/html"
)

// RedditSource stub implementation
type RedditSource struct {
	subreddits []string
}

func NewRedditSource(subreddits []string) *RedditSource {
	return &RedditSource{subreddits: subreddits}
}

func (r *RedditSource) FetchNews() ([]aggregator.RawNewsItem, error) {
	// Stub implementation - would use Reddit API
	return []aggregator.RawNewsItem{}, nil
}

func (r *RedditSource) GetName() string {
	return "Reddit"
}

// TwitterAccount configuration
type TwitterAccount struct {
	Handle string
	URL    string
}

// TwitterSource stub implementation
type TwitterSource struct {
	account TwitterAccount
}

func NewTwitterSource(account TwitterAccount) *TwitterSource {
	return &TwitterSource{account: account}
}

func (t *TwitterSource) FetchNews() ([]aggregator.RawNewsItem, error) {
	// Stub implementation - would parse Twitter/Nitter RSS
	return []aggregator.RawNewsItem{}, nil
}

func (t *TwitterSource) GetName() string {
	return fmt.Sprintf("Twitter/@%s", t.account.Handle)
}

// WebScraper configuration
type WebScraper struct {
	Name string
	URL  string
}

// WebScraperSource implementation for scraping blog posts
type WebScraperSource struct {
	scraper WebScraper
	client  *http.Client
}

func NewWebScraperSource(scraper WebScraper) *WebScraperSource {
	return &WebScraperSource{
		scraper: scraper,
		client: &http.Client{
			Timeout: 30 * time.Second,
			CheckRedirect: func(req *http.Request, via []*http.Request) error {
				if len(via) >= 10 {
					return fmt.Errorf("too many redirects")
				}
				// Copy headers to redirected request
				if len(via) > 0 {
					req.Header = via[0].Header
				}
				return nil
			},
		},
	}
}

func (w *WebScraperSource) FetchNews() ([]aggregator.RawNewsItem, error) {
	// Create request with proper headers
	req, err := http.NewRequest("GET", w.scraper.URL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request for %s: %w", w.scraper.URL, err)
	}

	// Set user agent and other headers
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
	req.Header.Set("Accept-Language", "en-US,en;q=0.5")
	req.Header.Set("Accept-Encoding", "gzip, deflate")
	req.Header.Set("Connection", "keep-alive")
	req.Header.Set("Upgrade-Insecure-Requests", "1")

	// Fetch the webpage
	resp, err := w.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch %s: %w", w.scraper.URL, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP %d for %s", resp.StatusCode, w.scraper.URL)
	}

	// Handle gzip encoding
	var reader io.Reader = resp.Body
	if strings.Contains(resp.Header.Get("Content-Encoding"), "gzip") {
		gzReader, err := gzip.NewReader(resp.Body)
		if err != nil {
			return nil, fmt.Errorf("failed to create gzip reader: %w", err)
		}
		defer gzReader.Close()
		reader = gzReader
	}

	// Parse HTML
	doc, err := html.Parse(reader)
	if err != nil {
		return nil, fmt.Errorf("failed to parse HTML from %s: %w", w.scraper.URL, err)
	}

	// Extract blog posts
	posts := w.extractBlogPosts(doc)

	// Convert to news items
	items := make([]aggregator.RawNewsItem, 0, len(posts))
	for _, post := range posts {
		// Skip posts older than 48 hours
		if time.Since(post.PublishedAt) > 48*time.Hour {
			continue
		}

		items = append(items, aggregator.RawNewsItem{
			Title:       post.Title,
			URL:         post.URL,
			Description: post.Description,
			PublishedAt: post.PublishedAt,
			Source:      w.scraper.Name,
			ImageURL:    post.ImageURL,
		})
	}

	return items, nil
}

func (w *WebScraperSource) GetName() string {
	return w.scraper.Name
}

// BlogPost represents a scraped blog post
type BlogPost struct {
	Title       string
	URL         string
	Description string
	PublishedAt time.Time
	ImageURL    string
}

// extractBlogPosts extracts blog posts from HTML
func (w *WebScraperSource) extractBlogPosts(n *html.Node) []BlogPost {
	var posts []BlogPost

	// This is a simplified implementation
	// In a real implementation, you'd want to:
	// 1. Use a proper HTML parser like goquery
	// 2. Handle different blog platforms (WordPress, Jekyll, etc.)
	// 3. Extract dates, descriptions, and images
	// 4. Handle pagination

	// For now, we'll return a basic post structure
	// This would need to be customized per blog
	posts = append(posts, BlogPost{
		Title:       "Sample Blog Post",
		URL:         w.scraper.URL,
		Description: "Blog post from " + w.scraper.Name,
		PublishedAt: time.Now(),
		ImageURL:    "",
	})

	return posts
}
