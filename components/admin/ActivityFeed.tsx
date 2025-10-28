import { Activity, ActivityType, formatRelativeTime } from '@/lib/mockData';
import { CheckCircle2, Plus, RefreshCw, UserPlus, Folder, UserCheck } from 'lucide-react';

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
}

const activityIcons: Record<ActivityType, { icon: typeof CheckCircle2; color: string }> = {
  task_completed: { icon: CheckCircle2, color: 'text-emerald-500' },
  task_created: { icon: Plus, color: 'text-blue-500' },
  status_changed: { icon: RefreshCw, color: 'text-cyan-500' },
  user_joined: { icon: UserPlus, color: 'text-indigo-500' },
  board_created: { icon: Folder, color: 'text-amber-500' },
  card_assigned: { icon: UserCheck, color: 'text-violet-500' },
};

const activityVerbs: Record<ActivityType, string> = {
  task_completed: 'completed',
  task_created: 'created',
  status_changed: 'changed',
  user_joined: 'joined',
  board_created: 'created',
  card_assigned: 'assigned',
};

export function ActivityFeed({ activities, maxItems = 10 }: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems);

  if (displayedActivities.length === 0) {
    return (
      <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-8 text-center">
        <p className="text-zinc-500">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden">
      <div className="p-4 border-b border-zinc-700">
        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
      </div>
      <div className="divide-y divide-zinc-700 max-h-[600px] overflow-y-auto overflow-x-hidden scrollbar-emerald">
        {displayedActivities.map((activity) => {
          const { icon: Icon, color } = activityIcons[activity.type];
          const verb = activityVerbs[activity.type];

          return (
            <div
              key={activity.id}
              className="p-4 hover:bg-zinc-900/50 transition-colors duration-150"
            >
              <div className="flex items-start gap-3">
                {/* User Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {activity.userInitial}
                </div>

                {/* Activity Content */}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-sm text-zinc-300 truncate">
                    <span className="font-medium text-white">{activity.userName}</span>
                    {' '}
                    <span className="text-zinc-400">{verb}</span>
                    {' '}
                    <span className="font-medium text-white">{activity.targetName}</span>
                    {activity.details && (
                      <>
                        {' '}
                        <span className="text-zinc-400">{activity.details}</span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {formatRelativeTime(activity.timestamp)}
                  </p>
                </div>

                {/* Activity Icon */}
                <div className={`${color} bg-zinc-900 p-2 rounded-lg flex-shrink-0`}>
                  <Icon size={16} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
