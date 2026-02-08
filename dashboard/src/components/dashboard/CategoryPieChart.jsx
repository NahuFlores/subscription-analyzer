import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import GlassCard from '../ui/GlassCard';
import { useMemo, useState, useEffect } from 'react';
import { PieChart as PieChartIcon, HelpCircle } from 'lucide-react';
import TooltipUI from '../ui/Tooltip';

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload; // Access the payload property of the first item
        return (
            <motion.div
                key={data.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="bg-[#0f1218]/95 border border-white/10 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] backdrop-blur-md p-4 min-w-[140px]"
            >
                <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">
                    {data.name}
                </p>
                <p className="text-white text-xl font-bold tracking-tight">
                    ${data.value.toFixed(2)}
                </p>
            </motion.div>
        );
    }
    return null;
};

const CategoryPieChart = ({ data }) => {
    // Use provided data or show empty state
    const chartData = data && data.length > 0 ? data : null;
    const hasData = chartData && chartData.length > 0;

    const totalCost = useMemo(() => {
        if (!hasData) return 0;
        return chartData.reduce((acc, curr) => acc + (curr.value || 0), 0);
    }, [chartData, hasData]);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const formattedTotal = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(totalCost);

    return (
        <GlassCard
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-[24px] p-6 flex flex-col h-auto min-h-[340px] relative overflow-hidden"
        >
            <div className="flex items-center gap-2 mb-4 relative z-20">
                <h3 className="text-xl font-bold text-white">Cost by Category</h3>
                <TooltipUI content="Distribution of your spending by category" position="bottom">
                    <HelpCircle size={14} className="text-text-secondary cursor-help" />
                </TooltipUI>
            </div>

            <div className="w-full h-64 relative">
                {hasData ? (
                    <>
                        {/* Central Text for Donut */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-10">
                            <span className="text-xs text-text-secondary uppercase tracking-wider block font-medium">Total</span>
                            <div className="text-2xl font-bold text-white tracking-tight">{formattedTotal}</div>
                        </div>

                        {mounted && (
                            <ResponsiveContainer width="100%" height="100%" debounce={50} minHeight={0} minWidth={0}>
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={75}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} style={{ outline: 'none' }} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        content={<CustomTooltip />}
                                        cursor={false}
                                        wrapperStyle={{ zIndex: 50, pointerEvents: 'none' }}
                                        isAnimationActive={false}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                            <PieChartIcon size={28} className="text-text-secondary" />
                        </div>
                        <h4 className="text-base font-medium text-white mb-2">No data to display</h4>
                        <p className="text-text-secondary text-sm max-w-[180px]">
                            Add subscriptions to see your spending breakdown
                        </p>
                    </div>
                )}
            </div>
        </GlassCard>
    );
};

export default CategoryPieChart;

