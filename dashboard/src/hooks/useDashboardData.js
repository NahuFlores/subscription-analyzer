import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL as API_BASE, USER_ID } from '../config/api';

// Color palette matching dashboard theme
const CATEGORY_COLORS = {
    'Entertainment': '#6366f1',
    'Productivity': '#ec4899',
    'Infrastructure': '#3b82f6',
    'Education': '#8b5cf6',
    'Health': '#10b981',
    'Communication': '#f59e0b',
    'Finance': '#06b6d4',
    'Other': '#64748b'
};

export const useDashboardData = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAllData = useCallback(async (showLoading = false) => {
        if (showLoading) {
            setLoading(true);
        }

        try {
            // Fetch all required data in parallel
            const [subsRes, summaryRes, chartsRes, insightsRes] = await Promise.all([
                fetch(`${API_BASE}/subscriptions?user_id=${USER_ID}`),
                fetch(`${API_BASE}/analytics/summary?user_id=${USER_ID}`),
                fetch(`${API_BASE}/analytics/charts?user_id=${USER_ID}`),
                fetch(`${API_BASE}/analytics/insights?user_id=${USER_ID}`)
            ]);

            const subsData = await subsRes.json();
            const summaryData = await summaryRes.json();
            const chartsData = await chartsRes.json();
            const insightsData = await insightsRes.json();

            // Transform chart data
            let categoryPieData = [];
            let expenseChartData = [];

            if (chartsData.success) {
                // 1. Transform Category Costs (Object -> Array for Pie Chart)
                if (chartsData.charts?.category_costs) {
                    const categoryCosts = chartsData.charts.category_costs;
                    categoryPieData = Object.entries(categoryCosts).map(([category, value]) => ({
                        name: category,
                        value: value,
                        color: CATEGORY_COLORS[category] || '#64748b'
                    }));
                }

                // 2. Transform Cost Predictions (Array -> Recharts format with better labels)
                if (chartsData.charts?.cost_predictions && Array.isArray(chartsData.charts.cost_predictions)) {
                    expenseChartData = chartsData.charts.cost_predictions.map((prediction) => {
                        const date = new Date(prediction.date);
                        const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

                        return {
                            name: monthName,
                            cost: prediction.predicted_cost,
                            date: prediction.date,
                            isPrediction: prediction.is_prediction !== undefined ? prediction.is_prediction : true
                        };
                    });
                }
            }

            // Construct final data object (create new reference to trigger React update)
            const newData = {
                stats: {
                    total_cost: summaryData.analytics?.statistics?.total_monthly_cost || 0,
                    active_subs: summaryData.analytics?.statistics?.active_subscriptions || 0,
                    potential_savings: summaryData.analytics?.potential_savings?.total_potential_monthly_savings || 0,
                },
                subscriptions: (subsData.subscriptions || []).map(sub => ({
                    ...sub,
                    id: sub.subscription_id || sub.id
                })),
                upcoming_payments: summaryData.analytics?.upcoming_payments || [],
                insights: insightsData.insights || [],
                charts: {
                    categoryPie: categoryPieData,
                    expenseTrend: expenseChartData
                }
            };

            setData(newData);

            if (showLoading) {
                setError(null);
            }
        } catch (err) {
            // Only log errors in development
            if (import.meta.env.DEV) {
                console.error('Error fetching dashboard data:', err);
            }
            if (showLoading) {
                setError(err.message);
            }
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    }, []);

    // Silent refetch - updates data without showing loading state
    // Returns Promise so callers can await completion
    const refetch = useCallback(() => {
        return fetchAllData(false);
    }, [fetchAllData]);

    // Initial load with loading state
    useEffect(() => {
        fetchAllData(true);
    }, []); // Only run on mount

    return { data, loading, error, refetch };
};
