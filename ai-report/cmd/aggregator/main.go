package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/ai-report/aggregator/internal/aggregator"
	"github.com/ai-report/aggregator/internal/sources"
)

func main() {
	log.Println("Starting AI Report news aggregation...")

	// Initialize aggregator
	agg := aggregator.New()

	// Configure sources
	configureSources(agg)

	// Fetch news from all sources
	news, err := agg.FetchAll()
	if err != nil {
		log.Fatalf("Failed to fetch news: %v", err)
	}

	// Process and rank news items
	processedNews := agg.ProcessNews(news)

	// Generate news data structure
	newsData := generateNewsData(processedNews)

	// Save current news data
	if err := saveNewsData(newsData); err != nil {
		log.Fatalf("Failed to save news data: %v", err)
	}

	// Archive previous version
	if err := archiveNewsData(); err != nil {
		log.Printf("Warning: Failed to archive news data: %v", err)
	}

	log.Println("News aggregation completed successfully!")
}

func configureSources(agg *aggregator.Aggregator) {
	// RSS Feeds
	rssFeeds := []sources.RSSFeed{
		{Name: "MIT Technology Review AI", URL: "https://www.technologyreview.com/feed/", Category: "AI"},
		{Name: "The Verge AI", URL: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml"},
		{Name: "VentureBeat AI", URL: "https://feeds.feedburner.com/venturebeat/SZYF"},
		{Name: "AI News", URL: "https://www.artificialintelligence-news.com/feed/"},
		{Name: "OpenAI Blog", URL: "https://openai.com/blog/rss/"},
		{Name: "Google AI Blog", URL: "https://blog.google/technology/ai/rss/"},
		{Name: "DeepMind Blog", URL: "https://deepmind.com/blog/feed/basic/"},
		{Name: "Anthropic News", URL: "https://www.anthropic.com/rss.xml"},
		{Name: "Hugging Face Blog", URL: "https://huggingface.co/blog/feed.xml"},
	}

	for _, feed := range rssFeeds {
		agg.AddSource(sources.NewRSSSource(feed))
	}

	// Hacker News
	agg.AddSource(sources.NewHackerNewsSource([]string{
		"artificial intelligence",
		"machine learning",
		"GPT",
		"LLM",
		"neural network",
		"deep learning",
		"AI safety",
		"AGI",
	}))

	// Reddit sources
	agg.AddSource(sources.NewRedditSource([]string{
		"MachineLearning",
		"artificial",
		"singularity",
		"OpenAI",
		"LocalLLaMA",
	}))

	// Twitter/X accounts (using nitter instances for RSS)
	twitterAccounts := []sources.TwitterAccount{
		{Handle: "OpenAI", URL: "https://nitter.net/OpenAI/rss"},
		{Handle: "AnthropicAI", URL: "https://nitter.net/AnthropicAI/rss"},
		{Handle: "GoogleAI", URL: "https://nitter.net/GoogleAI/rss"},
		{Handle: "DeepMind", URL: "https://nitter.net/DeepMind/rss"},
		{Handle: "elonmusk", URL: "https://nitter.net/elonmusk/rss"},
		{Handle: "sama", URL: "https://nitter.net/sama/rss"},
		{Handle: "GaryMarcus", URL: "https://nitter.net/GaryMarcus/rss"},
		{Handle: "ylecun", URL: "https://nitter.net/ylecun/rss"},
	}

	for _, account := range twitterAccounts {
		agg.AddSource(sources.NewTwitterSource(account))
	}

	// Tech news sites
	techSites := []sources.WebScraper{
		{Name: "TechCrunch AI", URL: "https://techcrunch.com/category/artificial-intelligence/"},
		{Name: "Ars Technica AI", URL: "https://arstechnica.com/ai/"},
		{Name: "Wired AI", URL: "https://www.wired.com/tag/artificial-intelligence/"},
	}

	for _, site := range techSites {
		agg.AddSource(sources.NewWebScraperSource(site))
	}
}

func generateNewsData(news *aggregator.ProcessedNews) *NewsData {
	now := time.Now()
	
	return &NewsData{
		MainHeadline:  news.TopStory,
		TopStories:    news.TopStories[:min(3, len(news.TopStories))],
		LeftColumn:    news.LeftColumn[:min(8, len(news.LeftColumn))],
		CenterColumn:  news.CenterColumn[:min(8, len(news.CenterColumn))],
		RightColumn:   news.RightColumn[:min(8, len(news.RightColumn))],
		LastUpdated:   now.Format(time.RFC3339),
	}
}

func saveNewsData(data *NewsData) error {
	// Marshal to JSON
	jsonData, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal news data: %w", err)
	}

	// Save to public directory
	publicDir := "public"
	if err := os.MkdirAll(publicDir, 0755); err != nil {
		return fmt.Errorf("failed to create public directory: %w", err)
	}

	newsFile := filepath.Join(publicDir, "news-data.json")
	if err := os.WriteFile(newsFile, jsonData, 0644); err != nil {
		return fmt.Errorf("failed to write news data: %w", err)
	}

	return nil
}

func archiveNewsData() error {
	publicDir := "public"
	archiveDir := filepath.Join(publicDir, "archive")
	
	// Create archive directory
	if err := os.MkdirAll(archiveDir, 0755); err != nil {
		return fmt.Errorf("failed to create archive directory: %w", err)
	}

	// Check if current news-data.json exists
	currentFile := filepath.Join(publicDir, "news-data.json")
	if _, err := os.Stat(currentFile); os.IsNotExist(err) {
		return nil // Nothing to archive
	}

	// Read current file
	data, err := os.ReadFile(currentFile)
	if err != nil {
		return fmt.Errorf("failed to read current news data: %w", err)
	}

	// Generate archive filename with timestamp
	timestamp := time.Now().Format("2006-01-02-15-04-05")
	archiveFile := filepath.Join(archiveDir, fmt.Sprintf("news-data-%s.json", timestamp))

	// Write to archive
	if err := os.WriteFile(archiveFile, data, 0644); err != nil {
		return fmt.Errorf("failed to write archive: %w", err)
	}

	// Clean up old archives (keep last 7 days)
	cleanupOldArchives(archiveDir)

	return nil
}

func cleanupOldArchives(archiveDir string) {
	cutoff := time.Now().AddDate(0, 0, -7)

	files, err := os.ReadDir(archiveDir)
	if err != nil {
		log.Printf("Failed to read archive directory: %v", err)
		return
	}

	for _, file := range files {
		if file.IsDir() {
			continue
		}

		info, err := file.Info()
		if err != nil {
			continue
		}

		if info.ModTime().Before(cutoff) {
			os.Remove(filepath.Join(archiveDir, file.Name()))
		}
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// NewsData represents the structure of news-data.json
type NewsData struct {
	MainHeadline aggregator.NewsItem   `json:"mainHeadline"`
	TopStories   []aggregator.NewsItem `json:"topStories"`
	LeftColumn   []aggregator.NewsItem `json:"leftColumn"`
	CenterColumn []aggregator.NewsItem `json:"centerColumn"`
	RightColumn  []aggregator.NewsItem `json:"rightColumn"`
	LastUpdated  string               `json:"lastUpdated"`
} 