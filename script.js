// --- Constants & Global State ---
let seconds = 0;
let autoSecondsPerSecond = 0;
let multiplier = 1;
let rebirthCount = 0;
let clockType = 'analog'; // analog, digital, sundial, water
const rebirthThreshold = 1000000;

let upgradeCosts = {
    auto1: 15,
    auto10: 100,
    auto100: 1000
};
let upgradeOwned = {
    auto1: 0,
    auto10: 0,
    auto100: 0
};

// --- Tab Navigation ---
function switchTab(tabId) {
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    const activeSec = document.getElementById(`${tabId}Section`);
    if (activeSec) activeSec.classList.add('active');

    const activeBtn = document.querySelector(`.tab-btn[onclick="switchTab('${tabId}')"]`);
    if (activeBtn) activeBtn.classList.add('active');

    // UI Feedback for main title
    const titles = {
        'daily': { main: 'Daily Pleasure', sub: '매일 새로운 상식과 퀴즈로 두뇌를 깨워보세요' },
        'discovery': { main: 'Birth Secret', sub: '당신이 태어난 날의 비밀을 확인해보세요' },
        'games': { main: 'Time & Play', sub: '시간을 벌고 기록을 갱신해보세요' }
    };
    if (titles[tabId]) {
        document.getElementById('mainTitle').innerText = titles[tabId].main;
        document.getElementById('mainSubtitle').innerText = titles[tabId].sub;
    }
}

// --- Clock Rendering Logic ---
function setClockType(type) {
    clockType = type;
    document.querySelectorAll('.selector-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.selector-btn[onclick="setClockType('${type}')"]`).classList.add('active');

    const digitalView = document.getElementById('digitalView');
    const clockCanvas = document.getElementById('clockCanvas');

    if (type === 'digital') {
        digitalView.style.display = 'block';
        clockCanvas.style.display = 'none';
    } else {
        digitalView.style.display = 'none';
        clockCanvas.style.display = 'block';
    }
}

function renderClock() {
    const canvas = document.getElementById('clockCanvas');
    if (!canvas || canvas.offsetParent === null) return;
    const ctx = canvas.getContext('2d');
    const now = new Date();

    // Set canvas resolution
    const size = 280;
    canvas.width = size * 2;
    canvas.height = size * 2;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(2, 2);

    ctx.clearRect(0, 0, size, size);
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;

    if (clockType === 'analog') {
        drawAnalogClock(ctx, centerX, centerY, radius, now);
    } else if (clockType === 'sundial') {
        drawSundial(ctx, centerX, centerY, radius, now);
    } else if (clockType === 'water') {
        drawWaterClock(ctx, centerX, centerY, radius, now);
    }

    // Update digital text anyway
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('digitalView').innerText = `${h}:${m}:${s}`;
}

function drawAnalogClock(ctx, x, y, r, now) {
    // Face
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Marks
    for (let i = 0; i < 12; i++) {
        const ang = (i * Math.PI) / 6;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(ang) * (r - 5), y + Math.sin(ang) * (r - 5));
        ctx.lineTo(x + Math.cos(ang) * (r - 15), y + Math.sin(ang) * (r - 15));
        ctx.stroke();
    }

    // Hands
    const hr = now.getHours() % 12;
    const min = now.getMinutes();
    const sec = now.getSeconds();

    drawHand(ctx, x, y, (hr * Math.PI) / 6 + (min * Math.PI) / (6 * 60), r * 0.5, 4, '#fff');
    drawHand(ctx, x, y, (min * Math.PI) / 30, r * 0.7, 3, '#94a3b8');
    drawHand(ctx, x, y, (sec * Math.PI) / 30, r * 0.85, 2, '#38bdf8');
}

function drawHand(ctx, x, y, ang, length, width, color) {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.sin(ang) * length, y - Math.cos(ang) * length);
    ctx.stroke();
}

function drawSundial(ctx, x, y, r, now) {
    // Base circle
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 180, 0, 0.1)';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    // Shadow line
    const hr = now.getHours() + now.getMinutes() / 60;
    const shadowAng = (hr - 6) * (Math.PI / 12); // Assume 6AM is left, 6PM is right

    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(shadowAng) * r, y + Math.sin(shadowAng) * r);
    ctx.stroke();
}

function drawWaterClock(ctx, x, y, r, now) {
    const fillPercent = (now.getSeconds() / 60);
    const waterY = y + r - (fillPercent * 2 * r);

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.fillRect(x - r, waterY, r * 2, r * 2);

    ctx.restore();
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();
}

// --- Clicker Game Logic ---
function updateClickerUI() {
    document.getElementById('timeScore').innerText = Math.floor(seconds).toLocaleString();
    document.getElementById('autoRate').innerText = (autoSecondsPerSecond * multiplier).toLocaleString();
    document.getElementById('multiplier').innerText = multiplier.toLocaleString();
    document.getElementById('rebirthCount').innerText = rebirthCount;

    const rebirthBtn = document.getElementById('rebirthBtn');
    if (rebirthBtn) {
        rebirthBtn.disabled = seconds < rebirthThreshold;
        rebirthBtn.innerText = seconds < rebirthThreshold ? `환생하기 (보너스 +1x)` : "환생 가능! 클릭하세요";
    }

    for (const id in upgradeCosts) {
        const costEl = document.getElementById(`cost-${id}`);
        const itemEl = document.getElementById(`buy-${id}`);
        if (costEl) costEl.innerText = `${upgradeCosts[id].toLocaleString()}s`;
        if (itemEl) {
            itemEl.classList.toggle('disabled', seconds < upgradeCosts[id]);
        }
    }

    // Save state
    localStorage.setItem('clicker_v2', JSON.stringify({
        seconds, autoRate: autoSecondsPerSecond, multiplier, rebirthCount, upgradeCosts, upgradeOwned
    }));
}

function buyUpgrade(id) {
    if (seconds >= upgradeCosts[id]) {
        seconds -= upgradeCosts[id];
        upgradeOwned[id]++;
        const bonus = id === 'auto1' ? 1 : (id === 'auto10' ? 10 : 100);
        autoSecondsPerSecond += bonus;
        upgradeCosts[id] = Math.floor(upgradeCosts[id] * 1.3);
        updateClickerUI();
    }
}

function handleRebirth() {
    if (seconds >= rebirthThreshold) {
        rebirthCount++;
        multiplier += 1;
        seconds = 0;
        autoSecondsPerSecond = 0;
        upgradeCosts = { auto1: 15, auto10: 100, auto100: 1000 };
        upgradeOwned = { auto1: 0, auto10: 0, auto100: 0 };
        updateClickerUI();
        alert(`축하합니다! ${rebirthCount}번째 환생에 성공하여 영구 배율이 x${multiplier}가 되었습니다.`);
    }
}

function createParticle(x, y) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.innerText = `+${multiplier}`;
    const tx = (Math.random() - 0.5) * 100;
    const ty = -100 - Math.random() * 50;
    p.style.setProperty('--tx', `${tx}px`);
    p.style.setProperty('--ty', `${ty}px`);
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 800);
}

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
    switchTab('daily');

    // Restore state
    const saved = localStorage.getItem('clicker_v2');
    if (saved) {
        const d = JSON.parse(saved);
        seconds = d.seconds || 0;
        autoSecondsPerSecond = d.autoRate || 0;
        multiplier = d.multiplier || 1;
        rebirthCount = d.rebirthCount || 0;
        Object.assign(upgradeCosts, d.upgradeCosts || {});
        Object.assign(upgradeOwned, d.upgradeOwned || {});
    }

    document.getElementById('clickBtn').addEventListener('click', (e) => {
        seconds += 1 * multiplier;
        createParticle(e.clientX, e.clientY);
        updateClickerUI();
    });

    setInterval(() => {
        seconds += (autoSecondsPerSecond * multiplier) / 10;
        updateClickerUI();
        renderClock();
    }, 100);

    // Initial API calls
    fetchTrivia();
    fetchFact();
    fetchDailyHistory();
    loadGameRecords();
    resetGame(true);
});

// --- API Helpers (Reuse or Refine) ---
async function fetchTrivia() {
    const content = document.getElementById('triviaContent');
    content.innerText = "가져오는 중...";
    try {
        const res = await fetch('https://opentdb.com/api.php?amount=1&type=multiple');
        const data = await res.json();
        const item = data.results[0];
        const q = decodeHtml(item.question);
        const a = decodeHtml(item.correct_answer);
        content.innerHTML = `<p>${q}</p><div class='answer' style='opacity:0; transition:0.3s' onmouseover='this.style.opacity=1'>정답: ${a}</div>`;
    } catch { content.innerText = "퀴즈를 가져오지 못했습니다."; }
}

async function fetchFact() {
    const content = document.getElementById('factContent');
    try {
        const res = await fetch('https://uselessfacts.jsph.pl/random.json?language=en');
        const data = await res.json();
        content.innerText = data.text;
    } catch { content.innerText = "상식을 가져오지 못했습니다."; }
}

async function fetchDailyHistory() {
    const list = document.getElementById('dailyHistoryContent');
    const today = new Date();
    const mm = today.getMonth() + 1;
    const dd = today.getDate();
    try {
        const res = await fetch(`https://ko.wikipedia.org/w/api.php?action=parse&origin=*&format=json&page=${mm}월_${dd}일&prop=text&section=1`);
        const data = await res.json();
        const html = data.parse.text["*"];
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const items = Array.from(doc.querySelectorAll('li')).slice(0, 3);
        list.innerHTML = items.map(li => `<p>• ${li.innerText.split('[')[0]}</p>`).join('');
    } catch { list.innerText = "역사를 가져오지 못했습니다."; }
}

function revealFortune() {
    const fortunes = [
        "오늘은 뜻밖의 행운이 찾아올 것입니다. 🍀",
        "서두르지 마세요. 시간은 당신의 편입니다. ⏳",
        "작은 노력이 큰 결실로 돌아오는 날입니다. 🌱",
        "주변 사람들에게 미소를 전해보세요. 복이 옵니다. 😊",
        "새로운 도전을 시작하기에 아주 좋은 타이밍입니다! 🚀"
    ];
    document.getElementById('fortuneContent').innerText = fortunes[Math.floor(Math.random() * fortunes.length)];
}

function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

// --- TicTacToe Logic (Existing but updated for UI) ---
let board = Array(9).fill("");
let currentPlayer = "X";
let gameActive = true;
let level = 1;

function resetGame(initial = false) {
    board = Array(9).fill("");
    currentPlayer = "X";
    gameActive = true;
    if (!initial) level = 1;
    renderBoard();
    updateTictactoeUI();
}

function renderBoard() {
    const boardEl = document.getElementById('board');
    if (!boardEl) return;
    boardEl.innerHTML = "";
    board.forEach((cell, i) => {
        const div = document.createElement('div');
        div.className = `cell ${cell.toLowerCase()}`;
        div.innerText = cell;
        div.addEventListener('click', () => handleMove(i));
        boardEl.appendChild(div);
    });
}

function handleMove(i) {
    if (board[i] !== "" || !gameActive || currentPlayer !== "X") return;
    board[i] = "X";
    renderBoard();
    if (!checkGameOver()) {
        currentPlayer = "O";
        setTimeout(computerMove, 500);
    }
}

function computerMove() {
    if (!gameActive) return;
    let available = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
    if (available.length > 0) {
        let move = available[Math.floor(Math.random() * available.length)];
        board[move] = "O";
        renderBoard();
        checkGameOver();
        currentPlayer = "X";
    }
}

function checkGameOver() {
    const winPatterns = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    for (const p of winPatterns) {
        if (board[p[0]] !== "" && board[p[0]] === board[p[1]] && board[p[1]] === board[p[2]]) {
            alert(board[p[0]] === "X" ? "Win!" : "Lose!");
            incrementRecord(level, board[p[0]] === "X" ? 'win' : 'failure');
            gameActive = false;
            return true;
        }
    }
    if (!board.includes("")) {
        alert("Draw!");
        gameActive = false;
        return true;
    }
    return false;
}

function updateTictactoeUI() {
    document.getElementById('levelBadge').innerText = `LV ${level}`;
}

// --- Memory Game ---
let memoryCards = [];
let flipped = [];
let matched = 0;
const emojis = ["🍎", "🍐", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐"];

function initMemoryGame() {
    const boardEl = document.getElementById('memoryBoard');
    boardEl.innerHTML = "";
    memoryCards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    matched = 0;
    flipped = [];
    memoryCards.forEach((emoji, i) => {
        const card = document.createElement('div');
        card.className = "memory-card";
        card.dataset.emoji = emoji;
        card.dataset.index = i;
        card.innerText = "?";
        card.addEventListener('click', flipCard);
        boardEl.appendChild(card);
    });
}

function flipCard() {
    if (flipped.length === 2 || this.classList.contains('flipped')) return;
    this.innerText = this.dataset.emoji;
    this.classList.add('flipped');
    flipped.push(this);
    if (flipped.length === 2) {
        if (flipped[0].dataset.emoji === flipped[1].dataset.emoji) {
            matched++;
            flipped = [];
            if (matched === emojis.length) alert("Memory Clear!");
        } else {
            setTimeout(() => {
                flipped.forEach(c => { c.innerText = "?"; c.classList.remove('flipped'); });
                flipped = [];
            }, 500);
        }
    }
}

// --- Records Storage ---
let clearRecords = { wins: {}, failures: {} };
async function loadGameRecords() {
    const localData = localStorage.getItem('game_records');
    if (localData) {
        clearRecords = JSON.parse(localData);
    }
    updateRecordsUI();
}

function incrementRecord(level, type) {
    const key = type === 'win' ? 'wins' : 'failures';
    clearRecords[key][level] = (clearRecords[key][level] || 0) + 1;
    localStorage.setItem('game_records', JSON.stringify(clearRecords));
    updateRecordsUI();
}

function updateRecordsUI() {
    const list = document.getElementById('recordsList');
    if (!list) return;
    let html = "";
    for (let i = 1; i <= 7; i++) {
        html += `<div class='record-item'><span>LV ${i}</span><span>W: ${clearRecords.wins[i] || 0} / L: ${clearRecords.failures[i] || 0}</span></div>`;
    }
    list.innerHTML = html;
}

// --- Birth Discovery Core Logic ---
async function discover() {
    const dateInput = document.getElementById('birthDate');
    if (!dateInput.value) {
        alert("생년월일을 선택해주세요!");
        return;
    }

    document.getElementById('resultSection').classList.add('active');
    const birthDate = new Date(dateInput.value);
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    const year = birthDate.getFullYear();

    // 1. Western Zodiac
    const zodiacs = [
        { name: "염소자리", start: [1, 1], end: [1, 19] },
        { name: "물병자리", start: [1, 20], end: [2, 18] },
        { name: "물고기자리", start: [2, 19], end: [3, 20] },
        { name: "양자리", start: [3, 21], end: [4, 19] },
        { name: "황소자리", start: [4, 20], end: [5, 20] },
        { name: "쌍둥이자리", start: [5, 21], end: [6, 21] },
        { name: "게자리", start: [6, 22], end: [7, 22] },
        { name: "사자자리", start: [7, 23], end: [8, 22] },
        { name: "처녀자리", start: [8, 23], end: [9, 23] },
        { name: "천칭자리", start: [9, 24], end: [10, 22] },
        { name: "전갈자리", start: [10, 23], end: [11, 22] },
        { name: "사수자리", start: [11, 23], end: [12, 24] },
        { name: "염소자리", start: [12, 25], end: [12, 31] }
    ];
    const zodiac = zodiacs.find(z => {
        const [m1, d1] = z.start;
        const [m2, d2] = z.end;
        const current = month * 100 + day;
        return current >= (m1 * 100 + d1) && current <= (m2 * 100 + d2);
    }) || zodiacs[0];

    // 2. Chinese Zodiac & Element (Simplified)
    const animals = ["원숭이", "닭", "개", "돼지", "쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양"];
    const elements = ["금", "금", "토", "수", "수", "토", "목", "목", "토", "화", "화", "토"];
    const animal = animals[year % 12];
    const element = elements[year % 12];

    document.getElementById('zodiacName').innerText = `${zodiac.name} (${animal}띠)`;
    document.getElementById('zodiacDetails').innerText = `${year}년은 ${element}의 기운이 깃든 ${animal}의 해입니다.`;

    // 3. Birthstone & Flower (Mock data for variety)
    const stones = ["가넷", "자수정", "아쿠아마린", "다이아몬드", "에메랄드", "진주", "루비", "페리도트", "사파이어", "오팔", "토파즈", "터키석"];
    const flowers = ["수선화", "제비꽃", "데이지", "스위트피", "은방울꽃", "장미", "백합", "글라디올러스", "과꽃", "금잔화", "국화", "포인세티아"];
    document.getElementById('birthStone').innerText = stones[month - 1];
    document.getElementById('birthFlower').innerText = flowers[month - 1];
    document.getElementById('flowerMeaning').innerText = "변치 않는 사랑과 행복한 미래";

    // 4. Wikipedia Events
    const eventList = document.getElementById('eventList');
    eventList.innerHTML = "<h3>그날의 흔적 (역사적 사건)</h3><p>가져오는 중...</p>";
    try {
        const res = await fetch(`https://ko.wikipedia.org/w/api.php?action=parse&origin=*&format=json&page=${month}월_${day}일&prop=text&section=1`);
        const data = await res.json();
        const html = data.parse.text["*"];
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const items = Array.from(doc.querySelectorAll('li')).slice(0, 5);
        eventList.innerHTML = "<h3>그날의 흔적 (역사적 사건)</h3>" + items.map(li => `<p>• ${li.innerText.split('[')[0]}</p>`).join('');
    } catch {
        eventList.innerHTML = "<h3>그날의 흔적</h3><p>정보를 불러오지 못했습니다.</p>";
    }

    // 5. Build Stats Grid
    const statsGrid = document.getElementById('statsGrid');
    const globalBirths = 385000; // Approx daily births globally
    const koreaBirths = 700; // Approx daily births in Korea (current trend)
    statsGrid.innerHTML = `
        <div class="stat-item"><span class="stat-num">${koreaBirths.toLocaleString()}명</span><span class="stat-label">한국 동기</span></div>
        <div class="stat-item"><span class="stat-num">${globalBirths.toLocaleString()}명</span><span class="stat-label">지구촌 동기</span></div>
        <div class="stat-item"><span class="stat-num">약 48%</span><span class="stat-label">행운 지수</span></div>
    `;

    // AI Prompt
    const promptText = `A mystical digital art of a ${animal} guardian with ${element} essence, star constellations of ${zodiac.name} in the background, neon glow, 8k resolution, cinematic lighting.`;
    const promptContainer = document.querySelector('.prompt-container');
    if (promptContainer) {
        document.getElementById('aiPromptText').innerText = promptText;
    }
}

function copyPrompt() {
    const text = document.getElementById('aiPromptText').innerText;
    navigator.clipboard.writeText(text).then(() => alert("프롬프트가 복사되었습니다!"));
}
