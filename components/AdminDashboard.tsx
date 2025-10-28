'use client';

import { useStore } from '@/store/useStore';
import { TaskStatus } from '@/types';
import { Users, CheckSquare, Clock, PlayCircle, CheckCircle2 } from 'lucide-react';

const statusConfig: Record<TaskStatus, { label: string; bgColor: string; textColor: string }> = {
  not_started: { label: 'Not Started', bgColor: 'bg-zinc-700', textColor: 'text-zinc-400' },
  in_progress: { label: 'In Progress', bgColor: 'bg-blue-500/20', textColor: 'text-blue-400' },
  done: { label: 'Done', bgColor: 'bg-emerald-500/20', textColor: 'text-emerald-400' },
};

export function AdminDashboard() {
  const { users, cards, subtasks } = useStore();

  const members = users.filter((u) => u.role === 'member');

  // Calculate overall status counts
  const notStartedCount = cards.filter((c) => c.status === 'not_started').length;
  const inProgressCount = cards.filter((c) => c.status === 'in_progress').length;
  const doneCount = cards.filter((c) => c.status === 'done').length;

  const getMemberStats = (userId: string) => {
    const memberCards = cards.filter((c) => c.assignedTo.includes(userId));
    const memberSubtasks = subtasks.filter((s) =>
      memberCards.some((c) => c.id === s.cardId)
    );
    const completedSubtasks = memberSubtasks.filter((s) => s.isCompleted).length;

    return {
      totalCards: memberCards.length,
      notStarted: memberCards.filter((c) => c.status === 'not_started').length,
      inProgress: memberCards.filter((c) => c.status === 'in_progress').length,
      done: memberCards.filter((c) => c.status === 'done').length,
      totalSubtasks: memberSubtasks.length,
      completedSubtasks,
    };
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h2>
          <p className="text-zinc-400">Manage team members and monitor their tasks</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-zinc-400 text-sm font-medium">Total Members</h3>
              <Users className="text-emerald-500" size={20} />
            </div>
            <p className="text-3xl font-bold text-white">{members.length}</p>
          </div>

          <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-zinc-400 text-sm font-medium">Not Started</h3>
              <Clock className="text-zinc-500" size={20} />
            </div>
            <p className="text-3xl font-bold text-white">{notStartedCount}</p>
            <p className="text-xs text-zinc-500 mt-1">
              {cards.length > 0 ? Math.round((notStartedCount / cards.length) * 100) : 0}% of total
            </p>
          </div>

          <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-blue-400 text-sm font-medium">In Progress</h3>
              <PlayCircle className="text-blue-500" size={20} />
            </div>
            <p className="text-3xl font-bold text-white">{inProgressCount}</p>
            <p className="text-xs text-zinc-500 mt-1">
              {cards.length > 0 ? Math.round((inProgressCount / cards.length) * 100) : 0}% of total
            </p>
          </div>

          <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-emerald-400 text-sm font-medium">Completed</h3>
              <CheckCircle2 className="text-emerald-500" size={20} />
            </div>
            <p className="text-3xl font-bold text-white">{doneCount}</p>
            <p className="text-xs text-zinc-500 mt-1">
              {cards.length > 0 ? Math.round((doneCount / cards.length) * 100) : 0}% of total
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-white mb-4">Team Members</h3>
          <div className="space-y-4">
            {members.map((member) => {
              const stats = getMemberStats(member.id);
              const memberCards = cards.filter((c) => c.assignedTo.includes(member.id));

              return (
                <div
                  key={member.id}
                  className="bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white text-lg font-bold">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">{member.name}</h4>
                          <p className="text-zinc-400 text-sm">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="text-center px-3 py-1.5 bg-zinc-900 rounded-lg">
                          <p className="text-lg font-bold text-zinc-400">{stats.notStarted}</p>
                          <p className="text-xs text-zinc-500">Not Started</p>
                        </div>
                        <div className="text-center px-3 py-1.5 bg-blue-500/10 rounded-lg">
                          <p className="text-lg font-bold text-blue-400">{stats.inProgress}</p>
                          <p className="text-xs text-blue-500">In Progress</p>
                        </div>
                        <div className="text-center px-3 py-1.5 bg-emerald-500/10 rounded-lg">
                          <p className="text-lg font-bold text-emerald-400">{stats.done}</p>
                          <p className="text-xs text-emerald-500">Done</p>
                        </div>
                      </div>
                    </div>

                    {memberCards.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-zinc-400 mb-2">
                          Assigned Tasks
                        </h5>
                        {memberCards.map((card) => {
                          const cardSubtasks = subtasks.filter((s) => s.cardId === card.id);
                          const completed = cardSubtasks.filter((s) => s.isCompleted).length;
                          const total = cardSubtasks.length;

                          return (
                            <div
                              key={card.id}
                              className="bg-zinc-900 p-3 rounded-lg border border-zinc-700"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h6 className="text-white font-medium flex-1">{card.title}</h6>
                                <span
                                  className={`text-xs px-2 py-1 rounded ${statusConfig[card.status].bgColor} ${statusConfig[card.status].textColor} font-medium ml-2 whitespace-nowrap`}
                                >
                                  {statusConfig[card.status].label}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                {card.description && (
                                  <p className="text-sm text-zinc-500 line-clamp-1 flex-1">
                                    {card.description}
                                  </p>
                                )}
                                {total > 0 && (
                                  <span className="text-xs text-zinc-400 ml-2">
                                    {completed}/{total} subtasks
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
