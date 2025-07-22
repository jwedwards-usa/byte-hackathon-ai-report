package sources

import (
	"fmt"
	"html"
	"net/http"
	"time"

	"github.com/ai-report/aggregator/internal/aggregator"
	"github.com/mmcdole/gofeed"
)

// RSSFeed represents an RSS feed configuration
type RSSFeed struct {
	Name     string
	URL      string
	Category string
}

// RSSSource implements the Source interface for RSS feeds
type RSSSource struct {
	feed   RSSFeed
	parser *gofeed.Parser
}

// NewRSSSource creates a new RSS source
func NewRSSSource(feed RSSFeed) *RSSSource {
	// Create a custom HTTP client with user agent
	httpClient := &http.Client{
		Timeout: 30 * time.Second,
		Transport: &http.Transport{
			MaxIdleConns:       10,
			IdleConnTimeout:    30 * time.Second,
			DisableCompression: false,
		},
	}

	// Create parser with custom client
	fp := gofeed.NewParser()
	fp.Client = httpClient
	// Use a browser-like user agent to avoid bot detection
	fp.UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

	return &RSSSource{
		feed:   feed,
		parser: fp,
	}
}

// FetchNews fetches news from the RSS feed
func (r *RSSSource) FetchNews() ([]aggregator.RawNewsItem, error) {
	var feed *gofeed.Feed
	var err error

	// Retry logic with exponential backoff
	maxRetries := 3
	for i := 0; i < maxRetries; i++ {
		feed, err = r.parser.ParseURL(r.feed.URL)
		if err == nil {
			break
		}

		// If it's not the last retry, wait before retrying
		if i < maxRetries-1 {
			waitTime := time.Duration(1<<uint(i)) * time.Second // 1s, 2s, 4s
			time.Sleep(waitTime)
		}
	}

	if err != nil {
		return nil, fmt.Errorf("failed to parse RSS feed %s after %d retries: %w", r.feed.Name, maxRetries, err)
	}

	items := make([]aggregator.RawNewsItem, 0, len(feed.Items))

	for _, item := range feed.Items {
		// Parse published date
		publishedAt := time.Now()
		if item.PublishedParsed != nil {
			publishedAt = *item.PublishedParsed
		} else if item.UpdatedParsed != nil {
			publishedAt = *item.UpdatedParsed
		}

		// Skip items older than 48 hours
		if time.Since(publishedAt) > 48*time.Hour {
			continue
		}

		// Extract image URL if available
		imageURL := ""
		if item.Image != nil {
			imageURL = item.Image.URL
		} else if len(item.Enclosures) > 0 {
			for _, enc := range item.Enclosures {
				if enc.Type == "image/jpeg" || enc.Type == "image/png" {
					imageURL = enc.URL
					break
				}
			}
		}

		newsItem := aggregator.RawNewsItem{
			Title:       html.UnescapeString(item.Title),
			URL:         item.Link,
			Description: item.Description,
			PublishedAt: publishedAt,
			Source:      r.feed.Name,
			ImageURL:    imageURL,
		}

		items = append(items, newsItem)
	}

	return items, nil
}

// GetName returns the name of the RSS source
func (r *RSSSource) GetName() string {
	return r.feed.Name
}
