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

// loadEnv tries to find .env in current or parent directories
func loadEnv() {
	curr, _ := os.Getwd()
	for {
		path := filepath.Join(curr, ".env")
		file, err := os.Open(path)
		if err == nil {
			fmt.Printf("📂 Found .env at: %s\n", path)
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
			return
		}
		parent := filepath.Dir(curr)
		if parent == curr {
			break
		}
		curr = parent
	}
}

func main() {
	loadEnv()
	GeminiAPIKey = os.Getenv("GEMINI_API_KEY")

	fmt.Println("🚀 Chronos Daily Toon Generator (Debug Mode)...")

	if GeminiAPIKey == "" {
		fmt.Println("🛑 ERROR: GEMINI_API_KEY not found in .env or environment variables.")
		fmt.Println("   Make sure you have a .env file with GEMINI_API_KEY=your_key")
		os.Exit(1)
	}

	issue := "Recent advancements in fusion energy reaching a new record-breaking temperature."
	fmt.Printf("🔍 Target Issue: %s\n", issue)

	storyboard, title := getStoryboardFromGemini(issue)

	fmt.Println("🎨 Generating 4-panel artwork...")
	for i, panelDesc := range storyboard {
		imagePath := filepath.Join("assets", "comics", "today", fmt.Sprintf("%d.jpg", i+1))
		generateAndSaveImageFree(panelDesc, imagePath)
	}

	metadata := ComicMetadata{
		Title: title,
		Date:  time.Now().Format("2006-01-02"),
		Issue: issue,
	}
	saveMetadata(metadata)
	fmt.Println("✅ Generation attempt finished.")
}

func getStoryboardFromGemini(issue string) ([]string, string) {
	prompt := fmt.Sprintf(`오늘의 이슈: "%s"
이 이슈를 주제로 짧은 4컷 만화 시나리오를 작성해주세요.
반드시 아래 형식을 지키고 다른 말은 하지 마세요:
Line 1: 만화 제목
Line 2: 1번 컷 시각적 묘사 (영어)
Line 3: 2번 컷 시각적 묘사 (영어)
Line 4: 3번 컷 시각적 묘사 (영어)
Line 5: 4번 컷 시각적 묘사 (영어)`, issue)

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
	apiURL := "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=" + GeminiAPIKey

	resp, err := http.Post(apiURL, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		logFatal("Network Error", err)
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != 200 {
		fmt.Printf("🛑 Gemini API Error (Status %d): %s\n", resp.StatusCode, string(bodyBytes))
		return fallbackStoryboard(), "Daily Issue"
	}

	var result struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}

	if err := json.Unmarshal(bodyBytes, &result); err != nil {
		fmt.Printf("🛑 Failed to parse Gemini JSON: %v\n", err)
		return fallbackStoryboard(), "Daily Issue"
	}

	if len(result.Candidates) == 0 || len(result.Candidates[0].Content.Parts) == 0 {
		fmt.Println("⚠️  Gemini returned no candidates.")
		return fallbackStoryboard(), "Daily Issue"
	}

	text := result.Candidates[0].Content.Parts[0].Text
	text = strings.ReplaceAll(text, "```", "") // Remove MD code blocks
	lines := strings.Split(strings.TrimSpace(text), "\n")

	validLines := []string{}
	for _, l := range lines {
		trimmed := strings.TrimSpace(l)
		if trimmed != "" {
			validLines = append(validLines, trimmed)
		}
	}

	if len(validLines) < 5 {
		fmt.Println("⚠️  Gemini response format invalid. Using fallback.")
		return fallbackStoryboard(), "Daily Issue"
	}

	return validLines[1:5], validLines[0]
}

func fallbackStoryboard() []string {
	return []string{
		"A scientist cheerily looking at a screen.",
		"Close-up of a glowing reactor core.",
		"A city powered by bright, clean energy.",
		"Humanity stepping into a greener future."}
}

func generateAndSaveImageFree(desc string, path string) {
	fmt.Printf("   -> Downloading: %s\n", desc)

	// Use image.pollinations.ai direct endpoint
	seed := time.Now().UnixNano() % 1000000
	encodedPrompt := url.PathEscape("digital comic art style, clean lines, vibrant colors: " + desc)
	apiURL := fmt.Sprintf("https://image.pollinations.ai/prompt/%s?width=1024&height=1024&seed=%d&nologo=true", encodedPrompt, seed)

	err := downloadFile(apiURL, path)
	if err != nil {
		fmt.Printf("   ❌ Error: %v\n", err)
	}
}

func downloadFile(targetUrl, filepath string) error {
	client := &http.Client{Timeout: 60 * time.Second}
	req, err := http.NewRequest("GET", targetUrl, nil)
	if err != nil {
		return err
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "image/webp,image/apng,image/*,*/*;q=0.8")

	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return fmt.Errorf("HTTP %s", resp.Status)
	}

	contentType := resp.Header.Get("Content-Type")
	// Pollinations sometimes says image/jpeg but actually returns octet-stream
	if !strings.HasPrefix(contentType, "image/") && !strings.Contains(contentType, "octet-stream") {
		// Log the first 100 chars of body if it's text/html to see the error
		peek, _ := io.ReadAll(io.LimitReader(resp.Body, 200))
		return fmt.Errorf("Not an image (%s). Head: %s", contentType, string(peek))
	}

	out, err := os.Create(filepath)
	if err != nil {
		return err
	}
	defer out.Close()
	_, err = io.Copy(out, resp.Body)
	return err
}

func saveMetadata(m ComicMetadata) {
	data, _ := json.MarshalIndent(m, "", "  ")
	os.WriteFile(filepath.Join("assets", "comics", "today", "metadata.json"), data, 0644)
}

func logFatal(msg string, err error) {
	fmt.Printf("🛑 %s: %v\n", msg, err)
	os.Exit(1)
}
