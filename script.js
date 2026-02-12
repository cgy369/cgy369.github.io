// --- Configuration ---
const CONFIG = {
    arraySize: 20,
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
    gridSize: 20
};

// --- Translations ---
const TRANSLATIONS = {
    en: {
        tab_sorting: "Sorting",
        tab_pathfinding: "Pathfinding",
        label_mode: "Mode:",
        mode_code: "Code",
        mode_game: "Game",
        label_algo: "Algo:",
        opt_simple: "Simple (O(n²))",
        algo_bubble: "Bubble Sort",
        algo_selection: "Selection Sort",
        algo_insertion: "Insertion Sort",
        algo_cocktail: "Cocktail Shaker Sort",
        opt_efficient: "Efficient (O(n log n))",
        algo_quick: "Quick Sort",
        algo_merge: "Merge Sort",
        algo_heap: "Heap Sort",
        opt_curious: "Special / Fun",
        algo_radix: "Radix Sort (LSD)",
        algo_bogo: "Bogo Sort (The Worst)",
        opt_custom: "User Defined",
        algo_custom: "Custom Script",
        btn_shuffle: "Shuffle",
        btn_run: "Run",
        btn_stop: "Stop",
        label_size: "Size:",
        label_speed: "Speed:",
        label_img_mode: "Image Mode",
        btn_reset: "Reset",
        game_title: "Interactive Sort",
        game_instruction: "Select an algorithm and click Run to start!",
        pane_visualizer: "Visualizer",
        status_ready: "Ready",
        status_sorting: "Ready (Sorting)",
        status_image: "Ready (Image Sort)",
        status_running: "Running...",
        status_finished: "Finished!",
        status_stopped: "Stopped.",
        status_victory: "Victory!",
        editor_title_js: "JavaScript Editor",
        editor_sub_js: "Available: <code>data[]</code>, <code>await swap(i,j)</code>",
        editor_title_game: "Interactive Mode",
        editor_sub_game: "You are the CPU!",
        editor_title_pf: "JS Editor (Pathfinding)",
        editor_sub_pf: "Available: <code>startNode</code>, <code>endNode</code>",
        game_swap: "Swap",
        game_pass: "Pass",
        game_yes: "Yes",
        game_no: "No",
        msg_correct: "Correct!",
        msg_wrong: "Wrong!",
        prompt_bubble: "Compare <b>[{0}]</b> and <b>[{1}]</b>.<br>Should we swap?",
        prompt_bubble_img: "Is Left Image Slice > Right Image Slice? (Index {0} vs {1})",
        prompt_selection: "Check if Right is smaller?"
    },
    ko: {
        tab_sorting: "정렬 (Sorting)",
        tab_pathfinding: "길찾기 (Pathfinding)",
        label_mode: "모드:",
        mode_code: "코딩",
        mode_game: "게임",
        label_algo: "알고리즘:",
        opt_simple: "단순 정렬 (O(n²))",
        algo_bubble: "버블 정렬 (Bubble)",
        algo_selection: "선택 정렬 (Selection)",
        algo_insertion: "삽입 정렬 (Insertion)",
        algo_cocktail: "칵테일 정렬 (Cocktail)",
        opt_efficient: "효율적 정렬 (O(n log n))",
        algo_quick: "퀵 정렬 (Quick)",
        algo_merge: "병합 정렬 (Merge)",
        algo_heap: "힙 정렬 (Heap)",
        opt_curious: "특수 / 재미",
        algo_radix: "기수 정렬 (Radix)",
        algo_bogo: "보고 정렬 (운빨)",
        opt_custom: "사용자 정의",
        algo_custom: "커스텀 스크립트",
        btn_shuffle: "섞기",
        btn_run: "실행",
        btn_stop: "정지",
        label_size: "크기:",
        label_speed: "속도:",
        label_img_mode: "이미지 모드",
        btn_reset: "초기화",
        game_title: "인터랙티브 정렬",
        game_instruction: "알고리즘을 선택하고 실행을 눌러 시작하세요!",
        pane_visualizer: "시각화 (Visualizer)",
        status_ready: "준비",
        status_sorting: "준비 (정렬)",
        status_image: "준비 (이미지 정렬)",
        status_running: "실행 중...",
        status_finished: "완료!",
        status_stopped: "정지됨.",
        status_victory: "승리!",
        editor_title_js: "자바스크립트 에디터",
        editor_sub_js: "사용 가능: <code>data[]</code>, <code>await swap(i,j)</code>",
        editor_title_game: "인터랙티브 모드",
        editor_sub_game: "당신이 CPU가 되어 정렬해보세요!",
        editor_title_pf: "JS 에디터 (길찾기)",
        editor_sub_pf: "사용 가능: <code>startNode</code>, <code>endNode</code>",
        game_swap: "교환 (Swap)",
        game_pass: "패스 (Pass)",
        game_yes: "네",
        game_no: "아니요",
        msg_correct: "정답입니다!",
        msg_wrong: "틀렸습니다!",
        prompt_bubble: "<b>[{0}]</b> 값과 <b>[{1}]</b> 값을 비교하세요.<br>교환해야 할까요?",
        prompt_bubble_img: "왼쪽 이미지가 오른쪽보다 큰가요? (인덱스 {0} vs {1})",
        prompt_selection: "오른쪽 값이 현재 최솟값보다 작은가요?"
    }
};

// --- Global State ---
const APP = {
    module: 'sorting', // 'sorting' | 'pathfinding'
    isRunning: false,
    shouldStop: false,
    delayMs: 50,
    lang: 'ko', // Default language

    // Sorting State
    sortMode: 'code', // 'code' | 'game'
    sortData: [],

    // Image Mode State
    isImageMode: false,
    imgSrc: 'https://picsum.photos/800/600',

    // Pathfinding State
    pfMode: 'code', // 'code' | 'game'
    grid: [],
    pfStart: { r: 2, c: 2 },
    pfEnd: { r: 17, c: 17 },
    isMousePressed: false,
    isDraggingStart: false,
    isDraggingEnd: false,
    pfResolvers: null
};

// --- DOM Elements ---
// Shared
const elEditor = document.getElementById('codeEditor');
const elStatus = document.getElementById('statusText');
const tabs = document.querySelectorAll('.tab-btn');
const langSelect = document.getElementById('langSelect');

// Sorting
const elViz = document.getElementById('visualizerContainer');
const controlsSorting = document.getElementById('controls_sorting');
const btnRun = document.getElementById('btnRun');
const btnStop = document.getElementById('btnStop');
const btnGenerate = document.getElementById('btnGenerate');
const speedRange = document.getElementById('speedRange');
const sizeRange = document.getElementById('sizeRange');
const algoSelect = document.getElementById('algoSelect');
const modeRadios = document.getElementsByName('appMode');
const imgModeCheck = document.getElementById('imgModeCheck');
const imgUpload = document.getElementById('imgUpload');

// Pathfinding
const elGrid = document.getElementById('gridContainer');
const controlsPathfinding = document.getElementById('controls_pathfinding');
const btnPfRun = document.getElementById('btnPfRun');
const btnPfStop = document.getElementById('btnPfStop');
const btnPfReset = document.getElementById('btnPfReset');
const pfAlgoSelect = document.getElementById('pfAlgoSelect');

// Game UI (Shared)
const gameOverlay = document.getElementById('gameOverlay');
const gameControls = document.getElementById('gameControls');
const stepDesc = document.getElementById('stepDesc');
const btnAction1 = document.getElementById('btnAction1');
const btnAction2 = document.getElementById('btnAction2');
const feedbackMsg = document.getElementById('feedbackMsg');
const gameInstruction = document.getElementById('gameInstruction');
const editorTitle = document.getElementById('editorTitle');
const editorSub = document.getElementById('editorSub');
const vizTitle = document.getElementById('vizTitle');

// --- Helper Functions ---
function t(key) {
    return TRANSLATIONS[APP.lang][key] || key;
}

function updateText() {
    // Static Elements via IDs (Mapping ID -> Key)
    // Would be better with data-i18n, but let's manual map for now if data-i18n is partial
    // Or iterate data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (TRANSLATIONS[APP.lang][key]) {
            el.textContent = TRANSLATIONS[APP.lang][key];
        }
    });

    // Also optgroups
    document.querySelectorAll('optgroup[data-i18n-label]').forEach(el => {
        const key = el.getAttribute('data-i18n-label');
        if (TRANSLATIONS[APP.lang][key]) {
            el.label = TRANSLATIONS[APP.lang][key];
        }
    });

    // Update dynamic texts
    updateEditorHeader();
    if (APP.module === 'sorting') {
        setStatus(APP.isImageMode ? t('status_image') + ` - Size: ${APP.sortData.length}` : t('status_sorting') + ` - Size: ${APP.sortData.length}`);
    } else {
        setStatus(t('status_ready'));
    }
}

function setStatus(msg) {
    elStatus.textContent = msg;
}

// --- Presets (Code) ---
const SORT_PRESETS = {
    bubble: `// Bubble Sort
for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data.length - i - 1; j++) {
        if (data[j] > data[j + 1]) {
            await swap(j, j + 1);
        }
    }
}`,
    selection: `// Selection Sort
for (let i = 0; i < data.length; i++) {
    let minIdx = i;
    for (let j = i + 1; j < data.length; j++) {
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
        await swap(j, j - 1);
        j--;
    }
}`,
    quick: `// Quick Sort
async function partition(low, high) {
    let pivot = data[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
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
        if (L[i] <= R[j]) {
            data[k] = L[i];
            i++;
        } else {
            data[k] = R[j];
            j++;
        }
        renderArray([k], CONFIG.colors.active); 
        await sleep(APP.delayMs);
        k++;
    }

    while (i < n1) {
        data[k] = L[i];
        renderArray([k], CONFIG.colors.active);
        await sleep(APP.delayMs);
        i++; k++;
    }
    while (j < n2) {
        data[k] = R[j];
        renderArray([k], CONFIG.colors.active);
        await sleep(APP.delayMs);
        j++; k++;
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

    heap: `// Heap Sort
async function heapify(n, i) {
    let largest = i;
    let l = 2 * i + 1;
    let r = 2 * i + 2;

    if (l < n && data[l] > data[largest]) largest = l;
    if (r < n && data[r] > data[largest]) largest = r;

    if (largest !== i) {
        await swap(i, largest);
        await heapify(n, largest);
    }
}

let n = data.length;
for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    await heapify(n, i);
}

for (let i = n - 1; i > 0; i--) {
    await swap(0, i);
    await heapify(i, 0);
}`,

    cocktail: `// Cocktail Shaker Sort
let swapped = true;
let start = 0;
let end = data.length;

while (swapped) {
    swapped = false;
    for (let i = start; i < end - 1; ++i) {
        if (data[i] > data[i + 1]) {
            await swap(i, i + 1);
            swapped = true;
        }
    }
    if (!swapped) break;
    swapped = false;
    end--;

    for (let i = end - 1; i >= start; i--) {
        if (data[i] > data[i + 1]) {
            await swap(i, i + 1);
            swapped = true;
        }
    }
    start++;
}`,

    radix: `// Radix Sort (LSD)
async function getMax() {
    let mx = data[0];
    for (let i = 1; i < data.length; i++)
        if (data[i] > mx) mx = data[i];
    return mx;
}

async function countSort(exp) {
    let output = new Array(data.length).fill(0);
    let count = new Array(10).fill(0);

    for (let i = 0; i < data.length; i++) {
        let index = Math.floor(data[i] / exp) % 10;
        count[index]++;
    }

    for (let i = 1; i < 10; i++) count[i] += count[i - 1];

    for (let i = data.length - 1; i >= 0; i--) {
        let index = Math.floor(data[i] / exp) % 10;
        output[count[index] - 1] = data[i];
        count[index]--;
    }

    for (let i = 0; i < data.length; i++) {
        data[i] = output[i];
        renderArray([i], CONFIG.colors.active);
        await sleep(APP.delayMs);
    }
}

let m = await getMax();
for (let exp = 1; Math.floor(m / exp) > 0; exp *= 10) {
    await countSort(exp);
}`,

    bogo: `// Bogo Sort (WARNING: Very Slow)
function isSorted() {
    for(let i=0; i<data.length-1; i++){
        if(data[i] > data[i+1]) return false;
    }
    return true;
}

while(!isSorted()) {
    // Visualize the shuffle
    for (let i = data.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        await swap(i, j);
    }
}`,
    custom: `// Writes your own sort!
// data 배열을 직접 변경하면 정렬이 적용됩니다. (Sorting is applied when you modify 'data')
// 시각화를 원하시면 await swap(i, j)를 사용하세요. (Use await swap(i, j) for visualization)
`
};

const PF_PRESETS = {
    bfs: `// Breadth-First Search
const queue = [startNode];
const visited = new Set();
visited.add(startNode.id);

while(queue.length > 0) {
    const current = queue.shift();
    if(current.id === endNode.id) break;
    
    await visit(current); // Visual effect
    
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
    dfs: `// Depth-First Search
const stack = [startNode];
const visited = new Set();
// visited.add(startNode.id);

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
class PriorityQueue {
    constructor() { this.items = []; }
    enqueue(element, priority) {
        const qElement = { element, priority };
        let added = false;
        for (let i = 0; i < this.items.length; i++) {
            if (qElement.priority < this.items[i].priority) {
                this.items.splice(i, 0, qElement);
                added = true;
                break;
            }
        }
        if (!added) this.items.push(qElement);
    }
    dequeue() { return this.items.shift(); }
    isEmpty() { return this.items.length === 0; }
}

const openSet = new PriorityQueue();
openSet.enqueue(startNode, 0);
const cameFrom = new Map();
const gScore = new Map();
const fScore = new Map();

gScore.set(startNode.id, 0);
fScore.set(startNode.id, heuristic(startNode, endNode));
const visited = new Set();

function heuristic(a, b) {
    return Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
}

while (!openSet.isEmpty()) {
    const currentObj = openSet.dequeue();
    const current = currentObj.element;

    if (current.id === endNode.id) {
        await reconstructionPath(endNode, cameFrom);
        break;
    }

    if (!visited.has(current.id)) {
        visited.add(current.id);
        await visit(current);

        const neighbors = getNeighbors(current);
        for (let neighbor of neighbors) {
            const tempG = gScore.get(current.id) + 1; 
            if (tempG < (gScore.get(neighbor.id) || Infinity)) {
                cameFrom.set(neighbor.id, current);
                gScore.set(neighbor.id, tempG);
                fScore.set(neighbor.id, tempG + heuristic(neighbor, endNode));
                openSet.enqueue(neighbor, fScore.get(neighbor.id));
            }
        }
    }
}`
};

// --- HELPERS ---
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// --- INIT & TABS ---
function init() {
    // Generate Sorting Data
    generateArray();
    // Generate Grid
    generateGrid();
    // Default View
    switchModule('sorting');
    // Default Language
    updateText();
}

function switchModule(modName) {
    APP.module = modName;
    tabs.forEach(t => {
        if (t.dataset.module === modName) t.classList.add('active');
        else t.classList.remove('active');
    });

    if (modName === 'sorting') {
        elViz.classList.remove('hidden');
        elGrid.classList.add('hidden');
        controlsSorting.classList.remove('hidden');
        controlsPathfinding.classList.add('hidden');
        updateEditorHeader();
        elEditor.value = SORT_PRESETS[algoSelect.value];
    } else {
        elViz.classList.add('hidden');
        elGrid.classList.remove('hidden');
        controlsSorting.classList.add('hidden');
        controlsPathfinding.classList.remove('hidden');
        updateEditorHeader();
        elEditor.value = PF_PRESETS[pfAlgoSelect.value] || "";
    }
}

function updateEditorHeader() {
    if (APP.module === 'sorting') {
        if (APP.sortMode === 'game') {
            editorTitle.textContent = t('editor_title_game');
            editorSub.textContent = t('editor_sub_game');
        } else {
            editorTitle.textContent = t('editor_title_js');
            editorSub.innerHTML = t('editor_sub_js');
        }
    } else {
        editorTitle.textContent = t('editor_title_pf');
        editorSub.innerHTML = t('editor_sub_pf');
    }
}

tabs.forEach(t => t.addEventListener('click', () => switchModule(t.dataset.module)));

// Language Toggle
langSelect.addEventListener('change', (e) => {
    APP.lang = e.target.value;
    updateText();
});

// ==========================================
// MODULE: SORTING
// ==========================================

function generateArray() {
    APP.sortData = [];
    const el = document.getElementById('sizeRange');
    const sliderVal = el ? parseInt(el.value) : CONFIG.arraySize;
    console.log("Generating Array. Size:", sliderVal);
    const size = sliderVal;

    if (APP.isImageMode) {
        for (let i = 0; i < size; i++) APP.sortData.push(i);
        for (let i = size - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [APP.sortData[i], APP.sortData[j]] = [APP.sortData[j], APP.sortData[i]];
        }
        setStatus(t('status_image') + ` - Size: ${size}`);
    } else {
        for (let i = 0; i < size; i++) {
            APP.sortData.push(Math.floor(Math.random() * (CONFIG.maxVal - CONFIG.minVal + 1)) + CONFIG.minVal);
        }
        setStatus(t('status_sorting') + ` - Size: ${size}`);
    }

    renderArray();
}

function renderArray(activeIndices = [], specialColor = null) {
    elViz.innerHTML = '';
    const n = APP.sortData.length;
    const useMargin = n <= 60;
    const widthPercent = 100 / n;

    APP.sortData.forEach((val, idx) => {
        const bar = document.createElement('div');
        bar.className = 'bar';

        if (APP.isImageMode) {
            // Image Mode Rendering with Flexbox Fix
            bar.style.height = '100%';
            bar.style.width = 'auto'; // let flex handle it
            bar.style.flex = '1 1 0%'; // Grow evenly

            bar.style.backgroundImage = `url('${APP.imgSrc}')`;
            bar.style.backgroundSize = `${n * 100}% 100%`;

            const posP = n > 1 ? (val / (n - 1)) * 100 : 0;
            bar.style.backgroundPosition = `${posP}% 0`;

            bar.style.backgroundColor = 'transparent';
            bar.style.border = 'none';
            bar.style.borderRadius = '0';
            bar.style.margin = '0'; // No gaps
        } else {
            // Standard Mode
            bar.style.width = `${widthPercent}%`;
            bar.style.height = `${val}%`;
            bar.style.backgroundImage = 'none';
            bar.style.backgroundColor = varCss('--bar-default');

            // Optimization
            if (!useMargin) {
                bar.style.margin = '0';
                bar.style.borderTopLeftRadius = '0';
                bar.style.borderTopRightRadius = '0';
            }

            if (APP.sortMode === 'game' && n <= 40) {
                bar.textContent = val;
                bar.style.color = '#fff';
                bar.style.fontSize = '10px';
                bar.style.display = 'flex';
                bar.style.alignItems = 'flex-end';
                bar.style.justifyContent = 'center';
            }
        }

        if (activeIndices.includes(idx)) {
            if (APP.isImageMode) {
                bar.style.opacity = '0.7';
                bar.style.filter = 'brightness(1.5)';
            } else {
                bar.classList.add('active');
                if (specialColor) bar.style.backgroundColor = specialColor;
            }
        }

        elViz.appendChild(bar);
    });
}

function varCss(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// User Code Execution (Sorting)
async function swap(i, j) {
    if (APP.shouldStop) throw new Error('Stopped by user');
    let temp = APP.sortData[i];
    APP.sortData[i] = APP.sortData[j];
    APP.sortData[j] = temp;
    renderArray([i, j]);
    await sleep(APP.delayMs);
}

async function runSortingCode() {
    if (APP.isRunning) return;
    const code = elEditor.value;
    APP.isRunning = true;
    APP.shouldStop = false;
    toggleControls(false);
    setStatus(t('status_running'));

    try {
        const userFunc = new Function('data', 'swap', 'renderArray', 'CONFIG', 'APP', `return (async () => { ${code} })()`);
        await userFunc(APP.sortData, swap, renderArray, CONFIG, APP);
        renderArray();
        setStatus(t('status_finished'));
    } catch (e) {
        if (e.message === 'Stopped by user') setStatus(t('status_stopped'));
        else { console.error(e); alert(e); }
    } finally {
        APP.isRunning = false;
        toggleControls(true);
    }
}

// ==========================================
// INTERACTIVE MODE (SORTING)
// ==========================================
function waitForDecision(prompt, btn1Text, btn2Text, validator) {
    return new Promise((resolve, reject) => {
        if (APP.shouldStop) { reject(new Error('Stopped by user')); return; }

        stepDesc.innerHTML = prompt;
        btnAction1.textContent = btn1Text;
        btnAction2.textContent = btn2Text;
        feedbackMsg.textContent = '';
        feedbackMsg.className = 'feedback';

        gameControls.classList.remove('hidden');
        gameControls.style.display = 'block';
        APP.pfResolvers = { resolve, reject, validator };
    });
}

async function handleGameDecision(choiceIdx) {
    if (!APP.pfResolvers) return;
    const { resolve, validator } = APP.pfResolvers;

    const result = validator(choiceIdx);
    if (result.correct) {
        feedbackMsg.textContent = t('msg_correct') + " " + (result.message || "");
        feedbackMsg.classList.add('correct');
        APP.pfResolvers = null;

        if (result.action) await result.action();
        await sleep(300);

        gameControls.classList.add('hidden');
        gameControls.style.display = 'none';
        resolve(true);
    } else {
        feedbackMsg.textContent = t('msg_wrong') + " " + (result.message || "");
        feedbackMsg.classList.add('wrong');
        setTimeout(() => feedbackMsg.classList.remove('wrong'), 500);
    }
}

async function interactiveBubbleSort() {
    for (let i = 0; i < APP.sortData.length; i++) {
        for (let j = 0; j < APP.sortData.length - i - 1; j++) {
            renderArray([j, j + 1], CONFIG.colors.compare);
            const valA = APP.sortData[j];
            const valB = APP.sortData[j + 1];
            const shouldSwap = valA > valB;

            let prompt = "";
            if (APP.isImageMode) {
                prompt = t('prompt_bubble_img').replace('{0}', valA).replace('{1}', valB);
            } else {
                prompt = t('prompt_bubble').replace('{0}', valA).replace('{1}', valB);
            }

            await waitForDecision(
                prompt, t('game_swap'), t('game_pass'),
                (choice) => {
                    if (choice === 1 && shouldSwap) return { correct: true, action: async () => await swap(j, j + 1) };
                    if (choice === 2 && !shouldSwap) return { correct: true };
                    return { correct: false, message: "" };
                }
            );
        }
    }
}

async function interactiveSelectionSort() {
    for (let i = 0; i < APP.sortData.length; i++) {
        let minIdx = i;
        renderArray([i], CONFIG.colors.active);
        for (let j = i + 1; j < APP.sortData.length; j++) {
            renderArray([minIdx, j], CONFIG.colors.compare);
            const currentMin = APP.sortData[minIdx];
            const compareVal = APP.sortData[j];
            const isSmaller = compareVal < currentMin;

            await waitForDecision(
                t('prompt_selection'),
                t('game_yes'), t('game_no'),
                (choice) => {
                    if (choice === 1 && isSmaller) { minIdx = j; return { correct: true }; }
                    if (choice === 2 && !isSmaller) return { correct: true };
                    return { correct: false };
                }
            );
        }
        if (minIdx !== i) await swap(i, minIdx);
    }
}

async function runGame() {
    if (APP.isRunning) return;
    APP.isRunning = true;
    APP.shouldStop = false;
    toggleControls(false);
    setStatus(t('status_running'));

    const algo = algoSelect.value;
    try {
        if (algo === 'bubble') await interactiveBubbleSort();
        else if (algo === 'selection') await interactiveSelectionSort();
        else await interactiveBubbleSort();

        renderArray([], CONFIG.colors.sorted);
        setStatus(t('status_victory'));
    } catch (e) {
        if (e.message === 'Stopped by user') setStatus(t('status_stopped'));
        else { console.error(e); }
    } finally {
        APP.isRunning = false;
        gameControls.classList.add('hidden');
        gameControls.style.display = 'none';
        toggleControls(true);
    }
}


// ==========================================
// MODULE: PATHFINDING (Kept the same)
// ==========================================

function generateGrid() {
    elGrid.innerHTML = '';
    elGrid.style.gridTemplateColumns = `repeat(${CONFIG.gridSize}, 1fr)`;
    APP.grid = [];
    for (let r = 0; r < CONFIG.gridSize; r++) {
        let row = [];
        for (let c = 0; c < CONFIG.gridSize; c++) {
            let node = { id: `${r}-${c}`, r, c, isWall: false, div: null };
            const div = document.createElement('div');
            div.className = 'node';
            div.dataset.r = r;
            div.dataset.c = c;
            div.addEventListener('mousedown', (e) => {
                e.preventDefault();
                const isStart = (r === APP.pfStart.r && c === APP.pfStart.c);
                const isEnd = (r === APP.pfEnd.r && c === APP.pfEnd.c);
                if (isStart) APP.isDraggingStart = true;
                else if (isEnd) APP.isDraggingEnd = true;
                else { APP.isMousePressed = true; toggleWall(node); }
            });
            div.addEventListener('mouseenter', () => {
                if (APP.isDraggingStart) { if (!node.isWall && !(node.r === APP.pfEnd.r && node.c === APP.pfEnd.c)) updateStartNode(node.r, node.c); }
                else if (APP.isDraggingEnd) { if (!node.isWall && !(node.r === APP.pfStart.r && node.c === APP.pfStart.c)) updateEndNode(node.r, node.c); }
                else if (APP.isMousePressed) toggleWall(node);
            });
            node.div = div;
            elGrid.appendChild(div);
            row.push(node);
        }
        APP.grid.push(row);
    }
    updateStartNode(APP.pfStart.r, APP.pfStart.c, true);
    updateEndNode(APP.pfEnd.r, APP.pfEnd.c, true);
}
function updateStartNode(r, c, force = false) {
    if (!force) APP.grid[APP.pfStart.r][APP.pfStart.c].div.classList.remove('start');
    APP.pfStart = { r, c };
    APP.grid[r][c].div.classList.add('start');
    APP.grid[r][c].div.classList.remove('wall');
    APP.grid[r][c].isWall = false;
}
function updateEndNode(r, c, force = false) {
    if (!force) APP.grid[APP.pfEnd.r][APP.pfEnd.c].div.classList.remove('end');
    APP.pfEnd = { r, c };
    APP.grid[r][c].div.classList.add('end');
    APP.grid[r][c].div.classList.remove('wall');
    APP.grid[r][c].isWall = false;
}
function toggleWall(node) {
    if ((node.r === APP.pfStart.r && node.c === APP.pfStart.c) || (node.r === APP.pfEnd.r && node.c === APP.pfEnd.c)) return;
    node.isWall = !node.isWall;
    if (node.isWall) node.div.classList.add('wall'); else node.div.classList.remove('wall');
}
document.addEventListener('mouseup', () => { APP.isMousePressed = false; APP.isDraggingStart = false; APP.isDraggingEnd = false; });
function getNeighbors(node) {
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const neighbors = [];
    for (let d of dirs) {
        const nr = node.r + d[0]; const nc = node.c + d[1];
        if (nr >= 0 && nr < CONFIG.gridSize && nc >= 0 && nc < CONFIG.gridSize) {
            const n = APP.grid[nr][nc]; if (!n.isWall) neighbors.push(n);
        }
    }
    return neighbors;
}
async function visit(node) {
    if (APP.shouldStop) throw new Error('Stopped by user');
    if (node.div.classList.contains('start') || node.div.classList.contains('end')) return;
    if (!node.div.classList.contains('visited')) { node.div.classList.add('visited'); await sleep(APP.delayMs); }
}
async function reconstructionPath(endNode, cameFromMap) {
    if (cameFromMap) {
        let currentKey = endNode.id;
        while (cameFromMap.has(currentKey)) {
            if (APP.shouldStop) throw new Error('Stopped by user');
            const parentObj = cameFromMap.get(currentKey);
            if (parentObj.id === APP.pfStart.id) break;
            if (parentObj.div) { parentObj.div.classList.remove('visited'); parentObj.div.classList.add('path'); currentKey = parentObj.id; await sleep(50); } else break;
        }
        return;
    }
    let curr = endNode.parent;
    while (curr && curr.parent) {
        if (APP.shouldStop) throw new Error('Stopped by user');
        if (curr.id === APP.pfStart.id) break;
        curr.div.classList.remove('visited'); curr.div.classList.add('path');
        curr = curr.parent; await sleep(50);
    }
}
async function runPathfindingCode() {
    if (APP.isRunning) return;
    const code = elEditor.value;
    APP.isRunning = true; APP.shouldStop = false; toggleControls(false); setStatus(t('status_running'));
    APP.grid.forEach(row => row.forEach(n => { n.div.classList.remove('visited', 'path'); n.parent = null; }));
    try {
        const startNode = APP.grid[APP.pfStart.r][APP.pfStart.c];
        const endNode = APP.grid[APP.pfEnd.r][APP.pfEnd.c];
        const userFunc = new Function('startNode', 'endNode', 'getNeighbors', 'visit', 'reconstructionPath', `return (async () => { ${code} })()`);
        await userFunc(startNode, endNode, getNeighbors, visit, reconstructionPath);
        setStatus(t('status_finished'));
    } catch (e) { if (e.message === 'Stopped by user') setStatus(t('status_stopped')); else { console.error(e); alert(e.message); } } finally { APP.isRunning = false; toggleControls(true); }
}

// ==========================================
// SHARED UI LOGIC
// ==========================================

function toggleControls(enable) {
    const btns = [btnRun, btnGenerate, algoSelect, btnPfRun, btnPfReset, pfAlgoSelect, ...tabs];
    btns.forEach(b => b.disabled = !enable);
    modeRadios.forEach(r => r.disabled = !enable);
    imgModeCheck.disabled = !enable;

    if (APP.module === 'sorting') btnStop.disabled = enable;
    else btnPfStop.disabled = enable;
}

function handleStop() {
    if (APP.isRunning) {
        APP.shouldStop = true;
        if (APP.pfResolvers) {
            APP.pfResolvers.reject(new Error('Stopped by user'));
            APP.pfResolvers = null;
            gameControls.classList.add('hidden');
            gameControls.style.display = 'none';
        }
    }
}

// Event Listeners (Sorting)
btnRun.addEventListener('click', () => {
    if (APP.sortMode === 'code') runSortingCode();
    else runGame();
});

btnGenerate.addEventListener('click', generateArray);
btnStop.addEventListener('click', handleStop);

imgModeCheck.addEventListener('change', (e) => {
    APP.isImageMode = e.target.checked;
    if (APP.isImageMode) {
        imgUpload.classList.remove('hidden');
        elStatus.textContent = t('status_image');
    } else {
        imgUpload.classList.add('hidden');
    }
    generateArray();
});

imgUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (evt) {
            APP.imgSrc = evt.target.result;
            generateArray();
        };
        reader.readAsDataURL(file);
    }
});

modeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        APP.sortMode = e.target.value;
        if (APP.isRunning) handleStop();

        if (APP.sortMode === 'game') {
            elEditor.style.display = 'none';
            gameOverlay.classList.remove('hidden');
            btnRun.textContent = t('game_title'); // Or just Start
            updateEditorHeader();
            generateArray();
        } else {
            elEditor.style.display = 'block';
            gameOverlay.classList.add('hidden');
            btnRun.textContent = t('btn_run');
            updateEditorHeader();
            generateArray();
        }
    });
});
algoSelect.addEventListener('change', () => {
    if (APP.sortMode === 'code') {
        elEditor.value = SORT_PRESETS[algoSelect.value];
    }
});


// Event Listeners (Pathfinding)
btnPfRun.addEventListener('click', runPathfindingCode);
btnPfReset.addEventListener('click', () => {
    generateGrid();
});
btnPfStop.addEventListener('click', handleStop);
pfAlgoSelect.addEventListener('change', (e) => {
    if (APP.pfMode === 'code') elEditor.value = PF_PRESETS[e.target.value];
});

// Game Action Buttons
btnAction1.addEventListener('click', () => handleGameDecision(1));
btnAction2.addEventListener('click', () => handleGameDecision(2));

speedRange.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    APP.delayMs = 200 - (val * 1.9);
});
sizeRange.addEventListener('input', generateArray);

// Boot
init();
