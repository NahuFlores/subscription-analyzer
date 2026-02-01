import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { createPortal } from 'react-dom';

const DatePicker = ({ value, onChange, placeholder = "Select date..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(value ? new Date(value) : undefined);
    const buttonRef = useRef(null);

    const handleSelect = (date) => {
        setSelected(date);
        if (date) {
            onChange(format(date, 'yyyy-MM-dd'));
        }
        setIsOpen(false);
    };

    // Close on Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    // Close on click outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e) => {
            if (buttonRef.current && !buttonRef.current.contains(e.target)) {
                // Check if click is on the calendar
                const calendar = document.getElementById('date-picker-calendar');
                if (calendar && !calendar.contains(e.target)) {
                    setIsOpen(false);
                }
            }
        };

        setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 0);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const displayValue = selected ? format(selected, 'MMM dd, yyyy') : '';

    // Calculate position
    const getCalendarPosition = () => {
        if (!buttonRef.current) return { top: 0, left: 0 };
        const rect = buttonRef.current.getBoundingClientRect();

        return {
            top: rect.bottom + 8,
            left: rect.left + (rect.width / 2)
        };
    };

    const position = isOpen ? getCalendarPosition() : { top: 0, left: 0 };

    return (
        <>
            <div ref={buttonRef} className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:shadow-lg focus:shadow-primary/10 transition-all text-left"
                >
                    <span className={displayValue ? 'text-white' : 'text-white/30'}>
                        {displayValue || placeholder}
                    </span>
                </button>
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary pointer-events-none" />
            </div>

            {isOpen && createPortal(
                <div
                    id="date-picker-calendar"
                    className="fixed z-9999 animate-in fade-in-0 zoom-in-95"
                    style={{
                        top: `${position.top}px`,
                        left: `${position.left}px`,
                        transform: 'translateX(-50%)'
                    }}
                >
                    <div
                        className="rounded-2xl shadow-2xl shadow-black/50 p-3 sm:p-4 w-[260px] xs:w-[280px] sm:w-[300px] calendar-glass"
                        style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
                            transform: 'translateZ(0)',
                            WebkitTransform: 'translateZ(0)',
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            willChange: 'transform, opacity'
                        }}
                    >
                        <DayPicker
                            mode="single"
                            selected={selected}
                            onSelect={handleSelect}
                            className="date-picker-custom"
                            showOutsideDays={true}
                        />
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default DatePicker;
