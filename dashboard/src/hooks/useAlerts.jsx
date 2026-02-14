import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { API_BASE_URL, USER_ID } from '../config/api';

/**
 * AlertsContext — single source of truth for notification state.
 * Shared across all NotificationBell instances (mobile + desktop)
 * and persists across modal open/close cycles.
 */
const AlertsContext = createContext(null);

export const AlertsProvider = ({ children }) => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAlerts = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/alerts?user_id=${USER_ID}`);
            const data = await res.json();

            if (data.success) {
                setAlerts(prev => {
                    // Preserve read/dismissed state for alerts that already exist
                    const readIds = new Set(prev.filter(a => a.is_read).map(a => a.alert_id));
                    return data.alerts.map(a => ({
                        ...a,
                        is_read: readIds.has(a.alert_id)
                    }));
                });
            }
        } catch (err) {
            if (import.meta.env.DEV) {
                console.error('Failed to fetch alerts:', err);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);

    const markAsRead = useCallback((alertId) => {
        setAlerts(prev =>
            prev.map(a => a.alert_id === alertId ? { ...a, is_read: true } : a)
        );
    }, []);

    const markAllRead = useCallback(() => {
        setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
    }, []);

    const dismissAlert = useCallback((alertId) => {
        setAlerts(prev => prev.filter(a => a.alert_id !== alertId));
    }, []);

    const unreadCount = useMemo(
        () => alerts.filter(a => !a.is_read).length,
        [alerts]
    );

    const value = useMemo(() => ({
        alerts, unreadCount, loading, markAsRead, markAllRead, dismissAlert, refetch: fetchAlerts
    }), [alerts, unreadCount, loading, markAsRead, markAllRead, dismissAlert, fetchAlerts]);

    return (
        <AlertsContext.Provider value={value}>
            {children}
        </AlertsContext.Provider>
    );
};

export const useAlerts = () => {
    const context = useContext(AlertsContext);
    if (!context) {
        throw new Error('useAlerts must be used within an AlertsProvider');
    }
    return context;
};
