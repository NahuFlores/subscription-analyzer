/**
 * Particle Effect for Hero Section
 * Converted from React to Vanilla JavaScript
 * Interactive anti-gravity particle system
 */

// Configuration Constants
const PARTICLE_DENSITY = 0.00015;
const BG_PARTICLE_DENSITY = 0.00005;
const MOUSE_RADIUS = 180;
const RETURN_SPEED = 0.08;
const DAMPING = 0.90;
const REPULSION_STRENGTH = 1.2;

// Helper Functions
const randomRange = (min, max) => Math.random() * (max - min) + min;

class ParticleEffect {
    constructor(canvasId, containerId) {
        this.canvas = document.getElementById(canvasId);
        this.container = document.getElementById(containerId);

        if (!this.canvas || !this.container) {
            console.error('Canvas or container not found');
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.backgroundParticles = [];
        this.mouse = { x: -1000, y: -1000, isActive: false };
        this.frameId = null;
        this.lastTime = 0;

        this.init();
    }

    init() {
        this.setupCanvas();
        this.initParticles();
        this.setupEventListeners();
        this.animate(0);
    }

    setupCanvas() {
        const rect = this.container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;

        this.ctx.scale(dpr, dpr);
        this.width = rect.width;
        this.height = rect.height;
    }

    initParticles() {
        // Main Interactive Particles
        const particleCount = Math.floor(this.width * this.height * PARTICLE_DENSITY);
        this.particles = [];

        for (let i = 0; i < particleCount; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;

            this.particles.push({
                x, y,
                originX: x,
                originY: y,
                vx: 0,
                vy: 0,
                size: randomRange(1, 2.5),
                color: Math.random() > 0.9 ? '#6366f1' : '#ffffff',
                angle: Math.random() * Math.PI * 2
            });
        }

        // Background Ambient Particles
        const bgCount = Math.floor(this.width * this.height * BG_PARTICLE_DENSITY);
        this.backgroundParticles = [];

        for (let i = 0; i < bgCount; i++) {
            this.backgroundParticles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                size: randomRange(0.5, 1.5),
                alpha: randomRange(0.1, 0.4),
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    setupEventListeners() {
        this.container.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            this.mouse = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                isActive: true
            };
        });

        this.container.addEventListener('mouseleave', () => {
            this.mouse.isActive = false;
        });

        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.initParticles();
        });
    }

    animate(time) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Pulsating radial glow
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const pulseOpacity = Math.sin(time * 0.0008) * 0.035 + 0.085;

        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, Math.max(this.width, this.height) * 0.7
        );
        gradient.addColorStop(0, `rgba(99, 102, 241, ${pulseOpacity})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Background particles
        this.ctx.fillStyle = "#ffffff";
        for (let p of this.backgroundParticles) {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = this.width;
            if (p.x > this.width) p.x = 0;
            if (p.y < 0) p.y = this.height;
            if (p.y > this.height) p.y = 0;

            const twinkle = Math.sin(time * 0.002 + p.phase) * 0.5 + 0.5;
            const currentAlpha = p.alpha * (0.3 + 0.7 * twinkle);

            this.ctx.globalAlpha = currentAlpha;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1.0;

        // Main particles physics
        for (let p of this.particles) {
            // Mouse repulsion
            const dx = this.mouse.x - p.x;
            const dy = this.mouse.y - p.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (this.mouse.isActive && distance < MOUSE_RADIUS) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (MOUSE_RADIUS - distance) / MOUSE_RADIUS;
                const repulsion = force * REPULSION_STRENGTH;

                p.vx -= forceDirectionX * repulsion * 5;
                p.vy -= forceDirectionY * repulsion * 5;
            }

            // Spring force (return to origin)
            const springDx = p.originX - p.x;
            const springDy = p.originY - p.y;

            p.vx += springDx * RETURN_SPEED;
            p.vy += springDy * RETURN_SPEED;

            // Apply damping
            p.vx *= DAMPING;
            p.vy *= DAMPING;

            // Update position
            p.x += p.vx;
            p.y += p.vy;

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

            const velocity = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            const opacity = Math.min(0.3 + velocity * 0.1, 1);

            this.ctx.fillStyle = p.color === '#ffffff'
                ? `rgba(255, 255, 255, ${opacity})`
                : p.color;

            this.ctx.fill();
        }

        this.frameId = requestAnimationFrame((t) => this.animate(t));
    }

    destroy() {
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const particleEffect = new ParticleEffect('particle-canvas', 'particle-container');
});
