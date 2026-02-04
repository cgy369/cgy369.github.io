package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

// Configuration - User should fill these or set Env Vars
var (
	GeminiAPIKey = os.Getenv("GEMINI_API_KEY")
	OpenAIAPIKey = os.Getenv("OPENAI_API_KEY") // For DALL-E 3
)

type ComicMetadata struct {
	Title string `json:"title"`
	Date  string `json:"date"`
	Issue string `json:"issue"`
}

func main() {
	fmt.Println("🚀 Chronos Daily Toon Generator Starting...")

	if GeminiAPIKey == "" {
		fmt.Println("⚠️  GEMINI_API_KEY is missing. Mocking data for now.")
	}

	// 1. Fetch Today's Issue (Mocking for now, could use a News API)
	issue := "The discovery of a potential Earth-like planet in a nearby star system."
	fmt.Printf("🔍 Today's Issue: %s\n", issue)

	// 2. Generate Storyboard with Gemini
	fmt.Println("🧠 Generating storyboard with AI...")
	storyboard := generateStoryboard(issue)

	// 3. Generate Images (DALL-E or Stable Diffusion)
	fmt.Println("🎨 Generating 4-panel artwork...")
	for i, panelDesc := range storyboard {
		imagePath := filepath.Join("assets", "comics", "today", fmt.Sprintf("%d.jpg", i+1))
		generateAndSaveImage(panelDesc, imagePath)
	}

	// 4. Save Metadata
	metadata := ComicMetadata{
		Title: "The New Frontier",
		Date:  time.Now().Format("2006-01-02"),
		Issue: issue,
	}
	saveMetadata(metadata)

	fmt.Println("✅ Daily Toon successfully generated and saved to assets/comics/today/")
}

func generateStoryboard(issue string) []string {
	// If API key exists, call Gemini. Otherwise, return mock descriptions.
	if GeminiAPIKey == "" {
		return []string{
			"An astronomer looking through a massive telescope, eyes wide with wonder.",
			"A digital screen showing a green-blue planet far away among the stars.",
			"A news anchor excitedly pointing at a star map on a large background screen.",
			"A child lying on the grass at night, looking up at the stars with a smile.",
		}
	}
	// TODO: Actual Gemini API Call logic here
	return []string{"Panel 1", "Panel 2", "Panel 3", "Panel 4"}
}

func generateAndSaveImage(prompt string, path string) {
	fmt.Printf("   -> Generating panel for: %s\n", prompt)
	if OpenAIAPIKey == "" {
		// Mock: Copy a placeholder if No API key
		fmt.Println("   [MOCK] Image generation skipped (No API Key).")
		return
	}

	// OpenAI DALL-E 3 Implementation Example:
	/*
		url := "https://api.openai.com/v1/images/generations"
		payload := map[string]interface{}{
			"model":  "dall-e-3",
			"prompt": "Comic art style, vibrant colors: " + prompt,
			"n":      1,
			"size":   "1024x1024",
		}
		// ... call API, get URL, download and save to 'path'
	*/
}

func saveMetadata(m ComicMetadata) {
	data, _ := json.MarshalIndent(m, "", "  ")
	os.WriteFile(filepath.Join("assets", "comics", "today", "metadata.json"), data, 0644)
}

// Helper to download files
func downloadFile(url, filepath string) error {
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	out, err := os.Create(filepath)
	if err != nil {
		return err
	}
	defer out.Close()
	_, err = io.Copy(out, resp.Body)
	return err
}
