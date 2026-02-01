import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

const AIInsights = ({ insights = [] }) => {

    const getIcon = (type) => {
        switch (type) {
            case 'warning': return { icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
            case 'tip': return { icon: Lightbulb, color: '#eab308', bg: 'rgba(234, 179, 8, 0.1)' };
            case 'success': return { icon: CheckCircle, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
            default: return { icon: TrendingUp, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' };
        }
    };

    return (
        <GlassCard className="rounded-[24px] p-6 h-auto min-h-[200px] max-h-[600px] flex flex-col">
            <div className="flex items-center gap-3 mb-6 shrink-0">
                <div className="p-2 rounded-lg bg-primary/10 text-primary animate-pulse-slow">
                    <Lightbulb size={20} />
                </div>
                <h2 className="text-xl font-bold text-white">AI Insights</h2>
            </div>

            <div className="overflow-y-auto custom-scrollbar space-y-4 pr-1 flex-1">
                {insights.length > 0 ? (
                    insights.map((insight, index) => {
                        const { icon: Icon, color, bg } = getIcon(insight.type);
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-4 rounded-2xl bg-white/2 border border-white/5 relative overflow-hidden group"
                            >
                                {/* Colored Stripe */}
                                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: color }}></div>

                                <div className="flex gap-4">
                                    <div
                                        className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: bg, color: color }}
                                    >
                                        <Icon size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-primary leading-relaxed">
                                            {insight.message}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="text-center py-10 opacity-60">
                        <h3 className="text-lg font-medium text-white mb-1">Generating insights...</h3>
                        <p className="text-text-secondary text-sm">Validating recent transactions</p>
                    </div>
                )}
            </div>

            <button className="w-full mt-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-medium text-primary transition-colors border border-white/10">
                Generate Report
            </button>
        </GlassCard>
    );
};

export default AIInsights;
