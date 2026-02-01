import { useState, useEffect, useRef } from 'react';
import anime from 'animejs';
import { Plus, FileText, Wand2, PenTool } from 'lucide-react';

const RadialMenu = ({ onAddSubscription }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuItemsRef = useRef([]);
    const mainButtonRef = useRef(null);
    const plusIconRef = useRef(null);

    const actions = [
        {
            id: 'manual',
            icon: PenTool,
            label: 'Manual Entry',
            onClick: onAddSubscription,
            color: '#6366f1' // Primary Indigo
        },
        {
            id: 'scan',
            icon: FileText,
            label: 'Scan Receipt',
            onClick: () => alert("Receipt Scanning features coming soon! 📸"),
            color: '#ec4899' // Pink
        },
        {
            id: 'ai',
            icon: Wand2,
            label: 'AI Auto-Detect',
            onClick: () => alert("AI Bank Connect features coming soon! 🤖"),
            color: '#10b981' // Emerald
        },
    ];

    const menuRadius = 100;

    useEffect(() => {
        // Animate plus icon rotation
        anime({
            targets: plusIconRef.current,
            rotate: isOpen ? 45 : 0,
            duration: 400,
            easing: 'easeOutElastic(1, .6)'
        });

        if (isOpen) {
            // Opening animation - staggered elastic entrance
            menuItemsRef.current.forEach((item, index) => {
                if (!item) return;

                const angle = 180 + (index * (90 / (actions.length - 1)));
                const radian = (angle * Math.PI) / 180;
                const x = Math.cos(radian) * menuRadius;
                const y = Math.sin(radian) * menuRadius;

                // Set initial state
                anime.set(item, {
                    scale: 0,
                    translateX: 0,
                    translateY: 0,
                    opacity: 0
                });

                // Animate to final position
                anime({
                    targets: item,
                    scale: [0, 1.2, 1],
                    translateX: x,
                    translateY: y,
                    opacity: [0, 1],
                    duration: 500,
                    delay: index * 40,
                    easing: 'easeOutElastic(1, .8)'
                });
            });
        } else {
            // Closing animation - smooth collapse to center
            menuItemsRef.current.forEach((item, index) => {
                if (!item) return;

                anime({
                    targets: item,
                    scale: 0,
                    translateX: 0,
                    translateY: 0,
                    opacity: 0,
                    duration: 300,
                    delay: (actions.length - 1 - index) * 30,
                    easing: 'easeInBack'
                });
            });
        }
    }, [isOpen]);

    const handleMainButtonClick = () => {
        // Add a subtle bounce to main button
        anime({
            targets: mainButtonRef.current,
            scale: [1, 0.9, 1.05, 1],
            duration: 400,
            easing: 'easeOutQuad'
        });
        setIsOpen(!isOpen);
    };

    const handleActionClick = (action, index) => {
        // Animate the clicked item
        const item = menuItemsRef.current[index];
        if (item) {
            anime({
                targets: item,
                scale: [1, 1.3, 0],
                opacity: [1, 1, 0],
                duration: 300,
                easing: 'easeInBack',
                complete: () => {
                    setIsOpen(false);
                    action.onClick();
                }
            });
        } else {
            setIsOpen(false);
            action.onClick();
        }
    };

    return (
        <div className="fixed bottom-10 right-10 z-999">
            <div className="relative flex items-center justify-center">

                {/* Menu Items */}
                {actions.map((action, index) => (
                    <button
                        key={action.id}
                        ref={(el) => (menuItemsRef.current[index] = el)}
                        onClick={() => handleActionClick(action, index)}
                        aria-label={action.label}
                        className="absolute w-12 h-12 rounded-full glass border border-white/20 flex items-center justify-center text-white shadow-lg shadow-black/30 hover:scale-110 active:scale-95 transition-transform will-change-transform group"
                        style={{
                            background: `linear-gradient(135deg, ${action.color}30, ${action.color}10)`,
                            opacity: 0,
                            transform: 'scale(0)',
                            pointerEvents: isOpen ? 'auto' : 'none'
                        }}
                        title={action.label}
                    >
                        <action.icon size={20} style={{ color: action.color }} />
                        {/* Label Tooltip */}
                        <span className="absolute right-full mr-3 bg-dark/90 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 backdrop-blur-md">
                            {action.label}
                        </span>
                    </button>
                ))}

                {/* Main Trigger Button */}
                <button
                    ref={mainButtonRef}
                    onClick={handleMainButtonClick}
                    onMouseEnter={() => {
                        anime({
                            targets: mainButtonRef.current,
                            scale: 1.1,
                            duration: 300,
                            easing: 'easeOutQuad'
                        });
                    }}
                    onMouseLeave={() => {
                        anime({
                            targets: mainButtonRef.current,
                            scale: 1,
                            duration: 300,
                            easing: 'easeOutQuad'
                        });
                    }}
                    aria-label={isOpen ? "Close menu" : "Open add menu"}
                    className="relative w-16 h-16 rounded-full bg-linear-to-tr from-primary to-accent-purple text-white shadow-2xl flex items-center justify-center z-50 border border-white/20"
                >
                    <div ref={plusIconRef}>
                        <Plus size={32} />
                    </div>
                </button>

                {/* Pulse Effect when closed */}
                {!isOpen && (
                    <div className="absolute inset-0 rounded-full animate-ping bg-primary/20 -z-10" />
                )}
            </div>
        </div>
    );
};

export default RadialMenu;
