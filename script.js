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

// --- CORE ENGINE ---
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function gameLoop() {
    const now = Date.now();
    const dt = (now - gameState.lastTick) / 1000;
    gameState.lastTick = now;

    // Update Logic
    // ...

    // Render Logic
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Clear screen

    // Star.render(ctx); 
    // Particles.render(ctx);

    requestAnimationFrame(gameLoop);
}

// Start Engine
document.addEventListener('DOMContentLoaded', () => {
    console.log("🌌 Cosmic Void Engine Initialized");
    requestAnimationFrame(gameLoop);
});
