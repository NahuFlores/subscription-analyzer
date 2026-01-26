/**
 * Magic Navbar
 * Mobile menu and scroll effect for the navbar
 */

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

// Scroll Effect - Pure CSS Transitions (no bounce)
class NavbarScrollEffect {
    constructor() {
        this.navbar = document.querySelector('.magic-navbar-container');
        if (!this.navbar) return;

        this.scrollThreshold = 50;
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

        if (scrollPosition > this.scrollThreshold) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    new MobileMenu('hamburger-toggle', 'mobile-menu');
    new NavbarScrollEffect();
});
