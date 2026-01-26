// API Helper - Handles all API calls
const API_BASE = 'http://localhost:5000/api';
const DEMO_USER_ID = 'demo-user-123';

const API = {
    // Health check
    async checkHealth() {
        const response = await fetch(`${API_BASE}/health`);
        return response.json();
    },

    // Categories
    async getCategories() {
        const response = await fetch(`${API_BASE}/categories`);
        return response.json();
    },

    // Subscriptions
    async getSubscriptions(userId = DEMO_USER_ID) {
        const response = await fetch(`${API_BASE}/subscriptions?user_id=${userId}`);
        return response.json();
    },

    async createSubscription(data) {
        const response = await fetch(`${API_BASE}/subscriptions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, user_id: DEMO_USER_ID })
        });
        return response.json();
    },

    async updateSubscription(id, data) {
        const response = await fetch(`${API_BASE}/subscriptions/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    async deleteSubscription(id) {
        const response = await fetch(`${API_BASE}/subscriptions/${id}`, {
            method: 'DELETE'
        });
        return response.json();
    },

    // Analytics
    async getAnalyticsSummary(userId = DEMO_USER_ID) {
        const response = await fetch(`${API_BASE}/analytics/summary?user_id=${userId}`);
        return response.json();
    },

    async getPredictions(userId = DEMO_USER_ID, months = 6) {
        const response = await fetch(`${API_BASE}/analytics/predictions?user_id=${userId}&months=${months}`);
        return response.json();
    },

    async getCharts(userId = DEMO_USER_ID) {
        const response = await fetch(`${API_BASE}/analytics/charts?user_id=${userId}`);
        return response.json();
    },

    async getInsights(userId = DEMO_USER_ID) {
        const response = await fetch(`${API_BASE}/analytics/insights?user_id=${userId}`);
        return response.json();
    }
};
