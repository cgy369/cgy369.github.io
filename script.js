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
        tab_pixel: "Pixel Master",
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
        maze_instruction: "You can find the path in Pathfinding after generating the maze.",
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
        tab_pixel: "픽셀 마스킹 (Pixel)",
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
        maze_instruction: "미로 생성 후 길찾기에서 길을 찾아볼 수 있습니다.",
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
    let swapped = false;
    for (let j = 0; j < data.length - i - 1; j++) {
        renderArray([j, j+1], CONFIG.colors.compare);
        await sleep(APP.delayMs);
        if (data[j] > data[j + 1]) {
            await swap(j, j + 1);
            swapped = true;
        }
    }
    if (!swapped) break;
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
    astar: `// A* Search
const openSet = [startNode];
const closedSet = new Set();
startNode.g = 0;
startNode.f = dist(startNode, endNode);

while(openSet.length > 0) {
    openSet.sort((a,b) => a.f - b.f);
    const current = openSet.shift();
    if(current.id === endNode.id) break;
    
    closedSet.add(current.id);
    await visit(current);
    
    for(let n of getNeighbors(current)) {
        if(closedSet.has(n.id)) continue;
        let tentG = current.g + 1;
        if(!openSet.includes(n) || tentG < n.g) {
            n.parent = current;
            n.g = tentG;
            n.f = n.g + dist(n, endNode);
            if(!openSet.includes(n)) openSet.push(n);
        }
    }
}
await reconstructionPath(endNode);`
};

// --- Global State ---
const APP = {
    module: 'sorting',
    isRunning: false,
    shouldStop: false,
    delayMs: 50,
    lang: 'ko',
    isMouseDown: false,

    // Sorting
    sortMode: 'code',
    sortData: [],
    gameResolvers: null,
    isImageMode: false,
    imgSrc: 'https://picsum.photos/800/600',

    // Grid (Pathfinding, Maze, NQueens, GoL)
    grid: [],
    pfStart: { r: 1, c: 1 },
    pfEnd: { r: CONFIG.gridSize - 2, c: CONFIG.gridSize - 2 },

    // Maze State
    mazeStack: [],

    // N-Queens State
    nQueensSize: 8,

    // GoL State
    golRunning: false,

    // TSP
    tspCities: [],
    tspPath: [],
    // Pixel
    pixelOriginalData: null,
    pixelAction: 'remove', // 'remove' or 'replace'
    pixelTool: 'mask',     // 'mask' or 'smudge'
    pixelBrushSize: 30,
    lastMousePos: { x: 0, y: 0 }
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
const elPixelCanvas = document.getElementById('pixelCanvas');

// Controls
const controls = {
    sorting: document.getElementById('controls_sorting'),
    pathfinding: document.getElementById('controls_pathfinding'),
    maze: document.getElementById('controls_maze'),
    gameoflife: document.getElementById('controls_gameoflife'),
    tsp: document.getElementById('controls_tsp'),
    pixel: document.getElementById('controls_pixel')
};

// Sorting DOM
const btnRun = document.getElementById('btnRun');
const btnStop = document.getElementById('btnStop'); // Shared Stop
const btnGenerate = document.getElementById('btnGenerate');
const algoSelect = document.getElementById('algoSelect');
const imgModeCheck = document.getElementById('imgModeCheck');
const imgUpload = document.getElementById('imgUpload');
const lblImgUpload = document.getElementById('lblImgUpload');
const sizeRange = document.getElementById('sizeRange');
const speedRange = document.getElementById('speedRange');

// Mode & Game UI
const modeRadios = document.getElementsByName('appMode');
const gameOverlay = document.getElementById('gameOverlay');
const gameControls = document.getElementById('gameControls');
const stepDesc = document.getElementById('stepDesc');
const btnAction1 = document.getElementById('btnAction1'); // Swap / Yes
const btnAction2 = document.getElementById('btnAction2'); // Pass / No
const feedbackMsg = document.getElementById('feedbackMsg');
const gameInstruction = document.getElementById('gameInstruction');
const editorTitle = document.getElementById('editorTitle');
const editorSub = document.getElementById('editorSub');

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

// Huffman DOM
const btnHuffmanGen = document.getElementById('btnHuffmanGen');
const btnHuffmanRun = document.getElementById('btnHuffmanRun');

// Pathfinding DOM
const btnPfRun = document.getElementById('btnPfRun');
const btnPfReset = document.getElementById('btnPfReset');
const pfAlgoSelect = document.getElementById('pfAlgoSelect');


// GoL DOM
function init() {
    generateArray();
    generateGrid();
    switchModule('sorting');
    resizeCanvas();
    initPixelMaster();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mouseup', () => APP.isMouseDown = false);
}

function resizeCanvas() {
    const rect = elCanvas.parentElement.getBoundingClientRect();
    const w = rect.width, h = rect.height - 40;

    // Always sync elCanvas (TSP) to parent
    elCanvas.width = w; elCanvas.height = h;

    // Only sync pixelCanvas if no image is loaded yet
    if (!APP.pixelOriginalData) {
        elPixelCanvas.width = w;
        elPixelCanvas.height = h;
    }

    if (APP.module === 'tsp') drawTSP();
    else if (APP.module === 'pixel' && APP.pixelOriginalData) {
        // Just ensure it's drawn if it was hidden
        const ctx = elPixelCanvas.getContext('2d');
        // Do not clear and redraw here to avoid erasing user smudge work
        // But if dimensions changed, it's tricky. For now, we avoid auto-resize if data exists.
    }
}

// --- Module Switching (Select Box) ---
function switchModule(modName) {
    if (APP.isRunning || APP.golRunning) handleStop();

    // Hide ALL visualizers first
    [elViz, elGrid, elCanvas, elPixelCanvas].forEach(el => el.classList.add('hidden'));

    // Update active module
    APP.module = modName;

    // Show appropriate controls
    Object.keys(controls).forEach(key => {
        if (key === modName) controls[key].classList.remove('hidden');
        else controls[key].classList.add('hidden');
    });

    // Clean up overlays
    if (typeof gameOverlay !== 'undefined') gameOverlay.classList.add('hidden');

    elEditor.parentElement.style.display = 'flex';
    removeGridListeners();
    btnStop.disabled = true;

    if (modName === 'sorting') {
        elViz.classList.remove('hidden');
        elEditor.value = SORT_PRESETS[algoSelect.value];
        if (APP.sortMode === 'game') gameOverlay.classList.remove('hidden');
    } else if (modName === 'tsp') {
        elCanvas.classList.remove('hidden');
        elEditor.parentElement.style.display = 'none';
        resizeCanvas();
        generateTSP();
    } else if (modName === 'pixel') {
        elPixelCanvas.classList.remove('hidden');
        elEditor.parentElement.style.display = 'none';
    } else {
        // Grid-based modules
        elGrid.classList.remove('hidden');

        if (modName === 'pathfinding') {
            elEditor.value = PF_PRESETS.astar;
            addPathfindingListeners();
            updatePathfindingNodes();
        } else if (modName === 'maze') {
            elEditor.parentElement.style.display = 'none';
            // Grid remains as-is to preserve Maze -> PF flow
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
    const size = APP.sortMode === 'game' ? 10 : parseInt(sizeRange.value);
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
            bar.style.margin = '0';
            if (activeIndices.includes(idx)) bar.style.opacity = '0.5';
        } else {
            bar.style.width = `${100 / n}%`;
            bar.style.height = `${val}%`;
            if (APP.sortMode === 'game') {
                bar.textContent = val;
                bar.style.color = '#fff';
                bar.style.fontSize = '10px';
                bar.style.display = 'flex';
                bar.style.alignItems = 'flex-end';
                bar.style.justifyContent = 'center';
            }
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

function sleep(ms) {
    if (APP.shouldStop) throw new Error('Stopped by user');
    return new Promise(r => setTimeout(r, ms));
}
sizeRange.addEventListener('input', generateArray);
speedRange.addEventListener('input', (e) => APP.delayMs = 200 - (e.target.value * 1.9));

// --- INTERACTIVE MODE LOGIC ---

function waitForDecision(prompt, btn1Text, btn2Text, validator) {
    return new Promise((resolve, reject) => {
        if (APP.shouldStop) { reject(new Error('Stopped by user')); return; }
        stepDesc.innerHTML = prompt;
        btnAction1.textContent = btn1Text; btnAction2.textContent = btn2Text;
        feedbackMsg.textContent = ''; feedbackMsg.className = 'feedback';
        gameControls.classList.remove('hidden');
        APP.gameResolvers = { resolve, validator };
    });
}

async function handleGameDecision(choiceIdx) {
    if (!APP.gameResolvers) return;
    const { resolve, validator } = APP.gameResolvers;
    const result = validator(choiceIdx);
    if (result.correct) {
        feedbackMsg.textContent = t('msg_correct') + " " + (result.message || "");
        feedbackMsg.className = 'feedback correct';
        APP.gameResolvers = null;
        if (result.action) await result.action();
        await sleep(300);
        gameControls.classList.add('hidden');
        resolve(true);
    } else {
        feedbackMsg.textContent = t('msg_wrong') + " " + (result.message || "");
        feedbackMsg.className = 'feedback wrong';
        setTimeout(() => feedbackMsg.classList.remove('wrong'), 500);
    }
}

async function interactiveBubbleSort() {
    for (let i = 0; i < APP.sortData.length; i++) {
        for (let j = 0; j < APP.sortData.length - i - 1; j++) {
            renderArray([j, j + 1], CONFIG.colors.compare);
            const valA = APP.sortData[j], valB = APP.sortData[j + 1];
            const shouldSwap = valA > valB;
            await waitForDecision(t('prompt_bubble').replace('{0}', valA).replace('{1}', valB), t('game_swap'), t('game_pass'), (choice) => {
                if (choice === 1 && shouldSwap) return { correct: true, action: async () => await swap(j, j + 1) };
                if (choice === 2 && !shouldSwap) return { correct: true };
                return { correct: false, message: shouldSwap ? t('game_yes') : t('game_no') };
            });
        }
    }
}

async function interactiveSelectionSort() {
    for (let i = 0; i < APP.sortData.length; i++) {
        let minIdx = i;
        for (let j = i + 1; j < APP.sortData.length; j++) {
            renderArray([minIdx, j], CONFIG.colors.compare);
            const currentMin = APP.sortData[minIdx], compareVal = APP.sortData[j];
            const isSmaller = compareVal < currentMin;
            await waitForDecision(t('prompt_selection'), t('game_yes'), t('game_no'), (choice) => {
                if (choice === 1 && isSmaller) { minIdx = j; return { correct: true }; }
                if (choice === 2 && !isSmaller) return { correct: true };
                return { correct: false };
            });
        }
        if (minIdx !== i) await swap(i, minIdx);
    }
}

async function runGame() {
    const algo = algoSelect.value;
    gameInstruction.classList.add('hidden');
    try {
        if (algo === 'bubble') await interactiveBubbleSort();
        else if (algo === 'selection') await interactiveSelectionSort();
        else {
            alert("This algorithm is not yet supported in Game Mode. Switching to Bubble Sort!");
            await interactiveBubbleSort();
        }
        renderArray([], CONFIG.colors.sorted);
        setStatus(t('status_finished'));
    } catch (e) {
        if (e.message !== 'Stopped by user') console.error(e);
    } finally {
        gameControls.classList.add('hidden');
        gameInstruction.classList.remove('hidden');
    }
}

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

const distPoints = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

async function solveTSPAsync() {
    if (APP.isRunning) return;
    APP.isRunning = true; APP.shouldStop = false;
    btnStop.disabled = false;
    setStatus(t('status_running'));

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
                const d = distPoints(APP.tspCities[curr], APP.tspCities[i]);
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
    setStatus(t('status_finished'));
}
function solveTSP() { solveTSPAsync(); }

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

    // Use furthest odd indices for maze-compatible start/end
    APP.pfStart = { r: 1, c: 1 };
    let lastOdd = size % 2 === 0 ? size - 3 : size - 2;
    APP.pfEnd = { r: lastOdd, c: lastOdd };

    if (APP.module === 'pathfinding' || APP.module === 'maze') {
        updatePathfindingNodes();
        addPathfindingListeners();
    } else if (APP.module === 'gameoflife') {
        addGoLListeners();
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

    // Punch holes to create multiple paths (Cycles)
    const punchCount = Math.floor(CONFIG.gridSize * 1.5);
    for (let i = 0; i < punchCount; i++) {
        let r = Math.floor(Math.random() * (CONFIG.gridSize - 2)) + 1;
        let c = Math.floor(Math.random() * (CONFIG.gridSize - 2)) + 1;
        if (APP.grid[r][c].isWall) {
            APP.grid[r][c].isWall = false;
            APP.grid[r][c].div.classList.remove('wall');
        }
    }

    // Guarantee Start and End are Path
    const s = APP.grid[APP.pfStart.r][APP.pfStart.c];
    const e = APP.grid[APP.pfEnd.r][APP.pfEnd.c];
    if (s) { s.isWall = false; s.div.classList.remove('wall'); }
    if (e) { e.isWall = false; e.div.classList.remove('wall'); }

    APP.isRunning = false;
    btnStop.disabled = true;
    updatePathfindingNodes();
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
        const toggle = () => {
            if (APP.module !== 'pathfinding') return;
            n.isWall = !n.isWall;
            n.div.classList.toggle('wall');
        };
        n.div.onmousedown = (e) => { e.preventDefault(); APP.isMouseDown = true; toggle(); };
        n.div.onmouseenter = () => { if (APP.isMouseDown) toggle(); };
    }));
}
function addGoLListeners() {
    APP.grid.forEach(row => row.forEach(n => {
        const toggle = () => {
            n.isAlive = !n.isAlive;
            n.div.classList.toggle('start');
        };
        n.div.onmousedown = (e) => { e.preventDefault(); APP.isMouseDown = true; toggle(); };
        n.div.onmouseenter = () => { if (APP.isMouseDown) toggle(); };
    }));
}
function removeGridListeners() {
    APP.grid.forEach(row => row.forEach(n => n.div.onclick = null));
}
function updatePathfindingNodes() {
    // Clear any previous start/end
    APP.grid.forEach(row => row.forEach(n => n.div.classList.remove('start', 'end')));
    const s = APP.grid[APP.pfStart.r][APP.pfStart.c];
    const e = APP.grid[APP.pfEnd.r][APP.pfEnd.c];
    if (s) { s.isWall = false; s.div.classList.remove('wall'); s.div.classList.add('start'); }
    if (e) { e.isWall = false; e.div.classList.remove('wall'); e.div.classList.add('end'); }
}
function updateStartNode(r, c) {
    if (r === APP.pfEnd.r && c === APP.pfEnd.c) return;
    APP.pfStart = { r, c };
    updatePathfindingNodes();
}
function updateEndNode(r, c) {
    if (r === APP.pfStart.r && c === APP.pfStart.c) return;
    APP.pfEnd = { r, c };
    updatePathfindingNodes();
}
function setStatus(msg) { elStatus.textContent = msg; }

// --- Buttons ---
btnRun.addEventListener('click', async () => {
    if (APP.isRunning) return;
    const code = elEditor.value;
    const userFunc = new Function('data', 'swap', 'renderArray', 'CONFIG', 'APP', 'sleep', `return (async () => { ${code} })()`);

    try {
        APP.isRunning = true; APP.shouldStop = false;
        btnStop.disabled = false;
        if (APP.sortMode === 'game') {
            await runGame();
        } else {
            await userFunc(APP.sortData, swap, renderArray, CONFIG, APP, sleep);
        }
        setStatus(t('status_finished'));
    } catch (e) {
        if (e.message === 'Stopped by user') {
            setStatus(t('status_stopped'));
        } else {
            console.error("Sort Error:", e);
        }
    } finally {
        APP.isRunning = false;
        btnStop.disabled = true;
    }
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

// Pathfinding Listeners
pfAlgoSelect.addEventListener('change', () => {
    elEditor.value = PF_PRESETS[pfAlgoSelect.value];
});

btnPfReset.addEventListener('click', () => {
    APP.shouldStop = true;
    generateGrid(CONFIG.gridSize);
});

function clearPathVisuals() {
    APP.grid.forEach(row => row.forEach(node => {
        node.div.classList.remove('visited', 'path');
        delete node.parent;
        delete node.g;
        delete node.f;
    }));
}

btnPfRun.addEventListener('click', async () => {
    if (APP.isRunning) return;
    clearPathVisuals();
    const code = elEditor.value;
    // Context for Pathfinding Code
    const startNode = APP.grid[APP.pfStart.r][APP.pfStart.c];
    const endNode = APP.grid[APP.pfEnd.r][APP.pfEnd.c];

    const visit = async (node) => {
        if (APP.shouldStop) throw new Error('Stopped');
        if (node !== startNode && node !== endNode) {
            node.div.classList.add('visited');
        }
        await sleep(APP.delayMs);
    };

    const getNeighbors = (node) => {
        let neighbors = [];
        let dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        for (let d of dirs) {
            let r = node.r + d[0], c = node.c + d[1];
            if (r >= 0 && r < CONFIG.gridSize && c >= 0 && c < CONFIG.gridSize) {
                if (!APP.grid[r][c].isWall) neighbors.push(APP.grid[r][c]);
            }
        }
        return neighbors;
    };

    const reconstructionPath = async (node) => {
        let curr = node.parent;
        while (curr && curr !== startNode) {
            curr.div.classList.add('path');
            await sleep(APP.delayMs);
            curr = curr.parent;
        }
    };

    const dist = (a, b) => Math.abs(a.r - b.r) + Math.abs(a.c - b.c);

    try {
        APP.isRunning = true; APP.shouldStop = false;
        btnStop.disabled = false;
        const pfFunc = new Function('startNode', 'endNode', 'visit', 'getNeighbors', 'reconstructionPath', 'dist', 'APP', 'sleep', `return (async () => { ${code} })()`);
        await pfFunc(startNode, endNode, visit, getNeighbors, reconstructionPath, dist, APP, sleep);
    } catch (e) {
        console.error("PF Error:", e);
    } finally {
        APP.isRunning = false;
        btnStop.disabled = true;
        setStatus(t('status_finished'));
    }
});

btnStop.addEventListener('click', handleStop);

// Sorting Mode Listeners
modeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        APP.sortMode = e.target.value;
        handleStop();
        if (APP.sortMode === 'game') {
            editorTitle.textContent = t('game_title');
            editorSub.textContent = t('game_instruction');
            elEditor.classList.add('hidden');
            gameOverlay.classList.remove('hidden');
        } else {
            editorTitle.textContent = "JavaScript Editor";
            editorSub.innerHTML = "Available: <code>data[]</code>, <code>await swap(i,j)</code>";
            elEditor.classList.remove('hidden');
            gameOverlay.classList.add('hidden');
        }
        generateArray();
    });
});

btnAction1.addEventListener('click', () => handleGameDecision(1));
btnAction2.addEventListener('click', () => handleGameDecision(2));

imgModeCheck.addEventListener('change', (e) => {
    APP.isImageMode = e.target.checked;
    lblImgUpload.style.display = APP.isImageMode ? 'inline-block' : 'none';
    generateArray();
});

imgUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            APP.imgSrc = event.target.result;
            generateArray();
        };
        reader.readAsDataURL(file);
    }
});

// --- PIXEL MASTER MODULE ---
const pixelTool = document.getElementById('pixelTool');
const pixelBrushSize = document.getElementById('pixelBrushSize');
const pixelColor = document.getElementById('pixelColor');
const pixelUpload = document.getElementById('pixelUpload');
const btnPixelHeal = document.getElementById('btnPixelHeal');
const btnPixelScanHeal = document.getElementById('btnPixelScanHeal');
const btnPixelReset = document.getElementById('btnPixelReset');

function initPixelMaster() {
    pixelUpload.addEventListener('change', handlePixelUpload);
    btnPixelReset.addEventListener('click', resetPixelImage);
    btnPixelHeal.addEventListener('click', animatePixelHeal);
    btnPixelScanHeal.addEventListener('click', animatePixelScanHeal);
    pixelTool.addEventListener('change', (e) => APP.pixelTool = e.target.value);
    pixelBrushSize.addEventListener('input', (e) => APP.pixelBrushSize = parseInt(e.target.value));

    // Random Image Default
    loadRandomPixelImage();

    elPixelCanvas.addEventListener('mousedown', (e) => {
        APP.isMouseDown = true;
        updateLastMousePos(e);
        if (APP.pixelTool === 'mask') handlePixelClick(e);
    });

    elPixelCanvas.addEventListener('mousemove', (e) => {
        if (!APP.isMouseDown) return;

        const rect = elPixelCanvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) * (elPixelCanvas.width / rect.width));
        const y = Math.floor((e.clientY - rect.top) * (elPixelCanvas.height / rect.height));

        if (APP.pixelTool === 'smudge') {
            const dx = x - APP.lastMousePos.x;
            const dy = y - APP.lastMousePos.y;
            if (Math.hypot(dx, dy) > 1) {
                smudgePixels(x, y, dx, dy);
                updateLastMousePos(e);
            }
        } else if (APP.pixelTool === 'sand') {
            scatterSand(x, y);
        } else if (APP.pixelTool === 'sort') {
            pixelSort(x, y);
        }
    });
}

function updateLastMousePos(e) {
    const rect = elPixelCanvas.getBoundingClientRect();
    APP.lastMousePos.x = Math.floor((e.clientX - rect.left) * (elPixelCanvas.width / rect.width));
    APP.lastMousePos.y = Math.floor((e.clientY - rect.top) * (elPixelCanvas.height / rect.height));
}

function handlePixelUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const ctx = elPixelCanvas.getContext('2d');
            // Get parent size for fit
            const rect = elPixelCanvas.parentElement.getBoundingClientRect();
            const maxW = rect.width, maxH = rect.height - 40;

            const ratio = Math.min(maxW / img.width, maxH / img.height);
            const w = img.width * ratio, h = img.height * ratio;

            elPixelCanvas.width = w; elPixelCanvas.height = h;
            ctx.drawImage(img, 0, 0, w, h);
            APP.pixelOriginalData = ctx.getImageData(0, 0, w, h);
            setStatus(t('status_finished'));
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function resetPixelImage() {
    if (!APP.pixelOriginalData) return;
    const ctx = elPixelCanvas.getContext('2d');
    ctx.putImageData(APP.pixelOriginalData, 0, 0);
}

function handlePixelClick(e) {
    if (APP.module !== 'pixel' || !APP.pixelOriginalData || APP.pixelTool !== 'mask') return;
    const rect = elPixelCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (elPixelCanvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (elPixelCanvas.height / rect.height));

    const ctx = elPixelCanvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, elPixelCanvas.width, elPixelCanvas.height);
    const data = imageData.data;

    // Get target color
    const baseIdx = (y * elPixelCanvas.width + x) * 4;
    const tr = data[baseIdx], tg = data[baseIdx + 1], tb = data[baseIdx + 2], ta = data[baseIdx + 3];

    // Pick new color from picker
    const newHex = pixelColor.value;
    const r = parseInt(newHex.slice(1, 3), 16);
    const g = parseInt(newHex.slice(3, 5), 16);
    const b = parseInt(newHex.slice(5, 7), 16);

    // Tolerance (hardcoded for simplicity, can be adjusted)
    const tolerance = 20;

    // Global scan and action
    for (let i = 0; i < data.length; i += 4) {
        const dr = Math.abs(data[i] - tr);
        const dg = Math.abs(data[i + 1] - tg);
        const db = Math.abs(data[i + 2] - tb);
        const da = Math.abs(data[i + 3] - ta);

        if (dr <= tolerance && dg <= tolerance && db <= tolerance && da <= tolerance) {
            if (APP.pixelAction === 'remove') {
                data[i + 3] = 0; // Transparent
            } else {
                data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = 255;
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

function smudgePixels(centerX, centerY, dx, dy) {
    const ctx = elPixelCanvas.getContext('2d');
    const radius = APP.pixelBrushSize;
    const width = elPixelCanvas.width;
    const height = elPixelCanvas.height;

    // We pull high-res data to manipulate
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const copy = new Uint8ClampedArray(data);

    const r2 = radius * radius;

    for (let y = centerY - radius; y <= centerY + radius; y++) {
        for (let x = centerX - radius; x <= centerX + radius; x++) {
            if (x < 0 || x >= width || y < 0 || y >= height) continue;

            const dist2 = (x - centerX) ** 2 + (y - centerY) ** 2;
            if (dist2 < r2) {
                // Strength falls off towards the edge of the brush
                const strength = 1 - Math.sqrt(dist2) / radius;

                // Sample from the direction opposite to movement
                const sx = Math.round(x - dx * strength);
                const sy = Math.round(y - dy * strength);

                if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
                    const targetIdx = (y * width + x) * 4;
                    const sourceIdx = (sy * width + sx) * 4;

                    data[targetIdx] = copy[sourceIdx];
                    data[targetIdx + 1] = copy[sourceIdx + 1];
                    data[targetIdx + 2] = copy[sourceIdx + 2];
                    data[targetIdx + 3] = copy[sourceIdx + 3];
                }
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

function scatterSand(mx, my) {
    if (!APP.pixelOriginalData) return;
    const ctx = elPixelCanvas.getContext('2d');
    const radius = APP.pixelBrushSize;
    const density = 20; // Grains per move
    const origData = APP.pixelOriginalData.data;
    const w = elPixelCanvas.width;
    const h = elPixelCanvas.height;

    for (let i = 0; i < density; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * radius;
        const sx = Math.floor(mx + Math.cos(angle) * r);
        const sy = Math.floor(my + Math.sin(angle) * r);

        if (sx >= 0 && sx < w && sy >= 0 && sy < h) {
            // Pick color from the same location in the original image
            const idx = (sy * w + sx) * 4;
            const r = origData[idx], g = origData[idx + 1], b = origData[idx + 2], a = origData[idx + 3];

            // Draw a grain (slightly offset/scattered)
            ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
            ctx.fillRect(sx, sy, 2, 2);
        }
    }
}

function pixelSort(mx, my) {
    if (!APP.pixelOriginalData) return;
    const ctx = elPixelCanvas.getContext('2d');
    const width = elPixelCanvas.width;
    const height = elPixelCanvas.height;
    const radius = APP.pixelBrushSize;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Sort pixels in a vertical span around mx
    const startX = Math.max(0, mx - 2);
    const endX = Math.min(width - 1, mx + 2);

    for (let x = startX; x <= endX; x++) {
        const startY = Math.max(0, my - radius);
        const endY = Math.min(height - 1, my + radius);

        const pixels = [];
        for (let y = startY; y <= endY; y++) {
            const i = (y * width + x) * 4;
            pixels.push({
                r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3],
                lum: 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
            });
        }

        // Simple brightness sort
        pixels.sort((a, b) => a.lum - b.lum);

        for (let y = startY; y <= endY; y++) {
            const i = (y * width + x) * 4;
            const p = pixels[y - startY];
            data[i] = p.r; data[i + 1] = p.g; data[i + 2] = p.b; data[i + 3] = p.a;
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

function loadRandomPixelImage() {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Lowercase for safety
    img.onload = () => {
        const ctx = elPixelCanvas.getContext('2d');
        const rect = elPixelCanvas.parentElement.getBoundingClientRect();
        const maxW = rect.width || 800, maxH = (rect.height - 40) || 600;

        const ratio = Math.min(maxW / img.width, maxH / img.height);
        const w = img.width * ratio, h = img.height * ratio;

        elPixelCanvas.width = w; elPixelCanvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        APP.pixelOriginalData = ctx.getImageData(0, 0, w, h);
        setStatus(t('status_finished'));
    };
    img.onerror = () => {
        setStatus("Image failed to load");
    };
    // Use a specific image to avoid some picsum redirects that block CORS
    img.src = `https://picsum.photos/800/600?random=${Date.now()}`;
    setStatus(t('status_running'));
}

function animatePixelHeal() {
    if (APP.isRunning || !APP.pixelOriginalData) return;
    const ctx = elPixelCanvas.getContext('2d');
    const width = elPixelCanvas.width;
    const height = elPixelCanvas.height;

    const startData = ctx.getImageData(0, 0, width, height).data;
    const targetData = APP.pixelOriginalData.data;
    const currentImageData = ctx.createImageData(width, height);
    const currentData = currentImageData.data;

    APP.isRunning = true;
    const duration = 3000;
    const startTime = performance.now();

    function frame(time) {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Cubic Ease Out for a smoother/softer feel
        const ease = 1 - Math.pow(1 - progress, 3);

        for (let i = 0; i < startData.length; i++) {
            currentData[i] = startData[i] + (targetData[i] - startData[i]) * ease;
        }

        ctx.putImageData(currentImageData, 0, 0);

        if (progress < 1) {
            requestAnimationFrame(frame);
        } else {
            APP.isRunning = false;
            setStatus(t('status_finished'));
        }
    }

    setStatus(t('status_running'));
    requestAnimationFrame(frame);
}

function animatePixelScanHeal() {
    if (APP.isRunning || !APP.pixelOriginalData) return;
    const ctx = elPixelCanvas.getContext('2d');
    const width = elPixelCanvas.width, height = elPixelCanvas.height;
    const startData = ctx.getImageData(0, 0, width, height).data;
    const targetData = APP.pixelOriginalData.data;
    const currentImageData = ctx.createImageData(width, height);
    const currentData = currentImageData.data;

    APP.isRunning = true;
    const duration = 2500;
    const startTime = performance.now();

    function frame(time) {
        const elapsed = time - startTime;
        const globalProgress = Math.min(elapsed / duration, 1);

        for (let y = 0; y < height; y++) {
            // Sequential progress: pixels at the top finish first
            // Adjust the offset (1.5) and subtraction (y/height) for wave speed/feel
            const rowProgress = Math.min(Math.max(globalProgress * 2.0 - (y / height), 0), 1);
            const ease = 1 - Math.pow(1 - rowProgress, 3);

            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                currentData[i] = startData[i] + (targetData[i] - startData[i]) * ease;
                currentData[i + 1] = startData[i + 1] + (targetData[i + 1] - startData[i + 1]) * ease;
                currentData[i + 2] = startData[i + 2] + (targetData[i + 2] - startData[i + 2]) * ease;
                currentData[i + 3] = startData[i + 3] + (targetData[i + 3] - startData[i + 3]) * ease;
            }
        }

        ctx.putImageData(currentImageData, 0, 0);

        if (globalProgress < 1) {
            requestAnimationFrame(frame);
        } else {
            APP.isRunning = false;
            setStatus(t('status_finished'));
        }
    }

    setStatus(t('status_running'));
    requestAnimationFrame(frame);
}

// Start
init();
