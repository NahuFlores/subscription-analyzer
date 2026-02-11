import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, DollarSign, CreditCard } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import Tooltip from '../ui/Tooltip';

const PaymentCalendar = ({ subscriptions = [] }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date()); // Default to today

    // Generate calendar grid days
    const days = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        return eachDayOfInterval({
            start: startDate,
            end: endDate,
        });
    }, [currentMonth]);

    // Map subscriptions to their meaningful dates in the CURRENT view
    const paymentsByDate = useMemo(() => {
        const map = {};
        subscriptions.forEach(sub => {
            let payDate = null;
            const billingDate = sub.next_billing_date || sub.next_billing;
            if (!billingDate) return;

            const dateObj = new Date(billingDate);

            if (sub.billing_cycle === 'monthly') {
                const targetDay = dateObj.getDate();
                const daysInMonth = endOfMonth(currentMonth).getDate();
                const actualDay = Math.min(targetDay, daysInMonth);
                payDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), actualDay);
            } else if (sub.billing_cycle === 'active' || sub.billing_cycle === 'Active') {
                if (isSameMonth(dateObj, currentMonth) && dateObj.getFullYear() === currentMonth.getFullYear()) {
                    payDate = dateObj;
                }
            } else {
                if (isSameMonth(dateObj, currentMonth) && dateObj.getFullYear() === currentMonth.getFullYear()) {
                    payDate = dateObj;
                }
            }

            if (payDate) {
                const dateKey = format(payDate, 'yyyy-MM-dd');
                if (!map[dateKey]) map[dateKey] = [];
                map[dateKey].push({ ...sub, actualPayDate: payDate });
            }
        });
        return map;
    }, [subscriptions, currentMonth]);

    // Get payments for the selected date
    const selectedDatePayments = useMemo(() => {
        const dateKey = format(selectedDate, 'yyyy-MM-dd');
        return paymentsByDate[dateKey] || [];
    }, [selectedDate, paymentsByDate]);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    return (
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full w-full">
            {/* Left: Calendar Grid */}
            <GlassCard className="rounded-[24px] p-3 sm:p-6 lg:flex-1 flex flex-col relative overflow-hidden min-h-[400px] w-full min-w-0">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 text-primary">
                            <CalendarIcon size={16} className="sm:w-5 sm:h-5" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-white capitalize">
                            {format(currentMonth, 'MMMM yyyy')}
                        </h2>
                    </div>
                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/5">
                        <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded-md transition-colors text-white">
                            <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
                        </button>
                        <button onClick={() => {
                            const now = new Date();
                            setCurrentMonth(now);
                            setSelectedDate(now);
                        }} className="px-2 sm:px-3 text-[10px] sm:text-xs font-medium text-white/70 hover:text-white transition-colors">
                            Today
                        </button>
                        <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded-md transition-colors text-white">
                            <ChevronRight size={16} className="sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 gap-1 lg:gap-2 mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div key={day} className="text-center text-xs font-semibold text-text-secondary uppercase tracking-wider py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 lg:gap-2 auto-rows-fr flex-1">
                    {days.map((day) => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const dayPayments = paymentsByDate[dateKey] || [];
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isTodayDate = isToday(day);
                        const isSelected = isSameDay(day, selectedDate);

                        return (
                            <div
                                key={day.toString()}
                                onClick={() => setSelectedDate(day)}
                                className={`
                                    relative rounded-xl border p-2 transition-all duration-200 cursor-pointer flex flex-col items-center justify-start gap-1
                                    min-h-[50px] sm:min-h-[80px]
                                    ${isSelected
                                        ? 'bg-primary/20 border-primary/50 ring-1 ring-primary/50'
                                        : isCurrentMonth
                                            ? 'bg-white/2 hover:bg-white/5 border-white/5 hover:border-white/10'
                                            : 'bg-transparent opacity-30 border-transparent hover:bg-white/5'}
                                `}
                            >
                                <span className={`text-sm font-medium ${isTodayDate ? 'text-primary' : 'text-text-secondary'}`}>
                                    {format(day, 'd')}
                                </span>

                                {/* Indicators (Dots) */}
                                <div className="flex flex-wrap justify-center gap-1 w-full px-1">
                                    {dayPayments.map((sub, idx) => (
                                        <Tooltip
                                            key={`${sub.id}-${idx}`}
                                            content={<span className="text-xs font-bold">{sub.name} - ${sub.cost}</span>}
                                            hideOnMobile={false}
                                        >
                                            <div className={`
                                                w-2 h-2 rounded-full 
                                                ${isSelected ? 'bg-primary shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 'bg-white/20 group-hover:bg-white/40'}
                                                transition-all
                                            `} />
                                        </Tooltip>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </GlassCard>

            {/* Right/Bottom: Selected Day Details */}
            <div className="lg:w-80 shrink-0 flex flex-col gap-4">
                <GlassCard className="rounded-[24px] p-6 h-full flex flex-col">
                    <div className="mb-4 pb-4 border-b border-white/5">
                        <h3 className="text-lg font-bold text-white">
                            {format(selectedDate, 'EEEE, MMM do')}
                        </h3>
                        <p className="text-sm text-text-secondary">
                            {selectedDatePayments.length} payment{selectedDatePayments.length !== 1 ? 's' : ''} due
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                        {selectedDatePayments.length > 0 ? (
                            selectedDatePayments.map((sub, idx) => (
                                <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-white font-bold text-xs ring-1 ring-white/10">
                                            {sub.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white group-hover:text-primary transition-colors">{sub.name}</div>
                                            <div className="text-xs text-text-secondary">{sub.category}</div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-white bg-white/5 px-2 py-1 rounded-lg">
                                        ${sub.cost.toFixed(2)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-4 min-h-[200px] text-text-secondary/50">
                                <CreditCard size={48} className="mb-4 opacity-20" />
                                <p className="text-sm">No payments scheduled<br />for this day</p>
                            </div>
                        )}
                    </div>

                    {selectedDatePayments.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-white">
                            <span className="text-sm font-medium text-text-secondary">Total</span>
                            <span className="text-xl font-bold text-primary">
                                ${selectedDatePayments.reduce((acc, s) => acc + s.cost, 0).toFixed(2)}
                            </span>
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    );
};

export default PaymentCalendar;
