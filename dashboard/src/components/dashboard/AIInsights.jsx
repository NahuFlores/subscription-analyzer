import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, FileText, Loader2, HelpCircle, RotateCcw, Sparkles, RefreshCw } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import Tooltip from '../ui/Tooltip';
import AnimatedGenerateButton from '../ui/AnimatedGenerateButton';
import { API_BASE_URL as API_BASE, USER_ID } from '../../config/api';

const AIInsights = ({ insights = [] }) => {
    // Force refresh
    const [pdfLoading, setPdfLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiData, setAiData] = useState(null);
    const [error, setError] = useState(null);

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

    const fetchAIInsights = async () => {
        setAiLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE}/ai/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: USER_ID })
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Failed to analyze');
            setAiData(data);
        } catch (err) {
            console.error(err);
            setError('AI Advisor is currently unavailable. Please try again later.');
        } finally {
            setAiLoading(false);
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

    // Determine what to show: AI Data or Rule-based Inputs
    const displayInsights = aiData?.insights?.map(text => ({
        type: 'tip', // AI insights are usually tips
        message: text
    })) || insights;

    const riskScore = aiData?.risk_score || 0;
    const riskColor = riskScore <= 3 ? '#10b981' : riskScore <= 7 ? '#f59e0b' : '#ef4444';

    return (
        <GlassCard className="rounded-[24px] p-6 h-full min-h-[200px] max-h-[600px] flex flex-col relative overflow-hidden">
            {/* Header: Responsive Layout - No overflow hidden to prevent shadow clipping */}
            <div className="flex flex-row lg:flex-col xl:flex-row items-center lg:items-start xl:items-center justify-between gap-2 lg:gap-4 xl:gap-2 mb-6 shrink-0 relative z-10 w-full">

                {/* Title Section */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 text-primary animate-pulse-slow shrink-0">
                        <Lightbulb size={18} className="sm:w-5 sm:h-5" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg xl:text-xl font-bold text-white leading-tight whitespace-nowrap">
                            {aiData ? 'AI Advisor' : 'Advisor'}
                        </h2>
                        {aiData && (
                            <span className="hidden sm:block text-xs font-mono text-white/50">
                                Llama 3
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions Section - Stacks on lg, Row on xl/mobile */}
                <div className="flex items-center justify-end lg:justify-start xl:justify-end gap-1.5 sm:gap-2 shrink min-w-0 lg:w-full xl:w-auto">
                    {/* Reset Button - Hidden on very small screens (<360px) to prevent overlap */}
                    {aiData && (
                        <button
                            onClick={() => {
                                setAiData(null);
                                setError(null);
                            }}
                            className="hidden min-[360px]:block p-1.5 sm:p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors shrink-0"
                            title="Back to Default Insights"
                        >
                            <RotateCcw size={14} className="sm:w-4 sm:h-4" />
                        </button>
                    )}

                    {/* Animated Trigger Button */}
                    <div className="shrink min-w-0 flex justify-end lg:justify-start xl:justify-end lg:flex-1 xl:flex-none">
                        <AnimatedGenerateButton
                            labelIdle={aiData ? "Refresh" : "Ask AI"}
                            labelActive="Analyzing..."
                            generating={aiLoading}
                            onClick={fetchAIInsights}
                            highlightHueDeg={260} // Violet/Indigo theme
                            disabled={aiLoading}
                            className="scale-90 sm:scale-100 origin-right lg:origin-left xl:origin-right whitespace-nowrap"
                        />
                    </div>
                </div>
            </div>
            {/* AI Summary Section */}
            {aiData && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10"
                >
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Analysis Summary</h3>
                        <div className="px-2 py-1 rounded-md bg-black/20 text-xs font-bold flex items-center gap-1">
                            Risk Score:
                            <span style={{ color: riskColor }}>{riskScore}/10</span>
                        </div>
                    </div>
                    <p className="text-white text-sm leading-relaxed italic">
                        "{aiData.summary}"
                    </p>
                </motion.div>
            )}

            {/* Loading State */}
            {aiLoading && (
                <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-in fade-in">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                        <Loader2 size={40} className="animate-spin text-primary relative z-10" />
                    </div>
                    <p className="text-sm text-white/70 font-medium animate-pulse">
                        Analyzing spending patterns...
                    </p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-center gap-2">
                    <AlertTriangle size={16} />
                    {error}
                </div>
            )}

            {/* List of Insights */}
            {!aiLoading && (
                <div className="overflow-y-auto custom-scrollbar space-y-4 pr-1 flex-1">
                    {displayInsights.length > 0 ? (
                        displayInsights.map((insight, index) => {
                            // Handle both string insights (from AI) and object insights (from Analyzer)
                            const isObj = typeof insight === 'object';
                            const msg = isObj ? insight.message : insight;
                            const type = isObj ? insight.type : 'tip';

                            const { icon: Icon, color, bg, tooltip } = getIcon(type);
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-4 rounded-2xl bg-white/2 border border-white/5 relative overflow-hidden group hover:bg-white/5 transition-colors"
                                >
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
                                                {msg}
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
                            <h3 className="text-lg font-medium text-white mb-2">No active insights</h3>
                            <p className="text-text-secondary text-sm max-w-[200px] mx-auto">
                                Add more subscriptions to get better analysis.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Footer Action */}
            <div className="mt-4 pt-4 border-t border-white/5 shrink-0 flex flex-col gap-3">
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
                            <span>Download Full Report</span>
                        </>
                    )}
                </button>

                {/* Mobile Only Reset Button (<360px) */}
                <button
                    onClick={() => {
                        setAiData(null);
                        setError(null);
                    }}
                    className="min-[360px]:hidden w-full py-3 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 flex items-center justify-center gap-2 text-sm font-medium text-white/50 hover:text-red-400 transition-all"
                >
                    <RotateCcw size={14} />
                    Start Over
                </button>
            </div>
        </GlassCard>
    );
};

export default AIInsights;

