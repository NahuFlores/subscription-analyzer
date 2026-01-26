/**
 * Page Animations with AnimeJS
 * Entrance animations + Scroll reveal effects
 */

class HeroAnimations {
    constructor() {
        this.navbar = document.querySelector('.magic-navbar-container');
        this.navLogo = document.querySelector('.magic-nav-logo');
        this.navLinks = document.querySelectorAll('.magic-nav-link');
        this.titleLines = document.querySelectorAll('.title-line');
        this.description = document.querySelector('.hero-description');
        this.cta = document.querySelector('.hero-cta');
        this.particleCanvas = document.getElementById('particle-canvas');
        this.featureCards = document.querySelectorAll('.feature-card');

        this.init();
    }

    init() {
        this.setupInitialStates();
        setTimeout(() => this.playFullEntrance(), 100);
        this.setupScrollAnimations();
    }

    setupInitialStates() {
        if (this.navbar) {
            this.navbar.style.opacity = '0';
            this.navbar.style.transform = 'translateY(-20px)';
        }

        if (this.particleCanvas) {
            this.particleCanvas.style.transform = 'scale(0.5)';
            this.particleCanvas.style.opacity = '0';
        }
    }

    playFullEntrance() {
        const tl = anime.timeline({ easing: 'easeOutExpo' });

        // Particles aperture
        if (this.particleCanvas) {
            tl.add({
                targets: this.particleCanvas,
                scale: [0.5, 1],
                opacity: [0, 1],
                duration: 1500,
                easing: 'easeOutCubic'
            });
        }

        // Navbar slides down
        if (this.navbar) {
            tl.add({
                targets: this.navbar,
                opacity: [0, 1],
                translateY: [-20, 0],
                duration: 800,
            }, '-=1200');
        }

        // Nav links staggered
        if (this.navLinks.length > 0) {
            this.navLinks.forEach(link => {
                link.style.opacity = '0';
                link.style.transform = 'translateY(-10px)';
            });

            tl.add({
                targets: '.magic-nav-link',
                opacity: [0, 1],
                translateY: [-10, 0],
                duration: 500,
                delay: anime.stagger(80),
            }, '-=400');
        }

        // Title lines
        if (this.titleLines.length > 0) {
            tl.add({
                targets: '.title-line',
                opacity: [0, 1],
                translateY: [40, 0],
                duration: 1000,
                delay: anime.stagger(150),
                complete: () => this.startShimmerLoop()
            }, '-=300');
        }

        // Description
        if (this.description) {
            tl.add({
                targets: this.description,
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 800,
            }, '-=600');
        }

        // CTA button
        if (this.cta) {
            tl.add({
                targets: this.cta,
                opacity: [0, 1],
                translateY: [20, 0],
                scale: [0.95, 1],
                duration: 800,
            }, '-=500');
        }
    }

    startShimmerLoop() {
        const shimmer = () => {
            anime({
                targets: '.title-line',
                backgroundPosition: ['100% center', '-100% center'],
                duration: 2000,
                delay: anime.stagger(100),
                easing: 'easeInOutSine',
                complete: () => {
                    this.titleLines.forEach(line => {
                        line.style.backgroundPosition = '100% center';
                    });
                    setTimeout(shimmer, 5000);
                }
            });
        };
        setTimeout(shimmer, 1500);
    }

    setupScrollAnimations() {
        // Intersection Observer for scroll reveal
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('revealed')) {
                    entry.target.classList.add('revealed');
                    this.animateElement(entry.target);
                }
            });
        }, observerOptions);

        // Observe feature cards
        this.featureCards.forEach(card => observer.observe(card));

        // Observe section titles
        document.querySelectorAll('.features-section h2, .tech-stack h2').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            observer.observe(el);
        });
    }

    animateElement(element) {
        const index = Array.from(this.featureCards).indexOf(element);
        const delay = index >= 0 ? index * 100 : 0;

        anime({
            targets: element,
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 800,
            delay: delay,
            easing: 'easeOutCubic'
        });
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    new HeroAnimations();
});
