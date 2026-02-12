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

// --- Global State ---
const APP = {
    module: 'sorting', // 'sorting' | 'pathfinding'
    isRunning: false,
    shouldStop: false,
    delayMs: 50,
    // Sorting State
    sortMode: 'code', // 'code' | 'game'
    sortData: [],
    // Image Mode State
    isImageMode: false,
    imgSrc: 'https://picsum.photos/800/600', // Default image
    // Pathfinding State
    pfMode: 'code', // 'code' | 'game'
    grid: [], // 20x20 array of node objects
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
const pfModeRadios = document.getElementsByName('pfAppMode');

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

// --- Presets ---
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
        // Visualizing comparison requires accessing data[k], 
        // but we are overwriting it. We just simulate swap-like delay.
        if (L[i] <= R[j]) {
            data[k] = L[i];
            i++;
        } else {
            data[k] = R[j];
            j++;
        }
        // Force update visualization for index k
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
// visited.add(startNode.id); // Typically tracking on pop or push

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
// Priority Queue Helper
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

// Heuristic: Manhattan Distance
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
            const tempG = gScore.get(current.id) + 1; // Assuming weight 1
            if (tempG < (gScore.get(neighbor.id) || Infinity)) {
                cameFrom.set(neighbor.id, current);
                gScore.set(neighbor.id, tempG);
                fScore.set(neighbor.id, tempG + heuristic(neighbor, endNode));
                
                openSet.enqueue(neighbor, fScore.get(neighbor.id));
                // neighbor.parent = current; // Not strictly needed with cameFrom map, but useful for debug
            }
        }
    }
}`
};

// --- HELPERS ---
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function setStatus(msg) {
    elStatus.textContent = msg;
}

// --- INIT & TABS ---
function init() {
    // Generate Sorting Data
    generateArray();

    // Generate Grid
    generateGrid();

    // Default View
    switchModule('sorting');
}

function switchModule(modName) {
    APP.module = modName;

    // Toggle Tabs
    tabs.forEach(t => {
        if (t.dataset.module === modName) t.classList.add('active');
        else t.classList.remove('active');
    });

    // Toggle Containers & Controls
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
        editorTitle.textContent = "JS Editor (Pathfinding)";
        editorSub.innerHTML = "Available: <code>startNode</code>, <code>endNode</code>, <code>getNeighbors(node)</code>, <code>await visit(node)</code>";
        elEditor.value = PF_PRESETS[pfAlgoSelect.value];
    }
}

function updateEditorHeader() {
    if (APP.sortMode === 'game') {
        editorTitle.textContent = "Interactive Mode";
        editorSub.textContent = "You are the CPU!";
    } else {
        editorTitle.textContent = "JavaScript Editor";
        editorSub.innerHTML = "Available: <code>data[]</code>, <code>await swap(i,j)</code>";
    }
}

tabs.forEach(t => t.addEventListener('click', () => switchModule(t.dataset.module)));


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
        // Generate Permutation 0 to Size-1
        for (let i = 0; i < size; i++) APP.sortData.push(i);
        // Shuffle (Fisher-Yates)
        for (let i = size - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [APP.sortData[i], APP.sortData[j]] = [APP.sortData[j], APP.sortData[i]];
        }
        setStatus(`Ready (Image Sort) - Size: ${size}`);
    } else {
        for (let i = 0; i < size; i++) {
            APP.sortData.push(Math.floor(Math.random() * (CONFIG.maxVal - CONFIG.minVal + 1)) + CONFIG.minVal);
        }
        setStatus(`Ready (Sorting) - Size: ${size}`);
    }

    renderArray();
}

function renderArray(activeIndices = [], specialColor = null) {
    elViz.innerHTML = '';
    const n = APP.sortData.length;
    const widthPercent = 100 / n;

    APP.sortData.forEach((val, idx) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.width = `${widthPercent}%`;

        if (APP.isImageMode) {
            // Image Mode Rendering
            bar.style.height = '100%'; // Full height
            bar.style.backgroundImage = `url('${APP.imgSrc}')`;
            bar.style.backgroundSize = `${n * 100}% 100%`; // IMPORTANT: Slices
            // Calculate Position:
            // If sorted index is 'val' (0..n-1)
            // Position should be: (val / (n-1)) * 100% ... wait, background-position % is tricky.
            // When bg-size is huge, percentage pos aligns [point on img] with [point on container].
            // Easier to use Pixels or calculated per-slice offset.

            // Using logic: position X = - (val * sliceWidth).
            // But logic must work responsively.
            // Let's try simplified approach:

            // bg-size: (n * 100)%
            // slice width = 100% (of bar)
            // offset = val * 100% (of bar)
            // background-position-x: calc(val * -100%) ? No, bg pos relative to image?

            // Correct Math for Sprite Sheets/Slices using percentages:
            // background-position: (index / (total - 1)) * 100%;
            // Here 'index' is 'val' (the target position)
            // 'total' is n
            const posP = n > 1 ? (val / (n - 1)) * 100 : 0;
            bar.style.backgroundPosition = `${posP}% 0`;

            bar.style.backgroundColor = 'transparent';
            bar.style.border = 'none';
            bar.style.borderRadius = '0';
        } else {
            // Standard Mode
            bar.style.height = `${val}%`;
            bar.style.backgroundImage = 'none';
            bar.style.backgroundColor = varCss('--bar-default'); // Needs helper
            bar.style.borderTopLeftRadius = '4px';
            bar.style.borderTopRightRadius = '4px';

            if (APP.sortMode === 'game') {
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
                // Just use opacity or border to highlight
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
    setStatus('Running Sorting...');

    try {
        const userFunc = new Function('data', 'swap', 'renderArray', 'CONFIG', 'APP', `return (async () => { ${code} })()`);
        await userFunc(APP.sortData, swap, renderArray, CONFIG, APP);
        renderArray();
        setStatus('Finished!');
    } catch (e) {
        if (e.message === 'Stopped by user') setStatus('Stopped.');
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

        // Hide overlay text if image Mode? No, we still need controls.
        // But maybe move it?

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
        feedbackMsg.textContent = "Correct! " + (result.message || "");
        feedbackMsg.classList.add('correct');
        APP.pfResolvers = null;

        if (result.action) await result.action();
        await sleep(300);

        gameControls.classList.add('hidden');
        gameControls.style.display = 'none';
        resolve(true);
    } else {
        feedbackMsg.textContent = "Wrong! " + (result.message || "");
        feedbackMsg.classList.add('wrong');
        setTimeout(() => feedbackMsg.classList.remove('wrong'), 500);
    }
}

// Algorithms (Interactive)
async function interactiveBubbleSort() {
    for (let i = 0; i < APP.sortData.length; i++) {
        for (let j = 0; j < APP.sortData.length - i - 1; j++) {
            renderArray([j, j + 1], CONFIG.colors.compare);
            const valA = APP.sortData[j];
            const valB = APP.sortData[j + 1];
            const shouldSwap = valA > valB;

            // In Image mode, values are indices (0..N). Comparison is still valid.
            const prompt = APP.isImageMode
                ? `Is Left Image Slice > Right Image Slice? (Index ${valA} vs ${valB})`
                : `Compare <b>[${valA}]</b> and <b>[${valB}]</b>.<br>Should we swap?`;

            await waitForDecision(
                prompt, "Swap", "Pass",
                (choice) => {
                    if (choice === 1 && shouldSwap) return { correct: true, action: async () => await swap(j, j + 1) };
                    if (choice === 2 && !shouldSwap) return { correct: true };
                    return { correct: false, message: "Wrong decision." };
                }
            );
        }
    }
}

// ... Using existing logic for others, they use values.
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
                `Check if Right is smaller?`,
                "Yes", "No",
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
// Placeholder for others... logic is same.

async function runGame() {
    if (APP.isRunning) return;
    APP.isRunning = true;
    APP.shouldStop = false;
    toggleControls(false);
    setStatus('Game Started!');

    // In Image Mode, hide textual prompts/values? 
    // They are hidden in renderArray by default for image mode.

    const algo = algoSelect.value;
    try {
        if (algo === 'bubble') await interactiveBubbleSort();
        else if (algo === 'selection') await interactiveSelectionSort();
        // Fallbacks for others to be implemented full or reuse standard
        else {
            await interactiveBubbleSort(); // Default for now
        }
        renderArray([], CONFIG.colors.sorted);
        setStatus('Victory!');
    } catch (e) {
        if (e.message === 'Stopped by user') setStatus('Stopped.');
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
// (Copied existing Pathfinding logic)

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
    APP.isRunning = true; APP.shouldStop = false; toggleControls(false); setStatus('Running Pathfinding...');
    APP.grid.forEach(row => row.forEach(n => { n.div.classList.remove('visited', 'path'); n.parent = null; }));
    try {
        const startNode = APP.grid[APP.pfStart.r][APP.pfStart.c];
        const endNode = APP.grid[APP.pfEnd.r][APP.pfEnd.c];
        const userFunc = new Function('startNode', 'endNode', 'getNeighbors', 'visit', 'reconstructionPath', `return (async () => { ${code} })()`);
        await userFunc(startNode, endNode, getNeighbors, visit, reconstructionPath);
        setStatus('Finished!');
    } catch (e) { if (e.message === 'Stopped by user') setStatus('Stopped.'); else { console.error(e); alert(e.message); } } finally { APP.isRunning = false; toggleControls(true); }
}

// ==========================================
// SHARED UI LOGIC
// ==========================================

function toggleControls(enable) {
    const btns = [btnRun, btnGenerate, algoSelect, btnPfRun, btnPfReset, pfAlgoSelect, ...tabs];
    btns.forEach(b => b.disabled = !enable);
    modeRadios.forEach(r => r.disabled = !enable);
    imgModeCheck.disabled = !enable; // Image Mode Check

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

// Image Mode Listeners
imgModeCheck.addEventListener('change', (e) => {
    APP.isImageMode = e.target.checked;
    if (APP.isImageMode) {
        imgUpload.classList.remove('hidden');
        elEditor.classList.add('hidden'); // Hide code editor? Or just keep it.
        // Optional: Hide editor to focus on image, but maybe user wants to code custom sort?
        // Let's keep editor but maybe update preset?
        elStatus.textContent = "Image Mode Active";
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
            generateArray(); // Re-render with new image
        };
        reader.readAsDataURL(file);
    }
});

// Sorting Mode Switch
modeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        APP.sortMode = e.target.value;
        if (APP.isRunning) handleStop();

        if (APP.sortMode === 'game') {
            elEditor.style.display = 'none';
            gameOverlay.classList.remove('hidden');
            btnRun.textContent = "Start Game";
            updateEditorHeader();
            generateArray();
        } else {
            elEditor.style.display = 'block';
            gameOverlay.classList.add('hidden');
            btnRun.textContent = "Run Code";
            updateEditorHeader();
            generateArray();
        }
    });
});
algoSelect.addEventListener('change', () => {
    if (APP.sortMode === 'code') {
        elEditor.value = SORT_PRESETS[algoSelect.value];
    }
    // Update game instructions if needed
    if (APP.sortMode === 'game') {
        const descriptions = {
            'bubble': 'Bubble Sort: Compare adjacent items and swap if they are in wrong order.',
            'selection': 'Selection Sort: Find the minimum value and move it to the front.',
            'insertion': 'Insertion Sort: Take an item and insert it into the correct position.',
            'quick': 'Quick Sort: Compare items to a pivot and move smaller ones to the left.',
        };
        gameInstruction.textContent = descriptions[algoSelect.value] || "Algorithm selected.";
    }
});


// Event Listeners (Pathfinding)
btnPfRun.addEventListener('click', runPathfindingCode);
btnPfReset.addEventListener('click', () => {
    generateGrid(); // clean reset
});
btnPfStop.addEventListener('click', handleStop);
pfAlgoSelect.addEventListener('change', (e) => {
    if (APP.pfMode === 'code') elEditor.value = PF_PRESETS[e.target.value];
});

// Game Action Buttons
btnAction1.addEventListener('click', () => handleGameDecision(1));
btnAction2.addEventListener('click', () => handleGameDecision(2));

// Speed
speedRange.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    APP.delayMs = 200 - (val * 1.9);
});
sizeRange.addEventListener('input', generateArray);


// Boot
init();
