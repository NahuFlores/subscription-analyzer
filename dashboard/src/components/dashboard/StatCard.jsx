import GlassCard from '../ui/GlassCard';

const StatCard = ({ label, value, subtext, icon: Icon, color, delay = 0 }) => {
    return (
        <GlassCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            hoverEffect={false}
            className="relative p-6 flex flex-col justify-between overflow-hidden group border border-white/5 hover:border-white/20 cursor-default select-none"
        >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/5 to-transparent z-10 pointer-events-none" />

            {/* Background Glow based on Color */}
            <div
                className="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-[60px] opacity-20 group-hover:opacity-50 transition-all duration-500 will-change-transform"
                style={{ backgroundColor: color }}
            />

            <div className="flex justify-between items-start mb-4 relative z-20">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white backdrop-blur-md group-hover:bg-white/10 transition-colors">
                    <Icon size={24} style={{ color: color, filter: `drop-shadow(0 0 12px ${color})` }} />
                </div>
            </div>

            <div className="relative z-20">
                <p className="text-text-secondary text-sm font-medium mb-1 tracking-wide uppercase opacity-80">{label}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-white tracking-tight drop-shadow-sm">{value}</h3>
                </div>
                <p className="text-text-secondary/60 text-xs mt-2 font-medium bg-white/5 inline-block px-2 py-1 rounded-lg border border-white/5">{subtext}</p>
            </div>
        </GlassCard>
    );
};

export default StatCard;
