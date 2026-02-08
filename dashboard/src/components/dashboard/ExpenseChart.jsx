import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import GlassCard from '../ui/GlassCard';
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, HelpCircle } from 'lucide-react';
import TooltipUI from '../ui/Tooltip';

const ExpenseChart = ({ data }) => {
    const [mounted, setMounted] = useState(false);
    const hasData = data && data.length > 0;

    useEffect(() => {
        setMounted(true);
    }, []);

    // Calculate trend
    const getTrend = () => {
        if (!hasData || data.length < 2) return null;
        const first = data[0].cost;
        const last = data[data.length - 1].cost;
        const change = ((last - first) / first) * 100;
        return {
            direction: change >= 0 ? 'up' : 'down',
            percentage: Math.abs(change).toFixed(1)
        };
    };

    const trend = getTrend();

    // Custom tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-surface/95 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-xl">
                    <p className="text-white font-semibold mb-1">{data.name}</p>
                    <p className="text-primary text-lg font-bold">
                        ${payload[0].value.toFixed(2)}
                    </p>
                    {data.isPrediction && (
                        <p className="text-xs text-text-secondary mt-1">Predicted</p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <GlassCard
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-[24px] p-6 flex flex-col h-[350px] relative overflow-hidden"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">Monthly Cost Forecast</h3>
                    <TooltipUI content="Predicted spending based on your subscriptions" position="bottom">
                        <HelpCircle size={14} className="text-text-secondary cursor-help" />
                    </TooltipUI>
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${trend.direction === 'up' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                        }`}>
                        {trend.direction === 'up' ? (
                            <TrendingUp className="w-4 h-4" />
                        ) : (
                            <TrendingDown className="w-4 h-4" />
                        )}
                        <span className="text-sm font-semibold">{trend.percentage}%</span>
                    </div>
                )}
            </div>

            <div className="w-full flex-1">
                {mounted && hasData ? (
                    <ResponsiveContainer width="100%" height="100%" debounce={50} minHeight={0} minWidth={0}>
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#cbd5e1', fontSize: 11 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#cbd5e1', fontSize: 11 }}
                                tickFormatter={(value) => `$${value}`}
                                width={50}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="cost"
                                stroke="#6366f1"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorCost)"
                                dot={{ fill: '#6366f1', r: 4 }}
                                activeDot={{ r: 6, fill: '#6366f1' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                            <BarChart3 size={28} className="text-text-secondary" />
                        </div>
                        <h4 className="text-base font-medium text-white mb-2">No forecast available</h4>
                        <p className="text-text-secondary text-sm max-w-[200px]">
                            Add subscriptions to see your spending predictions
                        </p>
                    </div>
                )}
            </div>

            {/* Gloss Highlight */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none" />
        </GlassCard>
    );
};

export default ExpenseChart;
