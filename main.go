package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"strings"
	"sync"
	"time"

	"birth_web/utils"
)

type DiscoveryRequest struct {
	BirthDate string `json:"birth_date"` // YYYY-MM-DD
}

type Event struct {
	Year int    `json:"year"`
	Text string `json:"text"`
}

type WikipediaResponse struct {
	Parse struct {
		Title    string `json:"title"`
		Pageid   int    `json:"pageid"`
		Wikitext struct {
			Asterisk string `json:"*"`
		} `json:"wikitext"`
	} `json:"parse"`
}

type DiscoveryResponse struct {
	Zodiac       utils.ZodiacResult           `json:"zodiac"`
	StarSign     string                       `json:"star_sign"`
	BirthElement utils.BirthElement           `json:"birth_element"`
	AIPrompt     string                       `json:"ai_prompt"`
	Events       []Event                      `json:"events"`
	Population   map[string]utils.BirthDetail `json:"population"`
	Image        string                       `json:"image"`
}

func main() {
	// 1. 데이터 디렉토리 생성 (배포 환경에서 에러 방지)
	os.MkdirAll("data/events/ko", 0755)
	os.MkdirAll("data/events/en", 0755)

	// 2. 정적 파일 서버 설정
	fs := http.FileServer(http.Dir("./"))
	http.Handle("/", fs)

	// 3. API 핸들러
	http.HandleFunc("/api/discovery", handleDiscovery)
	http.HandleFunc("/api/records/get", handleGetRecords)
	http.HandleFunc("/api/records/increment", handleIncrementRecord)

	// 4. [중요] 애드센스 ads.txt 서빙 핸들러 추가
	http.HandleFunc("/ads.txt", func(w http.ResponseWriter, r *http.Request) {
		// 프로젝트 루트에 ads.txt 파일을 만들어 두어야 합니다.
		http.ServeFile(w, r, "ads.txt")
	})

	// 5. [중요] 포트 설정 변경 (Render.com 호환)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // 로컬 테스트용 기본값
	}

	fmt.Printf("Server starting at port %s\n", port)
	// ":8080" 형태가 되도록 앞에 콜론을 붙여줍니다.
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func handleDiscovery(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req DiscoveryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	date, err := time.Parse("2006-01-02", req.BirthDate)
	if err != nil {
		http.Error(w, "Invalid date format. Use YYYY-MM-DD", http.StatusBadRequest)
		return
	}

	month := int(date.Month())
	day := date.Day()
	year := date.Year()

	zodiac := utils.CalculateZodiac(year)
	starSign := utils.GetZodiacSign(month, day)
	birthElement := utils.GetBirthElements(month, day)
	aiPrompt := utils.GenerateAIPrompt(zodiac.Animal, zodiac.Color, starSign, birthElement.FlowerEN, birthElement.Meaning, birthElement.Stone)

	// Fetch historical events (KO & EN with caching)
	eventsKO := fetchWikipediaEvents(year, month, day, "ko")
	eventsEN := fetchWikipediaEvents(year, month, day, "en")

	// Combine events
	allEvents := append(eventsKO, eventsEN...)

	// Estimate birth population
	population := utils.EstimateDailyBirths(year)

	// Placeholder image
	image := "https://dummyimage.com/600x400/38bdf8/ffffff&text=" + zodiac.ZodiacName

	resp := DiscoveryResponse{
		Zodiac:       zodiac,
		StarSign:     starSign,
		BirthElement: birthElement,
		AIPrompt:     aiPrompt,
		Events:       allEvents,
		Population:   population,
		Image:        image,
	}

	// 디버그 로그 추가
	log.Printf("API Response - %d events found for date %s", len(allEvents), req.BirthDate)
	if len(allEvents) > 0 {
		log.Printf("First Event Sample: %+v", allEvents[0])
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func fetchWikipediaEvents(year, month, day int, lang string) []Event {
	cacheFile := fmt.Sprintf("data/events/%s/%02d_%02d.json", lang, month, day)

	var wikitext string
	if _, err := os.Stat(cacheFile); err == nil {
		data, err := os.ReadFile(cacheFile)
		if err == nil {
			var cached WikiData
			if json.Unmarshal(data, &cached) == nil {
				wikitext = cached.Wikitext
			}
		}
	}

	if wikitext == "" {
		var err error
		if lang == "ko" {
			wikitext, err = callWikipediaAPIKO(month, day)
		} else {
			wikitext, err = callWikipediaAPIEN(month, day)
		}

		if err != nil {
			return []Event{{Year: year, Text: fmt.Sprintf("[%s Error] %s", strings.ToUpper(lang), err.Error())}}
		}
		saveCache(cacheFile, wikitext)
	}

	return parseWikitext(wikitext, year, lang)
}

type WikiData struct {
	Wikitext string `json:"wikitext"`
}

func callWikipediaAPIKO(month, day int) (string, error) {
	pageTitle := fmt.Sprintf("%d월_%d일", month, day)
	escapedTitle := url.QueryEscape(pageTitle)
	apiURL := fmt.Sprintf("https://ko.wikipedia.org/w/api.php?action=parse&page=%s&prop=wikitext&format=json", escapedTitle)
	return callWiki(apiURL)
}

func callWikipediaAPIEN(month, day int) (string, error) {
	monthName := utils.GetMonthName(month)
	pageTitle := fmt.Sprintf("%s_%d", monthName, day)
	escapedTitle := url.QueryEscape(pageTitle)
	apiURL := fmt.Sprintf("https://en.wikipedia.org/w/api.php?action=parse&page=%s&prop=wikitext&format=json", escapedTitle)
	return callWiki(apiURL)
}

func callWiki(apiURL string) (string, error) {
	client := &http.Client{Timeout: 10 * time.Second}
	req, _ := http.NewRequest("GET", apiURL, nil)
	req.Header.Set("User-Agent", "BirthDiscoveryApp/1.0")

	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("연결 실패")
	}
	defer resp.Body.Close()

	var wiki WikipediaResponse
	if err := json.NewDecoder(resp.Body).Decode(&wiki); err != nil {
		return "", fmt.Errorf("데이터 파싱 실패")
	}
	return wiki.Parse.Wikitext.Asterisk, nil
}

func saveCache(path, text string) {
	data, _ := json.Marshal(WikiData{Wikitext: text})
	os.WriteFile(path, data, 0644)
}

func parseWikitext(text string, targetYear int, lang string) []Event {
	var result []Event
	sections := map[string][]string{
		"ko": {"사건", "탄생", "사망"},
		"en": {"Events", "Births", "Deaths"},
	}

	yearPattern := ""
	if lang == "ko" {
		yearPattern = fmt.Sprintf(`(?:\[\[)?%d년(?:\]\])?`, targetYear)
	} else {
		// English often uses [[1980]] or just 1980
		yearPattern = fmt.Sprintf(`(?:\[\[)?%d(?:\]\])?`, targetYear)
	}
	re := regexp.MustCompile(yearPattern)

	lines := strings.Split(text, "\n")
	currentSection := ""

	for _, line := range lines {
		trimmed := strings.TrimSpace(line)

		for _, s := range sections[lang] {
			if strings.Contains(strings.ToLower(trimmed), strings.ToLower("== "+s+" ==")) {
				currentSection = s
				break
			}
		}

		if currentSection == "" {
			continue
		}

		if re.MatchString(trimmed) {
			cleanText := cleanWikitext(trimmed)
			if cleanText != "" {
				prefix := ""
				switch strings.ToLower(currentSection) {
				case "사건", "events":
					prefix = "[사건]"
				case "탄생", "births":
					prefix = "[탄생]"
				case "사망", "deaths":
					prefix = "[사망]"
				}
				if lang == "en" {
					prefix = "[해외" + prefix + "]"
				}
				result = append(result, Event{
					Year: targetYear,
					Text: fmt.Sprintf("%s %s", prefix, cleanText),
				})
			}
		}
	}

	return result
}

func cleanWikitext(line string) string {
	line = strings.TrimPrefix(line, "*")
	line = strings.TrimSpace(line)

	reLinkTitle := regexp.MustCompile(`\[\[[^|\]]+\|([^\]]+)\]\]`)
	line = reLinkTitle.ReplaceAllString(line, "$1")

	reLink := regexp.MustCompile(`\[\[([^\]]+)\]\]`)
	line = reLink.ReplaceAllString(line, "$1")

	reTemplate := regexp.MustCompile(`\{\{[^}]+\}\}`)
	line = reTemplate.ReplaceAllString(line, "")

	return strings.TrimSpace(line)
}

// --- Tic-Tac-Toe Global Records ---

type GameRecords struct {
	Wins     map[string]int `json:"wins"`
	Failures map[string]int `json:"failures"`
	// 하위 호환성용
	OldRecords map[string]int `json:"records,omitempty"`
}

var (
	recordsFile = "data/ttt_records.json"
	recordsMu   sync.Mutex
)

func handleGetRecords(w http.ResponseWriter, r *http.Request) {
	recordsMu.Lock()
	defer recordsMu.Unlock()

	data, err := os.ReadFile(recordsFile)
	if err != nil {
		initial := GameRecords{
			Wins:     map[string]int{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0},
			Failures: map[string]int{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(initial)
		return
	}

	var records GameRecords
	json.Unmarshal(data, &records)

	// 데이터 마이그레이션: OldRecords(records 필드)가 있으면 Wins로 이동
	if len(records.OldRecords) > 0 {
		if records.Wins == nil {
			records.Wins = make(map[string]int)
		}
		for k, v := range records.OldRecords {
			records.Wins[k] += v
		}
		records.OldRecords = nil // 마이그레이션 후 삭제

		// 마그레이션된 데이터 저장
		if records.Failures == nil {
			records.Failures = make(map[string]int)
		}
		newData, _ := json.Marshal(records)
		os.WriteFile(recordsFile, newData, 0644)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(records)
}

func handleIncrementRecord(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Level string `json:"level"`
		Type  string `json:"type"` // "win" or "fail"
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	recordsMu.Lock()
	defer recordsMu.Unlock()

	records := GameRecords{
		Wins:     make(map[string]int),
		Failures: make(map[string]int),
	}
	data, err := os.ReadFile(recordsFile)
	if err == nil {
		json.Unmarshal(data, &records)
	}

	// 맵 초기화 확인
	if records.Wins == nil {
		records.Wins = make(map[string]int)
	}
	if records.Failures == nil {
		records.Failures = make(map[string]int)
	}

	// 증가 로직
	if req.Type == "fail" {
		records.Failures[req.Level]++
	} else {
		records.Wins[req.Level]++
	}

	// Save
	newData, _ := json.Marshal(records)
	os.WriteFile(recordsFile, newData, 0644)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(records)
}
