package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"
)

var (
	GeminiAPIKey string
)

type ComicMetadata struct {
	Title string `json:"title"`
	Date  string `json:"date"`
	Issue string `json:"issue"`
}

// loadEnv reads a simple .env file and sets environment variables
func loadEnv() {
	file, err := os.Open(".env")
	if err != nil {
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "#") || strings.TrimSpace(line) == "" {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			os.Setenv(strings.TrimSpace(parts[0]), strings.TrimSpace(parts[1]))
		}
	}
}

func main() {
	loadEnv()
	GeminiAPIKey = os.Getenv("GEMINI_API_KEY")

	fmt.Println("🚀 Chronos Daily Toon Generator Starting (Gemini + Pollinations)...")

	if GeminiAPIKey == "" {
		fmt.Println("⚠️  GEMINI_API_KEY is missing. Please set it in .env file.")
		os.Exit(1)
	}

	// 1. Today's Context (Can be replaced with real news fetching)
	issue := "A major breakthrough in renewable energy storage using sustainable salt-based batteries."
	fmt.Printf("🔍 Today's Issue: %s\n", issue)

	// 2. Generate Storyboard with Gemini
	fmt.Println("🧠 Asking Gemini to create a 4-panel storyboard...")
	storyboard, title := getStoryboardFromGemini(issue)

	// 3. Generate Images with Pollinations.ai (No key needed)
	fmt.Println("🎨 Drawing 4-panel artwork via Pollinations.ai...")
	for i, panelDesc := range storyboard {
		imagePath := filepath.Join("assets", "comics", "today", fmt.Sprintf("%d.jpg", i+1))
		generateAndSaveImageFree(panelDesc, imagePath)
	}

	// 4. Save Metadata
	metadata := ComicMetadata{
		Title: title,
		Date:  time.Now().Format("2006-01-02"),
		Issue: issue,
	}
	saveMetadata(metadata)

	fmt.Println("✅ Daily Toon successfully generated (Gemini + Pollinations)!")
}

func getStoryboardFromGemini(issue string) ([]string, string) {
	prompt := fmt.Sprintf(`Create a 4-panel comic strip storyboard about this issue: "%s".
Return exactly 5 lines:
Line 1: A short artistic title for the comic.
Line 2-5: A detailed English description for each of the 4 panels (for an AI image generator). 
Focus on visual descriptions. Minimal text.`, issue)

	payload := map[string]interface{}{
		"contents": []interface{}{
			map[string]interface{}{
				"parts": []interface{}{
					map[string]interface{}{"text": prompt},
				},
			},
		},
	}

	jsonData, _ := json.Marshal(payload)
	url := "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GeminiAPIKey

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		logFatal("Gemini API Request failed", err)
	}
	defer resp.Body.Close()

	var result struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		logFatal("Failed to decode Gemini response", err)
	}

	if len(result.Candidates) == 0 {
		return []string{"Scene 1", "Scene 2", "Scene 3", "Scene 4"}, "Chronos Today"
	}

	fullText := result.Candidates[0].Content.Parts[0].Text
	lines := strings.Split(strings.TrimSpace(fullText), "\n")

	validLines := []string{}
	for _, l := range lines {
		if strings.TrimSpace(l) != "" {
			validLines = append(validLines, strings.TrimSpace(l))
		}
	}

	if len(validLines) < 5 {
		return []string{"P1", "P2", "P3", "P4"}, "Story of Today"
	}

	return validLines[1:5], validLines[0]
}

func generateAndSaveImageFree(desc string, path string) {
	fmt.Printf("   -> Fetching panel: %s\n", desc)

	// Use image.pollinations.ai for direct image link
	seed := time.Now().UnixNano()
	encodedPrompt := url.PathEscape("comic book style, vibrant colors, clean lines: " + desc)
	apiURL := fmt.Sprintf("https://image.pollinations.ai/prompt/%s?width=1024&height=1024&seed=%d&nologo=true", encodedPrompt, seed)

	err := downloadFile(apiURL, path)
	if err != nil {
		fmt.Printf("   ❌ Failed to save image: %v\n", err)
	}
}

func saveMetadata(m ComicMetadata) {
	data, _ := json.MarshalIndent(m, "", "  ")
	os.WriteFile(filepath.Join("assets", "comics", "today", "metadata.json"), data, 0644)
}

func downloadFile(url, filepath string) error {
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return fmt.Errorf("bad status: %s", resp.Status)
	}

	// Verify Content-Type is actually an image
	contentType := resp.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, "image/") {
		return fmt.Errorf("invalid content type: %s (expected image/*)", contentType)
	}

	out, err := os.Create(filepath)
	if err != nil {
		return err
	}
	defer out.Close()
	_, err = io.Copy(out, resp.Body)
	return err
}

func logFatal(msg string, err error) {
	fmt.Printf("🛑 %s: %v\n", msg, err)
	os.Exit(1)
}
