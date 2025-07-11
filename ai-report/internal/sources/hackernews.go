package sources

import (
	"encoding/json"
	"fmt"
	"html"
	"net/http"
	"strings"
	"time"

	"github.com/ai-report/aggregator/internal/aggregator"
)

// HackerNewsSource implements the Source interface for Hacker News
type HackerNewsSource struct {
	keywords []string
	client   *http.Client
}

// NewHackerNewsSource creates a new Hacker News source
func NewHackerNewsSource(keywords []string) *HackerNewsSource {
	return &HackerNewsSource{
		keywords: keywords,
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// HNItem represents a Hacker News item
type HNItem struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	URL         string `json:"url"`
	Score       int    `json:"score"`
	Time        int64  `json:"time"`
	Descendants int    `json:"descendants"`
}

// FetchNews fetches news from Hacker News
func (h *HackerNewsSource) FetchNews() ([]aggregator.RawNewsItem, error) {
	// Get top stories
	resp, err := h.client.Get("https://hacker-news.firebaseio.com/v0/topstories.json")
	if err != nil {
		return nil, fmt.Errorf("failed to fetch HN top stories: %w", err)
	}
	defer resp.Body.Close()

	var storyIDs []int
	if err := json.NewDecoder(resp.Body).Decode(&storyIDs); err != nil {
		return nil, fmt.Errorf("failed to decode story IDs: %w", err)
	}

	// Limit to top 100 stories
	if len(storyIDs) > 100 {
		storyIDs = storyIDs[:100]
	}

	items := make([]aggregator.RawNewsItem, 0)
	
	// Fetch each story
	for _, id := range storyIDs {
		item, err := h.fetchItem(id)
		if err != nil {
			continue // Skip failed items
		}

		// Check if item matches our keywords
		if h.matchesKeywords(item) {
			newsItem := aggregator.RawNewsItem{
				Title:       html.UnescapeString(item.Title),
				URL:         item.URL,
				Description: fmt.Sprintf("HN Score: %d | Comments: %d", item.Score, item.Descendants),
				PublishedAt: time.Unix(item.Time, 0),
				Source:      "Hacker News",
			}

			// If no URL, link to HN discussion
			if newsItem.URL == "" {
				newsItem.URL = fmt.Sprintf("https://news.ycombinator.com/item?id=%d", item.ID)
			}

			items = append(items, newsItem)
		}
	}

	return items, nil
}

// fetchItem fetches a single HN item
func (h *HackerNewsSource) fetchItem(id int) (*HNItem, error) {
	url := fmt.Sprintf("https://hacker-news.firebaseio.com/v0/item/%d.json", id)
	resp, err := h.client.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var item HNItem
	if err := json.NewDecoder(resp.Body).Decode(&item); err != nil {
		return nil, err
	}

	return &item, nil
}

// matchesKeywords checks if an item matches our AI-related keywords
func (h *HackerNewsSource) matchesKeywords(item *HNItem) bool {
	titleLower := strings.ToLower(item.Title)
	
	for _, keyword := range h.keywords {
		if strings.Contains(titleLower, strings.ToLower(keyword)) {
			return true
		}
	}
	
	return false
}

// GetName returns the name of the Hacker News source
func (h *HackerNewsSource) GetName() string {
	return "Hacker News"
} 