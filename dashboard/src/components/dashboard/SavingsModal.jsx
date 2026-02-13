import LiquidModal from '../ui/LiquidModal';
import { TrendingDown, ArrowRight, DollarSign, AlertTriangle, Calendar, Copy } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';

const SavingsModal = ({ isOpen, onClose, savingsData, onAction }) => {
    // Default data structure if missing
    const { total_potential_monthly_savings = 0, opportunities = [] } = savingsData || {};

    const handleAction = (opp) => {
        if (onAction) {
            onAction(opp);
        }
    };

    const getIconForType = (type) => {
        switch (type) {
            case 'switch_to_annual': return Calendar;
            case 'duplicate_category': return Copy;
            case 'high_cost': return AlertTriangle;
            default: return DollarSign;
        }
    };

    const getColorForType = (type) => {
        switch (type) {
            case 'switch_to_annual': return 'text-emerald-400';
            case 'duplicate_category': return 'text-amber-400';
            case 'high_cost': return 'text-rose-400';
            default: return 'text-primary';
        }
    };

    const getTitleForType = (type) => {
        switch (type) {
            case 'switch_to_annual': return 'Switch to Annual Billing';
            case 'duplicate_category': return 'Consolidate Subscriptions';
            case 'high_cost': return 'Optimize High Cost Plan';
            default: return 'Savings Opportunity';
        }
    };

    const getActionLabel = (type) => {
        switch (type) {
            case 'switch_to_annual': return 'Switch & Save';
            case 'duplicate_category': return 'Review Category';
            case 'high_cost': return 'Edit Plan';
            default: return 'View';
        }
    };

    return (
        <LiquidModal
            isOpen={isOpen}
            onClose={onClose}
            className="w-full max-w-2xl"
        >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <TrendingDown className="text-emerald-400" />
                        Potential Savings
                    </h2>
                    <p className="text-text-secondary mt-1">
                        We found <span className="text-emerald-400 font-bold">${total_potential_monthly_savings}</span> in monthly savings opportunities.
                    </p>
                </div>

                <div className="text-right hidden sm:block">
                    <div className="text-sm text-text-secondary">Annual Impact</div>
                    <div className="text-xl font-bold text-white">
                        ${(total_potential_monthly_savings * 12).toFixed(2)} / yr
                    </div>
                </div>
            </div>

            {/* Opportunities List */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {opportunities.length > 0 ? (
                    opportunities.map((opp, index) => {
                        const Icon = getIconForType(opp.type);
                        const colorClass = getColorForType(opp.type);

                        return (
                            <GlassCard
                                key={index}
                                className="relative overflow-hidden p-4 border border-white/5 hover:border-white/20 transition-all group cursor-pointer active:scale-[0.99]"
                                hoverEffect={false}
                                onClick={() => handleAction(opp)}
                            >
                                {/* Shimmer Effect */}
                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/5 to-transparent z-10 pointer-events-none" />

                                <div className="flex items-start gap-3 sm:gap-4 relative z-20">
                                    <div className={`p-2 sm:p-3 rounded-xl bg-white/5 ${colorClass} shrink-0`}>
                                        <Icon size={20} className="sm:w-6 sm:h-6" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                            <h3 className="font-bold text-white text-base sm:text-lg group-hover:text-emerald-400 transition-colors leading-tight">
                                                {getTitleForType(opp.type)}
                                            </h3>
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
                                            {!opp.subscription && <div className="hidden sm:block"></div>} {/* Spacer */}

                                            <div className="w-full sm:w-auto flex items-center justify-end gap-1 text-sm font-medium text-emerald-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity sm:-translate-x-2 sm:group-hover:translate-x-0 duration-300">
                                                {getActionLabel(opp.type)} <ArrowRight size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        );
                    })
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
            <div className="p-6 border-t border-white/5 bg-white/2 flex justify-between items-center">
                <p className="text-xs text-text-secondary">
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
