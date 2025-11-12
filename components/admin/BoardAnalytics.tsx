import { BoardAnalytics, BoardHealth } from '@/types';
import { Folder, TrendingUp, AlertTriangle, PauseCircle, PlayCircle } from 'lucide-react';

interface BoardAnalyticsProps {
  boardStats: BoardAnalytics[];
  healthDistribution: {
    onTrack: number;
    active: number;
    needsAttention: number;
    notStarted: number;
  };
}

const healthConfig: Record<BoardHealth, { label: string; color: string; bgColor: string; icon: typeof TrendingUp }> = {
  on_track: { label: 'On Track', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', icon: TrendingUp },
  active: { label: 'Active', color: 'text-blue-500', bgColor: 'bg-blue-500/10', icon: PlayCircle },
  needs_attention: { label: 'Needs Attention', color: 'text-amber-500', bgColor: 'bg-amber-500/10', icon: AlertTriangle },
  not_started: { label: 'Not Started', color: 'text-red-500', bgColor: 'bg-red-500/10', icon: PauseCircle },
};

export function BoardAnalyticsSection({ boardStats, healthDistribution }: BoardAnalyticsProps) {
  const topBoards = [...boardStats].sort((a, b) => b.taskCount - a.taskCount).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Health Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-900/20 to-zinc-800 rounded-lg p-6 border border-emerald-700/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-emerald-400 text-sm font-medium">On Track</h3>
            <TrendingUp className="text-emerald-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">{healthDistribution.onTrack}</p>
          <p className="text-xs text-zinc-500 mt-1">≥70% tasks completed</p>
        </div>

        <div className="bg-gradient-to-br from-blue-900/20 to-zinc-800 rounded-lg p-6 border border-blue-700/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-blue-400 text-sm font-medium">Active</h3>
            <PlayCircle className="text-blue-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">{healthDistribution.active}</p>
          <p className="text-xs text-zinc-500 mt-1">40-69% done, work in progress</p>
        </div>

        <div className="bg-gradient-to-br from-amber-900/20 to-zinc-800 rounded-lg p-6 border border-amber-700/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-amber-400 text-sm font-medium">Needs Attention</h3>
            <AlertTriangle className="text-amber-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">{healthDistribution.needsAttention}</p>
          <p className="text-xs text-zinc-500 mt-1">May need review</p>
        </div>

        <div className="bg-gradient-to-br from-red-900/20 to-zinc-800 rounded-lg p-6 border border-red-700/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-red-400 text-sm font-medium">Not Started</h3>
            <PauseCircle className="text-red-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">{healthDistribution.notStarted}</p>
          <p className="text-xs text-zinc-500 mt-1">≥60% not started</p>
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Folder className="text-white" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{board.title}</h4>
                      <p className="text-xs text-zinc-500">{board.taskCount} tasks • {board.completionRate}% complete</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${healthInfo.bgColor} flex-shrink-0 ml-3`}>
                    <Icon size={14} className={healthInfo.color} />
                    <span className={`text-xs font-medium ${healthInfo.color}`}>
                      {healthInfo.label}
                    </span>
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
