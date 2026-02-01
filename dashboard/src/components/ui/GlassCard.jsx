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
    return (
        <motion.div
            className={`
                glass rounded-[24px]
                ${hoverEffect ? 'hover:translate-y-[-4px] transition-transform duration-300 will-change-transform' : ''}
                ${className}
            `}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;
