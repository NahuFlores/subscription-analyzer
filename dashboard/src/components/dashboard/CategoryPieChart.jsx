import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';
import GlassCard from '../ui/GlassCard';
import { useMemo, useState, useEffect } from 'react';

const CategoryPieChart = ({ data }) => {
    // Dummy category data
    const chartData = data || [
        { name: 'Entertainment', value: 45, color: '#6366f1' }, // Indigo
        { name: 'Productivity', value: 30, color: '#ec4899' },  // Pink
        { name: 'Infrastructure', value: 15, color: '#3b82f6' }, // Blue
        { name: 'Other', value: 10, color: '#10b981' },         // Emerald
    ];

    const totalCost = useMemo(() => {
        return chartData.reduce((acc, curr) => acc + (curr.value || 0), 0);
    }, [chartData]);

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
            className="rounded-[24px] p-6 flex flex-col h-[350px] relative overflow-hidden"
        >
            <h3 className="text-xl font-bold text-white mb-4">Cost by Category</h3>

            <div className="w-full h-64">
                {mounted && (
                    <ResponsiveContainer width="100%" height="100%" debounce={50} minHeight={0} minWidth={0}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value) => `$${value.toFixed(2)}`}
                            />
                            <Legend
                                verticalAlign="bottom"
                                align="center"
                                iconType="circle"
                                wrapperStyle={{ paddingTop: '20px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Central Text for Donut */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <span className="text-xs text-text-secondary uppercase tracking-wider block">Total</span>
                <div className="text-2xl font-bold text-white">{formattedTotal}</div>
            </div>
        </GlassCard>
    );
};

export default CategoryPieChart;
