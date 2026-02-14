import LiquidModal from '../ui/LiquidModal';
import { TrendingDown, ArrowRight, DollarSign, AlertTriangle, Calendar, Copy, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';

const OPPORTUNITY_CONFIG = {
    switch_to_annual: { icon: Calendar, color: 'text-emerald-400', title: 'Switch to Annual Billing', action: 'Switch & Save' },
    duplicate_category: { icon: Copy, color: 'text-amber-400', title: 'Consolidate Subscriptions', action: 'Review Category' },
    high_cost: { icon: AlertTriangle, color: 'text-rose-400', title: 'Optimize High Cost Plan', action: 'Edit Plan' }
};

const DEFAULT_CONFIG = { icon: DollarSign, color: 'text-primary', title: 'Savings Opportunity', action: 'View' };

const getConfig = (type) => OPPORTUNITY_CONFIG[type] || DEFAULT_CONFIG;

// Animation variants for stagger effect
const listVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } }
};

const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.23, 1, 0.32, 1] } }
};

const SavingsModal = ({ isOpen, onClose, savingsData, onAction }) => {
    const { total_potential_monthly_savings = 0, opportunities = [] } = savingsData || {};

    // 1. Sort by highest savings first
    const sortedOpportunities = useMemo(
        () => [...opportunities].sort((a, b) => (b.potential_monthly_savings || 0) - (a.potential_monthly_savings || 0)),
        [opportunities]
    );

    const handleAction = (opp) => {
        if (onAction) {
            onAction(opp);
        }
    };

    return (
        <LiquidModal
            isOpen={isOpen}
            onClose={onClose}
            className="w-full max-w-2xl"
        >
            {/* Header */}
            <div className="px-4 py-3 sm:p-6 border-b border-white/5">
                <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
                    <TrendingDown className="text-emerald-400" size={20} />
                    Potential Savings
                </h2>
                <p className="text-text-secondary mt-1 text-xs sm:text-base">
                    Opportunities sorted by highest impact first.
                </p>
            </div>

            {/* 2. Hero Stats Card */}
            {total_potential_monthly_savings > 0 && (
                <div className="mx-4 sm:mx-6 mt-4 sm:mt-6">
                    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-linear-to-br from-emerald-500/10 via-emerald-600/5 to-transparent border border-emerald-500/20 p-3 sm:p-5">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                            <div>
                                <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-400/70 mb-0.5 sm:mb-1">
                                    Total Monthly Savings
                                </div>
                                <div className="text-2xl sm:text-3xl font-bold text-white">
                                    ${total_potential_monthly_savings.toFixed(2)}
                                    <span className="text-sm sm:text-base font-normal text-white/40 ml-1">/mo</span>
                                </div>
                            </div>
                            <div className="sm:text-right">
                                <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/40 mb-0.5 sm:mb-1">
                                    Annual Impact
                                </div>
                                <div className="text-lg sm:text-2xl font-bold text-emerald-400">
                                    ${(total_potential_monthly_savings * 12).toFixed(2)}
                                    <span className="text-xs sm:text-sm font-normal text-emerald-400/60 ml-1">/yr</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-2 sm:mt-3 text-[10px] sm:text-xs text-white/40">
                            {sortedOpportunities.length} optimization{sortedOpportunities.length !== 1 ? 's' : ''} found
                        </div>
                    </div>
                </div>
            )}

            {/* Opportunities List with 4. Stagger Animation */}
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {sortedOpportunities.length > 0 ? (
                    <motion.div
                        className="space-y-4"
                        variants={listVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {sortedOpportunities.map((opp, index) => {
                            const config = getConfig(opp.type);
                            const Icon = config.icon;
                            const isHighestImpact = index === 0;

                            return (
                                <motion.div key={index} variants={cardVariants}>
                                    <GlassCard
                                        className="relative overflow-hidden p-3 sm:p-4 border border-white/5 hover:border-white/20 transition-all group cursor-pointer active:scale-[0.99]"
                                        hoverEffect={false}
                                        onClick={() => handleAction(opp)}
                                    >
                                        {/* Shimmer Effect */}
                                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/5 to-transparent z-10 pointer-events-none" />

                                        <div className="flex items-start gap-3 sm:gap-4 relative z-20">
                                            <div className={`p-2 sm:p-3 rounded-xl bg-white/5 ${config.color} shrink-0`}>
                                                <Icon size={20} className="sm:w-6 sm:h-6" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-white text-sm sm:text-base md:text-lg group-hover:text-emerald-400 transition-colors leading-tight">
                                                            {config.title}
                                                        </h3>
                                                        {/* 1. "Highest Impact" badge */}
                                                        {isHighestImpact && (
                                                            <span className="hidden sm:flex items-center gap-1 bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-500/20 whitespace-nowrap">
                                                                <Zap size={10} />
                                                                Highest Impact
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex justify-start sm:justify-end">
                                                        <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-500/20 whitespace-nowrap">
                                                            Save ${opp.potential_monthly_savings}/mo
                                                        </span>
                                                    </div>
                                                </div>

                                                <p className="text-text-secondary text-sm mt-2 leading-relaxed">
                                                    {opp.suggestion || `Save by optimizing your ${opp.subscription || opp.category} subscription.`}
                                                </p>

                                                <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                                    {opp.subscription && (
                                                        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 text-xs text-white/50 bg-white/5 px-3 py-2 rounded-lg">
                                                            <span>Current: ${opp.current_monthly}/mo</span>
                                                            <ArrowRight size={12} />
                                                            <span className="text-white font-medium">New: ${(opp.current_monthly - opp.potential_monthly_savings).toFixed(2)}/mo</span>
                                                        </div>
                                                    )}
                                                    {!opp.subscription && <div className="hidden sm:block"></div>}

                                                    <div className="w-full sm:w-auto flex items-center justify-end gap-1 text-sm font-medium text-emerald-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity sm:-translate-x-2 sm:group-hover:translate-x-0 duration-300">
                                                        {config.action} <ArrowRight size={16} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <DollarSign className="w-8 h-8 text-white/20" />
                        </div>
                        <h3 className="text-lg font-medium text-white">No obvious savings found</h3>
                        <p className="text-text-secondary mt-2 max-w-xs mx-auto">
                            Great job! Your subscriptions seem optimized. Check back later as your portfolio grows.
                        </p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 sm:p-6 border-t border-white/5 bg-white/2 flex justify-between items-center">
                <p className="text-[10px] sm:text-xs text-text-secondary">
                    * Savings are estimates based on standard plan pricing.
                </p>
                <Button onClick={onClose} variant="secondary">
                    Close
                </Button>
            </div>
        </LiquidModal>
    );
};

export default SavingsModal;
