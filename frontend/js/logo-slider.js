/**
 * Infinite Logo Slider
 * Vanilla JS implementation of infinite scrolling logo carousel
 */

class InfiniteSlider {
    constructor(container, options = {}) {
        this.container = typeof container === 'string'
            ? document.querySelector(container)
            : container;

        if (!this.container) return;

        // Default options
        this.options = {
            speed: options.speed || 30,           // Pixels per second
            speedOnHover: options.speedOnHover || 10,
            gap: options.gap || 48,               // Gap between items in px
            reverse: options.reverse || false,
            pauseOnHover: options.pauseOnHover || false
        };

        this.currentSpeed = this.options.speed;
        this.position = 0;
        this.isHovering = false;
        this.animationId = null;
        this.lastTime = null;

        this.init();
    }

    init() {
        // Get the track (inner container)
        this.track = this.container.querySelector('.slider-track');
        if (!this.track) {
            console.error('InfiniteSlider: .slider-track not found');
            return;
        }

        // Clone items for seamless loop
        this.cloneItems();

        // Calculate total width of one set
        this.calculateWidth();

        // Start animation
        this.startAnimation();

        // Event listeners
        this.container.addEventListener('mouseenter', () => this.onHoverStart());
        this.container.addEventListener('mouseleave', () => this.onHoverEnd());

        // Recalculate on resize
        window.addEventListener('resize', () => this.calculateWidth());
    }

    cloneItems() {
        const items = Array.from(this.track.children);
        // Clone twice for smoother loop
        items.forEach(item => {
            const clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            this.track.appendChild(clone);
        });
        items.forEach(item => {
            const clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            this.track.appendChild(clone);
        });
    }

    calculateWidth() {
        const items = this.track.querySelectorAll('.slider-item');
        const itemCount = items.length / 3; // Original items (before duplication)
        let totalWidth = 0;

        for (let i = 0; i < itemCount; i++) {
            totalWidth += items[i].offsetWidth + this.options.gap;
        }

        this.contentWidth = totalWidth;
    }

    animate(currentTime) {
        // First frame - initialize lastTime
        if (this.lastTime === null) {
            this.lastTime = currentTime;
            this.animationId = requestAnimationFrame((t) => this.animate(t));
            return;
        }

        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;

        // Calculate movement
        const movement = this.currentSpeed * deltaTime;

        if (this.options.reverse) {
            this.position += movement;
            if (this.position >= this.contentWidth) {
                this.position = 0;
            }
        } else {
            this.position -= movement;
            if (Math.abs(this.position) >= this.contentWidth) {
                this.position = 0;
            }
        }

        // Apply transform
        this.track.style.transform = `translateX(${this.position}px)`;

        // Continue animation
        this.animationId = requestAnimationFrame((t) => this.animate(t));
    }

    startAnimation() {
        this.lastTime = null;
        this.animationId = requestAnimationFrame((t) => this.animate(t));
    }

    onHoverStart() {
        this.isHovering = true;
        if (this.options.pauseOnHover) {
            this.currentSpeed = 0;
        } else {
            this.currentSpeed = this.options.speedOnHover;
        }
    }

    onHoverEnd() {
        this.isHovering = false;
        this.currentSpeed = this.options.speed;
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const sliders = document.querySelectorAll('.logo-cloud');
    sliders.forEach(slider => {
        new InfiniteSlider(slider, {
            speed: 50,
            speedOnHover: 15,
            gap: 48,
            reverse: false
        });
    });
});
