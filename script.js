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

// --- Navigation & Core UI ---
function switchTab(tabId) {
    console.log('Switching to tab:', tabId);

    // 1. Module Management
    const sections = ['daily', 'discovery', 'games'];
    sections.forEach(s => {
        const section = document.getElementById(`${s}Section`);
        if (section) {
            section.classList.remove('active');
        }
    });

    const targetSection = document.getElementById(`${tabId}Section`);
    if (targetSection) {
        targetSection.classList.add('active');
        console.log('Activated section:', tabId);
    } else {
        console.error('Section not found:', `${tabId}Section`);
    }

    // 2. Tab Button State
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${tabId}'`)) {
            btn.classList.add('active');
        }
    });

    // 3. Header & Text Updates
    const titleMap = {
        'daily': { t: "Daily Fun", s: "매일 새로운 상식과 퀴즈로 두뇌를 깨워보세요" },
        'discovery': { t: "Birth Secret", s: "당신이 태어난 날의 비밀을 공간에 펼칩니다" },
        'games': { t: "Spatial Play", s: "시간을 벌고, 나무를 키우고, 우주를 여행하세요" }
    };

    const titleEl = document.getElementById('mainTitle');
    const subtitleEl = document.getElementById('mainSubtitle');
    const scoreEl = document.querySelector('.user-stats');

    if (titleEl && titleMap[tabId]) {
        titleEl.innerText = titleMap[tabId].t;
    }
    if (subtitleEl && titleMap[tabId]) {
        subtitleEl.innerText = titleMap[tabId].s;
    }

    // Show/hide score badge based on tab
    if (scoreEl) {
        scoreEl.style.display = (tabId === 'games') ? 'flex' : 'none';
    }

    // Trigger visual updates
    if (tabId === 'games') {
        setTimeout(() => {
            initZenGalaxy();
            initChronosTree();
            initMemoryGame(); // Ensure memory game is ready
        }, 100);
    }
}

// Daily Toon Metadata Loader
async function loadDailyToon() {
    try {
        const resp = await fetch('assets/comics/today/metadata.json');
        if (!resp.ok) return;
        const data = await resp.json();

        const titleEl = document.getElementById('comicTitle');
        const dateEl = document.getElementById('comicDate');

        if (titleEl && data.title) titleEl.innerText = data.title;
        if (dateEl && data.date) dateEl.innerText = `Update: ${data.date} | Issue: ${data.issue}`;
    } catch (e) {
        console.warn("Daily Toon metadata not found. Using placeholders.");
    }
}

// Art Engine: Time-Sensitive Environment
function updateEnvironment(totalSec) {
    const h = (Math.floor(totalSec / 3600) % 24);
    const root = document.documentElement;

    // Day (6~18) vs Night (18~6)
    if (h >= 6 && h < 18) {
        root.style.setProperty('--env-hue', '200'); // blueish
        root.style.setProperty('--env-brightness', '1');
        root.style.setProperty('--env-glow-opacity', '0.1');
    } else {
        root.style.setProperty('--env-hue', '260'); // purpleish
        root.style.setProperty('--env-brightness', '0.8');
        root.style.setProperty('--env-glow-opacity', '0.3');
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
    // 1. Calculate Virtual Time first (Shared by both Analog and Digital)
    const totalSec = Math.floor(seconds);
    const s = totalSec % 60;
    const m = Math.floor(totalSec / 60) % 60;
    const h = Math.floor(totalSec / 3600) % 24;
    const d = Math.floor(totalSec / 86400);

    // 2. Always Update Digital View & Mini Clock
    const digitalView = document.getElementById('digitalView');
    const miniClock = document.getElementById('miniClock');
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

    if (digitalView) {
        digitalView.innerText = d > 0 ? `Day ${d} ${timeStr}` : timeStr;
    }
    if (miniClock) {
        miniClock.innerText = timeStr;
    }

    // 3. Canvas Rendering (Only if visible)
    const canvas = document.getElementById('clockCanvas');
    if (!canvas || canvas.offsetParent === null) return;
    const ctx = canvas.getContext('2d');

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
        drawAnalogClock(ctx, centerX, centerY, radius, h, m, s);
    } else if (clockType === 'sundial') {
        drawSundial(ctx, centerX, centerY, radius, totalSec % 86400);
    } else if (clockType === 'water') {
        drawWaterClock(ctx, centerX, centerY, radius, s);
    }
}

function drawAnalogClock(ctx, x, y, r, h, m, s) {
    // Face
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Marks
    ctx.strokeStyle = '#94a3b8';
    for (let i = 0; i < 12; i++) {
        const ang = (i * Math.PI) / 6;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(ang) * (r - 2), y + Math.sin(ang) * (r - 2));
        ctx.lineTo(x + Math.cos(ang) * (r - 10), y + Math.sin(ang) * (r - 10));
        ctx.stroke();
    }

    // Hands
    drawHand(ctx, x, y, (h * Math.PI) / 6 + (m * Math.PI) / (6 * 60), r * 0.5, 4, '#fff');
    drawHand(ctx, x, y, (m * Math.PI) / 30, r * 0.7, 3, '#94a3b8');
    drawHand(ctx, x, y, (s * Math.PI) / 30, r * 0.85, 2, '#38bdf8');
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

function drawSundial(ctx, x, y, r, daySec) {
    const hour = daySec / 3600; // 0 ~ 24

    // Draw Sky (Day/Night transition)
    const gradient = ctx.createLinearGradient(0, 0, 0, y * 2);
    if (hour >= 6 && hour < 18) {
        // Day
        gradient.addColorStop(0, '#0ea5e9'); // sky blue
        gradient.addColorStop(1, '#38bdf8');
    } else {
        // Night
        gradient.addColorStop(0, '#020617'); // dark navy
        gradient.addColorStop(1, '#1e1b4b');
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, x * 2, y * 2);

    // Draw Horizon
    ctx.beginPath();
    ctx.moveTo(x - r, y + 20);
    ctx.lineTo(x + r, y + 20);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Sun/Moon in an arc
    // Start at 6:00 (left horizon), peak at 12:00 (top), end at 18:00 (right horizon)
    if (hour >= 6 && hour < 18) {
        const sunPos = (hour - 6) / 12; // 0 to 1
        const angle = Math.PI + sunPos * Math.PI;
        const sx = x + Math.cos(angle) * (r * 0.7);
        const sy = y + Math.sin(angle) * (r * 0.7) + 20;

        // Glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#fbbf24';
        ctx.beginPath();
        ctx.arc(sx, sy, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
        ctx.shadowBlur = 0;
    } else {
        // Moon
        const moonHour = hour >= 18 ? hour - 18 : hour + 6;
        const moonPos = moonHour / 12;
        const angle = Math.PI + moonPos * Math.PI;
        const mx = x + Math.cos(angle) * (r * 0.7);
        const my = y + Math.sin(angle) * (r * 0.7) + 20;

        ctx.shadowBlur = 15;
        ctx.shadowColor = '#fff';
        ctx.beginPath();
        ctx.arc(mx, my, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#f8fafc';
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    ctx.restore();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.stroke();
}

function drawWaterClock(ctx, x, y, r, s) {
    const fillPercent = s / 60;
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
    const floorSec = Math.floor(seconds);
    const scoreStr = floorSec.toLocaleString();

    // Header & Main Score
    if (document.getElementById('timeScore')) document.getElementById('timeScore').innerText = scoreStr;
    if (document.getElementById('headerScore')) document.getElementById('headerScore').innerText = scoreStr;

    // Rates & Multipliers
    if (document.getElementById('autoRate')) document.getElementById('autoRate').innerText = (autoSecondsPerSecond * multiplier).toLocaleString();
    if (document.getElementById('multiplier')) document.getElementById('multiplier').innerText = multiplier.toLocaleString();
    if (document.getElementById('rebirthCount')) document.getElementById('rebirthCount').innerText = rebirthCount;

    // Upgrades
    for (const id in upgradeCosts) {
        const costEl = document.getElementById(`cost-${id}`);
        const itemEl = document.getElementById(`buy-${id}`);
        if (costEl) costEl.innerText = `${upgradeCosts[id].toLocaleString()}s`;
        if (itemEl) {
            itemEl.classList.toggle('disabled', seconds < upgradeCosts[id]);
        }
    }

    // Environment & Logic
    updateEnvironment(seconds);

    const rebirthBtn = document.getElementById('rebirthBtn');
    if (rebirthBtn) {
        rebirthBtn.disabled = seconds < rebirthThreshold;
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

// --- Chronos Tree Simulation ---
let treeGrowth = 0;
let lastTreeSec = 0;

function initChronosTree() {
    const canvas = document.getElementById('treeCanvas');
    const container = document.getElementById('chronosTreeContainer');
    if (!canvas || !container) return;

    const resize = () => {
        canvas.width = container.clientWidth * window.devicePixelRatio;
        canvas.height = container.clientHeight * window.devicePixelRatio;
        canvas.style.width = `${container.clientWidth}px`;
        canvas.style.height = `${container.clientHeight}px`;
        renderTree();
    }
    window.addEventListener('resize', resize);
    resize();
}

function renderTree() {
    const canvas = document.getElementById('treeCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Growth level based on seconds (logarithmic growth for long-term play)
    // 100% Growth at approx 1 day (86400s)
    const level = Math.min(1.2, Math.log10(seconds + 1) / 5 + 0.1);
    treeGrowth = level;
    document.getElementById('treeStatus').innerText = `Growth: ${Math.floor(level * 100)}%`;

    ctx.save();
    ctx.translate(w / 2, h - 20);
    // Base trunk thickness and length
    const initialLen = h * 0.25 * level;
    drawBranch(ctx, initialLen, 12 * level, 0);
    ctx.restore();
}

function drawBranch(ctx, len, thick, angle) {
    if (len < 5) {
        // Draw Leaf
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(163, 230, 53, ${0.4 + Math.random() * 0.4})`; // lime-400
        ctx.fill();
        return;
    }

    ctx.save();
    ctx.rotate(angle * Math.PI / 180);

    // Branch line
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -len);
    ctx.strokeStyle = `rgba(139, 94, 60, ${0.8 + Math.random() * 0.2})`; // brownish
    ctx.lineWidth = thick;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.translate(0, -len);

    // Recursive children
    const nextLen = len * (0.7 + Math.random() * 0.1);
    const nextThick = thick * 0.7;

    // Always split into two or three
    drawBranch(ctx, nextLen, nextThick, -25 + (Math.random() * 10));
    drawBranch(ctx, nextLen, nextThick, 25 - (Math.random() * 10));
    if (len > 30) {
        drawBranch(ctx, nextLen * 0.6, nextThick, (Math.random() - 0.5) * 40);
    }

    ctx.restore();
}

function growTreeOnce() {
    // Inject "Virtual Nutrients" (temporary jump in visual level)
    seconds += 3600; // +1 hour worth of growth visually
    updateClickerUI();
    renderTree();
}

function resetTree() {
    if (confirm("정말로 나무를 처음부터 다시 키우시겠습니까?")) {
        seconds = 0;
        updateClickerUI();
        renderTree();
    }
}

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
    switchTab('daily');
    initChronosTree(); // Added Chronos Tree initialization

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
        // Base flow + Auto points (every 100ms)
        const baseFlow = 0.1;
        seconds += baseFlow + (autoSecondsPerSecond * multiplier) / 10;
        updateClickerUI();
        renderClock();
        renderTree(); // Added: Tree grows with time
    }, 100);

    // Initial API calls
    fetchTrivia();
    fetchFact();
    fetchDailyHistory();
    loadGameRecords();
    resetGame(true);
    loadDailyToon(); // New: Load today's comic metadata
    initZenGalaxy();
    initMemoryGame();
    updateTictactoeUI();

    // Initialize Google Ads after DOM is fully loaded
    setTimeout(() => {
        if (typeof adsbygoogle !== 'undefined') {
            (adsbygoogle = window.adsbygoogle || []).push({});
        }
    }, 500);
});

// --- API Helpers (Reuse or Refine) ---
async function fetchTrivia() {
    const content = document.getElementById('triviaContent');
    if (!content) return;

    content.innerText = "가져오는 중...";
    try {
        const res = await fetch('https://opentdb.com/api.php?amount=1&type=multiple');

        if (res.status === 429) {
            content.innerText = "⏳ API 요청 한도 초과. 잠시 후 다시 시도해주세요.";
            return;
        }

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        if (!data.results || data.results.length === 0) {
            throw new Error("No results");
        }

        const item = data.results[0];
        const q = decodeHtml(item.question);
        const a = decodeHtml(item.correct_answer);
        content.innerHTML = `<p>${q}</p><div class='answer' style='opacity:0; transition:0.3s' onmouseover='this.style.opacity=1'>정답: ${a}</div>`;
    } catch (err) {
        console.warn("Trivia fetch failed:", err);
        content.innerText = "💡 오늘의 퀴즈를 불러올 수 없습니다.";
    }
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
    const badge = document.getElementById('levelBadge');
    if (badge) badge.innerText = `LV ${level}`;
}

// --- Memory Game ---
let memoryCards = [];
let flipped = [];
let matched = 0;
const emojis = ["🍎", "🍐", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐"];

function initMemoryGame() {
    const boardEl = document.getElementById('memoryBoard');
    if (!boardEl) return;
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
    navigator.clipboard.writeText(text);
    alert('프롬프트가 복사되었습니다!');
}

// Reset all game data
function resetAllGames() {
    if (confirm('⚠️ 모든 게임 데이터(점수, 나무 성장, 은하 등)가 초기화됩니다. 계속하시겠습니까?')) {
        localStorage.clear();
        alert('✅ 모든 데이터가 초기화되었습니다. 페이지를 새로고침합니다.');
        location.reload();
    }
}

// --- Zen Galaxy Simulation ---
let zenActive = false;
let zenParticles = [];
let zenAnimationFrame;
const ZEN_MAX_PARTICLES = 1500;

class ZenParticle {
    constructor(w, h) {
        this.init(w, h);
    }
    init(w, h) {
        const ang = Math.random() * Math.PI * 2;
        const dist = Math.random() * Math.min(w, h) * 0.5;
        this.x = w / 2 + Math.cos(ang) * dist;
        this.y = h / 2 + Math.sin(ang) * dist;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = Math.random() * 1.5 + 0.5;
        this.hue = 200 + Math.random() * 60;
        this.alpha = Math.random() * 0.5 + 0.5;
    }
    update(w, h, m) {
        const dx = w / 2 - this.x;
        const dy = h / 2 - this.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);

        // Gravity towards center (stronger if further, creates orbits)
        const force = 0.0005 * m;
        this.vx += (dx / dist) * force * (dist * 0.01);
        this.vy += (dy / dist) * force * (dist * 0.01);

        // Swirl effect
        const swirl = 0.001 * m;
        this.vx += dy * swirl;
        this.vy -= dx * swirl;

        this.x += this.vx;
        this.y += this.vy;

        // Drag
        this.vx *= 0.98;
        this.vy *= 0.98;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 80%, 75%, ${this.alpha})`;
        ctx.fill();
    }
}

function initZenGalaxy() {
    const canvas = document.getElementById('zenCanvas');
    const container = document.getElementById('zenGalaxyContainer');
    if (!canvas || !container) return;

    const resize = () => {
        canvas.width = container.clientWidth * window.devicePixelRatio;
        canvas.height = container.clientHeight * window.devicePixelRatio;
        canvas.style.width = `${container.clientWidth}px`;
        canvas.style.height = `${container.clientHeight}px`;
    }
    window.addEventListener('resize', resize);
    resize();
}

function toggleZenMode() {
    zenActive = !zenActive;
    const btn = document.getElementById('zenToggleBtn');
    if (zenActive) {
        btn.innerText = "우주 여행 중지";
        btn.style.background = "#f43f5e";
        ZenLoop();
    } else {
        btn.innerText = "우주 여행 시작";
        btn.style.background = "";
        cancelAnimationFrame(zenAnimationFrame);
    }
}

function resetZenParticles() {
    zenParticles = [];
    document.getElementById('zenCounter').innerText = `Particles: 0`;
}

function ZenLoop() {
    if (!zenActive) return;
    const canvas = document.getElementById('zenCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const dpr = window.devicePixelRatio;

    ctx.fillStyle = 'rgba(5, 5, 5, 0.1)'; // Trail effect
    ctx.fillRect(0, 0, w, h);

    // Spawn based on multiplier or base rate
    if (zenParticles.length < ZEN_MAX_PARTICLES && Math.random() < 0.3) {
        const count = Math.min(5, Math.ceil(multiplier));
        for (let i = 0; i < count; i++) {
            zenParticles.push(new ZenParticle(w, h));
        }
    }

    ctx.save();
    // Blur effect for glow
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#38bdf8';

    zenParticles.forEach((p, i) => {
        p.update(w, h, multiplier * 1.5);
        p.draw(ctx);
    });
    ctx.restore();

    document.getElementById('zenCounter').innerText = `Particles: ${zenParticles.length}`;
    zenAnimationFrame = requestAnimationFrame(ZenLoop);
}

