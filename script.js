/**
 * COSMIC VOID - Interactive Idle Universe
 * Core Engine
 */

const canvas = document.getElementById('cosmosCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Game State
let gameState = {
    energy: 0,
    level: 1,
    multiplier: 1,
    autoRate: 0,
    autoEvolve: false,
    lastTick: Date.now()
};

// --- VISUAL ENGINE ---
class StarManager {
    constructor() {
        this.baseRadius = 50;
        this.pulse = 0;
        this.color = '#c084fc'; // Purple glow
    }

    render(ctx, w, h) {
        const cx = w / 2;
        const cy = h / 2;

        // Pulsing effect
        this.pulse += 0.05;
        const r = this.baseRadius + Math.sin(this.pulse) * 3 + (gameState.level * 2);

        // Glow
        const gradient = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 4);
        gradient.addColorStop(0, '#ffffff'); // Core
        gradient.addColorStop(0.1, '#f0abfc'); // Inner
        gradient.addColorStop(0.4, 'rgba(192, 132, 252, 0.4)'); // Mid
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Fade

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.8, 0, Math.PI * 2);
        ctx.fill();
    }
}
const Star = new StarManager();

// --- PARTICLE SYSTEM ---
class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    spawn(x, y, count = 10, color = null) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1.0,
                color: color || (Math.random() > 0.5 ? '#22d3ee' : '#f0abfc')
            });
        }
    }

    updateAndRender(ctx) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            p.vx *= 0.95;
            p.vy *= 0.95;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            } else {
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }
        }
    }
}
const Particles = new ParticleSystem();

// --- DEBRIS SYSTEM (COMETS) ---
class DebrisManager {
    constructor() {
        this.debris = [];
        this.lastSpawn = Date.now();
        this.spawnRate = 5000; // 5s initial
    }

    updateAndRender(ctx) {
        // Spawn
        if (Date.now() - this.lastSpawn > this.spawnRate) {
            this.spawn();
            this.lastSpawn = Date.now();
            this.spawnRate = 3000 + Math.random() * 5000;
        }

        // Render
        for (let i = this.debris.length - 1; i >= 0; i--) {
            const d = this.debris[i];
            d.x += d.vx;
            d.y += d.vy;
            d.rot += d.vRot;

            // Remove if out of bounds
            if (d.x < -100 || d.x > canvas.width + 100 || d.y < -100 || d.y > canvas.height + 100) {
                this.debris.splice(i, 1);
                continue;
            }

            // Draw Comet
            ctx.save();
            ctx.translate(d.x, d.y);
            ctx.rotate(d.rot);

            // Tail
            const grad = ctx.createLinearGradient(0, 0, -40, 0);
            grad.addColorStop(0, d.color);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(0, -5);
            ctx.lineTo(-60, 0);
            ctx.lineTo(0, 5);
            ctx.fill();

            // Head
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(0, 0, d.size, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }

    spawn() {
        const side = Math.random() > 0.5 ? 'left' : 'right';
        const y = Math.random() * canvas.height;
        const x = side === 'left' ? -50 : canvas.width + 50;
        const vx = (side === 'left' ? 1 : -1) * (2 + Math.random() * 3);
        const vy = (Math.random() - 0.5) * 2;

        this.debris.push({
            x, y, vx, vy,
            size: 5 + Math.random() * 8,
            rot: Math.atan2(vy, vx),
            vRot: 0,
            color: Math.random() > 0.8 ? '#fcd34d' : '#94a3b8', // Gold or Rock
            type: Math.random() > 0.8 ? 'gold' : 'rock'
        });
    }

    checkClick(x, y) {
        for (let i = this.debris.length - 1; i >= 0; i--) {
            const d = this.debris[i];
            const dist = Math.sqrt((x - d.x) ** 2 + (y - d.y) ** 2);
            if (dist < d.size + 20) { // Hitbox padding
                // Reward
                const reward = d.type === 'gold' ? 500 * gameState.level : 100 * gameState.level;
                gameState.energy += reward;

                // FX
                Particles.spawn(d.x, d.y, 15, d.color);

                // Remove
                this.debris.splice(i, 1);
                updateUI();
                return true;
            }
        }
        return false;
    }
}
const Debris = new DebrisManager();

// --- UPGRADE SYSTEM ---
const upgradeItems = [
    { id: 'u1', name: 'Stardust Scooper', baseCost: 50, baseRate: 1, count: 0 },
    { id: 'u2', name: 'Comet Miner', baseCost: 250, baseRate: 5, count: 0 },
    { id: 'u3', name: 'Nebula Siphon', baseCost: 1000, baseRate: 20, count: 0 },
    { id: 'u4', name: 'Dark Matter Reactor', baseCost: 5000, baseRate: 100, count: 0 },
    { id: 'u5', name: 'Time dilation Field', baseCost: 20000, baseRate: 500, count: 0 }
];

function renderUpgrades() {
    const list = document.getElementById('upgradeList');
    list.innerHTML = '';

    upgradeItems.forEach(u => {
        const cost = Math.floor(u.baseCost * Math.pow(1.15, u.count));
        const div = document.createElement('div');
        div.className = 'upgrade-item';
        div.onclick = () => buyUpgrade(u.id);
        div.innerHTML = `
            <div class="up-info">
                <b>${u.name}</b>
                <span style="font-size:0.8em; color:#aaa;">Lv ${u.count} (+${u.baseRate}/s)</span>
            </div>
            <button class="action-btn small" ${gameState.energy < cost ? 'disabled' : ''}>
                ${cost.toLocaleString()} ⚡
            </button>
        `;
        list.appendChild(div);
    });
}

function buyUpgrade(id) {
    const u = upgradeItems.find(x => x.id === id);
    const cost = Math.floor(u.baseCost * Math.pow(1.15, u.count));

    if (gameState.energy >= cost) {
        gameState.energy -= cost;
        gameState.autoRate += u.baseRate;
        u.count++;

        // Save
        saveGame();

        updateUI();
        renderUpgrades();

        // FX
        Particles.spawn(window.innerWidth / 2, window.innerHeight - 100, 10, '#ffff00');
    }
}

function toggleAutoEvolve() {
    gameState.autoEvolve = document.getElementById('autoEvolveToggle').checked;
    if (gameState.autoEvolve) {
        console.log("🤖 Auto-Evolve Protocol Engaged");
    }
}
window.toggleAutoEvolve = toggleAutoEvolve;

function tickAutoEvolve() {
    if (!gameState.autoEvolve) return;

    // Find affordable upgrades
    let bestU = null;
    let minCost = Infinity;

    upgradeItems.forEach(u => {
        const cost = Math.floor(u.baseCost * Math.pow(1.15, u.count));
        if (gameState.energy >= cost && cost < minCost) {
            minCost = cost;
            bestU = u;
        }
    });

    if (bestU) {
        buyUpgrade(bestU.id);
    }
}

// --- INTERACTION ---
function handleInteraction(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 1. Check Debris First (Priority)
    if (Debris.checkClick(x, y)) return;

    // 2. Check Star
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

    if (dist < 150) {
        gameState.energy += (1 + gameState.autoRate * 0.1); // Click gets stronger with upgrades
        gameState.pulse = 1.0;
        Star.pulse = 0.5;
        Particles.spawn(x, y, 8);
        updateUI();
    }
}

// Bind click for both canvas and overlay clickZone
document.getElementById('clickZone').addEventListener('click', handleInteraction);
canvas.addEventListener('click', handleInteraction);

// --- UI LOGIC ---
function updateUI() {
    document.getElementById('energyVal').innerText = Math.floor(gameState.energy).toLocaleString();

    // Level progress
    const nextLevel = gameState.level * 1000;
    const progress = (gameState.energy % nextLevel) / nextLevel * 100;
    document.getElementById('levelProgress').style.width = `${progress}%`;

    // Refresh upgrades state (button disabled status)
    // Only verify every ~1s ideally, but here active check
}

function switchPanel(panelId) {
    const panels = ['upgrades', 'stats', 'birth'];
    const container = document.getElementById('panelContainer');

    // Toggle container visibility
    if (container.classList.contains('hidden')) {
        container.classList.remove('hidden');
    }

    // Hide all, show target
    panels.forEach(p => {
        document.getElementById(`${p}Panel`).classList.add('hidden');
    });
    document.getElementById(`${panelId}Panel`).classList.remove('hidden');

    // Update buttons
    document.querySelectorAll('.deck-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    if (panelId === 'upgrades') renderUpgrades();
}
window.switchPanel = switchPanel; // Make global for HTML onclick

// --- CONTENT SYSTEM ---
async function fetchContent(type) {
    const overlay = document.getElementById('overlayContainer');
    const title = document.getElementById('contentTitle');
    const text = document.getElementById('contentText');
    const rewardVal = document.getElementById('rewardVal');

    overlay.classList.remove('hidden');
    text.innerHTML = '<div class="loader">Decoding Signal...</div>';

    let reward = 500 * gameState.level; // Reward scales with level

    try {
        if (type === 'trivia') {
            title.innerText = "Cosmic Trivia";
            const res = await fetch('https://opentdb.com/api.php?amount=1&type=multiple');
            const data = await res.json();
            const item = data.results[0];
            text.innerHTML = `<p>${item.question}</p><br><p class="spoiler">Answer: ${item.correct_answer}</p>`;
            reward = 1000 * gameState.level;
        } else if (type === 'fact') {
            title.innerText = "Useless Star Data";
            const res = await fetch('https://uselessfacts.jsph.pl/random.json?language=en');
            const data = await res.json();
            text.innerText = data.text;
            reward = 500 * gameState.level;
        } else if (type === 'history') {
            title.innerText = "Earth Archives";
            const today = new Date();
            const res = await fetch(`https://ko.wikipedia.org/w/api.php?action=parse&origin=*&format=json&page=${today.getMonth() + 1}월_${today.getDate()}일&prop=text&section=1`);
            const data = await res.json();
            const html = data.parse.text["*"];
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const items = Array.from(doc.querySelectorAll('li')).slice(0, 3);
            text.innerHTML = items.map(li => `<p>• ${li.innerText.split('[')[0]}</p>`).join('');
            reward = 2000 * gameState.level;
        }
    } catch (e) {
        text.innerText = "Signal Lost. Connection failed.";
    }

    // Setup Claim Button
    const btn = document.getElementById('claimRewardBtn');
    rewardVal.innerText = reward.toLocaleString();
    btn.onclick = () => {
        gameState.energy += reward;
        Particles.spawn(window.innerWidth / 2, window.innerHeight / 2, 20);
        updateUI();
        overlay.classList.add('hidden');
    };
}
window.fetchContent = fetchContent;

function closeOverlay() {
    document.getElementById('overlayContainer').classList.add('hidden');
}
document.getElementById('closeContentBtn').addEventListener('click', closeOverlay);

function discoverOrigin() {
    const date = document.getElementById('birthDate').value;
    if (!date) return alert("Enter a valid stardate.");

    const d = new Date(date);
    const zName = getZodiac(d.getMonth() + 1, d.getDate());

    document.getElementById('originResult').innerHTML = `
        <div class="origin-card">
            <h4>${zName} Constellation Found</h4>
            <p>Your core frequency matches the ${zName} star cluster.</p>
        </div>
    `;
    // Bonus for discovery
    gameState.energy += 1000;
    Particles.spawn(window.innerWidth / 2, window.innerHeight / 2, 30, '#ffff00');
}
window.discoverOrigin = discoverOrigin;

function getZodiac(m, d) {
    const days = [20, 19, 21, 20, 21, 22, 23, 23, 23, 24, 22, 22];
    const signs = ["Capricorn", "Aquarius", "Pisces", "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius"];
    if (m == 1 && d <= 19) m = 13;
    return signs[(m - 2 + 12) % 12];
}

// --- SAVE SYSTEM ---
function saveGame() {
    const data = {
        gameState,
        upgrades: upgradeItems.map(u => ({ id: u.id, count: u.count }))
    };
    localStorage.setItem('cosmic_void_save', JSON.stringify(data));
}

function loadGame() {
    const saved = localStorage.getItem('cosmic_void_save');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            Object.assign(gameState, data.gameState);
            if (data.upgrades) {
                data.upgrades.forEach(savedU => {
                    const u = upgradeItems.find(x => x.id === savedU.id);
                    if (u) {
                        u.count = savedU.count;
                        gameState.autoRate += u.baseRate * savedU.count; // Recalculate autoRate
                    }
                });
            }
        } catch (e) { console.error("Save Load Failed", e); }
    }
}

// --- GAME LOOP ---
function gameLoop() {
    const now = Date.now();
    const dt = (now - gameState.lastTick) / 1000;
    gameState.lastTick = now;

    // Auto Rate
    if (gameState.autoRate > 0) {
        gameState.energy += gameState.autoRate * dt;
        updateUI();
    }

    // Auto Evolve
    tickAutoEvolve();

    // Auto Save (every 10s)
    if (now % 10000 < 50) saveGame();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    Star.render(ctx, canvas.width, canvas.height);
    Debris.updateAndRender(ctx); // Render Comets
    Particles.updateAndRender(ctx);

    requestAnimationFrame(gameLoop);
}

// Start Engine
document.addEventListener('DOMContentLoaded', () => {
    loadGame();
    console.log("🌌 Cosmic Void Engine Initialized");
    requestAnimationFrame(gameLoop);

    // Restore Google Ads Initialization
    setTimeout(() => {
        if (typeof adsbygoogle !== 'undefined') {
            try {
                (adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                console.warn("AdSense init failed:", e);
            }
        }
    }, 1000);
});
