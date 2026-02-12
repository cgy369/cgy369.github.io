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
    // Pathfinding State
    pfMode: 'code', // 'code' | 'game'
    grid: [], // 20x20 array of node objects
    pfStart: { r: 2, c: 2 },
    pfEnd: { r: 17, c: 17 },
    isMousePressed: false,
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
    astar: `// A* Search (Coming Soon)`
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

        // Update Title/Sub based on Mode
        updateEditorHeader();

        elEditor.value = SORT_PRESETS[algoSelect.value];
    } else {
        elViz.classList.add('hidden');
        elGrid.classList.remove('hidden');
        controlsSorting.classList.add('hidden');
        controlsPathfinding.classList.remove('hidden');

        // Update Title/Sub
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
    const sliderVal = sizeRange ? parseInt(sizeRange.value) : CONFIG.arraySize;
    // In game mode, maybe force smaller size? But user requested slider control.
    const size = sliderVal;

    for (let i = 0; i < size; i++) {
        APP.sortData.push(Math.floor(Math.random() * (CONFIG.maxVal - CONFIG.minVal + 1)) + CONFIG.minVal);
    }
    renderArray();
    setStatus('Ready (Sorting)');
}

function renderArray(activeIndices = [], specialColor = null) {
    elViz.innerHTML = '';
    const widthPercent = 100 / APP.sortData.length;

    APP.sortData.forEach((val, idx) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${val}%`;
        bar.style.width = `${widthPercent}%`;

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
            if (specialColor) bar.style.backgroundColor = specialColor;
        }

        elViz.appendChild(bar);
    });
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
        const userFunc = new Function('data', 'swap', `return (async () => { ${code} })()`);
        await userFunc(APP.sortData, swap);
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

// Algorithms
async function interactiveBubbleSort() {
    for (let i = 0; i < APP.sortData.length; i++) {
        for (let j = 0; j < APP.sortData.length - i - 1; j++) {
            renderArray([j, j + 1], CONFIG.colors.compare);
            const valA = APP.sortData[j];
            const valB = APP.sortData[j + 1];
            const shouldSwap = valA > valB;

            await waitForDecision(
                `Compare <b>[${valA}]</b> and <b>[${valB}]</b>.<br>Should we swap?`,
                "Swap", "Pass",
                (choice) => {
                    if (choice === 1 && shouldSwap) return { correct: true, action: async () => await swap(j, j + 1) };
                    if (choice === 2 && !shouldSwap) return { correct: true };

                    if (choice === 1 && !shouldSwap) return { correct: false, message: `${valA} <= ${valB}.` };
                    if (choice === 2 && shouldSwap) return { correct: false, message: `${valA} > ${valB}!` };
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
                `Current Min: <b>${currentMin}</b>. Check <b>${compareVal}</b>.<br>Is ${compareVal} smaller?`,
                "Yes (New Min)", "No (Pass)",
                (choice) => {
                    if (choice === 1 && isSmaller) { minIdx = j; return { correct: true }; }
                    if (choice === 2 && !isSmaller) return { correct: true };
                    return { correct: false, message: isSmaller ? "It IS smaller!" : "Not smaller." };
                }
            );
        }
        if (minIdx !== i) await swap(i, minIdx);
    }
}

async function interactiveInsertionSort() {
    for (let i = 1; i < APP.sortData.length; i++) {
        let j = i;
        while (j > 0) {
            renderArray([j, j - 1], CONFIG.colors.compare);
            const current = APP.sortData[j];
            const left = APP.sortData[j - 1];
            const shouldShift = current < left;

            if (!shouldShift) break;

            await waitForDecision(
                `Target <b>${current}</b> vs Left <b>${left}</b>.<br>Insert here or keep moving left?`,
                "Move Left (Swap)", "Stay Here",
                (choice) => {
                    if (choice === 1 && shouldShift) return { correct: true, action: async () => await swap(j, j - 1) };
                    if (choice === 2) return { correct: false, message: `${current} < ${left}, move left!` };
                }
            );
            j--;
        }
    }
}

async function interactiveQuickSort() {
    async function partition(low, high) {
        let pivot = APP.sortData[high];
        let i = low - 1;
        for (let j = low; j < high; j++) {
            renderArray([j, high], CONFIG.colors.compare);
            const val = APP.sortData[j];
            const isLeft = val < pivot;

            await waitForDecision(
                `Pivot <b>${pivot}</b> vs <b>${val}</b>.<br>Where to put ${val}?`,
                "Left (Smaller)", "Right (Larger)",
                (choice) => {
                    if (choice === 1 && isLeft) return { correct: true, action: async () => { i++; await swap(i, j); } };
                    if (choice === 2 && !isLeft) return { correct: true };
                    return { correct: false, message: isLeft ? "Smaller -> Left" : "Larger -> Right" };
                }
            );
        }
        await swap(i + 1, high);
        return i + 1;
    }

    async function quickSortRecursive(low, high) {
        if (low < high) {
            let pi = await partition(low, high);
            await quickSortRecursive(low, pi - 1);
            await quickSortRecursive(pi + 1, high);
        }
    }
    await quickSortRecursive(0, APP.sortData.length - 1);
}

async function runGame() {
    if (APP.isRunning) return;

    APP.isRunning = true;
    APP.shouldStop = false;
    toggleControls(false);
    setStatus('Game Started! Good Luck!');

    const algo = algoSelect.value;

    try {
        if (algo === 'bubble') await interactiveBubbleSort();
        else if (algo === 'selection') await interactiveSelectionSort();
        else if (algo === 'insertion') await interactiveInsertionSort();
        else if (algo === 'quick') await interactiveQuickSort();
        else {
            alert("Custom game not supported yet.");
        }

        renderArray([], CONFIG.colors.sorted);
        setStatus('You Won! Array Sorted!');
        gameInstruction.textContent = "Victory! The array is sorted.";
    } catch (e) {
        if (e.message === 'Stopped by user') setStatus('Game Stopped.');
        else { console.error(e); setStatus(`Error: ${e.message}`); }
    } finally {
        APP.isRunning = false;
        gameControls.classList.add('hidden');
        gameControls.style.display = 'none';
        toggleControls(true);
    }
}


// ==========================================
// MODULE: PATHFINDING
// ==========================================

function generateGrid() {
    elGrid.innerHTML = '';
    elGrid.style.gridTemplateColumns = `repeat(${CONFIG.gridSize}, 1fr)`;
    APP.grid = [];

    for (let r = 0; r < CONFIG.gridSize; r++) {
        let row = [];
        for (let c = 0; c < CONFIG.gridSize; c++) {
            let node = {
                id: `${r}-${c}`,
                r, c,
                isWall: false,
                div: null
            };

            const div = document.createElement('div');
            div.className = 'node';
            div.dataset.r = r;
            div.dataset.c = c;

            // Interaction
            div.addEventListener('mousedown', () => {
                APP.isMousePressed = true;
                toggleWall(node);
            });
            div.addEventListener('mouseenter', () => {
                if (APP.isMousePressed) toggleWall(node);
            });

            if (r === APP.pfStart.r && c === APP.pfStart.c) div.classList.add('start');
            if (r === APP.pfEnd.r && c === APP.pfEnd.c) div.classList.add('end');

            node.div = div;
            elGrid.appendChild(div);
            row.push(node);
        }
        APP.grid.push(row);
    }
}

function toggleWall(node) {
    if ((node.r === APP.pfStart.r && node.c === APP.pfStart.c) ||
        (node.r === APP.pfEnd.r && node.c === APP.pfEnd.c)) return;

    node.isWall = !node.isWall;
    if (node.isWall) node.div.classList.add('wall');
    else node.div.classList.remove('wall');
}

document.addEventListener('mouseup', () => APP.isMousePressed = false);

// Helper for User Code
function getNeighbors(node) {
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const neighbors = [];
    for (let d of dirs) {
        const nr = node.r + d[0];
        const nc = node.c + d[1];
        if (nr >= 0 && nr < CONFIG.gridSize && nc >= 0 && nc < CONFIG.gridSize) {
            const n = APP.grid[nr][nc];
            if (!n.isWall) neighbors.push(n);
        }
    }
    return neighbors;
}

// API for User Code
async function visit(node) {
    if (APP.shouldStop) throw new Error('Stopped by user');
    if (node.div.classList.contains('start') || node.div.classList.contains('end')) return;

    node.div.classList.add('visited');
    await sleep(APP.delayMs);
}

async function reconstructionPath(endNode) {
    let curr = endNode.parent;
    while (curr && curr.parent) {
        if (APP.shouldStop) throw new Error('Stopped by user');
        curr.div.classList.remove('visited');
        curr.div.classList.add('path');
        curr = curr.parent;
        await sleep(50);
    }
}


async function runPathfindingCode() {
    if (APP.isRunning) return;
    const code = elEditor.value;
    APP.isRunning = true;
    APP.shouldStop = false;
    toggleControls(false);
    setStatus('Running Pathfinding...');

    // Reset Visualization (keep walls)
    APP.grid.forEach(row => row.forEach(n => {
        n.div.classList.remove('visited', 'path');
        n.parent = null;
    }));

    try {
        const startNode = APP.grid[APP.pfStart.r][APP.pfStart.c];
        const endNode = APP.grid[APP.pfEnd.r][APP.pfEnd.c];

        const userFunc = new Function(
            'startNode', 'endNode', 'getNeighbors', 'visit', 'reconstructionPath',
            `return (async () => { ${code} })()`
        );

        await userFunc(startNode, endNode, getNeighbors, visit, reconstructionPath);
        setStatus('Finished!');
    } catch (e) {
        if (e.message === 'Stopped by user') setStatus('Stopped.');
        else { console.error(e); alert(e.message); }
    } finally {
        APP.isRunning = false;
        toggleControls(true);
    }
}

// ==========================================
// SHARED UI LOGIC
// ==========================================

function toggleControls(enable) {
    const btns = [btnRun, btnGenerate, algoSelect, btnPfRun, btnPfReset, pfAlgoSelect, ...tabs];
    btns.forEach(b => b.disabled = !enable);

    // Mode radios logic is complex, just disable all for now
    modeRadios.forEach(r => r.disabled = !enable);

    if (APP.module === 'sorting') btnStop.disabled = enable;
    else btnPfStop.disabled = enable;
}

function handleStop() {
    if (APP.isRunning) {
        APP.shouldStop = true;
        // If interactive game pending
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
            generateArray(); // Reset array
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
