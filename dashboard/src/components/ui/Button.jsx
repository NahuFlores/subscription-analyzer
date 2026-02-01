import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

const Button = ({ children, className, variant = 'primary', icon: Icon, loading = false, onClick, ...props }) => {

    const variants = {
        primary: "bg-primary text-white shadow-lg shadow-primary/25 hover:bg-indigo-500",
        secondary: "bg-white/10 text-text-secondary hover:bg-white/20 hover:text-white border border-white/10",
        danger: "bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20",
        ghost: "hover:bg-white/10 text-text-secondary hover:text-white",
        outline: "border border-white/20 text-white hover:bg-white/5",
        cta: "bg-linear-to-r from-primary to-accent-purple text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:brightness-110"
    };

    return (
        <motion.button
            whileHover={!loading && !props.disabled ? { scale: 1.02 } : {}}
            whileTap={!loading && !props.disabled ? { scale: 0.98 } : {}}
            onClick={onClick}
            disabled={loading || props.disabled}
            className={twMerge(
                "relative flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                variants[variant],
                className
            )}
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
};

export default Button;
