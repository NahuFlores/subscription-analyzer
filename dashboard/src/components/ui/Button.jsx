import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

const Button = React.memo(({ children, className, variant = 'primary', icon: Icon, loading = false, onClick, disabled, ...props }) => {

    const buttonClasses = useMemo(() => {
        const variants = {
            primary: "bg-primary text-white shadow-lg shadow-primary/25 hover:bg-indigo-500",
            secondary: "bg-white/10 text-text-secondary hover:bg-white/20 hover:text-white border border-white/10",
            danger: "bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20",
            ghost: "hover:bg-white/10 text-text-secondary hover:text-white",
            outline: "border border-white/20 text-white hover:bg-white/5",
            cta: "bg-linear-to-r from-primary to-accent-purple text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:brightness-110"
        };

        return twMerge(
            // UI/UX PRO MAX: 
            // - min-h-[44px] for touch targets
            // - cursor-pointer explicit
            // - active:scale-95 for tactile feedback
            // - cubic-bezier transition for smooth feel
            "relative flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium",
            "min-h-[44px] min-w-[44px] cursor-pointer",
            "transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
            variants[variant],
            className
        );
    }, [variant, className]);

    const motionProps = useMemo(() => ({
        // Micro-interaction: Subtle scale bounce
        whileHover: !loading && !disabled ? { scale: 1.03 } : {},
        whileTap: !loading && !disabled ? { scale: 0.96 } : {},
        transition: { type: "spring", stiffness: 400, damping: 10 }
    }), [loading, disabled]);

    return (
        <motion.button
            {...motionProps}
            onClick={onClick}
            disabled={loading || disabled}
            className={buttonClasses}
            {...props}
        >
            {loading ? (
                <Loader2 size={18} className="animate-spin" />
            ) : (
                Icon && <Icon size={18} strokeWidth={2.5} />
            )}
            {children}
        </motion.button>
    );
});

Button.displayName = 'Button';

export default Button;
