// --- Configuration ---
const CONFIG = {
    arraySize: 50,
    minVal: 5,
    maxVal: 100,
    defaultSpeed: 50,
    colors: {
        default: '#64748b',
        active: '#f43f5e',
        sorted: '#10b981',
        pivot: '#8b5cf6',
        compare: '#fbbf24'
    },
    gridSize: 50
};

// --- Translations ---
const TRANSLATIONS = {
    en: {
        tab_sorting: "Sorting",
        tab_pathfinding: "Pathfinding",
        tab_maze: "Maze Gen",
        tab_gameoflife: "Game of Life",
        tab_tsp: "TSP",
        label_mode: "Mode:",
        mode_code: "Code",
        mode_game: "Game",
        btn_run: "Run",
        btn_stop: "Stop",
        status_ready: "Ready",
        status_sorting: "Sorting",
        status_image: "Sorting (Image)",
        status_pathfinding: "Pathfinding",
        status_maze: "Maze Generation",
        status_gol: "Game of Life",
        status_tsp: "Traveling Salesman",
        status_running: "Running...",
        status_finished: "Finished!",
        status_stopped: "Stopped.",
        msg_correct: "Correct!",
        msg_wrong: "Wrong!",
        game_title: "Interactive Sort",
        game_instruction: "Select an algorithm and click Run to start!",
        game_swap: "Swap",
        game_pass: "Pass",
        game_yes: "Yes",
        game_no: "No",
        prompt_bubble: "Compare <b>[{0}]</b> and <b>[{1}]</b>.<br>Should we swap?",
        prompt_bubble_img: "Is Left Image Slice > Right Image Slice? (Index {0} vs {1})",
        prompt_selection: "Check if Right is smaller?"
    },
    ko: {
        tab_sorting: "정렬 (Sorting)",
        tab_pathfinding: "길찾기 (Pathfinding)",
        tab_maze: "미로 생성 (Maze)",
        tab_gameoflife: "생명 게임 (GoL)",
        tab_tsp: "외판원 문제 (TSP)",
        label_mode: "모드:",
        mode_code: "코딩",
        mode_game: "게임",
        btn_run: "실행",
        btn_stop: "정지",
        status_ready: "준비",
        status_sorting: "정렬",
        status_image: "정렬 (이미지)",
        status_pathfinding: "길찾기",
        status_maze: "미로 생성",
        status_gol: "생명 게임",
        status_tsp: "외판원 문제 (TSP)",
        status_running: "실행 중...",
        status_finished: "완료!",
        status_stopped: "정지됨.",
        msg_correct: "정답입니다!",
        msg_wrong: "틀렸습니다!",
        game_title: "인터랙티브 정렬",
        game_instruction: "알고리즘을 선택하고 실행을 눌러 시작하세요!",
        game_swap: "교환 (Swap)",
        game_pass: "패스 (Pass)",
        game_yes: "네",
        game_no: "아니요",
        prompt_bubble: "<b>[{0}]</b> 값과 <b>[{1}]</b> 값을 비교하세요.<br>교환해야 할까요?",
        prompt_bubble_img: "왼쪽 이미지가 오른쪽보다 큰가요? (인덱스 {0} vs {1})",
        prompt_selection: "오른쪽 값이 현재 최솟값보다 작은가요?"
    }
};

// --- Presets ---
const SORT_PRESETS = {
    bubble: `// Bubble Sort
for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data.length - i - 1; j++) {
        renderArray([j, j+1], CONFIG.colors.compare);
        await sleep(APP.delayMs);
        if (data[j] > data[j + 1]) {
            await swap(j, j + 1);
        }
    }
}`,
    selection: `// Selection Sort
for (let i = 0; i < data.length; i++) {
    let minIdx = i;
    for (let j = i + 1; j < data.length; j++) {
        renderArray([minIdx, j], CONFIG.colors.compare);
        await sleep(APP.delayMs);
        if (data[j] < data[minIdx]) {
            minIdx = j;
        }
    }
    if (minIdx !== i) {
        await swap(i, minIdx);
    }
}`,
    insertion: `// Insertion Sort
for (let i = 1; i < data.length; i++) {
    let j = i;
    while (j > 0 && data[j] < data[j - 1]) {
        renderArray([j, j-1], CONFIG.colors.compare);
        await swap(j, j - 1);
        j--;
    }
}`,
    quick: `// Quick Sort
async function partition(low, high) {
    let pivot = data[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
        renderArray([j, high], CONFIG.colors.compare);
        await sleep(APP.delayMs);
        if (data[j] < pivot) {
            i++;
            await swap(i, j);
        }
    }
    await swap(i + 1, high);
    return i + 1;
}
async function quickSort(low, high) {
    if (low < high) {
        let pi = await partition(low, high);
        await quickSort(low, pi - 1);
        await quickSort(pi + 1, high);
    }
}
await quickSort(0, data.length - 1);`,
    merge: `// Merge Sort
async function merge(l, m, r) {
    let n1 = m - l + 1;
    let n2 = r - m;
    let L = new Array(n1);
    let R = new Array(n2);
    for (let i = 0; i < n1; i++) L[i] = data[l + i];
    for (let j = 0; j < n2; j++) R[j] = data[m + 1 + j];
    let i = 0, j = 0, k = l;
    while (i < n1 && j < n2) {
        renderArray([k], CONFIG.colors.active);
        await sleep(APP.delayMs);
        if (L[i] <= R[j]) { data[k] = L[i]; i++; }
        else { data[k] = R[j]; j++; }
        k++;
    }
    while (i < n1) {
        renderArray([k], CONFIG.colors.active);
        await sleep(APP.delayMs);
        data[k] = L[i]; i++; k++;
    }
    while (j < n2) {
        renderArray([k], CONFIG.colors.active);
        await sleep(APP.delayMs);
        data[k] = R[j]; j++; k++;
    }
}
async function mergeSort(l, r) {
    if (l >= r) return;
    let m = l + parseInt((r - l) / 2);
    await mergeSort(l, m);
    await mergeSort(m + 1, r);
    await merge(l, m, r);
}
await mergeSort(0, data.length - 1);`,
    custom: `// Custom Sort`
};

const PF_PRESETS = {
    bfs: `// BFS
const queue = [startNode];
const visited = new Set();
visited.add(startNode.id);
while(queue.length > 0) {
    const current = queue.shift();
    if(current.id === endNode.id) break;
    await visit(current);
    const neighbors = getNeighbors(current);
    for(let n of neighbors) {
        if(!visited.has(n.id)) {
            visited.add(n.id);
            n.parent = current;
            queue.push(n);
        }
    }
}
await reconstructionPath(endNode);`,
    dfs: `// DFS
const stack = [startNode];
const visited = new Set();
while(stack.length > 0) {
    const current = stack.pop();
    if(current.id === endNode.id) break;
    if(!visited.has(current.id)) {
        visited.add(current.id);
        await visit(current);
        const neighbors = getNeighbors(current);
        for(let n of neighbors) {
            if(!visited.has(n.id)) {
                n.parent = current;
                stack.push(n);
            }
        }
    }
}
await reconstructionPath(endNode);`,
    astar: `// A* Search`
};

// --- Global State ---
const APP = {
    module: 'sorting',
    isRunning: false,
    shouldStop: false,
    delayMs: 50,
    lang: 'ko',

    // Sorting
    sortMode: 'code',
    sortData: [],
    isImageMode: false,
    imgSrc: 'https://picsum.photos/800/600',

    // Grid (Pathfinding, Maze, NQueens, GoL)
    grid: [],
    pfStart: { r: 1, c: 1 },
    pfEnd: { r: 18, c: 18 },

    // Maze State
    mazeStack: [],

    // N-Queens State
    nQueensSize: 8,

    // GoL State
    golRunning: false,

    // TSP
    tspCities: [],
    tspPath: []
};

// --- DOM Elements ---
const elEditor = document.getElementById('codeEditor');
const elStatus = document.getElementById('statusText');
const moduleSelect = document.getElementById('moduleSelect');
const langSelect = document.getElementById('langSelect');

// Containers
const elViz = document.getElementById('visualizerContainer');
const elGrid = document.getElementById('gridContainer');
const elCanvas = document.getElementById('tspCanvas');

// Controls
const controls = {
    sorting: document.getElementById('controls_sorting'),
    pathfinding: document.getElementById('controls_pathfinding'),
    maze: document.getElementById('controls_maze'),
    gameoflife: document.getElementById('controls_gameoflife'),
    tsp: document.getElementById('controls_tsp')
};

// Sorting DOM
const btnRun = document.getElementById('btnRun');
const btnStop = document.getElementById('btnStop'); // Shared Stop
const btnGenerate = document.getElementById('btnGenerate');
const algoSelect = document.getElementById('algoSelect');
const imgModeCheck = document.getElementById('imgModeCheck');
const imgUpload = document.getElementById('imgUpload');
const sizeRange = document.getElementById('sizeRange');
const speedRange = document.getElementById('speedRange');

// Maze DOM
const btnMazeGen = document.getElementById('btnMazeGen');

// GoL DOM
const btnGolStart = document.getElementById('btnGolStart');
const btnGolStop = document.getElementById('btnGolStop');
const btnGolClear = document.getElementById('btnGolClear');
const btnGolRandom = document.getElementById('btnGolRandom');

// TSP DOM
const btnTspRun = document.getElementById('btnTspRun');
const btnTspNew = document.getElementById('btnTspNew');


// GoL DOM
function init() {
    generateArray();
    generateGrid();
    switchModule('sorting');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    const rect = elCanvas.parentElement.getBoundingClientRect();
    elCanvas.width = rect.width;
    elCanvas.height = rect.height - 40;
    if (APP.module === 'tsp') drawTSP();
}

// --- Module Switching (Select Box) ---
function switchModule(modName) {
    if (APP.isRunning || APP.golRunning) handleStop();
    APP.module = modName;

    if (key === modName) controls[key].classList.remove('hidden');
    else controls[key].classList.add('hidden');
});

elViz.classList.add('hidden');
elGrid.classList.add('hidden');
elCanvas.classList.add('hidden');
elEditor.parentElement.style.display = 'flex';

removeGridListeners();
btnStop.disabled = true; // Reset stop state

if (modName === 'sorting') {
    elViz.classList.remove('hidden');
    elEditor.value = SORT_PRESETS[algoSelect.value];
} else if (modName === 'tsp') {
    elCanvas.classList.remove('hidden');
    elEditor.parentElement.style.display = 'none';
    resizeCanvas();
    generateTSP();
} else {
    elGrid.classList.remove('hidden');
    elGrid.className = '';

    if (modName === 'pathfinding') {
        elEditor.value = PF_PRESETS.astar;
        addPathfindingListeners();
    } else if (modName === 'maze') {
        elEditor.parentElement.style.display = 'none';
    } else if (modName === 'gameoflife') {
        elEditor.parentElement.style.display = 'none';
        generateGrid(CONFIG.gridSize);
        addGoLListeners();
    }
}
updateText();
}

moduleSelect.addEventListener('change', (e) => switchModule(e.target.value));

// --- Helper: Translation ---
function t(key) { return TRANSLATIONS[APP.lang][key] || key; }
function updateText() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (TRANSLATIONS[APP.lang][key]) el.textContent = TRANSLATIONS[APP.lang][key];
    });
    elStatus.textContent = t('status_' + APP.module);
}
langSelect.addEventListener('change', (e) => { APP.lang = e.target.value; updateText(); });

// --- SORTING MODULE ---
function generateArray() {
    APP.sortData = [];
    const size = parseInt(sizeRange.value);
    if (APP.isImageMode) {
        for (let i = 0; i < size; i++) APP.sortData.push(i);
        for (let i = size - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [APP.sortData[i], APP.sortData[j]] = [APP.sortData[j], APP.sortData[i]];
        }
    } else {
        for (let i = 0; i < size; i++) APP.sortData.push(Math.floor(Math.random() * 100) + 5);
    }
    renderArray();
}

function renderArray(activeIndices = [], color = null) {
    elViz.innerHTML = '';
    const n = APP.sortData.length;
    APP.sortData.forEach((val, idx) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        if (APP.isImageMode) {
            bar.style.flex = '1 1 0%';
            bar.style.height = '100%';
            bar.style.backgroundImage = `url('${APP.imgSrc}')`;
            bar.style.backgroundSize = `${n * 100}% 100%`;
            bar.style.backgroundPosition = `${n > 1 ? (val / (n - 1)) * 100 : 0}% 0`;
            bar.style.border = 'none';
            if (activeIndices.includes(idx)) bar.style.opacity = '0.5';
        } else {
            bar.style.width = `${100 / n}%`;
            bar.style.height = `${val}%`;
            if (activeIndices.includes(idx)) {
                bar.classList.add('active');
                if (color) bar.style.backgroundColor = color;
            }
        }
        elViz.appendChild(bar);
    });
}

async function swap(i, j) {
    if (APP.shouldStop) throw new Error('Stopped by user');
    let temp = APP.sortData[i];
    APP.sortData[i] = APP.sortData[j];
    APP.sortData[j] = temp;
    renderArray([i, j]);
    await sleep(APP.delayMs);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
sizeRange.addEventListener('input', generateArray);
speedRange.addEventListener('input', (e) => APP.delayMs = 200 - (e.target.value * 1.9));

// --- COMMON STOP HANDLER ---
function handleStop() {
    APP.shouldStop = true;
    APP.isRunning = false;
    APP.golRunning = false;
    btnStop.disabled = true;
    elStatus.textContent = t('status_stopped');
}

// --- TSP MODULE ---
function generateTSP() {
    APP.tspCities = [];
    const count = 15;
    for (let i = 0; i < count; i++) {
        APP.tspCities.push({
            x: Math.random() * elCanvas.width,
            y: Math.random() * elCanvas.height
        });
    }
    APP.tspPath = APP.tspCities.map((_, i) => i);
    drawTSP();
}

function drawTSP(currentLine = null) {
    const ctx = elCanvas.getContext('2d');
    ctx.clearRect(0, 0, elCanvas.width, elCanvas.height);

    // Draw Paths
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < APP.tspPath.length - 1; i++) {
        const c1 = APP.tspCities[APP.tspPath[i]];
        const c2 = APP.tspCities[APP.tspPath[i + 1]];
        ctx.moveTo(c1.x, c1.y);
        ctx.lineTo(c2.x, c2.y);
    }
    const start = APP.tspCities[APP.tspPath[0]];
    const end = APP.tspCities[APP.tspPath[APP.tspPath.length - 1]];
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(start.x, start.y);
    ctx.stroke();

    // Draw Cities
    APP.tspCities.forEach((c, i) => {
        ctx.fillStyle = i === 0 ? '#22c55e' : '#f43f5e';
        ctx.beginPath();
        ctx.arc(c.x, c.y, 6, 0, Math.PI * 2);
        ctx.fill();
    });

    if (currentLine) {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(currentLine.p1.x, currentLine.p1.y);
        ctx.lineTo(currentLine.p2.x, currentLine.p2.y);
        ctx.stroke();
    }
}

async function solveTSP() {
    if (APP.isRunning) return;
    APP.isRunning = true; APP.shouldStop = false;
    btnStop.disabled = false;
    setStatus('Selling...');

    const visited = new Set([0]);
    let path = [0];
    let curr = 0;

    while (path.length < APP.tspCities.length) {
        if (APP.shouldStop) break;
        let nearest = -1;
        let minDist = Infinity;

        for (let i = 0; i < APP.tspCities.length; i++) {
            if (!visited.has(i)) {
                drawTSP({ p1: APP.tspCities[curr], p2: APP.tspCities[i] });
                await sleep(APP.delayMs);
                const d = dist(APP.tspCities[curr], APP.tspCities[i]);
                if (d < minDist) { minDist = d; nearest = i; }
            }
        }
        if (nearest !== -1) {
            visited.add(nearest);
            path.push(nearest);
            curr = nearest;
            APP.tspPath = [...path];
            drawTSP();
        }
    }
    drawTSP();
    APP.isRunning = false;
    btnStop.disabled = true;
}
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

// --- GRID MODULES SETUP ---
function generateGrid(size = CONFIG.gridSize) {
    elGrid.innerHTML = '';
    elGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    APP.grid = [];
    for (let r = 0; r < size; r++) {
        let row = [];
        for (let c = 0; c < size; c++) {
            let node = { id: `${r}-${c}`, r, c, isWall: false, isAlive: false, div: null };
            const div = document.createElement('div');
            div.className = 'node';
            div.dataset.r = r;
            div.dataset.c = c;

            node.div = div;
            elGrid.appendChild(div);
            row.push(node);
        }
        APP.grid.push(row);
    }

    if (APP.module === 'pathfinding') {
        APP.pfStart = { r: 1, c: 1 }; APP.pfEnd = { r: size - 2, c: size - 2 };
        updateStartNode(APP.pfStart.r, APP.pfStart.c, true);
        updateEndNode(APP.pfEnd.r, APP.pfEnd.c, true);
    }
}

// --- MAZE ---
async function generateMaze() {
    if (APP.isRunning) return;
    APP.isRunning = true; APP.shouldStop = false;
    btnStop.disabled = false;

    APP.grid.forEach(row => row.forEach(n => { n.isWall = true; n.div.classList.add('wall'); }));
    let stack = [];
    let current = APP.grid[1][1];
    current.isWall = false; current.div.classList.remove('wall');
    stack.push(current);

    while (stack.length > 0) {
        if (APP.shouldStop) break;
        current.div.classList.add('active');
        await sleep(50);
        current.div.classList.remove('active');

        let neighbors = [];
        let dirs = [[0, 2], [0, -2], [2, 0], [-2, 0]];
        for (let d of dirs) {
            let nr = current.r + d[0];
            let nc = current.c + d[1];
            if (nr > 0 && nr < CONFIG.gridSize - 1 && nc > 0 && nc < CONFIG.gridSize - 1) {
                if (APP.grid[nr][nc].isWall) {
                    neighbors.push({ node: APP.grid[nr][nc], mid: APP.grid[current.r + d[0] / 2][current.c + d[1] / 2] });
                }
            }
        }

        if (neighbors.length > 0) {
            let next = neighbors[Math.floor(Math.random() * neighbors.length)];
            next.mid.isWall = false; next.mid.div.classList.remove('wall');
            next.node.isWall = false; next.node.div.classList.remove('wall');
            stack.push(next.node);
            current = next.node;
        } else {
            current = stack.pop();
        }
    }
    APP.isRunning = false;
    btnStop.disabled = true;
}

// --- GAME OF LIFE ---
async function runGameOfLife() {
    if (APP.golRunning) return;
    APP.golRunning = true;
    btnStop.disabled = false;
    while (APP.golRunning && !APP.shouldStop) {
        let nextState = APP.grid.map(row => row.map(n => n.isAlive));
        for (let r = 0; r < CONFIG.gridSize; r++) {
            for (let c = 0; c < CONFIG.gridSize; c++) {
                let neighbors = 0;
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (i === 0 && j === 0) continue;
                        let nr = r + i, nc = c + j;
                        if (nr >= 0 && nr < CONFIG.gridSize && nc >= 0 && nc < CONFIG.gridSize && APP.grid[nr][nc].isAlive) neighbors++;
                    }
                }
                if (APP.grid[r][c].isAlive) {
                    if (neighbors < 2 || neighbors > 3) nextState[r][c] = false;
                } else {
                    if (neighbors === 3) nextState[r][c] = true;
                }
            }
        }
        for (let r = 0; r < CONFIG.gridSize; r++) {
            for (let c = 0; c < CONFIG.gridSize; c++) {
                APP.grid[r][c].isAlive = nextState[r][c];
                if (APP.grid[r][c].isAlive) APP.grid[r][c].div.classList.add('start');
                else APP.grid[r][c].div.classList.remove('start');
            }
        }
        await sleep(APP.delayMs);
    }
    btnStop.disabled = true;
}

// --- EVENT HANDLERS ---
function addPathfindingListeners() {
    APP.grid.forEach(row => row.forEach(n => {
        n.div.onclick = () => {
            if (APP.module !== 'pathfinding') return;
            n.isWall = !n.isWall;
            n.div.classList.toggle('wall');
        };
    }));
}
function addGoLListeners() {
    APP.grid.forEach(row => row.forEach(n => {
        n.div.onclick = () => {
            n.isAlive = !n.isAlive;
            n.div.classList.toggle('start');
        };
    }));
}
function removeGridListeners() {
    APP.grid.forEach(row => row.forEach(n => n.div.onclick = null));
}
function updateStartNode(r, c, f) { APP.grid[APP.pfStart.r][APP.pfStart.c].div.classList.remove('start'); APP.pfStart = { r, c }; APP.grid[r][c].div.classList.add('start'); }
function updateEndNode(r, c, f) { APP.grid[APP.pfEnd.r][APP.pfEnd.c].div.classList.remove('end'); APP.pfEnd = { r, c }; APP.grid[r][c].div.classList.add('end'); }
function setStatus(msg) { elStatus.textContent = msg; }

// --- Buttons ---
btnRun.addEventListener('click', () => {
    const code = elEditor.value;
    const userFunc = new Function('data', 'swap', 'renderArray', 'CONFIG', 'APP', `return (async () => { ${code} })()`);
    APP.isRunning = true; APP.shouldStop = false;
    btnStop.disabled = false;
    userFunc(APP.sortData, swap, renderArray, CONFIG, APP).then(() => {
        APP.isRunning = false;
        setStatus(t('status_finished'));
        btnStop.disabled = true;
    });
});
btnMazeGen.addEventListener('click', generateMaze);
btnGolStart.addEventListener('click', runGameOfLife);
btnGolStop.addEventListener('click', () => { APP.golRunning = false; btnStop.disabled = true; });
btnGolClear.addEventListener('click', () => { APP.golRunning = false; generateGrid(); addGoLListeners(); });
btnGolRandom.addEventListener('click', () => {
    generateGrid(); addGoLListeners();
    // Generate "Acorn" Pattern (Methuselah)
    // .O.....
    // ...O...
    // OO..OOO
    const cx = Math.floor(CONFIG.gridSize / 2);
    const cy = Math.floor(CONFIG.gridSize / 2);
    const acorn = [
        [0, 1],
        [2, 1], [3, 2], // ...O... (relative to some start) - Wait, let's map coordinates correctly
        // Rel to center (0,0):
        // Row 0: . O . . . . .  -> (0, 1)
        // Row 1: . . . O . . .  -> (1, 3)
        // Row 2: O O . . O O O  -> (2, 0), (2, 1), (2, 4), (2, 5), (2, 6)
        // Let's center it:
        { r: cy - 1, c: cx - 2 },
        { r: cy + 1, c: cx },
        { r: cy + 2, c: cx - 3 }, { r: cy + 2, c: cx - 2 }, { r: cy + 2, c: cx + 1 }, { r: cy + 2, c: cx + 2 }, { r: cy + 2, c: cx + 3 }
    ];

    acorn.forEach(p => {
        if (APP.grid[p.r] && APP.grid[p.r][p.c]) {
            APP.grid[p.r][p.c].isAlive = true;
            APP.grid[p.r][p.c].div.classList.add('start');
        }
    });
});
btnTspRun.addEventListener('click', solveTSP);
btnTspNew.addEventListener('click', () => { generateTSP(); });

btnStop.addEventListener('click', handleStop);

// Start
init();
