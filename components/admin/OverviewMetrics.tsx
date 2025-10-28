import { AnalyticsOverview } from '@/types';
import { StatCard } from './StatCard';
import { Users, UserCheck, CheckSquare, TrendingUp, BarChart3, Target } from 'lucide-react';

interface OverviewMetricsProps {
  overview: AnalyticsOverview;
}

export function OverviewMetrics({ overview }: OverviewMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard
        title="Total Users"
        value={overview.totalUsers}
        icon={Users}
        iconColor="text-indigo-500"
        subtitle={`${overview.activeUsers} active`}
        gradientFrom="from-indigo-900/20"
        gradientTo="to-zinc-800"
      />

      <StatCard
        title="Active Users"
        value={overview.activeUsers}
        icon={UserCheck}
        iconColor="text-emerald-500"
        subtitle={`${Math.round((overview.activeUsers / overview.totalUsers) * 100)}% of total`}
        gradientFrom="from-emerald-900/20"
        gradientTo="to-zinc-800"
      />

      <StatCard
        title="Total Tasks"
        value={overview.totalTasks}
        icon={CheckSquare}
        iconColor="text-cyan-500"
        subtitle={`${overview.avgTasksPerUser} per user`}
        gradientFrom="from-cyan-900/20"
        gradientTo="to-zinc-800"
      />

      <StatCard
        title="Completion Rate"
        value={`${overview.completionRate}%`}
        icon={TrendingUp}
        iconColor="text-emerald-500"
        subtitle={`${overview.done} of ${overview.totalTasks} done`}
        gradientFrom="from-emerald-900/20"
        gradientTo="to-zinc-800"
      />

      <StatCard
        title="In Progress"
        value={overview.inProgress}
        icon={BarChart3}
        iconColor="text-blue-500"
        subtitle={`${Math.round((overview.inProgress / overview.totalTasks) * 100)}% of total`}
        gradientFrom="from-blue-900/20"
        gradientTo="to-zinc-800"
      />

      <StatCard
        title="Not Started"
        value={overview.notStarted}
        icon={Target}
        iconColor="text-zinc-500"
        subtitle={`${Math.round((overview.notStarted / overview.totalTasks) * 100)}% of total`}
        gradientFrom="from-zinc-800"
        gradientTo="to-zinc-800"
      />
    </div>
  );
}
