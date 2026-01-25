// Dashboard JavaScript - Main functionality
let subscriptions = [];
let categories = [];

// Initialize dashboard
async function initDashboard() {
    try {
        // Check API health
        const health = await API.checkHealth();
        console.log('API Status:', health);

        // Load categories
        const categoriesData = await API.getCategories();
        categories = categoriesData.categories || [];
        populateCategorySelects();

        // Load data
        await loadDashboardData();

    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showError('Failed to connect to server. Make sure the backend is running.');
    }
}

// Load all dashboard data
async function loadDashboardData() {
    try {
        // Load subscriptions
        const subsData = await API.getSubscriptions();
        subscriptions = subsData.subscriptions || [];

        // Load analytics
        const analytics = await API.getAnalyticsSummary();
        updateStats(analytics.analytics || {});

        // Load charts
        const charts = await API.getCharts();
        renderCharts(charts.charts || {});

        // Load predictions
        const predictions = await API.getPredictions();
        if (predictions.predictions) {
            renderPredictionChart(predictions.predictions);
        }

        // Load insights
        const insights = await API.getInsights();
        renderInsights(insights.insights || []);

        // Render subscriptions
        renderSubscriptions();

    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Update stats cards
function updateStats(analytics) {
    const stats = analytics.statistics || {};

    document.getElementById('total-monthly').textContent =
        `$${stats.total_monthly_cost || 0}`;
    document.getElementById('total-subs').textContent =
        stats.active_subscriptions || 0;

    const savings = analytics.potential_savings || {};
    document.getElementById('potential-savings').textContent =
        `$${savings.total_potential_monthly_savings || 0}`;

    const upcoming = analytics.upcoming_payments || [];
    document.getElementById('upcoming-count').textContent = upcoming.length;
}

// Render charts
function renderCharts(charts) {
    // Category pie chart
    if (charts.category_pie) {
        const chartData = JSON.parse(charts.category_pie);
        Plotly.newPlot('category-chart', chartData.data, chartData.layout, {
            responsive: true,
            displayModeBar: false
        });
    }
}

// Render prediction chart
function renderPredictionChart(predictions) {
    if (!predictions.predictions) return;

    const months = predictions.predictions.map(p => p.month);
    const costs = predictions.predictions.map(p => p.predicted_cost);

    const trace = {
        x: months,
        y: costs,
        type: 'scatter',
        mode: 'lines+markers',
        fill: 'tozeroy',
        line: { color: '#6366f1', width: 3 },
        marker: { size: 8, color: '#8b5cf6' }
    };

    const layout = {
        paper_bgcolor: '#0f172a',
        plot_bgcolor: '#1e293b',
        font: { color: '#f1f5f9' },
        xaxis: { gridcolor: '#334155' },
        yaxis: { gridcolor: '#334155', title: 'Cost ($)' },
        margin: { t: 20, r: 20, b: 40, l: 50 }
    };

    Plotly.newPlot('prediction-chart', [trace], layout, {
        responsive: true,
        displayModeBar: false
    });
}

// Render subscriptions list
function renderSubscriptions() {
    const container = document.getElementById('subscriptions-list');

    if (subscriptions.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No subscriptions yet. Add your first subscription to get started!</p>';
        return;
    }

    container.innerHTML = subscriptions.map(sub => {
        const categoryInfo = categories.find(c => c.name === sub.category) ||
            { icon: '📦', color: '#6b7280' };

        return `
            <div class="subscription-item">
                <div class="subscription-info">
                    <div class="subscription-icon" style="background: ${categoryInfo.color};">
                        ${categoryInfo.icon}
                    </div>
                    <div class="subscription-details">
                        <h4>${sub.name}</h4>
                        <p class="subscription-meta">${sub.category} • Next billing: ${new Date(sub.next_billing).toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="subscription-cost">
                    <div class="cost-amount">$${sub.cost}</div>
                    <div class="cost-cycle">/${sub.billing_cycle}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Render insights
function renderInsights(insights) {
    const container = document.getElementById('insights-list');

    if (insights.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No insights available yet. Add more subscriptions to get AI-powered recommendations!</p>';
        return;
    }

    container.innerHTML = insights.map(insight => `
        <div class="insight-item ${insight.type}">
            <div class="insight-header">
                <span class="insight-icon">${getInsightIcon(insight.type)}</span>
                <h4 class="insight-title">${insight.title}</h4>
            </div>
            <p class="insight-message">${insight.message}</p>
        </div>
    `).join('');
}

function getInsightIcon(type) {
    const icons = {
        warning: '⚠️',
        success: '💰',
        info: '💡'
    };
    return icons[type] || '📊';
}

// Modal functions
function showAddSubscriptionModal() {
    document.getElementById('add-modal').classList.add('active');
    document.getElementById('sub-date').valueAsDate = new Date();
}

function closeAddModal() {
    document.getElementById('add-modal').classList.remove('active');
    document.getElementById('add-subscription-form').reset();
}

// Populate category selects
function populateCategorySelects() {
    const select = document.getElementById('sub-category');
    select.innerHTML = categories.map(cat =>
        `<option value="${cat.name}">${cat.icon} ${cat.name}</option>`
    ).join('');

    const filter = document.getElementById('category-filter');
    filter.innerHTML = '<option value="all">All Categories</option>' +
        categories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('');
}

// Handle form submission
document.getElementById('add-subscription-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        name: document.getElementById('sub-name').value,
        cost: parseFloat(document.getElementById('sub-cost').value),
        billing_cycle: document.getElementById('sub-cycle').value,
        start_date: document.getElementById('sub-date').value,
        category: document.getElementById('sub-category').value
    };

    try {
        const result = await API.createSubscription(formData);

        if (result.success) {
            closeAddModal();
            await loadDashboardData();
        } else {
            alert('Failed to add subscription. Please try again.');
        }
    } catch (error) {
        console.error('Error adding subscription:', error);
        alert('Error adding subscription. Make sure the server is running.');
    }
});

// Error display
function showError(message) {
    const container = document.querySelector('.main-content');
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'background: #ef4444; color: white; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;';
    errorDiv.textContent = message;
    container.insertBefore(errorDiv, container.firstChild);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initDashboard);
