import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, CreditCard, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { useAlerts } from '../../hooks/useAlerts.jsx';

const ALERT_ICONS = {
    upcoming_payment: CreditCard,
    unused_subscription: AlertTriangle,
    cost_spike: TrendingUp,
    savings_opportunity: DollarSign
};

const ALERT_COLORS = {
    upcoming_payment: '#3b82f6',
    unused_subscription: '#f59e0b',
    cost_spike: '#ef4444',
    savings_opportunity: '#10b981'
};

const ALERT_LABELS = {
    upcoming_payment: 'Payment',
    unused_subscription: 'Unused',
    cost_spike: 'High Cost',
    savings_opportunity: 'Savings'
};

const NotificationBell = ({ onAction }) => {
    const { alerts, unreadCount, markAsRead, markAllRead, dismissAlert } = useAlerts();
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef(null);
    const bellRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                isOpen &&
                panelRef.current && !panelRef.current.contains(e.target) &&
                bellRef.current && !bellRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleBellClick = () => {
        setIsOpen(prev => !prev);
    };

    const handleAlertClick = (alert) => {
        markAsRead(alert.alert_id);
        setIsOpen(false);
        if (onAction) {
            onAction(alert);
        }
    };

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                ref={bellRef}
                onClick={handleBellClick}
                className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            >
                <Bell size={20} />

                {/* Badge */}
                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={panelRef}
                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                        className="notification-panel"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                            <h3 className="text-sm font-semibold text-white">
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="ml-2 text-xs font-normal text-white/50">
                                        {unreadCount} new
                                    </span>
                                )}
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="text-xs text-primary hover:text-white transition-colors duration-200 cursor-pointer"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Alert List */}
                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                            {alerts.length === 0 ? (
                                <EmptyState />
                            ) : (
                                alerts.map(alert => (
                                    <AlertItem
                                        key={alert.alert_id}
                                        alert={alert}
                                        onClick={() => handleAlertClick(alert)}
                                        onDismiss={(e) => {
                                            e.stopPropagation();
                                            dismissAlert(alert.alert_id);
                                        }}
                                    />
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


const AlertItem = ({ alert, onClick, onDismiss }) => {
    const Icon = ALERT_ICONS[alert.type] || Bell;
    const color = ALERT_COLORS[alert.type] || '#6366f1';
    const label = ALERT_LABELS[alert.type] || 'Alert';

    return (
        <div
            onClick={onClick}
            className={`
                group flex items-start gap-3 px-4 py-3 border-b border-white/5
                hover:bg-white/5 transition-colors duration-200 cursor-pointer
                ${alert.is_read ? 'opacity-60' : ''}
            `}
        >
            {/* Icon */}
            <div
                className="mt-0.5 p-1.5 rounded-lg shrink-0"
                style={{ backgroundColor: `${color}15`, color }}
            >
                <Icon size={16} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span
                        className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${color}20`, color }}
                    >
                        {label}
                    </span>
                    {!alert.is_read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                </div>
                <p className="text-xs text-white/80 leading-relaxed line-clamp-2">
                    {alert.message}
                </p>
            </div>

            {/* Dismiss */}
            <button
                onClick={onDismiss}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/70 transition-all duration-200 cursor-pointer shrink-0"
                aria-label="Dismiss notification"
            >
                <X size={14} />
            </button>
        </div>
    );
};


const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
        <div className="p-3 rounded-full bg-emerald-500/10 mb-3">
            <CheckCircle size={24} className="text-emerald-400" />
        </div>
        <p className="text-sm font-medium text-white/80">All caught up</p>
        <p className="text-xs text-white/40 mt-1">No new notifications</p>
    </div>
);


export default NotificationBell;
