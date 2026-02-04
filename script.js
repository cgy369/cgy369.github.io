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

const Star = new StarManager();

// --- GAME LOOP ---
function gameLoop() {
    const now = Date.now();
    gameState.lastTick = now;

    // Clear with semi-transparent black for trail effect? No, clean clear for crisp visuals
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render center star
    Star.render(ctx, canvas.width, canvas.height);

    requestAnimationFrame(gameLoop);
}

// Start Engine
document.addEventListener('DOMContentLoaded', () => {
    console.log("🌌 Cosmic Void Engine Initialized");
    requestAnimationFrame(gameLoop);
});
