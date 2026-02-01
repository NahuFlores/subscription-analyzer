import DashboardLayout from './layouts/DashboardLayout';
import StatCard from './components/dashboard/StatCard';
import AddSubscriptionModal from './components/dashboard/AddSubscriptionModal';
import SubscriptionList from './components/dashboard/SubscriptionList';
import AIInsights from './components/dashboard/AIInsights';
import ExpenseChart from './components/dashboard/ExpenseChart';
import CategoryPieChart from './components/dashboard/CategoryPieChart';
import ReportsSection from './components/dashboard/ReportsSection';

import { useDashboardData } from './hooks/useDashboardData';
import RadialMenu from './components/ui/RadialMenu';
import { DollarSign, CreditCard, TrendingDown, Calendar, LayoutDashboard, FileBarChart } from 'lucide-react';
import { useState } from 'react';

import DashboardSkeleton from './components/dashboard/DashboardSkeleton';

function App() {
  const { data, loading, refetch } = useDashboardData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                  ${activeTab === tab.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
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
            </div>

            <AddSubscriptionModal
              isOpen={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              onSuccess={refetch}
            />

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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left Column: Subscriptions */}
              <div className="lg:col-span-2">
                <SubscriptionList subscriptions={data?.subscriptions} onUpdate={refetch} />
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
        <RadialMenu onAddSubscription={() => setIsAddModalOpen(true)} />
      )}
    </DashboardLayout>
  )
}

export default App
