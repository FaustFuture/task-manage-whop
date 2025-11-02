'use client';

import { useEffect, useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { OverviewMetrics } from './admin/OverviewMetrics';
import { UserMetricsTable } from './admin/UserMetricsTable';
import { BoardAnalyticsSection } from './admin/BoardAnalytics';
import { ActivityFeed } from './admin/ActivityFeed';
import { TrendChart } from './admin/TrendChart';
import { UserDetailModal } from './admin/UserDetailModal';
import {
  generateExtendedUserData,
  generateActivityFeed,
  generateDailyTrend,
  generateCompletionTrend,
} from '@/lib/mockData';
import { RefreshCw, Download, Calendar, TrendingUp, Activity as ActivityIcon } from 'lucide-react';

export function AdminDashboard() {
  const {
    analytics,
    isLoadingAnalytics,
    loadAnalytics,
    refreshAnalytics,
    boards,
    cards,
    lists,
  } = useStore();

  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Load analytics on mount
  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Get users from analytics (which are derived from Whop user IDs in card assignments)
  const users = useMemo(() => {
    if (!analytics) return [];
    return analytics.userMetrics.all.map(metric => ({
      id: metric.userId,
      name: metric.name,
      username: metric.username,
      role: metric.role,
    }));
  }, [analytics]);

  // Generate mock data based on real data
  const extendedUserData = useMemo(() => generateExtendedUserData(users), [users]);
  const activityFeed = useMemo(
    () => generateActivityFeed(users, cards, boards, 50),
    [users, cards, boards]
  );

  const taskCreationTrend = useMemo(
    () => generateDailyTrend(dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90),
    [dateRange]
  );

  const completionTrend = useMemo(
    () => generateCompletionTrend(dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90),
    [dateRange]
  );

  // Get selected user from analytics
  const selectedUser = useMemo(
    () => users.find(u => u.id === selectedUserId),
    [users, selectedUserId]
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAnalytics();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleExport = () => {
    if (!analytics) return;

    const csvContent = [
      ['Metric', 'Value'],
      ['Total Users', analytics.overview.totalUsers],
      ['Active Users', analytics.overview.activeUsers],
      ['Total Boards', analytics.overview.totalBoards],
      ['Total Tasks', analytics.overview.totalTasks],
      ['Completion Rate', `${analytics.overview.completionRate}%`],
      ['Tasks Not Started', analytics.overview.notStarted],
      ['Tasks In Progress', analytics.overview.inProgress],
      ['Tasks Done', analytics.overview.done],
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-dashboard-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (isLoadingAnalytics || !analytics) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-4" />
              <p className="text-zinc-400">Loading analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h2>
            <p className="text-zinc-400">
              Comprehensive analytics and team monitoring
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Date Range Selector */}
            <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg p-1">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    dateRange === range
                      ? 'bg-emerald-500 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white hover:bg-zinc-700 transition-colors"
            >
              <Download size={18} />
              <span className="text-sm font-medium">Export</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>
        </div>

        {/* Overview Metrics */}
        <OverviewMetrics overview={analytics.overview} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Creation Trend */}
          <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-emerald-500" size={20} />
              <h3 className="text-lg font-semibold text-white">Task Creation Trend</h3>
            </div>
            <TrendChart
              data={taskCreationTrend}
              height={250}
              color="#10b981"
              showDots={true}
              showGrid={true}
            />
            <p className="text-xs text-zinc-500 mt-4">
              Mock data showing task creation pattern over time
            </p>
          </div>

          {/* Completion Rate Trend */}
          <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-cyan-500" size={20} />
              <h3 className="text-lg font-semibold text-white">Completion Rate Trend</h3>
            </div>
            <TrendChart
              data={completionTrend}
              height={250}
              color="#06b6d4"
              showDots={true}
              showGrid={true}
            />
            <p className="text-xs text-zinc-500 mt-4">
              Mock data showing completion rate changes over time
            </p>
          </div>
        </div>

        {/* Board Analytics */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-indigo-500" size={20} />
            <h3 className="text-xl font-semibold text-white">Board Analytics</h3>
          </div>
          <BoardAnalyticsSection
            boardStats={analytics.boardStats.mostActive}
            healthDistribution={analytics.boardStats.healthDistribution}
          />
        </div>

        {/* Team Performance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Performers */}
          <div className="bg-gradient-to-br from-emerald-900/20 to-zinc-800 rounded-lg border border-emerald-700/30 p-6">
            <h3 className="text-lg font-semibold text-emerald-400 mb-4">Top Performers</h3>
            {analytics.userMetrics.topPerformers.length > 0 ? (
              <div className="space-y-3">
                {analytics.userMetrics.topPerformers.map((user, index) => (
                  <div key={user.userId} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{user.name}</p>
                      <p className="text-xs text-zinc-500">
                        {user.totalTasks} tasks • {user.completionRate}% complete
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">Not enough data yet</p>
            )}
          </div>

          {/* Users Needing Support */}
          <div className="bg-gradient-to-br from-amber-900/20 to-zinc-800 rounded-lg border border-amber-700/30 p-6">
            <h3 className="text-lg font-semibold text-amber-400 mb-4">Needs Support</h3>
            {analytics.userMetrics.needingSupport.length > 0 ? (
              <div className="space-y-3">
                {analytics.userMetrics.needingSupport.map((user, index) => (
                  <div key={user.userId} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{user.name}</p>
                      <p className="text-xs text-zinc-500">
                        {user.totalTasks} tasks • {user.completionRate}% complete
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">All users performing well</p>
            )}
          </div>

          {/* Collaboration Index */}
          <div className="bg-gradient-to-br from-indigo-900/20 to-zinc-800 rounded-lg border border-indigo-700/30 p-6">
            <h3 className="text-lg font-semibold text-indigo-400 mb-4">Most Collaborative</h3>
            {analytics.userMetrics.all.length > 0 ? (
              <div className="space-y-3">
                {[...analytics.userMetrics.all]
                  .sort((a, b) => b.boardsCount - a.boardsCount)
                  .slice(0, 5)
                  .map((user, index) => (
                    <div key={user.userId} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{user.name}</p>
                        <p className="text-xs text-zinc-500">
                          Active on {user.boardsCount} board{user.boardsCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">No collaboration data yet</p>
            )}
          </div>
        </div>

        {/* User Performance Table and Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Performance Table - Takes 2 columns */}
          <div className="lg:col-span-2">
            <UserMetricsTable
              userMetrics={analytics.userMetrics.all}
              extendedData={extendedUserData}
              onUserClick={(userId) => setSelectedUserId(userId)}
            />
          </div>

          {/* Activity Feed - Takes 1 column */}
          <div>
            <ActivityFeed activities={activityFeed} maxItems={15} />
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 text-center">
          <p className="text-sm text-zinc-500">
            <span className="text-zinc-400 font-medium">Note:</span> Activity feed, trends, and extended user data (department, location, join dates) are mock data for demonstration purposes.
          </p>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          extendedData={extendedUserData.get(selectedUser.id)}
          boards={boards}
          cards={cards}
          lists={lists}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
}
