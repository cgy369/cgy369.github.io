/**
 * COSMIC VOID - Interactive Idle Universe
 * Core Engine
 */

const canvas = document.getElementById('cosmosCanvas');
const ctx = canvas.getContext('2d');

// Game State
let gameState = {
    energy: 0,
    level: 1,
    multiplier: 1,
    autoRate: 0,
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

// --- PARTICLE SYSTEM ---
class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    spawn(x, y, count = 10) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1.0,
                color: Math.random() > 0.5 ? '#22d3ee' : '#f0abfc'
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

// --- INTERACTION ---
function handleInteraction(e) {
    // 1. Visual Feedback
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked near center star
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

    if (dist < 150) {
        // Successful Click
        gameState.energy += (1 * gameState.multiplier);
        gameState.pulse = 1.0; // Pulse jump
        Star.pulse = 0.5; // Visual jump
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
}
window.switchPanel = switchPanel; // Make global for HTML onclick

// --- GAME LOOP ---
function gameLoop() {
    const now = Date.now();
    gameState.lastTick = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    Star.render(ctx, canvas.width, canvas.height);
    Particles.updateAndRender(ctx);

    requestAnimationFrame(gameLoop);
}

// Start Engine
document.addEventListener('DOMContentLoaded', () => {
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
