import { autoAdjustSpotlight } from '../utils/shepherdUtils';

// Helper to check for mobile/tablet screen size (matching Tailwind md: 768px)
const isMobile = () => window.innerWidth < 768;

export const TOUR_STEPS = [
    {
        id: 'welcome',
        title: 'Welcome to SubAnalyzer!',
        text: 'Your personal subscription tracker. We help you monitor all your recurring payments, visualize spending patterns, and identify savings opportunities.<br><br><span class="text-xs opacity-60">Step 1 of 4</span>',
        // Centered step (no attachTo)
        buttons: [
            {
                text: 'Skip Tour',
                action: function () { this.cancel(); },
                secondary: true
            },
            {
                text: 'Let\'s Go!',
                action: function () { this.next(); }
            }
        ]
    },

    /* ═══════════════════════════════════════════════════════════════════
       ADD SUBSCRIPTION STEP
       ═══════════════════════════════════════════════════════════════════ */
    // DESKTOP: Top-right button
    {
        id: 'add-subscription-desktop',
        showOn: () => !isMobile(),
        title: 'Add Your Subscriptions',
        text: 'Start by adding your subscriptions here. Enter details like service name, monthly cost, billing date, and category.<br><br><span class="text-xs opacity-60">Step 2 of 4</span>',
        attachTo: {
            element: '#add-subscription-btn',
            on: 'left'
        },
        buttons: [
            {
                text: 'Back',
                action: function () { this.back(); },
                secondary: true
            },
            {
                text: 'Next',
                action: function () { this.next(); }
            }
        ]
    },
    // MOBILE: Radial Menu
    {
        id: 'add-subscription-mobile',
        showOn: () => isMobile(),
        title: 'Add New Subscription',
        text: 'Tap this button to open the menu. You can add subscriptions manually or use other future tools from here.<br><br><span class="text-xs opacity-60">Step 2 of 4</span>',
        attachTo: {
            element: '#add-subscription-mobile-btn',
            on: 'top'
        },
        buttons: [
            {
                text: 'Back',
                action: function () { this.back(); },
                secondary: true
            },
            {
                text: 'Next',
                action: function () { this.next(); }
            }
        ]
    },

    /* ═══════════════════════════════════════════════════════════════════
       DEMO DATA STEP
       ═══════════════════════════════════════════════════════════════════ */
    // DESKTOP: Sidebar Button
    {
        id: 'demo-data-desktop',
        showOn: () => !isMobile(),
        title: 'Try Demo Data',
        text: 'New here? Click this button to instantly load sample subscriptions. This lets you explore all features—charts, insights, and analytics—without entering your own data first.<br><br><span class="text-xs opacity-60">Step 3 of 4</span>',
        attachTo: {
            element: '#demo-data-btn',
            on: 'right'
        },
        buttons: [
            {
                text: 'Back',
                action: function () { this.back(); },
                secondary: true
            },
            {
                text: 'Next',
                action: function () { this.next(); }
            }
        ]
    },
    // MOBILE: Menu Trigger
    {
        id: 'demo-data-mobile',
        showOn: () => isMobile(),
        title: 'Menu & Options',
        text: 'Tap this menu icon to access the Sidebar. Inside, you\'ll find the "Load Demo Data" button and other navigation options.<br><br><span class="text-xs opacity-60">Step 3 of 4</span>',
        attachTo: {
            element: '#mobile-menu-trigger',
            on: 'bottom'
        },
        buttons: [
            {
                text: 'Back',
                action: function () { this.back(); },
                secondary: true
            },
            {
                text: 'Next',
                action: function () { this.next(); }
            }
        ]
    },

    /* ═══════════════════════════════════════════════════════════════════
       LIST STEP (Shared)
       ═══════════════════════════════════════════════════════════════════ */
    {
        id: 'subscriptions-list',
        title: 'Your Subscriptions List',
        text: 'All your subscriptions appear here in an organized list. You can search, edit details, or delete services you no longer use.<br><br><span class="text-xs opacity-60">Step 4 of 4</span>',
        attachTo: {
            element: '#subscription-list',
            on: 'top'
        },
        // AUTOMATIC SPOTLIGHT adjustment
        beforeShowPromise: function () {
            return autoAdjustSpotlight(this);
        },
        buttons: [
            {
                text: 'Back',
                action: function () { this.back(); },
                secondary: true
            },
            {
                text: 'Finish Tour',
                action: function () { this.complete(); }
            }
        ]
    }
];

export const TOUR_OPTIONS = {
    defaultStepOptions: {
        classes: 'shepherd-theme-custom',
        cancelIcon: {
            enabled: true
        },
        scrollTo: { behavior: 'smooth', block: 'center' },
        modalOverlayOpeningPadding: 16,
        modalOverlayOpeningRadius: 16,
        popperOptions: {
            modifiers: [{ name: 'offset', options: { offset: [0, 24] } }]
        }
    },
    useModalOverlay: true,
    keyboardNavigation: true
};
