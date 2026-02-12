// --- Configuration ---
const CONFIG = {
    arraySize: 20, // Reduced for game mode playability
    minVal: 5,
    maxVal: 100,
    defaultSpeed: 50,
    colors: {
        default: '#64748b',
        active: '#f43f5e',
        sorted: '#10b981',
        pivot: '#8b5cf6',
        compare: '#fbbf24'
    }
};

// --- State ---
let data = [];
let isRunning = false;
let shouldStop = false;
let delayMs = 50;
let appMode = 'code'; // 'code' or 'game'
let gameResolvers = null; // For handling user decisions

// --- DOM Elements ---
const elEditor = document.getElementById('codeEditor');
const elViz = document.getElementById('visualizerContainer');
const elStatus = document.getElementById('statusText');
const btnRun = document.getElementById('btnRun');
const btnStop = document.getElementById('btnStop');
const btnGenerate = document.getElementById('btnGenerate');
const speedRange = document.getElementById('speedRange');
const algoSelect = document.getElementById('algoSelect');

// Mode & Game UI
const modeRadios = document.getElementsByName('appMode');
const gameOverlay = document.getElementById('gameOverlay');
const gameControls = document.getElementById('gameControls');
const stepDesc = document.getElementById('stepDesc');
const btnAction1 = document.getElementById('btnAction1'); // Left / Yes
const btnAction2 = document.getElementById('btnAction2'); // Right / No
const feedbackMsg = document.getElementById('feedbackMsg');
const gameInstruction = document.getElementById('gameInstruction');
const editorTitle = document.getElementById('editorTitle');
const editorSub = document.getElementById('editorSub');

// --- Presets ---
const PRESETS = {
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
// Available: data (array), await swap(index1, index2)
`
};

// --- Core Logic ---

function generateArray() {
    data = [];
    const size = appMode === 'game' ? 10 : CONFIG.arraySize; // Smaller array for game
    for (let i = 0; i < size; i++) {
        data.push(Math.floor(Math.random() * (CONFIG.maxVal - CONFIG.minVal + 1)) + CONFIG.minVal);
    }
    renderArray();
    setStatus('Ready');
}

function renderArray(activeIndices = [], specialColor = null) {
    elViz.innerHTML = '';
    const widthPercent = 100 / data.length;

    data.forEach((val, idx) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${val}%`;
        bar.style.width = `${widthPercent}%`;

        // Default text content for game mode to make comparison easier
        if (appMode === 'game') {
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

function setStatus(msg) {
    elStatus.textContent = msg;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// --- Execution Engine (Code Mode) ---

async function swap(i, j) {
    if (shouldStop) throw new Error('Stopped by user');

    let temp = data[i];
    data[i] = data[j];
    data[j] = temp;

    renderArray([i, j]);
    await sleep(delayMs);
}

async function runUserCode() {
    if (isRunning) return;

    const code = elEditor.value;
    isRunning = true;
    shouldStop = false;
    toggleControls(false);
    setStatus('Running Code...');

    try {
        const userFunc = new Function('data', 'swap', `return (async () => { ${code} })()`);
        await userFunc(data, swap);
        renderArray();
        setStatus('Finished!');
    } catch (e) {
        if (e.message === 'Stopped by user') {
            setStatus('Stopped.');
        } else {
            console.error(e);
            setStatus(`Error: ${e.message}`);
            alert(`Error: ${e.message}`);
        }
    } finally {
        isRunning = false;
        toggleControls(true);
    }
}

// --- Interactive Mode Logic ---

// Helper: Wait for user click
function waitForDecision(prompt, btn1Text, btn2Text, validator) {
    return new Promise((resolve, reject) => {
        if (shouldStop) {
            reject(new Error('Stopped by user'));
            return;
        }

        // Show Controls
        stepDesc.innerHTML = prompt;
        btnAction1.textContent = btn1Text;
        btnAction2.textContent = btn2Text;
        feedbackMsg.textContent = '';
        feedbackMsg.className = 'feedback';

        gameControls.classList.remove('hidden');

        gameResolvers = {
            resolve,
            validator,
            timestamp: Date.now()
        };
    });
}

// Handle Decision
async function handleGameDecision(choiceIdx) {
    if (!gameResolvers) return;

    const { resolve, validator } = gameResolvers;

    const result = validator(choiceIdx); // Returns { correct: bool, message: str, action: fn }

    if (result.correct) {
        feedbackMsg.textContent = "Correct! " + (result.message || "");
        feedbackMsg.classList.add('correct');
        gameResolvers = null; // Clear

        // Execute the action (e.g., swap)
        if (result.action) await result.action();

        // Small delay for satisfaction
        await sleep(300);
        gameControls.classList.add('hidden');
        resolve(true); // Continue
    } else {
        feedbackMsg.textContent = "Wrong! " + (result.message || "");
        feedbackMsg.classList.add('wrong');
        setTimeout(() => feedbackMsg.classList.remove('wrong'), 500); // Reset shake
        // Do not resolve; user must try again
    }
}

// 1. Interactive Bubble Sort
async function interactiveBubbleSort() {
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data.length - i - 1; j++) {
            renderArray([j, j + 1], CONFIG.colors.compare);
            const valA = data[j];
            const valB = data[j + 1];
            const shouldSwap = valA > valB;

            await waitForDecision(
                `Compare <b>[${valA}]</b> and <b>[${valB}]</b>.<br>Should we swap?`,
                "Swap", "Pass",
                (choice) => {
                    // Choice 1 = Swap, 2 = Pass
                    if (choice === 1 && shouldSwap) return { correct: true, action: async () => await swap(j, j + 1) };
                    if (choice === 2 && !shouldSwap) return { correct: true };

                    if (choice === 1 && !shouldSwap) return { correct: false, message: `${valA} is not larger than ${valB}.` };
                    if (choice === 2 && shouldSwap) return { correct: false, message: `${valA} is larger than ${valB}!` };
                    return { correct: false };
                }
            );
        }
    }
}

// 2. Interactive Selection Sort
async function interactiveSelectionSort() {
    for (let i = 0; i < data.length; i++) {
        let minIdx = i;
        renderArray([i], CONFIG.colors.active); // Show current start position

        for (let j = i + 1; j < data.length; j++) {
            renderArray([minIdx, j], CONFIG.colors.compare);
            const currentMin = data[minIdx];
            const compareVal = data[j];
            const isSmaller = compareVal < currentMin;

            await waitForDecision(
                `Current Min: <b>${currentMin}</b>. Check <b>${compareVal}</b>.<br>Is ${compareVal} smaller?`,
                "Yes (New Min)", "No (Pass)",
                (choice) => {
                    // Choice 1 = Yes, 2 = No
                    if (choice === 1 && isSmaller) {
                        minIdx = j; // Update locally
                        return { correct: true };
                    }
                    if (choice === 2 && !isSmaller) return { correct: true };

                    if (choice === 1 && !isSmaller) return { correct: false, message: `${compareVal} is not smaller than ${currentMin}.` };
                    if (choice === 2 && isSmaller) return { correct: false, message: `${compareVal} IS smaller!` };
                }
            );
        }

        if (minIdx !== i) {
            await swap(i, minIdx);
        }
    }
}

// 3. Interactive Insertion Sort
async function interactiveInsertionSort() {
    for (let i = 1; i < data.length; i++) {
        let j = i;
        // renderArray([i], CONFIG.colors.active);

        while (j > 0) {
            renderArray([j, j - 1], CONFIG.colors.compare);
            const current = data[j];
            const left = data[j - 1];
            const shouldShift = current < left;

            if (!shouldShift) break; // Optimization: if correct, stop

            await waitForDecision(
                `Target <b>${current}</b> vs Left <b>${left}</b>.<br>Insert here or keep moving left?`,
                "Move Left (Swap)", "Stay Here",
                (choice) => {
                    if (choice === 1 && shouldShift) return { correct: true, action: async () => await swap(j, j - 1) };
                    // In insertion, we theoretically 'shift', but swap is easier to visualize 1 by 1

                    if (choice === 2) return { correct: false, message: `${current} is smaller than ${left}, must move left!` };
                }
            );
            j--;
        }
    }
}

// 4. Interactive Quick Sort
async function interactiveQuickSort() {
    async function partition(low, high) {
        let pivot = data[high];
        let i = low - 1;

        // Highlight Pivot
        // We can't easily persist colors in this simple renderArray, so we'll just focus on comparisons

        for (let j = low; j < high; j++) {
            renderArray([j, high], CONFIG.colors.compare); // j and Pivot
            const val = data[j];
            const isLeft = val < pivot;

            await waitForDecision(
                `Pivot is <b>${pivot}</b>. Value is <b>${val}</b>.<br>Where do we put ${val}?`,
                "Left (Smaller)", "Right (Larger)",
                (choice) => {
                    // Choice 1 = Left, 2 = Right
                    if (choice === 1 && isLeft) return { correct: true, action: async () => { i++; await swap(i, j); } };
                    if (choice === 2 && !isLeft) return { correct: true }; // Stay on right (do nothing)

                    if (choice === 1 && !isLeft) return { correct: false, message: `${val} is larger than ${pivot}!` };
                    if (choice === 2 && isLeft) return { correct: false, message: `${val} is smaller than ${pivot}!` };
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

    await quickSortRecursive(0, data.length - 1);
}

// 5. Interactive Merge Sort (Simplified)
// Visualizing merge sort in-place array is hard. We will do a simulation of 'Pick Smaller' for the merge step.
async function interactiveMergeSort() {
    async function merge(low, mid, high) {
        // Create temp arrays
        const n1 = mid - low + 1;
        const n2 = high - mid;
        let L = new Array(n1);
        let R = new Array(n2);

        for (let i = 0; i < n1; i++) L[i] = data[low + i];
        for (let j = 0; j < n2; j++) R[j] = data[mid + 1 + j];

        let i = 0, j = 0, k = low;

        while (i < n1 && j < n2) {
            renderArray([k], CONFIG.colors.active); // Show where we are filling
            const valL = L[i];
            const valR = R[j];
            const pickLeft = valL <= valR;

            await waitForDecision(
                `Merging... Left Head: <b>${valL}</b> | Right Head: <b>${valR}</b>.<br>Which one is smaller?`,
                `Left (${valL})`, `Right (${valR})`,
                (choice) => {
                    if (choice === 1 && pickLeft) return { correct: true, action: async () => { data[k] = valL; i++; } };
                    if (choice === 2 && !pickLeft) return { correct: true, action: async () => { data[k] = valR; j++; } };

                    return { correct: false, message: `Pick the smaller value!` };
                }
            );
            renderArray([k]); // Update visual
            k++;
        }

        // Copy remaining (Auto, no user interaction for cleanup)
        while (i < n1) { data[k] = L[i]; i++; k++; renderArray([k]); await sleep(delayMs); }
        while (j < n2) { data[k] = R[j]; j++; k++; renderArray([k]); await sleep(delayMs); }
    }

    async function mergeSort(low, high) {
        if (low >= high) return;
        const mid = low + Math.floor((high - low) / 2);
        await mergeSort(low, mid);
        await mergeSort(mid + 1, high);
        await merge(low, mid, high);
    }

    await mergeSort(0, data.length - 1);
}


async function runGame() {
    if (isRunning) return;

    isRunning = true;
    shouldStop = false;
    toggleControls(false);
    setStatus('Game Started! Good Luck!');

    const algo = algoSelect.value;

    try {
        if (algo === 'bubble') await interactiveBubbleSort();
        else if (algo === 'selection') await interactiveSelectionSort();
        else if (algo === 'insertion') await interactiveInsertionSort();
        else if (algo === 'quick') await interactiveQuickSort();
        else {
            // Default to Merge for 'custom' or others to keep it interesting
            // Or alert if custom is selected
            if (algo === 'custom') {
                alert("Interactive mode doesn't support Custom code yet. Running Merge Sort!");
                await interactiveMergeSort();
            } else {
                await interactiveMergeSort(); // Default fallback
            }
        }

        renderArray([], CONFIG.colors.sorted);
        setStatus('You Won! Array Sorted!');
        gameInstruction.textContent = "Victory! The array is sorted.";
    } catch (e) {
        if (e.message === 'Stopped by user') {
            setStatus('Game Stopped.');
        } else {
            console.error(e);
            setStatus(`Error: ${e.message}`);
        }
    } finally {
        isRunning = false;
        gameControls.classList.add('hidden'); // Hide controls
        toggleControls(true);
    }
}

// --- Event Listeners ---

btnGenerate.addEventListener('click', generateArray);

btnRun.addEventListener('click', () => {
    if (appMode === 'code') runUserCode();
    else runGame();
});

btnStop.addEventListener('click', () => {
    if (isRunning) shouldStop = true;
});

speedRange.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    delayMs = 200 - (val * 1.9);
});

algoSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    if (appMode === 'code' && PRESETS[val]) {
        elEditor.value = PRESETS[val];
    }

    // Update Instruction for Game Mode
    if (appMode === 'game') {
        const descriptions = {
            'bubble': 'Bubble Sort: Compare adjacent items and swap if they are in wrong order.',
            'selection': 'Selection Sort: Find the minimum value and move it to the front.',
            'insertion': 'Insertion Sort: Take an item and insert it into the correct position.',
            'quick': 'Quick Sort: Compare items to a pivot and move smaller ones to the left.',
            'custom': 'Merge Sort (Bonus): Pick the smaller item from two piles to merge them.'
        };
        gameInstruction.textContent = descriptions[val] || descriptions['custom'];
    }
});

// Mode Switching
modeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        appMode = e.target.value;
        shouldStop = true; // Stop any running process

        if (appMode === 'game') {
            // Switch UI
            editorTitle.textContent = "Interactive Mode";
            editorSub.textContent = "You are the CPU!";
            elEditor.style.display = 'none';
            gameOverlay.classList.remove('hidden');
            btnRun.textContent = "Start Game";

            // Trigger generation for fewer items
            generateArray();
        } else {
            editorTitle.textContent = "JavaScript Editor";
            editorSub.innerHTML = "Available: <code>data[]</code>, <code>await swap(i,j)</code>";
            elEditor.style.display = 'block';
            gameOverlay.classList.add('hidden');
            btnRun.textContent = "Run Code";

            generateArray();
        }
    });
});

// Game Action Buttons
btnAction1.addEventListener('click', () => handleGameDecision(1));
btnAction2.addEventListener('click', () => handleGameDecision(2));


function toggleControls(enable) {
    btnRun.disabled = !enable;
    btnGenerate.disabled = !enable;
    algoSelect.disabled = !enable;
    btnStop.disabled = enable;
    modeRadios.forEach(r => r.disabled = !enable);
}

// --- Init ---
generateArray();
elEditor.value = PRESETS['bubble'];
