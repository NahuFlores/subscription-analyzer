import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { createPortal } from 'react-dom';
import anime from 'animejs';

const DatePicker = ({ value, onChange, placeholder = "Select date..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(value ? new Date(value) : undefined);
    const buttonRef = useRef(null);

    // Animation refs
    const calendarRef = useRef(null);
    const backdropRef = useRef(null);

    // Animation settings
    const animConfig = {
        duration: 400,
        easing: 'spring(1, 80, 10, 0)'
    };

    const animateOpen = () => {
        // Backdrop
        anime({
            targets: backdropRef.current,
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuad'
        });

        // Calendar
        anime({
            targets: calendarRef.current,
            opacity: [0, 1],
            scale: [0.9, 1],
            translateY: [10, 0],
            translateZ: 0, // Hardware acceleration aid
            ...animConfig
        });
    };

    const previousIsOpen = useRef(isOpen);

    useEffect(() => {
        if (isOpen && !previousIsOpen.current) {
            // Just opened
            // We need to wait a tick for the portal to render
            requestAnimationFrame(() => {
                animateOpen();
            });
        }
        previousIsOpen.current = isOpen;
    }, [isOpen]);


    const handleClose = () => {
        if (!isOpen) return;

        // Animate out
        const timeline = anime.timeline({
            easing: 'easeInQuad',
            duration: 200,
            complete: () => {
                setIsOpen(false);
            }
        });

        timeline.add({
            targets: calendarRef.current,
            opacity: 0,
            scale: 0.95,
            translateY: 10,
        }, 0);

        timeline.add({
            targets: backdropRef.current,
            opacity: 0,
        }, 0);
    };

    const handleToggle = () => {
        if (isOpen) {
            handleClose();
        } else {
            setIsOpen(true);
        }
    };

    const handleSelect = (date) => {
        setSelected(date);
        if (date) {
            onChange(format(date, 'yyyy-MM-dd'));
        }
        handleClose();
    };

    // Close on Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                handleClose();
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
                // Note: refs might be null during unmount, but isOpen check helps
                if (calendarRef.current && !calendarRef.current.contains(e.target)) {
                    // We don't call handleClose() here directly because the backdrop 
                    // click handler also exists. But backdrop is 'fixed inset-0'.
                    // Actually, with a modal/portal, usually the backdrop covers everything else.
                    // So clicking "outside" is clicking the backdrop.
                    // However, if the user scrolls or resizing leads to clicks elsewhere (rare with modal), 
                    // we might want this. 
                    // For this specific UI, the backdrop covers everything. 
                    // But let's keep it robust.
                    // IF the click target is NOT the backdrop (which has its own handler)
                    // and NOT the calendar, then close.
                    if (e.target !== backdropRef.current) {
                        handleClose();
                    }
                }
            }
        };

        // Delay to avoid immediate trigger from the opening click
        setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 0);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const displayValue = selected ? format(selected, 'MMM dd, yyyy') : '';

    return (
        <>
            <div ref={buttonRef} className="relative">
                <button
                    type="button"
                    onClick={handleToggle}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:shadow-lg focus:shadow-primary/10 transition-all text-left"
                >
                    <span className={displayValue ? 'text-white' : 'text-white/30'}>
                        {displayValue || placeholder}
                    </span>
                </button>
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary pointer-events-none" />
            </div>

            {isOpen && createPortal(
                <>
                    {/* Backdrop */}
                    <div
                        ref={backdropRef}
                        className="fixed inset-0 z-9998 bg-black/10 backdrop-blur-sm"
                        style={{ opacity: 0 }} // Start invisible for animejs
                        onClick={handleClose}
                        aria-hidden="true"
                    />

                    <div
                        ref={calendarRef}
                        id="date-picker-calendar"
                        className="fixed z-9999 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        style={{
                            opacity: 0 // Start invisible
                        }}
                    >
                        <div
                            className="rounded-2xl shadow-2xl shadow-black/50 p-3 sm:p-4 w-[260px] xs:w-[280px] sm:w-[300px] calendar-glass"
                        >
                            <DayPicker
                                mode="single"
                                selected={selected}
                                onSelect={handleSelect}
                                className="date-picker-custom"
                                showOutsideDays={true}
                            />
                        </div>
                    </div>
                </>,
                document.body
            )}
        </>
    );
};

export default DatePicker;
