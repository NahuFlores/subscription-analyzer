import { useState, useEffect, useRef } from 'react';
import { Download, BarChart3, PieChart, TrendingUp, Grid3x3 } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import anime from 'animejs';
import { API_BASE_URL as API_BASE, USER_ID } from '../../config/api';

const ReportsSection = () => {
    const [reports, setReports] = useState({});
    const [loading, setLoading] = useState(false);
    const [activeReport, setActiveReport] = useState('all');
    const [hasLoaded, setHasLoaded] = useState(false);
    const sectionRef = useRef(null);

    const reportTypes = [
        { id: 'all', label: 'All Reports', icon: Grid3x3 },
        { id: 'category', label: 'Category Distribution', icon: BarChart3 },
        { id: 'cost', label: 'Cost Analysis', icon: TrendingUp },
        { id: 'stats', label: 'Statistical Summary', icon: PieChart },
    ];

    // Auto-load reports on mount
    useEffect(() => {
        if (!hasLoaded) {
            generateReports('all');
            setHasLoaded(true);
        }
    }, [hasLoaded]);

    // Entrance animation
    useEffect(() => {
        if (sectionRef.current) {
            anime({
                targets: sectionRef.current.querySelectorAll('.animate-in'),
                opacity: [0, 1],
                translateY: [20, 0],
                delay: anime.stagger(100),
                duration: 600,
                easing: 'easeOutCubic'
            });
        }
    }, []);

    const generateReports = async (type = 'all') => {
        setLoading(true);
        setActiveReport(type);

        try {
            const response = await fetch(`${API_BASE}/analytics/report?user_id=${USER_ID}&type=${type}`);
            const data = await response.json();

            if (data.success) {
                // Filter out empty reports (failed generations)
                const validReports = Object.fromEntries(
                    Object.entries(data.plots).filter(([_, value]) => value && value.length > 0)
                );
                setReports(validReports);

                // Animate report cards when they appear
                setTimeout(() => {
                    const reportCards = document.querySelectorAll('.report-card');
                    anime({
                        targets: reportCards,
                        opacity: [0, 1],
                        scale: [0.95, 1],
                        delay: anime.stagger(150),
                        duration: 500,
                        easing: 'easeOutCubic'
                    });
                }, 100);
            }
        } catch (error) {
            console.error('Error generating reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadImage = (base64Data, filename) => {
        const link = document.createElement('a');
        link.href = base64Data;
        link.download = filename;
        link.click();
    };

    return (
        <div ref={sectionRef} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between animate-in">
                <div>
                    <h2 className="text-3xl font-bold text-white">Analytics Reports</h2>
                    <p className="text-text-secondary mt-1">
                        Statistical visualizations powered by Matplotlib & Seaborn
                    </p>
                </div>
            </div>

            {/* Report Type Selector */}
            <GlassCard className="p-6 animate-in">
                <h3 className="text-lg font-semibold text-white mb-4">Generate Report</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {reportTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                            <button
                                key={type.id}
                                onClick={() => generateReports(type.id)}
                                disabled={loading}
                                className={`
                                    p-4 rounded-xl border transition-all duration-200
                                    ${activeReport === type.id
                                        ? 'bg-primary/20 border-primary text-primary'
                                        : 'bg-surface/30 border-white/10 text-white hover:bg-surface/50'
                                    }
                                    ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                                `}
                            >
                                <Icon className="w-6 h-6 mx-auto mb-2" />
                                <span className="text-sm font-medium block">{type.label}</span>
                            </button>
                        );
                    })}
                </div>
            </GlassCard>

            {/* Loading State with Skeleton */}
            {loading && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <GlassCard key={i} className="p-6 animate-in">
                            <div className="animate-pulse">
                                {/* Header Skeleton */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-6 bg-white/10 rounded w-1/3"></div>
                                    <div className="h-8 bg-white/10 rounded w-24"></div>
                                </div>

                                {/* Image Skeleton */}
                                <div className="bg-white/5 rounded-lg p-4">
                                    <div className="w-full h-64 bg-white/10 rounded flex items-center justify-center">
                                        <BarChart3 className="w-16 h-16 text-white/20 animate-pulse" />
                                    </div>
                                </div>

                                {/* Footer Skeleton */}
                                <div className="mt-3 h-4 bg-white/10 rounded w-2/3"></div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}

            {/* Reports Display */}
            {!loading && Object.keys(reports).length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {Object.entries(reports).map(([name, base64Image], index) => (
                        <GlassCard
                            key={name}
                            className="p-6 report-card"
                            style={{ opacity: 0 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white capitalize">
                                    {name.replace(/_/g, ' ')}
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => downloadImage(base64Image, `${name}.png`)}
                                    className="flex items-center gap-2 hover:scale-105 transition-transform"
                                >
                                    <Download className="w-4 h-4" />
                                    Download
                                </Button>
                            </div>

                            <div className="bg-white/5 rounded-lg p-4 overflow-hidden hover:bg-white/10 transition-colors">
                                <img
                                    src={base64Image}
                                    alt={name}
                                    className="w-full h-auto rounded"
                                />
                            </div>

                            <div className="mt-3 text-xs text-text-secondary flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                Generated with Matplotlib & Seaborn
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && Object.keys(reports).length === 0 && (
                <GlassCard className="p-12 animate-in">
                    <div className="text-center">
                        <BarChart3 className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Reports Generated</h3>
                        <p className="text-text-secondary mb-6">
                            Select a report type above to generate statistical visualizations
                        </p>
                    </div>
                </GlassCard>
            )}

            {/* Info Card */}
            <GlassCard className="p-6 bg-primary/5 border-primary/20 animate-in">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                        <BarChart3 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-1">Professional Analytics Reports</h4>
                        <p className="text-text-secondary text-sm">
                            High-quality statistical visualizations generated with industry-standard tools.
                            Download reports for presentations, financial reviews, or share with your team.
                            All charts are optimized for printing and professional documentation.
                        </p>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default ReportsSection;
