/**
 * useOnboardingTour Hook
 * Manages tour state and localStorage persistence
 * Clean Code: Single Responsibility, intention-revealing names
 */

const STORAGE_KEY = 'onboarding_completed';

export const useOnboardingTour = () => {
    // Check if user has completed the tour
    const isFirstVisit = () => {
        try {
            return !localStorage.getItem(STORAGE_KEY);
        } catch {
            return true; // Default to showing tour if localStorage unavailable
        }
    };

    // Mark tour as complete
    const markAsComplete = () => {
        try {
            localStorage.setItem(STORAGE_KEY, 'true');
        } catch {
            // Silently fail if localStorage unavailable
        }
    };

    // Reset tour (for testing)
    const resetTour = () => {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch {
            // Silently fail if localStorage unavailable
        }
    };

    return { isFirstVisit, markAsComplete, resetTour };
};

export default useOnboardingTour;
