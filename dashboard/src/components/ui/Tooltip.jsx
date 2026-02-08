import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Tooltip component with hover reveal
 * Hidden on mobile/tablet since hover doesn't work on touch devices
 * Usage: <Tooltip content="Explanation text"><button>Hover me</button></Tooltip>
 */
const Tooltip = ({ children, content, position = 'top', hideOnMobile = true }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const positions = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    // Hide trigger icon on mobile if hideOnMobile is true
    if (hideOnMobile && isMobile) {
        return null;
    }

    return (
        <div
            className="relative inline-flex"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute ${positions[position]} z-50 px-3 py-2 text-xs text-white bg-slate-800 rounded-lg shadow-lg border border-white/10 max-w-[200px] text-center pointer-events-none`}
                    >
                        {content}
                        {/* Arrow */}
                        <div
                            className={`absolute w-2 h-2 bg-slate-800 border-white/10 rotate-45 ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2 border-r border-b' :
                                    position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2 border-l border-t' :
                                        position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2 border-t border-r' :
                                            'left-[-4px] top-1/2 -translate-y-1/2 border-b border-l'
                                }`}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Tooltip;

