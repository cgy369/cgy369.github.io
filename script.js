const HISTORICAL_BIRTHS = {
    1950: { "Global": 92000000, "KR": 630000, "US": 3600000, "CN": 20000000, "IN": 15000000, "JP": 2300000 },
    1960: { "Global": 112000000, "KR": 1000000, "US": 4200000, "CN": 25000000, "IN": 18000000, "JP": 1600000 },
    1970: { "Global": 120000000, "KR": 1000000, "US": 3700000, "CN": 27000000, "IN": 22000000, "JP": 1900000 },
    1980: { "Global": 125000000, "KR": 860000, "US": 3600000, "CN": 18000000, "IN": 25000000, "JP": 1500000 },
    1990: { "Global": 139000000, "KR": 650000, "US": 4100000, "CN": 24000000, "IN": 28000000, "JP": 1200000 },
    2000: { "Global": 131000000, "KR": 630000, "US": 4000000, "CN": 17000000, "IN": 27000000, "JP": 1100000 },
    2010: { "Global": 139000000, "KR": 470000, "US": 4000000, "CN": 16000000, "IN": 27000000, "JP": 1000000 },
    2020: { "Global": 134000000, "KR": 270000, "US": 3600000, "CN": 12000000, "IN": 24000000, "JP": 840000 }
};

// --- Tab System ---
function switchTab(tabId) {
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(`${tabId}Section`).classList.add('active');
    document.querySelector(`.tab-btn[onclick="switchTab('${tabId}')"]`).classList.add('active');

    // UI Feedback for main title
    const titles = {
        'daily': { main: '오늘의 즐거움', sub: '매일 새로운 상식과 퀴즈로 두뇌를 깨워보세요' },
        'discovery': { main: '생일의 발견', sub: '당신이 태어난 날의 비밀을 확인해보세요' },
        'games': { main: '미니게임 창고', sub: '기록을 갱신하고 두뇌 게임을 즐겨보세요' }
    };
    if (titles[tabId]) {
        document.getElementById('mainTitle').innerText = titles[tabId].main;
        document.getElementById('mainSubtitle').innerText = titles[tabId].sub;
    }
}

// --- Daily Fun APIs ---
async function fetchTrivia() {
    const content = document.getElementById('triviaContent');
    content.innerText = "문제를 내는 중...";
    try {
        const res = await fetch('https://opentdb.com/api.php?amount=1&type=multiple');
        const data = await res.json();
        if (data.results && data.results.length > 0) {
            const q = data.results[0];
            content.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 0.5rem;">[${q.category}]</div>
                <div>${q.question}</div>
                <div style="font-size: 0.8rem; color: var(--text-dim); margin-top: 1rem;">* 정답은 마우스를 올리면 보입니다.</div>
                <div class="answer-hint" title="${q.correct_answer}" style="cursor: help; color: transparent;">${q.correct_answer}</div>
            `;
        }
    } catch (e) { content.innerText = "퀴즈를 가져오지 못했습니다."; }
}

async function fetchFact() {
    const content = document.getElementById('factContent');
    content.innerText = "상식을 찾는 중...";
    try {
        const res = await fetch('https://uselessfacts.jsph.pl/random.json?language=en');
        const data = await res.json();
        content.innerText = data.text;
    } catch (e) { content.innerText = "상식을 가져오지 못했습니다."; }
}

async function fetchDailyHistory() {
    const content = document.getElementById('dailyHistoryContent');
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    try {
        const titleKO = `${month}월_${day}일`;
        const resKO = await fetch(`https://ko.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(titleKO)}&prop=wikitext&format=json&origin=*`);
        const dataKO = await resKO.json();
        if (dataKO.parse) {
            const events = parseWiki(dataKO.parse.wikitext['*'], 0, 'ko').slice(0, 3); // Get 3 random/top events
            content.innerHTML = events.map(e => `<div>• ${e.text.replace('[사건] ', '')}</div>`).join('');
        }
    } catch (e) { content.innerText = "역사 정보를 가져오지 못했습니다."; }
}

function revealFortune() {
    const fortunes = [
        "오늘의 당신은 매우 빛날 운명입니다! 새로운 도전을 시작해보세요.",
        "작은 인연이 큰 행복으로 다가오는 날입니다. 주변 사람에게 먼저 인사해보세요.",
        "생각지도 못한 곳에서 행운의 소식이 들려올 거예요. 차분히 기다려보세요.",
        "오늘은 휴식이 필요한 날입니다. 좋아하는 음악과 함께 여유를 즐기세요.",
        "긍정적인 생각만 하세요! 당신의 긍정적인 에너지가 행운을 불러옵니다.",
        "잊고 있던 무언가를 발견하게 될 날입니다. 책상 정리를 해보는 건 어떨까요?",
        "오늘은 직관이 뛰어난 날입니다. 당신의 선택을 믿으세요."
    ];
    document.getElementById('fortuneContent').innerText = fortunes[Math.floor(Math.random() * fortunes.length)];
}

function calculateLocalZodiac(year) {
    const gan = ["경", "신", "임", "계", "갑", "을", "병", "정", "무", "기"];
    const ji = ["신", "유", "술", "해", "자", "축", "인", "묘", "진", "사", "오", "미"];
    const elements = { "갑": "목", "을": "목", "병": "화", "정": "화", "무": "토", "기": "토", "경": "금", "신": "금", "임": "수", "계": "수" };
    const colors = { "목": "청", "화": "적", "토": "황", "금": "백", "수": "흑" };
    const animals = { "자": "쥐", "축": "소", "인": "호랑이", "묘": "토끼", "진": "용", "사": "뱀", "오": "말", "미": "양", "신": "원숭이", "유": "닭", "술": "개", "해": "돼지" };

    const gIdx = year % 10;
    const jIdx = year % 12;
    const h = gan[gIdx];
    const e = ji[jIdx];
    const element = elements[h];
    const color = colors[element];
    const animal = animals[e];

    return {
        zodiac_name: `${color}${animal} (${h}${e}년)`,
        color: color,
        animal: animal,
        element: element
    };
}

function getLocalStarSign(month, day) {
    if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return "양자리 (Aries)";
    if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return "황소자리 (Taurus)";
    if ((month == 5 && day >= 21) || (month == 6 && day <= 21)) return "쌍둥이자리 (Gemini)";
    if ((month == 6 && day >= 22) || (month == 7 && day <= 22)) return "게자리 (Cancer)";
    if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return "사자자리 (Leo)";
    if ((month == 8 && day >= 23) || (month == 9 && day <= 23)) return "처녀자리 (Virgo)";
    if ((month == 9 && day >= 24) || (month == 10 && day <= 22)) return "천칭자리 (Libra)";
    if ((month == 10 && day >= 23) || (month == 11 && day <= 22)) return "전갈자리 (Scorpio)";
    if ((month == 11 && day >= 23) || (month == 12 && day <= 24)) return "사수자리 (Sagittarius)";
    if ((month == 12 && day >= 25) || (month == 1 && day <= 19)) return "염소자리 (Capricorn)";
    if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) return "물병자리 (Aquarius)";
    return "물고기자리 (Pisces)";
}

function estimateLocalBirths(year) {
    let targetYear = Math.floor(year / 10) * 10;
    if (targetYear < 1950) targetYear = 1950;
    if (targetYear > 2020) targetYear = 2020;
    const annualData = HISTORICAL_BIRTHS[targetYear] || HISTORICAL_BIRTHS[1990];
    const result = {};
    for (const country in annualData) {
        const dailyTotal = Math.floor(annualData[country] / 365);
        const male = Math.floor(dailyTotal * 0.512);
        const female = dailyTotal - male;
        result[country] = { total: dailyTotal, male: male, female: female };
    }
    return result;
}

async function fetchLocalEvents(year, month, day) {
    const events = [];
    try {
        // Fetch Korean Wikipedia
        const titleKO = `${month}월_${day}일`;
        const resKO = await fetch(`https://ko.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(titleKO)}&prop=wikitext&format=json&origin=*`);
        const dataKO = await resKO.json();
        if (dataKO.parse) events.push(...parseWiki(dataKO.parse.wikitext['*'], year, 'ko'));

        // Fetch English Wikipedia
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const titleEN = `${monthNames[month - 1]}_${day}`;
        const resEN = await fetch(`https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(titleEN)}&prop=wikitext&format=json&origin=*`);
        const dataEN = await resEN.json();
        if (dataEN.parse) events.push(...parseWiki(dataEN.parse.wikitext['*'], year, 'en'));
    } catch (e) { console.error("Wiki Fetch failed", e); }
    return events;
}

function parseWiki(text, targetYear, lang) {
    const results = [];
    const lines = text.split('\n');
    let section = "";

    // If targetYear is 0, we match all years (for Daily History)
    const yearPattern = targetYear === 0
        ? (lang === 'ko' ? /[0-9]+년/ : /[0-9]+/)
        : (lang === 'ko' ? new RegExp(`\\[\\[${targetYear}년\\]\\]|${targetYear}년`) : new RegExp(`\\[\\[${targetYear}\\]\\]|${targetYear}`));

    for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed.includes('== 사건 ==') || trimmed.includes('== Events ==')) section = "사건";
        else if (trimmed.includes('== 탄생 ==') || trimmed.includes('== Births ==')) section = "탄생";
        else if (trimmed.includes('== 사망 ==') || trimmed.includes('== Deaths ==')) section = "사망";

        if (section && yearPattern.test(trimmed)) {
            let cleanText = trimmed.replace(/^\*/, '').trim();
            cleanText = cleanText.replace(/\[\[([^|\]]+\|)?([^\]]+)\]\]/g, '$2');
            cleanText = cleanText.replace(/\{\{[^}]+\}\}/g, '');
            if (cleanText) {
                const prefix = lang === 'en' ? `[해외 ${section}]` : `[${section}]`;
                results.push({ year: targetYear, text: `${prefix} ${cleanText}` });
            }
        }
    }
    return results;
}

async function discover() {
    const birthDateInput = document.getElementById('birthDate').value;
    if (!birthDateInput) {
        alert('생년월일을 선택해주세요.');
        return;
    }

    const date = new Date(birthDateInput);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const resultSection = document.getElementById('resultSection');
    const zodiacName = document.getElementById('zodiacName');
    const zodiacDetails = document.getElementById('zodiacDetails');
    const eventList = document.getElementById('eventList');
    const birthStone = document.getElementById('birthStone');
    const birthFlower = document.getElementById('birthFlower');
    const flowerMeaning = document.getElementById('flowerMeaning');
    const aiPromptText = document.getElementById('aiPromptText');
    const statsGrid = document.getElementById('statsGrid');

    try {
        let data;
        // Try Server Mode first
        try {
            const response = await fetch('/api/discovery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ birth_date: birthDateInput }),
            });
            if (response.ok) {
                data = await response.json();
            } else {
                throw new Error("Server not available");
            }
        } catch (serverErr) {
            console.warn("Switching to Local Mode:", serverErr.message);
            // Local Mode Fallback
            const zodiac = calculateLocalZodiac(year);
            const starSign = getLocalStarSign(month, day);
            const population = estimateLocalBirths(year);
            const events = await fetchLocalEvents(year, month, day);

            // For Flower/Stone, we'd ideally port all 365 flowers, 
            // but for brevity I'll use placeholders for missing ones or a subset
            const stones = ["가넷", "자수정", "아쿠아마린", "다이아몬드", "에메랄드", "진주", "루비", "페리도트", "사파이어", "오팔", "토파즈", "터키석"];
            data = {
                zodiac: zodiac,
                star_sign: starSign,
                population: population,
                events: events,
                birth_element: { stone: stones[month - 1], flower: "탄생화 정보는 서버 모드에서 더 정확합니다", meaning: "아름다운 탄생" },
                ai_prompt: `A cinematic masterpiece of a ${zodiac.color} ${zodiac.animal}, symbolic of your birth.`
            };
        }

        // UI Update logic (same as before)
        zodiacName.innerText = data.zodiac.zodiac_name;
        zodiacDetails.innerHTML = `
            <div style="margin-bottom: 0.5rem;">${data.zodiac.color}색 ${data.zodiac.animal}의 해, ${data.zodiac.element}의 기운을 타고났습니다.</div>
            <div style="font-size: 1.5rem; color: #fbbf24; font-weight: 700;">✨ 당신의 별자리: ${data.star_sign}</div>
        `;

        birthStone.innerText = data.birth_element.stone;
        birthFlower.innerText = data.birth_element.flower;
        flowerMeaning.innerText = data.birth_element.meaning;
        aiPromptText.innerText = data.ai_prompt;

        statsGrid.innerHTML = '';
        const sortedCountries = Object.keys(data.population).sort((a, b) => {
            const priority = { 'global': 1, 'kr': 2, 'south korea': 2 };
            const aPrio = priority[a.toLowerCase()] || 3;
            const bPrio = priority[b.toLowerCase()] || 3;
            return aPrio - bPrio || a.localeCompare(b);
        });

        const countryNames = { 'Global': '전세계', 'KR': '대한민국', 'South Korea': '대한민국' };
        sortedCountries.forEach(country => {
            const stats = data.population[country];
            const card = document.createElement('div');
            card.className = 'stat-card';
            card.innerHTML = `
                <span class="stat-value">${stats.total.toLocaleString()}명</span>
                <div class="gender-info"><span class="male">♂ ${stats.male.toLocaleString()}</span><span class="female">♀ ${stats.female.toLocaleString()}</span></div>
                <span class="stat-label">${countryNames[country] || country}</span>
            `;
            statsGrid.appendChild(card);
        });

        eventList.innerHTML = '<h3 style="margin-bottom: 1.5rem;">당신이 태어난 날과 연관된 기록</h3>';
        if (data.events && data.events.length > 0) {
            data.events.forEach(event => {
                const item = document.createElement('div');
                item.className = 'event-item';
                const yearVal = event.year || '역사';
                const textVal = event.text;
                item.innerHTML = `
                    <div class="event-text"><span class="event-year" style="background: var(--accent-color); color: var(--primary-bg); padding: 2px 6px; border-radius: 4px; font-weight: bold; margin-right: 8px;">${yearVal}년</span><span>${textVal}</span></div>
                    <a href="https://www.google.com/search?q=${encodeURIComponent(yearVal + '년 ' + textVal)}" target="_blank" class="btn-search">검색</a>
                `;
                eventList.appendChild(item);
            });
        } else {
            eventList.innerHTML += '<p style="color: var(--text-dim);">이 날짜의 기록을 찾을 수 없습니다.</p>';
        }

        resultSection.style.display = 'block';
        resultSection.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        alert("정보를 가져오는 중 오류가 발생했습니다.");
        console.error(error);
    }
}

function copyPrompt() {
    const promptText = document.getElementById('aiPromptText').innerText;
    navigator.clipboard.writeText(promptText).then(() => {
        alert('프롬프트가 복사되었습니다!');
    }).catch(err => {
        console.error('복사 실패:', err);
    });
}

// Tic-Tac-Toe Upgrade Game Logic
let boardState = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X"; // User is X
let gameActive = true;
let currentLevel = 1;

// History for Level 2 (Queue up to 3 slots)
let moveHistory = { "X": [], "O": [] };

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

const levelSettings = {
    1: "기본 틱택토: 3줄을 먼저 완성하세요!",
    2: "기록의 틱택토: 4번째 말을 두면 1번째 말이 사라집니다.",
    3: "운명의 틱택토: 상대방 위에 올리면 중립말(N)이 됩니다!",
    4: "중력의 틱택토: 말을 두면 해당 줄의 가장 아래로 떨어집니다!",
    5: "오염의 틱택토 (4x4): 4줄을 완성하세요! 상대 옆에 두면 오염 될 수 있습니다.",
    6: "회전의 틱택토 (4x4): 3턴마다 보드가 90도 회전합니다!",
    7: "슈퍼 틱택토 (Ultimate): 틱택토 안의 틱택토! 최후의 두뇌 싸움입니다."
};

let totalTurns = 0;

// Record Management
let clearRecords = { wins: {}, failures: {} };
async function loadGameRecords() {
    try {
        const response = await fetch('/api/records/get');
        if (!response.ok) throw new Error();
        const data = await response.json();
        clearRecords.wins = data.wins || {};
        clearRecords.failures = data.failures || {};
    } catch (err) {
        console.warn("Global records unavailable, loading from LocalStorage");
        const localData = localStorage.getItem('game_records');
        if (localData) {
            const parsed = JSON.parse(localData);
            clearRecords.wins = parsed.wins || {};
            clearRecords.failures = parsed.failures || {};
        }
    }
    updateRecordsUI();
}

async function incrementRecord(level, type = 'win') {
    const key = type === 'win' ? 'wins' : 'failures';
    clearRecords[key][level] = (clearRecords[key][level] || 0) + 1;

    // UI Update immediately
    updateRecordsUI();

    try {
        const response = await fetch('/api/records/increment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                level: level.toString(),
                type: type
            })
        });
        if (!response.ok) throw new Error();
        const data = await response.json();
        clearRecords.wins = data.wins;
        clearRecords.failures = data.failures;
        updateRecordsUI();
    } catch (err) {
        console.warn("Failed to sync with server, saving to LocalStorage");
        localStorage.setItem('game_records', JSON.stringify(clearRecords));
    }
}

function updateRecordsUI() {
    const list = document.getElementById('recordsList');
    if (!list) return;
    list.innerHTML = "";
    for (let i = 1; i <= 7; i++) {
        const item = document.createElement('div');
        item.className = 'record-item';
        item.innerHTML = `
            <span class="record-level">LV ${i}</span>
            <div class="record-badges">
                <span class="record-count success" title="성공">${clearRecords.wins[i] || 0}</span>
                <span class="record-count failure" title="실패">${clearRecords.failures[i] || 0}</span>
            </div>
        `;
        list.appendChild(item);
    }
}

function handleCellClick(clickedCellEvent) {
    const cell = clickedCellEvent.target;
    if (!gameActive || currentPlayer === "O") return;

    if (currentLevel === 7) {
        const boardIdx = parseInt(cell.getAttribute('data-board-idx'));
        const cellIdx = parseInt(cell.getAttribute('data-cell-idx'));

        // Check valid board
        if (nextActiveBoard !== -1 && boardIdx !== nextActiveBoard) return;
        // Check already taken in mini-board
        if (miniBoards[boardIdx][cellIdx] !== "") return;
        // Check if mini-board is already decided
        if (globalBoard[boardIdx] !== "") return;

        makeSuperMove(boardIdx, cellIdx);
    } else {
        let index = parseInt(cell.getAttribute('data-index'));
        // Rule for Level 4: Gravity
        if (currentLevel === 4) {
            index = getGravityIndex(index);
            if (index === -1) return; // Column full
        }

        // Rule for Level 3: Overlaying
        if (currentLevel === 3) {
            if (boardState[index] === "N") return;
            if (boardState[index] === "X") return;
        } else {
            if (boardState[index] !== "") return;
        }

        makeMove(index);
    }
}

function getGravityIndex(clickedIndex) {
    const size = currentLevel === 5 ? 4 : 3;
    const col = clickedIndex % size;
    for (let r = size - 1; r >= 0; r--) {
        const idx = r * size + col;
        if (boardState[idx] === "") return idx;
    }
    return -1;
}

function makeMove(index) {
    let targetState = currentPlayer;
    const size = currentLevel === 5 ? 4 : 3;

    // LV 3 Rule: Overlaying
    if (currentLevel === 3 && boardState[index] !== "" && boardState[index] !== currentPlayer) {
        targetState = "N";
    }

    boardState[index] = targetState;
    const cell = document.querySelector(`.cell[data-index="${index}"]`);
    cell.innerText = targetState;
    cell.className = `cell taken ${targetState.toLowerCase()}`;
    totalTurns++;

    // LV 6 Rule: Rotate every 3 turns
    if (currentLevel === 6 && totalTurns > 0 && totalTurns % 3 === 0) {
        setTimeout(rotateBoard, 500);
    }

    // LV 5, 6 Rule: Infection (LV 6 also inherits Infection for more fun)
    if ((currentLevel === 5 || currentLevel === 6) && targetState !== "N") {
        tryInfection(index);
    }

    // LV 2 Rule: History
    if (currentLevel === 2) {
        moveHistory[currentPlayer].push(index);
        updateFadingHints();
        if (moveHistory[currentPlayer].length > 3) {
            const firstIdx = moveHistory[currentPlayer].shift();
            boardState[firstIdx] = "";
            const firstCell = document.querySelector(`.cell[data-index="${firstIdx}"]`);
            firstCell.innerText = "";
            firstCell.className = "cell";
            updateFadingHints();
        }
    }

    if (checkWin()) {
        const winnerName = currentPlayer === 'X' ? '당신이' : '컴퓨터가';
        document.getElementById('gameStatus').innerText = `✨ ${winnerName} 승리!`;
        gameActive = false;

        if (currentPlayer === 'X') {
            incrementRecord(currentLevel, 'win');
            if (currentLevel < 6) { // Level 6 added, so move until 6
                setTimeout(() => {
                    alert(`축하합니다! ${currentLevel}단계를 클리어했습니다. 다음 레벨로 이동합니다.`);
                    currentLevel++;
                    resetGame(true);
                }, 1000);
            } else if (currentLevel === 6) {
                setTimeout(() => {
                    alert("🌪️ 회전의 난관을 뚫고 7단계 최종 보스에게 도전할 자격을 얻으셨습니다!");
                    currentLevel++;
                    resetGame(true);
                }, 1000);
            } else {
                setTimeout(() => alert("🥇 전설로 남을 고수십니다! 모든 단계를 정복하셨습니다!"), 500);
            }
        } else {
            // Computer wins
            incrementRecord(currentLevel, 'fail');
        }
        return;
    }

    if (!boardState.includes("") && currentLevel !== 2) {
        document.getElementById('gameStatus').innerText = "🤝 비겼습니다!";
        gameActive = false;
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    document.getElementById('gameStatus').innerText = currentPlayer === "X" ? "당신의 차례입니다 (X)" : "컴퓨터가 생각 중... (O)";

    if (gameActive && currentPlayer === "O") {
        setTimeout(computerMove, 700);
    }
}

function tryInfection(pos) {
    const size = 4;
    const r = Math.floor(pos / size);
    const c = pos % size;
    const opponent = "X"; // Computers turn always tries to infect X

    // Adjacent cells (Up, Down, Left, Right)
    const neighbors = [
        { r: r - 1, c: c }, { r: r + 1, c: c },
        { r: r, c: c - 1 }, { r: r, c: c + 1 }
    ];

    neighbors.forEach(n => {
        if (n.r >= 0 && n.r < size && n.c >= 0 && n.c < size) {
            const idx = n.r * size + n.c;
            const targetPlayer = currentPlayer === "X" ? "O" : "X";
            if (boardState[idx] === targetPlayer && Math.random() < 0.3) { // 30% chance
                boardState[idx] = currentPlayer;
                const nCell = document.querySelector(`.cell[data-index="${idx}"]`);
                nCell.innerText = currentPlayer;
                nCell.className = `cell taken ${currentPlayer.toLowerCase()}`;
                console.log(`Infected index ${idx} to ${currentPlayer}`);
            }
        }
    });
}

function computerMove() {
    if (!gameActive) return;

    // High intelligence: can we win or block?
    const size = (currentLevel === 5 || currentLevel === 6) ? 4 : 3;
    const winConds = getWinConditions(size);

    const getSim = (idx, player) => {
        let tb = [...boardState];
        if (currentLevel === 3 && tb[idx] !== "" && tb[idx] !== player) tb[idx] = "N";
        else tb[idx] = player;
        return tb;
    };

    // 1. Win
    for (let i = 0; i < size * size; i++) {
        if (canPlaceAt(i, "O")) {
            if (checkWinSim(getSim(i, "O"), "O", winConds)) { doMove(i); return; }
        }
    }

    // 2. Block
    for (let i = 0; i < size * size; i++) {
        if (canPlaceAt(i, "X")) {
            if (checkWinSim(getSim(i, "X"), "X", winConds)) { doMove(i); return; }
        }
    }

    // 3. Middle / Random
    let available = [];
    for (let i = 0; i < size * size; i++) {
        if (canPlaceAt(i, "O")) available.push(i);
    }

    // Favor middle in 4x4 or 3x3
    let mid = size === 3 ? [4] : [5, 6, 9, 10];
    let preferred = mid.filter(m => available.includes(m));
    if (preferred.length > 0) {
        doMove(preferred[Math.floor(Math.random() * preferred.length)]);
    } else {
        doMove(available[Math.floor(Math.random() * available.length)]);
    }
}

function canPlaceAt(index, player) {
    if (currentLevel === 4) {
        const size = 3;
        const col = index % size;
        for (let r = 0; r < size; r++) if (boardState[r * size + col] === "") return true;
        return false;
    }
    if (currentLevel === 3) return boardState[index] !== "N" && boardState[index] !== player;
    return boardState[index] === "";
}

function doMove(index) {
    if (currentLevel === 4) index = getGravityIndex(index);
    makeMove(index);
}

function getWinConditions(size) {
    if (size === 3) return winningConditions;
    let conds = [];
    // Rows
    for (let r = 0; r < 4; r++) conds.push([r * 4, r * 4 + 1, r * 4 + 2, r * 4 + 3]);
    // Cols
    for (let c = 0; c < 4; c++) conds.push([c, c + 4, c + 8, c + 12]);
    // Diagonals
    conds.push([0, 5, 10, 15]);
    conds.push([3, 6, 9, 12]);
    return conds;
}

function checkWinSim(board, player, conds) {
    const ok = (val) => val === player || val === "N";
    return conds.some(c => ok(board[c[0]]) && ok(board[c[1]]) && ok(board[c[2]]) && (c.length < 4 || ok(board[c[3]])));
}

function checkWin() {
    const size = (currentLevel === 5 || currentLevel === 6) ? 4 : 3;
    return checkWinSim(boardState, currentPlayer, getWinConditions(size));
}

// Super Tic-Tac-Toe State
let miniBoards = Array(9).fill(null).map(() => Array(9).fill(""));
let globalBoard = Array(9).fill("");
let nextActiveBoard = -1; // -1 means free move

function makeSuperMove(bIdx, cIdx) {
    miniBoards[bIdx][cIdx] = currentPlayer;
    const cell = document.querySelector(`.mini-cell[data-board-idx="${bIdx}"][data-cell-idx="${cIdx}"]`);
    cell.innerText = currentPlayer;
    cell.className = `cell mini-cell taken ${currentPlayer.toLowerCase()}`;

    // 1. Check mini-board win
    if (globalBoard[bIdx] === "" && checkWinSim(miniBoards[bIdx], currentPlayer, winningConditions)) {
        globalBoard[bIdx] = currentPlayer;
        const miniBoardEl = document.querySelector(`.mini-board[data-board-idx="${bIdx}"]`);
        miniBoardEl.classList.add(`won-${currentPlayer.toLowerCase()}`);
        miniBoardEl.setAttribute('data-winner', currentPlayer);
    }

    // 2. Set next active board
    nextActiveBoard = cIdx;
    // If the next mini-board is already finished or full, player gets a free move
    if (globalBoard[nextActiveBoard] !== "" || !miniBoards[nextActiveBoard].includes("")) {
        nextActiveBoard = -1;
    }

    // 3. Update UI Visuals
    document.querySelectorAll('.mini-board').forEach((mb, idx) => {
        mb.classList.remove('active');
        if (nextActiveBoard === -1 || idx === nextActiveBoard) {
            if (globalBoard[idx] === "" && miniBoards[idx].includes("")) {
                mb.classList.add('active');
            }
        }
    });

    // 4. Check global win
    if (checkWinSim(globalBoard, currentPlayer, winningConditions)) {
        const winnerName = currentPlayer === 'X' ? '당신이' : '컴퓨터가';
        document.getElementById('gameStatus').innerText = `🏆 슈퍼 틱택토 최종 승리: ${winnerName}!`;
        gameActive = false;
        if (currentPlayer === 'X') {
            incrementRecord(7, 'win');
            setTimeout(() => alert("🎆 전설로 남을 대기록입니다! 당신은 진정한 틱택토의 신입니다!"), 500);
        } else {
            incrementRecord(7, 'fail');
        }
        return;
    }

    if (!globalBoard.includes("") && !Array.prototype.concat(...miniBoards).includes("")) {
        document.getElementById('gameStatus').innerText = "🤝 무승부입니다!";
        gameActive = false;
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    document.getElementById('gameStatus').innerText = currentPlayer === "X" ? "당신의 차례입니다 (X)" : "컴퓨터가 생각 중... (O)";

    if (gameActive && currentPlayer === "O") {
        setTimeout(computerSuperMove, 800);
    }
}

function computerSuperMove() {
    if (!gameActive) return;

    let targetBoardIdx = nextActiveBoard;
    let availableBoards = [];

    // If free move, choose a board that isn't won or full
    if (targetBoardIdx === -1) {
        for (let i = 0; i < 9; i++) {
            if (globalBoard[i] === "" && miniBoards[i].includes("")) {
                availableBoards.push(i);
            }
        }
        // Priority: center board if empty, else random
        if (availableBoards.includes(4)) targetBoardIdx = 4;
        else targetBoardIdx = availableBoards[Math.floor(Math.random() * availableBoards.length)];
    }

    // AI logic within the target board
    const currentMiniBoard = miniBoards[targetBoardIdx];
    let availableCells = [];
    for (let j = 0; j < 9; j++) {
        if (currentMiniBoard[j] === "") availableCells.push(j);
    }

    // 1. Can win mini-board?
    for (let c of availableCells) {
        let temp = [...currentMiniBoard];
        temp[c] = "O";
        if (checkWinSim(temp, "O", winningConditions)) {
            makeSuperMove(targetBoardIdx, c);
            return;
        }
    }

    // 2. Must block player?
    for (let c of availableCells) {
        let temp = [...currentMiniBoard];
        temp[c] = "X";
        if (checkWinSim(temp, "X", winningConditions)) {
            makeSuperMove(targetBoardIdx, c);
            return;
        }
    }

    // 3. Strategic: center, corners, else random
    const preferred = [4, 0, 2, 6, 8, 1, 3, 5, 7];
    for (let p of preferred) {
        if (availableCells.includes(p)) {
            makeSuperMove(targetBoardIdx, p);
            return;
        }
    }
}

function resetGame(isNewLevel = false) {
    if (!isNewLevel) {
        if (!confirm("정말 게임을 초기화하시겠습니까? (현재 레벨은 유지됩니다)")) return;
        // 게임 진행 중에 다시 시작을 누르면 실패로 기록
        if (gameActive) {
            incrementRecord(currentLevel, 'fail');
        }
    }

    currentPlayer = "X";
    gameActive = true;
    moveHistory = { "X": [], "O": [] };
    totalTurns = 0;
    nextActiveBoard = -1;
    globalBoard = Array(9).fill("");
    miniBoards = Array(9).fill(null).map(() => Array(9).fill(""));

    document.getElementById('levelBadge').innerText = `LV ${currentLevel}`;
    document.getElementById('levelDesc').innerText = levelSettings[currentLevel];
    document.getElementById('gameStatus').innerText = "당신의 차례입니다 (X)";

    const board = document.getElementById('board');
    board.innerHTML = "";
    board.className = "tictactoe-board"; // Fix: Match CSS selector

    if (currentLevel === 7) {
        board.classList.add('super-board');
        board.style.gridTemplateColumns = `repeat(3, 1fr)`;
        for (let i = 0; i < 9; i++) {
            const miniBoard = document.createElement('div');
            miniBoard.className = "mini-board";
            miniBoard.setAttribute('data-board-idx', i);
            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('div');
                cell.className = "cell mini-cell";
                cell.setAttribute('data-board-idx', i);
                cell.setAttribute('data-cell-idx', j);
                cell.addEventListener('click', handleCellClick);
                miniBoard.appendChild(cell);
            }
            board.appendChild(miniBoard);
        }
    } else {
        const size = (currentLevel === 5 || currentLevel === 6) ? 4 : 3;
        boardState = new Array(size * size).fill("");
        board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        for (let i = 0; i < size * size; i++) {
            const cell = document.createElement('div');
            cell.className = "cell";
            cell.setAttribute('data-index', i);
            cell.addEventListener('click', handleCellClick);
            board.appendChild(cell);
        }
    }
}

function updateFadingHints() {
    document.querySelectorAll('.cell.fading').forEach(c => c.classList.remove('fading'));
    if (currentLevel === 2) {
        moveHistory.X.length === 3 && document.querySelector(`.cell[data-index="${moveHistory.X[0]}"]`)?.classList.add('fading');
        moveHistory.O.length === 3 && document.querySelector(`.cell[data-index="${moveHistory.O[0]}"]`)?.classList.add('fading');
    }
}

function rotateBoard() {
    if (!gameActive) return;
    const size = 4;
    const newBoard = new Array(16).fill("");
    const boardElement = document.getElementById('board');

    // Add visual rotation effect
    boardElement.classList.add('rotating');

    // Calculate new positions (r, c) -> (c, 3-r)
    for (let i = 0; i < 16; i++) {
        const r = Math.floor(i / size);
        const c = i % size;
        const newR = c;
        const newC = 3 - r;
        const newIdx = newR * size + newC;
        newBoard[newIdx] = boardState[i];
    }

    boardState = newBoard;

    // Update UI after animation delay
    setTimeout(() => {
        boardElement.classList.remove('rotating');
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, idx) => {
            const state = boardState[idx];
            cell.innerText = state;
            cell.className = state === "" ? "cell" : `cell taken ${state.toLowerCase()}`;
            // Preserve fading for LV 2 if somehow relevant, but mainly for current state
        });

        // Re-check win after rotation
        if (checkWin()) {
            const winnerName = currentPlayer === 'X' ? '당신이' : '컴퓨터가';
            document.getElementById('gameStatus').innerText = `✨ 회전 후 ${winnerName} 승리!`;
            gameActive = false;
        }
    }, 500);
}

// --- Memory Game Logic ---
let memoryCards = [];
let flippedCards = [];
let matchedCount = 0;
const emojis = ["🍎", "🍐", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐"];

function initMemoryGame() {
    const board = document.getElementById('memoryBoard');
    board.innerHTML = "";
    memoryCards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    flippedCards = [];
    matchedCount = 0;

    memoryCards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = "memory-card";
        card.dataset.index = index;
        card.dataset.emoji = emoji;
        card.innerText = "?";
        card.addEventListener('click', flipMemoryCard);
        board.appendChild(card);
    });
}

function flipMemoryCard() {
    if (flippedCards.length === 2 || this.classList.contains('flipped')) return;

    this.innerText = this.dataset.emoji;
    this.classList.add('flipped');
    flippedCards.push(this);

    if (flippedCards.length === 2) {
        if (flippedCards[0].dataset.emoji === flippedCards[1].dataset.emoji) {
            matchedCount++;
            flippedCards = [];
            if (matchedCount === emojis.length) {
                setTimeout(() => alert("축하합니다! 모든 카드를 맞추셨습니다."), 300);
            }
        } else {
            setTimeout(() => {
                flippedCards.forEach(c => {
                    c.innerText = "?";
                    c.classList.remove('flipped');
                });
                flippedCards = [];
            }, 800);
        }
    }
}

// --- Clicker (Idle) Game Logic ---
let seconds = 0;
let autoSecondsPerSecond = 0;
const upgradeCosts = {
    auto1: 15,
    auto10: 100
};
const upgradeOwned = {
    auto1: 0,
    auto10: 0
};

function updateClickerUI() {
    const scoreEl = document.getElementById('timeScore');
    const autoEl = document.getElementById('autoRate');
    if (scoreEl) scoreEl.innerText = Math.floor(seconds).toLocaleString();
    if (autoEl) autoEl.innerText = autoSecondsPerSecond.toLocaleString();

    // Save to LocalStorage
    localStorage.setItem('clicker_data', JSON.stringify({
        seconds: seconds,
        autoRate: autoSecondsPerSecond,
        owned: upgradeOwned,
        costs: upgradeCosts
    }));

    // Update shop buttons
    for (const id in upgradeCosts) {
        const btn = document.getElementById(`buy-${id}`);
        if (btn) {
            btn.disabled = seconds < upgradeCosts[id];
            btn.innerText = `구매 (${upgradeCosts[id]}초) - 보유: ${upgradeOwned[id]}`;
        }
    }
}

function buyUpgrade(id) {
    if (seconds >= upgradeCosts[id]) {
        seconds -= upgradeCosts[id];
        upgradeOwned[id]++;

        if (id === 'auto1') autoSecondsPerSecond += 1;
        if (id === 'auto10') autoSecondsPerSecond += 10;

        // Increase cost (exponential growth)
        upgradeCosts[id] = Math.floor(upgradeCosts[id] * 1.25);

        updateClickerUI();
    }
}

function startIdleTimer() {
    setInterval(() => {
        if (autoSecondsPerSecond > 0) {
            seconds += autoSecondsPerSecond / 10; // Update every 100ms
            updateClickerUI();
        }
    }, 100);
}

// Initial binding
document.addEventListener('DOMContentLoaded', () => {
    // Set default tab
    switchTab('daily');

    // Initial Daily Fun Data
    fetchTrivia();
    fetchFact();
    fetchDailyHistory();

    // Restore Clicker Data
    const savedClicker = localStorage.getItem('clicker_data');
    if (savedClicker) {
        const data = JSON.parse(savedClicker);
        seconds = data.seconds || 0;
        autoSecondsPerSecond = data.autoRate || 0;
        Object.assign(upgradeOwned, data.owned || {});
        Object.assign(upgradeCosts, data.costs || {});
        updateClickerUI();
    }

    // Clicker Game Binding
    const clickBtn = document.getElementById('clickBtn');
    if (clickBtn) {
        clickBtn.addEventListener('click', () => {
            seconds += 1;
            updateClickerUI();
        });
    }
    startIdleTimer();

    loadGameRecords();
    resetGame(true); // Call once to setup LV 1
});
