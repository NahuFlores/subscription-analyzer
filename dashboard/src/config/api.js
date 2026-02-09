/**
 * API Configuration
 * Handles different base URLs for development vs production
 */

// In production, we need absolute paths because dashboard is served from /dashboard/
// In development, Vite dev server handles proxying automatically
const getApiBaseUrl = () => {
    // Check if we're in production (built app)
    if (import.meta.env.PROD) {
        // Use absolute path from root, not relative to /dashboard/
        return '/api';
    }
    // In development, use relative path (Vite dev server will proxy)
    return '/api';
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Get or create a unique user ID for this browser session.
 * Stored in localStorage so it persists across page reloads.
 * Each browser/device gets its own private subscription data.
 */
const getUserId = () => {
    const STORAGE_KEY = 'subscription_analyzer_user_id';
    let userId = localStorage.getItem(STORAGE_KEY);

    if (!userId) {
        // Generate a new UUID using the native crypto API (fast & secure)
        userId = crypto.randomUUID();
        localStorage.setItem(STORAGE_KEY, userId);
    }

    return userId;
};

export const USER_ID = getUserId();

// Helper function to build API URLs
export const buildApiUrl = (endpoint) => {
    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${API_BASE_URL}${normalizedEndpoint}`;
};

/**
 * Helper to perform authenticated fetches
 * Automatically appends user_id to query params
 */
export const fetchWithAuth = async (endpoint, options = {}) => {
    const urlString = buildApiUrl(endpoint);
    const url = new URL(urlString, window.location.origin);

    // Always append user_id
    url.searchParams.append('user_id', USER_ID);

    return fetch(url.toString(), options);
};
