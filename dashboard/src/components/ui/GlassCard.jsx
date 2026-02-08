import { useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * GlassCard Component
 * Encapsulates the glassmorphism effect with performance optimizations.
 * 
 * Features:
 * - Hardware acceleration (translateZ(0)) via 'glass' class
 * - Optimized hover effects (transform-only) to prevent flickering
 * - Full Framer Motion support (accepts initial, animate, transition, etc.)
 * 
 * @param {React.ReactNode} children - Content to display
 * @param {string} className - Additional CSS classes
 * @param {boolean} hoverEffect - Enable the smooth lift effect on hover (default: false)
 * @param {object} props - All other props passed to motion.div
 */
const GlassCard = ({
    children,
    className = "",
    hoverEffect = false,
    ...props
}) => {
    // Optimization: Memoize the class string to prevent recalculation on every render
    const cardClasses = useMemo(() => `
        glass rounded-[24px]
        ${hoverEffect ? 'hover:translate-y-[-6px] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform cursor-pointer' : ''}
        ${className}
    `, [hoverEffect, className]);

    return (
        <motion.div
            className={cardClasses}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;
