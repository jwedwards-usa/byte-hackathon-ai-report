package sources

import (
	"fmt"
	"html"
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
	return &RSSSource{
		feed:   feed,
		parser: gofeed.NewParser(),
	}
}

// FetchNews fetches news from the RSS feed
func (r *RSSSource) FetchNews() ([]aggregator.RawNewsItem, error) {
	feed, err := r.parser.ParseURL(r.feed.URL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse RSS feed %s: %w", r.feed.Name, err)
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