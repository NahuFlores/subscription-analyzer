/**
 * Shepherd Tour Utilities
 * Automation for "UI/UX Pro Max" functionality
 */

/**
 * Automatically adjusts the spotlight (overlay) radius and padding 
 * based on the target element's computed styles.
 * 
 * Usage: Add this to `beforeShowPromise` in your step config.
 */
export const autoAdjustSpotlight = (step) => {
    return new Promise((resolve) => {
        try {
            // resolve target
            const attachTo = step.options.attachTo || {};
            const elementSelector = attachTo.element;

            if (!elementSelector) {
                resolve();
                return;
            }

            const element = typeof elementSelector === 'string'
                ? document.querySelector(elementSelector)
                : elementSelector;

            if (element) {
                const style = window.getComputedStyle(element);

                // Get border radius (parse '24px' -> 24)
                const borderRadius = parseFloat(style.borderRadius) || 0;

                // standard padding or dynamic?
                // Let's default to a nice breathing room (e.g. 16px) 
                // but enforce a minimum equal to radius for rounded corners
                const basePadding = 16;
                const dynamicPadding = Math.max(basePadding, borderRadius / 1.5);

                // Update step options specifically for the modal
                // Note: Shepherd v10+ structure might vary, but options object is usually mutable
                if (step.options) {
                    step.options.modalOverlayOpeningRadius = borderRadius + 4; // +4 for slight offset
                    // If the user wants specific padding, we can preserve it, 
                    // but here we overwrite to be "automatic"
                    step.options.modalOverlayOpeningPadding = dynamicPadding;

                    // Force update if method exists (sometimes needed for redraw)
                    if (step.updateStepOptions) {
                        step.updateStepOptions({
                            modalOverlayOpeningRadius: borderRadius + 4,
                            modalOverlayOpeningPadding: dynamicPadding
                        });
                    }
                }
            }
        } catch (error) {
            console.warn('Auto-Spotlight Error:', error);
        }
        resolve();
    });
};
