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
export const USER_ID = 'demo_user';

// Helper function to build API URLs
export const buildApiUrl = (endpoint) => {
    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${API_BASE_URL}${normalizedEndpoint}`;
};
