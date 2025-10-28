import { BoardAnalytics, BoardHealth } from '@/types';
import { Folder, TrendingUp, AlertTriangle, PauseCircle } from 'lucide-react';

interface BoardAnalyticsProps {
  boardStats: BoardAnalytics[];
  healthDistribution: {
    healthy: number;
    atRisk: number;
    stalled: number;
  };
}

const healthConfig: Record<BoardHealth, { label: string; color: string; bgColor: string; icon: typeof TrendingUp }> = {
  healthy: { label: 'Healthy', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', icon: TrendingUp },
  at_risk: { label: 'At Risk', color: 'text-amber-500', bgColor: 'bg-amber-500/10', icon: AlertTriangle },
  stalled: { label: 'Stalled', color: 'text-red-500', bgColor: 'bg-red-500/10', icon: PauseCircle },
};

export function BoardAnalyticsSection({ boardStats, healthDistribution }: BoardAnalyticsProps) {
  const topBoards = [...boardStats].sort((a, b) => b.taskCount - a.taskCount).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Health Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-900/20 to-zinc-800 rounded-lg p-6 border border-emerald-700/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-emerald-400 text-sm font-medium">Healthy Boards</h3>
            <TrendingUp className="text-emerald-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">{healthDistribution.healthy}</p>
          <p className="text-xs text-zinc-500 mt-1">&gt;50% tasks completed</p>
        </div>

        <div className="bg-gradient-to-br from-amber-900/20 to-zinc-800 rounded-lg p-6 border border-amber-700/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-amber-400 text-sm font-medium">At Risk</h3>
            <AlertTriangle className="text-amber-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">{healthDistribution.atRisk}</p>
          <p className="text-xs text-zinc-500 mt-1">Needs attention</p>
        </div>

        <div className="bg-gradient-to-br from-red-900/20 to-zinc-800 rounded-lg p-6 border border-red-700/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-red-400 text-sm font-medium">Stalled</h3>
            <PauseCircle className="text-red-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">{healthDistribution.stalled}</p>
          <p className="text-xs text-zinc-500 mt-1">&gt;50% not started</p>
        </div>
      </div>

      {/* Top Boards */}
      <div className="bg-zinc-800 rounded-lg border border-zinc-700">
        <div className="p-4 border-b border-zinc-700">
          <h3 className="text-lg font-semibold text-white">Most Active Boards</h3>
        </div>
        <div className="divide-y divide-zinc-700">
          {topBoards.map((board) => {
            const healthInfo = healthConfig[board.health];
            const Icon = healthInfo.icon;

            return (
              <div key={board.id} className="p-4 hover:bg-zinc-900/50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Folder className="text-white" size={20} />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{board.title}</h4>
                      <p className="text-sm text-zinc-500">{board.taskCount} tasks</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${healthInfo.bgColor}`}>
                    <Icon size={16} className={healthInfo.color} />
                    <span className={`text-sm font-medium ${healthInfo.color}`}>
                      {healthInfo.label}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Completion: {board.completionRate}%</span>
                    <span>
                      {board.done}/{board.taskCount} done
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full flex">
                      {/* Done */}
                      <div
                        className="bg-emerald-500"
                        style={{ width: `${(board.done / board.taskCount) * 100}%` }}
                      />
                      {/* In Progress */}
                      <div
                        className="bg-blue-500"
                        style={{ width: `${(board.inProgress / board.taskCount) * 100}%` }}
                      />
                      {/* Not Started */}
                      <div
                        className="bg-zinc-700"
                        style={{ width: `${(board.notStarted / board.taskCount) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      <span className="text-zinc-400">{board.done} done</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-zinc-400">{board.inProgress} in progress</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-zinc-700 rounded-full" />
                      <span className="text-zinc-400">{board.notStarted} not started</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {topBoards.length === 0 && (
            <div className="p-8 text-center text-zinc-500">
              No boards available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
