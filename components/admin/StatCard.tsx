import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  subtitle?: string | ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradientFrom?: string;
  gradientTo?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-emerald-500',
  subtitle,
  trend,
  gradientFrom = 'from-zinc-800',
  gradientTo = 'to-zinc-800',
}: StatCardProps) {
  return (
    <div className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-lg p-6 border border-zinc-700 hover:border-zinc-600 transition-all duration-200 hover:shadow-lg`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-zinc-400 text-sm font-medium">{title}</h3>
        <div className={`${iconColor} bg-zinc-900/50 p-2 rounded-lg`}>
          <Icon size={20} />
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-white mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-zinc-500">{subtitle}</p>
          )}
        </div>

        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
