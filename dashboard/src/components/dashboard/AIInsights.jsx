import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, FileText, Loader2, HelpCircle } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import Tooltip from '../ui/Tooltip';
import { API_BASE_URL as API_BASE, USER_ID } from '../../config/api';

const AIInsights = ({ insights = [] }) => {
    const [pdfLoading, setPdfLoading] = useState(false);

    const getIcon = (type) => {
        switch (type) {
            case 'warning': return {
                icon: AlertTriangle,
                color: '#ef4444',
                bg: 'rgba(239, 68, 68, 0.1)',
                tooltip: 'This subscription may need your attention'
            };
            case 'tip': return {
                icon: Lightbulb,
                color: '#eab308',
                bg: 'rgba(234, 179, 8, 0.1)',
                tooltip: 'A suggestion to optimize your spending'
            };
            case 'success': return {
                icon: CheckCircle,
                color: '#10b981',
                bg: 'rgba(16, 185, 129, 0.1)',
                tooltip: 'Good news about your subscriptions'
            };
            default: return {
                icon: TrendingUp,
                color: '#6366f1',
                bg: 'rgba(99, 102, 241, 0.1)',
                tooltip: 'Trend analysis insight'
            };
        }
    };

    const downloadPDF = () => {
        setPdfLoading(true);
        try {
            const pdfUrl = `/api/analytics/report/pdf?user_id=${USER_ID}`;
            window.open(pdfUrl, '_blank');
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Error opening PDF:', error);
            }
        } finally {
            setTimeout(() => setPdfLoading(false), 1000);
        }
    };

    return (
        <GlassCard className="rounded-[24px] p-6 h-full min-h-[200px] max-h-[600px] flex flex-col">
            <div className="flex items-center gap-3 mb-6 shrink-0">
                <div className="p-2 rounded-lg bg-primary/10 text-primary animate-pulse-slow">
                    <Lightbulb size={20} />
                </div>
                <h2 className="text-xl font-bold text-white">AI Insights</h2>
                <Tooltip content="AI-powered analysis of your subscriptions" position="right">
                    <HelpCircle size={16} className="text-text-secondary cursor-help" />
                </Tooltip>
            </div>

            <div className="overflow-y-auto custom-scrollbar space-y-4 pr-1 flex-1">
                {insights.length > 0 ? (
                    insights.map((insight, index) => {
                        const { icon: Icon, color, bg, tooltip } = getIcon(insight.type);
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
                                    <Tooltip content={tooltip} position="right">
                                        <div
                                            className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center cursor-help"
                                            style={{ backgroundColor: bg, color: color }}
                                        >
                                            <Icon size={18} />
                                        </div>
                                    </Tooltip>
                                    <div className="flex-1">
                                        <p className="text-sm text-text-primary leading-relaxed">
                                            {insight.message}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="text-center py-10">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                            <Lightbulb size={28} className="text-primary" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">No insights yet</h3>
                        <p className="text-text-secondary text-sm max-w-[200px] mx-auto">
                            Add subscriptions to receive personalized insights and savings tips
                        </p>
                    </div>
                )}
            </div>

            {/* Footer Action */}
            <div className="mt-4 pt-4 border-t border-white/5">
                <button
                    onClick={downloadPDF}
                    disabled={pdfLoading}
                    className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium text-white hover:text-primary transition-all border border-white/5 hover:border-white/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    {pdfLoading ? (
                        <>
                            <Loader2 size={16} className="animate-spin text-primary" />
                            <span className="text-text-secondary">Generating...</span>
                        </>
                    ) : (
                        <>
                            <FileText size={16} className="text-primary group-hover:scale-110 transition-transform" />
                            <span>Generate Report</span>
                        </>
                    )}
                </button>
            </div>
        </GlassCard>
    );
};

export default AIInsights;

