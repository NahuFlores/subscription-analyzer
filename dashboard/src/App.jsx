import DashboardLayout from './layouts/DashboardLayout';
import StatCard from './components/dashboard/StatCard';
import WaveBackground from './components/ui/WaveBackground';
import SubscriptionModal from './components/dashboard/SubscriptionModal';
import SubscriptionList from './components/dashboard/SubscriptionList';
import AIInsights from './components/dashboard/AIInsights';
import ExpenseChart from './components/dashboard/ExpenseChart';
import CategoryPieChart from './components/dashboard/CategoryPieChart';
import ReportsSection from './components/dashboard/ReportsSection';

import { useDashboardData } from './hooks/useDashboardData';
import RadialMenu from './components/ui/RadialMenu';
import { DollarSign, CreditCard, TrendingDown, Calendar, LayoutDashboard, FileBarChart, Plus } from 'lucide-react';
import { useState } from 'react';

import DashboardSkeleton from './components/dashboard/DashboardSkeleton';

function App() {
  const { data, loading, refetch } = useDashboardData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'reports'

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const statConfig = [
    {
      label: 'Total Monthly Cost',
      value: formatCurrency(data?.stats?.total_cost || 0),
      subtext: 'Based on active subscriptions',
      icon: DollarSign,
      color: '#6366f1' // Indigo
    },
    {
      label: 'Active Subscriptions',
      value: data?.stats?.active_subs || 0,
      subtext: 'Services currently active',
      icon: CreditCard,
      color: '#22d3ee' // Cyan
    },
    {
      label: 'Potential Savings',
      value: formatCurrency(data?.stats?.potential_savings || 0),
      subtext: 'Identify unused services',
      icon: TrendingDown,
      color: '#10b981' // Emerald
    },
    {
      label: 'Upcoming Payments',
      value: data?.upcoming_payments?.length || 0,
      subtext: 'Next 7 days',
      icon: Calendar,
      color: '#ec4899' // Pink
    }
  ];

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reports', label: 'Data Science Reports', icon: FileBarChart }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer select-none
                  ${activeTab === tab.id
                    ? 'bg-linear-to-t from-primary/20 to-transparent text-white border-b border-primary/50 shadow-[0_4px_12px_-2px_rgba(99,102,241,0.1)]'
                    : 'text-text-secondary hover:text-white hover:bg-white/5 border-b border-transparent'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dashboard Tab Content */}
        {activeTab === 'dashboard' && (
          <>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-white/60 tracking-tight">
                  Dashboard
                </h1>
                <p className="text-text-secondary mt-1">Welcome back, here's what's happening</p>
              </div>

              {/* Header Actions (Desktop) */}
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={() => {
                    setEditingSubscription(null);
                    setIsAddModalOpen(true);
                  }}
                  className="btn-3d group relative flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-medium overflow-hidden"
                >
                  <WaveBackground />
                  <div className="relative z-10 flex items-center gap-2">
                    <Plus size={20} strokeWidth={2.5} />
                    <span>Add Subscription</span>
                  </div>
                </button>
              </div>
            </div>



            {/* Stats Grid */}
            <section aria-labelledby="stats-heading">
              <h2 id="stats-heading" className="sr-only">Key Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statConfig.map((stat, index) => (
                  <StatCard
                    key={stat.label}
                    {...stat}
                    delay={index * 0.1}
                  />
                ))}
              </div>
            </section>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ExpenseChart data={data?.charts?.expenseTrend} />
              </div>
              <div>
                <CategoryPieChart data={data?.charts?.categoryPie} />
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Subscriptions */}
              <div className="lg:col-span-2">
                <SubscriptionList
                  subscriptions={data?.subscriptions}
                  onUpdate={refetch}
                  onEdit={(sub) => {
                    setEditingSubscription(sub);
                    setIsAddModalOpen(true);
                  }}
                />
              </div>

              {/* Right Column: Insights */}
              <div>
                <AIInsights insights={data?.insights} />
              </div>
            </div>
          </>
        )}

        {/* Reports Tab Content */}
        {activeTab === 'reports' && (
          <ReportsSection />
        )}
      </div>

      {!isAddModalOpen && activeTab === 'dashboard' && (
        <div className="md:hidden">
          <RadialMenu onAddSubscription={() => {
            setEditingSubscription(null);
            setIsAddModalOpen(true);
          }} />
        </div>
      )}

      <SubscriptionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingSubscription(null);
        }}
        onSuccess={refetch}
        subscription={editingSubscription}
      />
    </DashboardLayout>
  )
}

export default App
