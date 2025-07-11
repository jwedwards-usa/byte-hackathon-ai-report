package aggregator

import (
	"fmt"
	"log"
	"sort"
	"strings"
	"sync"
	"time"
)

// Source interface that all news sources must implement
type Source interface {
	FetchNews() ([]RawNewsItem, error)
	GetName() string
}

// RawNewsItem represents a news item from any source
type RawNewsItem struct {
	Title       string
	URL         string
	Description string
	PublishedAt time.Time
	Source      string
	ImageURL    string
	Score       float64 // Relevance score
}

// ProcessedNews represents categorized news items
type ProcessedNews struct {
	TopStory     NewsItem
	TopStories   []NewsItem
	LeftColumn   []NewsItem
	CenterColumn []NewsItem
	RightColumn  []NewsItem
}

// NewsItem represents a formatted news item for output
type NewsItem struct {
	Text  string     `json:"text"`
	URL   string     `json:"url"`
	Image *ImageData `json:"image,omitempty"`
}

type ImageData struct {
	Src    string `json:"src"`
	Alt    string `json:"alt"`
	Width  int    `json:"width"`
	Height int    `json:"height"`
}

// Aggregator manages all news sources
type Aggregator struct {
	sources []Source
	mu      sync.Mutex
}

// New creates a new Aggregator
func New() *Aggregator {
	return &Aggregator{
		sources: make([]Source, 0),
	}
}

// AddSource adds a news source to the aggregator
func (a *Aggregator) AddSource(source Source) {
	a.mu.Lock()
	defer a.mu.Unlock()
	a.sources = append(a.sources, source)
}

// FetchAll fetches news from all sources concurrently
func (a *Aggregator) FetchAll() ([]RawNewsItem, error) {
	var wg sync.WaitGroup
	results := make(chan []RawNewsItem, len(a.sources))
	errors := make(chan error, len(a.sources))

	for _, source := range a.sources {
		wg.Add(1)
		go func(s Source) {
			defer wg.Done()
			news, err := s.FetchNews()
			if err != nil {
				log.Printf("Error fetching from %s: %v", s.GetName(), err)
				errors <- err
				return
			}
			results <- news
		}(source)
	}

	wg.Wait()
	close(results)
	close(errors)

	// Collect all news items
	var allNews []RawNewsItem
	for news := range results {
		allNews = append(allNews, news...)
	}

	// Check if we had any errors
	var errs []error
	for err := range errors {
		errs = append(errs, err)
	}

	if len(errs) > 0 && len(allNews) == 0 {
		return nil, fmt.Errorf("failed to fetch news from any source")
	}

	return allNews, nil
}

// ProcessNews processes raw news items into categorized format
func (a *Aggregator) ProcessNews(items []RawNewsItem) *ProcessedNews {
	// Score and rank items
	scoredItems := a.scoreItems(items)
	
	// Sort by score and recency
	sort.Slice(scoredItems, func(i, j int) bool {
		// Prioritize by score, then by recency
		if scoredItems[i].Score != scoredItems[j].Score {
			return scoredItems[i].Score > scoredItems[j].Score
		}
		return scoredItems[i].PublishedAt.After(scoredItems[j].PublishedAt)
	})

	// Remove duplicates
	uniqueItems := a.removeDuplicates(scoredItems)

	// Convert to NewsItems
	newsItems := make([]NewsItem, 0, len(uniqueItems))
	for _, item := range uniqueItems {
		newsItem := NewsItem{
			Text: formatHeadline(item.Title),
			URL:  item.URL,
		}

		// Add image if available
		if item.ImageURL != "" {
			newsItem.Image = &ImageData{
				Src:    item.ImageURL,
				Alt:    item.Title,
				Width:  600,
				Height: 400,
			}
		}

		newsItems = append(newsItems, newsItem)
	}

	// Categorize news
	processed := &ProcessedNews{}
	
	if len(newsItems) > 0 {
		processed.TopStory = newsItems[0]
	}

	if len(newsItems) > 1 {
		end := min(4, len(newsItems))
		processed.TopStories = newsItems[1:end]
	}

	if len(newsItems) > 4 {
		// Distribute remaining items across columns
		remaining := newsItems[4:]
		columnSize := len(remaining) / 3

		if columnSize > 0 {
			processed.LeftColumn = remaining[:columnSize]
			processed.CenterColumn = remaining[columnSize : 2*columnSize]
			processed.RightColumn = remaining[2*columnSize:]
		} else {
			// If not enough for all columns, distribute what we have
			if len(remaining) > 0 {
				processed.LeftColumn = remaining[:1]
			}
			if len(remaining) > 1 {
				processed.CenterColumn = remaining[1:2]
			}
			if len(remaining) > 2 {
				processed.RightColumn = remaining[2:]
			}
		}
	}

	return processed
}

// scoreItems calculates relevance scores for news items
func (a *Aggregator) scoreItems(items []RawNewsItem) []RawNewsItem {
	keywords := []string{
		"GPT", "ChatGPT", "Claude", "Gemini", "LLM", "AI", "artificial intelligence",
		"machine learning", "deep learning", "neural network", "OpenAI", "Anthropic",
		"Google AI", "DeepMind", "Microsoft AI", "Meta AI", "AGI", "AI safety",
		"AI regulation", "AI ethics", "transformer", "diffusion model", "BREAKING",
		"EXCLUSIVE", "URGENT", "breakthrough", "revolutionary", "unprecedented",
	}

	for i := range items {
		score := 0.0
		titleLower := strings.ToLower(items[i].Title)
		descLower := strings.ToLower(items[i].Description)

		// Check keywords
		for _, keyword := range keywords {
			keywordLower := strings.ToLower(keyword)
			if strings.Contains(titleLower, keywordLower) {
				score += 2.0 // Title matches are worth more
			}
			if strings.Contains(descLower, keywordLower) {
				score += 1.0
			}
		}

		// Boost for recency (last 24 hours)
		hoursSince := time.Since(items[i].PublishedAt).Hours()
		if hoursSince < 1 {
			score += 5.0
		} else if hoursSince < 6 {
			score += 3.0
		} else if hoursSince < 24 {
			score += 1.0
		}

		// Boost for certain sources
		trustedSources := []string{"OpenAI", "Anthropic", "Google", "DeepMind", "MIT", "Stanford"}
		for _, trusted := range trustedSources {
			if strings.Contains(items[i].Source, trusted) {
				score += 2.0
				break
			}
		}

		items[i].Score = score
	}

	return items
}

// removeDuplicates removes duplicate news items based on similar titles
func (a *Aggregator) removeDuplicates(items []RawNewsItem) []RawNewsItem {
	seen := make(map[string]bool)
	unique := make([]RawNewsItem, 0)

	for _, item := range items {
		// Create a normalized key from the title
		key := normalizeTitle(item.Title)
		if !seen[key] {
			seen[key] = true
			unique = append(unique, item)
		}
	}

	return unique
}

// normalizeTitle creates a normalized version of a title for duplicate detection
func normalizeTitle(title string) string {
	// Remove common variations
	title = strings.ToLower(title)
	title = strings.ReplaceAll(title, " - ", " ")
	title = strings.ReplaceAll(title, " – ", " ")
	title = strings.ReplaceAll(title, " — ", " ")
	title = strings.ReplaceAll(title, ":", "")
	title = strings.ReplaceAll(title, "'", "")
	title = strings.ReplaceAll(title, "\"", "")
	
	// Remove source suffixes
	suffixes := []string{
		" | techcrunch",
		" - the verge",
		" | ars technica",
		" - wired",
		" | venturebeat",
	}
	
	for _, suffix := range suffixes {
		title = strings.TrimSuffix(title, suffix)
	}

	return strings.TrimSpace(title)
}

// formatHeadline formats a headline in Drudge Report style
func formatHeadline(title string) string {
	// Check if it should be all caps (major news)
	upperKeywords := []string{"BREAKING", "EXCLUSIVE", "URGENT"}
	for _, keyword := range upperKeywords {
		if strings.Contains(strings.ToUpper(title), keyword) {
			return strings.ToUpper(title)
		}
	}

	// Check for major companies/topics that warrant caps
	majorTopics := []string{"GPT-5", "GPT5", "CHATGPT", "OPENAI", "GOOGLE", "MICROSOFT", "META", "APPLE"}
	titleUpper := strings.ToUpper(title)
	for _, topic := range majorTopics {
		if strings.Contains(titleUpper, topic) && len(title) < 60 {
			return strings.ToUpper(title)
		}
	}

	// Otherwise, use title case
	return title
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
} 