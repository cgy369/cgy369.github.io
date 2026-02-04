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
	prompt := fmt.Sprintf(`오늘의 이슈인 "%s"를 주제로 한 4컷 만화 스토리보드를 만들어주세요.
다음 형식을 엄격히 지켜서 딱 5줄의 텍스트만 출력하세요 (마크다운 기호 금지):
1행: 만화의 제목 (예술적이고 짧게)
2~5행: 각 컷에 대한 구체적인 시각적 묘사 (영어 프롬프트 형태, AI 이미지 생성기로 그릴 수 있도록 스타일, 조명, 구도를 포함하여 상세히 기술)`, issue)

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

	if len(result.Candidates) == 0 || len(result.Candidates[0].Content.Parts) == 0 {
		fmt.Println("⚠️ Gemini returned empty storyboard. Using fallback.")
		return []string{"Scene 1", "Scene 2", "Scene 3", "Scene 4"}, "Chronos Today"
	}

	fullText := result.Candidates[0].Content.Parts[0].Text
	// Remove markdown code blocks if AI added them
	fullText = strings.ReplaceAll(fullText, "```", "")

	lines := strings.Split(strings.TrimSpace(fullText), "\n")

	validLines := []string{}
	for _, l := range lines {
		trimmed := strings.TrimSpace(l)
		if trimmed != "" {
			validLines = append(validLines, trimmed)
		}
	}

	if len(validLines) < 5 {
		fmt.Printf("⚠️  Gemini output too short (%d lines). Using partials.\n", len(validLines))
		return []string{"P1", "P2", "P3", "P4"}, "Story of Today"
	}

	return validLines[1:5], validLines[0]
}

func generateAndSaveImageFree(desc string, path string) {
	fmt.Printf("   -> Fetching panel: %s\n", desc)

	// Reverting to pollinators.ai/p with robust headers and random seed
	seed := time.Now().UnixNano() % 1000000
	encodedPrompt := url.PathEscape("digital art, vibrant, highly detailed: " + desc)
	apiURL := fmt.Sprintf("https://pollinations.ai/p/%s?width=1024&height=1024&seed=%d&nologo=true", encodedPrompt, seed)

	err := downloadFile(apiURL, path)
	if err != nil {
		fmt.Printf("   ❌ Failed to save image: %v\n", err)
	}
}

func saveMetadata(m ComicMetadata) {
	data, _ := json.MarshalIndent(m, "", "  ")
	os.WriteFile(filepath.Join("assets", "comics", "today", "metadata.json"), data, 0644)
}

func downloadFile(targetUrl, filepath string) error {
	client := &http.Client{Timeout: 30 * time.Second}
	req, err := http.NewRequest("GET", targetUrl, nil)
	if err != nil {
		return err
	}

	// Add Browser-like headers to avoid being blocked
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8")

	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return fmt.Errorf("bad status: %s (URL: %s)", resp.Status, targetUrl)
	}

	// Verify Content-Type
	contentType := resp.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, "image/") && !strings.Contains(contentType, "application/octet-stream") {
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
