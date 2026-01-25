/**
 * Magic Indicator Navbar
 * Smooth sliding indicator that follows active/hovered links
 */

class MagicNavbar {
    constructor(navId) {
        this.nav = document.getElementById(navId);
        if (!this.nav) return;

        this.links = this.nav.querySelectorAll('.magic-nav-link');
        this.indicator = this.nav.querySelector('.magic-indicator');
        this.activeLink = null;

        this.init();
    }

    init() {
        // Set initial active link (first link or current page)
        this.setInitialActive();

        // Add event listeners
        this.links.forEach(link => {
            link.addEventListener('mouseenter', (e) => this.onHover(e.target));
            link.addEventListener('mouseleave', () => this.onLeave());
            link.addEventListener('click', (e) => this.onClick(e.target));

            // Keyboard navigation
            link.addEventListener('focus', (e) => this.onHover(e.target));
            link.addEventListener('blur', () => this.onLeave());
        });

        // Update on window resize
        window.addEventListener('resize', () => {
            if (this.activeLink) {
                this.moveIndicator(this.activeLink);
            }
        });
    }

    setInitialActive() {
        // Find active link based on current page or default to first
        const currentPath = window.location.pathname;
        let activeLink = Array.from(this.links).find(link => {
            const href = link.getAttribute('href');
            return href && currentPath.includes(href);
        });

        if (!activeLink) {
            activeLink = this.links[0];
        }

        if (activeLink) {
            this.activeLink = activeLink;
            activeLink.classList.add('active');
            this.moveIndicator(activeLink);
        }
    }

    onHover(link) {
        this.moveIndicator(link);
    }

    onLeave() {
        if (this.activeLink) {
            this.moveIndicator(this.activeLink);
        }
    }

    onClick(link) {
        // Remove active class from all links
        this.links.forEach(l => l.classList.remove('active'));

        // Set new active link
        link.classList.add('active');
        this.activeLink = link;
        this.moveIndicator(link);
    }

    moveIndicator(link) {
        if (!link) return;
        const linkRect = link.getBoundingClientRect();
        const navRect = this.nav.getBoundingClientRect();

        // Calculate position relative to nav
        const left = linkRect.left - navRect.left;
        const width = linkRect.width;

        // Use AnimeJS for the indicator movement to be super smooth
        // and avoid conflicts with CSS transitions during scroll
        anime({
            targets: this.indicator,
            translateX: left,
            width: width,
            opacity: 1,
            duration: 400,
            easing: 'easeOutQuint'
        });
    }

    refresh() {
        if (this.activeLink) {
            // Instant move during high-frequency updates (like scroll animation)
            const linkRect = this.activeLink.getBoundingClientRect();
            const navRect = this.nav.getBoundingClientRect();
            const left = linkRect.left - navRect.left;
            const width = linkRect.width;

            this.indicator.style.transform = `translateX(${left}px)`;
            this.indicator.style.width = `${width}px`;
        }
    }
}

// Hamburger Menu Toggle
class MobileMenu {
    constructor(toggleId, menuId) {
        this.toggle = document.getElementById(toggleId);
        this.menu = document.getElementById(menuId);

        if (!this.toggle || !this.menu) return;

        this.isOpen = false;
        this.init();
    }

    init() {
        this.toggle.addEventListener('click', () => this.toggleMenu());

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen &&
                !this.menu.contains(e.target) &&
                !this.toggle.contains(e.target)) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        this.isOpen = !this.isOpen;

        if (this.isOpen) {
            this.openMenu();
        } else {
            this.closeMenu();
        }
    }

    openMenu() {
        this.toggle.classList.add('active');
        this.menu.classList.add('active');
        this.toggle.setAttribute('aria-expanded', 'true');
    }

    closeMenu() {
        this.toggle.classList.remove('active');
        this.menu.classList.remove('active');
        this.toggle.setAttribute('aria-expanded', 'false');
        this.isOpen = false;
    }
}

// Enhanced Scroll Effect with AnimeJS
class NavbarScrollEffect {
    constructor(magicNavbar) {
        this.navbar = document.querySelector('.magic-navbar-container');
        this.navInner = document.getElementById('magic-navbar');
        this.magicNavbar = magicNavbar;
        if (!this.navbar || !this.navInner) return;

        this.scrollThreshold = 50;
        this.isScrolled = false;
        this.animating = false;

        this.init();
    }

    init() {
        // Check scroll position on load
        this.handleScroll();

        // Listen to scroll events with throttle
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    handleScroll() {
        const scrollPosition = window.scrollY || window.pageYOffset;
        const shouldBeScrolled = scrollPosition > this.scrollThreshold;

        // Only animate if state changes
        if (shouldBeScrolled !== this.isScrolled && !this.animating) {
            this.isScrolled = shouldBeScrolled;

            if (shouldBeScrolled) {
                this.animateIn();
            } else {
                this.animateOut();
            }
        }
    }

    animateIn() {
        this.animating = true;
        this.navbar.classList.add('scrolled');

        // Animate navbar container padding
        const navAnim = anime.timeline({
            duration: 600,
            easing: 'spring(1, 80, 10, 0)',
            update: () => {
                // Keep magic indicator in sync while links are moving
                if (this.magicNavbar) this.magicNavbar.refresh();
            },
            complete: () => {
                this.animating = false;
            }
        });

        navAnim
            .add({
                targets: this.navbar,
                paddingTop: ['0rem', '1rem'],
                paddingBottom: ['0rem', '1rem'],
            })
            .add({
                targets: this.navInner,
                maxWidth: ['1200px', '1100px'],
                paddingTop: ['0rem', '0.75rem'],
                paddingBottom: ['0rem', '0.75rem'],
                borderRadius: ['0px', '16px'],
            }, 0);

        // Animate logo and links with subtle bounce
        anime({
            targets: '.magic-nav-logo, .magic-nav-link',
            translateY: [10, 0],
            opacity: [0.7, 1],
            duration: 500,
            delay: anime.stagger(50),
            easing: 'easeOutElastic(1, .6)'
        });

        // Animate magic indicator appearance
        anime({
            targets: '.magic-indicator',
            opacity: [0, 1],
            duration: 400,
            delay: 200,
            easing: 'easeOutQuad'
        });
    }

    animateOut() {
        this.animating = true;

        const navAnim = anime.timeline({
            duration: 500,
            easing: 'easeOutQuad',
            update: () => {
                // Keep magic indicator in sync while links are moving
                if (this.magicNavbar) this.magicNavbar.refresh();
            },
            complete: () => {
                this.navbar.classList.remove('scrolled');
                this.animating = false;
            }
        });

        navAnim
            .add({
                targets: this.navbar,
                paddingTop: ['1rem', '0rem'],
                paddingBottom: ['1rem', '0rem'],
            })
            .add({
                targets: this.navInner,
                maxWidth: ['1100px', '1200px'],
                paddingTop: ['0.75rem', '0rem'],
                paddingBottom: ['0.75rem', '0rem'],
                borderRadius: ['16px', '0px'],
            }, 0);

        // Fade out effect for links
        anime({
            targets: '.magic-nav-logo, .magic-nav-link',
            opacity: [1, 0.9, 1],
            duration: 300,
            easing: 'easeInOutQuad'
        });
    }
}

// SVG Morphing Animation (Multi-Path System)
class LogoMorph {
    constructor() {
        this.path1 = document.getElementById('morph-path-1'); // Body
        this.path2 = document.getElementById('morph-path-2'); // Detail 1 (e.g., Eye Left)
        this.path3 = document.getElementById('morph-path-3'); // Detail 2 (e.g., Eye Right)

        if (!this.path1 || !this.path2 || !this.path3) return;

        // --- DEFINICIÓN DE FORMAS (Todas normalizadas a curvas Bezier) ---

        // 1. CARD (Tarjeta de Crédito)
        this.card = {
            body: "M 4 12 C 4 8 8 8 20 8 C 32 8 36 8 36 12 C 36 28 36 28 36 28 C 36 32 32 32 20 32 C 8 32 4 32 4 28 Z",
            d1: "M 8 14 C 8 14 14 14 14 14 C 14 18 14 18 14 18 C 14 18 8 18 8 18 C 8 14 8 14 8 14 Z", // Chip
            d2: "M 8 22 C 8 22 32 22 32 22 C 32 24 32 24 32 24 C 32 24 8 24 8 24 C 8 22 8 22 8 22 Z"  // Magnetic Strip
        };

        // 2. ALIEN (Con Ojos!)
        this.alien = {
            body: "M 20 2 C 10 2 4 10 4 18 C 4 28 12 38 20 38 C 28 38 36 28 36 18 C 36 10 30 2 20 2 Z", // Head
            d1: "M 12 16 C 10 14 12 12 14 14 C 16 16 16 20 16 20 C 14 20 12 18 12 16 C 12 16 12 16 12 16 Z", // Left Eye
            d2: "M 26 14 C 28 12 30 14 28 16 C 28 16 28 16 28 16 C 28 18 26 20 24 20 C 24 20 24 16 26 14 Z"  // Right Eye
        };

        // 3. GRAPH (Gráfico de Barras)
        this.graph = {
            body: "M 4 32 C 4 32 36 32 36 32 C 36 34 36 36 36 36 C 36 36 4 36 4 36 C 4 36 4 34 4 32 Z", // Base Line
            d1: "M 8 30 C 8 30 8 16 8 16 C 14 16 14 16 14 16 C 14 16 14 30 14 30 C 14 30 8 30 8 30 Z", // Bar 1
            d2: "M 20 30 C 20 30 20 10 20 10 C 26 10 26 10 26 10 C 26 10 26 30 26 30 C 26 30 20 30 20 30 Z"  // Bar 2
        };

        this.init();
    }

    init() {
        // Set initial shape (Alien)
        this.setPath(this.alien);
        this.startAnimation();

        // Interactive morph on hover
        const logo = document.querySelector('.magic-nav-logo');
        if (logo) {
            logo.addEventListener('mouseenter', () => this.pauseAndMorphTo(this.alien));
            logo.addEventListener('mouseleave', () => this.resumeAnimation());
        }
    }

    setPath(shape) {
        this.path1.setAttribute('d', shape.body);
        this.path2.setAttribute('d', shape.d1);
        this.path3.setAttribute('d', shape.d2);
    }

    startAnimation() {
        const commonProps = {
            duration: 4000,
            easing: 'easeInOutQuad',
            direction: 'alternate',
            loop: true
        };

        this.anim1 = anime({
            targets: this.path1,
            d: [
                { value: this.alien.body },
                { value: this.graph.body },
                { value: this.card.body }
            ],
            ...commonProps
        });

        this.anim2 = anime({
            targets: this.path2,
            d: [
                { value: this.alien.d1 },
                { value: this.graph.d1 },
                { value: this.card.d1 }
            ],
            ...commonProps
        });

        this.anim3 = anime({
            targets: this.path3,
            d: [
                { value: this.alien.d2 },
                { value: this.graph.d2 },
                { value: this.card.d2 }
            ],
            ...commonProps
        });
    }

    pauseAndMorphTo(shape) {
        [this.anim1, this.anim2, this.anim3].forEach(a => { if (a) a.pause() });

        const morphProps = {
            duration: 600,
            easing: 'easeOutElastic(1, .8)'
        };

        anime({ targets: this.path1, d: shape.body, ...morphProps });
        anime({ targets: this.path2, d: shape.d1, ...morphProps });
        anime({ targets: this.path3, d: shape.d2, ...morphProps });
    }

    resumeAnimation() {
        [this.anim1, this.anim2, this.anim3].forEach(a => { if (a) a.restart() });
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const magicNavbar = new MagicNavbar('magic-navbar');
    new MobileMenu('hamburger-toggle', 'mobile-menu');
    new NavbarScrollEffect(magicNavbar);
    new LogoMorph(); // Initialize logo morph
});
